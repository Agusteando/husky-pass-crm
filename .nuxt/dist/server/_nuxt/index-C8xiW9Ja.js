import { _ as __nuxt_component_0 } from "./LoginPanel-DubcRLKI.js";
import { a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_1 } from "./PersonasIcon-B5CnsWTN.js";
import { defineComponent, mergeProps, withCtx, createVNode, createTextVNode, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "./experienceIdentity-DUHnLdZH.js";
import "./matricula-C6apTRg-.js";
import "./sessionScopes-DtWD9iQ2.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "@lucide/vue";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoginPanel = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_FamilyPersonasIcon = __nuxt_component_1;
      _push(ssrRenderComponent(_component_LoginPanel, mergeProps({
        "brand-to": "/login",
        eyebrow: "Husky Pass",
        title: "Elige tu experiencia",
        description: "Selecciona el acceso que corresponde a tu cuenta.",
        experience: "admin"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="login-choice stack" data-v-57d25335${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "choice-row",
              to: "/login/escolar",
              "data-login-entry": "escolar"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span data-v-57d25335${_scopeId2}><strong data-v-57d25335${_scopeId2}>Experiencia Escolar</strong><small data-v-57d25335${_scopeId2}>Familias IECS o IEDIS</small></span>`);
                  _push3(ssrRenderComponent(_component_FamilyPersonasIcon, {
                    name: "arrow",
                    "aria-hidden": "true"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode("span", null, [
                      createVNode("strong", null, "Experiencia Escolar"),
                      createVNode("small", null, "Familias IECS o IEDIS")
                    ]),
                    createVNode(_component_FamilyPersonasIcon, {
                      name: "arrow",
                      "aria-hidden": "true"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "choice-row",
              to: "/login/guarderia",
              "data-login-entry": "guarderia"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span data-v-57d25335${_scopeId2}><strong data-v-57d25335${_scopeId2}>Experiencia Guardería</strong><small data-v-57d25335${_scopeId2}>Familias de Guardería</small></span>`);
                  _push3(ssrRenderComponent(_component_FamilyPersonasIcon, {
                    name: "arrow",
                    "aria-hidden": "true"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode("span", null, [
                      createVNode("strong", null, "Experiencia Guardería"),
                      createVNode("small", null, "Familias de Guardería")
                    ]),
                    createVNode(_component_FamilyPersonasIcon, {
                      name: "arrow",
                      "aria-hidden": "true"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "admin-link",
              to: "/admin/login"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Experiencia Administrativa`);
                } else {
                  return [
                    createTextVNode("Experiencia Administrativa")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", { class: "login-choice stack" }, [
                createVNode(_component_NuxtLink, {
                  class: "choice-row",
                  to: "/login/escolar",
                  "data-login-entry": "escolar"
                }, {
                  default: withCtx(() => [
                    createVNode("span", null, [
                      createVNode("strong", null, "Experiencia Escolar"),
                      createVNode("small", null, "Familias IECS o IEDIS")
                    ]),
                    createVNode(_component_FamilyPersonasIcon, {
                      name: "arrow",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }),
                createVNode(_component_NuxtLink, {
                  class: "choice-row",
                  to: "/login/guarderia",
                  "data-login-entry": "guarderia"
                }, {
                  default: withCtx(() => [
                    createVNode("span", null, [
                      createVNode("strong", null, "Experiencia Guardería"),
                      createVNode("small", null, "Familias de Guardería")
                    ]),
                    createVNode(_component_FamilyPersonasIcon, {
                      name: "arrow",
                      "aria-hidden": "true"
                    })
                  ]),
                  _: 1
                }),
                createVNode(_component_NuxtLink, {
                  class: "admin-link",
                  to: "/admin/login"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Experiencia Administrativa")
                  ]),
                  _: 1
                })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-57d25335"]]);
export {
  index as default
};
//# sourceMappingURL=index-C8xiW9Ja.js.map
