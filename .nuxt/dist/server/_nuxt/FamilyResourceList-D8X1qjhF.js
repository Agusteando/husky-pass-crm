import { a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_1 } from "./ResourceCard-Bp89BKc3.js";
import { _ as __nuxt_component_1$1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, computed, mergeProps, withCtx, createTextVNode, unref, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { f as formatDate, i as isPdfResource, p as publishedPdfViewerUrl, s as stripHtml } from "./daycare-xTCL2ANB.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "FamilyResourceList",
  __ssrInlineRender: true,
  props: {
    type: {},
    title: {},
    description: {}
  },
  setup(__props) {
    const props = __props;
    const { data: items, pending, error } = useFetch("/api/daycare/family/resources", {
      query: { type: props.type },
      timeout: 15e3
    });
    const featuredItem = computed(() => items.value?.[0] || null);
    const remainingItems = computed(() => items.value?.slice(1) || []);
    const summaryEyebrow = computed(() => props.type === "hw" ? "Tareas activas" : props.type === "cal" ? "Agenda" : "Comunicados");
    const featuredLabel = computed(() => props.type === "hw" ? "Tarea principal" : props.type === "cal" ? "Próximo evento" : "Aviso más reciente");
    const titleFallback = computed(() => props.type === "hw" ? "Tarea publicada" : props.type === "cal" ? "Evento publicado" : "Aviso publicado");
    const summaryCopy = computed(() => {
      if (!items.value?.length) return "No hay publicaciones vigentes.";
      if (props.type === "hw") return "Empieza por la tarea principal y consulta el historial para no perder recursos adjuntos.";
      if (props.type === "cal") return "El evento más próximo queda arriba; el resto permanece ordenado para consulta rápida.";
      return "El comunicado más reciente queda destacado. Abre cada recurso para revisar el material completo.";
    });
    function resourceUrl(resource) {
      if (!resource?.resource) return "";
      return isPdfResource(resource.resource) ? publishedPdfViewerUrl(resource.resource) : resource.resource;
    }
    function resourceCopy(resource) {
      return stripHtml(resource?.description || resource?.html) || "Abre el recurso para consultar el contenido completo.";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_ResourceCard = __nuxt_component_1;
      const _component_EmptyState = __nuxt_component_1$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "resource-page" }, _attrs))} data-v-7037630c><header class="resource-hero" data-v-7037630c><div data-v-7037630c><p class="eyebrow" data-v-7037630c>Guardería</p><h1 data-v-7037630c>${ssrInterpolate(__props.title)}</h1><p data-v-7037630c>${ssrInterpolate(__props.description)}</p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/familia/daycare"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Inicio`);
          } else {
            return [
              createTextVNode("Inicio")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
      if (unref(error)) {
        _push(`<p class="alert" data-v-7037630c>No fue posible cargar esta sección.</p>`);
      } else if (unref(pending)) {
        _push(`<div class="card loading-card" data-product-loading data-v-7037630c><span class="loading-dot" aria-hidden="true" data-v-7037630c></span><span data-v-7037630c>Cargando publicaciones...</span></div>`);
      } else if (unref(items)?.length) {
        _push(`<section class="${ssrRenderClass([{ "calendar-workspace": __props.type === "cal" }, "publication-workspace"])}" data-v-7037630c><aside class="publication-summary" data-v-7037630c><div class="summary-card card" data-v-7037630c><p class="eyebrow" data-v-7037630c>${ssrInterpolate(summaryEyebrow.value)}</p><h2 data-v-7037630c>${ssrInterpolate(unref(items).length)} ${ssrInterpolate(unref(items).length === 1 ? "publicación" : "publicaciones")}</h2><p data-v-7037630c>${ssrInterpolate(summaryCopy.value)}</p><div class="summary-meta" data-v-7037630c><span data-v-7037630c>Última actualización</span><strong data-v-7037630c>${ssrInterpolate(unref(formatDate)(featuredItem.value?.date || featuredItem.value?.timestamp))}</strong></div></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "return-card",
          to: "/familia/daycare"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-7037630c${_scopeId}>Volver al inicio</span><strong data-v-7037630c${_scopeId}>Ver resumen de hoy</strong>`);
            } else {
              return [
                createVNode("span", null, "Volver al inicio"),
                createVNode("strong", null, "Ver resumen de hoy")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</aside><main class="publication-reader" data-v-7037630c><article class="featured-publication" data-v-7037630c><div class="featured-copy" data-v-7037630c><span class="featured-kicker" data-v-7037630c>${ssrInterpolate(featuredLabel.value)}</span><small data-v-7037630c>${ssrInterpolate(unref(formatDate)(featuredItem.value?.date || featuredItem.value?.timestamp))}</small><h2 data-v-7037630c>${ssrInterpolate(featuredItem.value?.title || titleFallback.value)}</h2><p data-v-7037630c>${ssrInterpolate(resourceCopy(featuredItem.value))}</p></div>`);
        if (resourceUrl(featuredItem.value)) {
          _push(`<a class="btn btn-primary"${ssrRenderAttr("href", resourceUrl(featuredItem.value))} target="_blank" rel="noopener" data-v-7037630c> Abrir recurso </a>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</article><section class="feed-section" data-v-7037630c><header class="feed-head" data-v-7037630c><div data-v-7037630c><p class="eyebrow" data-v-7037630c>${ssrInterpolate(remainingItems.value.length ? "También publicado" : "Publicación")}</p><h2 data-v-7037630c>${ssrInterpolate(remainingItems.value.length ? "Historial reciente" : "No hay más registros")}</h2></div></header><div class="${ssrRenderClass([{ "calendar-list": __props.type === "cal" }, "resource-list"])}" data-v-7037630c><!--[-->`);
        ssrRenderList(remainingItems.value, (item) => {
          _push(ssrRenderComponent(_component_ResourceCard, {
            key: item.id || `${item.title}-${item.date}`,
            resource: item,
            variant: __props.type === "hw" ? "homework" : "notice",
            density: "comfortable"
          }, null, _parent));
        });
        _push(`<!--]--></div></section></main></section>`);
      } else {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Sin publicaciones",
          description: "No hay registros vigentes para esta sección."
        }, null, _parent));
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/FamilyResourceList.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7037630c"]]);
export {
  __nuxt_component_0 as _
};
//# sourceMappingURL=FamilyResourceList-D8X1qjhF.js.map
