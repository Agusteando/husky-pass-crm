import type { FamilyProductScope } from './session'
import type { MarbeteTemplateMeta, PersonasTheme } from './daycare'

export type SuperAdminDirectoryScope = 'all' | 'daycare' | 'schoolFamilies' | 'internal' | 'impersonable'

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
  audience: 'daycareFamily' | 'schoolFamily' | 'multiProductFamily' | 'internal' | 'unknown'
  canImpersonate: boolean
}

export interface SuperAdminDirectoryResponse {
  planteles: string[]
  users: SuperAdminUserSummary[]
  metrics: {
    total: number
    familyUsers: number
    daycareFamilies: number
    schoolFamilies: number
    internalUsers: number
    daycareAdmins: number
    impersonable: number
  }
  filters: {
    plantel: string
    search: string
    scope: SuperAdminDirectoryScope
    limit: number
  }
}

export interface SuperAdminPassCandidate {
  personId: number | null
  userId: number
  indice: number | null
  authorizedName: string
  parentesco: string | null
  authorizedPhoto: string | null
  studentName: string
  matricula: string | null
  plantel: string
  nivel: string
  grado: string | null
  grupo: string | null
  contact: string | null
  theme: PersonasTheme
  template: MarbeteTemplateMeta | null
  readiness: {
    ok: boolean
    issues: string[]
  }
}

export interface SuperAdminPassSearchResponse {
  rows: SuperAdminPassCandidate[]
  planteles: string[]
  niveles: string[]
  filters: {
    search: string
    plantel: string
    nivel: string
    limit: number
  }
}

export interface SuperAdminEnvChecklistItem {
  key: string
  label: string
  ok: boolean
  severity: 'required' | 'warning' | 'info'
  message: string
}

export interface SuperAdminEnvChecklistGroup {
  id: string
  label: string
  items: SuperAdminEnvChecklistItem[]
}

export interface SuperAdminEnvChecklistResponse {
  ok: boolean
  checkedAt: string
  groups: SuperAdminEnvChecklistGroup[]
}
