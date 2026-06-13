import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "access-history-admin" | "admin" | "daycare-family" | "daycare-index" | "dev-only" | "family-index" | "family" | "guest" | "home" | "personas-autorizadas" | "superadmin"
declare module "../../node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}
declare module 'nitropack' {
  interface NitroRouteConfig {
    appMiddleware?: MiddlewareKey | MiddlewareKey[] | Record<MiddlewareKey, boolean>
  }
}