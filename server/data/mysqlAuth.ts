import bcrypt from 'bcryptjs'
import type { RowDataPacket } from 'mysql2/promise'
import type { AdminProductScope, AppSessionUser, FamilyProductScope, FamilyProductScopes, LegacyRoutePermission, SessionKind } from '~/types/session'
import type { SuperAdminDirectoryResponse, SuperAdminDirectoryScope, SuperAdminRoleAssignments, SuperAdminSchoolScope, SuperAdminUserSummary } from '~/types/superadmin'
import { csvToList, legacyOne, legacyQuery, legacyTransaction, legacyWrite } from '~/server/utils/mysql'
import { displayMatriculaCandidate } from '~/utils/matricula'
import { SCHOOL_PLANTELES, normalizeSchoolGrade, normalizeSchoolPlantel, schoolGradesForPlantel, schoolPlantelSqlFromMatricula } from '~/utils/schoolCatalog'
import { isConfiguredSuperAdminEmail, normalizeEmail } from '~/utils/superAdmin'
import { DAYCARE_ADMIN_ROLE, DAYCARE_FAMILY_ROLE, MARKETING_ADMIN_ROLE, SCHOOL_ADMIN_ROLE, hasRoleToken } from '~/utils/sessionScopes'
import { publicError } from '~/server/utils/httpError'

interface LegacyUserRow extends RowDataPacket {
  id: number
  email: string | null
  username: string | null
  password: string | null
  pwd: string | null
  picture: string | null
  role: string | null
  route: string | null
  icono: string | null
  displayName: string | null
  plantel: string | null
  campus: string | null
  empresa: string | null
  unidad: string | null
  sala: string | null
  salaName: string | null
  has_alumno_pa: number | boolean | null
  has_personas_autorizadas: number | boolean | null
}

interface UnidadRow extends RowDataPacket {
  unidad: string | null
}

interface DirectoryUserRow extends RowDataPacket {
  id: number
  email: string | null
  username: string | null
  picture: string | null
  role: string | null
  displayName: string | null
  plantel: string | null
  campus: string | null
  empresa: string | null
  unidad: string | null
  sala: string | null
  salaName: string | null
  nombre_nino: string | null
  routes: string | null
  has_alumno_pa: number | boolean | null
  has_personas_autorizadas: number | boolean | null
}

interface DirectoryPlantelRow extends RowDataPacket {
  plantel: string | null
  unidad: string | null
  campus: string | null
}

interface DirectoryRouteRow extends RowDataPacket {
  role: string | null
  route: string | null
}

interface DirectoryUserIdRow extends RowDataPacket {
  user_id: number | string | null
}

interface DirectorySchoolScopeRow extends RowDataPacket {
  user_id: number | string | null
  plantel: string | null
  nivel: string | null
  grado: string | null
}

interface DirectorySchoolOptionRow extends RowDataPacket {
  plantel: string | null
  grado: string | null
}

const baseUserSql = `
  SELECT
    A.id,
    A.email,
    A.username,
    A.password,
    A.plaintext AS pwd,
    A.picture,
    A.role,
    B.route,
    B.icono,
    A.displayName,
    NULL AS plantel,
    A.campus,
    A.empresa,
    A.unidad,
    A.sala,
    S.sala AS salaName,
    EXISTS(SELECT 1 FROM alumno_pa AP WHERE AP.user_id = A.id LIMIT 1) AS has_alumno_pa,
    EXISTS(SELECT 1 FROM personas_autorizadas PA WHERE PA.user_id = A.id LIMIT 1) AS has_personas_autorizadas
  FROM users AS A
  LEFT JOIN salas AS S ON S.id = CAST(A.sala AS UNSIGNED)
  LEFT JOIN rutas_rol AS B ON (FIND_IN_SET(B.role, REPLACE(COALESCE(A.role, ''), ' ', '')) > 0)
`

const RETIRED_HUSKY_ADMIN_ROLE_PATTERN = /^ROLE_HUSKY_.+/i

