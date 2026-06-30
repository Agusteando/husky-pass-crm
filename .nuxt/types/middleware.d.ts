import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "access-history-admin" | "admin" | "comunicados-admin" | "daycare-family" | "daycare-index" | "dev-only" | "family-index" | "family" | "gestion-escolar-admin" | "guest" | "home" | "personas-autorizadas" | "superadmin"
declare module 'nuxt/app' {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}