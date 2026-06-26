import { _ as __nuxt_component_0, a as __nuxt_component_1, b as __nuxt_component_3 } from "./PersonasPageHeader-CbpYMeMe.js";
import { e as useRoute, a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { defineComponent, computed, ref, mergeProps, withCtx, unref, createTextVNode, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderStyle, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { u as usePersonasFamilyTheme, b as useResolvedPersonasTheme } from "./usePersonasTheme-CmVh5mbY.js";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
import "./PersonasProcessedPhoto-BWatNFQu.js";
import "./daycare-xTCL2ANB.js";
import "./AccountMenu-Cc9CsO5z.js";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "./_virtual_public-BTp6Nzoa.js";
import "./personasTheme-CJ7aLgiL.js";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./routeSession-DTQI2Jul.js";
import "./useAppSession-D-b8QDDW.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "marbete",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const familyTheme = usePersonasFamilyTheme({ key: `pa-marbete-${route.params.id}` });
    const { data, pending, error: loadError } = useFetch("/api/personas-autorizadas/credential", { query: { id: route.params.id }, timeout: 15e3 });
    const { data: readiness, pending: readinessPending, error: readinessError } = useFetch("/api/personas-autorizadas/marbete", {
      key: `pa-marbete-readiness-${route.params.id}`,
      query: { id: route.params.id, format: "readiness" },
      timeout: 2e4
    });
    const { theme, themeVars } = useResolvedPersonasTheme(() => ({
      matricula: data.value?.matricula || data.value?.child?.matricula || familyTheme.primaryChild.value?.matricula || familyTheme.session.value?.user?.username,
      plantel: data.value?.plantel || familyTheme.primaryChild.value?.plantel || familyTheme.session.value?.user?.plantel?.[0],
      nivelEdu: data.value?.nivelEdu || data.value?.child?.nivelEdu || familyTheme.primaryChild.value?.nivelEdu,
      campus: data.value?.child?.campus || familyTheme.primaryChild.value?.campus || familyTheme.session.value?.user?.campus
    }));
    const fullName = computed(() => [data.value?.nombreP, data.value?.paternoP, data.value?.maternoP].filter(Boolean).join(" "));
    const passContext = computed(() => [displayMatricula(data.value?.matricula || data.value?.child?.matricula), data.value?.plantel, data.value?.nivelEdu, data.value?.gradoA, data.value?.grupoA].filter(Boolean).join(" / ") || "Datos escolares");
    const previewUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&format=svg-preview`);
    const downloadUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&download=1`);
    const downloading = ref(false);
    const downloadError = ref("");
    const downloadAvailable = computed(() => Boolean(readiness.value?.ok));
    const readinessMessage = computed(() => friendlyReadinessMessage(readiness.value?.issues?.[0], Boolean(readinessError.value)));
    function friendlyReadinessMessage(message, hasError = false) {
      const value = String(message || "").toLowerCase();
      if (value.includes("foto") || value.includes("imagen") || value.includes("image")) return "Actualiza la foto para descargar el Husky Pass o solicita apoyo a la escuela.";
      if (value.includes("dato") || value.includes("nombre") || value.includes("parentesco") || value.includes("matr")) return "Completa los datos solicitados para descargar el Husky Pass.";
      if (hasError) return "No pudimos validar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.";
      return "Validando datos del Husky Pass...";
    }
    async function downloadHuskyPass() {
      if (downloading.value || !downloadAvailable.value) return;
      downloadError.value = "";
      downloading.value = true;
      try {
        const response = await fetch(downloadUrl.value, { credentials: "include" });
        if (!response.ok) {
          const message = await response.text().catch(() => "");
          throw new Error(friendlyReadinessMessage(message, true));
        }
        const blob = await response.blob();
        if (!blob.size || !response.headers.get("content-type")?.toLowerCase().includes("pdf")) {
          throw new Error("No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.");
        }
        const objectUrl = URL.createObjectURL(blob);
        const anchor = (void 0).createElement("a");
        anchor.href = objectUrl;
        anchor.download = `husky-pass-${String(route.params.id)}.pdf`;
        (void 0).body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        (void 0).setTimeout(() => URL.revokeObjectURL(objectUrl), 1e3);
      } catch (err) {
        downloadError.value = err instanceof Error ? err.message : "No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.";
      } finally {
        downloading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAutorizadasShell = __nuxt_component_0;
      const _component_FamilyPersonasPageHeader = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_FamilyPersonasAmbassador = __nuxt_component_3;
      _push(ssrRenderComponent(_component_FamilyPersonasAutorizadasShell, mergeProps({ title: "Husky Pass" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="pass-page" style="${ssrRenderStyle(unref(themeVars))}" data-product-area="personas-autorizadas" data-product-screen="husky-pass" data-v-b40e1720${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FamilyPersonasPageHeader, {
              eyebrow: "Husky Pass",
              title: fullName.value || "Persona autorizada",
              description: passContext.value,
              theme: unref(theme),
              "ambassador-variant": "preview"
            }, {
              actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="head-actions" data-v-b40e1720${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_NuxtLink, {
                    class: "btn btn-secondary",
                    to: `/familia/personas-autorizadas/${unref(route).params.id}`
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`Volver`);
                      } else {
                        return [
                          createTextVNode("Volver")
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  if (downloadAvailable.value) {
                    _push3(`<button class="btn btn-primary pa-primary" type="button"${ssrIncludeBooleanAttr(downloading.value) ? " disabled" : ""} data-diagnostic-action="descargar-husky-pass" data-v-b40e1720${_scopeId2}>${ssrInterpolate(downloading.value ? "Preparando..." : "Descargar Husky Pass")}</button>`);
                  } else {
                    _push3(`<button class="btn btn-secondary" type="button" disabled data-v-b40e1720${_scopeId2}>${ssrInterpolate(readinessMessage.value)}</button>`);
                  }
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "head-actions" }, [
                      createVNode(_component_NuxtLink, {
                        class: "btn btn-secondary",
                        to: `/familia/personas-autorizadas/${unref(route).params.id}`
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Volver")
                        ]),
                        _: 1
                      }, 8, ["to"]),
                      downloadAvailable.value ? (openBlock(), createBlock("button", {
                        key: 0,
                        class: "btn btn-primary pa-primary",
                        type: "button",
                        disabled: downloading.value,
                        "data-diagnostic-action": "descargar-husky-pass",
                        onClick: downloadHuskyPass
                      }, toDisplayString(downloading.value ? "Preparando..." : "Descargar Husky Pass"), 9, ["disabled"])) : (openBlock(), createBlock("button", {
                        key: 1,
                        class: "btn btn-secondary",
                        type: "button",
                        disabled: ""
                      }, toDisplayString(readinessMessage.value), 1))
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (downloadError.value) {
              _push2(`<p class="alert" data-state="error" data-v-b40e1720${_scopeId}>${ssrInterpolate(downloadError.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(loadError) || unref(readinessError)) {
              _push2(`<p class="alert" data-state="error" data-v-b40e1720${_scopeId}>${ssrInterpolate(readinessMessage.value || "No fue posible cargar el Husky Pass.")}</p>`);
            } else if (unref(pending) || unref(readinessPending)) {
              _push2(`<div class="preview-state" data-product-loading data-state="loading" data-v-b40e1720${_scopeId}><span data-v-b40e1720${_scopeId}></span><strong data-v-b40e1720${_scopeId}>Generando vista...</strong></div>`);
            } else if (downloadAvailable.value) {
              _push2(`<section class="preview-shell" data-product-panel="husky-pass-preview" data-state="content" data-v-b40e1720${_scopeId}><iframe${ssrRenderAttr("src", previewUrl.value)} title="Vista previa de Husky Pass" data-v-b40e1720${_scopeId}></iframe><div class="download-ready" data-v-b40e1720${_scopeId}><span data-v-b40e1720${_scopeId}>Listo para descargar</span><strong data-v-b40e1720${_scopeId}>${ssrInterpolate(unref(theme).label)}</strong></div></section>`);
            } else {
              _push2(`<section class="preview-state unavailable" data-product-panel="husky-pass-preview" data-state="unavailable" data-v-b40e1720${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasAmbassador, {
                theme: unref(theme),
                variant: "empty",
                compact: "",
                decorative: ""
              }, null, _parent2, _scopeId));
              _push2(`<div data-v-b40e1720${_scopeId}><strong data-v-b40e1720${_scopeId}>Husky Pass no disponible</strong><p data-v-b40e1720${_scopeId}>${ssrInterpolate(readinessMessage.value)}</p></div></section>`);
            }
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", {
                class: "pass-page",
                style: unref(themeVars),
                "data-product-area": "personas-autorizadas",
                "data-product-screen": "husky-pass"
              }, [
                createVNode(_component_FamilyPersonasPageHeader, {
                  eyebrow: "Husky Pass",
                  title: fullName.value || "Persona autorizada",
                  description: passContext.value,
                  theme: unref(theme),
                  "ambassador-variant": "preview"
                }, {
                  actions: withCtx(() => [
                    createVNode("div", { class: "head-actions" }, [
                      createVNode(_component_NuxtLink, {
                        class: "btn btn-secondary",
                        to: `/familia/personas-autorizadas/${unref(route).params.id}`
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Volver")
                        ]),
                        _: 1
                      }, 8, ["to"]),
                      downloadAvailable.value ? (openBlock(), createBlock("button", {
                        key: 0,
                        class: "btn btn-primary pa-primary",
                        type: "button",
                        disabled: downloading.value,
                        "data-diagnostic-action": "descargar-husky-pass",
                        onClick: downloadHuskyPass
                      }, toDisplayString(downloading.value ? "Preparando..." : "Descargar Husky Pass"), 9, ["disabled"])) : (openBlock(), createBlock("button", {
                        key: 1,
                        class: "btn btn-secondary",
                        type: "button",
                        disabled: ""
                      }, toDisplayString(readinessMessage.value), 1))
                    ])
                  ]),
                  _: 1
                }, 8, ["title", "description", "theme"]),
                downloadError.value ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "alert",
                  "data-state": "error"
                }, toDisplayString(downloadError.value), 1)) : createCommentVNode("", true),
                unref(loadError) || unref(readinessError) ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "alert",
                  "data-state": "error"
                }, toDisplayString(readinessMessage.value || "No fue posible cargar el Husky Pass."), 1)) : unref(pending) || unref(readinessPending) ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "preview-state",
                  "data-product-loading": "",
                  "data-state": "loading"
                }, [
                  createVNode("span"),
                  createVNode("strong", null, "Generando vista...")
                ])) : downloadAvailable.value ? (openBlock(), createBlock("section", {
                  key: 3,
                  class: "preview-shell",
                  "data-product-panel": "husky-pass-preview",
                  "data-state": "content"
                }, [
                  createVNode("iframe", {
                    src: previewUrl.value,
                    title: "Vista previa de Husky Pass"
                  }, null, 8, ["src"]),
                  createVNode("div", { class: "download-ready" }, [
                    createVNode("span", null, "Listo para descargar"),
                    createVNode("strong", null, toDisplayString(unref(theme).label), 1)
                  ])
                ])) : (openBlock(), createBlock("section", {
                  key: 4,
                  class: "preview-state unavailable",
                  "data-product-panel": "husky-pass-preview",
                  "data-state": "unavailable"
                }, [
                  createVNode(_component_FamilyPersonasAmbassador, {
                    theme: unref(theme),
                    variant: "empty",
                    compact: "",
                    decorative: ""
                  }, null, 8, ["theme"]),
                  createVNode("div", null, [
                    createVNode("strong", null, "Husky Pass no disponible"),
                    createVNode("p", null, toDisplayString(readinessMessage.value), 1)
                  ])
                ]))
              ], 4)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/[id]/marbete.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const marbete = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b40e1720"]]);
export {
  marbete as default
};
//# sourceMappingURL=marbete-CrIYyPYp.js.map
