import { defineEventHandler, readBody, setCookie } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { findLegacyUserById } from '~/server/data/mysqlAuth'
import { isSuperAdmin } from '~/server/utils/authz'
import { getAppSession, setAppSession } from '~/server/utils/session'
import { adminOrigin } from '~/server/utils/impersonation'

const schema = z.object({ userId: z.coerce.number().int().positive() })

export default defineEventHandler(async (event) => {
  const current = getAppSession(event).user
  if (!current) throw publicError(401, 'Sesión no válida')
  if (!isSuperAdmin(current)) {
    throw publicError(403, 'La impersonación de cuentas está reservada para superadmin')
  }

  const body = schema.parse(await readBody(event))
  const legacyUser = await findLegacyUserById(body.userId)
  if (!legacyUser) throw publicError(404, 'Cuenta familiar no encontrada')

  const familyUser = legacyUser.toSession('family')
  if (!familyUser.productScopes.length) {
    throw publicError(403, 'La cuenta no tiene acceso familiar habilitado')
  }

  familyUser.impersonation = {
    startedAt: Date.now(),
    mode: 'account',
    admin: adminOrigin(current)
  }

  setAppSession(event, familyUser)
  setCookie(event, 'user_segment', familyUser.productScopes.includes('daycare') ? 'guarderia' : 'escolar', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })

  return { user: familyUser, loggedin: true }
})