function normalizeAdminRoleTokens(roles: string[]) {
  const normalized = new Set<string>()
  let hasRetiredSchoolAdminToken = false

  for (const role of roles.map((item) => item.trim().toUpperCase()).filter(Boolean)) {
    if (role === DAYCARE_FAMILY_ROLE) {
      normalized.add(DAYCARE_FAMILY_ROLE)
      continue
    }
    if (role === DAYCARE_ADMIN_ROLE) {
      normalized.add(DAYCARE_ADMIN_ROLE)
      continue
    }
    if (role === SCHOOL_ADMIN_ROLE) {
      normalized.add(SCHOOL_ADMIN_ROLE)
      continue
    }
    if (role === MARKETING_ADMIN_ROLE) {
      normalized.add(MARKETING_ADMIN_ROLE)
      continue
    }
    if (RETIRED_HUSKY_ADMIN_ROLE_PATTERN.test(role)) {
      hasRetiredSchoolAdminToken = true
      continue
    }
    normalized.add(role)
  }

  if (hasRetiredSchoolAdminToken) normalized.add(SCHOOL_ADMIN_ROLE)
  return Array.from(normalized)
}

export async function findLegacyUserByEmail(email: string) {
  const rows = await legacyQuery<LegacyUserRow[]>(`${baseUserSql} WHERE LOWER(A.email) = ?`, [normalizeEmail(email)])
  return hydrateUserRows(rows)
}

export async function findLegacyUserById(id: number) {
  const rows = await legacyQuery<LegacyUserRow[]>(`${baseUserSql} WHERE A.id = ?`, [id])
  return hydrateUserRows(rows)
}

export async function findLegacyFamilyByLogin(login: string) {
  const candidates = await findLegacyUsersByLogin(login)
  return candidates.length === 1 ? candidates[0] : null
}

export async function authenticateLegacyFamily(login: string, password: string) {
  const candidates = await findLegacyUsersByLogin(login)
  const matches: typeof candidates = []

  for (const candidate of candidates) {
    if (await validateLegacyPassword(password, candidate.raw)) {
      matches.push(candidate)
    }
  }

  return matches.length === 1 ? matches[0] : null
}

async function findLegacyUsersByLogin(login: string) {
  const trimmedLogin = login.trim()
  if (!trimmedLogin) return []

  const rows = await legacyQuery<LegacyUserRow[]>(
    `${baseUserSql} WHERE LOWER(A.email) = ? OR A.username = ? ORDER BY A.id ASC`,
    [normalizeEmail(trimmedLogin), trimmedLogin]
  )

  return hydrateUserCandidates(rows)
}

export async function findLegacyFamilyByEmail(email: string) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null
  const rows = await legacyQuery<LegacyUserRow[]>(`${baseUserSql} WHERE LOWER(A.email) = ?`, [normalized])
  const legacyUser = hydrateUserRows(rows)
  if (!legacyUser) return null
  const sessionUser = legacyUser.toSession('family')
  return sessionUser.productScopes.length ? legacyUser : null
}

export async function findLegacyFamilyById(id: number) {
  if (!Number.isFinite(id)) return null
  const legacyUser = await findLegacyUserById(id)
  if (!legacyUser) return null
  const sessionUser = legacyUser.toSession('family')
  return sessionUser.productScopes.length ? legacyUser : null
}

export async function validateLegacyPassword(candidate: string, user: { password?: string | null; pwd?: string | null }) {
  if (!candidate) return false
  if (user.password && /^\$2[ayb]\$/.test(user.password)) {
    return bcrypt.compare(candidate, user.password)
  }
  if (user.password && user.password === candidate) return true
  if (user.pwd && candidate === user.pwd) return true
  return false
}

export async function hashLegacyPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function updateLegacyFamilyPassword(userId: number, password: string) {
  const passwordHash = await hashLegacyPassword(password)
  await legacyWrite('UPDATE users SET password = ?, plaintext = NULL WHERE id = ?', [passwordHash, userId])
}

export async function updateLegacyDisplayName(userId: number, displayName: string) {
  await legacyWrite('UPDATE users SET displayName = ? WHERE id = ?', [displayName, userId])
}

export async function getAllDaycareUnidades() {
  const rows = await legacyQuery<UnidadRow[]>(
    `SELECT DISTINCT unidad
     FROM salas
     WHERE unidad IS NOT NULL AND unidad <> ''
     ORDER BY unidad ASC`
  )
  return rows.map((row) => String(row.unidad || '').trim()).filter(Boolean)
}

