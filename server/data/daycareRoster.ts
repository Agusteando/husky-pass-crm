import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import type { FamilyAccount, Sala, DaycareRosterDiagnostics, DaycareRosterEntry, DaycareRosterOverlay, DaycareRosterSuggestion } from '~/types/daycare'
import { assertUnidadAccess } from '~/server/utils/authz'
import { publicError } from '~/server/utils/httpError'
import { legacyOne, legacyQuery, legacyWrite } from '~/server/utils/mysql'
import { logPersonasDebug, logPersonasWarning } from '~/server/utils/personasDiagnostics'
import {
  DAYCARE_ROSTER_SOURCE_URL,
  compareRosterSalaProgression,
  compactRosterName,
  normalizeRosterEmail,
  normalizeRosterName,
  normalizeRosterSala,
  rosterSheetMatchesUnidad,
  unitRosterKey
} from '~/utils/daycareRoster'

type RawRosterRow = Record<string, unknown>
type RawRosterPayload = Record<string, RawRosterRow[]>
type SalaRow = RowDataPacket & { id: number | string; sala: string | null; unidad: string | null }

type CachedRoster = {
  expiresAt: number
  entries: DaycareRosterEntry[]
  sourceAvailable: boolean
  diagnostics: DaycareRosterDiagnostics
}

const CACHE_TTL_MS = 5 * 60 * 1000
const FETCH_TIMEOUT_MS = Number(process.env.DAYCARE_ROSTER_TIMEOUT_MS || 7000)
let rosterCache: CachedRoster | null = null

const REQUIRED_ROSTER_COLUMNS = [
  'FieldTutorCorreoElectronico',
  'FieldNinoNombre',
  'FieldNinoPrimerApellido',
  'FieldNinoSegundoApellido',
  'ddlSalas'
]

function describeSourceUrl(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return url ? 'url-invalida' : null
  }
}

function baseDiagnostics(url: string, startedAt: number): DaycareRosterDiagnostics {
  return {
    sourceUrl: describeSourceUrl(url),
    configuredByEnv: Boolean(String(process.env.DAYCARE_ROSTER_SOURCE_URL || '').trim()),
    fetchedAt: new Date().toISOString(),
    durationMs: Math.max(0, Date.now() - startedAt),
    requiredColumns: REQUIRED_ROSTER_COLUMNS,
    assumptions: [
      'Se empata unidad por el numero del nombre de hoja contra el numero de la unidad.',
      'Se empata cuenta por correo normalizado del tutor contra email/usuario local.',
      'Se empata sala por nombre normalizado de ddlSalas contra salas de la plataforma.',
      'La lista externa es una capa visual: si falla, MySQL sigue siendo la fuente operativa local.'
    ]
  }
}

function sourceDiagnostics(payload: RawRosterPayload, entries: DaycareRosterEntry[], url: string, startedAt: number): DaycareRosterDiagnostics {
  const sheets = Object.entries(payload || {})
  const missingColumnsBySheet = sheets.map(([sheet, rows]) => {
    const sample = Array.isArray(rows) ? rows.find((row) => row && typeof row === 'object') || {} : {}
    const keys = new Set(Object.keys(sample))
    return { sheet, missing: REQUIRED_ROSTER_COLUMNS.filter((column) => !keys.has(column)) }
  }).filter((item) => item.missing.length)

  return {
    ...baseDiagnostics(url, startedAt),
    sheetCount: sheets.length,
    totalRows: sheets.reduce((sum, [, rows]) => sum + (Array.isArray(rows) ? rows.length : 0), 0),
    mappedEntries: entries.length,
    missingColumnsBySheet
  }
}

