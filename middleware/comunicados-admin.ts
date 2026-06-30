import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { hasCommunicationsAdminScope, hasGestionEscolarAdminScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  if (!session.user || (!hasCommunicationsAdminScope(session.user) && !hasGestionEscolarAdminScope(session.user))) {
    return navigateTo('/login')
  }
})