export async function createSuperAdminSession(input: { email: string; displayName?: string | null; picture?: string | null }, legacyUser: NonNullable<ReturnType<typeof hydrateUserRows>>) {
  const unidades = await getAllDaycareUnidades()
  const fromLegacy = legacyUser.toSession('admin')
  const routes = fromLegacy.routes

  const session: AppSessionUser = {
    id: fromLegacy.id,
    kind: 'admin',
    isSuperAdmin: true,
    email: normalizeEmail(input.email),
    username: fromLegacy.username,
    displayName: input.displayName || fromLegacy.displayName,
    picture: input.picture || fromLegacy.picture,
    campus: fromLegacy.campus,
    empresa: fromLegacy.empresa,
    sala: fromLegacy.sala,
    roles: fromLegacy.roles,
    unidades: unidades.length ? unidades : fromLegacy.unidades,
    plantel: fromLegacy.plantel,
    routes,
    productScopes: ['superAdmin', 'daycareAdmin', 'schoolAdmin', 'marketingAdmin'],
    scopes: {},
    anonymous: false,
    loggedin: true
  }

  return session
}

function hydrateUserCandidates(rows: LegacyUserRow[]) {
  const rowsByUser = new Map<number, LegacyUserRow[]>()

  for (const row of rows) {
    const userId = Number(row.id)
    const userRows = rowsByUser.get(userId) || []
    userRows.push(row)
    rowsByUser.set(userId, userRows)
  }

  return Array.from(rowsByUser.values())
    .map((userRows) => hydrateUserRows(userRows))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
}

function hydrateUserRows(rows: LegacyUserRow[]) {
  const first = rows[0]
  if (!first) return null

  const routes: LegacyRoutePermission[] = rows
    .filter((row) => row.route)
    .map((row) => ({ route: String(row.route), icono: row.icono }))

  return {
    raw: first,
    toSession(kind: SessionKind): AppSessionUser {
      const roles = normalizeAdminRoleTokens(csvToList(first.role))
      const unidades = csvToList(first.unidad)
      const plantel = csvToList(first.plantel)
      const familyScopes = kind === 'family' ? resolveFamilyProductScopes(first, routes, roles, unidades) : {}
      const productScopes = kind === 'family'
        ? Object.keys(familyScopes) as FamilyProductScope[]
        : resolveAdminProductScopes(first, routes, roles, unidades)
      const email = normalizeEmail(first.email)

      return {
        id: Number(first.id),
        kind,
        isSuperAdmin: kind === 'admin' && isConfiguredSuperAdminEmail(email),
        email,
        username: first.username,
        displayName: first.displayName,
        picture: first.picture,
        campus: first.campus,
        empresa: first.empresa,
        sala: first.sala,
        roles,
        unidades,
        plantel,
        routes,
        productScopes,
        scopes: familyScopes,
        anonymous: false,
        loggedin: true
      }
    }
  }
}

function resolveFamilyProductScopes(
  row: LegacyUserRow,
  routes: LegacyRoutePermission[],
  roles: string[],
  unidades: string[]
): FamilyProductScopes {
  const scopes: FamilyProductScopes = {}
  const sala = normalizeLegacyScope(row.sala)
  const unidad = unidades[0]
  const hasDaycareRole = hasRoleToken(roles, DAYCARE_FAMILY_ROLE)

  if (hasDaycareRole && sala && unidad) {
    scopes.daycare = { product: 'daycare', sala, unidad, salaName: resolvedSalaName(row.salaName, sala) }
  }

  const hasPersonasRoute = routes.some((route) => /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|validar/i.test(route.route))
  const hasPersonasData = Number(row.has_alumno_pa) === 1 || Number(row.has_personas_autorizadas) === 1
  if (hasPersonasRoute || hasPersonasData) {
    scopes.personasAutorizadas = {
      product: 'personasAutorizadas',
      legacyRoute: routes.find((route) => /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|validar/i.test(route.route))?.route || null
    }
  }

  return scopes
}

function resolveAdminProductScopes(
  row: LegacyUserRow,
  _routes: LegacyRoutePermission[],
  roles: string[],
  unidades: string[]
): AdminProductScope[] {
  const scopes: AdminProductScope[] = []
  if (hasRoleToken(roles, DAYCARE_ADMIN_ROLE) && unidades.length) {
    scopes.push('daycareAdmin')
  }
  if (hasRoleToken(roles, SCHOOL_ADMIN_ROLE)) {
    scopes.push('schoolAdmin')
  }
  if (hasRoleToken(roles, MARKETING_ADMIN_ROLE)) {
    scopes.push('marketingAdmin')
  }
  if (isConfiguredSuperAdminEmail(normalizeEmail(row.email))) {
    scopes.push('superAdmin')
  }
  return Array.from(new Set(scopes))
}

