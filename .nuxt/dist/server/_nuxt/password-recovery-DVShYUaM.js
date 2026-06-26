import { a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "password-recovery",
  __ssrInlineRender: true,
  setup(__props) {
    const email = ref("");
    const experience = ref("escolar");
    const loading = ref(false);
    const message = ref("");
    const error = ref("");
    const latest = ref(null);
    const resetUrl = computed(() => String(latest.value?.preview?.resetUrl || ""));
    const formattedLatest = computed(() => latest.value ? JSON.stringify(latest.value.preview, null, 2) : "");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "dev-recovery-page" }, _attrs))} data-v-bfc17d88><header class="dev-head" data-v-bfc17d88><div data-v-bfc17d88><p data-v-bfc17d88>Dev harness</p><h1 data-v-bfc17d88>Password Recovery Lab</h1></div><nav data-v-bfc17d88>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/__dev/husky-pass" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Husky Pass PDF`);
          } else {
            return [
              createTextVNode("Husky Pass PDF")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/__dev/personas-modals" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Modales PA`);
          } else {
            return [
              createTextVNode("Modales PA")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></header><section class="dev-grid" data-v-bfc17d88><form class="dev-panel" data-v-bfc17d88><h2 data-v-bfc17d88>Solicitar enlace</h2><label data-v-bfc17d88> Correo familiar <input${ssrRenderAttr("value", email.value)} type="email" required autocomplete="email" data-v-bfc17d88></label><label data-v-bfc17d88> Experiencia <select data-v-bfc17d88><option value="escolar" data-v-bfc17d88${ssrIncludeBooleanAttr(Array.isArray(experience.value) ? ssrLooseContain(experience.value, "escolar") : ssrLooseEqual(experience.value, "escolar")) ? " selected" : ""}>Experiencia Escolar</option><option value="guarderia" data-v-bfc17d88${ssrIncludeBooleanAttr(Array.isArray(experience.value) ? ssrLooseContain(experience.value, "guarderia") : ssrLooseEqual(experience.value, "guarderia")) ? " selected" : ""}>Experiencia Guardería</option></select></label><button type="submit"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-bfc17d88>${ssrInterpolate(loading.value ? "Enviando..." : "Enviar")}</button>`);
      if (message.value) {
        _push(`<p class="state" data-v-bfc17d88>${ssrInterpolate(message.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (error.value) {
        _push(`<p class="state error" data-v-bfc17d88>${ssrInterpolate(error.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</form><section class="dev-panel" data-v-bfc17d88><h2 data-v-bfc17d88>Ultimo preview local</h2><button type="button" data-v-bfc17d88>Actualizar preview</button>`);
      if (!latest.value) {
        _push(`<p class="state" data-v-bfc17d88>Sin preview local.</p>`);
      } else {
        _push(`<div class="latest-preview" data-v-bfc17d88><span data-v-bfc17d88>${ssrInterpolate(latest.value.path)}</span>`);
        if (resetUrl.value) {
          _push(`<a${ssrRenderAttr("href", resetUrl.value)} target="_blank" rel="noopener" data-v-bfc17d88>Abrir reset link</a>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<pre data-v-bfc17d88>${ssrInterpolate(formattedLatest.value)}</pre></div>`);
      }
      _push(`</section></section></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/__dev/password-recovery.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const passwordRecovery = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bfc17d88"]]);
export {
  passwordRecovery as default
};
//# sourceMappingURL=password-recovery-DVShYUaM.js.map
