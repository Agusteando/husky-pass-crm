import type { InstitutionalAccessRole, InstitutionalPlantelOption, InstitutionalRoleOption } from '~/types/institutionalOnboarding'

export const INSTITUTIONAL_ONBOARDING_ROUTE = '/onboarding/institucional'

export const INSTITUTIONAL_ROLE_OPTIONS: InstitutionalRoleOption[] = [
  {
    key: 'schoolAdmin',
    title: 'Control Escolar',
    shortTitle: 'Escolar',
    description: 'Familias, comunicados y operación escolar',
    icon: 'school',
    scopeKind: 'planteles',
    destination: '/admin/gestion-escolar'
  },
  {
    key: 'marketingAdmin',
    title: 'Mercadotecnia',
    shortTitle: 'MKT',
    description: 'Matrícula, seguimiento y lectura por plantel',
    icon: 'marketing',
    scopeKind: 'planteles',
    destination: '/mkt'
  },
  {
    key: 'daycareAdmin',
    title: 'Guardería',
    shortTitle: 'Guardería',
    description: 'Salas, familias y operación diaria',
    icon: 'daycare',
    scopeKind: 'unidades',
    destination: '/admin/daycare/salas'
  }
]

export const INSTITUTIONAL_PLANTEL_OPTIONS: InstitutionalPlantelOption[] = [
  { value: 'PREEM', label: 'Preescolar Metepec', shortLabel: 'Preescolar', city: 'Metepec', level: 'Preescolar', institution: 'IECS' },
  { value: 'PM', label: 'Primaria Metepec', shortLabel: 'Primaria', city: 'Metepec', level: 'Primaria', institution: 'IEDIS' },
  { value: 'SM', label: 'Secundaria Metepec', shortLabel: 'Secundaria', city: 'Metepec', level: 'Secundaria', institution: 'IEDIS' },
  { value: 'GM', label: 'Guardería Metepec', shortLabel: 'Guardería', city: 'Metepec', level: 'Guardería', institution: 'IECS' },
  { value: 'CT', label: 'Preescolar Toluca', shortLabel: 'Preescolar', city: 'Toluca', level: 'Preescolar', institution: 'IECS' },
  { value: 'PT', label: 'Primaria Toluca', shortLabel: 'Primaria', city: 'Toluca', level: 'Primaria', institution: 'IEDIS' },
  { value: 'ST', label: 'Secundaria Toluca', shortLabel: 'Secundaria', city: 'Toluca', level: 'Secundaria', institution: 'IEDIS' }
]

export function plantelOptionsForRole(role: InstitutionalAccessRole | null | undefined) {
  if (role === 'schoolAdmin') {
    return INSTITUTIONAL_PLANTEL_OPTIONS.filter((plantel) => plantel.level !== 'Guardería')
  }
  return INSTITUTIONAL_PLANTEL_OPTIONS
}

export function institutionalRoleOption(role: InstitutionalAccessRole | null | undefined) {
  return INSTITUTIONAL_ROLE_OPTIONS.find((option) => option.key === role) || null
}
