import { defineComponent, useSlots, computed, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderSlot } from "vue/server-renderer";
import { b as _export_sfc } from "../server.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PersonasSectionHeading",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: { default: "" },
    meta: { default: "" },
    compact: { type: Boolean, default: false }
  },
  setup(__props) {
    const slots = useSlots();
    const hasActions = computed(() => Boolean(slots.actions));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: "pa-section-heading",
        "data-compact": __props.compact ? "true" : "false"
      }, _attrs))} data-v-b25eccb6><span class="pa-section-accent" aria-hidden="true" data-v-b25eccb6></span><div class="pa-section-copy" data-v-b25eccb6><h2 data-v-b25eccb6>${ssrInterpolate(__props.title)}</h2>`);
      if (__props.description) {
        _push(`<p data-v-b25eccb6>${ssrInterpolate(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.meta) {
        _push(`<span class="pa-section-meta" data-v-b25eccb6>${ssrInterpolate(__props.meta)}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (hasActions.value) {
        _push(`<div class="pa-section-actions" data-v-b25eccb6>`);
        ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/PersonasSectionHeading.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b25eccb6"]]);
export {
  __nuxt_component_2 as _
};
//# sourceMappingURL=PersonasSectionHeading-Ts5ucEUy.js.map
