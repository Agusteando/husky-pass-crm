import { _ as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { defineComponent, computed, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from "vue/server-renderer";
import { v as visualIdentityForContext, e as experienceThemeVars } from "./experienceIdentity-DUHnLdZH.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LoginPanel",
  __ssrInlineRender: true,
  props: {
    brandTo: {},
    eyebrow: {},
    title: {},
    description: {},
    experience: { default: "escolar" },
    institution: { default: null }
  },
  setup(__props) {
    const props = __props;
    const identity = computed(() => visualIdentityForContext({
      experience: props.experience,
      institution: props.experience === "escolar" ? props.institution : null,
      nivel: null,
      plantel: null,
      grupo: null
    }));
    const identityVars = computed(() => experienceThemeVars(identity.value));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BrandMark = __nuxt_component_0$1;
      _push(`<main${ssrRenderAttrs(mergeProps({
        class: "login-page",
        style: identityVars.value,
        "data-experience": identity.value.context.experience
      }, _attrs))} data-v-b3f40442><section class="login-hero" data-v-b3f40442>`);
      _push(ssrRenderComponent(_component_BrandMark, {
        to: __props.brandTo,
        logo: identity.value.assets.logo,
        alt: identity.value.label
      }, null, _parent));
      _push(`<div class="hero-copy" data-v-b3f40442><p class="eyebrow" data-v-b3f40442>${ssrInterpolate(__props.eyebrow)}</p><h1 data-v-b3f40442>${ssrInterpolate(__props.title)}</h1><p data-v-b3f40442>${ssrInterpolate(__props.description)}</p></div></section><section class="login-card card" data-v-b3f40442>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</section></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LoginPanel.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b3f40442"]]);
export {
  __nuxt_component_0 as _
};
//# sourceMappingURL=LoginPanel-DubcRLKI.js.map
