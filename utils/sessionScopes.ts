import type { AppSessionUser, FamilyProductScope } from '~/types/session'

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
  const hasPermission = user.roles.some((role) => role.toUpperCase().includes('HUSKY')) || user.routes.some((route) => /guarder[ií]a|husky|daycare/i.test(route.route))
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
  const items: Array<{ label: string; to: string }> = []

  if (hasFamilyScope(user, 'daycare')) {
    items.push(
      { label: 'Guardería', to: '/familia/daycare' },
      { label: 'Tareas', to: '/familia/daycare/tareas' },
      { label: 'Avisos', to: '/familia/daycare/avisos' },
      { label: 'Calendario', to: '/familia/daycare/calendario' }
    )
  }

  if (hasFamilyScope(user, 'personasAutorizadas')) {
    items.push({ label: 'Personas Autorizadas', to: '/familia/personas-autorizadas' })
  }

  return items
}
