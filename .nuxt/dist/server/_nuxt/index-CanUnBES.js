import { _ as __nuxt_component_0, a as __nuxt_component_1 } from "./PersonasPageHeader-CbpYMeMe.js";
import { e as useRoute, a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { i as isValidatedVisionPhotoUrl, _ as __nuxt_component_2 } from "./PersonasProcessedPhoto-BWatNFQu.js";
import { _ as __nuxt_component_1$1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, computed, mergeProps, withCtx, unref, createTextVNode, createVNode, openBlock, createBlock, toDisplayString, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderClass, ssrRenderAttr } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { n as normalizeVirtualAssetUrl, g as authorizedPersonLabel } from "./daycare-xTCL2ANB.js";
import { u as usePersonasFamilyTheme, a as usePersonasFamilyPeople, b as useResolvedPersonasTheme } from "./usePersonasTheme-CmVh5mbY.js";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const familyTheme = usePersonasFamilyTheme({ key: `pa-detail-${route.params.id}` });
    const { data, pending, error: loadError } = usePersonasFamilyPeople();
    const { data: readiness, pending: readinessPending, error: readinessError } = useFetch("/api/personas-autorizadas/marbete", {
      key: `pa-detail-marbete-readiness-${route.params.id}`,
      query: { id: route.params.id, format: "readiness" },
      timeout: 2e4
    });
    const person = computed(() => (data.value || []).find((item) => String(item.id) === String(route.params.id)));
    const primaryChild = computed(() => person.value?.children?.[0] || null);
    const { theme, themeVars } = useResolvedPersonasTheme(() => ({
      matricula: primaryChild.value?.matricula || familyTheme.primaryChild.value?.matricula || familyTheme.session.value?.user?.username,
      plantel: primaryChild.value?.plantel || familyTheme.primaryChild.value?.plantel || familyTheme.session.value?.user?.plantel?.[0],
      nivelEdu: primaryChild.value?.nivelEdu || familyTheme.primaryChild.value?.nivelEdu,
      campus: primaryChild.value?.campus || familyTheme.primaryChild.value?.campus || familyTheme.session.value?.user?.campus
    }));
    const fullName = computed(() => [person.value?.nombreP, person.value?.paternoP, person.value?.maternoP].filter(Boolean).join(" "));
    const initials = computed(() => (fullName.value || "PA").split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(""));
    const photoUrl = computed(() => {
      const original = normalizeVirtualAssetUrl(person.value?.foto || "");
      const processed = normalizeVirtualAssetUrl(person.value?.compressed_foto || "");
      return original || (isValidatedVisionPhotoUrl(processed) ? processed : "");
    });
    const subtitle = computed(() => person.value?.parenP || (primaryChild.value ? studentLine.value : "Consulta y descarga su Husky Pass."));
    const studentLine = computed(() => {
      const child = primaryChild.value;
      if (!child) return "";
      return [displayMatricula(child.matricula), child.plantel, child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(" / ");
    });
    const marbeteReady = computed(() => Boolean(readiness.value?.ok));
    const marbeteMessage = computed(() => {
      if (readinessPending.value) return "Validando Husky Pass";
      if (readinessError.value) return "No fue posible validar el Husky Pass";
      return readiness.value?.ok ? "Husky Pass listo" : readiness.value?.issues?.[0] || "Husky Pass no disponible";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAutorizadasShell = __nuxt_component_0;
      const _component_FamilyPersonasPageHeader = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_FamilyPersonasProcessedPhoto = __nuxt_component_2;
      const _component_EmptyState = __nuxt_component_1$1;
      _push(ssrRenderComponent(_component_FamilyPersonasAutorizadasShell, mergeProps({ title: "Persona autorizada" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="pa-detail" style="${ssrRenderStyle(unref(themeVars))}" data-product-area="personas-autorizadas" data-product-screen="detail" data-v-339eec84${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FamilyPersonasPageHeader, {
              eyebrow: "Persona autorizada",
              title: fullName.value || "Registro",
              description: subtitle.value,
              theme: unref(theme),
              "ambassador-variant": "header"
            }, {
              actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_NuxtLink, {
                    class: "btn btn-secondary",
                    to: "/familia/personas-autorizadas"
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
                } else {
                  return [
                    createVNode(_component_NuxtLink, {
                      class: "btn btn-secondary",
                      to: "/familia/personas-autorizadas"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Volver")
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (unref(loadError)) {
              _push2(`<p class="alert" data-state="error" data-v-339eec84${_scopeId}>No fue posible cargar este registro.</p>`);
            } else if (unref(pending)) {
              _push2(`<div class="card loading-card" data-product-loading data-state="loading" data-v-339eec84${_scopeId}>Cargando registro...</div>`);
            } else if (person.value) {
              _push2(`<section class="detail-grid" data-product-panel="authorized-person-detail" data-state="content" data-v-339eec84${_scopeId}><article class="identity-card" data-v-339eec84${_scopeId}><div class="photo" data-v-339eec84${_scopeId}>`);
              if (photoUrl.value) {
                _push2(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                  src: person.value.foto,
                  "processed-src": person.value.compressed_foto,
                  "auto-process": false,
                  alt: "Fotografia",
                  namespace: `pa-detail-${person.value.id}`
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<span data-v-339eec84${_scopeId}>${ssrInterpolate(initials.value)}</span>`);
              }
              _push2(`</div><div data-v-339eec84${_scopeId}><p class="eyebrow" data-v-339eec84${_scopeId}>${ssrInterpolate(unref(authorizedPersonLabel)(person.value.indice))}</p><h2 data-v-339eec84${_scopeId}>${ssrInterpolate(fullName.value)}</h2><p data-v-339eec84${_scopeId}>${ssrInterpolate(person.value.parenP || "Parentesco no especificado")}</p></div></article><article class="actions-card" data-v-339eec84${_scopeId}><div class="readiness" data-v-339eec84${_scopeId}><span class="ok" data-v-339eec84${_scopeId}>Registro guardado</span><span class="${ssrRenderClass({ ok: Boolean(primaryChild.value) })}" data-v-339eec84${_scopeId}>${ssrInterpolate(primaryChild.value ? studentLine.value : "Alumno pendiente")}</span><span class="${ssrRenderClass({ ok: marbeteReady.value })}" data-v-339eec84${_scopeId}>${ssrInterpolate(marbeteMessage.value)}</span></div><div class="action-grid" data-v-339eec84${_scopeId}>`);
              if (marbeteReady.value) {
                _push2(`<a class="btn btn-primary pa-primary"${ssrRenderAttr("href", `/api/personas-autorizadas/marbete?id=${person.value.id}&download=1`)} data-diagnostic-link="descargar-husky-pass" data-v-339eec84${_scopeId}> Descargar Husky Pass </a>`);
              } else {
                _push2(`<button class="btn btn-secondary" type="button" disabled data-v-339eec84${_scopeId}>${ssrInterpolate(marbeteMessage.value)}</button>`);
              }
              _push2(ssrRenderComponent(_component_NuxtLink, {
                class: "btn btn-secondary",
                to: `/familia/personas-autorizadas/${person.value.id}/marbete`,
                "data-diagnostic-link": "previsualizar-husky-pass"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Vista previa `);
                  } else {
                    return [
                      createTextVNode(" Vista previa ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></article></section>`);
            } else {
              _push2(ssrRenderComponent(_component_EmptyState, {
                title: "Registro no disponible",
                description: "No encontramos esta persona autorizada en tu cuenta."
              }, null, _parent2, _scopeId));
            }
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", {
                class: "pa-detail",
                style: unref(themeVars),
                "data-product-area": "personas-autorizadas",
                "data-product-screen": "detail"
              }, [
                createVNode(_component_FamilyPersonasPageHeader, {
                  eyebrow: "Persona autorizada",
                  title: fullName.value || "Registro",
                  description: subtitle.value,
                  theme: unref(theme),
                  "ambassador-variant": "header"
                }, {
                  actions: withCtx(() => [
                    createVNode(_component_NuxtLink, {
                      class: "btn btn-secondary",
                      to: "/familia/personas-autorizadas"
                    }, {
                      default: withCtx(() => [
                        createTextVNode("Volver")
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["title", "description", "theme"]),
                unref(loadError) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "alert",
                  "data-state": "error"
                }, "No fue posible cargar este registro.")) : unref(pending) ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "card loading-card",
                  "data-product-loading": "",
                  "data-state": "loading"
                }, "Cargando registro...")) : person.value ? (openBlock(), createBlock("section", {
                  key: 2,
                  class: "detail-grid",
                  "data-product-panel": "authorized-person-detail",
                  "data-state": "content"
                }, [
                  createVNode("article", { class: "identity-card" }, [
                    createVNode("div", { class: "photo" }, [
                      photoUrl.value ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                        key: 0,
                        src: person.value.foto,
                        "processed-src": person.value.compressed_foto,
                        "auto-process": false,
                        alt: "Fotografia",
                        namespace: `pa-detail-${person.value.id}`
                      }, null, 8, ["src", "processed-src", "namespace"])) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(initials.value), 1))
                    ]),
                    createVNode("div", null, [
                      createVNode("p", { class: "eyebrow" }, toDisplayString(unref(authorizedPersonLabel)(person.value.indice)), 1),
                      createVNode("h2", null, toDisplayString(fullName.value), 1),
                      createVNode("p", null, toDisplayString(person.value.parenP || "Parentesco no especificado"), 1)
                    ])
                  ]),
                  createVNode("article", { class: "actions-card" }, [
                    createVNode("div", { class: "readiness" }, [
                      createVNode("span", { class: "ok" }, "Registro guardado"),
                      createVNode("span", {
                        class: { ok: Boolean(primaryChild.value) }
                      }, toDisplayString(primaryChild.value ? studentLine.value : "Alumno pendiente"), 3),
                      createVNode("span", {
                        class: { ok: marbeteReady.value }
                      }, toDisplayString(marbeteMessage.value), 3)
                    ]),
                    createVNode("div", { class: "action-grid" }, [
                      marbeteReady.value ? (openBlock(), createBlock("a", {
                        key: 0,
                        class: "btn btn-primary pa-primary",
                        href: `/api/personas-autorizadas/marbete?id=${person.value.id}&download=1`,
                        "data-diagnostic-link": "descargar-husky-pass"
                      }, " Descargar Husky Pass ", 8, ["href"])) : (openBlock(), createBlock("button", {
                        key: 1,
                        class: "btn btn-secondary",
                        type: "button",
                        disabled: ""
                      }, toDisplayString(marbeteMessage.value), 1)),
                      createVNode(_component_NuxtLink, {
                        class: "btn btn-secondary",
                        to: `/familia/personas-autorizadas/${person.value.id}/marbete`,
                        "data-diagnostic-link": "previsualizar-husky-pass"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Vista previa ")
                        ]),
                        _: 1
                      }, 8, ["to"])
                    ])
                  ])
                ])) : (openBlock(), createBlock(_component_EmptyState, {
                  key: 3,
                  title: "Registro no disponible",
                  description: "No encontramos esta persona autorizada en tu cuenta."
                }))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-339eec84"]]);
export {
  index as default
};
//# sourceMappingURL=index-CanUnBES.js.map
