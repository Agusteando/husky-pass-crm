import { e as useRoute, a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { u as usePersonasFamilyTheme, b as useResolvedPersonasTheme } from "./usePersonasTheme-CmVh5mbY.js";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
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
import "./daycare-xTCL2ANB.js";
import "./personasTheme-CJ7aLgiL.js";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
import "./useAppSession-D-b8QDDW.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "imprimir",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const familyTheme = usePersonasFamilyTheme({ key: `pa-printable-${route.params.id}` });
    ref(null);
    const { data, pending, error: loadError } = useFetch("/api/personas-autorizadas/credential", { query: { id: route.params.id }, timeout: 15e3 });
    const { data: readiness, pending: readinessPending, error: readinessError } = useFetch("/api/personas-autorizadas/marbete", {
      key: `pa-print-marbete-readiness-${route.params.id}`,
      query: { id: route.params.id, format: "readiness" },
      timeout: 2e4
    });
    const { themeVars } = useResolvedPersonasTheme(() => ({
      matricula: data.value?.matricula || data.value?.child?.matricula || familyTheme.primaryChild.value?.matricula || familyTheme.session.value?.user?.username,
      plantel: data.value?.plantel || familyTheme.primaryChild.value?.plantel || familyTheme.session.value?.user?.plantel?.[0],
      nivelEdu: data.value?.nivelEdu || familyTheme.primaryChild.value?.nivelEdu,
      campus: data.value?.child?.campus || familyTheme.primaryChild.value?.campus || familyTheme.session.value?.user?.campus
    }));
    const fullName = computed(() => [data.value?.nombreP, data.value?.paternoP, data.value?.maternoP].filter(Boolean).join(" "));
    const passContext = computed(() => [displayMatricula(data.value?.matricula || data.value?.child?.matricula), data.value?.plantel, data.value?.nivelEdu, data.value?.gradoA, data.value?.grupoA].filter(Boolean).join(" / ") || "Datos escolares");
    const marbeteReady = computed(() => Boolean(readiness.value?.ok));
    const marbeteMessage = computed(() => {
      if (loadError.value || !data.value) return "No encontramos esta persona autorizada dentro de tu cuenta.";
      if (readinessPending.value) return "Validando datos e imagenes del Husky Pass.";
      if (readinessError.value) return "No fue posible validar los datos e imagenes del Husky Pass.";
      return readiness.value?.ok ? "Husky Pass listo." : readiness.value?.issues?.[0] || "Husky Pass no disponible.";
    });
    const previewUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}`);
    const downloadUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&download=1`);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<main${ssrRenderAttrs(mergeProps({
        class: "print-shell",
        style: unref(themeVars)
      }, _attrs))} data-v-6c42b548>`);
      if (unref(pending) || unref(readinessPending)) {
        _push(`<section class="status-card" data-product-loading data-v-6c42b548><h1 data-v-6c42b548>Preparando Husky Pass...</h1></section>`);
      } else if (unref(loadError) || !unref(data) || unref(readinessError) || !marbeteReady.value) {
        _push(`<section class="status-card" data-state="error" data-v-6c42b548><h1 data-v-6c42b548>Husky Pass no disponible</h1><p data-v-6c42b548>${ssrInterpolate(marbeteMessage.value)}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "btn btn-secondary no-print",
          to: "/familia/personas-autorizadas"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Volver`);
            } else {
              return [
                createTextVNode("Volver")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section>`);
      } else {
        _push(`<section class="print-card" data-product-panel="husky-pass-print" data-state="content" data-v-6c42b548><div class="print-actions no-print" data-v-6c42b548><strong data-v-6c42b548>${ssrInterpolate(fullName.value)}</strong><span data-v-6c42b548>${ssrInterpolate(passContext.value)}</span>`);
        if (marbeteReady.value) {
          _push(`<a class="btn btn-primary"${ssrRenderAttr("href", downloadUrl.value)} data-v-6c42b548>Descargar Husky Pass</a>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><iframe${ssrRenderAttr("src", previewUrl.value)} title="Husky Pass imprimible" data-v-6c42b548></iframe></section>`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/[id]/imprimir.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const imprimir = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6c42b548"]]);
export {
  imprimir as default
};
//# sourceMappingURL=imprimir-DV8CCC4t.js.map
