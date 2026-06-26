import { _ as __nuxt_component_0, a as __nuxt_component_1, b as __nuxt_component_3 } from "./PersonasPageHeader-CbpYMeMe.js";
import { _ as __nuxt_component_2 } from "./PersonasSectionHeading-Ts5ucEUy.js";
import { defineComponent, computed, mergeProps, withCtx, createVNode, openBlock, createBlock, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderClass, ssrRenderAttr } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { b as _export_sfc } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "./PersonasProcessedPhoto-BWatNFQu.js";
import "./daycare-xTCL2ANB.js";
import "./AccountMenu-Cc9CsO5z.js";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "./matricula-C6apTRg-.js";
import "./_virtual_public-BTp6Nzoa.js";
import "./personasTheme-CJ7aLgiL.js";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
import "./usePersonasTheme-CmVh5mbY.js";
import "./routeSession-DTQI2Jul.js";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "./useAppSession-D-b8QDDW.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "encuestas",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: config } = useFetch("/api/personas-autorizadas/config", { key: "pa-survey-config", timeout: 15e3 });
    const emptySurvey = { enabled: false, title: "Encuesta", embedUrl: "" };
    const activeSurvey = computed(() => config.value?.activeSurvey || emptySurvey);
    const surveyAvailable = computed(() => Boolean(activeSurvey.value.enabled && activeSurvey.value.embedUrl));
    const nivelLabel = computed(() => nivelLabels[config.value?.activeSurveyNivel || "escolar"]);
    const nivelLabels = {
      escolar: "Escolar",
      preescolar: "Preescolar",
      primaria: "Primaria",
      secundaria: "Secundaria",
      daycare: "Guardería"
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAutorizadasShell = __nuxt_component_0;
      const _component_FamilyPersonasPageHeader = __nuxt_component_1;
      const _component_FamilyPersonasSectionHeading = __nuxt_component_2;
      const _component_FamilyPersonasAmbassador = __nuxt_component_3;
      _push(ssrRenderComponent(_component_FamilyPersonasAutorizadasShell, mergeProps({ title: "Encuestas" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="survey-screen" data-v-1327c542${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FamilyPersonasPageHeader, {
              eyebrow: "Participación",
              title: "Encuestas",
              description: surveyAvailable.value ? `Hay una encuesta disponible para ${nivelLabel.value}.` : `No hay una encuesta activa para ${nivelLabel.value}.`,
              meta: surveyAvailable.value ? "Disponible" : "Sin formulario publicado",
              "ambassador-variant": "help"
            }, null, _parent2, _scopeId));
            _push2(`<section class="${ssrRenderClass([{ unavailable: !surveyAvailable.value }, "card survey-card"])}" data-product-panel="surveys"${ssrRenderAttr("data-state", surveyAvailable.value ? "content" : "unavailable")} data-v-1327c542${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FamilyPersonasSectionHeading, {
              title: activeSurvey.value.title || "Encuesta",
              description: surveyAvailable.value ? "Completa el formulario directamente en esta página." : "Cuando el colegio publique una encuesta para este nivel, aparecerá aquí."
            }, null, _parent2, _scopeId));
            if (surveyAvailable.value) {
              _push2(`<iframe${ssrRenderAttr("src", activeSurvey.value.embedUrl)} title="Encuesta Personas Autorizadas" loading="lazy" data-v-1327c542${_scopeId}></iframe>`);
            } else {
              _push2(`<div class="compact-empty" data-v-1327c542${_scopeId}><div class="compact-empty-ambassador" aria-hidden="true" data-v-1327c542${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasAmbassador, {
                variant: "empty",
                compact: "",
                contained: "",
                decorative: ""
              }, null, _parent2, _scopeId));
              _push2(`</div><div data-v-1327c542${_scopeId}><strong data-v-1327c542${_scopeId}>No hay formulario publicado</strong><span data-v-1327c542${_scopeId}>No necesitas realizar ninguna acción por ahora.</span></div></div>`);
            }
            _push2(`</section></section>`);
          } else {
            return [
              createVNode("section", { class: "survey-screen" }, [
                createVNode(_component_FamilyPersonasPageHeader, {
                  eyebrow: "Participación",
                  title: "Encuestas",
                  description: surveyAvailable.value ? `Hay una encuesta disponible para ${nivelLabel.value}.` : `No hay una encuesta activa para ${nivelLabel.value}.`,
                  meta: surveyAvailable.value ? "Disponible" : "Sin formulario publicado",
                  "ambassador-variant": "help"
                }, null, 8, ["description", "meta"]),
                createVNode("section", {
                  class: ["card survey-card", { unavailable: !surveyAvailable.value }],
                  "data-product-panel": "surveys",
                  "data-state": surveyAvailable.value ? "content" : "unavailable"
                }, [
                  createVNode(_component_FamilyPersonasSectionHeading, {
                    title: activeSurvey.value.title || "Encuesta",
                    description: surveyAvailable.value ? "Completa el formulario directamente en esta página." : "Cuando el colegio publique una encuesta para este nivel, aparecerá aquí."
                  }, null, 8, ["title", "description"]),
                  surveyAvailable.value ? (openBlock(), createBlock("iframe", {
                    key: 0,
                    src: activeSurvey.value.embedUrl,
                    title: "Encuesta Personas Autorizadas",
                    loading: "lazy"
                  }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "compact-empty"
                  }, [
                    createVNode("div", {
                      class: "compact-empty-ambassador",
                      "aria-hidden": "true"
                    }, [
                      createVNode(_component_FamilyPersonasAmbassador, {
                        variant: "empty",
                        compact: "",
                        contained: "",
                        decorative: ""
                      })
                    ]),
                    createVNode("div", null, [
                      createVNode("strong", null, "No hay formulario publicado"),
                      createVNode("span", null, "No necesitas realizar ninguna acción por ahora.")
                    ])
                  ]))
                ], 10, ["data-state"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/encuestas.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const encuestas = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1327c542"]]);
export {
  encuestas as default
};
//# sourceMappingURL=encuestas-C5DpKO0b.js.map
