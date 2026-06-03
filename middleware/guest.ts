import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, hasDaycareAdminScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await $fetch<PublicSession>('/api/auth/me')
  if (session.user?.kind === 'admin' && hasDaycareAdminScope(session.user)) return navigateTo('/admin/daycare')
  if (session.user?.kind === 'family') return navigateTo(defaultFamilyRoute(session.user))
})
