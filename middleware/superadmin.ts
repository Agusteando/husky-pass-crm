import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { getRouteSession } from '~/utils/routeSession'

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  if (!session.user || session.user.kind !== 'admin') return navigateTo('/admin/login')
  if (!session.user.isSuperAdmin) return navigateTo('/admin/daycare/salas')
})
