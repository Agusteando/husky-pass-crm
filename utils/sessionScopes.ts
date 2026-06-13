import type { AppSessionUser, FamilyProductScope } from '~/types/session'

export const DAYCARE_FAMILY_ROLE = 'ROLE_HUSKY_USER'
export const DAYCARE_ADMIN_ROLE = 'ROLE_HUSKY'

export function hasRoleToken(roles: string[] | null | undefined, role: string) {
  return Boolean(roles?.some((candidate) => candidate.trim().toUpperCase() === role.toUpperCase()))
}

export function hasFamilyScope(user: AppSessionUser | null | undefined, scope: FamilyProductScope) {
  if (!user || user.kind !== 'family') return false

  if (scope === 'daycare') {
    const daycare = user.scopes?.daycare
    return Boolean(daycare?.unidad && daycare?.sala)
  }

  if (scope === 'personasAutorizadas') {
    return Boolean(user.scopes?.personasAutorizadas)
  }

  return false
}

export function hasDaycareAdminScope(user: AppSessionUser | null | undefined) {
  if (!user || user.kind !== 'admin') return false
  if (user.isSuperAdmin) return true
  const hasPermission = hasRoleToken(user.roles, DAYCARE_ADMIN_ROLE) || user.routes.some((route) => /guarder[ií]a|husky|daycare/i.test(route.route))
  return hasPermission && user.unidades.length > 0
}

export function defaultFamilyRoute(user: AppSessionUser | null | undefined) {
  const daycare = hasFamilyScope(user, 'daycare')
  const personas = hasFamilyScope(user, 'personasAutorizadas')
  if (daycare && personas) return '/familia'
  if (daycare) return '/familia/daycare'
  if (personas) return '/familia/personas-autorizadas'
  return '/login'
}

export function familyNavItems(user: AppSessionUser | null | undefined) {
  const items: Array<{ label: string; to: string; icon: string }> = []

  if (hasFamilyScope(user, 'daycare')) {
    items.push(
      { label: 'Guardería', to: '/familia/daycare', icon: 'daycare' },
      { label: 'Tareas', to: '/familia/daycare/tareas', icon: 'edit' },
      { label: 'Avisos', to: '/familia/daycare/avisos', icon: 'survey' },
      { label: 'Calendario', to: '/familia/daycare/calendario', icon: 'calendar' }
    )
  }

  if (hasFamilyScope(user, 'personasAutorizadas')) {
    items.push({ label: 'Personas autorizadas', to: '/familia/personas-autorizadas', icon: 'people' })
    items.push({ label: 'Asistencia', to: '/familia/asistencia', icon: 'calendar' })
  }

  if (items.length) {
    items.push({ label: 'Seguridad', to: '/familia/cuenta/seguridad', icon: 'security' })
  }

  return items
}
