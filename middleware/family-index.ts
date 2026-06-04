import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, hasFamilyScope } from '~/utils/sessionScopes'

export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  const session = await requestFetch<PublicSession>('/api/auth/me')
  const canDaycare = hasFamilyScope(session.user, 'daycare')
  const canPa = hasFamilyScope(session.user, 'personasAutorizadas')
  if (Number(canDaycare) + Number(canPa) <= 1) {
    const target = defaultFamilyRoute(session.user)
    if (target !== '/familia') return navigateTo(target)
  }
})
