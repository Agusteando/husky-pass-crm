import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import type {
  AuthorizedChild,
  AuthorizedPerson,
  DaycareResource,
  FamilyAccount,
  PrintableAuthorizedPerson,
  PersonasStudentEditable,
  PersonasStudentProfile,
  Sala,
  ScanAuthorizedPerson
} from '~/types/daycare'
import { assertSalaAccess, assertUnidadAccess } from '~/server/utils/authz'
import { legacyOne, legacyQuery, legacyWrite } from '~/server/utils/mysql'
import { logPersonasWarning, logPersonasDebug } from '~/server/utils/personasDiagnostics'
import { publicError } from '~/server/utils/httpError'
import { normalizeMatricula } from '~/utils/matricula'
import { DAYCARE_FAMILY_ROLE, hasRoleToken } from '~/utils/sessionScopes'

type AdminResourcePayload = Omit<DaycareResource, 'unidad'> & { unidad?: string }
type FamilyAccountPayload = Omit<FamilyAccount, 'unidad'> & { unidad?: string }
type AuthorizedPersonPayload = Partial<AuthorizedPerson> & { children?: AuthorizedChild[] }

const AUTHORIZE_RECAPTURE_MESSAGE = 'Para corregir una persona autorizada, primero anula el registro y captura uno nuevo.'

function assertFamilyOwner(user: AppSessionUser, ownerId?: number | string | null) {
  if (String(user.id) !== String(ownerId)) {
    throw publicError(403, 'Registro fuera del alcance de la cuenta familiar')
  }
}

