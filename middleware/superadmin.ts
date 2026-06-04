import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from 'nuxt/app'
import type { PublicSession } from '~/types/session'

export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  const session = await requestFetch<PublicSession>('/api/auth/me')
  if (!session.user || session.user.kind !== 'admin') return navigateTo('/admin/login')
  if (!session.user.isSuperAdmin) return navigateTo('/admin/daycare/salas')
})
