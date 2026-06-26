import { defineComponent, ref, useId, computed, useSSRContext } from "vue";
import { ssrRenderTeleport, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderSlot } from "vue/server-renderer";
import { r as resolvePersonasTheme, d as personasThemeStyle, c as personasInstitutionLogo, b as personasInstitutionName } from "./personasTheme-CJ7aLgiL.js";
import { b as _export_sfc } from "../server.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PersonasModal",
  __ssrInlineRender: true,
  props: {
    title: {},
    eyebrow: {},
    description: {},
    closeDisabled: { type: Boolean, default: false },
    theme: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    ref(null);
    ref(null);
    ref(null);
    const titleId = `pa-modal-title-${useId()}`;
    const resolvedTheme = computed(() => props.theme || resolvePersonasTheme({}));
    const themeVars = computed(() => personasThemeStyle(resolvedTheme.value));
    const institutionLogo = computed(() => personasInstitutionLogo(resolvedTheme.value, "logo"));
    const institutionName = computed(() => personasInstitutionName(resolvedTheme.value));
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="pa-modal-backdrop" role="presentation" data-v-15d11f61><section class="pa-modal" role="dialog" aria-modal="true"${ssrRenderAttr("aria-labelledby", titleId)}${ssrRenderAttr("aria-busy", props.closeDisabled ? "true" : "false")} style="${ssrRenderStyle(themeVars.value)}" tabindex="-1" data-v-15d11f61><header class="pa-modal-head" data-v-15d11f61><img class="pa-modal-logo"${ssrRenderAttr("src", institutionLogo.value)}${ssrRenderAttr("alt", institutionName.value)} data-v-15d11f61><div data-v-15d11f61>`);
        if (__props.eyebrow) {
          _push2(`<p class="eyebrow" data-v-15d11f61>${ssrInterpolate(__props.eyebrow)}</p>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`<h2${ssrRenderAttr("id", titleId)} data-v-15d11f61>${ssrInterpolate(__props.title)}</h2>`);
        if (__props.description) {
          _push2(`<p data-v-15d11f61>${ssrInterpolate(__props.description)}</p>`);
        } else {
          _push2(`<!---->`);
        }
        _push2(`</div><button class="pa-modal-close" type="button" aria-label="Cerrar"${ssrIncludeBooleanAttr(props.closeDisabled) ? " disabled" : ""} data-v-15d11f61>×</button></header><div class="pa-modal-body" data-v-15d11f61>`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent);
        _push2(`</div></section></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/PersonasModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-15d11f61"]]);
export {
  __nuxt_component_4 as _
};
//# sourceMappingURL=PersonasModal-COKcp1xQ.js.map
