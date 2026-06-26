import { _ as __nuxt_component_0 } from "./FamilyResourceList-D8X1qjhF.js";
import { defineComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "./ResourceCard-Bp89BKc3.js";
import "./daycare-xTCL2ANB.js";
import "./EmptyState-BVTldcCZ.js";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "avisos",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyResourceList = __nuxt_component_0;
      _push(ssrRenderComponent(_component_FamilyResourceList, mergeProps({
        type: "news",
        title: "Avisos",
        description: "Comunicados y circulares de guardería."
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/daycare/avisos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=avisos-UGuyl_J8.js.map
