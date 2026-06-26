import { _ as __nuxt_component_1 } from "./PersonasIcon-B5CnsWTN.js";
import { defineComponent, reactive, ref, computed, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { u as useAppSession } from "./useAppSession-D-b8QDDW.js";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { e as useRoute, b as _export_sfc } from "../server.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { d as displayMatriculaCandidate } from "./matricula-C6apTRg-.js";
import { c as resolveVisualIdentity, n as normalizeExperienceName, e as experienceThemeVars } from "./experienceIdentity-DUHnLdZH.js";
import "@lucide/vue";
import "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./routeSession-DTQI2Jul.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "./sessionScopes-DtWD9iQ2.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "seguridad",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { data: session } = useAppSession();
    const form = reactive({ currentPassword: "", password: "", confirmation: "" });
    const loading = ref(false);
    const error = ref("");
    const notice = ref("");
    const identity = computed(() => resolveVisualIdentity({
      routePath: route.path,
      requestedExperience: normalizeExperienceName(String(route.query.experiencia || "")) || void 0,
      user: session.value?.user
    }).identity);
    const identityVars = computed(() => experienceThemeVars(identity.value));
    const accountLabel = computed(() => {
      const user = session.value?.user;
      if (!user) return "Cuenta familiar";
      return user.email || displayMatriculaCandidate(user.username) || user.displayName || "Cuenta familiar";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasIcon = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "security-page",
        style: identityVars.value,
        "data-experience": identity.value.context.experience,
        "data-product-panel": "account-security"
      }, _attrs))} data-v-8a7ac5db><header class="security-header" data-v-8a7ac5db><span class="security-mark" aria-hidden="true" data-v-8a7ac5db>`);
      _push(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "security" }, null, _parent));
      _push(`</span><div data-v-8a7ac5db><p data-v-8a7ac5db>${ssrInterpolate(identity.value.officialName)}</p><h1 data-v-8a7ac5db>Cambiar contraseña</h1><small data-v-8a7ac5db>${ssrInterpolate(accountLabel.value)}</small></div></header><form class="security-form card" data-v-8a7ac5db><label class="label" for="current-password" data-v-8a7ac5db> Contraseña actual <input id="current-password"${ssrRenderAttr("value", form.currentPassword)} class="input" type="password" autocomplete="current-password" required${ssrRenderAttr("aria-invalid", Boolean(error.value))} data-v-8a7ac5db></label><label class="label" for="family-new-password" data-v-8a7ac5db> Nueva contraseña <input id="family-new-password"${ssrRenderAttr("value", form.password)} class="input" type="password" autocomplete="new-password" required minlength="8"${ssrRenderAttr("aria-invalid", Boolean(error.value))} data-v-8a7ac5db></label><label class="label" for="family-new-password-confirmation" data-v-8a7ac5db> Confirmar contraseña <input id="family-new-password-confirmation"${ssrRenderAttr("value", form.confirmation)} class="input" type="password" autocomplete="new-password" required minlength="8"${ssrRenderAttr("aria-invalid", Boolean(error.value))} aria-describedby="security-message" data-v-8a7ac5db></label>`);
      if (error.value) {
        _push(`<p id="security-message" class="alert" data-v-8a7ac5db>${ssrInterpolate(error.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (notice.value) {
        _push(`<p id="security-message" class="notice" aria-live="polite" data-v-8a7ac5db>${ssrInterpolate(notice.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="security-actions" data-v-8a7ac5db><button class="btn btn-primary" type="submit"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-8a7ac5db>${ssrInterpolate(loading.value ? "Guardando..." : "Guardar contraseña")}</button></div></form></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/cuenta/seguridad.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const seguridad = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8a7ac5db"]]);
export {
  seguridad as default
};
//# sourceMappingURL=seguridad-dzvAUd3q.js.map
