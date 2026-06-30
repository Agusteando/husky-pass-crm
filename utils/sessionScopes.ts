import type { AppSessionUser, FamilyProductScope } from '~/types/session'

export const DAYCARE_FAMILY_ROLE = 'ROLE_HUSKY_USER'
export const DAYCARE_ADMIN_ROLE = 'ROLE_HUSKY'
export const COMMUNICATIONS_ADMIN_ROLE = 'ROLE_HUSKY_COMUNICADOS'
export const GESTION_ESCOLAR_ROLE = 'ROLE_HUSKY_GESTION_ESCOLAR'

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

export function hasCommunicationsAdminScope(user: AppSessionUser | null | undefined) {
  if (!user || user.kind !== 'admin') return false
  if (user.isSuperAdmin) return true
  const routeText = user.routes.map((route) => route.route).join(' ')
  const roleText = user.roles.join(' ')
  return hasRoleToken(user.roles, COMMUNICATIONS_ADMIN_ROLE) || /comunicados|comunicaciones|avisos/i.test(`${routeText} ${roleText}`)
}

export function hasGestionEscolarAdminScope(user: AppSessionUser | null | undefined) {
  if (!user || user.kind !== 'admin') return false
  if (user.isSuperAdmin) return true
  return hasRoleToken(user.roles, GESTION_ESCOLAR_ROLE) || user.productScopes.includes('gestionEscolarAdmin')
}

export function hasAccessHistoryAdminScope(user: AppSessionUser | null | undefined) {
  if (!user || user.kind !== 'admin') return false
  if (user.isSuperAdmin) return true
  const routeText = user.routes.map((route) => route.route).join(' ')
  const roleText = user.roles.join(' ')
  return /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|marbete|validar|historial|acceso|husky/i.test(`${routeText} ${roleText}`)
}

export function hasAnyAdminScope(user: AppSessionUser | null | undefined) {
  return Boolean(user?.kind === 'admin' && (user.isSuperAdmin || hasGestionEscolarAdminScope(user) || hasDaycareAdminScope(user) || hasCommunicationsAdminScope(user) || hasAccessHistoryAdminScope(user)))
}

export function defaultAdminRoute(user: AppSessionUser | null | undefined) {
  if (!user || user.kind !== 'admin') return '/login'
  if (user.isSuperAdmin) return '/admin/superadmin'
  if (hasGestionEscolarAdminScope(user)) return '/admin/gestion-escolar'
  if (hasDaycareAdminScope(user)) return '/admin/daycare/salas'
  if (hasCommunicationsAdminScope(user)) return '/admin/comunicados'
  if (hasAccessHistoryAdminScope(user)) return '/admin/historial-accesos'
  return '/login'
}

export function defaultFamilyRoute(user: AppSessionUser | null | undefined) {
  const daycare = hasFamilyScope(user, 'daycare')
  const personas = hasFamilyScope(user, 'personasAutorizadas')
  if (daycare && personas) return '/familia'
  if (daycare) return '/familia/daycare'
  if (personas) return '/familia/personas-autorizadas'
  return '/login'
}

export function defaultSessionRoute(user: AppSessionUser | null | undefined) {
  if (!user) return '/login'
  if (user.kind === 'admin') return defaultAdminRoute(user)
  return defaultFamilyRoute(user)
}

export function familyNavItems(user: AppSessionUser | null | undefined, activeScope?: FamilyProductScope | 'attendance' | 'chooser') {
  const items: Array<{ label: string; to: string; icon: string }> = []

  const showDaycare = activeScope ? activeScope === 'daycare' || activeScope === 'chooser' : hasFamilyScope(user, 'daycare')
  const showPersonas = activeScope ? activeScope === 'personasAutorizadas' || activeScope === 'attendance' || activeScope === 'chooser' : hasFamilyScope(user, 'personasAutorizadas')

  if (showDaycare && hasFamilyScope(user, 'daycare')) {
    items.push(
      { label: 'Guardería', to: '/familia/daycare', icon: 'daycare' },
      { label: 'Tareas', to: '/familia/daycare/tareas', icon: 'edit' },
      { label: 'Avisos', to: '/familia/daycare/avisos', icon: 'survey' },
      { label: 'Calendario', to: '/familia/daycare/calendario', icon: 'calendar' }
    )
  }

  if (showPersonas && hasFamilyScope(user, 'personasAutorizadas')) {
    items.push({ label: 'Inicio', to: '/familia', icon: 'home' })
    items.push({ label: 'Personas autorizadas', to: '/familia/personas-autorizadas', icon: 'people' })
    items.push({ label: 'Comunicados', to: '/familia/comunicados', icon: 'announcement' })
    items.push({ label: 'Pagos', to: '/familia/pagos', icon: 'payments' })
    items.push({ label: 'Asistencia', to: '/familia/asistencia', icon: 'calendar' })
  }

  if (items.length) {
    items.push({ label: 'Seguridad', to: '/familia/cuenta/seguridad', icon: 'security' })
  }

  return items
}