function normalizeLegacyScope(value?: string | null) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function resolvedSalaName(value: string | null | undefined, legacySala: string | null | undefined) {
  const joinedName = normalizeLegacyScope(value)
  if (joinedName) return joinedName
  const legacyValue = normalizeLegacyScope(legacySala)
  return legacyValue && !/^\d+$/.test(legacyValue) ? legacyValue : null
}


export async function listSuperAdminDirectory(filters: { plantel?: string; search?: string; scope?: SuperAdminDirectoryScope; limit?: number } = {}): Promise<SuperAdminDirectoryResponse> {
  const plantel = normalizeLegacyScope(filters.plantel)
  const search = normalizeLegacyScope(filters.search)
  const scope: SuperAdminDirectoryScope = filters.scope || 'all'
  const limit = Math.min(Math.max(Number(filters.limit || 120), 25), 250)
  const queryLimit = limit
  const where: string[] = []
  const params: Array<string | number> = []

  const scopePredicate = directoryScopePredicate(scope)
  if (scopePredicate) where.push(scopePredicate)

  const normalizedPlantel = normalizeSchoolPlantel(plantel)
  if (normalizedPlantel) {
    where.push(`${schoolPlantelSqlFromMatricula('A.username')} = ?`)
    params.push(normalizedPlantel)
  }

  if (search) {
    where.push(`(
      A.email LIKE ? OR A.username LIKE ? OR A.displayName LIKE ? OR A.nombre_nino LIKE ? OR
      A.role LIKE ? OR A.sala LIKE ? OR S.sala LIKE ? OR A.unidad LIKE ? OR A.campus LIKE ? OR A.empresa LIKE ?
    )`)
    const like = `%${search}%`
    params.push(like, like, like, like, like, like, like, like, like, like)
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const rows = await legacyQuery<DirectoryUserRow[]>(
    `SELECT
      A.id,
      A.email,
      A.username,
      A.picture,
      A.role,
      A.displayName,
      NULL AS plantel,
      A.campus,
      A.empresa,
      A.unidad,
      A.sala,
      S.sala AS salaName,
      A.nombre_nino
     FROM users AS A
     LEFT JOIN salas AS S ON S.id = CAST(A.sala AS UNSIGNED)
     ${whereSql}
     ORDER BY COALESCE(NULLIF(A.unidad, ''), A.campus, A.empresa, '') ASC, A.id DESC
     LIMIT ${queryLimit}`,
    params
  )

  const plantelRows = await legacyQuery<DirectoryPlantelRow[]>(
    `SELECT NULL AS plantel, unidad, campus
     FROM users
     WHERE unidad IS NOT NULL OR campus IS NOT NULL
     ORDER BY unidad ASC, campus ASC
     LIMIT 5000`
  )
  const schoolOptions = await loadSchoolDirectoryOptions()

  const users = await summarizeDirectoryRows(rows)
  const visibleUsers = filterDirectoryUsersByScope(users, scope).slice(0, limit)
  const planteles = schoolOptions.planteles
  const unidades = Array.from(new Set(plantelRows.flatMap((row) => csvToList(row.unidad)).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))

  return {
    planteles,
    unidades,
    grados: schoolOptions.grados,
    users: visibleUsers,
    metrics: {
      total: visibleUsers.length,
      familyUsers: visibleUsers.filter((user) => user.productScopes.length > 0).length,
      daycareFamilies: visibleUsers.filter((user) => user.productScopes.includes('daycare')).length,
      schoolFamilies: visibleUsers.filter((user) => user.productScopes.includes('personasAutorizadas')).length,
      internalUsers: visibleUsers.filter((user) => user.audience === 'internal' || user.adminScopes.length).length,
      daycareAdmins: visibleUsers.filter((user) => user.adminScopes.includes('daycare')).length,
      impersonable: visibleUsers.filter((user) => user.canImpersonate).length
    },
    filters: {
      plantel: plantel || '',
      search: search || '',
      scope,
      limit
    }
  }
}

async function summarizeDirectoryRows(rows: DirectoryUserRow[]) {
  const userIds = rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id))
  const routeMap = await loadDirectoryRoutes(rows)
  const schoolScopeMap = await loadSchoolScopeMap(userIds)
  const personasUserIds = await loadPersonasAutorizadasUserIds(userIds)
  const alumnoUserIds = await loadAlumnoPaUserIds(userIds)

  return rows.map((row) => directoryRowToSummary({
    ...row,
    routes: routesForDirectoryRow(row, routeMap).join('||'),
    has_alumno_pa: alumnoUserIds.has(Number(row.id)) ? 1 : 0,
    has_personas_autorizadas: personasUserIds.has(Number(row.id)) ? 1 : 0
  }, schoolScopeMap.get(Number(row.id)) || []))
}

