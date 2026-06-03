import type { AppSessionUser } from '~/types/session'

export function assertDaycareFamily(user: AppSessionUser) {
  if (user.kind !== 'family' || !hasRoleLike(user, 'HUSKY') || !user.sala || user.unidades.length === 0) {
    throw createError({ statusCode: 403, statusMessage: 'Acceso familiar de guardería no autorizado' })
  }
}

export function assertDaycareAdmin(user: AppSessionUser) {
  if (user.kind !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Acceso administrativo no autorizado' })
  }

  const hasScopedDaycareAccess = hasRoleLike(user, 'HUSKY') || user.routes.some((route) => /daycare|sala|husky|dashboard/i.test(route.route))
  if (!hasScopedDaycareAccess && user.unidades.length === 0) {
    throw createError({ statusCode: 403, statusMessage: 'El usuario no tiene alcance de guardería' })
  }
}

export function assertUnidadAccess(user: AppSessionUser, unidad: string) {
  if (!user.unidades.includes(unidad)) {
    throw createError({ statusCode: 403, statusMessage: 'Unidad fuera del alcance del usuario' })
  }
}

export function assertSalaAccess(user: AppSessionUser, sala: string | number) {
  if (user.sala && String(user.sala) !== String(sala)) {
    throw createError({ statusCode: 403, statusMessage: 'Sala fuera del alcance del usuario' })
  }
}

function hasRoleLike(user: AppSessionUser, token: string) {
  return user.roles.some((role) => role.toUpperCase().includes(token.toUpperCase()))
}
