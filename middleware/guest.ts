import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'
import { defaultFamilyRoute, hasDaycareAdminScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  if (session.user?.kind === 'admin' && hasDaycareAdminScope(session.user)) return navigateTo(session.user.isSuperAdmin ? '/admin/superadmin' : '/admin/daycare/salas')
  if (session.user?.kind === 'family') return navigateTo(defaultFamilyRoute(session.user))
})
