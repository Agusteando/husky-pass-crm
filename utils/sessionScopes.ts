import type { AppSessionUser, FamilyProductScope } from '~/types/session'
import { INSTITUTIONAL_ONBOARDING_ROUTE } from '~/utils/institutionalOnboarding'

export const DAYCARE_FAMILY_ROLE = 'ROLE_HUSKY_USER'
export const DAYCARE_ADMIN_ROLE = 'ROLE_HUSKY'
export const SCHOOL_ADMIN_ROLE = 'ROLE_CTRL'
export const MARKETING_ADMIN_ROLE = 'ROLE_MKT'

export function hasRoleToken(roles: string[] | null | undefined, role: string) {
  return Boolean(roles?.some((candidate) => candidate.trim().toUpperCase() === role.toUpperCase()))
}

export function effectiveAdminUser(user: AppSessionUser | null | undefined): AppSessionUser | null {
  if (!user) return null
  if (user.kind === 'admin') return user
  const admin = user.impersonation?.admin
  if (!admin) return null
  return {
    ...admin,
    scopes: {},
    impersonation: user.impersonation
  } as AppSessionUser
}

export function isEffectiveSuperAdmin(user: AppSessionUser | null | undefined) {
  return Boolean(effectiveAdminUser(user)?.isSuperAdmin)
}

export function isInstitutionalAdminIdentity(user: AppSessionUser | null | undefined) {
  if (!user || user.kind !== 'admin' || user.impersonation) return false
  const email = String(user.email || '').trim().toLowerCase()
  return email.endsWith('@casitaiedis.edu.mx')
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

export function hasDaycareAdminRole(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  return Boolean(admin && hasRoleToken(admin.roles, DAYCARE_ADMIN_ROLE))
}

export function hasSchoolAdminRole(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  return Boolean(admin && hasRoleToken(admin.roles, SCHOOL_ADMIN_ROLE))
}

export function hasMarketingAdminRole(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  return Boolean(admin && hasRoleToken(admin.roles, MARKETING_ADMIN_ROLE))
}

export function hasDaycareAdminScope(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  if (!admin) return false
  if (admin.isSuperAdmin) return true
  return hasDaycareAdminRole(admin) && admin.unidades.length > 0
}

export function hasSchoolAdminScope(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  if (!admin) return false
  if (admin.isSuperAdmin) return true
  return hasSchoolAdminRole(admin) && admin.plantel.length > 0
}

export function hasMarketingAdminScope(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  if (!admin) return false
  if (admin.isSuperAdmin) return true
  return hasMarketingAdminRole(admin) && admin.plantel.length > 0
}

export function hasAnyAdminScope(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  return Boolean(admin && (admin.isSuperAdmin || hasMarketingAdminScope(admin) || hasSchoolAdminScope(admin) || hasDaycareAdminScope(admin)))
}

export function requiresInstitutionalOnboarding(user: AppSessionUser | null | undefined) {
  if (!isInstitutionalAdminIdentity(user) || user?.isSuperAdmin) return false
  return !hasAnyAdminScope(user)
}

export function defaultAdminRoute(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  if (!admin) return '/login'
  if (admin.isSuperAdmin) return '/admin/superadmin'
  if (requiresInstitutionalOnboarding(user)) return INSTITUTIONAL_ONBOARDING_ROUTE
  if (hasMarketingAdminScope(admin)) return '/mkt'
  if (hasSchoolAdminScope(admin)) return '/admin/gestion-escolar'
  if (hasDaycareAdminScope(admin)) return '/admin/daycare/salas'
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
    items.push({ label: 'Cuenta', to: '/familia/cuenta/seguridad', icon: 'security' })
  }

  return items
}