export async function getSuperAdminUserSummaryById(userId: number) {
  const rows = await legacyQuery<DirectoryUserRow[]>(
    `SELECT
      A.id,
      A.email,
      A.username,
      A.picture,
      A.role,
      A.displayName,
      NULL AS plantel,
      A.campus,
      A.empresa,
      A.unidad,
      A.sala,
      S.sala AS salaName,
      A.nombre_nino
     FROM users AS A
     LEFT JOIN salas AS S ON S.id = CAST(A.sala AS UNSIGNED)
     WHERE A.id = ?
     LIMIT 1`,
    [userId]
  )
  const users = await summarizeDirectoryRows(rows)
  return users[0] || null
}

async function loadSchoolDirectoryOptions() {
  const rows = await legacyQuery<DirectorySchoolOptionRow[]>(
    `SELECT DISTINCT ${schoolPlantelSqlFromMatricula('matricula')} AS plantel, grado
     FROM matricula
     WHERE matricula IS NOT NULL AND TRIM(CAST(matricula AS CHAR)) <> ''
     ORDER BY plantel ASC, grado ASC
     LIMIT 5000`
  ).catch(() => [] as DirectorySchoolOptionRow[])

  const gradesByPlantel = new Map<string, Set<string>>()
  for (const row of rows) {
    const plantel = normalizeSchoolPlantel(row.plantel)
    if (!plantel) continue
    const grade = normalizeSchoolGrade(row.grado, plantel)
    if (!grade) continue
    const set = gradesByPlantel.get(plantel) || new Set<string>()
    set.add(grade)
    gradesByPlantel.set(plantel, set)
  }

  const grados = Array.from(new Set(SCHOOL_PLANTELES.flatMap((plantel) => {
    const observed = Array.from(gradesByPlantel.get(plantel) || [])
    return observed.length ? observed : schoolGradesForPlantel(plantel)
  }))).sort((a, b) => schoolGradesForPlantel('PM').indexOf(a as any) - schoolGradesForPlantel('PM').indexOf(b as any))

  return {
    planteles: [...SCHOOL_PLANTELES],
    grados
  }
}

function normalizeSchoolScopes(values: unknown): SuperAdminSchoolScope[] {
  const raw = Array.isArray(values) ? values : []
  const byKey = new Map<string, SuperAdminSchoolScope>()
  for (const value of raw) {
    if (!value || typeof value !== 'object') continue
    const item = value as { plantel?: unknown; nivel?: unknown; grado?: unknown }
    const plantel = normalizeSchoolPlantel(String(item.plantel || ''))
    if (!plantel) continue
    const grado = normalizeSchoolGrade(String(item.grado || ''), plantel)
    const key = [plantel, grado || ''].join('|')
    byKey.set(key, { plantel, nivel: null, grado })
  }
  return Array.from(byKey.values()).slice(0, 30)
}

function roleCtrlScopeKey(scope: SuperAdminSchoolScope) {
  return [scope.plantel, scope.grado || ''].join('|')
}

