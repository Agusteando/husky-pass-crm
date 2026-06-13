import { abortNavigation, createError, defineNuxtRouteMiddleware } from 'nuxt/app'

export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.dev) {
    return abortNavigation(createError({ statusCode: 404, statusMessage: 'No disponible.' }))
  }
})
