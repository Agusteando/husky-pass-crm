import "vue";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { j as defineNuxtRouteMiddleware, n as navigateTo } from "../server.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "vue/server-renderer";
const daycareIndex = defineNuxtRouteMiddleware((to) => {
  if (to.path === "/admin/daycare") {
    return navigateTo("/admin/daycare/salas", { replace: true });
  }
});
export {
  daycareIndex as default
};
//# sourceMappingURL=daycare-index-BZxU_gup.js.map
