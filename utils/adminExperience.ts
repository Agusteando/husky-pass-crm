import type { AppSessionUser } from '~/types/session'
import {
  defaultAdminRoute,
  effectiveAdminUser,
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
  const admin = effectiveAdminUser(user)
  const homeTo = defaultAdminRoute(admin)
  if (!admin) {
    return {
      key: 'limitedAdmin',
      title: 'Administración',
      subtitle: 'Sesión no disponible',
      context: 'Sin contexto activo',
      homeTo
    }
  }

  if (admin.isSuperAdmin) {
    return {
      key: 'superAdmin',
      title: 'Super Admin',
      subtitle: 'Cuentas · alcance · auditoría',
      context: '',
      homeTo
    }
  }

  if (hasGestionEscolarAdminScope(admin)) {
    return {
      key: 'escolarAdmin',
      title: 'Escolar',
      subtitle: 'Familias y publicaciones',
      context: summarizeSchoolContext(admin),
      homeTo
    }
  }

  if (hasDaycareAdminScope(admin)) {
    return {
      key: 'daycareAdmin',
      title: 'Guardería',
      subtitle: 'Salas y familias',
      context: admin.unidades.length ? admin.unidades.join(' / ') : 'Unidad pendiente',
      homeTo
    }
  }

  if (hasCommunicationsAdminScope(admin)) {
    return {
      key: 'communicationsAdmin',
      title: 'Comunicados',
      subtitle: 'Publicaciones escolares',
      context: summarizeSchoolContext(admin),
      homeTo
    }
  }

  if (hasAccessHistoryAdminScope(admin)) {
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
  const admin = effectiveAdminUser(user)
  if (!admin) return []

  if (admin.isSuperAdmin) {
    return [
      { key: 'cuentas', label: 'Cuentas', to: '/admin/superadmin', icon: 'security' },
      { key: 'alcance-escolar', label: 'Alcance', to: '/admin/superadmin/gestion-escolar', icon: 'school' },
      { key: 'salas', label: 'Salas', to: daycareRouteForUser(admin), icon: 'daycare' },
      { key: 'auditoria', label: 'Auditoría', to: '/admin/historial-accesos', icon: 'history' }
    ]
  }

  const items: AdminNavItem[] = []
  if (hasGestionEscolarAdminScope(admin)) {
    items.push(
      { key: 'escolar-home', label: 'Escolar', to: '/admin/gestion-escolar', icon: 'school' },
      { key: 'familias', label: 'Familias', to: '/admin/gestion-escolar/familias', icon: 'people' },
      { key: 'comunicados', label: 'Comunicados', to: '/admin/gestion-escolar/comunicados', icon: 'announcement' },
      { key: 'encuestas', label: 'Encuestas', to: '/admin/gestion-escolar/encuestas', icon: 'survey' },
      { key: 'convenios', label: 'Convenios', to: '/admin/gestion-escolar/convenios', icon: 'handshake' }
    )
  }

  if (hasDaycareAdminScope(admin)) {
    items.push({ key: 'guarderia-salas', label: 'Guardería', to: daycareRouteForUser(admin), icon: 'daycare' })
  }

  if (hasCommunicationsAdminScope(admin) && !items.some((item) => item.key === 'comunicados')) {
    items.push({ key: 'comunicados', label: 'Comunicados', to: '/admin/comunicados', icon: 'announcement' })
  }

  if (hasAccessHistoryAdminScope(admin)) {
    items.push({ key: 'seguridad', label: 'Seguridad', to: '/admin/historial-accesos', icon: 'history' })
  }

  return items
}

export function adminScopeSummary(user: AppSessionUser | null | undefined) {
  const admin = effectiveAdminUser(user)
  if (!admin) return []
  if (admin.isSuperAdmin) return ['Super Admin', 'Escolar', 'Guardería', 'Seguridad']
  const scopes: string[] = []
  if (hasGestionEscolarAdminScope(admin)) scopes.push('Escolar')
  if (hasDaycareAdminScope(admin)) scopes.push('Guardería')
  if (hasCommunicationsAdminScope(admin)) scopes.push('Comunicados')
  if (hasAccessHistoryAdminScope(admin)) scopes.push('Seguridad')
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
