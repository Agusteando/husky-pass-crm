import { _ as __nuxt_component_2 } from "./PersonasProcessedPhoto-BWatNFQu.js";
import { defineComponent, computed, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { e as useRoute, b as _export_sfc } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { r as resolvePersonasTheme, c as personasInstitutionLogo, b as personasInstitutionName } from "./personasTheme-CJ7aLgiL.js";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
import "./daycare-xTCL2ANB.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { data, pending, error: loadError } = useFetch("/api/personas-autorizadas/scan", {
      query: { id: route.params.id },
      timeout: 15e3
    });
    const theme = computed(() => resolvePersonasTheme({ matricula: data.value?.matricula, plantel: data.value?.plantel, nivelEdu: data.value?.nivelEduA }));
    const institutionLogo = computed(() => personasInstitutionLogo(theme.value));
    const institutionAlt = computed(() => personasInstitutionName(theme.value));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasProcessedPhoto = __nuxt_component_2;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "validate-shell" }, _attrs))} data-v-65b34610>`);
      if (unref(pending)) {
        _push(`<section class="card validate-card empty-public" data-v-65b34610><img class="logo"${ssrRenderAttr("src", institutionLogo.value)}${ssrRenderAttr("alt", institutionAlt.value)} data-v-65b34610><h1 data-v-65b34610>Validando registro…</h1></section>`);
      } else if (unref(data)) {
        _push(`<section class="card validate-card" data-v-65b34610><img class="logo"${ssrRenderAttr("src", institutionLogo.value)}${ssrRenderAttr("alt", institutionAlt.value)} data-v-65b34610><span class="status" data-v-65b34610>Autorizado</span><div class="person-row" data-v-65b34610>`);
        if (unref(data).fotoP) {
          _push(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
            src: unref(data).fotoP,
            alt: "Persona autorizada",
            namespace: `pa-validate-${unref(route).params.id}`
          }, null, _parent));
        } else {
          _push(`<div class="fallback-photo" data-v-65b34610>PA</div>`);
        }
        _push(`<div data-v-65b34610><p class="eyebrow" data-v-65b34610>Persona autorizada</p><h1 data-v-65b34610>${ssrInterpolate(unref(data).fullnameP || "Persona autorizada")}</h1><p data-v-65b34610>${ssrInterpolate(unref(data).parentesco || "Parentesco no especificado")}</p></div></div><div class="student-box" data-v-65b34610><p class="eyebrow" data-v-65b34610>Alumno</p><h2 data-v-65b34610>${ssrInterpolate(unref(data).fullnameA || "Alumno no disponible")}</h2><p data-v-65b34610>${ssrInterpolate(unref(data).gradoA || "—")} · ${ssrInterpolate(unref(data).grupoA || "—")} · ${ssrInterpolate(unref(data).plantel || "—")}</p><small data-v-65b34610>Matrícula: ${ssrInterpolate(unref(displayMatricula)(unref(data).matricula, "—"))}</small></div></section>`);
      } else {
        _push(`<section class="card validate-card empty-public" data-v-65b34610><img class="logo"${ssrRenderAttr("src", institutionLogo.value)}${ssrRenderAttr("alt", institutionAlt.value)} data-v-65b34610><h1 data-v-65b34610>Registro no encontrado</h1><p data-v-65b34610>${ssrInterpolate(unref(loadError) ? "No fue posible validar esta persona autorizada." : "No fue posible encontrar esta persona autorizada.")}</p></section>`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/validar/persona-autorizada/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-65b34610"]]);
export {
  _id_ as default
};
//# sourceMappingURL=_id_-BLFApVNo.js.map
