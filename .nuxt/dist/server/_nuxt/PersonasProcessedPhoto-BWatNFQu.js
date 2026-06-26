import { defineComponent, ref, computed, watch, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderSlot, ssrInterpolate } from "vue/server-renderer";
import { n as normalizeVirtualAssetUrl } from "./daycare-xTCL2ANB.js";
import { b as _export_sfc } from "../server.mjs";
const CACHE_PREFIX = "pa:vision-face:";
const CACHE_VERSION = "v5";
const VALIDATED_MARKER = "vision=marks-ok";
const inFlight = /* @__PURE__ */ new Map();
function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
function toVisionImageUrl(imageUrl) {
  const value = String(imageUrl || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  return value;
}
function canProcessWithVision(imageUrl) {
  return /^https?:\/\//i.test(toVisionImageUrl(imageUrl));
}
function isValidatedVisionPhotoUrl(value) {
  return String(value || "").includes(VALIDATED_MARKER);
}
function cacheKeyFor(imageUrl, namespace = "default") {
  return `${CACHE_PREFIX}${CACHE_VERSION}:${namespace}:${stableHash(imageUrl)}`;
}
function readCachedFace(imageUrl, namespace) {
  return null;
}
function getCachedProcessedFaceImage(imageUrl, namespace) {
  const normalized = toVisionImageUrl(imageUrl);
  if (!normalized) return "";
  return readCachedFace()?.src || "";
}
function writeCachedFace(imageUrl, result, namespace) {
  return;
}
async function processFaceImage(imageUrl) {
  const visionImageUrl = toVisionImageUrl(imageUrl);
  if (!visionImageUrl) throw new Error("Selecciona una imagen para continuar.");
  if (!canProcessWithVision(visionImageUrl)) throw new Error("La imagen debe estar disponible por URL pública.");
  throw new Error("El procesamiento de imagen requiere navegador.");
}
async function processFaceImageCached(imageUrl, options = {}) {
  const visionImageUrl = toVisionImageUrl(imageUrl);
  if (!visionImageUrl) throw new Error("Selecciona una imagen para continuar.");
  if (!options.force) {
    const cached = readCachedFace(visionImageUrl, options.namespace);
    if (cached) return cached;
  }
  const key = cacheKeyFor(visionImageUrl, options.namespace);
  const active = inFlight.get(key);
  if (active && !options.force) return active;
  const promise = processFaceImage(visionImageUrl).then((result) => {
    writeCachedFace(visionImageUrl, result, options.namespace);
    return result;
  }).finally(() => {
    if (inFlight.get(key) === promise) inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PersonasProcessedPhoto",
  __ssrInlineRender: true,
  props: {
    src: { default: "" },
    processedSrc: { default: "" },
    alt: { default: "" },
    fallback: { default: "" },
    namespace: { default: "personas-photo" },
    autoProcess: { type: Boolean, default: true },
    trustStoredProcessed: { type: Boolean, default: false },
    loading: { default: "lazy" },
    decoding: { default: "async" }
  },
  setup(__props) {
    const props = __props;
    const displaySrc = ref(normalizeVirtualAssetUrl(props.src || (props.trustStoredProcessed || isValidatedVisionPhotoUrl(props.processedSrc) ? props.processedSrc : "") || ""));
    const processing = ref(false);
    const failed = ref(false);
    const visionSource = ref("empty");
    const state = computed(() => {
      if (!displaySrc.value) return "empty";
      if (processing.value) return "processing";
      if (failed.value) return "fallback";
      return "ready";
    });
    const originalUrl = computed(() => normalizeVirtualAssetUrl(props.src || ""));
    const storedUrl = computed(() => normalizeVirtualAssetUrl(props.processedSrc || ""));
    const storedIsTrusted = computed(() => props.trustStoredProcessed || isValidatedVisionPhotoUrl(storedUrl.value));
    let requestIndex = 0;
    function firstRenderableSource() {
      return originalUrl.value || (storedIsTrusted.value ? storedUrl.value : "") || "";
    }
    function targetSourceForVision() {
      return originalUrl.value || "";
    }
    async function resolveDisplay() {
      const currentRequest = requestIndex + 1;
      requestIndex = currentRequest;
      failed.value = false;
      processing.value = false;
      const fallback = firstRenderableSource();
      if (!fallback) {
        displaySrc.value = "";
        visionSource.value = "empty";
        return;
      }
      displaySrc.value = fallback;
      visionSource.value = originalUrl.value ? "original" : "stored";
      const target = toVisionImageUrl(targetSourceForVision());
      if (!props.autoProcess || !canProcessWithVision(target)) return;
      const cached = getCachedProcessedFaceImage(target, props.namespace);
      if (cached) {
        displaySrc.value = cached;
        visionSource.value = "cache";
        return;
      }
      processing.value = true;
      try {
        const result = await processFaceImageCached(target, { namespace: props.namespace });
        if (requestIndex === currentRequest) {
          displaySrc.value = result.src;
          visionSource.value = result.fromCache ? "cache" : "vision";
        }
      } catch {
        if (requestIndex === currentRequest) {
          failed.value = true;
          displaySrc.value = fallback;
          visionSource.value = "fallback";
        }
      } finally {
        if (requestIndex === currentRequest) processing.value = false;
      }
    }
    watch(() => [props.src, props.processedSrc, props.namespace, props.autoProcess, props.trustStoredProcessed], () => {
      void resolveDisplay();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["processed-photo", { empty: !displaySrc.value }],
        "data-state": state.value,
        "data-vision-source": visionSource.value,
        "aria-busy": processing.value ? "true" : "false"
      }, _attrs))} data-v-cd121367>`);
      if (displaySrc.value) {
        _push(`<img${ssrRenderAttr("src", displaySrc.value)}${ssrRenderAttr("alt", __props.alt)}${ssrRenderAttr("loading", __props.loading)}${ssrRenderAttr("decoding", __props.decoding)} data-v-cd121367>`);
      } else {
        ssrRenderSlot(_ctx.$slots, "default", {}, () => {
          _push(`${ssrInterpolate(__props.fallback)}`);
        }, _push, _parent);
      }
      _push(`</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/PersonasProcessedPhoto.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cd121367"]]);
export {
  __nuxt_component_2 as _,
  isValidatedVisionPhotoUrl as i
};
//# sourceMappingURL=PersonasProcessedPhoto-BWatNFQu.js.map
