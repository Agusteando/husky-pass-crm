import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, hasFamilyScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await $fetch<PublicSession>('/api/auth/me')
  if (!session.user || session.user.kind !== 'family') return navigateTo('/login')
  if (!hasFamilyScope(session.user, 'personasAutorizadas')) return navigateTo(defaultFamilyRoute(session.user))
})
