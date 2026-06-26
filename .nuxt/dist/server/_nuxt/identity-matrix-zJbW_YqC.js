import { e as useRoute, i as useRouter, _ as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_4 } from "./PersonasModal-COKcp1xQ.js";
import { defineComponent, computed, ref, watch, mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { n as normalizeExperienceName, b as normalizeInstitutionName, v as visualIdentityForContext, e as experienceThemeVars } from "./experienceIdentity-DUHnLdZH.js";
import { r as resolvePersonasTheme } from "./personasTheme-CJ7aLgiL.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "./matricula-C6apTRg-.js";
import "./sessionScopes-DtWD9iQ2.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "identity-matrix",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const state = computed(() => String(route.query.state || "content"));
    const modal = ref(String(route.query.modal || "") === "1");
    const experience = computed(() => normalizeExperienceName(String(route.query.experience || "escolar")) || "escolar");
    const context = computed(() => ({
      experience: experience.value,
      institution: experience.value === "escolar" ? normalizeInstitutionName(String(route.query.institution || "")) : null,
      nivel: String(route.query.nivel || (experience.value === "guarderia" ? "guarderia" : "")).trim() || null,
      plantel: String(route.query.plantel || "").trim() || null,
      grupo: String(route.query.grupo || "").trim() || null
    }));
    const identity = computed(() => visualIdentityForContext(context.value));
    const vars = computed(() => experienceThemeVars(identity.value));
    const theme = computed(() => resolvePersonasTheme({
      experience: context.value.experience,
      institution: context.value.institution,
      nivelEdu: context.value.nivel,
      plantel: context.value.plantel,
      grupo: context.value.grupo
    }));
    const contextLine = computed(() => [
      identity.value.context.experience,
      identity.value.context.institution,
      identity.value.context.nivel,
      identity.value.context.plantel,
      identity.value.context.grupo
    ].filter(Boolean).join(" / ") || "Contexto neutral");
    watch(modal, (value) => {
      if (String(route.query.modal || "") === (value ? "1" : "")) return;
      router.replace({ path: route.path, query: { ...route.query, modal: value ? "1" : void 0 } });
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BrandMark = __nuxt_component_0;
      const _component_FamilyPersonasModal = __nuxt_component_4;
      _push(`<main${ssrRenderAttrs(mergeProps({
        class: "identity-lab",
        style: vars.value,
        "data-experience": identity.value.context.experience,
        "data-institution": identity.value.context.institution || "neutral",
        "data-nivel": identity.value.context.nivel || "neutral",
        "data-state": state.value
      }, _attrs))} data-v-43c0d4f3><header class="lab-topbar" data-v-43c0d4f3>`);
      _push(ssrRenderComponent(_component_BrandMark, {
        to: "/__dev/identity-matrix",
        logo: identity.value.assets.logo,
        alt: identity.value.label
      }, null, _parent));
      _push(`<div data-v-43c0d4f3><p class="eyebrow" data-v-43c0d4f3>${ssrInterpolate(identity.value.officialName)}</p><h1 data-v-43c0d4f3>${ssrInterpolate(identity.value.label)} · ${ssrInterpolate(identity.value.levelLabel)}</h1><small data-v-43c0d4f3>${ssrInterpolate(contextLine.value)}</small></div></header><section class="lab-grid" data-v-43c0d4f3><article class="lab-panel" data-v-43c0d4f3><p class="eyebrow" data-v-43c0d4f3>Navegación</p><nav class="lab-nav" aria-label="Navegación de prueba" data-v-43c0d4f3><a class="active" href="#" data-v-43c0d4f3>Inicio</a><a href="#" data-v-43c0d4f3>Datos</a><a href="#" data-v-43c0d4f3>Seguridad</a></nav></article><article class="lab-panel state-panel" data-v-43c0d4f3><p class="eyebrow" data-v-43c0d4f3>Estado</p>`);
      if (state.value === "loading") {
        _push(`<div class="state-box" data-v-43c0d4f3>Cargando contexto...</div>`);
      } else if (state.value === "error") {
        _push(`<div class="alert" data-v-43c0d4f3>No fue posible resolver la identidad.</div>`);
      } else if (state.value === "empty") {
        _push(`<div class="state-box" data-v-43c0d4f3>Sin información disponible.</div>`);
      } else {
        _push(`<div class="state-box" data-v-43c0d4f3>Contexto resuelto.</div>`);
      }
      _push(`</article><article class="lab-panel asset-panel" data-v-43c0d4f3><p class="eyebrow" data-v-43c0d4f3>Assets permitidos</p><img class="asset-logo"${ssrRenderAttr("src", identity.value.assets.logo)}${ssrRenderAttr("alt", identity.value.label)} data-identity-asset="logo" data-v-43c0d4f3>`);
      if (identity.value.assets.ambassador) {
        _push(`<img class="asset-ambassador"${ssrRenderAttr("src", identity.value.assets.ambassador)} alt="" data-identity-asset="ambassador" data-v-43c0d4f3>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<ul data-v-43c0d4f3><!--[-->`);
      ssrRenderList(identity.value.allowedAssetFamilies, (family) => {
        _push(`<li data-v-43c0d4f3>${ssrInterpolate(family)}</li>`);
      });
      _push(`<!--]--></ul></article><article class="lab-panel" data-v-43c0d4f3><p class="eyebrow" data-v-43c0d4f3>Formulario</p><label class="label" data-v-43c0d4f3> Campo de prueba <input class="input" value="Dato realista" data-v-43c0d4f3></label><button class="btn btn-primary" type="button" data-v-43c0d4f3>Acción primaria</button></article></section>`);
      if (modal.value) {
        _push(ssrRenderComponent(_component_FamilyPersonasModal, {
          title: "Modal de identidad",
          eyebrow: "Contexto heredado",
          description: "Este modal consume el tema activo.",
          theme: theme.value,
          onClose: ($event) => modal.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p class="modal-copy" data-v-43c0d4f3${_scopeId}>Experiencia: ${ssrInterpolate(identity.value.officialName)}. Institución: ${ssrInterpolate(identity.value.context.institution || "neutral")}.</p><button class="btn btn-primary" type="button" data-v-43c0d4f3${_scopeId}>Aceptar</button>`);
            } else {
              return [
                createVNode("p", { class: "modal-copy" }, "Experiencia: " + toDisplayString(identity.value.officialName) + ". Institución: " + toDisplayString(identity.value.context.institution || "neutral") + ".", 1),
                createVNode("button", {
                  class: "btn btn-primary",
                  type: "button",
                  onClick: ($event) => modal.value = false
                }, "Aceptar", 8, ["onClick"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/__dev/identity-matrix.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const identityMatrix = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-43c0d4f3"]]);
export {
  identityMatrix as default
};
//# sourceMappingURL=identity-matrix-zJbW_YqC.js.map
