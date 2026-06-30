import { defineEventHandler, readBody, setCookie } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { getAppSession, setAppSession } from '~/server/utils/session'
import { adminOrigin } from '~/server/utils/impersonation'
import { assertTargetIsFamilyOnly, auditGestionImpersonation, canGestionImpersonateFamily } from '~/server/data/gestionEscolar'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({ userId: z.coerce.number().int().positive() })

export default defineEventHandler(async (event) => {
  const current = getAppSession(event).user
  if (!current) throw publicError(401, 'Sesión no válida')

  const body = parseOrBadRequest(schema, await readBody(event), 'Indica una familia valida para iniciar la vista de soporte.')
  const { familyUser } = await assertTargetIsFamilyOnly(body.userId)
  if (!isSuperAdmin(current)) {
    const eligibility = await canGestionImpersonateFamily(current, body.userId)
    if (!eligibility.allowed) {
      await auditGestionImpersonation({ actorUserId: current.id, targetUserId: body.userId, action: 'denied', reason: eligibility.reason || 'Fuera de alcance' })
      throw publicError(403, eligibility.reason || 'No tienes permiso para ver esta familia.')
    }
    await auditGestionImpersonation({ actorUserId: current.id, targetUserId: body.userId, action: 'start', reason: 'Soporte Gestion Escolar', scope: eligibility.scope })
  } else {
    await auditGestionImpersonation({ actorUserId: current.id, targetUserId: body.userId, action: 'start', reason: 'Soporte Superadmin', scope: { isGlobal: true } })
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
