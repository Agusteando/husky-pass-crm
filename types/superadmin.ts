import type { FamilyProductScope } from './session'

export interface SuperAdminUserSummary {
  id: number
  email: string | null
  username: string | null
  displayName: string | null
  picture: string | null
  role: string | null
  plantel: string[]
  campus: string | null
  empresa: string | null
  unidad: string[]
  sala: string | null
  nombre_nino: string | null
  routes: string[]
  productScopes: FamilyProductScope[]
  adminScopes: string[]
  canImpersonate: boolean
}

export interface SuperAdminDirectoryResponse {
  planteles: string[]
  users: SuperAdminUserSummary[]
  metrics: {
    total: number
    daycareFamilies: number
    personasAutorizadasFamilies: number
    daycareAdmins: number
    impersonable: number
  }
  filters: {
    plantel: string
    search: string
    limit: number
  }
}
