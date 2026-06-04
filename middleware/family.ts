import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  const session = await requestFetch<PublicSession>('/api/auth/me')
  if (!session.user || session.user.kind !== 'family') {
    return navigateTo('/login')
  }

  if (defaultFamilyRoute(session.user) === '/login') {
    return navigateTo('/login')
  }
})
