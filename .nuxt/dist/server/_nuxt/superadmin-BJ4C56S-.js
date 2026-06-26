import { executeAsync } from "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "vue";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { j as defineNuxtRouteMiddleware, n as navigateTo } from "../server.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { g as getRouteSession } from "./routeSession-DTQI2Jul.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "vue/server-renderer";
import "./ssr-BC0VN6Ct.js";
const superadmin = defineNuxtRouteMiddleware(async () => {
  let __temp, __restore;
  const session = ([__temp, __restore] = executeAsync(() => getRouteSession()), __temp = await __temp, __restore(), __temp);
  if (!session.user || session.user.kind !== "admin") return navigateTo("/admin/login");
  if (!session.user.isSuperAdmin) return navigateTo("/admin/daycare/salas");
});
export {
  superadmin as default
};
//# sourceMappingURL=superadmin-BJ4C56S-.js.map
