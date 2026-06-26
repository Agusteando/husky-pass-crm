import { _ as __nuxt_component_1$1 } from "./PersonasIcon-B5CnsWTN.js";
import { defineComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { b as _export_sfc } from "../server.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "EmptyState",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasIcon = __nuxt_component_1$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "empty card subtle" }, _attrs))} data-v-d10dd6b6><span class="empty-icon" aria-hidden="true" data-v-d10dd6b6>`);
      _push(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "check" }, null, _parent));
      _push(`</span><div class="empty-copy" data-v-d10dd6b6><div class="badge" data-v-d10dd6b6>Sin registros</div><h3 data-v-d10dd6b6>${ssrInterpolate(__props.title)}</h3><p data-v-d10dd6b6>${ssrInterpolate(__props.description)}</p></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EmptyState.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d10dd6b6"]]);
export {
  __nuxt_component_1 as _
};
//# sourceMappingURL=EmptyState-BVTldcCZ.js.map
