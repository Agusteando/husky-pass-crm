import type { AppSessionUser, FamilyProductScope } from '~/types/session'
import { publicError } from '~/server/utils/httpError'
import {
  DAYCARE_ADMIN_ROLE,
  effectiveAdminUser,
  hasDaycareAdminScope,
  hasFamilyScope,
  hasMarketingAdminScope,
  hasRoleToken,
  hasSchoolAdminScope
} from '~/utils/sessionScopes'

export function hasFamilyProductScope(user: AppSessionUser, scope: FamilyProductScope) {
  return hasFamilyScope(user, scope)
}

export function isSuperAdmin(user: AppSessionUser | null | undefined) {
  return Boolean(effectiveAdminUser(user)?.isSuperAdmin)
}

export function assertSuperAdmin(user: AppSessionUser) {
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo Super Admin puede realizar esta acción.')
}

export function assertDaycareFamily(user: AppSessionUser) {
  if (!hasFamilyProductScope(user, 'daycare')) {
    throw publicError(403, 'Acceso de guardería no autorizado')
  }
}

export function assertPersonasAutorizadasFamily(user: AppSessionUser) {
  if (!hasFamilyProductScope(user, 'personasAutorizadas')) {
    throw publicError(403, 'Acceso escolar familiar no autorizado')
  }
}

export function assertDaycareAdmin(user: AppSessionUser) {
  if (user.kind !== 'admin') {
    throw publicError(403, 'Acceso administrativo no autorizado')
  }

  if (isSuperAdmin(user)) return

  if (!hasDaycareAdminScope(user) || !hasRoleToken(user.roles, DAYCARE_ADMIN_ROLE)) {
    throw publicError(403, 'La cuenta no tiene unidad de guardería asignada')
  }
}

export function assertSchoolAdmin(user: AppSessionUser) {
  if (user.kind !== 'admin') {
    throw publicError(403, 'Acceso administrativo no autorizado')
  }

  if (isSuperAdmin(user)) return

  if (!hasSchoolAdminScope(user)) {
    throw publicError(403, 'La cuenta no tiene rol escolar asignado')
  }
}

export function assertMarketingAdmin(user: AppSessionUser) {
  if (user.kind !== 'admin') {
    throw publicError(403, 'Acceso de Mercadotecnia no autorizado')
  }

  if (isSuperAdmin(user)) return

  if (!hasMarketingAdminScope(user)) {
    throw publicError(403, 'La cuenta no tiene el rol de Mercadotecnia asignado')
  }
}

export function assertUnidadAccess(user: AppSessionUser, unidad: string) {
  if (isSuperAdmin(user)) return
  if (!user.unidades.includes(unidad)) {
    throw publicError(403, 'Unidad fuera del alcance del usuario')
  }
}

export function assertSalaAccess(user: AppSessionUser, sala: string | number) {
  if (user.kind === 'admin') return
  const scopeSala = user.scopes?.daycare?.sala || user.sala
  if (scopeSala && String(scopeSala) !== String(sala)) {
    throw publicError(403, 'Sala fuera del alcance del usuario')
  }
}
