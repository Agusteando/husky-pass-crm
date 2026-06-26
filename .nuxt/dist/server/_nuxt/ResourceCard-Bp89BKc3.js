import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderStyle } from "vue/server-renderer";
import { i as isPdfResource, p as publishedPdfViewerUrl, e as isImageResource, f as formatDate, s as stripHtml } from "./daycare-xTCL2ANB.js";
import { b as _export_sfc } from "../server.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ResourceCard",
  __ssrInlineRender: true,
  props: {
    resource: {},
    variant: {},
    density: {}
  },
  setup(__props) {
    const props = __props;
    const imageReady = ref(false);
    const imageFailed = ref(false);
    const resourceHref = computed(() => {
      return isPdfResource(props.resource.resource) ? publishedPdfViewerUrl(props.resource.resource) : props.resource.resource || "";
    });
    const canPreviewImage = computed(() => Boolean(props.resource.resource && isImageResource(props.resource.resource) && !imageFailed.value));
    const variantClass = computed(() => [
      props.variant ? `variant-${props.variant}` : "variant-default",
      `density-${props.density || "compact"}`
    ]);
    const titleFallback = computed(() => props.variant === "homework" ? "Tarea" : "Sin título");
    watch(() => props.resource.resource, () => {
      imageReady.value = false;
      imageFailed.value = false;
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: ["resource-card", variantClass.value]
      }, _attrs))} data-v-f4346598><div class="resource-meta" data-v-f4346598><span class="badge-date" data-v-f4346598>${ssrInterpolate(unref(formatDate)(__props.resource.date || __props.resource.timestamp))}</span>`);
      if (__props.resource.starred) {
        _push(`<span class="starred" data-v-f4346598>Prioritario</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><h3 data-v-f4346598>${ssrInterpolate(__props.resource.title || titleFallback.value)}</h3><p data-v-f4346598>${ssrInterpolate(unref(stripHtml)(__props.resource.description || __props.resource.html) || "Sin descripción disponible.")}</p>`);
      if (canPreviewImage.value) {
        _push(`<img class="resource-image"${ssrRenderAttr("src", __props.resource.resource || "")} alt="Recurso publicado" decoding="async" loading="lazy" style="${ssrRenderStyle(imageReady.value ? null : { display: "none" })}" data-v-f4346598>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.resource.resource) {
        _push(`<a class="btn btn-secondary resource-button"${ssrRenderAttr("href", resourceHref.value)} target="_blank" rel="noopener" data-v-f4346598>${ssrInterpolate(unref(isPdfResource)(__props.resource.resource) ? "Abrir Documento PDF" : "Abrir recurso")}</a>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.resource.autor) {
        _push(`<small class="muted" data-v-f4346598>Publicado por: ${ssrInterpolate(__props.resource.autor)}</small>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</article>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ResourceCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f4346598"]]);
export {
  __nuxt_component_1 as _
};
//# sourceMappingURL=ResourceCard-Bp89BKc3.js.map
