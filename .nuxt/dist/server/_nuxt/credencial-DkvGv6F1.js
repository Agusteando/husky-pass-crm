import { defineComponent, withAsyncContext, useSSRContext } from "vue";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { e as useRoute, n as navigateTo } from "../server.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "credencial",
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    [__temp, __restore] = withAsyncContext(() => navigateTo(`/familia/personas-autorizadas/${route.params.id}/marbete`, { replace: true })), await __temp, __restore();
    return () => {
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/[id]/credencial.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=credencial-DkvGv6F1.js.map