function overlayDiagnostics(input: {
  source: CachedRoster
  unidad: string
  currentSala: Sala
  entriesForUnidad: DaycareRosterEntry[]
  salas: SalaRow[]
  accounts: FamilyAccount[]
  linked: number
  moved: number
  sourceOnly: DaycareRosterEntry[]
}) {
  const allSheets = Array.from(new Set(input.source.entries.map((entry) => entry.sourceSheet))).sort()
  const matchedSheets = Array.from(new Set(input.entriesForUnidad.map((entry) => entry.sourceSheet))).sort()
  const matchedSet = new Set(matchedSheets)
  const platformSalas = input.salas.map((sala) => String(sala.sala || '').trim()).filter(Boolean)
  const platformSalaKeys = new Set(platformSalas.map((sala) => normalizeRosterSala(sala)))
  const sourceSalas = Array.from(new Set(input.entriesForUnidad.map((entry) => entry.salaName).filter(Boolean) as string[])).sort()
  const matchedSourceSalas = sourceSalas.filter((sala) => platformSalaKeys.has(normalizeRosterSala(sala)))
  const matchedSourceSet = new Set(matchedSourceSalas.map((sala) => normalizeRosterSala(sala)))

  return {
    ...input.source.diagnostics,
    unidad: {
      value: input.unidad,
      key: unitRosterKey(input.unidad),
      matchedSheets,
      unmatchedSheets: allSheets.filter((sheet) => !matchedSet.has(sheet))
    },
    sala: {
      current: String(input.currentSala.sala || ''),
      platformSalas,
      sourceSalas,
      matchedSourceSalas,
      unmatchedSourceSalas: sourceSalas.filter((sala) => !matchedSourceSet.has(normalizeRosterSala(sala)))
    },
    accounts: {
      localRows: input.accounts.length,
      matchedByEmail: input.linked,
      sourceOnly: input.sourceOnly.length,
      roomChanges: input.moved
    }
  } satisfies DaycareRosterDiagnostics
}

function sourceUrl() {
  const configured = String(process.env.DAYCARE_ROSTER_SOURCE_URL || '').trim()
  return configured || DAYCARE_ROSTER_SOURCE_URL
}

function childNameFromRow(row: RawRosterRow) {
  return compactRosterName(row.FieldNinoNombre, row.FieldNinoPrimerApellido, row.FieldNinoSegundoApellido)
}

function tutorNameFromRow(row: RawRosterRow) {
  return compactRosterName(row.FieldTutorNombre, row.FieldTutorPrimerApellido, row.FieldTutorSegundoApellido)
}

function mapRosterPayload(payload: RawRosterPayload): DaycareRosterEntry[] {
  const entries: DaycareRosterEntry[] = []
  for (const [sheetName, rows] of Object.entries(payload || {})) {
    if (!Array.isArray(rows)) continue
    for (const row of rows) {
      const email = normalizeRosterEmail(row.FieldTutorCorreoElectronico)
      const childName = childNameFromRow(row)
      const salaName = String(row.ddlSalas || '').trim()
      if (!email && !childName && !salaName) continue
      entries.push({
        sourceSheet: String(sheetName),
        tutorBusinessName: String(row.FieldEmpresaTutorRazonSocial || '').trim() || null,
        tutorName: tutorNameFromRow(row) || null,
        tutorEmail: email,
        tutorPhone: String(row.FieldTutorTelefono || '').trim() || null,
        tutorAddress: compactRosterName(row.FieldTutorCalle, row.FieldTutorCP) || null,
        childName: childName || null,
        salaName: salaName || null,
        normalizedEmail: email,
        normalizedChildName: normalizeRosterName(childName),
        normalizedSala: normalizeRosterSala(salaName),
        authorizedPeople: String(row.personasAutorizadas || '').trim() || null,
        lastUpdatedAt: row.lastUpdatedAt ? String(row.lastUpdatedAt) : null
      })
    }
  }
  return entries
}

async function fetchRosterEntries() {
  const now = Date.now()
  if (rosterCache && rosterCache.expiresAt > now) return rosterCache

  const url = sourceUrl()
  const startedAt = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json() as RawRosterPayload
    const entries = mapRosterPayload(payload)
    const diagnostics = sourceDiagnostics(payload, entries, url, startedAt)
    rosterCache = { entries, diagnostics, sourceAvailable: true, expiresAt: now + CACHE_TTL_MS }
    logPersonasDebug('daycare-roster-fetch', diagnostics)
    return rosterCache
  } catch (error) {
    const diagnostics = { ...baseDiagnostics(url, startedAt), lastError: error instanceof Error ? error.message : String(error) }
    logPersonasWarning('daycare-roster-source-unavailable', diagnostics)
    rosterCache = { entries: [], diagnostics, sourceAvailable: false, expiresAt: now + Math.min(CACHE_TTL_MS, 60 * 1000) }
    return rosterCache
  } finally {
    clearTimeout(timeout)
  }
}

async function salasForUnidad(unidad: string) {
  return legacyQuery<SalaRow[]>(
    `SELECT id, sala, unidad FROM salas WHERE unidad = ? ORDER BY id ASC`,
    [unidad]
  )
}

