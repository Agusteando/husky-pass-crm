import { createError, defineEventHandler, readBody, setCookie } from 'h3'
import { z } from 'zod'
import { findLegacyUserById } from '~/server/data/mysqlAuth'
import { isSuperAdmin } from '~/server/utils/authz'
import { getAppSession, setAppSession } from '~/server/utils/session'
import { adminOrigin } from '~/server/utils/impersonation'

const schema = z.object({ userId: z.coerce.number().int().positive(), returnTo: z.string().optional() })

export default defineEventHandler(async (event) => {
  const current = getAppSession(event).user
  if (!current) throw createError({ statusCode: 401, statusMessage: 'Sesión no válida' })
  if (!isSuperAdmin(current)) {
    throw createError({ statusCode: 403, statusMessage: 'La impersonación de cuentas está reservada para superadmin' })
  }

  const body = schema.parse(await readBody(event))
  const returnTo = safeAdminReturnTo(body.returnTo, '/admin/superadmin')
  const legacyUser = await findLegacyUserById(body.userId)
  if (!legacyUser) throw createError({ statusCode: 404, statusMessage: 'Cuenta familiar no encontrada' })

  const familyUser = legacyUser.toSession('family')
  if (!familyUser.productScopes.length) {
    throw createError({ statusCode: 403, statusMessage: 'La cuenta no tiene acceso familiar habilitado' })
  }

  familyUser.impersonation = {
    startedAt: Date.now(),
    mode: 'account',
    admin: adminOrigin(current),
    returnTo
  }

  setAppSession(event, familyUser)
  setCookie(event, 'user_segment', familyUser.productScopes.includes('daycare') ? 'daycare' : 'premium', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })

  return { user: familyUser, loggedin: true }
})


function safeAdminReturnTo(value: string | undefined, fallback: string) {
  if (!value) return fallback
  if (!value.startsWith('/admin/')) return fallback
  if (value.startsWith('/admin/login')) return fallback
  if (/^\/admin\/daycare(\/|$)/.test(value) || /^\/admin\/superadmin(\?|$|\/)/.test(value)) return value
  return fallback
}
