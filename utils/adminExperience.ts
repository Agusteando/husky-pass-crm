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
      subtitle: 'Personas y accesos',
      context: '',
      homeTo
    }
  }

  if (hasGestionEscolarAdminScope(user)) {
    return {
      key: 'escolarAdmin',
      title: 'Escolar',
      subtitle: 'Familias y publicaciones',
      context: summarizeSchoolContext(user),
      homeTo
    }
  }

  if (hasDaycareAdminScope(user)) {
    return {
      key: 'daycareAdmin',
      title: 'Guardería',
      subtitle: 'Salas y familias',
      context: user.unidades.length ? user.unidades.join(' / ') : 'Unidad pendiente',
      homeTo
    }
  }

  if (hasCommunicationsAdminScope(user)) {
    return {
      key: 'communicationsAdmin',
      title: 'Comunicados',
      subtitle: 'Publicaciones escolares',
      context: summarizeSchoolContext(user),
      homeTo
    }
  }

  if (hasAccessHistoryAdminScope(user)) {
    return {
      key: 'accessHistoryAdmin',
      title: 'Seguridad',
      subtitle: 'Historial de accesos',
      context: 'Acciones sensibles',
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
      { key: 'personas', label: 'Personas', to: '/admin/superadmin', icon: 'people' },
      { key: 'escolar', label: 'Escolar', to: '/admin/superadmin/gestion-escolar', icon: 'school' },
      { key: 'guarderia', label: 'Guardería', to: daycareRouteForUser(user), icon: 'daycare' },
      { key: 'seguridad', label: 'Seguridad', to: '/admin/historial-accesos', icon: 'history' }
    ]
  }

  const items: AdminNavItem[] = []
  if (hasGestionEscolarAdminScope(user)) {
    items.push(
      { key: 'escolar-home', label: 'Escolar', to: '/admin/gestion-escolar', icon: 'school' },
      { key: 'familias', label: 'Familias', to: '/admin/gestion-escolar/familias', icon: 'people' },
      { key: 'comunicados', label: 'Comunicados', to: '/admin/gestion-escolar/comunicados', icon: 'announcement' },
      { key: 'encuestas', label: 'Encuestas', to: '/admin/gestion-escolar/encuestas', icon: 'survey' },
      { key: 'convenios', label: 'Convenios', to: '/admin/gestion-escolar/convenios', icon: 'handshake' }
    )
  }

  if (hasDaycareAdminScope(user)) {
    items.push({ key: 'guarderia-salas', label: 'Guardería', to: daycareRouteForUser(user), icon: 'daycare' })
  }

  if (hasCommunicationsAdminScope(user) && !items.some((item) => item.key === 'comunicados')) {
    items.push({ key: 'comunicados', label: 'Comunicados', to: '/admin/comunicados', icon: 'announcement' })
  }

  if (hasAccessHistoryAdminScope(user)) {
    items.push({ key: 'seguridad', label: 'Seguridad', to: '/admin/historial-accesos', icon: 'history' })
  }

  return items
}

export function adminScopeSummary(user: AppSessionUser | null | undefined) {
  if (!user || user.kind !== 'admin') return []
  if (user.isSuperAdmin) return ['Super Admin', 'Escolar', 'Guardería', 'Seguridad']
  const scopes: string[] = []
  if (hasGestionEscolarAdminScope(user)) scopes.push('Escolar')
  if (hasDaycareAdminScope(user)) scopes.push('Guardería')
  if (hasCommunicationsAdminScope(user)) scopes.push('Comunicados')
  if (hasAccessHistoryAdminScope(user)) scopes.push('Seguridad')
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
  return 'Alcance escolar asignado'
}
