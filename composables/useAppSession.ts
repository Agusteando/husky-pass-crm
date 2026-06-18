import { useFetch } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { anonymousSession, useRouteSessionCache } from '~/utils/routeSession'

export function useAppSession() {
  const cache = useRouteSessionCache()
  return useFetch<PublicSession>('/api/auth/me', {
    key: 'app-session',
    dedupe: 'defer',
    default: () => cache.value || anonymousSession,
    getCachedData: () => cache.value || undefined,
    onResponse({ response }) {
      cache.value = response._data as PublicSession
    },
    watch: false
  })
}
