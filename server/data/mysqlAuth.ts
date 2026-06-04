import bcrypt from 'bcryptjs'
import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser, FamilyProductScope, FamilyProductScopes, LegacyRoutePermission, SessionKind } from '~/types/session'
import type { SuperAdminDirectoryResponse, SuperAdminDirectoryScope, SuperAdminUserSummary } from '~/types/superadmin'
import { csvToList, legacyQuery, legacyWrite } from '~/server/utils/mysql'
import { isConfiguredSuperAdminEmail, normalizeEmail } from '~/utils/superAdmin'

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
    A.plantel,
    A.campus,
    A.empresa,
    A.unidad,
    A.sala,
    EXISTS(SELECT 1 FROM alumno_pa AP WHERE AP.user_id = A.id LIMIT 1) AS has_alumno_pa,
    EXISTS(SELECT 1 FROM personas_autorizadas PA WHERE PA.user_id = A.id LIMIT 1) AS has_personas_autorizadas
  FROM users AS A
  LEFT JOIN rutas_rol AS B ON (A.role = B.role)
`

export async function findLegacyUserByEmail(email: string) {
  const rows = await legacyQuery<LegacyUserRow[]>(`${baseUserSql} WHERE A.email = ?`, [email])
  return hydrateUserRows(rows)
}

export async function findLegacyUserById(id: number) {
  const rows = await legacyQuery<LegacyUserRow[]>(`${baseUserSql} WHERE A.id = ?`, [id])
  return hydrateUserRows(rows)
}

export async function findLegacyFamilyByLogin(login: string) {
  const rows = await legacyQuery<LegacyUserRow[]>(`${baseUserSql} WHERE A.email = ? OR A.username = ?`, [login, login])
  return hydrateUserRows(rows)
}

export async function validateLegacyPassword(candidate: string, user: { password?: string | null; pwd?: string | null }) {
  if (!candidate) return false
  if (user.pwd && candidate === user.pwd) return true
  if (user.password && user.password === candidate) return true
  if (user.password && /^\$2[ayb]\$/.test(user.password)) {
    return bcrypt.compare(candidate, user.password)
  }
  return false
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
    productScopes: [],
    scopes: {},
    anonymous: false,
    loggedin: true
  }

  return session
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
      const roles = csvToList(first.role)
      const unidades = csvToList(first.unidad)
      const plantel = csvToList(first.plantel)
      const familyScopes = kind === 'family' ? resolveFamilyProductScopes(first, routes, roles, unidades) : {}
      const productScopes = Object.keys(familyScopes) as FamilyProductScope[]
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
  const hasDaycareRole = roles.some((role) => role.toUpperCase().includes('HUSKY'))

  if (hasDaycareRole && sala && unidad) {
    scopes.daycare = { product: 'daycare', sala, unidad }
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

function normalizeLegacyScope(value?: string | null) {
  const normalized = String(value || '').trim()
  return normalized || null
}


export async function listSuperAdminDirectory(filters: { plantel?: string; search?: string; scope?: SuperAdminDirectoryScope; limit?: number } = {}): Promise<SuperAdminDirectoryResponse> {
  const plantel = normalizeLegacyScope(filters.plantel)
  const search = normalizeLegacyScope(filters.search)
  const scope: SuperAdminDirectoryScope = filters.scope || 'all'
  const limit = Math.min(Math.max(Number(filters.limit || 120), 25), 250)
  const queryLimit = scope === 'all' ? limit : Math.min(Math.max(limit * 6, 250), 1000)
  const where: string[] = []
  const params: Array<string | number> = []

  if (plantel) {
    where.push(`(
      FIND_IN_SET(?, A.plantel) OR FIND_IN_SET(?, A.unidad) OR
      A.plantel = ? OR A.unidad = ? OR A.campus = ? OR A.empresa = ?
    )`)
    params.push(plantel, plantel, plantel, plantel, plantel, plantel)
  }

  if (search) {
    where.push(`(
      A.email LIKE ? OR A.username LIKE ? OR A.displayName LIKE ? OR A.nombre_nino LIKE ? OR
      A.role LIKE ? OR A.sala LIKE ? OR A.unidad LIKE ? OR A.plantel LIKE ? OR A.campus LIKE ?
    )`)
    const like = `%${search}%`
    params.push(like, like, like, like, like, like, like, like, like)
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
      A.plantel,
      A.campus,
      A.empresa,
      A.unidad,
      A.sala,
      A.nombre_nino
     FROM users AS A
     ${whereSql}
     ORDER BY COALESCE(NULLIF(A.plantel, ''), NULLIF(A.unidad, ''), A.campus, A.empresa, '') ASC, A.id DESC
     LIMIT ${queryLimit}`,
    params
  )

  const userIds = rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id))
  const routeMap = await loadDirectoryRoutes(rows)
  const personasUserIds = await loadPersonasAutorizadasUserIds(userIds)
  const alumnoUserIds = await loadAlumnoPaUserIds(userIds)

  const plantelRows = await legacyQuery<DirectoryPlantelRow[]>(
    `SELECT plantel, unidad, campus
     FROM users
     WHERE plantel IS NOT NULL OR unidad IS NOT NULL OR campus IS NOT NULL
     ORDER BY plantel ASC, unidad ASC, campus ASC
     LIMIT 5000`
  )

  const users = rows.map((row) => directoryRowToSummary({
    ...row,
    routes: routesForDirectoryRow(row, routeMap).join('||'),
    has_alumno_pa: alumnoUserIds.has(Number(row.id)) ? 1 : 0,
    has_personas_autorizadas: personasUserIds.has(Number(row.id)) ? 1 : 0
  }))
  const visibleUsers = filterDirectoryUsersByScope(users, scope).slice(0, limit)
  const planteles = Array.from(new Set(plantelRows.flatMap((row) => [
    ...csvToList(row.plantel),
    ...csvToList(row.unidad),
    normalizeLegacyScope(row.campus)
  ]).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'es'))

  return {
    planteles,
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


function filterDirectoryUsersByScope(users: SuperAdminUserSummary[], scope: SuperAdminDirectoryScope) {
  if (scope === 'daycare') return users.filter((user) => user.productScopes.includes('daycare'))
  if (scope === 'schoolFamilies') return users.filter((user) => user.productScopes.includes('personasAutorizadas'))
  if (scope === 'internal') return users.filter((user) => user.audience === 'internal' || user.adminScopes.length)
  if (scope === 'impersonable') return users.filter((user) => user.canImpersonate)
  return users
}

function directoryRowToSummary(row: DirectoryUserRow): SuperAdminUserSummary {
  const roles = csvToList(row.role)
  const unidad = csvToList(row.unidad)
  const plantel = csvToList(row.plantel)
  const routes = String(row.routes || '').split('||').map((route) => route.trim()).filter(Boolean)
  const hasDaycareRole = roles.some((role) => role.toUpperCase().includes('HUSKY'))
  const hasDaycareAdminRoute = routes.some((route) => /guarder[ií]a|husky|daycare/i.test(route))
  const hasPersonasRoute = routes.some((route) => /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|validar/i.test(route))
  const hasPersonasData = Number(row.has_alumno_pa) === 1 || Number(row.has_personas_autorizadas) === 1
  const productScopes: FamilyProductScope[] = []

  if (hasDaycareRole && unidad.length && normalizeLegacyScope(row.sala)) productScopes.push('daycare')
  if (hasPersonasRoute || hasPersonasData) productScopes.push('personasAutorizadas')

  const adminScopes: string[] = []
  if ((hasDaycareRole || hasDaycareAdminRoute) && unidad.length) adminScopes.push('daycare')

  let audience: SuperAdminUserSummary['audience'] = 'unknown'
  if (productScopes.length > 1) audience = 'multiProductFamily'
  else if (productScopes.includes('daycare')) audience = 'daycareFamily'
  else if (productScopes.includes('personasAutorizadas')) audience = 'schoolFamily'
  else if (roles.length || routes.length) audience = 'internal'

  return {
    id: Number(row.id),
    email: normalizeLegacyScope(row.email),
    username: normalizeLegacyScope(row.username),
    displayName: normalizeLegacyScope(row.displayName),
    picture: normalizeLegacyScope(row.picture),
    role: normalizeLegacyScope(row.role),
    plantel,
    campus: normalizeLegacyScope(row.campus),
    empresa: normalizeLegacyScope(row.empresa),
    unidad,
    sala: normalizeLegacyScope(row.sala),
    nombre_nino: normalizeLegacyScope(row.nombre_nino),
    routes,
    productScopes,
    adminScopes,
    audience,
    canImpersonate: productScopes.length > 0
  }
}
