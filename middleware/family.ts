import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { defaultFamilyRoute } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async (to) => {
  const session = await getRouteSession()
  if (!session.user || session.user.kind !== 'family') {
    if (to.path.startsWith('/familia/daycare')) return navigateTo('/login')
    return navigateTo('/login')
  }

  if (defaultFamilyRoute(session.user) === '/login') {
    return navigateTo('/login')
  }
})
