import type { PublicSession } from '~/types/session'

export default defineNuxtRouteMiddleware(async () => {
  const session = await $fetch<PublicSession>('/api/auth/me')
  if (!session.user || session.user.kind !== 'family') {
    return navigateTo('/login')
  }
})
