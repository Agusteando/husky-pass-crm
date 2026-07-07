import type { GestionEscolarScope, GestionEscolarScopeTree } from '~/types/gestionEscolar'

export function formatGestionScope(scope: GestionEscolarScope) {
  if (scope.isGlobal) return 'Todo el colegio'
  return [
    scope.plantel && `Plantel ${scope.plantel}`,
    scope.nivel,
    scope.grado && `${scope.grado}`,
    scope.grupo && `Grupo ${scope.grupo}`
  ].filter(Boolean).join(' / ') || 'Plantel pendiente'
}

export function emptyGestionScopeTree(): GestionEscolarScopeTree {
  return { planteles: [] }
}
