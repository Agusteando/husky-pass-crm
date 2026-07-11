import type { AppSessionUser } from '~/types/session'
import { defaultAdminRoute, effectiveAdminUser, hasDaycareAdminScope, hasSchoolAdminScope } from '~/utils/sessionScopes'

export type AdminPersonaKey = 'superAdmin' | 'schoolAdmin' | 'daycareAdmin' | 'limitedAdmin'

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
      title: 'Administración',
      subtitle: 'Sesión no disponible',
      context: '',
      homeTo
    }
  }

  if (admin.isSuperAdmin) {
    return {
      key: 'superAdmin',
      title: 'Super Admin',
      subtitle: 'Usuarios y configuración',
      context: '',
      homeTo
    }
  }

  if (hasSchoolAdminScope(admin)) {
    return {
      key: 'schoolAdmin',
      title: 'Escolar',
      subtitle: 'Husky Pass',
      context: summarizeSchoolContext(admin),
      homeTo
    }
  }

  if (hasDaycareAdminScope(admin)) {
    return {
      key: 'daycareAdmin',
      title: 'Guardería',
      subtitle: 'Salas y familias',
      context: admin.unidades.length ? admin.unidades.join(' / ') : '',
      homeTo
    }
  }

  return {
    key: 'limitedAdmin',
    title: 'Administración',
    subtitle: 'Acceso pendiente',
    context: '',
    homeTo
  }
}

export function adminNavigationForUser(user: AppSessionUser | null | undefined): AdminNavItem[] {
  const admin = effectiveAdminUser(user)
  if (!admin) return []

  if (admin.isSuperAdmin) {
    return [
      { key: 'usuarios', label: 'Usuarios', to: '/admin/superadmin', icon: 'people' },
      { key: 'husky-pass', label: 'Husky Pass', shortLabel: 'Pases', to: '/admin/superadmin/personas-autorizadas', icon: 'badge' },
      { key: 'marbetes', label: 'Marbetes', to: '/admin/superadmin/marbetes', icon: 'marbete' },
      { key: 'mkt', label: 'Mercadotecnia', shortLabel: 'MKT', to: '/mkt', icon: 'announcement' },
      { key: 'escolar', label: 'Escolar', to: '/admin/gestion-escolar', icon: 'school' },
      { key: 'guarderia', label: 'Guardería', to: daycareRouteForUser(admin), icon: 'daycare' }
    ]
  }

  if (hasSchoolAdminScope(admin)) {
    return [
      { key: 'escolar-home', label: 'Escolar', to: '/admin/gestion-escolar', icon: 'school' },
      { key: 'familias', label: 'Familias', to: '/admin/gestion-escolar/familias', icon: 'people' },
      { key: 'comunicados', label: 'Comunicados', to: '/admin/gestion-escolar/comunicados', icon: 'announcement' },
      { key: 'encuestas', label: 'Encuestas', to: '/admin/gestion-escolar/encuestas', icon: 'survey' },
      { key: 'convenios', label: 'Convenios', to: '/admin/gestion-escolar/convenios', icon: 'handshake' }
    ]
  }

  if (hasDaycareAdminScope(admin)) {
    return [{ key: 'guarderia', label: 'Guardería', to: daycareRouteForUser(admin), icon: 'daycare' }]
  }

  return []
}

export function adminScopeSummary(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  if (!admin) return []
  if (admin.isSuperAdmin) return ['Super Admin', 'Escolar', 'Guardería']
  const scopes: string[] = []
  if (hasSchoolAdminScope(admin)) scopes.push('Escolar')
  if (hasDaycareAdminScope(admin)) scopes.push('Guardería')
  return scopes
}

function daycareRouteForUser(user: AppSessionUser) {
  if (user.isSuperAdmin) return '/admin/daycare/salas'
  const firstUnidad = user.unidades[0] || ''
  return firstUnidad ? `/admin/daycare/salas?unidad=${encodeURIComponent(firstUnidad)}` : '/admin/daycare/salas'
}

function summarizeSchoolContext(user: AppSessionUser) {
  const planteles = user.plantel.filter(Boolean)
  if (planteles.length) return planteles.join(' / ')
  if (user.campus) return user.campus
  if (user.empresa) return user.empresa
  return ''
}