async function loadSchoolScopeMap(userIds: number[]) {
  const ids = Array.from(new Set(userIds.filter((id) => Number.isFinite(id))))
  if (!ids.length) return new Map<number, SuperAdminSchoolScope[]>()
  const placeholders = ids.map(() => '?').join(',')
  const rows = await legacyQuery<DirectorySchoolScopeRow[]>(
    `SELECT DISTINCT user_id, plantel, nivel, grado
     FROM gestion_escolar_permissions
     WHERE user_id IN (${placeholders})
       AND enabled = 1
       AND is_global = 0
       AND plantel IS NOT NULL
       AND TRIM(CAST(plantel AS CHAR)) <> ''
     ORDER BY plantel ASC, nivel ASC, grado ASC`,
    ids
  ).catch(() => [] as DirectorySchoolScopeRow[])

  const map = new Map<number, SuperAdminSchoolScope[]>()
  for (const row of rows) {
    const userId = Number(row.user_id)
    if (!Number.isFinite(userId)) continue
    const scope = normalizeSchoolScopes([{ plantel: row.plantel, nivel: row.nivel, grado: row.grado }])[0]
    if (!scope) continue
    const existing = map.get(userId) || []
    if (!existing.some((item) => roleCtrlScopeKey(item) === roleCtrlScopeKey(scope))) {
      existing.push(scope)
      map.set(userId, existing)
    }
  }
  return map
}

