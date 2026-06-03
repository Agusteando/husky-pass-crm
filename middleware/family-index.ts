import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, hasFamilyScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const session = await $fetch<PublicSession>('/api/auth/me')
  const canDaycare = hasFamilyScope(session.user, 'daycare')
  const canPa = hasFamilyScope(session.user, 'personasAutorizadas')
  if (Number(canDaycare) + Number(canPa) <= 1) {
    const target = defaultFamilyRoute(session.user)
    if (target !== '/familia') return navigateTo(target)
  }
})
