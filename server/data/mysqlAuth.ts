import bcrypt from 'bcryptjs'
import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser, FamilyProductScope, FamilyProductScopes, LegacyRoutePermission, SessionKind } from '~/types/session'
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
