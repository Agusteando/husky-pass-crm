import type { AppSessionUser, FamilyProductScope } from '~/types/session'

export function hasFamilyProductScope(user: AppSessionUser, scope: FamilyProductScope) {
  return user.kind === 'family' && (user.productScopes?.includes(scope) || Boolean(user.scopes?.[scope]))
}

export function assertDaycareFamily(user: AppSessionUser) {
  const scope = user.scopes?.daycare
  if (!hasFamilyProductScope(user, 'daycare') || !scope?.sala || !scope?.unidad) {
    throw createError({ statusCode: 403, statusMessage: 'Acceso de guardería no autorizado' })
  }
}

export function assertPersonasAutorizadasFamily(user: AppSessionUser) {
  if (!hasFamilyProductScope(user, 'personasAutorizadas')) {
    throw createError({ statusCode: 403, statusMessage: 'Acceso a Personas Autorizadas no autorizado' })
  }
}

export function assertDaycareAdmin(user: AppSessionUser) {
  if (user.kind !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Acceso administrativo no autorizado' })
  }

  const hasDaycarePermission = hasRoleLike(user, 'HUSKY') || user.routes.some((route) => /daycare-app|guarder[ií]a|husky|sala/i.test(route.route))
  if (!hasDaycarePermission || user.unidades.length === 0) {
    throw createError({ statusCode: 403, statusMessage: 'El usuario no tiene alcance de guardería' })
  }
}

export function assertUnidadAccess(user: AppSessionUser, unidad: string) {
  if (!user.unidades.includes(unidad)) {
    throw createError({ statusCode: 403, statusMessage: 'Unidad fuera del alcance del usuario' })
  }
}

export function assertSalaAccess(user: AppSessionUser, sala: string | number) {
  if (user.kind === 'admin') return
  if (user.sala && String(user.sala) !== String(sala)) {
    throw createError({ statusCode: 403, statusMessage: 'Sala fuera del alcance del usuario' })
  }
}

function hasRoleLike(user: AppSessionUser, token: string) {
  return user.roles.some((role) => role.toUpperCase().includes(token.toUpperCase()))
}
