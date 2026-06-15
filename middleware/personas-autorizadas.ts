import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { defaultFamilyRoute, hasFamilyScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  if (!session.user || session.user.kind !== 'family') return navigateTo('/login')
  if (!hasFamilyScope(session.user, 'personasAutorizadas')) return navigateTo(defaultFamilyRoute(session.user))
})
