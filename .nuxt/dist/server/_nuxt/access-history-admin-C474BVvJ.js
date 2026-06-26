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
function canOpenAccessHistory(session) {
  const user = session.user;
  if (!user || user.kind !== "admin") return false;
  if (user.isSuperAdmin) return true;
  const routeText = user.routes.map((route) => route.route).join(" ");
  const roleText = user.roles.join(" ");
  return /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|marbete|validar|historial|acceso|husky/i.test(`${routeText} ${roleText}`);
}
const accessHistoryAdmin = defineNuxtRouteMiddleware(async () => {
  let __temp, __restore;
  const session = ([__temp, __restore] = executeAsync(() => getRouteSession()), __temp = await __temp, __restore(), __temp);
  if (!canOpenAccessHistory(session)) return navigateTo("/admin/login");
});
export {
  accessHistoryAdmin as default
};
//# sourceMappingURL=access-history-admin-C474BVvJ.js.map
