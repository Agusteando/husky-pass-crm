import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { hasDaycareAdminScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  const session = await requestFetch<PublicSession>('/api/auth/me')
  if (!session.user || !hasDaycareAdminScope(session.user)) {
    return navigateTo('/admin/login')
  }
})
