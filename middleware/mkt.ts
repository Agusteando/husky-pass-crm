import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { hasMarketingAdminScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  if (!session.user || !hasMarketingAdminScope(session.user)) {
    return navigateTo('/login')
  }
})
