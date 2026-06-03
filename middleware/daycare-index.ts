import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware(() => navigateTo('/admin/daycare/salas', { replace: true }))