function mapSalas(rows: SalaRow[]) {
  const byName = new Map<string, { id: number; sala: string; unidad: string }>()
  for (const row of rows) {
    const sala = String(row.sala || '').trim()
    const unidad = String(row.unidad || '').trim()
    const normalized = normalizeRosterSala(sala)
    if (!normalized) continue
    byName.set(normalized, { id: Number(row.id), sala, unidad })
  }
  return byName
}

function rowEmail(account: Pick<FamilyAccount, 'email' | 'username'>) {
  return normalizeRosterEmail(account.email || account.username)
}

function suggestionForAccount(account: FamilyAccount, entry: DaycareRosterEntry | undefined, currentSala: Sala, salaMap: Map<string, { id: number; sala: string; unidad: string }>): DaycareRosterSuggestion {
  if (!entry) return { state: 'not-found' }
  const target = entry.normalizedSala ? salaMap.get(entry.normalizedSala) : undefined
  const salaChanged = Boolean(target?.id && String(target.id) !== String(currentSala.id))
  const movement = salaChanged ? compareRosterSalaProgression(currentSala.sala, target?.sala || entry.salaName) : 'same'
  const childDifferent = Boolean(entry.childName && normalizeRosterName(entry.childName) !== normalizeRosterName(account.nombre_nino))
  return {
    state: salaChanged ? 'room-changed' : 'matched',
    childName: entry.childName,
    tutorName: entry.tutorName,
    tutorEmail: entry.tutorEmail,
    salaName: entry.salaName,
    targetSalaId: target?.id || null,
    targetSalaName: target?.sala || entry.salaName || null,
    movement,
    childDifferent,
    lastUpdatedAt: entry.lastUpdatedAt,
    sourceSheet: entry.sourceSheet
  }
}

export async function buildDaycareRosterOverlay(unidad: string, currentSala: Sala, accounts: FamilyAccount[]): Promise<DaycareRosterOverlay> {
  const source = await fetchRosterEntries()
  if (!source.sourceAvailable) {
    return { available: false, sourceState: 'unavailable', sourceMessage: 'La lista externa no respondió. La plataforma sigue usando las cuentas guardadas.', summary: { inSala: 0, linked: 0, pending: 0, moved: 0 }, sourceOnly: [], diagnostics: source.diagnostics }
  }

  const entriesForUnidad = source.entries.filter((entry) => rosterSheetMatchesUnidad(entry.sourceSheet, unidad))
  const salas = await salasForUnidad(unidad)
  const salaMap = mapSalas(salas)
  const currentSalaName = normalizeRosterSala(currentSala.sala)
  const entriesByEmail = new Map(entriesForUnidad.filter((entry) => entry.normalizedEmail).map((entry) => [entry.normalizedEmail, entry]))
  const accountEmails = new Set(accounts.map(rowEmail).filter(Boolean))

  const sourceOnly = entriesForUnidad
    .filter((entry) => entry.normalizedSala === currentSalaName && entry.normalizedEmail && !accountEmails.has(entry.normalizedEmail))
    .map((entry) => ({ ...entry, targetSalaId: Number(currentSala.id), targetSalaName: currentSala.sala }))

  let linked = 0
  let moved = 0
  for (const account of accounts) {
    const entry = entriesByEmail.get(rowEmail(account))
    if (!entry) continue
    linked += 1
    const target = entry.normalizedSala ? salaMap.get(entry.normalizedSala) : undefined
    if (target?.id && String(target.id) !== String(currentSala.id)) moved += 1
  }

  const diagnostics = overlayDiagnostics({ source, unidad, currentSala, entriesForUnidad, salas, accounts, linked, moved, sourceOnly })
  logPersonasDebug('daycare-roster-overlay', diagnostics)

  return {
    available: true,
    sourceState: 'connected',
    sourceMessage: null,
    summary: {
      inSala: entriesForUnidad.filter((entry) => entry.normalizedSala === currentSalaName).length,
      linked,
      pending: sourceOnly.length,
      moved
    },
    sourceOnly,
    sourceUpdatedAt: entriesForUnidad.map((entry) => entry.lastUpdatedAt).filter(Boolean).sort().at(-1) || null,
    diagnostics
  }
}