async function replaceSchoolScopes(
  client: { write: (sql: string, params?: Array<string | number | boolean | null>) => Promise<unknown> },
  actor: AppSessionUser,
  userId: number,
  enabled: boolean,
  scopes: SuperAdminSchoolScope[]
) {
  await client.write('DELETE FROM gestion_escolar_permissions WHERE user_id = ?', [userId])
  if (!enabled) return
  for (const scope of scopes) {
    await client.write(
      `INSERT INTO gestion_escolar_permissions (user_id, capability, enabled, is_global, plantel, nivel, grado, grupo, assigned_by, updated_by, created_at, updated_at)
       VALUES (?, ?, 1, 0, ?, ?, ?, NULL, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
      [userId, 'role_ctrl', scope.plantel, scope.nivel || null, scope.grado || null, actor.id, actor.id]
    )
  }
}

function normalizeRoleUnidadList(values: unknown) {
  const raw = Array.isArray(values) ? values : []
  return Array.from(new Set(raw.map((value) => normalizeLegacyScope(String(value || '').toUpperCase())).filter(Boolean) as string[])).slice(0, 30)
}

function toggleRoleToken(roles: Set<string>, token: string, enabled: boolean) {
  if (enabled) roles.add(token)
  else roles.delete(token)
}

export async function setSuperAdminRoleAssignmentsForUser(actor: AppSessionUser, userId: number, input: { roles: SuperAdminRoleAssignments; unidades?: string[]; schoolScopes?: SuperAdminSchoolScope[] }) {
  const target = await legacyOne<RowDataPacket & { id: number; email: string | null; role: string | null; unidad: string | null }>(
    'SELECT id, email, role, unidad FROM users WHERE id = ? LIMIT 1',
    [userId]
  )
  if (!target) throw publicError(404, 'Usuario no encontrado.')

  const targetEmail = normalizeEmail(target.email)
  const currentRoles = normalizeAdminRoleTokens(csvToList(String(target.role || '')))
  const isInternalTarget = targetEmail.endsWith('@casitaiedis.edu.mx') || currentRoles.some((role) => role !== DAYCARE_FAMILY_ROLE)
  const wantsAdminAccess = Boolean(input.roles.schoolAdmin || input.roles.daycareAdmin || input.roles.marketingAdmin)

  if (isConfiguredSuperAdminEmail(targetEmail) || Number(target.id) === Number(actor.id)) {
    throw publicError(400, 'El Super Admin base no se modifica desde Usuarios.')
  }

  if (wantsAdminAccess && !isInternalTarget) {
    throw publicError(403, 'Solo cuentas institucionales o internas pueden recibir roles administrativos.')
  }

  const schoolScopes = normalizeSchoolScopes(input.schoolScopes)
  const unidades = normalizeRoleUnidadList(input.unidades)

  if (input.roles.schoolAdmin && !schoolScopes.length) {
    throw publicError(400, 'Selecciona al menos un plantel para Admin escolar.')
  }

  if (input.roles.daycareAdmin && !unidades.length) {
    throw publicError(400, 'Selecciona al menos una unidad para Admin guarderia.')
  }

  const roles = new Set(currentRoles.filter((role) => !RETIRED_HUSKY_ADMIN_ROLE_PATTERN.test(role)))
  toggleRoleToken(roles, SCHOOL_ADMIN_ROLE, Boolean(input.roles.schoolAdmin))
  toggleRoleToken(roles, DAYCARE_ADMIN_ROLE, Boolean(input.roles.daycareAdmin))
  toggleRoleToken(roles, MARKETING_ADMIN_ROLE, Boolean(input.roles.marketingAdmin))

  await legacyTransaction(async (tx) => {
    const nextUnidad = input.roles.daycareAdmin ? unidades.join(',') : String(target.unidad || '')
    await tx.write('UPDATE users SET role = ?, unidad = ? WHERE id = ?', [Array.from(roles).join(','), nextUnidad || null, userId])
    await replaceSchoolScopes(tx, actor, userId, Boolean(input.roles.schoolAdmin), schoolScopes)
  })

  const updated = await getSuperAdminUserSummaryById(userId)
  if (!updated) throw publicError(404, 'Usuario actualizado, pero no fue posible recargarlo.')
  return updated
}

async function loadDirectoryRoutes(rows: DirectoryUserRow[]) {
  const roles = Array.from(new Set(rows.flatMap((row) => csvToList(row.role))))
  if (!roles.length) return new Map<string, string[]>()
  const placeholders = roles.map(() => '?').join(',')
  const routeRows = await legacyQuery<DirectoryRouteRow[]>(
    `SELECT role, route FROM rutas_rol WHERE role IN (${placeholders}) ORDER BY route ASC`,
    roles
  )
  const routeMap = new Map<string, string[]>()
  for (const row of routeRows) {
    const role = normalizeLegacyScope(row.role)
    const route = normalizeLegacyScope(row.route)
    if (!role || !route) continue
    const existing = routeMap.get(role) || []
    existing.push(route)
    routeMap.set(role, existing)
  }
  return routeMap
}

function routesForDirectoryRow(row: DirectoryUserRow, routeMap: Map<string, string[]>) {
  return Array.from(new Set(csvToList(row.role).flatMap((role) => routeMap.get(role) || [])))
}

async function loadPersonasAutorizadasUserIds(userIds: number[]) {
  if (!userIds.length) return new Set<number>()
  const placeholders = userIds.map(() => '?').join(',')
  const rows = await legacyQuery<DirectoryUserIdRow[]>(
    `SELECT DISTINCT user_id FROM personas_autorizadas WHERE user_id IN (${placeholders})`,
    userIds
  )
  return new Set(rows.map((row) => Number(row.user_id)).filter((id) => Number.isFinite(id)))
}

async function loadAlumnoPaUserIds(userIds: number[]) {
  if (!userIds.length) return new Set<number>()
  const placeholders = userIds.map(() => '?').join(',')
  const rows = await legacyQuery<DirectoryUserIdRow[]>(
    `SELECT DISTINCT user_id FROM alumno_pa WHERE user_id IN (${placeholders})`,
    userIds
  )
  return new Set(rows.map((row) => Number(row.user_id)).filter((id) => Number.isFinite(id)))
}


function directoryScopePredicate(scope: SuperAdminDirectoryScope) {
  if (scope === 'daycare') {
    return `(
      FIND_IN_SET('${DAYCARE_FAMILY_ROLE}', REPLACE(COALESCE(A.role, ''), ' ', '')) > 0 AND
      A.sala IS NOT NULL AND TRIM(CAST(A.sala AS CHAR)) <> '' AND
      A.unidad IS NOT NULL AND TRIM(CAST(A.unidad AS CHAR)) <> ''
    )`
  }

  if (scope === 'schoolFamilies') {
    return `(
      A.id IN (SELECT DISTINCT user_id FROM personas_autorizadas WHERE user_id IS NOT NULL) OR
      A.id IN (SELECT DISTINCT user_id FROM alumno_pa WHERE user_id IS NOT NULL)
    )`
  }

  if (scope === 'impersonable') {
    return `(
      (
        FIND_IN_SET('${DAYCARE_FAMILY_ROLE}', REPLACE(COALESCE(A.role, ''), ' ', '')) > 0 AND
        A.sala IS NOT NULL AND TRIM(CAST(A.sala AS CHAR)) <> '' AND
        A.unidad IS NOT NULL AND TRIM(CAST(A.unidad AS CHAR)) <> ''
      ) OR
      A.id IN (SELECT DISTINCT user_id FROM personas_autorizadas WHERE user_id IS NOT NULL) OR
      A.id IN (SELECT DISTINCT user_id FROM alumno_pa WHERE user_id IS NOT NULL)
    )`
  }

  if (scope === 'internal') {
    return `(
      LOWER(COALESCE(A.email, '')) LIKE '%@casitaiedis.edu.mx' OR
      A.role IS NOT NULL AND TRIM(CAST(A.role AS CHAR)) <> '' AND
      A.role <> '${DAYCARE_FAMILY_ROLE}'
    )`
  }

  return ''
}


function filterDirectoryUsersByScope(users: SuperAdminUserSummary[], scope: SuperAdminDirectoryScope) {
  if (scope === 'daycare') return users.filter((user) => user.productScopes.includes('daycare'))
  if (scope === 'schoolFamilies') return users.filter((user) => user.productScopes.includes('personasAutorizadas'))
  if (scope === 'internal') return users.filter((user) => user.audience === 'internal' || user.adminScopes.length)
  if (scope === 'impersonable') return users.filter((user) => user.canImpersonate)
  return users
}

function directoryRowToSummary(row: DirectoryUserRow, schoolScopes: SuperAdminSchoolScope[] = []): SuperAdminUserSummary {
  const roles = normalizeAdminRoleTokens(csvToList(row.role))
  const unidad = csvToList(row.unidad)
  const plantel = csvToList(row.plantel)
  const routes = String(row.routes || '').split('||').map((route) => route.trim()).filter(Boolean)
  const hasDaycareFamilyRole = hasRoleToken(roles, DAYCARE_FAMILY_ROLE)
  const hasDaycareInternalRole = hasRoleToken(roles, DAYCARE_ADMIN_ROLE)
  const hasSchoolInternalRole = hasRoleToken(roles, SCHOOL_ADMIN_ROLE)
  const hasMarketingInternalRole = hasRoleToken(roles, MARKETING_ADMIN_ROLE)
  const hasPersonasRoute = routes.some((route) => /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|validar/i.test(route))
  const hasPersonasData = Number(row.has_alumno_pa) === 1 || Number(row.has_personas_autorizadas) === 1
  const productScopes: FamilyProductScope[] = []

  if (hasDaycareFamilyRole && unidad.length && normalizeLegacyScope(row.sala)) productScopes.push('daycare')
  if (hasPersonasRoute || hasPersonasData) productScopes.push('personasAutorizadas')

  const adminScopes: string[] = []
  if (hasDaycareInternalRole && unidad.length) adminScopes.push('daycare')
  if (hasSchoolInternalRole) adminScopes.push('school')
  if (hasMarketingInternalRole) adminScopes.push('marketing')

  const normalizedEmail = normalizeEmail(row.email)
  const canManageAdminRoles = normalizedEmail.endsWith('@casitaiedis.edu.mx') || adminScopes.length > 0
  const roleAssignments: SuperAdminRoleAssignments = {
    daycareAdmin: hasDaycareInternalRole,
    schoolAdmin: hasSchoolInternalRole,
    marketingAdmin: hasMarketingInternalRole
  }

  let audience: SuperAdminUserSummary['audience'] = 'unknown'
  if (productScopes.length > 1) audience = 'multiProductFamily'
  else if (productScopes.includes('daycare')) audience = 'daycareFamily'
  else if (productScopes.includes('personasAutorizadas')) audience = 'schoolFamily'
  else if (adminScopes.length || canManageAdminRoles || roles.some((role) => !hasRoleToken([role], DAYCARE_FAMILY_ROLE))) audience = 'internal'

  return {
    id: Number(row.id),
    email: normalizeLegacyScope(row.email),
    username: displayMatriculaCandidate(normalizeLegacyScope(row.username)),
    displayName: normalizeLegacyScope(row.displayName),
    picture: normalizeLegacyScope(row.picture),
    role: roles.join(',') || null,
    plantel,
    campus: normalizeLegacyScope(row.campus),
    empresa: normalizeLegacyScope(row.empresa),
    unidad,
    sala: normalizeLegacyScope(row.sala),
    salaName: resolvedSalaName(row.salaName, row.sala),
    nombre_nino: normalizeLegacyScope(row.nombre_nino),
    routes,
    productScopes,
    adminScopes,
    schoolScopes,
    audience,
    canImpersonate: productScopes.length > 0,
    canManageAdminRoles,
    roleAssignments
  }
}
