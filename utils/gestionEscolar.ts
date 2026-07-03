import type { GestionEscolarAccessProfileKey, GestionEscolarCapability, GestionEscolarScope, GestionEscolarScopeTree } from '~/types/gestionEscolar'

export const GESTION_CAPABILITY_ORDER: GestionEscolarCapability[] = [
  'familias.view',
  'familias.impersonate',
  'comunicados.create',
  'comunicados.publish',
  'encuestas.manage',
  'convenios.manage',
  'convenios.publish'
]

export const GESTION_CAPABILITY_LABELS: Record<GestionEscolarCapability, string> = {
  'familias.view': 'Familias',
  'familias.impersonate': 'Vista familiar',
  'comunicados.create': 'Borradores',
  'comunicados.publish': 'Publicar comunicados',
  'encuestas.manage': 'Encuestas',
  'convenios.manage': 'Convenios',
  'convenios.publish': 'Publicar convenios'
}

export const GESTION_ACCESS_PROFILES: Array<{
  key: Exclude<GestionEscolarAccessProfileKey, 'custom'>
  label: string
  shortLabel: string
  caption: string
  capabilities: GestionEscolarCapability[]
}> = [
  {
    key: 'support',
    label: 'Soporte familiar',
    shortLabel: 'Soporte',
    caption: 'Consulta familias y abre vista familiar.',
    capabilities: ['familias.view', 'familias.impersonate']
  },
  {
    key: 'operator',
    label: 'Operación escolar',
    shortLabel: 'Operación',
    caption: 'Familias, borradores y contenido editable.',
    capabilities: ['familias.view', 'comunicados.create', 'encuestas.manage', 'convenios.manage']
  },
  {
    key: 'publisher',
    label: 'Publicación escolar',
    shortLabel: 'Publicación',
    caption: 'Crea, programa y publica contenido.',
    capabilities: ['familias.view', 'comunicados.create', 'comunicados.publish', 'encuestas.manage', 'convenios.manage', 'convenios.publish']
  },
  {
    key: 'content',
    label: 'Contenido',
    shortLabel: 'Contenido',
    caption: 'Encuestas y convenios con consulta familiar.',
    capabilities: ['familias.view', 'encuestas.manage', 'convenios.manage', 'convenios.publish']
  },
  {
    key: 'full',
    label: 'Acceso total',
    shortLabel: 'Total',
    caption: 'Todas las capacidades del módulo.',
    capabilities: [...GESTION_CAPABILITY_ORDER]
  }
]

export function normalizeGestionCapabilities(input: GestionEscolarCapability[]) {
  const set = new Set(input)
  if (set.has('familias.impersonate')) set.add('familias.view')
  if (set.has('comunicados.publish')) set.add('comunicados.create')
  if (set.has('convenios.publish')) set.add('convenios.manage')
  return GESTION_CAPABILITY_ORDER.filter((capability) => set.has(capability))
}

export function sameGestionCapabilities(a: GestionEscolarCapability[], b: GestionEscolarCapability[]) {
  const left = normalizeGestionCapabilities(a)
  const right = normalizeGestionCapabilities(b)
  return left.length === right.length && left.every((capability, index) => capability === right[index])
}

export function resolveGestionProfile(capabilities: GestionEscolarCapability[]): GestionEscolarAccessProfileKey {
  const normalized = normalizeGestionCapabilities(capabilities)
  return GESTION_ACCESS_PROFILES.find((profile) => sameGestionCapabilities(profile.capabilities, normalized))?.key || 'custom'
}

export function gestionProfileLabel(profile: GestionEscolarAccessProfileKey) {
  if (profile === 'custom') return 'Personalizado'
  return GESTION_ACCESS_PROFILES.find((item) => item.key === profile)?.shortLabel || 'Personalizado'
}

export function formatGestionScope(scope: GestionEscolarScope) {
  if (scope.isGlobal) return 'Todo el colegio'
  return [
    scope.plantel && `Plantel ${scope.plantel}`,
    scope.nivel,
    scope.grado && `${scope.grado}`,
    scope.grupo && `Grupo ${scope.grupo}`
  ].filter(Boolean).join(' · ') || 'Plantel pendiente'
}

export function emptyGestionScopeTree(): GestionEscolarScopeTree {
  return { planteles: [] }
}
