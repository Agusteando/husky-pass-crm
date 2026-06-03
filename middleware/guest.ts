import type { PublicSession } from '~/types/session'

export default defineNuxtRouteMiddleware(async () => {
  const session = await $fetch<PublicSession>('/api/auth/me')
  if (session.user?.kind === 'admin') return navigateTo('/admin/daycare')
  if (session.user?.kind === 'family') return navigateTo('/daycare')
})
