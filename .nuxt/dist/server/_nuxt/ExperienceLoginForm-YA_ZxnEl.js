import { a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { defineComponent, reactive, ref, computed, mergeProps, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrIncludeBooleanAttr } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { r as recoveryRouteForExperience } from "./experienceIdentity-DUHnLdZH.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ExperienceLoginForm",
  __ssrInlineRender: true,
  props: {
    experience: {},
    heading: {}
  },
  setup(__props) {
    const props = __props;
    const form = reactive({ login: "", password: "" });
    const loading = ref(false);
    const error = ref("");
    const recoveryTo = computed(() => recoveryRouteForExperience(props.experience));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<form${ssrRenderAttrs(mergeProps({ class: "stack" }, _attrs))} data-v-34eb8f16><div data-v-34eb8f16><h2 data-v-34eb8f16>${ssrInterpolate(__props.heading)}</h2></div><label class="label" data-v-34eb8f16> Usuario o correo <input${ssrRenderAttr("value", form.login)} class="input" autocomplete="username" required data-v-34eb8f16></label><label class="label" data-v-34eb8f16> Contraseña <input${ssrRenderAttr("value", form.password)} class="input" type="password" autocomplete="current-password" required data-v-34eb8f16></label><div class="form-link-row" data-v-34eb8f16>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: recoveryTo.value }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Olvidaste tu contraseña`);
          } else {
            return [
              createTextVNode("Olvidaste tu contraseña")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (error.value) {
        _push(`<p class="alert" data-v-34eb8f16>${ssrInterpolate(error.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn btn-primary" type="submit"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-34eb8f16>${ssrInterpolate(loading.value ? "Validando..." : "Ingresar")}</button></form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ExperienceLoginForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-34eb8f16"]]);
export {
  __nuxt_component_1 as _
};
//# sourceMappingURL=ExperienceLoginForm-YA_ZxnEl.js.map
