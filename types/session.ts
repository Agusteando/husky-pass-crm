export type SessionKind = 'family' | 'admin'
export type FamilyProductScope = 'daycare' | 'personasAutorizadas'

export interface LegacyRoutePermission {
  route: string
  icono?: string | null
}

export interface DaycareFamilyScope {
  product: 'daycare'
  unidad: string
  sala: string
}

export interface PersonasAutorizadasFamilyScope {
  product: 'personasAutorizadas'
  legacyRoute?: string | null
}

export interface FamilyProductScopes {
  daycare?: DaycareFamilyScope
  personasAutorizadas?: PersonasAutorizadasFamilyScope
}

export interface AdminImpersonationOrigin {
  isSuperAdmin?: boolean
  id: number
  email: string
  username?: string | null
  displayName?: string | null
  picture?: string | null
  campus?: string | null
  empresa?: string | null
  sala?: string | null
  roles: string[]
  unidades: string[]
  plantel: string[]
  routes: LegacyRoutePermission[]
  productScopes: []
  scopes: {}
  kind: 'admin'
  anonymous: false
  loggedin: true
}

export interface AppSessionUser {
  isSuperAdmin?: boolean
  id: number
  kind: SessionKind
  email: string
  username?: string | null
  displayName?: string | null
  picture?: string | null
  campus?: string | null
  empresa?: string | null
  sala?: string | null
  roles: string[]
  unidades: string[]
  plantel: string[]
  routes: LegacyRoutePermission[]
  productScopes: FamilyProductScope[]
  scopes: FamilyProductScopes
  impersonation?: {
    startedAt: number
    mode?: 'account' | 'daycarePreview'
    admin: AdminImpersonationOrigin
    returnTo?: string | null
  }
  anonymous: false
  loggedin: true
}

export interface PublicSession {
  user: AppSessionUser | null
  loggedin: boolean
}
