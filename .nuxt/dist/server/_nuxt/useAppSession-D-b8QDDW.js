import "vue";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { u as useRouteSessionCache, a as anonymousSession } from "./routeSession-DTQI2Jul.js";
function useAppSession() {
  const cache = useRouteSessionCache();
  return useFetch("/api/auth/me", {
    key: "app-session",
    dedupe: "defer",
    default: () => cache.value || anonymousSession,
    getCachedData: () => cache.value || void 0,
    onResponse({ response }) {
      cache.value = response._data;
    },
    watch: false
  });
}
export {
  useAppSession as u
};
//# sourceMappingURL=useAppSession-D-b8QDDW.js.map
