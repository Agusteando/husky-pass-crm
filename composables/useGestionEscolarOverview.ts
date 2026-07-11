import { useFetch } from 'nuxt/app'
import type { GestionEscolarOverviewResponse } from '~/types/gestionEscolar'

export function useGestionEscolarOverview() {
  return useFetch<GestionEscolarOverviewResponse>('/api/admin/gestion-escolar/overview', {
    key: 'gestion-escolar-overview',
    timeout: 15000,
    dedupe: 'defer'
  })
}
