import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import type {
  DaycareRoomManagementOverview,
  DaycareRoomMember,
  Sala
} from '~/types/daycare'
import { getSalasForUnidad, listAdminDaycareUnits } from '~/server/data/daycareScopes'
import { attachRosterToRoomMembers, findDaycareRosterMatch } from '~/server/data/daycareRoster'
import { assertUnidadAccess } from '~/server/utils/authz'
import { publicError } from '~/server/utils/httpError'
import { legacyOne, legacyQuery, legacyTransaction } from '~/server/utils/mysql'
import { DAYCARE_FAMILY_ROLE, hasRoleToken } from '~/utils/sessionScopes'

interface ManagedUserRow extends RowDataPacket {
  id: number | string
  nombre_nino: string | null
  username: string | null
  email: string | null
  plaintext: string | null
  password?: string | null
  role: string | null
  unidad: string | null
  sala: string | number | null
}

interface CountRow extends RowDataPacket {
  user_id: number | string
  total: number | string
}

interface TableCountRow extends RowDataPacket {
  total: number | string
}

interface IndexRow extends RowDataPacket {
  Key_name: string
  Non_unique: number | string
  Seq_in_index: number | string
  Column_name: string
}

type TransactionClient = {
  query: <T extends RowDataPacket[] = RowDataPacket[]>(sql: string, params?: Array<string | number | boolean | Date | null>) => Promise<T>
  one: <T extends RowDataPacket = RowDataPacket>(sql: string, params?: Array<string | number | boolean | Date | null>) => Promise<T | undefined>
  write: (sql: string, params?: Array<string | number | boolean | Date | null>) => Promise<ResultSetHeader>
}

let usersColumnCache: Set<string> | null = null
const tableAvailability = new Map<string, boolean>()

function normalizeEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase()
  return email.includes('@') && email.length >= 6 ? email : ''
}

function normalizeName(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
}

function csvTokens(value: unknown) {
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
}

function assertPureDaycareFamily(row: ManagedUserRow) {
  const roles = csvTokens(row.role)
  if (roles.length !== 1 || !hasRoleToken(roles, DAYCARE_FAMILY_ROLE)) {
    throw publicError(409, 'La cuenta combina accesos y requiere revisión administrativa.')
  }
}

async function getUsersColumns() {
  if (usersColumnCache) return usersColumnCache
  const rows = await legacyQuery<RowDataPacket[]>('SHOW COLUMNS FROM users')
  usersColumnCache = new Set(rows.map((row) => String(row.Field || '').trim()).filter(Boolean))
  return usersColumnCache
}

