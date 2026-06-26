import { _ as __nuxt_component_0, a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { s as setResponseStatus } from "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[...slug]",
  __ssrInlineRender: true,
  setup(__props) {
    setResponseStatus(404);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BrandMark = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<main${ssrRenderAttrs(mergeProps({
        class: "not-found-page",
        "data-product-screen": "not-found"
      }, _attrs))} data-v-5ff493f8><section class="not-found-shell" data-v-5ff493f8>`);
      _push(ssrRenderComponent(_component_BrandMark, { to: "/login" }, null, _parent));
      _push(`<div class="not-found-copy" data-v-5ff493f8><p class="eyebrow" data-v-5ff493f8>Ruta no encontrada</p><h1 data-v-5ff493f8>Esta pagina no esta disponible</h1><p data-v-5ff493f8>Vuelve a elegir tu experiencia para continuar con una ruta valida.</p></div><nav class="not-found-actions" aria-label="Rutas de regreso" data-v-5ff493f8>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-primary",
        to: "/login"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Elegir experiencia`);
          } else {
            return [
              createTextVNode("Elegir experiencia")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/login/escolar"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Acceso escolar`);
          } else {
            return [
              createTextVNode("Acceso escolar")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/login/guarderia"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Acceso guarderia`);
          } else {
            return [
              createTextVNode("Acceso guarderia")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/admin/login"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Administracion`);
          } else {
            return [
              createTextVNode("Administracion")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></section></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/[...slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ____slug_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5ff493f8"]]);
export {
  ____slug_ as default
};
//# sourceMappingURL=_...slug_-Bq-hUZC0.js.map
