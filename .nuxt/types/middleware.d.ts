import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "access-history-admin" | "admin" | "daycare-admin" | "daycare-family" | "daycare-index" | "dev-only" | "family-index" | "family" | "gestion-escolar-admin" | "guest" | "home" | "institutional-onboarding" | "mkt" | "personas-autorizadas" | "superadmin"
declare module 'nuxt/app' {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}