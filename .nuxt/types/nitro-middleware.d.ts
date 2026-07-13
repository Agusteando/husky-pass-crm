export type MiddlewareKey = "access-history-admin" | "admin" | "daycare-admin" | "daycare-family" | "daycare-index" | "dev-only" | "family-index" | "family" | "gestion-escolar-admin" | "guest" | "home" | "institutional-onboarding" | "mkt" | "personas-autorizadas" | "superadmin"
declare module 'nitropack' {
  interface NitroRouteConfig {
    appMiddleware?: MiddlewareKey | MiddlewareKey[] | Record<MiddlewareKey, boolean>
  }
  interface NitroRouteRules {
    appMiddleware?: MiddlewareKey | MiddlewareKey[] | Record<MiddlewareKey, boolean>
  }
}
declare module 'nitropack/types' {
  interface NitroRouteConfig {
    appMiddleware?: MiddlewareKey | MiddlewareKey[] | Record<MiddlewareKey, boolean>
  }
  interface NitroRouteRules {
    appMiddleware?: MiddlewareKey | MiddlewareKey[] | Record<MiddlewareKey, boolean>
  }
}