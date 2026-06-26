import { _ as __nuxt_component_0 } from "./LoginPanel-DubcRLKI.js";
import { a as __nuxt_component_0$1, c as useRuntimeConfig, b as _export_sfc } from "../server.mjs";
import { defineComponent, ref, mergeProps, withCtx, unref, createTextVNode, createVNode, openBlock, createBlock, createCommentVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "./experienceIdentity-DUHnLdZH.js";
import "./matricula-C6apTRg-.js";
import "./sessionScopes-DtWD9iQ2.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const config = useRuntimeConfig();
    const clientId = config.public.googleClientId;
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoginPanel = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(ssrRenderComponent(_component_LoginPanel, mergeProps({
        "brand-to": "/admin/login",
        eyebrow: "Acceso interno",
        title: "Administración Husky Pass",
        description: "Ingresa con tu cuenta institucional.",
        experience: "admin"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="stack" data-v-2b6d7ecc${_scopeId}><div data-v-2b6d7ecc${_scopeId}><h2 data-v-2b6d7ecc${_scopeId}>Acceso administrativo</h2><p class="muted-copy" data-v-2b6d7ecc${_scopeId}>Usa tu cuenta @casitaiedis.edu.mx.</p></div><div id="google-signin" class="google-box" data-v-2b6d7ecc${_scopeId}></div>`);
            if (!unref(clientId)) {
              _push2(`<p class="alert" data-v-2b6d7ecc${_scopeId}>GOOGLE_CLIENT_ID no está configurado.</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (error.value) {
              _push2(`<p class="alert" data-v-2b6d7ecc${_scopeId}>${ssrInterpolate(error.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "btn btn-secondary",
              to: "/login"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Acceso familiar`);
                } else {
                  return [
                    createTextVNode("Acceso familiar")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "stack" }, [
                createVNode("div", null, [
                  createVNode("h2", null, "Acceso administrativo"),
                  createVNode("p", { class: "muted-copy" }, "Usa tu cuenta @casitaiedis.edu.mx.")
                ]),
                createVNode("div", {
                  id: "google-signin",
                  class: "google-box"
                }),
                !unref(clientId) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "alert"
                }, "GOOGLE_CLIENT_ID no está configurado.")) : createCommentVNode("", true),
                error.value ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "alert"
                }, toDisplayString(error.value), 1)) : createCommentVNode("", true),
                createVNode(_component_NuxtLink, {
                  class: "btn btn-secondary",
                  to: "/login"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Acceso familiar")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2b6d7ecc"]]);
export {
  login as default
};
//# sourceMappingURL=login-qfYUvGOw.js.map
