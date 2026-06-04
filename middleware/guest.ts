import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, hasDaycareAdminScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  const session = await requestFetch<PublicSession>('/api/auth/me')
  if (session.user?.kind === 'admin' && hasDaycareAdminScope(session.user)) return navigateTo(session.user.isSuperAdmin ? '/admin/superadmin' : '/admin/daycare/salas')
  if (session.user?.kind === 'family') return navigateTo(defaultFamilyRoute(session.user))
})
