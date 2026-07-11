import type { GestionEscolarCapability } from '~/types/gestionEscolar'

export const GESTION_ESCOLAR_BASE_CAPABILITIES: GestionEscolarCapability[] = [
  'familias.view'
]

export const GESTION_ESCOLAR_OPTIONAL_CAPABILITIES: GestionEscolarCapability[] = [
  'familias.impersonate',
  'comunicados.create',
  'comunicados.publish',
  'encuestas.manage',
  'convenios.manage',
  'convenios.publish'
]

export const GESTION_ESCOLAR_CAPABILITIES: GestionEscolarCapability[] = [
  ...GESTION_ESCOLAR_BASE_CAPABILITIES,
  ...GESTION_ESCOLAR_OPTIONAL_CAPABILITIES
]

export const GESTION_ESCOLAR_PERMISSION_LABELS: Record<GestionEscolarCapability, string> = {
  'familias.view': 'Familias',
  'familias.impersonate': 'Vista familiar',
  'comunicados.create': 'Preparar comunicados',
  'comunicados.publish': 'Publicar comunicados',
  'encuestas.manage': 'Encuestas',
  'convenios.manage': 'Convenios',
  'convenios.publish': 'Publicar convenios'
}
