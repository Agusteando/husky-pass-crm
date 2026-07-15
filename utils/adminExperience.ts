import type { AppSessionUser } from '~/types/session'
import { defaultAdminRoute, effectiveAdminUser, hasDaycareAdminScope, hasMarketingAdminScope, hasSchoolAdminScope } from '~/utils/sessionScopes'

export type AdminPersonaKey = 'superAdmin' | 'schoolAdmin' | 'daycareAdmin' | 'marketingAdmin' | 'multiAdmin' | 'limitedAdmin'

export interface AdminNavItem {
  key: string
  label: string
  shortLabel?: string
  to: string
  icon: string
}

export interface AdminPersonaSummary {
  key: AdminPersonaKey
  title: string
  subtitle: string
  context: string
  homeTo: string
}

export function adminPersonaForUser(user: AppSessionUser | null | undefined): AdminPersonaSummary {
  const admin = effectiveAdminUser(user)
  const homeTo = defaultAdminRoute(admin)
  if (!admin) {
    return {
      key: 'limitedAdmin',
      title: 'Husky Pass',
      subtitle: 'Administración',
      context: '',
      homeTo
    }
  }

  if (admin.isSuperAdmin) {
    return {
      key: 'superAdmin',
      title: 'Husky Pass',
      subtitle: 'Super Admin',
      context: 'Administración global',
      homeTo
    }
  }

  const scopes = adminScopeSummary(admin)
  if (scopes.length > 1) {
    return {
      key: 'multiAdmin',
      title: 'Husky Pass',
      subtitle: 'Administración',
      context: scopes.join(' · '),
      homeTo
    }
  }

  if (hasSchoolAdminScope(admin)) {
    return {
      key: 'schoolAdmin',
      title: 'Husky Pass',
      subtitle: 'Escolar',
      context: summarizeSchoolContext(admin),
      homeTo
    }
  }

  if (hasDaycareAdminScope(admin)) {
    return {
      key: 'daycareAdmin',
      title: 'Husky Pass',
      subtitle: 'Guardería',
      context: admin.unidades.length ? admin.unidades.join(' / ') : '',
      homeTo
    }
  }

  if (hasMarketingAdminScope(admin)) {
    return {
      key: 'marketingAdmin',
      title: 'Husky Pass',
      subtitle: 'Mercadotecnia',
      context: summarizeSchoolContext(admin),
      homeTo
    }
  }

  return {
    key: 'limitedAdmin',
    title: 'Husky Pass',
    subtitle: 'Administración',
    context: 'Acceso pendiente',
    homeTo
  }
}

export function adminNavigationForUser(user: AppSessionUser | null | undefined): AdminNavItem[] {
  const admin = effectiveAdminUser(user)
  if (!admin) return []

  const items: AdminNavItem[] = []
  if (admin.isSuperAdmin) {
    items.push({ key: 'platform', label: 'Plataforma', shortLabel: 'Global', to: '/admin/superadmin', icon: 'people' })
  }
  if (hasSchoolAdminScope(admin)) items.push({ key: 'school', label: 'Escolar', shortLabel: 'Escolar', to: '/admin/gestion-escolar', icon: 'school' })
  if (hasDaycareAdminScope(admin)) items.push({ key: 'daycare', label: 'Guardería', shortLabel: 'Salas', to: daycareRouteForUser(admin), icon: 'daycare' })
  if (hasMarketingAdminScope(admin)) items.push({ key: 'marketing', label: 'Mercadotecnia', shortLabel: 'MKT', to: '/mkt', icon: 'announcement' })
  return items
}

export function adminScopeSummary(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  if (!admin) return []
  if (admin.isSuperAdmin) return ['Super Admin', 'Escolar', 'Guardería', 'Mercadotecnia']
  const scopes: string[] = []
  if (hasSchoolAdminScope(admin)) scopes.push('Escolar')
  if (hasDaycareAdminScope(admin)) scopes.push('Guardería')
  if (hasMarketingAdminScope(admin)) scopes.push('Mercadotecnia')
  return scopes
}

function daycareRouteForUser(user: AppSessionUser) {
  if (user.isSuperAdmin) return '/admin/daycare/salas'
  const firstUnidad = user.unidades[0] || ''
  return firstUnidad ? `/admin/daycare/salas?unidad=${encodeURIComponent(firstUnidad)}` : '/admin/daycare/salas'
}

function summarizeSchoolContext(user: AppSessionUser) {
  const planteles = user.plantel.filter(Boolean)
  return planteles.length ? planteles.join(' / ') : ''
}