function normalizeString(value: unknown) {
  if (value === undefined || value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

function compactFamilyName(...parts: unknown[]) {
  return parts.map((part) => normalizeString(part)).filter(Boolean).join(' ')
}

function normalizedEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function parentIdentityFromRow(row: RowDataPacket, user?: AppSessionUser | null) {
  const userEmail = normalizedEmail(user?.email)
  const fatherEmail = normalizedEmail(row.email_padre)
  const motherEmail = normalizedEmail(row.email_madre)
  const fatherName = compactFamilyName(row.nombre_padre, row.apellido_paterno_padre, row.apellido_materno_padre)
  const motherName = compactFamilyName(row.nombre_madre, row.apellido_paterno_madre, row.apellido_materno_madre)

  if (userEmail && motherEmail && userEmail === motherEmail && motherName) return { parentName: motherName, parentRole: 'Madre' as const }
  if (userEmail && fatherEmail && userEmail === fatherEmail && fatherName) return { parentName: fatherName, parentRole: 'Padre' as const }
  return { parentName: null, parentRole: null }
}

const LIGHTWEIGHT_PHOTO_MAX_BYTES = 2048

function lightweightPhotoSelect(column: string) {
  return `CASE
    WHEN NULLIF(${column}, '') IS NULL THEN NULL
    WHEN ${column} LIKE 'data:%' THEN NULL
    WHEN OCTET_LENGTH(${column}) > ${LIGHTWEIGHT_PHOTO_MAX_BYTES} THEN NULL
    ELSE ${column}
  END`
}


export const PARENT_EDITABLE_STUDENT_FIELDS = [
  'curp',
  'nombres',
  'apellido_paterno',
  'apellido_materno',
  'fecha_nacimiento',
  'lugar_nacimiento',
  'sexo',
  'talla',
  'peso',
  'tipo_sangre',
  'alergias',
  'nombre_padre',
  'apellido_paterno_padre',
  'apellido_materno_padre',
  'lugar_trabajo_padre',
  'puesto_padre',
  'email_padre',
  'telefono_padre',
  'estado_civil_padre',
  'fecha_nacimiento_padre',
  'curp_padre',
  'ine_padre',
  'nombre_madre',
  'apellido_paterno_madre',
  'apellido_materno_madre',
  'lugar_trabajo_madre',
  'puesto_madre',
  'email_madre',
  'telefono_madre',
  'estado_civil_madre',
  'fecha_nacimiento_madre',
  'curp_madre',
  'ine_madre',
  'domicilio_calle',
  'domicio_num',
  'domicilio_colonia',
  'domicilio_cp',
  'domicilio_municipio'
] as const

const STUDENT_READONLY_FIELDS = [
  'matricula',
  'nivel',
  'grado',
  'grupo',
  'ciclo',
  'servicio',
  'baja',
  'status',
  'foto',
  'updated_at'
] as const

type ParentEditableStudentField = typeof PARENT_EDITABLE_STUDENT_FIELDS[number]

function assertFamilyMatricula(user: AppSessionUser) {
  const matricula = normalizeMatricula(user.username)
  if (!matricula) throw publicError(403, 'La cuenta familiar no tiene matrícula vinculada.')
  return matricula
}

function derivePlantelFromMatricula(matricula?: string | null, _nivel?: string | null, fallback?: string | null) {
  const username = normalizeMatricula(matricula)
  if (username.startsWith('PREEM')) return 'PREEM'
  if (username.startsWith('PREET')) return 'PREET'
  if (username.startsWith('PM')) return 'PM'
  if (username.startsWith('PT')) return 'PT'
  if (username.startsWith('SM')) return 'SM'
  if (username.startsWith('ST')) return 'ST'
  if (username.startsWith('DM')) return 'CM'
  const prefix = username.slice(0, 2)
  return prefix || normalizeString(fallback) || null
}


const REQUIRED_PARENT_NAME_FIELDS = [
  'nombre_padre',
  'apellido_paterno_padre',
  'apellido_materno_padre',
  'nombre_madre',
  'apellido_paterno_madre',
  'apellido_materno_madre'
] as const

type ParentNameField = typeof REQUIRED_PARENT_NAME_FIELDS[number]
const PARENT_SIGNATURE_COLUMN = 'hp_parent_signature'

function normalizeFamilyName(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

function completeParentSignature(row: Partial<Record<ParentNameField, unknown>> | null | undefined) {
  if (!row) return null
  const values = Object.fromEntries(REQUIRED_PARENT_NAME_FIELDS.map((field) => [field, normalizeFamilyName(row[field])])) as Record<ParentNameField, string>
  if (REQUIRED_PARENT_NAME_FIELDS.some((field) => !values[field])) return null
  const father = [values.nombre_padre, values.apellido_paterno_padre, values.apellido_materno_padre].join(' ')
  const mother = [values.nombre_madre, values.apellido_paterno_madre, values.apellido_materno_madre].join(' ')
  return `${father}|${mother}`
}

function mapMatriculaChild(row: RowDataPacket, currentMatricula: string, fallbackCampus?: string | null, user?: AppSessionUser | null): AuthorizedChild {
  const matricula = normalizeMatricula(row.matricula) || null
  const isCurrent = matricula === currentMatricula
  const parentIdentity = parentIdentityFromRow(row, user)
  return {
    id: row.user_id ? Number(row.user_id) : null,
    paternoA: row.apellido_paterno || null,
    maternoA: row.apellido_materno || null,
    nombreA: row.nombres || null,
    grupo: row.grupo || null,
    grado: row.grado || null,
    nivelEdu: row.nivel || null,
    campus: row.campus || fallbackCampus || null,
    plantel: derivePlantelFromMatricula(matricula, row.nivel as string | null, row.campus || fallbackCampus),
    matricula,
    foto: row.foto || null,
    fechaA: null,
    user_id: row.user_id ? Number(row.user_id) : null,
    isCurrent,
    canSwitch: Boolean(!isCurrent && row.user_id && matricula),
    siblingMatch: isCurrent ? 'current' : 'parents',
    parentName: parentIdentity.parentName,
    parentRole: parentIdentity.parentRole
  }
}

function pickStudentProfile(row: RowDataPacket | undefined, plantel?: string | null, allowedFields: readonly string[] = PARENT_EDITABLE_STUDENT_FIELDS): PersonasStudentProfile {
  const readonly: Record<string, unknown> = { plantel: plantel || null }
  const editable: Record<string, unknown> = {}

  for (const field of STUDENT_READONLY_FIELDS) readonly[field] = row?.[field] ?? null
  for (const field of allowedFields) editable[field] = row?.[field] ?? null
  readonly.matricula = normalizeMatricula(readonly.matricula as string | null) || null

  return {
    readonly: readonly as PersonasStudentProfile['readonly'],
    editable: editable as PersonasStudentEditable,
    allowedFields: [...allowedFields],
    meta: { updatedAt: row?.updated_at ? String(row.updated_at) : null }
  }
}

function isHiddenValue(value: unknown) {
  if (value === undefined || value === null) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  const normalized = String(value).trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'hidden'
}


let matriculaColumnCache: Set<string> | null = null
const loggedMissingMatriculaColumns = new Set<string>()
let usersColumnCache: Set<string> | null = null
const loggedMissingUserColumns = new Set<string>()

function quoteIdentifier(identifier: string) {
  return `\`${identifier.replace(/`/g, '``')}\``
}

async function getMatriculaColumnSet() {
  if (matriculaColumnCache) return matriculaColumnCache
  try {
    const rows = await legacyQuery<RowDataPacket[]>('SHOW COLUMNS FROM matricula')
    matriculaColumnCache = new Set(rows.map((row) => String(row.Field || '').trim()).filter(Boolean))
    if (!matriculaColumnCache.has('matricula')) {
      logPersonasWarning('matricula-schema-missing-primary-column', { table: 'matricula', requiredColumn: 'matricula' })
      throw publicError(500, 'La tabla de matrícula no tiene la columna requerida.')
    }
    return matriculaColumnCache
  } catch {
    throw publicError(500, 'No fue posible validar la estructura de matrícula.')
  }
}


async function getUsersColumnSet() {
  if (usersColumnCache) return usersColumnCache
  try {
    const rows = await legacyQuery<RowDataPacket[]>('SHOW COLUMNS FROM users')
    usersColumnCache = new Set(rows.map((row) => String(row.Field || '').trim()).filter(Boolean))
    if (!usersColumnCache.has('id') || !usersColumnCache.has('username')) {
      logPersonasWarning('users-schema-missing-primary-columns', { table: 'users', requiredColumns: ['id', 'username'] })
      throw publicError(500, 'La tabla de usuarios no tiene columnas requeridas.')
    }
    return usersColumnCache
  } catch {
    throw publicError(500, 'No fue posible validar la estructura de usuarios.')
  }
}

function usersSelect(columns: Set<string>, field: string, alias = 'u') {
  if (!columns.has(field)) {
    const key = `users:${field}`
    if (!loggedMissingUserColumns.has(key)) {
      loggedMissingUserColumns.add(key)
      logPersonasWarning('users-schema-missing-column', { table: 'users', missingColumn: field })
    }
    return 'NULL'
  }
  return `${alias}.${quoteIdentifier(field)}`
}

function existingColumns(columns: Set<string>, fields: readonly string[], scope: string) {
  const missing = fields.filter((field) => !columns.has(field))
  if (missing.length) {
    const key = `${scope}:${missing.join(',')}`
    if (!loggedMissingMatriculaColumns.has(key)) {
      loggedMissingMatriculaColumns.add(key)
      logPersonasDebug('matricula-schema-missing-columns', { scope, missingColumns: missing, table: 'matricula' })
    }
  }
  return fields.filter((field) => columns.has(field))
}

function matriculaSelect(columns: Set<string>, field: string, alias = 'm') {
  return columns.has(field) ? `${alias}.${quoteIdentifier(field)}` : `NULL`
}

function missingRequiredParentFields(row: Partial<Record<ParentNameField, unknown>> | null | undefined) {
  if (!row) return [...REQUIRED_PARENT_NAME_FIELDS]
  return REQUIRED_PARENT_NAME_FIELDS.filter((field) => !normalizeFamilyName(row[field]))
}

export async function getSalasForUnidad(user: AppSessionUser, unidad: string) {
  assertUnidadAccess(user, unidad)
  const rows = await legacyQuery<(Sala & RowDataPacket)[]>('SELECT id, sala, unidad FROM salas WHERE unidad = ? ORDER BY id ASC', [unidad])
  return rows.map((row) => ({ id: Number(row.id), sala: row.sala, unidad: row.unidad }))
}

export async function listAdminDaycareUnits(user: AppSessionUser) {
  if (!user.isSuperAdmin) return user.unidades.filter(Boolean)
  const rows = await legacyQuery<(RowDataPacket & { unidad: string | null })[]>(
    `SELECT DISTINCT unidad
     FROM salas
     WHERE unidad IS NOT NULL AND TRIM(unidad) <> ''
     ORDER BY unidad ASC`
  )
  return rows.map((row) => String(row.unidad || '').trim()).filter(Boolean)
}

export async function getSalaById(user: AppSessionUser, salaId: number) {
  assertSalaAccess(user, salaId)
  const sala = await legacyOne<(Sala & RowDataPacket)>('SELECT id, sala, unidad FROM salas WHERE id = ? LIMIT 1', [salaId])
  if (!sala) throw publicError(404, 'Sala no encontrada')
  assertUnidadAccess(user, sala.unidad)
  return { id: Number(sala.id), sala: sala.sala, unidad: sala.unidad }
}

export async function getFamilyDashboard(user: AppSessionUser) {
  const unidad = user.scopes.daycare?.unidad
  const sala = user.scopes.daycare?.sala
  if (!unidad || !sala) throw publicError(403, 'La cuenta no tiene alcance de guardería')

  const [tareas, circulares, calendario, valor] = await Promise.all([
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT *
       FROM recursos
       WHERE type = 'hw' AND sala = ? AND unidad = ? AND hidden = '0'
       ORDER BY id DESC`,
      [sala, unidad]
    ),
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT *
       FROM recursos
       WHERE type = 'news' AND unidad = ? AND sala = ? AND hidden = '0'
       GROUP BY timestamp
       ORDER BY id DESC`,
      [unidad, sala]
    ),
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT DISTINCT id, date, title, description,
        CONCAT('<p>', title, '</p>', '</br><p class="truncar">', description, '</p>') AS html,
        resource, starred, autor, unidad, sala, type, timestamp
       FROM recursos
       WHERE type = 'cal' AND unidad = ? AND sala = ? AND DATE(date) >= CURDATE() AND hidden = '0'
       GROUP BY date, title, description, timestamp, sala
       ORDER BY date`,
      [unidad, sala]
    ),
    legacyQuery<RowDataPacket[]>(`SELECT valor FROM valores_mensuales WHERE mes_en = MONTHNAME(CURDATE())`)
  ])

  return { tareas, circulares, calendario, valor }
}


export async function getEditableStudentProfile(user: AppSessionUser) {
  const matricula = assertFamilyMatricula(user)
  const columnSet = await getMatriculaColumnSet()
  const readonlyFields = existingColumns(columnSet, STUDENT_READONLY_FIELDS, 'student-profile-readonly')
  const editableFields = existingColumns(columnSet, PARENT_EDITABLE_STUDENT_FIELDS, 'student-profile-editable')
  const selectFields = Array.from(new Set([...readonlyFields, ...editableFields]))
  if (!selectFields.length) {
    logPersonasWarning('student-profile-no-readable-columns', { userId: user.id, matricula })
    throw publicError(500, 'No hay campos de matricula configurados para consulta familiar.')
  }

  const columns = selectFields.map(quoteIdentifier).join(', ')
  const row = await legacyOne<RowDataPacket>(`SELECT ${columns} FROM matricula WHERE matricula = ? LIMIT 1`, [matricula])
  if (!row) {
    logPersonasWarning('student-profile-matricula-not-found', { userId: user.id, matricula })
    throw publicError(404, 'No encontramos la matricula vinculada a esta cuenta familiar.')
  }
  const plantel = derivePlantelFromMatricula(matricula, row.nivel as string | null, user.campus || user.empresa)
  return pickStudentProfile(row, plantel, editableFields)
}

export async function updateEditableStudentProfile(user: AppSessionUser, patch: Partial<PersonasStudentEditable>) {
  const matricula = assertFamilyMatricula(user)
  const columnSet = await getMatriculaColumnSet()
  const entries = Object.entries(patch).filter(([field]) => (PARENT_EDITABLE_STUDENT_FIELDS as readonly string[]).includes(field)) as [ParentEditableStudentField, unknown][]
  if (!entries.length) throw publicError(400, 'No hay campos familiares autorizados para guardar.')

  const missingColumns = entries.map(([field]) => field).filter((field) => !columnSet.has(field))
  if (missingColumns.length) {
    logPersonasWarning('student-profile-update-missing-columns', { userId: user.id, matricula, missingColumns })
    throw publicError(400, 'Algunos campos familiares no estan disponibles para actualizacion.')
  }

  const assignments = entries.map(([field]) => `${quoteIdentifier(field)} = ?`).join(', ')
  const values = entries.map(([, value]) => normalizeString(value))
  const result = await legacyWrite(`UPDATE matricula SET ${assignments} WHERE matricula = ?`, [...values, matricula])
  if (!result.affectedRows) {
    logPersonasWarning('student-profile-update-matricula-not-found', { userId: user.id, matricula, updatedFields: entries.map(([field]) => field) })
    throw publicError(404, 'No encontramos la matricula vinculada a esta cuenta familiar.')
  }
  return getEditableStudentProfile(user)
}

export async function updateStudentCredentialPhoto(user: AppSessionUser, photoUrl: string) {
  const matricula = assertFamilyMatricula(user)
  const columnSet = await getMatriculaColumnSet()
  if (!columnSet.has('foto')) {
    logPersonasWarning('student-photo-update-missing-column', { userId: user.id, matricula, missingColumn: 'foto', table: 'matricula' })
    throw publicError(400, 'La foto del alumno no esta disponible para actualizacion.')
  }
  const value = normalizeString(photoUrl)
  if (!value) throw publicError(400, 'La foto es obligatoria.')
  const result = await legacyWrite('UPDATE matricula SET foto = ? WHERE matricula = ?', [value, matricula])
  if (!result.affectedRows) {
    logPersonasWarning('student-photo-update-matricula-not-found', { userId: user.id, matricula })
    throw publicError(404, 'No encontramos la matricula vinculada a esta cuenta familiar.')
  }
  return getEditableStudentProfile(user)
}

export async function getFamilyResources(user: AppSessionUser, type: 'hw' | 'news' | 'cal') {
  const unidad = user.scopes.daycare?.unidad
  const sala = user.scopes.daycare?.sala
  if (!unidad || !sala) throw publicError(403, 'La cuenta no tiene alcance de guardería')

  if (type === 'cal') {
    return legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT DISTINCT id, date, title, description,
        CONCAT('<p>', title, '</p>', '</br><p class="truncar">', description, '</p>') AS html,
        resource, starred, autor, unidad, sala, type, timestamp
       FROM recursos
       WHERE type = 'cal' AND unidad = ? AND sala = ? AND DATE(date) >= CURDATE() AND hidden = '0'
       GROUP BY date, title, description, timestamp, sala
       ORDER BY date`,
      [unidad, sala]
    )
  }

  const groupClause = type === 'news' ? 'GROUP BY timestamp' : ''
  return legacyQuery<(DaycareResource & RowDataPacket)[]>(
    `SELECT id, starred, title, description, date, timestamp, resource, autor, unidad, sala, type
     FROM recursos
     WHERE type = ? AND sala = ? AND unidad = ? AND hidden = 0
     ${groupClause}
     ORDER BY id DESC`,
    [type, sala, unidad]
  )
}