async function hasTable(table: string) {
  if (tableAvailability.has(table)) return Boolean(tableAvailability.get(table))
  try {
    const row = await legacyOne<TableCountRow>(
      `SELECT COUNT(*) AS total
       FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [table]
    )
    const available = Number(row?.total || 0) > 0
    tableAvailability.set(table, available)
    return available
  } catch {
    tableAvailability.set(table, false)
    return false
  }
}

async function relatedCountMap(table: string, ids: number[]) {
  const map = new Map<number, number>()
  if (!ids.length || !(await hasTable(table))) return map
  const placeholders = ids.map(() => '?').join(',')
  const rows = await legacyQuery<CountRow[]>(
    `SELECT user_id, COUNT(*) AS total FROM \`${table}\` WHERE user_id IN (${placeholders}) GROUP BY user_id`,
    ids
  )
  for (const row of rows) map.set(Number(row.user_id), Number(row.total || 0))
  return map
}

function memberQualityScore(member: DaycareRoomMember) {
  return (
    member.relatedRecords * 100
    + (member.plaintext ? 20 : 0)
    + (member.nombre_nino ? 12 : 0)
    + (member.salaId ? 8 : 0)
    + (member.email ? 4 : 0)
  )
}

function collapseMembersByEmail(members: DaycareRoomMember[]) {
  const grouped = new Map<string, DaycareRoomMember[]>()

  for (const member of members) {
    const email = normalizeEmail(member.email)
    const key = email ? `email:${email}` : `id:${member.id}`
    const bucket = grouped.get(key) || []
    bucket.push(member)
    grouped.set(key, bucket)
  }

  return Array.from(grouped.values())
    .map((rows) => [...rows].sort((left, right) => memberQualityScore(right) - memberQualityScore(left) || left.id - right.id)[0])
    .sort((left, right) => {
      const leftName = String(left.nombre_nino || left.email || left.username || '')
      const rightName = String(right.nombre_nino || right.email || right.username || '')
      return leftName.localeCompare(rightName, 'es', { sensitivity: 'base' }) || left.id - right.id
    })
}

export async function getDaycareRoomManagementOverview(user: AppSessionUser, requestedUnidad?: string | null): Promise<DaycareRoomManagementOverview> {
  const unidades = await listAdminDaycareUnits(user)
  const requested = String(requestedUnidad || '').trim()
  const unidad = requested && unidades.includes(requested) ? requested : unidades[0] || ''

  if (!unidad) {
    return {
      unidad: '',
      unidades,
      salas: [],
      members: [],
      stats: { total: 0, assigned: 0 },
      roster: { available: false, confirmed: 0, total: 0, rooms: [], sourceUpdatedAt: null }
    }
  }

  assertUnidadAccess(user, unidad)
  const salas = await getSalasForUnidad(user, unidad)
  const salaIds = salas.map((sala) => sala.id)
  const salaById = new Map(salas.map((sala) => [sala.id, sala]))

  if (!salaIds.length) {
    return {
      unidad,
      unidades,
      salas,
      members: [],
      stats: { total: 0, assigned: 0 },
      roster: { available: false, confirmed: 0, total: 0, rooms: [], sourceUpdatedAt: null }
    }
  }

  const rows = await legacyQuery<ManagedUserRow[]>(
    `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala
     FROM users
     WHERE REPLACE(TRIM(COALESCE(role, '')), ' ', '') = ?
       AND CAST(sala AS UNSIGNED) IN (${salaIds.map(() => '?').join(',')})
     ORDER BY nombre_nino ASC, email ASC, id ASC`,
    [DAYCARE_FAMILY_ROLE, ...salaIds]
  )

  const ids = rows.map((row) => Number(row.id)).filter((id) => Number.isInteger(id) && id > 0)
  const [authorizedCounts, studentCounts] = await Promise.all([
    relatedCountMap('personas_autorizadas', ids),
    relatedCountMap('alumno_pa', ids)
  ])

  const rawMembers: DaycareRoomMember[] = rows.map((row) => {
    const id = Number(row.id)
    const salaId = Number(row.sala || 0)
    const sala = salaById.get(salaId) || null
    const authorizedPeople = authorizedCounts.get(id) || 0
    const linkedStudents = studentCounts.get(id) || 0
    return {
      id,
      nombre_nino: row.nombre_nino || null,
      username: String(row.username || ''),
      email: String(row.email || ''),
      plaintext: row.plaintext || null,
      role: row.role || DAYCARE_FAMILY_ROLE,
      unidad,
      sala: salaId,
      salaId: sala?.id || salaId,
      salaName: sala?.sala || '',
      relatedRecords: authorizedPeople + linkedStudents,
      authorizedPeople,
      linkedStudents
    }
  })

  const members = collapseMembersByEmail(rawMembers)
  const rosterState = await attachRosterToRoomMembers(unidad, salas, members)

  return {
    unidad,
    unidades,
    salas,
    members: rosterState.members,
    stats: {
      total: members.length,
      assigned: members.length
    },
    roster: rosterState.roster
  }
}

export async function revokeUnconfirmedDaycareAccess(user: AppSessionUser, input: { userId: number }) {
  const userId = Number(input.userId)
  if (!Number.isInteger(userId) || userId <= 0) throw publicError(400, 'Usuario no válido.')

  const columns = await getUsersColumns()
  const passwordSelect = columns.has('password') ? ', password' : ''
  const row = await legacyOne<ManagedUserRow>(
    `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala${passwordSelect}
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  )
  if (!row) throw publicError(404, 'Usuario no encontrado.')
  assertPureDaycareFamily(row)

  const salaId = Number(row.sala || 0)
  if (!Number.isInteger(salaId) || salaId <= 0) throw publicError(409, 'El usuario ya no tiene acceso activo.')
  const sala = await legacyOne<(Sala & RowDataPacket)>('SELECT id, sala, unidad FROM salas WHERE id = ? LIMIT 1', [salaId])
  if (!sala) throw publicError(404, 'Sala no encontrada.')
  assertUnidadAccess(user, String(sala.unidad))

  const roster = await findDaycareRosterMatch({
    email: row.email || row.username || '',
    unidad: String(sala.unidad),
    salaId: Number(sala.id),
    salaName: String(sala.sala)
  })
  if (!roster.available) throw publicError(503, 'La confirmación de usuarios no está disponible.')
  if (roster.match) throw publicError(409, 'El usuario está confirmado en la lista.')

  const assignments = ['role = NULL', 'unidad = NULL', 'sala = NULL']
  if (columns.has('plaintext')) assignments.push('plaintext = NULL')
  if (columns.has('password')) assignments.push('password = NULL')
  await legacyTransaction(async (tx) => {
    const locked = await tx.one<ManagedUserRow>(
      `SELECT id, role, sala FROM users WHERE id = ? FOR UPDATE`,
      [userId]
    )
    if (!locked) throw publicError(404, 'Usuario no encontrado.')
    assertPureDaycareFamily({ ...row, role: locked.role, sala: locked.sala })
    if (Number(locked.sala || 0) !== salaId) throw publicError(409, 'El usuario cambió de sala. Actualiza la vista.')
    await tx.write(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`, [userId])
  })

  return { ok: true, userId }
}

