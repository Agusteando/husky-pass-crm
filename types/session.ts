export type SessionKind = 'family' | 'admin'

export interface LegacyRoutePermission {
  route: string
  icono?: string | null
}

export interface AppSessionUser {
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
  anonymous: false
  loggedin: true
}

export interface PublicSession {
  user: AppSessionUser | null
  loggedin: boolean
}
