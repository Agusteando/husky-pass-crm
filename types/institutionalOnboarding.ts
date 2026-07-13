import type { AppSessionUser } from './session'

export type InstitutionalAccessRole = 'schoolAdmin' | 'marketingAdmin' | 'daycareAdmin'
export type InstitutionalScopeKind = 'planteles' | 'unidades'

export interface InstitutionalRoleOption {
  key: InstitutionalAccessRole
  title: string
  shortTitle: string
  description: string
  icon: 'school' | 'marketing' | 'daycare'
  scopeKind: InstitutionalScopeKind
  destination: string
}

export interface InstitutionalPlantelOption {
  value: string
  label: string
  shortLabel: string
  city: 'Metepec' | 'Toluca'
  level: 'Guardería' | 'Preescolar' | 'Primaria' | 'Secundaria'
  institution: 'IECS' | 'IEDIS'
}

export interface InstitutionalOnboardingResponse {
  account: {
    id: number
    displayName: string
    email: string
    picture?: string | null
  }
  roles: InstitutionalRoleOption[]
  planteles: InstitutionalPlantelOption[]
  unidades: string[]
  current: {
    role: InstitutionalAccessRole | null
    planteles: string[]
    unidades: string[]
    complete: boolean
    defaultPath: string
  }
}

export interface CompleteInstitutionalOnboardingInput {
  role: InstitutionalAccessRole
  planteles: string[]
  unidades: string[]
}

export interface CompleteInstitutionalOnboardingResponse {
  user: AppSessionUser
  loggedin: true
  defaultPath: string
}
