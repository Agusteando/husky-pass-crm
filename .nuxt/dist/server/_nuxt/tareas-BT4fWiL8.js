import { _ as __nuxt_component_0 } from "./AdminResourceModule-7ZsQPB4H.js";
import { defineComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "./AdminModuleTabs-CA5msHHS.js";
import "../server.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "./EmptyState-BVTldcCZ.js";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./daycare-xTCL2ANB.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tareas",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminResourceModule = __nuxt_component_0;
      _push(ssrRenderComponent(_component_AdminResourceModule, mergeProps({
        type: "hw",
        title: "Tareas",
        description: "Publicaciones de tarea que aparecerán en la experiencia familiar de guardería.",
        "action-label": "Nueva tarea"
      }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/daycare/salas/[id]/tareas.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=tareas-BT4fWiL8.js.map