export async function attachRosterToFamilyAccounts(unidad: string, currentSala: Sala, accounts: FamilyAccount[]) {
  const overlay = await buildDaycareRosterOverlay(unidad, currentSala, accounts)
  if (!overlay.available) return { rows: accounts, roster: overlay }

  const source = await fetchRosterEntries()
  const entriesForUnidad = source.entries.filter((entry) => rosterSheetMatchesUnidad(entry.sourceSheet, unidad))
  const entriesByEmail = new Map(entriesForUnidad.filter((entry) => entry.normalizedEmail).map((entry) => [entry.normalizedEmail, entry]))
  const salaMap = mapSalas(await salasForUnidad(unidad))
  const rows = accounts.map((account) => ({
    ...account,
    roster: suggestionForAccount(account, entriesByEmail.get(rowEmail(account)), currentSala, salaMap)
  }))
  return { rows, roster: overlay }
}

export async function findDaycareRosterMatch(input: { email: string; unidad: string; salaId?: number | string | null; salaName?: string | null }) {
  const source = await fetchRosterEntries()
  if (!source.sourceAvailable) return { available: false as const, match: null, diagnostics: source.diagnostics }
  const email = normalizeRosterEmail(input.email)
  if (!email) return { available: true as const, match: null, diagnostics: source.diagnostics }
  const entriesForUnidad = source.entries.filter((entry) => rosterSheetMatchesUnidad(entry.sourceSheet, input.unidad))
  const entry = entriesForUnidad.find((item) => item.normalizedEmail === email) || null
  logPersonasDebug('daycare-roster-email-match', {
    ...source.diagnostics,
    unidad: input.unidad,
    salaId: input.salaId || null,
    entriesForUnidad: entriesForUnidad.length,
    matched: Boolean(entry)
  })
  if (!entry) return { available: true as const, match: null, diagnostics: source.diagnostics }

  const salas = await salasForUnidad(input.unidad)
  const salaMap = mapSalas(salas)
  const target = entry.normalizedSala ? salaMap.get(entry.normalizedSala) : undefined
  const currentSala = input.salaName || salas.find((sala) => String(sala.id) === String(input.salaId))?.sala || null
  const movement = target?.sala && currentSala ? compareRosterSalaProgression(currentSala, target.sala) : 'different'
  return {
    available: true as const,
    diagnostics: source.diagnostics,
    match: {
      childName: entry.childName,
      tutorName: entry.tutorName,
      tutorEmail: entry.tutorEmail,
      salaName: entry.salaName,
      targetSalaId: target?.id || null,
      targetSalaName: target?.sala || entry.salaName || null,
      movement,
      lastUpdatedAt: entry.lastUpdatedAt,
      sourceSheet: entry.sourceSheet
    }
  }
}

export async function applyDaycareRosterSuggestion(user: AppSessionUser, input: { sala: number; userId: number; applyChildName?: boolean; applySala?: boolean }) {
  const accountRow = await legacyOne<(FamilyAccount & RowDataPacket)>(
    `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala FROM users WHERE id = ? LIMIT 1`,
    [input.userId]
  )
  if (!accountRow) throw publicError(404, 'Cuenta familiar no encontrada.')
  const currentSala = await legacyOne<SalaRow>('SELECT id, sala, unidad FROM salas WHERE id = ? LIMIT 1', [input.sala])
  if (!currentSala) throw publicError(404, 'Sala no encontrada.')
  assertUnidadAccess(user, String(currentSala.unidad))
  if (String(accountRow.sala) !== String(currentSala.id)) throw publicError(403, 'Cuenta fuera de esta sala.')

  const roster = await findDaycareRosterMatch({ email: accountRow.email || accountRow.username, unidad: String(currentSala.unidad), salaId: currentSala.id, salaName: String(currentSala.sala) })
  if (!roster.available || !roster.match) throw publicError(404, 'No hay sugerencia disponible para esta cuenta.')

  const assignments: string[] = []
  const params: Array<string | number> = []
  if (input.applyChildName && roster.match.childName) {
    assignments.push('nombre_nino = ?')
    params.push(roster.match.childName)
  }
  if (input.applySala && roster.match.targetSalaId) {
    const targetSala = await legacyOne<SalaRow>('SELECT id, sala, unidad FROM salas WHERE id = ? LIMIT 1', [roster.match.targetSalaId])
    if (!targetSala) throw publicError(404, 'La sala sugerida no existe en la plataforma.')
    assertUnidadAccess(user, String(targetSala.unidad))
    if (String(targetSala.unidad) !== String(currentSala.unidad)) throw publicError(400, 'La sala sugerida pertenece a otra unidad.')
    assignments.push('sala = ?')
    params.push(Number(targetSala.id))
  }
  if (!assignments.length) throw publicError(400, 'No hay cambios para aplicar.')
  await legacyWrite(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`, [...params, input.userId])
  return { ok: true }
}
