import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { defaultAdminRoute, hasDaycareAdminScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  if (!session.user) return navigateTo('/login')
  if (!hasDaycareAdminScope(session.user)) return navigateTo(defaultAdminRoute(session.user))
})
