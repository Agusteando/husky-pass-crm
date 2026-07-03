import type { AppSessionUser } from '~/types/session'
import {
  defaultAdminRoute,
  hasAccessHistoryAdminScope,
  hasCommunicationsAdminScope,
  hasDaycareAdminScope,
  hasGestionEscolarAdminScope
} from '~/utils/sessionScopes'

export type AdminPersonaKey =
  | 'superAdmin'
  | 'escolarAdmin'
  | 'daycareAdmin'
  | 'communicationsAdmin'
  | 'accessHistoryAdmin'
  | 'limitedAdmin'

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
  const homeTo = defaultAdminRoute(user)
  if (!user || user.kind !== 'admin') {
    return {
      key: 'limitedAdmin',
      title: 'Administración',
      subtitle: 'Sesión no disponible',
      context: 'Sin contexto activo',
      homeTo
    }
  }

  if (user.isSuperAdmin) {
    return {
      key: 'superAdmin',
      title: 'Super Admin',
      subtitle: 'Centro de operación institucional',
      context: 'Todos los productos y planteles',
      homeTo
    }
  }

  if (hasGestionEscolarAdminScope(user)) {
    return {
      key: 'escolarAdmin',
      title: 'Escolar Admin',
      subtitle: 'Operación escuela-familia',
      context: summarizeSchoolContext(user),
      homeTo
    }
  }

  if (hasDaycareAdminScope(user)) {
    return {
      key: 'daycareAdmin',
      title: 'Daycare Admin',
      subtitle: 'Operación de guardería',
      context: user.unidades.length ? user.unidades.join(' · ') : 'Unidad pendiente',
      homeTo
    }
  }

  if (hasCommunicationsAdminScope(user)) {
    return {
      key: 'communicationsAdmin',
      title: 'Comunicados',
      subtitle: 'Comunicación institucional',
      context: summarizeSchoolContext(user),
      homeTo
    }
  }

  if (hasAccessHistoryAdminScope(user)) {
    return {
      key: 'accessHistoryAdmin',
      title: 'Seguridad',
      subtitle: 'Historial y validaciones',
      context: 'Auditoría de accesos',
      homeTo
    }
  }

  return {
    key: 'limitedAdmin',
    title: 'Administración',
    subtitle: 'Acceso incompleto',
    context: 'Solicita asignación a Super Admin',
    homeTo
  }
}

export function adminNavigationForUser(user: AppSessionUser | null | undefined): AdminNavItem[] {
  if (!user || user.kind !== 'admin') return []

  if (user.isSuperAdmin) {
    return [
      { key: 'superadmin-home', label: 'Inicio', to: '/admin/superadmin', icon: 'home' },
      { key: 'admins-escolar', label: 'Admins escolar', shortLabel: 'Escolar', to: '/admin/superadmin/gestion-escolar', icon: 'school' },
      { key: 'daycare-admin', label: 'Daycare', to: daycareRouteForUser(user), icon: 'daycare' },
      { key: 'escolar-workbench', label: 'Workbench escolar', shortLabel: 'Workbench', to: '/admin/gestion-escolar', icon: 'clipboard' },
      { key: 'husky-pass', label: 'Husky Pass', to: '/admin/superadmin/personas-autorizadas', icon: 'marbete' },
      { key: 'access-history', label: 'Historial', to: '/admin/historial-accesos', icon: 'history' },
      { key: 'environment', label: 'Entorno', to: '/admin/superadmin/entorno', icon: 'security' }
    ]
  }

  const items: AdminNavItem[] = []
  if (hasGestionEscolarAdminScope(user)) {
    items.push(
      { key: 'escolar-home', label: 'Inicio', to: '/admin/gestion-escolar', icon: 'home' },
      { key: 'familias', label: 'Familias', to: '/admin/gestion-escolar/familias', icon: 'people' },
      { key: 'comunicados', label: 'Comunicados', to: '/admin/gestion-escolar/comunicados', icon: 'announcement' },
      { key: 'encuestas', label: 'Encuestas', to: '/admin/gestion-escolar/encuestas', icon: 'survey' },
      { key: 'convenios', label: 'Convenios', to: '/admin/gestion-escolar/convenios', icon: 'handshake' }
    )
  }

  if (hasDaycareAdminScope(user)) {
    items.push({ key: 'daycare-salas', label: 'Salas', to: daycareRouteForUser(user), icon: 'daycare' })
  }

  if (hasCommunicationsAdminScope(user) && !items.some((item) => item.key === 'comunicados')) {
    items.push({ key: 'comunicados', label: 'Comunicados', to: '/admin/comunicados', icon: 'announcement' })
  }

  if (hasAccessHistoryAdminScope(user)) {
    items.push({ key: 'access-history', label: 'Historial', to: '/admin/historial-accesos', icon: 'history' })
  }

  return items
}

export function adminScopeSummary(user: AppSessionUser | null | undefined) {
  if (!user || user.kind !== 'admin') return []
  if (user.isSuperAdmin) return ['Super Admin', 'Escolar', 'Daycare', 'Husky Pass']
  const scopes: string[] = []
  if (hasGestionEscolarAdminScope(user)) scopes.push('Escolar')
  if (hasDaycareAdminScope(user)) scopes.push('Daycare')
  if (hasCommunicationsAdminScope(user)) scopes.push('Comunicados')
  if (hasAccessHistoryAdminScope(user)) scopes.push('Historial')
  return scopes
}

function daycareRouteForUser(user: AppSessionUser) {
  const firstUnidad = user.unidades[0] || ''
  return firstUnidad ? `/admin/daycare/salas?unidad=${encodeURIComponent(firstUnidad)}` : '/admin/daycare/salas'
}

function summarizeSchoolContext(user: AppSessionUser) {
  const planteles = user.plantel.filter(Boolean)
  if (planteles.length) return planteles.join(' · ')
  if (user.campus) return user.campus
  if (user.empresa) return user.empresa
  return 'Alcance escolar asignado'
}
