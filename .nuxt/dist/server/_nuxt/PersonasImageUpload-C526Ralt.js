import { _ as __nuxt_component_1 } from "./PersonasIcon-B5CnsWTN.js";
import { defineComponent, ref, computed, watch, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { n as normalizeVirtualAssetUrl } from "./daycare-xTCL2ANB.js";
import { b as _export_sfc } from "../server.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PersonasImageUpload",
  __ssrInlineRender: true,
  props: {
    initialSrc: { default: "" },
    personaId: { default: null },
    title: { default: "Foto" },
    eyebrow: { default: "Fotografía" },
    description: { default: "" },
    allowRemove: { type: Boolean, default: false },
    confirmLabel: { default: "Usar esta foto" }
  },
  emits: ["processed", "clear", "error", "processing"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    ref(null);
    const selectedName = ref("");
    const localPreview = ref("");
    const processedUrl = ref("");
    const processing = ref(false);
    const confirmed = ref(false);
    const error = ref("");
    const notice = ref("");
    const displayPreview = computed(() => localPreview.value || normalizeVirtualAssetUrl(processedUrl.value || props.initialSrc || ""));
    const helperText = computed(() => props.description || "");
    const hasSelection = computed(() => Boolean(selectedName.value || displayPreview.value));
    const uploadState = computed(() => {
      if (error.value) return "error";
      if (processing.value) return "loading";
      if (confirmed.value) return "confirmed";
      if (processedUrl.value) return "ready-to-confirm";
      if (displayPreview.value) return "ready";
      return "empty";
    });
    watch(() => props.initialSrc, () => {
      if (!localPreview.value) processedUrl.value = "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasIcon = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "pa-image-upload",
        "data-state": uploadState.value
      }, _attrs))} data-v-4e185277><div class="image-frame"${ssrRenderAttr("data-state", processing.value ? "processing" : displayPreview.value ? "ready" : "empty")} data-v-4e185277>`);
      if (displayPreview.value) {
        _push(`<img${ssrRenderAttr("src", displayPreview.value)} alt="Vista previa" data-v-4e185277>`);
      } else {
        _push(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "camera" }, null, _parent));
      }
      _push(`</div><div class="image-controls" data-v-4e185277><div class="image-head" data-v-4e185277>`);
      if (__props.eyebrow) {
        _push(`<p class="eyebrow" data-v-4e185277>${ssrInterpolate(__props.eyebrow)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<h3 data-v-4e185277>${ssrInterpolate(__props.title || "Foto")}</h3>`);
      if (helperText.value) {
        _push(`<p data-v-4e185277>${ssrInterpolate(helperText.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><ol class="upload-steps" aria-label="Estado de foto" data-v-4e185277><li class="${ssrRenderClass({ done: hasSelection.value, active: !hasSelection.value && !processing.value })}" data-v-4e185277>Seleccionar</li><li class="${ssrRenderClass({ done: processedUrl.value, active: processing.value })}" data-v-4e185277>Preparar</li><li class="${ssrRenderClass({ done: confirmed.value, active: processedUrl.value && !confirmed.value })}" data-v-4e185277>Confirmar</li></ol><label class="${ssrRenderClass([{ busy: processing.value }, "upload-drop"])}" data-v-4e185277><input type="file" accept="image/png,image/jpeg,image/webp"${ssrIncludeBooleanAttr(processing.value) ? " disabled" : ""} data-diagnostic-action="subir-imagen-personas" data-v-4e185277><span data-v-4e185277>${ssrInterpolate(processing.value ? "Preparando…" : selectedName.value || "Seleccionar foto")}</span><small data-v-4e185277>PNG, JPG o WEBP · 5 MB máx.</small></label><div class="upload-actions" data-v-4e185277>`);
      if (processedUrl.value && !confirmed.value) {
        _push(`<button class="btn btn-primary pa-primary" type="button"${ssrIncludeBooleanAttr(processing.value) ? " disabled" : ""} data-diagnostic-action="confirmar-foto-preparada" data-v-4e185277>${ssrInterpolate(__props.confirmLabel)}</button>`);
      } else {
        _push(`<!---->`);
      }
      if (displayPreview.value) {
        _push(`<button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(processing.value) ? " disabled" : ""} data-v-4e185277>Cambiar</button>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.allowRemove && displayPreview.value) {
        _push(`<button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(processing.value) ? " disabled" : ""} data-v-4e185277>Quitar</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (error.value) {
        _push(`<p class="alert compact-alert" data-v-4e185277>${ssrInterpolate(error.value)}</p>`);
      } else if (notice.value) {
        _push(`<p class="notice compact-notice" data-v-4e185277>${ssrInterpolate(notice.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/PersonasImageUpload.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4e185277"]]);
export {
  __nuxt_component_5 as _
};
//# sourceMappingURL=PersonasImageUpload-C526Ralt.js.map
