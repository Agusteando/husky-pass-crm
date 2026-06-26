import { a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminModuleTabs",
  __ssrInlineRender: true,
  props: {
    salaId: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<nav${ssrRenderAttrs(mergeProps({
        class: "admin-module-tabs",
        "aria-label": "Módulos de sala"
      }, _attrs))} data-v-58f008e3>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/admin/daycare/salas/${__props.salaId}`,
        "exact-active-class": "active",
        "data-diagnostic-link": "tab-resumen"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Resumen`);
          } else {
            return [
              createTextVNode("Resumen")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/admin/daycare/salas/${__props.salaId}/familias`,
        "active-class": "active",
        "data-diagnostic-link": "tab-familias"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Familias`);
          } else {
            return [
              createTextVNode("Familias")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/admin/daycare/salas/${__props.salaId}/tareas`,
        "active-class": "active",
        "data-diagnostic-link": "tab-tareas"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Tareas`);
          } else {
            return [
              createTextVNode("Tareas")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/admin/daycare/salas/${__props.salaId}/avisos`,
        "active-class": "active",
        "data-diagnostic-link": "tab-avisos"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Avisos`);
          } else {
            return [
              createTextVNode("Avisos")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/admin/daycare/salas/${__props.salaId}/calendario`,
        "active-class": "active",
        "data-diagnostic-link": "tab-calendario"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Calendario`);
          } else {
            return [
              createTextVNode("Calendario")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminModuleTabs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-58f008e3"]]);
export {
  __nuxt_component_0 as _
};
//# sourceMappingURL=AdminModuleTabs-CA5msHHS.js.map
