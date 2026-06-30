import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { getRouteSession } from '~/utils/routeSession'

function canOpenAccessHistory(session: PublicSession) {
  const user = session.user
  if (!user || user.kind !== 'admin') return false
  if (user.isSuperAdmin) return true
  const routeText = user.routes.map((route) => route.route).join(' ')
  const roleText = user.roles.join(' ')
  return /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|marbete|validar|historial|acceso|husky/i.test(`${routeText} ${roleText}`)
}

export default defineNuxtRouteMiddleware(async () => {
  const session = await getRouteSession()
  if (!canOpenAccessHistory(session)) return navigateTo('/login')
})
