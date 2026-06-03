import type { AppSessionUser, FamilyProductScope } from '~/types/session'

export function hasFamilyScope(user: AppSessionUser | null | undefined, scope: FamilyProductScope) {
  if (!user || user.kind !== 'family') return false
  return user.productScopes?.includes(scope) || Boolean(user.scopes?.[scope])
}

export function hasDaycareAdminScope(user: AppSessionUser | null | undefined) {
  if (!user || user.kind !== 'admin') return false
  if (user.isSuperAdmin) return true
  const hasPermission = user.roles.some((role) => role.toUpperCase().includes('HUSKY')) || user.routes.some((route) => /daycare-app|guarder[ií]a|husky|sala/i.test(route.route))
  return hasPermission && user.unidades.length > 0
}

export function defaultFamilyRoute(user: AppSessionUser | null | undefined) {
  if (hasFamilyScope(user, 'daycare')) return '/daycare'
  if (hasFamilyScope(user, 'personasAutorizadas')) return '/personas_autorizadas'
  return '/login'
}

export function familyNavItems(user: AppSessionUser | null | undefined) {
  const items: Array<{ label: string; to: string }> = []

  if (hasFamilyScope(user, 'daycare')) {
    items.push(
      { label: 'Inicio', to: '/daycare' },
      { label: 'Tareas', to: '/ver/tareas' },
      { label: 'Circulares', to: '/ver/circulares' },
      { label: 'Calendario', to: '/ver/calendario' }
    )
  }

  if (hasFamilyScope(user, 'personasAutorizadas')) {
    items.push({ label: 'Personas Autorizadas', to: '/personas_autorizadas' })
  }

  return items
}
