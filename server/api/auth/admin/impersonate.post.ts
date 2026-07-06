import { defineEventHandler, readBody, setCookie } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import type { AppSessionUser } from '~/types/session'
import type { GestionEscolarScope } from '~/types/gestionEscolar'
import { isSuperAdmin } from '~/server/utils/authz'
import { findLegacyUserById } from '~/server/data/mysqlAuth'
import { getAppSession, setAppSession } from '~/server/utils/session'
import { adminOrigin } from '~/server/utils/impersonation'
import { auditGestionImpersonation, canGestionImpersonateFamily } from '~/server/data/gestionEscolar'
import { hasDaycareAdminScope } from '~/utils/sessionScopes'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({ userId: z.coerce.number().int().positive() })

type SupportScope =
  | { kind: 'superadmin'; auditScope: { isGlobal: true }; segment: 'escolar' | 'guarderia' }
  | { kind: 'school'; auditScope: GestionEscolarScope; segment: 'escolar' }
  | { kind: 'daycare'; segment: 'guarderia' }

function hasInternalRole(roles: string[]) {
  return roles.some((role) => /ROLE_HUSKY(?!_USER)|GESTION_ESCOLAR|COMUNICADOS|ACCESOS/i.test(role))
}

function targetSegment(target: AppSessionUser): 'escolar' | 'guarderia' {
  if (target.productScopes.includes('personasAutorizadas')) return 'escolar'
  return 'guarderia'
}

async function resolveFamilySupportScope(actor: AppSessionUser, target: AppSessionUser): Promise<SupportScope> {
  if (isSuperAdmin(actor)) {
    return { kind: 'superadmin', auditScope: { isGlobal: true }, segment: targetSegment(target) }
  }

  if (target.productScopes.includes('personasAutorizadas')) {
    const eligibility = await canGestionImpersonateFamily(actor, target.id)
    if (eligibility.allowed) return { kind: 'school', auditScope: eligibility.scope || { isGlobal: false }, segment: 'escolar' }
  }

  const daycare = target.scopes.daycare
  if (daycare && hasDaycareAdminScope(actor) && actor.unidades.includes(daycare.unidad)) {
    return { kind: 'daycare', segment: 'guarderia' }
  }

  throw publicError(403, 'Esta familia esta fuera del alcance administrativo de tu cuenta.')
}

export default defineEventHandler(async (event) => {
  const current = getAppSession(event).user
  if (!current) throw publicError(401, 'Sesión no válida')
  if (current.kind !== 'admin') throw publicError(403, 'La vista de soporte requiere una sesión administrativa.')

  const body = parseOrBadRequest(schema, await readBody(event), 'Indica una familia valida para iniciar la vista de soporte.')
  const legacy = await findLegacyUserById(body.userId)
  if (!legacy) throw publicError(404, 'Cuenta familiar no encontrada')

  const familyUser = legacy.toSession('family')
  if (hasInternalRole(familyUser.roles) || !familyUser.productScopes.length) {
    throw publicError(403, 'Solo se puede abrir vista de soporte para cuentas familiares.')
  }

  const supportScope = await resolveFamilySupportScope(current, familyUser)
  if (supportScope.kind === 'school') {
    await auditGestionImpersonation({ actorUserId: current.id, targetUserId: body.userId, action: 'start', reason: 'Soporte Gestion Escolar', scope: supportScope.auditScope })
  } else if (supportScope.kind === 'superadmin') {
    await auditGestionImpersonation({ actorUserId: current.id, targetUserId: body.userId, action: 'start', reason: 'Soporte Superadmin', scope: supportScope.auditScope })
  }

  familyUser.impersonation = {
    startedAt: Date.now(),
    mode: 'account',
    admin: adminOrigin(current)
  }

  setAppSession(event, familyUser)
  setCookie(event, 'user_segment', supportScope.segment, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })

  return { user: familyUser, loggedin: true }
})
