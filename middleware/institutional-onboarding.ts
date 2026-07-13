import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { defaultAdminRoute, isInstitutionalAdminIdentity, requiresInstitutionalOnboarding } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  if (!session.user || !isInstitutionalAdminIdentity(session.user)) return navigateTo('/login')
  if (!requiresInstitutionalOnboarding(session.user)) return navigateTo(defaultAdminRoute(session.user), { replace: true })
})
