export type SessionKind = 'family' | 'admin'
export type FamilyProductScope = 'daycare' | 'personasAutorizadas'
export type AdminProductScope = 'daycareAdmin' | 'schoolAdmin' | 'marketingAdmin' | 'superAdmin'

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
  productScopes: AdminProductScope[]
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
  productScopes: Array<FamilyProductScope | AdminProductScope>
  scopes: FamilyProductScopes
  impersonation?: {
    startedAt: number
    mode?: 'account' | 'daycarePreview'
    admin: AdminImpersonationOrigin
  }
  anonymous: false
  loggedin: true
}

export interface PublicSession {
  user: AppSessionUser | null
  loggedin: boolean
}
