import { _ as __nuxt_component_0 } from "./LoginPanel-DubcRLKI.js";
import { _ as __nuxt_component_1 } from "./ExperienceLoginForm-YA_ZxnEl.js";
import { a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { defineComponent, mergeProps, withCtx, createTextVNode, createVNode, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "./experienceIdentity-DUHnLdZH.js";
import "./matricula-C6apTRg-.js";
import "./sessionScopes-DtWD9iQ2.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "guarderia",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoginPanel = __nuxt_component_0;
      const _component_ExperienceLoginForm = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(ssrRenderComponent(_component_LoginPanel, mergeProps({
        "brand-to": "/login/guarderia",
        eyebrow: "Experiencia Guardería",
        title: "Acceso familiar Guardería",
        description: "Ingresa con la cuenta familiar asignada a tu sala.",
        experience: "guarderia"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_ExperienceLoginForm, {
              experience: "guarderia",
              heading: "Entrar a Experiencia Guardería"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "btn btn-secondary create-link",
              to: "/registro-guarderia"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Crear acceso de Guardería`);
                } else {
                  return [
                    createTextVNode("Crear acceso de Guardería")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_ExperienceLoginForm, {
                experience: "guarderia",
                heading: "Entrar a Experiencia Guardería"
              }),
              createVNode(_component_NuxtLink, {
                class: "btn btn-secondary create-link",
                to: "/registro-guarderia"
              }, {
                default: withCtx(() => [
                  createTextVNode("Crear acceso de Guardería")
                ]),
                _: 1
              })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login/guarderia.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const guarderia = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-459da3ad"]]);
export {
  guarderia as default
};
//# sourceMappingURL=guarderia-Dv6c14Pt.js.map
