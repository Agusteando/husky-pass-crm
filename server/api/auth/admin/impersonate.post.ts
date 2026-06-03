import { z } from 'zod'
import type { AdminImpersonationOrigin, AppSessionUser } from '~/types/session'
import { findLegacyUserById } from '~/server/data/mysqlAuth'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getAppSession, setAppSession } from '~/server/utils/session'

const schema = z.object({ userId: z.coerce.number().int().positive() })

function assertImpersonationScope(admin: AppSessionUser, family: AppSessionUser) {
  const daycare = family.scopes.daycare
  if (daycare?.unidad && admin.unidades.includes(daycare.unidad)) return

  throw createError({ statusCode: 403, statusMessage: 'Cuenta familiar fuera del alcance administrativo' })
}

function adminOrigin(user: AppSessionUser): AdminImpersonationOrigin {
  return {
    id: user.id,
    kind: 'admin',
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    picture: user.picture,
    campus: user.campus,
    empresa: user.empresa,
    sala: user.sala,
    roles: user.roles,
    unidades: user.unidades,
    plantel: user.plantel,
    routes: user.routes,
    productScopes: [],
    scopes: {},
    anonymous: false,
    loggedin: true
  }
}

export default defineEventHandler(async (event) => {
  const current = getAppSession(event).user
  if (!current) throw createError({ statusCode: 401, statusMessage: 'Sesión no válida' })
  assertDaycareAdmin(current)

  const body = schema.parse(await readBody(event))
  const legacyUser = await findLegacyUserById(body.userId)
  if (!legacyUser) throw createError({ statusCode: 404, statusMessage: 'Cuenta familiar no encontrada' })

  const familyUser = legacyUser.toSession('family')
  if (!familyUser.productScopes.length) {
    throw createError({ statusCode: 403, statusMessage: 'La cuenta no tiene acceso familiar habilitado' })
  }
  assertImpersonationScope(current, familyUser)

  familyUser.impersonation = {
    startedAt: Date.now(),
    admin: adminOrigin(current)
  }

  setAppSession(event, familyUser)
  setCookie(event, 'user_segment', familyUser.productScopes.includes('daycare') ? 'daycare' : 'premium', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })

  return { user: familyUser, loggedin: true }
})
