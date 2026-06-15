import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { defaultFamilyRoute, hasFamilyScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  const canDaycare = hasFamilyScope(session.user, 'daycare')
  const canPa = hasFamilyScope(session.user, 'personasAutorizadas')
  if (Number(canDaycare) + Number(canPa) <= 1) {
    const target = defaultFamilyRoute(session.user)
    if (target !== '/familia') return navigateTo(target)
  }
})
