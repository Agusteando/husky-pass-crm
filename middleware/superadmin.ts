import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { defaultAdminRoute } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  if (!session.user || session.user.kind !== 'admin') return navigateTo('/login')
  if (!session.user.isSuperAdmin) return navigateTo(defaultAdminRoute(session.user))
})
