import { a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_1 } from "./PersonasIcon-B5CnsWTN.js";
import { defineComponent, computed, mergeProps, withCtx, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { u as useAppSession } from "./useAppSession-D-b8QDDW.js";
import { h as hasFamilyScope } from "./sessionScopes-DtWD9iQ2.js";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "@lucide/vue";
import "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./routeSession-DTQI2Jul.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: session } = useAppSession();
    const canDaycare = computed(() => hasFamilyScope(session.value?.user, "daycare"));
    const canPa = computed(() => hasFamilyScope(session.value?.user, "personasAutorizadas"));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_FamilyPersonasIcon = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "product-chooser stack" }, _attrs))} data-v-95263c39><div class="workspace-head compact-head" data-v-95263c39><div data-v-95263c39><p class="eyebrow" data-v-95263c39>Husky Pass</p><h1 data-v-95263c39>Elige un acceso</h1><p data-v-95263c39>Tu cuenta tiene más de un producto disponible.</p></div></div><section class="chooser-grid" data-v-95263c39>`);
      if (canDaycare.value) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "choice-card",
          to: "/familia/daycare"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-95263c39${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "daycare" }, null, _parent2, _scopeId));
              _push2(`</span><h2 data-v-95263c39${_scopeId}>Guardería</h2><p data-v-95263c39${_scopeId}>Tareas, avisos y calendario de la sala.</p><strong data-v-95263c39${_scopeId}>Entrar</strong>`);
            } else {
              return [
                createVNode("span", null, [
                  createVNode(_component_FamilyPersonasIcon, { name: "daycare" })
                ]),
                createVNode("h2", null, "Guardería"),
                createVNode("p", null, "Tareas, avisos y calendario de la sala."),
                createVNode("strong", null, "Entrar")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (canPa.value) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "choice-card blue",
          to: "/familia/personas-autorizadas"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-95263c39${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "people" }, null, _parent2, _scopeId));
              _push2(`</span><h2 data-v-95263c39${_scopeId}>Personas Autorizadas</h2><p data-v-95263c39${_scopeId}>Personas, fotos y marbetes.</p><strong data-v-95263c39${_scopeId}>Entrar</strong>`);
            } else {
              return [
                createVNode("span", null, [
                  createVNode(_component_FamilyPersonasIcon, { name: "people" })
                ]),
                createVNode("h2", null, "Personas Autorizadas"),
                createVNode("p", null, "Personas, fotos y marbetes."),
                createVNode("strong", null, "Entrar")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (canPa.value) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "choice-card attendance-choice",
          to: "/familia/asistencia"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-95263c39${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "calendar" }, null, _parent2, _scopeId));
              _push2(`</span><h2 data-v-95263c39${_scopeId}>Asistencia</h2><p data-v-95263c39${_scopeId}>Expediente de asistencia, retardos, motivos y entradas/salidas por ciclo escolar.</p><strong data-v-95263c39${_scopeId}>Entrar</strong>`);
            } else {
              return [
                createVNode("span", null, [
                  createVNode(_component_FamilyPersonasIcon, { name: "calendar" })
                ]),
                createVNode("h2", null, "Asistencia"),
                createVNode("p", null, "Expediente de asistencia, retardos, motivos y entradas/salidas por ciclo escolar."),
                createVNode("strong", null, "Entrar")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</section></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-95263c39"]]);
export {
  index as default
};
//# sourceMappingURL=index-ON-4ssXW.js.map
