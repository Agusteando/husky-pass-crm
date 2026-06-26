import { _ as __nuxt_component_0, a as __nuxt_component_1, b as __nuxt_component_3 } from "./PersonasPageHeader-CbpYMeMe.js";
import { _ as __nuxt_component_2 } from "./PersonasProcessedPhoto-BWatNFQu.js";
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, toDisplayString, createTextVNode, unref, openBlock, createBlock, Fragment, renderList, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { a as usePersonasFamilyPeople } from "./usePersonasTheme-CmVh5mbY.js";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
import { r as resolvePersonasTheme } from "./personasTheme-CJ7aLgiL.js";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { b as _export_sfc } from "../server.mjs";
import "./AccountMenu-Cc9CsO5z.js";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "./_virtual_public-BTp6Nzoa.js";
import "./daycare-xTCL2ANB.js";
import "./routeSession-DTQI2Jul.js";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "./useAppSession-D-b8QDDW.js";
import "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "hermanos",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: people, pending, error: loadError, refresh } = usePersonasFamilyPeople();
    const switching = ref(false);
    const error = ref("");
    const notice = ref("");
    const children = computed(() => people.value?.find((person) => person.children?.length)?.children || []);
    const currentChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null);
    const theme = computed(() => resolvePersonasTheme({
      matricula: currentChild.value?.matricula,
      plantel: currentChild.value?.plantel,
      nivelEdu: currentChild.value?.nivelEdu,
      campus: currentChild.value?.campus
    }));
    const matchedSiblings = computed(() => children.value.filter((child) => !child.isCurrent && child.siblingMatch === "parents"));
    const switchableSiblings = computed(() => matchedSiblings.value.filter((child) => child.canSwitch));
    const hasParentMatch = computed(() => matchedSiblings.value.length > 0);
    const currentUnavailableCode = computed(() => String(currentChild.value?.siblingDiagnostics?.code || ""));
    const hasOnlyCurrent = computed(() => children.value.length <= 1 && currentChild.value?.siblingMatch === "current");
    const showUnavailable = computed(() => hasOnlyCurrent.value || Boolean(currentUnavailableCode.value) || switchableSiblings.value.length !== matchedSiblings.value.length);
    const siblingsState = computed(() => hasParentMatch.value ? "content" : "unavailable");
    const siblingTitle = computed(() => {
      if (switchableSiblings.value.length) return `${switchableSiblings.value.length} ${switchableSiblings.value.length === 1 ? "alumno vinculado" : "alumnos vinculados"}`;
      if (hasParentMatch.value) return "Vinculación en preparación";
      if (hasOnlyCurrent.value) return "Sin hermanos adicionales";
      return "Sin hermanos disponibles";
    });
    const unavailableSummary = computed(() => {
      if (currentUnavailableCode.value === "signature-index-missing") return "Estamos preparando la vinculación familiar. Intenta de nuevo más tarde o solicita apoyo a la escuela.";
      if (currentUnavailableCode.value === "incomplete-parent-signature") return "Para buscar hermanos necesitamos los nombres completos de madre, padre o tutores.";
      if (hasOnlyCurrent.value) return "No encontramos hermanos adicionales con datos completos de padre y madre.";
      if (!hasParentMatch.value) return "Necesitamos los nombres completos de madre, padre o tutores para buscar hermanos.";
      return "Algunos alumnos requieren cuenta familiar activa.";
    });
    function childName(child) {
      return [child.nombreA, child.paternoA, child.maternoA].filter(Boolean).join(" ");
    }
    function initials(child) {
      const name = childName(child) || "A";
      return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    }
    function siblingLabel(child) {
      if (child.siblingMatch === "review") return "Requiere revisión";
      return "Vinculado";
    }
    function unavailableReason(child) {
      if (child.siblingMatch === "review") return "Requiere revisión.";
      return "Sin cuenta activa.";
    }
    function retryLoad() {
      return refresh();
    }
    async function switchToChild(child) {
      if (!child.matricula || !child.canSwitch) return;
      switching.value = true;
      error.value = "";
      notice.value = "";
      try {
        await $fetch("/api/personas-autorizadas/sibling-session", { method: "POST", body: { matricula: child.matricula } });
        notice.value = "Alumno seleccionado.";
        if (false) ;
      } catch (err) {
        const failure = err;
        error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || "No fue posible cambiar de alumno.";
      } finally {
        switching.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAutorizadasShell = __nuxt_component_0;
      const _component_FamilyPersonasPageHeader = __nuxt_component_1;
      const _component_FamilyPersonasProcessedPhoto = __nuxt_component_2;
      const _component_FamilyPersonasAmbassador = __nuxt_component_3;
      _push(ssrRenderComponent(_component_FamilyPersonasAutorizadasShell, mergeProps({ title: "Hermanos" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_FamilyPersonasPageHeader, {
              eyebrow: "Familia",
              title: "Alumnos vinculados",
              description: siblingTitle.value,
              theme: theme.value,
              "ambassador-variant": "hero"
            }, {
              actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="sibling-summary" aria-label="Resumen de alumnos" data-v-90fdf7ab${_scopeId2}><span data-v-90fdf7ab${_scopeId2}><strong data-v-90fdf7ab${_scopeId2}>${ssrInterpolate(children.value.length || 0)}</strong> alumnos </span><span data-v-90fdf7ab${_scopeId2}><strong data-v-90fdf7ab${_scopeId2}>${ssrInterpolate(switchableSiblings.value.length)}</strong> disponibles </span></div>`);
                } else {
                  return [
                    createVNode("div", {
                      class: "sibling-summary",
                      "aria-label": "Resumen de alumnos"
                    }, [
                      createVNode("span", null, [
                        createVNode("strong", null, toDisplayString(children.value.length || 0), 1),
                        createTextVNode(" alumnos ")
                      ]),
                      createVNode("span", null, [
                        createVNode("strong", null, toDisplayString(switchableSiblings.value.length), 1),
                        createTextVNode(" disponibles ")
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (unref(loadError)) {
              _push2(`<p class="alert" data-state="error" data-v-90fdf7ab${_scopeId}>No fue posible cargar la vinculación familiar.</p>`);
            } else if (unref(pending)) {
              _push2(`<div class="card loading-row" data-product-loading data-v-90fdf7ab${_scopeId}>Cargando…</div>`);
            } else {
              _push2(`<section class="card sibling-list" data-product-panel="siblings"${ssrRenderAttr("data-state", siblingsState.value)} data-v-90fdf7ab${_scopeId}><!--[-->`);
              ssrRenderList(children.value, (child) => {
                _push2(`<article class="${ssrRenderClass([{ current: child.isCurrent }, "sibling-card"])}" data-v-90fdf7ab${_scopeId}><div class="sibling-photo" data-v-90fdf7ab${_scopeId}>`);
                if (child.foto) {
                  _push2(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                    src: child.foto,
                    "auto-process": false,
                    namespace: `pa-sibling-${child.matricula || child.id || childName(child)}`
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<strong data-v-90fdf7ab${_scopeId}>${ssrInterpolate(initials(child))}</strong>`);
                }
                _push2(`</div><div data-v-90fdf7ab${_scopeId}><p class="eyebrow" data-v-90fdf7ab${_scopeId}>${ssrInterpolate(child.isCurrent ? "Alumno actual" : siblingLabel(child))}</p><strong data-v-90fdf7ab${_scopeId}>${ssrInterpolate(childName(child) || "Alumno")}</strong><span data-v-90fdf7ab${_scopeId}>${ssrInterpolate([child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(" / ") || "Datos pendientes")}</span>`);
                if (child.matricula) {
                  _push2(`<small class="matricula-line" data-v-90fdf7ab${_scopeId}>Matricula ${ssrInterpolate(unref(displayMatricula)(child.matricula))}</small>`);
                } else {
                  _push2(`<!---->`);
                }
                if (!child.isCurrent && !child.canSwitch) {
                  _push2(`<small data-v-90fdf7ab${_scopeId}>${ssrInterpolate(unavailableReason(child))}</small>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
                if (!child.isCurrent) {
                  _push2(`<button class="btn btn-primary pa-primary" type="button"${ssrIncludeBooleanAttr(switching.value || !child.canSwitch) ? " disabled" : ""} data-diagnostic-action="cambiar-alumno-vinculado" data-v-90fdf7ab${_scopeId}>${ssrInterpolate(child.canSwitch ? "Entrar" : "No disponible")}</button>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</article>`);
              });
              _push2(`<!--]-->`);
              if (showUnavailable.value) {
                _push2(`<div class="empty-state" data-v-90fdf7ab${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasAmbassador, {
                  theme: theme.value,
                  variant: "empty",
                  compact: "",
                  decorative: ""
                }, null, _parent2, _scopeId));
                _push2(`<p data-v-90fdf7ab${_scopeId}>${ssrInterpolate(unavailableSummary.value)}</p><button class="btn btn-secondary retry-button" type="button" data-diagnostic-action="reintentar-hermanos" data-v-90fdf7ab${_scopeId}>Reintentar</button></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</section>`);
            }
            if (error.value) {
              _push2(`<p class="alert" data-v-90fdf7ab${_scopeId}>${ssrInterpolate(error.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (notice.value) {
              _push2(`<p class="notice" data-v-90fdf7ab${_scopeId}>${ssrInterpolate(notice.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(_component_FamilyPersonasPageHeader, {
                eyebrow: "Familia",
                title: "Alumnos vinculados",
                description: siblingTitle.value,
                theme: theme.value,
                "ambassador-variant": "hero"
              }, {
                actions: withCtx(() => [
                  createVNode("div", {
                    class: "sibling-summary",
                    "aria-label": "Resumen de alumnos"
                  }, [
                    createVNode("span", null, [
                      createVNode("strong", null, toDisplayString(children.value.length || 0), 1),
                      createTextVNode(" alumnos ")
                    ]),
                    createVNode("span", null, [
                      createVNode("strong", null, toDisplayString(switchableSiblings.value.length), 1),
                      createTextVNode(" disponibles ")
                    ])
                  ])
                ]),
                _: 1
              }, 8, ["description", "theme"]),
              unref(loadError) ? (openBlock(), createBlock("p", {
                key: 0,
                class: "alert",
                "data-state": "error"
              }, "No fue posible cargar la vinculación familiar.")) : unref(pending) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "card loading-row",
                "data-product-loading": ""
              }, "Cargando…")) : (openBlock(), createBlock("section", {
                key: 2,
                class: "card sibling-list",
                "data-product-panel": "siblings",
                "data-state": siblingsState.value
              }, [
                (openBlock(true), createBlock(Fragment, null, renderList(children.value, (child) => {
                  return openBlock(), createBlock("article", {
                    key: child.matricula || child.id || childName(child),
                    class: ["sibling-card", { current: child.isCurrent }]
                  }, [
                    createVNode("div", { class: "sibling-photo" }, [
                      child.foto ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                        key: 0,
                        src: child.foto,
                        "auto-process": false,
                        namespace: `pa-sibling-${child.matricula || child.id || childName(child)}`
                      }, null, 8, ["src", "namespace"])) : (openBlock(), createBlock("strong", { key: 1 }, toDisplayString(initials(child)), 1))
                    ]),
                    createVNode("div", null, [
                      createVNode("p", { class: "eyebrow" }, toDisplayString(child.isCurrent ? "Alumno actual" : siblingLabel(child)), 1),
                      createVNode("strong", null, toDisplayString(childName(child) || "Alumno"), 1),
                      createVNode("span", null, toDisplayString([child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(" / ") || "Datos pendientes"), 1),
                      child.matricula ? (openBlock(), createBlock("small", {
                        key: 0,
                        class: "matricula-line"
                      }, "Matricula " + toDisplayString(unref(displayMatricula)(child.matricula)), 1)) : createCommentVNode("", true),
                      !child.isCurrent && !child.canSwitch ? (openBlock(), createBlock("small", { key: 1 }, toDisplayString(unavailableReason(child)), 1)) : createCommentVNode("", true)
                    ]),
                    !child.isCurrent ? (openBlock(), createBlock("button", {
                      key: 0,
                      class: "btn btn-primary pa-primary",
                      type: "button",
                      disabled: switching.value || !child.canSwitch,
                      "data-diagnostic-action": "cambiar-alumno-vinculado",
                      onClick: ($event) => switchToChild(child)
                    }, toDisplayString(child.canSwitch ? "Entrar" : "No disponible"), 9, ["disabled", "onClick"])) : createCommentVNode("", true)
                  ], 2);
                }), 128)),
                showUnavailable.value ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "empty-state"
                }, [
                  createVNode(_component_FamilyPersonasAmbassador, {
                    theme: theme.value,
                    variant: "empty",
                    compact: "",
                    decorative: ""
                  }, null, 8, ["theme"]),
                  createVNode("p", null, toDisplayString(unavailableSummary.value), 1),
                  createVNode("button", {
                    class: "btn btn-secondary retry-button",
                    type: "button",
                    "data-diagnostic-action": "reintentar-hermanos",
                    onClick: retryLoad
                  }, "Reintentar")
                ])) : createCommentVNode("", true)
              ], 8, ["data-state"])),
              error.value ? (openBlock(), createBlock("p", {
                key: 3,
                class: "alert"
              }, toDisplayString(error.value), 1)) : createCommentVNode("", true),
              notice.value ? (openBlock(), createBlock("p", {
                key: 4,
                class: "notice"
              }, toDisplayString(notice.value), 1)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/hermanos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const hermanos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-90fdf7ab"]]);
export {
  hermanos as default
};
//# sourceMappingURL=hermanos-DzMfPzLc.js.map
