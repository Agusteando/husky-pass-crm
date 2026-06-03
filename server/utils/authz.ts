import { createError } from 'h3'
import type { AppSessionUser, FamilyProductScope } from '~/types/session'

export function hasFamilyProductScope(user: AppSessionUser, scope: FamilyProductScope) {
  if (user.kind !== 'family') return false

  if (scope === 'daycare') {
    const daycare = user.scopes?.daycare
    return Boolean(daycare?.unidad && daycare?.sala)
  }

  if (scope === 'personasAutorizadas') {
    return Boolean(user.scopes?.personasAutorizadas)
  }

  return false
}

export function isSuperAdmin(user: AppSessionUser | null | undefined) {
  return Boolean(user?.kind === 'admin' && user.isSuperAdmin)
}

export function assertDaycareFamily(user: AppSessionUser) {
  if (!hasFamilyProductScope(user, 'daycare')) {
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

  if (isSuperAdmin(user)) return

  const hasDaycarePermission = hasRoleLike(user, 'HUSKY') || user.routes.some((route) => /guarder[ií]a|husky|daycare/i.test(route.route))
  if (!hasDaycarePermission || user.unidades.length === 0) {
    throw createError({ statusCode: 403, statusMessage: 'El usuario no tiene alcance de guardería' })
  }
}

export function assertUnidadAccess(user: AppSessionUser, unidad: string) {
  if (isSuperAdmin(user)) return
  if (!user.unidades.includes(unidad)) {
    throw createError({ statusCode: 403, statusMessage: 'Unidad fuera del alcance del usuario' })
  }
}

export function assertSalaAccess(user: AppSessionUser, sala: string | number) {
  if (user.kind === 'admin') return
  const scopeSala = user.scopes?.daycare?.sala || user.sala
  if (scopeSala && String(scopeSala) !== String(sala)) {
    throw createError({ statusCode: 403, statusMessage: 'Sala fuera del alcance del usuario' })
  }
}

function hasRoleLike(user: AppSessionUser, token: string) {
  return user.roles.some((role) => role.toUpperCase().includes(token.toUpperCase()))
}
