import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import type { PublicSession } from '~/types/session'

export default defineNuxtRouteMiddleware(async () => {
  const session = await $fetch<PublicSession>('/api/auth/me')
  if (!session.user || session.user.kind !== 'admin') return navigateTo('/admin/login')
  if (!session.user.isSuperAdmin) return navigateTo('/admin/daycare')
})
