import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from 'nuxt/app'
import type { PublicSession } from '~/types/session'

function canOpenAccessHistory(session: PublicSession) {
  const user = session.user
  if (!user || user.kind !== 'admin') return false
  if (user.isSuperAdmin) return true
  const routeText = user.routes.map((route) => route.route).join(' ')
  const roleText = user.roles.join(' ')
  return /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|marbete|validar|historial|acceso|husky/i.test(`${routeText} ${roleText}`)
}

export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  const session = await requestFetch<PublicSession>('/api/auth/me')
  if (!canOpenAccessHistory(session)) return navigateTo('/admin/login')
})
