import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { defaultAdminRoute, effectiveAdminUser } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  const admin = effectiveAdminUser(session.user)
  if (!admin) return navigateTo('/login')
  if (!admin.isSuperAdmin) return navigateTo(defaultAdminRoute(admin))
})