export async function getFamilyChildren(user: AppSessionUser): Promise<AuthorizedChild[]> {
  const currentMatricula = assertFamilyMatricula(user)
  const columnSet = await getMatriculaColumnSet()
  const userColumnSet = await getUsersColumnSet()
  const currentSelect = [
    `${matriculaSelect(columnSet, 'matricula')} AS matricula`,
    `${matriculaSelect(columnSet, 'apellido_paterno')} AS apellido_paterno`,
    `${matriculaSelect(columnSet, 'apellido_materno')} AS apellido_materno`,
    `${matriculaSelect(columnSet, 'nombres')} AS nombres`,
    `${matriculaSelect(columnSet, 'grupo')} AS grupo`,
    `${matriculaSelect(columnSet, 'grado')} AS grado`,
    `${matriculaSelect(columnSet, 'nivel')} AS nivel`,
    `${lightweightPhotoSelect(matriculaSelect(columnSet, 'foto'))} AS foto`,
    `${matriculaSelect(columnSet, PARENT_SIGNATURE_COLUMN)} AS parent_signature`,
    ...REQUIRED_PARENT_NAME_FIELDS.map((field) => `${matriculaSelect(columnSet, field)} AS ${field}`),
    `${matriculaSelect(columnSet, 'email_padre')} AS email_padre`,
    `${matriculaSelect(columnSet, 'email_madre')} AS email_madre`,
    `${usersSelect(userColumnSet, 'id')} AS user_id`,
    `${usersSelect(userColumnSet, 'campus')} AS campus`
  ].join(',\n       ')

  const current = await legacyOne<RowDataPacket>(
    `SELECT
       ${currentSelect}
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE m.matricula = ?
     LIMIT 1`,
    [currentMatricula]
  )

  if (!current) {
    logPersonasWarning('siblings-current-matricula-not-found', { userId: user.id, matricula: currentMatricula })
    return []
  }

  const currentChild = mapMatriculaChild({ ...current, user_id: current.user_id || user.id, campus: current.campus || user.campus } as RowDataPacket, currentMatricula, user.campus || user.empresa, user)
  const unavailableCurrent = (context: Record<string, unknown>) => [{ ...currentChild, siblingMatch: 'unavailable' as const, canSwitch: false, siblingDiagnostics: context }]

  const missingParentColumns = REQUIRED_PARENT_NAME_FIELDS.filter((field) => !columnSet.has(field))
  if (missingParentColumns.length) {
    logPersonasWarning('siblings-required-parent-columns-missing', { userId: user.id, matricula: currentMatricula, missingColumns: missingParentColumns })
    return unavailableCurrent({ code: 'missing-parent-columns' })
  }

  const missingParentValues = missingRequiredParentFields(current as Partial<Record<ParentNameField, unknown>>)
  const signature = completeParentSignature(current as Partial<Record<ParentNameField, unknown>>)
  if (!signature) {
    logPersonasDebug('siblings-parent-signature-incomplete', { userId: user.id, matricula: currentMatricula, missingFields: missingParentValues })
    return unavailableCurrent({ code: 'incomplete-parent-signature', missingFields: missingParentValues })
  }

  if (!columnSet.has(PARENT_SIGNATURE_COLUMN)) {
    logPersonasDebug('siblings-parent-signature-index-missing', { userId: user.id, matricula: currentMatricula, column: PARENT_SIGNATURE_COLUMN })
    return unavailableCurrent({ code: 'signature-index-missing' })
  }

  const signatureKey = String(current.parent_signature || '') || signature
  const candidateSelect = [
    `${matriculaSelect(columnSet, 'matricula')} AS matricula`,
    `${matriculaSelect(columnSet, 'apellido_paterno')} AS apellido_paterno`,
    `${matriculaSelect(columnSet, 'apellido_materno')} AS apellido_materno`,
    `${matriculaSelect(columnSet, 'nombres')} AS nombres`,
    `${matriculaSelect(columnSet, 'grupo')} AS grupo`,
    `${matriculaSelect(columnSet, 'grado')} AS grado`,
    `${matriculaSelect(columnSet, 'nivel')} AS nivel`,
    `${lightweightPhotoSelect(matriculaSelect(columnSet, 'foto'))} AS foto`,
    ...REQUIRED_PARENT_NAME_FIELDS.map((field) => `${matriculaSelect(columnSet, field)} AS ${field}`),
    `${matriculaSelect(columnSet, 'email_padre')} AS email_padre`,
    `${matriculaSelect(columnSet, 'email_madre')} AS email_madre`,
    `${usersSelect(userColumnSet, 'id')} AS user_id`,
    `${usersSelect(userColumnSet, 'campus')} AS campus`
  ].join(',\n       ')

  const candidates = await legacyQuery<RowDataPacket[]>(
    `SELECT
       ${candidateSelect}
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE m.${quoteIdentifier(PARENT_SIGNATURE_COLUMN)} = ?
       AND m.matricula <> ?
     ORDER BY m.apellido_paterno ASC, m.apellido_materno ASC, m.nombres ASC
     LIMIT 7`,
    [signatureKey, currentMatricula]
  )

  const seen = new Set<string>([currentChild.matricula || String(currentChild.user_id || '')])
  const children = [
    currentChild,
    ...candidates
      .map((row) => mapMatriculaChild(row, currentMatricula, user.campus || user.empresa, user))
      .filter((child) => {
        const key = child.matricula || String(child.user_id || '')
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
  ]

  if (children.length <= 1) {
    logPersonasDebug('siblings-no-additional-matches', { userId: user.id, matricula: currentMatricula, searchedCandidates: candidates.length })
  }

  if (children.length > 6) {
    logPersonasWarning('siblings-parent-signature-review-required', { userId: user.id, matricula: currentMatricula, matchedChildren: children.length })
    return children.map((child) => child.isCurrent ? child : { ...child, canSwitch: false, siblingMatch: 'review' as const })
  }

  return children
}

export async function getAdminResources(user: AppSessionUser, salaId: number, type: 'hw' | 'news' | 'cal') {
  const sala = await getSalaById(user, salaId)
  const rows = await legacyQuery<(DaycareResource & RowDataPacket)[]>(
    `SELECT id, starred, hidden, title, description, date, timestamp, resource, autor, unidad, sala, type
     FROM recursos
     WHERE type = ? AND sala = ? AND unidad = ?
     ORDER BY hidden ASC, date DESC, id DESC`,
    [type, salaId, sala.unidad]
  )
  return { sala, rows }
}

export async function upsertAdminResource(user: AppSessionUser, payload: AdminResourcePayload) {
  const sala = await getSalaById(user, Number(payload.sala))
  const data = {
    id: payload.id,
    title: payload.title,
    description: payload.description || '',
    date: payload.date || null,
    resource: payload.resource || null,
    autor: payload.autor || user.displayName || user.email,
    unidad: sala.unidad,
    sala: String(sala.id),
    type: payload.type,
    starred: payload.starred ? 1 : 0,
    hidden: isHiddenValue(payload.hidden) ? 1 : 0,
    timestamp: payload.timestamp || new Date().toISOString().slice(0, 19).replace('T', ' ')
  }

  if (data.id) {
    const existing = await legacyOne<RowDataPacket>('SELECT id, unidad, sala, type FROM recursos WHERE id = ? LIMIT 1', [data.id])
    if (!existing) throw publicError(404, 'Recurso no encontrado')
    if (String(existing.unidad) !== data.unidad || String(existing.sala) !== data.sala || String(existing.type) !== data.type) {
      throw publicError(403, 'Recurso fuera del alcance de esta sala')
    }

    await legacyWrite(
      `UPDATE recursos
       SET title = ?, description = ?, date = ?, resource = ?, autor = ?, starred = ?, hidden = ?, timestamp = ?
       WHERE id = ? AND sala = ? AND unidad = ? AND type = ?`,
      [data.title, data.description, data.date, data.resource, data.autor, data.starred, data.hidden, data.timestamp, data.id, data.sala, data.unidad, data.type]
    )
    return { ...data, id: data.id }
  }

  const result = await legacyWrite(
    `INSERT INTO recursos (title, description, date, resource, autor, unidad, sala, type, starred, hidden, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.title, data.description, data.date, data.resource, data.autor, data.unidad, data.sala, data.type, data.starred, data.hidden, data.timestamp]
  )
  return { ...data, id: result.insertId }
}

async function assertAdminResourceAccess(user: AppSessionUser, id: number) {
  const row = await legacyOne<RowDataPacket>('SELECT id, unidad, sala, type FROM recursos WHERE id = ? LIMIT 1', [id])
  if (!row) throw publicError(404, 'Recurso no encontrado')
  assertUnidadAccess(user, String(row.unidad))
  assertSalaAccess(user, String(row.sala))
  return row
}

export async function setAdminResourceHidden(user: AppSessionUser, id: number, hidden: boolean) {
  await assertAdminResourceAccess(user, id)
  await legacyWrite('UPDATE recursos SET hidden = ? WHERE id = ?', [hidden ? 1 : 0, id])
  return { ok: true, id, hidden: hidden ? 1 : 0 }
}

export async function deleteAdminResource(user: AppSessionUser, id: number) {
  await assertAdminResourceAccess(user, id)
  await legacyWrite('DELETE FROM recursos WHERE id = ?', [id])
  return { ok: true, id }
}

export async function getFamilyAccounts(user: AppSessionUser, salaId: number) {
  const sala = await getSalaById(user, salaId)
  const rows = await legacyQuery<(FamilyAccount & RowDataPacket)[]>(
    `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala
     FROM users
     WHERE FIND_IN_SET(?, REPLACE(COALESCE(unidad, ''), ' ', '')) > 0
       AND FIND_IN_SET(?, REPLACE(COALESCE(role, ''), ' ', '')) > 0
       AND CAST(sala AS CHAR) = CAST(? AS CHAR)
     ORDER BY id ASC`,
    [sala.unidad, DAYCARE_FAMILY_ROLE, salaId]
  )
  return { sala, rows }
}

export async function upsertFamilyAccount(user: AppSessionUser, payload: FamilyAccountPayload) {
  const sala = await getSalaById(user, Number(payload.sala))
  const role = DAYCARE_FAMILY_ROLE

  if (payload.id) {
    const existing = await legacyOne<RowDataPacket>('SELECT id, role, unidad, sala FROM users WHERE id = ? LIMIT 1', [payload.id])
    if (!existing) throw publicError(404, 'Cuenta familiar no encontrada')

    const existingRoles = String(existing.role || '').split(',').map((item) => item.trim()).filter(Boolean)
    const existingUnidades = String(existing.unidad || '').split(',').map((item) => item.trim()).filter(Boolean)
    const sameSala = String(existing.sala || '') === String(sala.id)
    const sameUnidad = existingUnidades.includes(sala.unidad)

    if (!hasRoleToken(existingRoles, DAYCARE_FAMILY_ROLE) || !sameSala || !sameUnidad) {
      throw publicError(403, 'Cuenta familiar fuera del alcance de esta sala')
    }

    await legacyWrite(
      `UPDATE users
       SET nombre_nino = ?, username = ?, email = ?, plaintext = ?, role = ?, unidad = ?, sala = ?
       WHERE id = ?`,
      [payload.nombre_nino || null, payload.username, payload.email, payload.plaintext || null, role, sala.unidad, String(sala.id), payload.id]
    )
    return { ...payload, role, unidad: sala.unidad, sala: String(sala.id) }
  }

  const result = await legacyWrite(
    `INSERT INTO users (nombre_nino, username, email, plaintext, role, unidad, sala)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [payload.nombre_nino || null, payload.username, payload.email, payload.plaintext || null, role, sala.unidad, String(sala.id)]
  )
  return { ...payload, id: result.insertId, role, unidad: sala.unidad, sala: String(sala.id) }
}

export async function getAuthorizedPersonas(user: AppSessionUser) {
  const [peopleRows, children] = await Promise.all([
    legacyQuery<(AuthorizedPerson & RowDataPacket)[]>(
      `SELECT
         p.id,
         CAST(p.id AS CHAR) qr,
         p.indice,
         p.paternoP,
         p.maternoP,
         p.nombreP,
         p.parenP,
         ${lightweightPhotoSelect('p.foto')} AS foto,
         ${lightweightPhotoSelect('p.compressed_foto')} AS compressed_foto,
         p.fechaP,
         p.user_id
       FROM personas_autorizadas p
       INNER JOIN (
         SELECT MIN(id) AS id
         FROM personas_autorizadas
         WHERE user_id = ? AND indice BETWEEN 1 AND 4
         GROUP BY indice
       ) selected ON selected.id = p.id
       ORDER BY p.indice ASC, p.id ASC`,
      [user.id]
    ),
    getFamilyChildren(user)
  ])

  const bySlot = new Map<number, AuthorizedPerson & RowDataPacket>()
  for (const person of peopleRows) {
    const indice = Number(person.indice)
    if (indice >= 1 && indice <= 4 && !bySlot.has(indice)) bySlot.set(indice, person)
  }

  return [1, 2, 3, 4].map((indice) => {
    const person = bySlot.get(indice)
    return {
      ...(person || {}),
      indice,
      id: person?.id ? Number(person.id) : null,
      children
    }
  })
}


export async function upsertAuthorizedPersona(user: AppSessionUser, payload: AuthorizedPersonPayload) {
  const indice = Number(payload.indice || 1)
  if (indice < 1 || indice > 4) {
    throw publicError(400, 'Índice de persona autorizada inválido')
  }

  const values = {
    paternoP: normalizeString(payload.paternoP),
    maternoP: normalizeString(payload.maternoP),
    nombreP: normalizeString(payload.nombreP),
    parenP: normalizeString(payload.parenP),
    foto: normalizeString(payload.foto),
    compressed_foto: normalizeString(payload.compressed_foto),
    fechaP: normalizeString(payload.fechaP)
  }

  if (payload.id) {
    const existingById = await legacyOne<RowDataPacket>('SELECT id, user_id FROM personas_autorizadas WHERE id = ? LIMIT 1', [payload.id])
    if (!existingById) throw publicError(404, 'Persona autorizada no encontrada')
    assertFamilyOwner(user, existingById.user_id as number)
    throw publicError(409, AUTHORIZE_RECAPTURE_MESSAGE)
  }

  const existingSlot = await legacyOne<RowDataPacket>('SELECT id, user_id FROM personas_autorizadas WHERE user_id = ? AND indice = ? ORDER BY id ASC LIMIT 1', [user.id, indice])
  if (existingSlot) {
    assertFamilyOwner(user, existingSlot.user_id as number)
    throw publicError(409, AUTHORIZE_RECAPTURE_MESSAGE)
  }

  const result = await legacyWrite(
    `INSERT INTO personas_autorizadas (indice, paternoP, maternoP, nombreP, parenP, foto, compressed_foto, fechaP, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [indice, values.paternoP, values.maternoP, values.nombreP, values.parenP, values.foto, values.compressed_foto, values.fechaP, user.id]
  )

  return { ...payload, id: result.insertId, indice, user_id: user.id, qr: String(result.insertId) }
}

export async function deleteAuthorizedPersona(user: AppSessionUser, id: number) {
  const existing = await legacyOne<RowDataPacket>('SELECT id, user_id FROM personas_autorizadas WHERE id = ? LIMIT 1', [id])
  if (!existing) throw publicError(404, 'Persona autorizada no encontrada')
  assertFamilyOwner(user, existing.user_id as number)
  await legacyWrite('DELETE FROM personas_autorizadas WHERE id = ? AND user_id = ?', [id, user.id])
  return { ok: true }
}

export async function getCredentialAuthorizedPersona(user: AppSessionUser, id: number) {
  const row = await legacyOne<(PrintableAuthorizedPerson & RowDataPacket)>(
    `SELECT
       A.id,
       CAST(A.id AS CHAR) AS qr,
       A.indice,
       A.paternoP,
       A.maternoP,
       A.nombreP,
       A.parenP,
       ${lightweightPhotoSelect('A.foto')} AS foto,
       ${lightweightPhotoSelect('A.compressed_foto')} AS compressed_foto,
       A.fechaP,
       A.user_id,
       IFNULL(MAX(IFNULL(m.nivel, B.nivelEdu)), 'preescolar') AS nivelEdu,
       UPPER(MAX(u.username)) AS matricula,
       MAX(CASE
         WHEN LEFT(UPPER(u.username), 5) = 'PREEM' THEN 'PREEM'
         WHEN LEFT(UPPER(u.username), 5) = 'PREET' THEN 'PREET'
         WHEN LEFT(UPPER(u.username), 2) = 'DM' THEN 'CM'
         ELSE LEFT(UPPER(u.username), 2)
       END) AS plantel,
       MAX(CONCAT_WS(' ', IFNULL(m.nombres, B.nombreA), IFNULL(m.apellido_paterno, B.paternoA), IFNULL(m.apellido_materno, B.maternoA))) AS fullnameA,
       MAX(${lightweightPhotoSelect('IFNULL(c.foto, IFNULL(m.foto, B.foto))')}) AS fotoA,
       MAX(IFNULL(m.grado, B.grado)) AS gradoA,
       MAX(IFNULL(m.grupo, B.grupo)) AS grupoA
     FROM personas_autorizadas A
     LEFT JOIN users u ON u.id = A.user_id
     LEFT JOIN alumno_pa B ON A.user_id = B.user_id
     LEFT JOIN matricula m ON UPPER(u.username) = UPPER(m.matricula)
     LEFT JOIN credenciales c ON UPPER(u.username) = UPPER(c.matricula)
     WHERE A.id = ?
     GROUP BY A.id`,
    [id]
  )
  if (!row) throw publicError(404, 'Persona autorizada no encontrada')
  assertFamilyOwner(user, row.user_id)
  row.children = await getFamilyChildren(user)
  const currentChild = row.children.find((child) => child.isCurrent) || row.children?.[0] || null
  row.child = currentChild
  row.matricula = normalizeMatricula(row.matricula || currentChild?.matricula || user.username) || null
  row.fullnameA = row.fullnameA || [currentChild?.nombreA, currentChild?.paternoA, currentChild?.maternoA].filter(Boolean).join(' ') || null
  row.fotoA = row.fotoA || currentChild?.foto || null
  row.gradoA = row.gradoA || currentChild?.grado || null
  row.grupoA = row.grupoA || currentChild?.grupo || null
  row.nivelEdu = row.nivelEdu || currentChild?.nivelEdu || null
  row.plantel = row.plantel || currentChild?.plantel || derivePlantelFromMatricula(row.matricula, row.nivelEdu, user.campus || user.empresa)
  return row
}

export async function getScanAuthorizedPersona(id: number) {
  const fotoP = lightweightPhotoSelect('p.foto')
  const compressedFotoP = lightweightPhotoSelect('p.compressed_foto')
  const rows = await legacyQuery<(ScanAuthorizedPerson & RowDataPacket)[]>(
    `SELECT
       CONCAT(p.nombreP, ' ', p.paternoP, ' ', p.maternoP) AS fullnameP,
       CASE
         WHEN ${fotoP} IS NOT NULL THEN ${fotoP}
         WHEN ${compressedFotoP} LIKE '%vision=marks-ok%' AND (${compressedFotoP} LIKE 'http%' OR ${compressedFotoP} LIKE '/uploads/%') THEN ${compressedFotoP}
         WHEN ${compressedFotoP} LIKE '%vision=marks-ok%' THEN CONCAT('https://admin.casitaiedis.edu.mx/virtual/', ${compressedFotoP})
         ELSE ''
       END AS fotoP,
       CONCAT(IFNULL(m.nombres, a.nombreA), ' ', IFNULL(m.apellido_paterno, a.paternoA), ' ', IFNULL(m.apellido_materno, a.maternoA)) AS fullnameA,
       MAX(${lightweightPhotoSelect('c.foto')}) AS fotoA,
       IFNULL(m.grado, a.grado) AS gradoA,
       IFNULL(m.grupo, a.grupo) AS grupoA,
       p.parenP AS parentesco,
       UPPER(u.username) AS matricula,
       CASE
         WHEN LEFT(UPPER(u.username), 5) = 'PREEM' THEN 'PREEM'
         WHEN LEFT(UPPER(u.username), 5) = 'PREET' THEN 'PREET'
         WHEN LEFT(UPPER(u.username), 2) = 'DM' THEN 'CM'
         ELSE LEFT(UPPER(u.username), 2)
       END AS plantel,
       SUBSTRING_INDEX(LOWER(a.nivelEdu), ' ', 1) AS nivelEduA
     FROM personas_autorizadas p
     LEFT JOIN users u ON u.id = p.user_id
     LEFT JOIN alumno_pa a ON u.id = a.user_id
     LEFT JOIN matricula m ON u.username = m.matricula
     LEFT JOIN credenciales c ON u.username = c.matricula
     WHERE p.id = ?
     GROUP BY p.id`,
    [id]
  )
  if (!rows.length) throw publicError(404, 'No se encontró el registro')
  return rows[0]
}

async function getSalaMetrics(sala: Sala) {
  const [familyRow, resourceRow] = await Promise.all([
    legacyOne<RowDataPacket>(
      `SELECT COUNT(*) AS familias
       FROM users
       WHERE FIND_IN_SET(?, REPLACE(COALESCE(unidad, ''), ' ', '')) > 0
         AND FIND_IN_SET(?, REPLACE(COALESCE(role, ''), ' ', '')) > 0
         AND CAST(sala AS CHAR) = CAST(? AS CHAR)`,
      [sala.unidad, DAYCARE_FAMILY_ROLE, sala.id]
    ),
    legacyOne<RowDataPacket>(
      `SELECT
        SUM(CASE WHEN type = 'hw' THEN 1 ELSE 0 END) AS tareas,
        SUM(CASE WHEN type = 'news' THEN 1 ELSE 0 END) AS avisos,
        SUM(CASE WHEN type = 'cal' THEN 1 ELSE 0 END) AS calendario,
        COUNT(*) AS totalRecursos,
        MAX(COALESCE(timestamp, date)) AS lastResourceAt
       FROM recursos
       WHERE sala = ? AND unidad = ? AND hidden = 0`,
      [sala.id, sala.unidad]
    )
  ])

  return {
    familias: Number(familyRow?.familias || 0),
    tareas: Number(resourceRow?.tareas || 0),
    avisos: Number(resourceRow?.avisos || 0),
    calendario: Number(resourceRow?.calendario || 0),
    totalRecursos: Number(resourceRow?.totalRecursos || 0),
    lastResourceAt: resourceRow?.lastResourceAt ? String(resourceRow.lastResourceAt) : null
  }
}

export async function getSalasOverviewForUnidad(user: AppSessionUser, unidad: string) {
  const salas = await getSalasForUnidad(user, unidad)
  return Promise.all(salas.map(async (sala) => ({
    ...sala,
    metrics: await getSalaMetrics(sala)
  })))
}

export async function getSalaOperationalOverview(user: AppSessionUser, salaId: number) {
  const sala = await getSalaById(user, salaId)
  const [metrics, latestResources, latestFamilies] = await Promise.all([
    getSalaMetrics(sala),
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT id, starred, title, description, date, timestamp, resource, autor, unidad, sala, type
       FROM recursos
       WHERE sala = ? AND unidad = ? AND hidden = 0
       ORDER BY id DESC
       LIMIT 6`,
      [sala.id, sala.unidad]
    ),
    legacyQuery<(FamilyAccount & RowDataPacket)[]>(
      `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala
       FROM users
       WHERE FIND_IN_SET(?, REPLACE(COALESCE(unidad, ''), ' ', '')) > 0
         AND FIND_IN_SET(?, REPLACE(COALESCE(role, ''), ' ', '')) > 0
         AND CAST(sala AS CHAR) = CAST(? AS CHAR)
       ORDER BY id DESC
       LIMIT 5`,
      [sala.unidad, DAYCARE_FAMILY_ROLE, sala.id]
    )
  ])

  return { sala, metrics, latestResources, latestFamilies }
}
