import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import type { PublicSession } from '~/types/session'
import { hasDaycareAdminScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await $fetch<PublicSession>('/api/auth/me')
  if (!session.user || !hasDaycareAdminScope(session.user)) {
    return navigateTo('/admin/login')
  }
})
