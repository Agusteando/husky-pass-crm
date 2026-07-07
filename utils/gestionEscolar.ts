import type { GestionEscolarScope, GestionEscolarScopeTree } from '~/types/gestionEscolar'
import { normalizeSchoolGrade, normalizeSchoolPlantel } from './schoolCatalog'

export function formatGestionScope(scope: GestionEscolarScope) {
  if (scope.isGlobal) return 'Todo el colegio'
  const plantel = normalizeSchoolPlantel(scope.plantel)
  const grado = normalizeSchoolGrade(scope.grado, plantel)
  return [
    plantel && `Plantel ${plantel}`,
    grado && `Grado ${grado}`
  ].filter(Boolean).join(' / ') || 'Plantel pendiente'
}

export function emptyGestionScopeTree(): GestionEscolarScopeTree {
  return { planteles: [] }
}
