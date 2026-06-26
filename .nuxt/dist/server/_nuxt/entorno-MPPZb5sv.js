import { a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { defineComponent, computed, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "entorno",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: checklist, pending, error, refresh } = useFetch("/api/admin/superadmin/env-check", {
      timeout: 15e3
    });
    const loadMessage = computed(() => {
      const failure = error.value;
      return failure?.data?.statusMessage || failure?.statusMessage || failure?.message || "";
    });
    const allItems = computed(() => checklist.value?.groups.flatMap((group) => group.items) || []);
    const requiredItems = computed(() => allItems.value.filter((item) => item.severity === "required"));
    const requiredOk = computed(() => requiredItems.value.filter((item) => item.ok).length);
    const requiredTotal = computed(() => requiredItems.value.length);
    const warningCount = computed(() => allItems.value.filter((item) => !item.ok && item.severity === "warning").length);
    const checkedAtLabel = computed(() => {
      const raw = checklist.value?.checkedAt;
      if (!raw) return "—";
      return new Date(raw).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    });
    function groupStatus(group) {
      const requiredFailures = group.items.filter((item) => !item.ok && item.severity === "required").length;
      const warnings = group.items.filter((item) => !item.ok && item.severity === "warning").length;
      if (requiredFailures) return `${requiredFailures} requerido${requiredFailures === 1 ? "" : "s"} pendiente${requiredFailures === 1 ? "" : "s"}`;
      if (warnings) return `${warnings} advertencia${warnings === 1 ? "" : "s"}`;
      return "Listo";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "env-page stack",
        "data-product-area": "superadmin",
        "data-product-screen": "env-checklist"
      }, _attrs))} data-v-bc035bd3><header class="workspace-head compact-head env-head" data-v-bc035bd3><div data-v-bc035bd3><p class="eyebrow" data-v-bc035bd3>Superadmin</p><h1 data-v-bc035bd3>Entorno</h1><p data-v-bc035bd3>Checklist operativo de variables globales sin exponer secretos.</p></div><div class="head-actions" data-v-bc035bd3>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/admin/superadmin"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Directorio`);
          } else {
            return [
              createTextVNode("Directorio")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/admin/superadmin/personas-autorizadas"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Personas Autorizadas`);
          } else {
            return [
              createTextVNode("Personas Autorizadas")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(unref(pending)) ? " disabled" : ""} data-diagnostic-action="actualizar-entorno" data-v-bc035bd3>${ssrInterpolate(unref(pending) ? "Revisando..." : "Revisar")}</button></div></header>`);
      if (loadMessage.value) {
        _push(`<p class="alert" data-state="error" data-v-bc035bd3>${ssrInterpolate(loadMessage.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(checklist)) {
        _push(`<section class="env-summary"${ssrRenderAttr("data-state", unref(checklist).ok ? "ok" : "attention")} data-v-bc035bd3><article data-v-bc035bd3><span data-v-bc035bd3>Estado</span><strong data-v-bc035bd3>${ssrInterpolate(unref(checklist).ok ? "Listo" : "Revisar")}</strong></article><article data-v-bc035bd3><span data-v-bc035bd3>Requeridos</span><strong data-v-bc035bd3>${ssrInterpolate(requiredOk.value)}/${ssrInterpolate(requiredTotal.value)}</strong></article><article data-v-bc035bd3><span data-v-bc035bd3>Advertencias</span><strong data-v-bc035bd3>${ssrInterpolate(warningCount.value)}</strong></article><article data-v-bc035bd3><span data-v-bc035bd3>Ultima revision</span><strong data-v-bc035bd3>${ssrInterpolate(checkedAtLabel.value)}</strong></article></section>`);
      } else if (unref(pending)) {
        _push(`<div class="card loading-card" data-product-loading data-v-bc035bd3>Revisando entorno...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(checklist)) {
        _push(`<section class="env-groups" data-v-bc035bd3><!--[-->`);
        ssrRenderList(unref(checklist).groups, (group) => {
          _push(`<article class="card env-group" data-v-bc035bd3><header class="group-head" data-v-bc035bd3><div data-v-bc035bd3><p class="eyebrow" data-v-bc035bd3>${ssrInterpolate(group.label)}</p><h2 data-v-bc035bd3>${ssrInterpolate(groupStatus(group))}</h2></div><span class="group-count" data-v-bc035bd3>${ssrInterpolate(group.items.filter((item) => item.ok).length)}/${ssrInterpolate(group.items.length)}</span></header><ul class="check-list" data-v-bc035bd3><!--[-->`);
          ssrRenderList(group.items, (item) => {
            _push(`<li${ssrRenderAttr("data-state", item.ok ? "ok" : item.severity)} data-v-bc035bd3><span class="check-dot" aria-hidden="true" data-v-bc035bd3>${ssrInterpolate(item.ok ? "✓" : "!")}</span><span data-v-bc035bd3><strong data-v-bc035bd3>${ssrInterpolate(item.label)}</strong><small data-v-bc035bd3>${ssrInterpolate(item.key)}</small></span><em data-v-bc035bd3>${ssrInterpolate(item.message)}</em></li>`);
          });
          _push(`<!--]--></ul></article>`);
        });
        _push(`<!--]--></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/superadmin/entorno.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const entorno = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bc035bd3"]]);
export {
  entorno as default
};
//# sourceMappingURL=entorno-MPPZb5sv.js.map
