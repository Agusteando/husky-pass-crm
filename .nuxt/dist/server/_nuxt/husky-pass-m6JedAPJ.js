import { g as createError, e as useRoute, i as useRouter, a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass } from "vue/server-renderer";
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
  __name: "husky-pass",
  __ssrInlineRender: true,
  setup(__props) {
    if (process.env.NODE_ENV === "production") {
      throw createError({ statusCode: 404, statusMessage: "Ruta no disponible." });
    }
    const route = useRoute();
    useRouter();
    const { data: options, pending, error: loadError } = useFetch("/api/dev/husky-pass/options", { timeout: 15e3 });
    const variant = ref(typeof route.query.variant === "string" ? route.query.variant : "guarderia-cm");
    const scenario = ref(typeof route.query.scenario === "string" ? route.query.scenario : "default");
    const panel = ref(typeof route.query.panel === "string" ? route.query.panel : "compare");
    const passQuery = computed(() => `variant=${encodeURIComponent(variant.value)}&scenario=${encodeURIComponent(scenario.value)}`);
    const svgUrl = computed(() => `/api/dev/husky-pass/pass?${passQuery.value}&format=svg-preview`);
    const pdfUrl = computed(() => `/api/dev/husky-pass/pass?${passQuery.value}&format=pdf`);
    const downloadUrl = computed(() => `${pdfUrl.value}&download=1`);
    const diagnosticsUrl = computed(() => `/api/dev/husky-pass/pass?${passQuery.value}&format=diagnostics`);
    const { data: diagnostics, refresh: refreshDiagnostics } = useFetch(diagnosticsUrl, {
      watch: [diagnosticsUrl],
      timeout: 3e4,
      dedupe: "cancel"
    });
    const selectedVariant = computed(() => options.value?.variants.find((item) => item.id === variant.value) || options.value?.variants[0]);
    const formattedDiagnostics = computed(() => JSON.stringify(diagnostics.value || {}, null, 2));
    watch(options, (value) => {
      if (!value) return;
      if (!value.variants.some((item) => item.id === variant.value)) variant.value = value.variants[0]?.id || "guarderia-cm";
      if (!value.scenarios.some((item) => item.id === scenario.value)) scenario.value = value.scenarios[0]?.id || "default";
    }, { immediate: true });
    watch([variant, scenario, panel], () => {
      return;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<main${ssrRenderAttrs(mergeProps({
        class: "dev-pass-page",
        "data-product-area": "dev-husky-pass",
        "data-state": unref(pending) ? "loading" : unref(loadError) ? "error" : "content"
      }, _attrs))} data-v-18e576be><header class="dev-pass-head" data-v-18e576be><div data-v-18e576be><p class="eyebrow" data-v-18e576be>Dev harness</p><h1 data-v-18e576be>Husky Pass PDF Lab</h1></div><nav class="dev-links" aria-label="Dev shortcuts" data-v-18e576be>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/__dev/personas-modals" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Modales PA`);
          } else {
            return [
              createTextVNode("Modales PA")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<a${ssrRenderAttr("href", pdfUrl.value)} target="_blank" rel="noopener" data-diagnostic-action="dev-open-pdf" data-v-18e576be>Abrir PDF</a><a${ssrRenderAttr("href", downloadUrl.value)} data-diagnostic-action="dev-download-pdf" data-v-18e576be>Descargar</a></nav></header><section class="dev-controls" aria-label="Fixture controls" data-v-18e576be><label data-v-18e576be> Variante <select data-diagnostic-field="dev-pass-variant" data-v-18e576be><!--[-->`);
      ssrRenderList(unref(options)?.variants || [], (option) => {
        _push(`<option${ssrRenderAttr("value", option.id)} data-v-18e576be${ssrIncludeBooleanAttr(Array.isArray(variant.value) ? ssrLooseContain(variant.value, option.id) : ssrLooseEqual(variant.value, option.id)) ? " selected" : ""}>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select></label><label data-v-18e576be> Estado <select data-diagnostic-field="dev-pass-scenario" data-v-18e576be><!--[-->`);
      ssrRenderList(unref(options)?.scenarios || [], (option) => {
        _push(`<option${ssrRenderAttr("value", option.id)} data-v-18e576be${ssrIncludeBooleanAttr(Array.isArray(scenario.value) ? ssrLooseContain(scenario.value, option.id) : ssrLooseEqual(scenario.value, option.id)) ? " selected" : ""}>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select></label><label data-v-18e576be> Vista <select data-diagnostic-field="dev-pass-panel" data-v-18e576be><option value="compare" data-v-18e576be${ssrIncludeBooleanAttr(Array.isArray(panel.value) ? ssrLooseContain(panel.value, "compare") : ssrLooseEqual(panel.value, "compare")) ? " selected" : ""}>Comparar</option><option value="svg" data-v-18e576be${ssrIncludeBooleanAttr(Array.isArray(panel.value) ? ssrLooseContain(panel.value, "svg") : ssrLooseEqual(panel.value, "svg")) ? " selected" : ""}>SVG</option><option value="pdf" data-v-18e576be${ssrIncludeBooleanAttr(Array.isArray(panel.value) ? ssrLooseContain(panel.value, "pdf") : ssrLooseEqual(panel.value, "pdf")) ? " selected" : ""}>PDF</option><option value="diagnostics" data-v-18e576be${ssrIncludeBooleanAttr(Array.isArray(panel.value) ? ssrLooseContain(panel.value, "diagnostics") : ssrLooseEqual(panel.value, "diagnostics")) ? " selected" : ""}>Diagnostico</option></select></label></section>`);
      if (unref(loadError)) {
        _push(`<p class="dev-alert" data-v-18e576be>No fue posible cargar fixtures dev.</p>`);
      } else if (unref(pending)) {
        _push(`<div class="dev-loading" data-v-18e576be>Cargando fixtures...</div>`);
      } else {
        _push(`<section class="dev-summary" data-product-panel="dev-pass-summary" data-v-18e576be><article data-v-18e576be><span data-v-18e576be>Plantel</span><strong data-v-18e576be>${ssrInterpolate(selectedVariant.value?.plantel)}</strong></article><article data-v-18e576be><span data-v-18e576be>Nivel</span><strong data-v-18e576be>${ssrInterpolate(selectedVariant.value?.nivelEdu)}</strong></article><article data-v-18e576be><span data-v-18e576be>Plantilla esperada</span><strong data-v-18e576be>${ssrInterpolate(unref(diagnostics)?.template?.id || selectedVariant.value?.expectedTemplateId)}</strong></article><article class="${ssrRenderClass({ ok: unref(diagnostics)?.selectedExpectedTemplate, warn: unref(diagnostics) && !unref(diagnostics).selectedExpectedTemplate })}" data-v-18e576be><span data-v-18e576be>Seleccion</span><strong data-v-18e576be>${ssrInterpolate(unref(diagnostics)?.selectedExpectedTemplate === false ? "Revisar" : "OK")}</strong></article></section>`);
      }
      if (panel.value === "diagnostics") {
        _push(`<section class="dev-diagnostics" data-product-panel="dev-pass-diagnostics" data-v-18e576be><pre data-v-18e576be>${ssrInterpolate(formattedDiagnostics.value)}</pre></section>`);
      } else {
        _push(`<section class="${ssrRenderClass([`mode-${panel.value}`, "preview-grid"])}" data-product-panel="dev-pass-preview" data-v-18e576be>`);
        if (panel.value !== "pdf") {
          _push(`<article class="preview-pane" data-v-18e576be><header data-v-18e576be><span data-v-18e576be>Browser SVG</span><a${ssrRenderAttr("href", svgUrl.value)} target="_blank" rel="noopener" data-v-18e576be>Abrir</a></header><iframe class="svg-frame"${ssrRenderAttr("src", svgUrl.value)} title="Vista previa SVG Husky Pass" data-diagnostic-preview="svg" data-v-18e576be></iframe></article>`);
        } else {
          _push(`<!---->`);
        }
        if (panel.value !== "svg") {
          _push(`<article class="preview-pane pdf-pane" data-v-18e576be><header data-v-18e576be><span data-v-18e576be>PDF final</span><a${ssrRenderAttr("href", pdfUrl.value)} target="_blank" rel="noopener" data-v-18e576be>Abrir</a></header><iframe${ssrRenderAttr("src", pdfUrl.value)} title="PDF final Husky Pass" data-diagnostic-preview="pdf" data-v-18e576be></iframe></article>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/__dev/husky-pass.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const huskyPass = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-18e576be"]]);
export {
  huskyPass as default
};
//# sourceMappingURL=husky-pass-m6JedAPJ.js.map