function managedRowQualityScore(row: ManagedUserRow) {
  return (
    (String(row.plaintext || '').trim() ? 20 : 0)
    + (String(row.password || '').trim() ? 18 : 0)
    + (String(row.nombre_nino || '').trim() ? 12 : 0)
    + (Number(row.sala || 0) ? 8 : 0)
    + (normalizeEmail(row.email) ? 4 : 0)
  )
}

function chooseCanonicalRow(rows: ManagedUserRow[], targetSalaId: number, selectedIds: Set<number>) {
  return [...rows].sort((left, right) => {
    const leftTarget = Number(left.sala || 0) === targetSalaId ? 1 : 0
    const rightTarget = Number(right.sala || 0) === targetSalaId ? 1 : 0
    if (leftTarget !== rightTarget) return rightTarget - leftTarget

    const leftSelected = selectedIds.has(Number(left.id)) ? 1 : 0
    const rightSelected = selectedIds.has(Number(right.id)) ? 1 : 0
    if (leftSelected !== rightSelected) return rightSelected - leftSelected

    return managedRowQualityScore(right) - managedRowQualityScore(left) || Number(left.id) - Number(right.id)
  })[0]
}

export async function moveDaycareRoomMembers(user: AppSessionUser, input: { userIds: number[]; targetSalaId: number }) {
  const ids = Array.from(new Set(input.userIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))).sort((a, b) => a - b)
  if (!ids.length) throw publicError(400, 'Selecciona al menos una cuenta.')

  const target = await legacyOne<(Sala & RowDataPacket)>('SELECT id, sala, unidad FROM salas WHERE id = ? LIMIT 1', [input.targetSalaId])
  if (!target) throw publicError(404, 'Sala no encontrada.')
  assertUnidadAccess(user, String(target.unidad))

  const unitSalas = await getSalasForUnidad(user, String(target.unidad))
  const unitSalaIds = unitSalas.map((sala) => Number(sala.id))
  const unitSalaSet = new Set(unitSalaIds)
  if (!unitSalaSet.has(Number(target.id))) throw publicError(403, 'Sala fuera del alcance del usuario.')

  const columns = await getUsersColumns()
  const passwordSelect = columns.has('password') ? ', password' : ''
  const selectedIdSet = new Set(ids)

  const result = await legacyTransaction(async (tx) => {
    const selectedRows = await tx.query<ManagedUserRow[]>(
      `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala${passwordSelect}
       FROM users
       WHERE id IN (${ids.map(() => '?').join(',')})
       ORDER BY id ASC
       FOR UPDATE`,
      ids
    )

    if (selectedRows.length !== ids.length) throw publicError(404, 'Una o más cuentas ya no están disponibles.')

    for (const row of selectedRows) {
      assertPureDaycareFamily(row)
      if (!unitSalaSet.has(Number(row.sala || 0))) {
        throw publicError(403, 'Una o más cuentas están fuera de la unidad seleccionada.')
      }
    }

    const emails = Array.from(new Set(selectedRows.map((row) => normalizeEmail(row.email)).filter(Boolean))).sort()
    let scopedRows = [...selectedRows]

    if (emails.length) {
      const emailRows = await tx.query<ManagedUserRow[]>(
        `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala${passwordSelect}
         FROM users
         WHERE REPLACE(TRIM(COALESCE(role, '')), ' ', '') = ?
           AND CAST(sala AS UNSIGNED) IN (${unitSalaIds.map(() => '?').join(',')})
           AND LOWER(TRIM(COALESCE(email, ''))) IN (${emails.map(() => '?').join(',')})
         ORDER BY id ASC
         FOR UPDATE`,
        [DAYCARE_FAMILY_ROLE, ...unitSalaIds, ...emails]
      )
      const rowsById = new Map<number, ManagedUserRow>()
      for (const row of [...selectedRows, ...emailRows]) rowsById.set(Number(row.id), row)
      scopedRows = Array.from(rowsById.values())
    }

    const rowsByIdentity = new Map<string, ManagedUserRow[]>()
    for (const row of scopedRows) {
      const email = normalizeEmail(row.email)
      const key = email ? `email:${email}` : `id:${Number(row.id)}`
      const bucket = rowsByIdentity.get(key) || []
      bucket.push(row)
      rowsByIdentity.set(key, bucket)
    }

    const processed = new Set<string>()
    const canonicalIds: number[] = []

    for (const selectedRow of selectedRows) {
      const email = normalizeEmail(selectedRow.email)
      const key = email ? `email:${email}` : `id:${Number(selectedRow.id)}`
      if (processed.has(key)) continue
      processed.add(key)

      const identityRows = rowsByIdentity.get(key) || [selectedRow]
      const canonical = chooseCanonicalRow(identityRows, Number(target.id), selectedIdSet)
      const canonicalId = Number(canonical.id)
      const duplicateIds = identityRows.map((row) => Number(row.id)).filter((id) => id !== canonicalId)

      if (!duplicateIds.length) {
        await tx.write('UPDATE users SET unidad = ?, sala = ? WHERE id = ?', [String(target.unidad), String(target.id), canonicalId])
        canonicalIds.push(canonicalId)
        continue
      }

      const bestPasswordRow = String(canonical.plaintext || '').trim() || String(canonical.password || '').trim()
        ? canonical
        : identityRows.find((row) => String(row.plaintext || '').trim() || String(row.password || '').trim()) || canonical
      const finalEmail = normalizeEmail(canonical.email) || selectBestValue(identityRows, 'email') || ''
      const finalUsername = String(canonical.username || '').trim() || finalEmail || `familia_${canonicalId}`
      const assignments = ['nombre_nino = ?', 'username = ?', 'email = ?', 'role = ?', 'unidad = ?', 'sala = ?']
      const params: Array<string | number | null> = [
        String(canonical.nombre_nino || '').trim() || selectBestValue(identityRows, 'nombre_nino'),
        finalUsername,
        finalEmail,
        DAYCARE_FAMILY_ROLE,
        String(target.unidad),
        String(target.id)
      ]

      if (columns.has('plaintext')) {
        assignments.push('plaintext = ?')
        params.push(bestPasswordRow.plaintext || null)
      }
      if (columns.has('password')) {
        assignments.push('password = ?')
        params.push(bestPasswordRow.password || canonical.password || null)
      }

      await tx.write(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`, [...params, canonicalId])
      await mergeAuthorizedPeople(tx, canonicalId, duplicateIds)
      await mergeSimpleReferences(tx, canonicalId, duplicateIds)
      await archiveDuplicateUsers(tx, duplicateIds, columns)
      canonicalIds.push(canonicalId)
    }

    return canonicalIds
  })

  return {
    moved: result.length,
    userIds: result,
    target: { id: Number(target.id), sala: String(target.sala), unidad: String(target.unidad) }
  }
}

function selectBestValue(rows: ManagedUserRow[], field: 'nombre_nino' | 'email' | 'username' | 'plaintext') {
  const values = rows.map((row) => String(row[field] || '').trim()).filter(Boolean)
  if (!values.length) return null
  if (field === 'email') return normalizeEmail(values[0]) || values[0].toLowerCase()
  return [...values].sort((a, b) => b.length - a.length)[0]
}

async function mergeAuthorizedPeople(tx: TransactionClient, canonicalId: number, duplicateIds: number[]) {
  if (!(await hasTable('personas_autorizadas'))) return
  const ids = [canonicalId, ...duplicateIds]
  const rows = await tx.query<RowDataPacket[]>(
    `SELECT id, user_id, indice, paternoP, maternoP, nombreP, parenP
     FROM personas_autorizadas
     WHERE user_id IN (${ids.map(() => '?').join(',')})
     ORDER BY CASE WHEN user_id = ? THEN 0 ELSE 1 END, indice ASC, id ASC`,
    [...ids, canonicalId]
  )

  const canonicalRows = rows.filter((row) => Number(row.user_id) === canonicalId)
  const occupied = new Set(canonicalRows.map((row) => Number(row.indice)).filter((value) => value >= 1 && value <= 4))
  const identities = new Set(canonicalRows.map((row) => normalizeName(`${row.paternoP || ''}${row.maternoP || ''}${row.nombreP || ''}${row.parenP || ''}`)).filter(Boolean))

  for (const row of rows.filter((item) => Number(item.user_id) !== canonicalId)) {
    const identity = normalizeName(`${row.paternoP || ''}${row.maternoP || ''}${row.nombreP || ''}${row.parenP || ''}`)
    if (identity && identities.has(identity)) {
      await tx.write('DELETE FROM personas_autorizadas WHERE id = ?', [Number(row.id)])
      continue
    }

    const preferred = Number(row.indice)
    const slot = !occupied.has(preferred) && preferred >= 1 && preferred <= 4
      ? preferred
      : [1, 2, 3, 4].find((candidate) => !occupied.has(candidate))
    if (!slot) continue
    await tx.write('UPDATE personas_autorizadas SET user_id = ?, indice = ? WHERE id = ?', [canonicalId, slot, Number(row.id)])
    occupied.add(slot)
    if (identity) identities.add(identity)
  }
}

function normalizedRecordFingerprint(row: RowDataPacket, ignored: Set<string>) {
  return Object.keys(row)
    .filter((key) => !ignored.has(key.toLowerCase()))
    .sort()
    .map((key) => {
      const value = row[key]
      if (value === undefined || value === null) return `${key}:`
      if (value instanceof Date) return `${key}:${value.toISOString()}`
      return `${key}:${String(value).trim().toLowerCase()}`
    })
    .join('|')
}

function recordCompleteness(row: RowDataPacket, ignored: Set<string>) {
  return Object.keys(row).reduce((total, key) => {
    if (ignored.has(key.toLowerCase())) return total
    const value = row[key]
    return total + (value === undefined || value === null || String(value).trim() === '' ? 0 : 1)
  }, 0)
}

async function mergeAlumnoPa(tx: TransactionClient, canonicalId: number, duplicateIds: number[]) {
  if (!(await hasTable('alumno_pa'))) return
  const ids = [canonicalId, ...duplicateIds]
  const rows = await tx.query<RowDataPacket[]>(
    `SELECT * FROM alumno_pa
     WHERE user_id IN (${ids.map(() => '?').join(',')})
     ORDER BY CASE WHEN user_id = ? THEN 0 ELSE 1 END, id ASC`,
    [...ids, canonicalId]
  )
  if (!rows.length) return

  const indexRows = await tx.query<IndexRow[]>('SHOW INDEX FROM alumno_pa')
  const uniqueIndexColumns = new Map<string, string[]>()
  for (const index of indexRows) {
    if (Number(index.Non_unique) !== 0) continue
    const columns = uniqueIndexColumns.get(String(index.Key_name)) || []
    columns[Number(index.Seq_in_index) - 1] = String(index.Column_name).toLowerCase()
    uniqueIndexColumns.set(String(index.Key_name), columns)
  }
  const hasUniqueUserId = Array.from(uniqueIndexColumns.values()).some((columns) => columns.length === 1 && columns[0] === 'user_id')
  const ignored = new Set(['id', 'user_id', 'created_at', 'updated_at', 'timestamp'])

  if (hasUniqueUserId) {
    const keeper = [...rows].sort((left, right) => {
      const scoreDiff = recordCompleteness(right, ignored) - recordCompleteness(left, ignored)
      if (scoreDiff) return scoreDiff
      const leftCanonical = Number(left.user_id) === canonicalId ? 1 : 0
      const rightCanonical = Number(right.user_id) === canonicalId ? 1 : 0
      return rightCanonical - leftCanonical || Number(left.id) - Number(right.id)
    })[0]
    const discardIds = rows.map((row) => Number(row.id)).filter((id) => id !== Number(keeper.id))
    if (discardIds.length) {
      await tx.write(`DELETE FROM alumno_pa WHERE id IN (${discardIds.map(() => '?').join(',')})`, discardIds)
    }
    if (Number(keeper.user_id) !== canonicalId) {
      await tx.write('UPDATE alumno_pa SET user_id = ? WHERE id = ?', [canonicalId, Number(keeper.id)])
    }
    return
  }

  const fingerprints = new Set<string>()
  for (const row of rows) {
    const fingerprint = normalizedRecordFingerprint(row, ignored)
    if (Number(row.user_id) === canonicalId) fingerprints.add(fingerprint)
  }

  for (const row of rows.filter((item) => Number(item.user_id) !== canonicalId)) {
    const fingerprint = normalizedRecordFingerprint(row, ignored)
    if (fingerprints.has(fingerprint)) {
      await tx.write('DELETE FROM alumno_pa WHERE id = ?', [Number(row.id)])
      continue
    }
    await tx.write('UPDATE alumno_pa SET user_id = ? WHERE id = ?', [canonicalId, Number(row.id)])
    fingerprints.add(fingerprint)
  }
}

async function mergeSimpleReferences(tx: TransactionClient, canonicalId: number, duplicateIds: number[]) {
  await mergeAlumnoPa(tx, canonicalId, duplicateIds)

  if (await hasTable('password_recovery_tokens')) {
    await tx.write(
      `UPDATE password_recovery_tokens
       SET superseded_at = COALESCE(superseded_at, UTC_TIMESTAMP())
       WHERE user_id IN (${duplicateIds.map(() => '?').join(',')}) AND used_at IS NULL`,
      duplicateIds
    )
  }
}

async function archiveDuplicateUsers(tx: TransactionClient, duplicateIds: number[], columns: Set<string>) {
  for (const id of duplicateIds) {
    const assignments: string[] = ['role = NULL', 'unidad = NULL', 'sala = NULL']
    const params: Array<string | number | null> = []
    if (columns.has('username')) {
      assignments.push('username = ?')
      params.push(`merged_${id}`)
    }
    if (columns.has('email')) {
      assignments.push('email = ?')
      params.push(`merged_${id}@invalid.local`)
    }
    if (columns.has('plaintext')) assignments.push('plaintext = NULL')
    if (columns.has('password')) assignments.push('password = NULL')
    if (columns.has('nombre_nino')) assignments.push('nombre_nino = NULL')
    await tx.write(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`, [...params, id])
  }
}
