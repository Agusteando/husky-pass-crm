import { _ as __nuxt_component_0 } from "./LoginPanel-DubcRLKI.js";
import { _ as __nuxt_component_1 } from "./ExperienceLoginForm-YA_ZxnEl.js";
import { defineComponent, mergeProps, withCtx, createVNode, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "./experienceIdentity-DUHnLdZH.js";
import "./matricula-C6apTRg-.js";
import "./sessionScopes-DtWD9iQ2.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "escolar",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoginPanel = __nuxt_component_0;
      const _component_ExperienceLoginForm = __nuxt_component_1;
      _push(ssrRenderComponent(_component_LoginPanel, mergeProps({
        "brand-to": "/login/escolar",
        eyebrow: "Experiencia Escolar",
        title: "Acceso familiar escolar",
        description: "Ingresa con la cuenta familiar vinculada a IECS o IEDIS.",
        experience: "escolar"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_ExperienceLoginForm, {
              experience: "escolar",
              heading: "Entrar a Experiencia Escolar"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_ExperienceLoginForm, {
                experience: "escolar",
                heading: "Entrar a Experiencia Escolar"
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login/escolar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=escolar-CT9BPPzm.js.map
