import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/admin/daycare') {
    return navigateTo('/admin/daycare/salas', { replace: true })
  }
})
