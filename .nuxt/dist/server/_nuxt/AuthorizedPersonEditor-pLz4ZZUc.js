import { _ as __nuxt_component_5 } from "./PersonasImageUpload-C526Ralt.js";
import { defineComponent, ref, computed, watch, nextTick, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { b as _export_sfc } from "../server.mjs";
function dateInputValue(value) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value || ""));
  return match?.[1] || "";
}
function normalizedIndice(value) {
  const parsed = Number(value || 1);
  return parsed >= 1 && parsed <= 4 ? parsed : 1;
}
function cleanText(value) {
  return String(value ?? "").trim();
}
function cleanNullableText(value) {
  const next = cleanText(value);
  return next || null;
}
function createAuthorizedPersonForm(person) {
  return {
    id: person?.id ? Number(person.id) : null,
    indice: normalizedIndice(person?.indice),
    paternoP: cleanText(person?.paternoP),
    maternoP: cleanText(person?.maternoP),
    nombreP: cleanText(person?.nombreP),
    parenP: cleanText(person?.parenP),
    foto: cleanNullableText(person?.foto),
    compressed_foto: cleanNullableText(person?.compressed_foto),
    fechaP: dateInputValue(person?.fechaP) || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
  };
}
function toAuthorizedPersonSavePayload(form) {
  return {
    id: form.id || null,
    indice: normalizedIndice(form.indice),
    paternoP: cleanNullableText(form.paternoP),
    maternoP: cleanNullableText(form.maternoP),
    nombreP: cleanText(form.nombreP),
    parenP: cleanText(form.parenP),
    foto: cleanNullableText(form.foto),
    compressed_foto: cleanNullableText(form.compressed_foto),
    fechaP: cleanNullableText(form.fechaP)
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AuthorizedPersonEditor",
  __ssrInlineRender: true,
  props: {
    person: {},
    label: {},
    saving: { type: Boolean },
    serverError: {}
  },
  emits: ["save", "cancel", "busy"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const form = ref(createAuthorizedPersonForm(props.person));
    const errors = ref({});
    const photoBusy = ref(false);
    const visionError = ref("");
    const formNotice = ref("");
    const firstInputRef = ref(null);
    const photoInputKey = computed(() => `photo-${form.value.id || "slot"}-${form.value.indice}-${form.value.foto || ""}-${form.value.compressed_foto || ""}`);
    const submitDisabled = computed(() => Boolean(props.saving || photoBusy.value));
    watch(() => props.person, async (person) => {
      form.value = createAuthorizedPersonForm(person);
      errors.value = {};
      visionError.value = "";
      formNotice.value = "";
      await nextTick();
      firstInputRef.value?.focus();
    }, { immediate: true });
    function setProcessedPhoto(payload) {
      form.value = {
        ...form.value,
        compressed_foto: payload.url
      };
      visionError.value = "";
      formNotice.value = "Foto confirmada para este registro.";
    }
    function setPhotoBusy(value) {
      photoBusy.value = value;
      emit("busy", value);
    }
    function setVisionError(message) {
      visionError.value = message;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasImageUpload = __nuxt_component_5;
      _push(`<form${ssrRenderAttrs(mergeProps({
        class: "editor-form",
        novalidate: ""
      }, _attrs))} data-v-a44d5304>`);
      if (__props.serverError) {
        _push(`<div class="alert compact-alert" role="alert" data-v-a44d5304>${ssrInterpolate(__props.serverError)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (formNotice.value) {
        _push(`<div class="notice compact-notice" role="status" data-v-a44d5304>${ssrInterpolate(formNotice.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="editor-layout" data-v-a44d5304><div class="editor-fields-card" data-v-a44d5304><header class="editor-section-head" data-v-a44d5304><p class="eyebrow" data-v-a44d5304>${ssrInterpolate(__props.label)}</p><h3 data-v-a44d5304>Datos de la persona</h3></header><div class="grid grid-2 editor-fields" data-v-a44d5304><label class="label" data-v-a44d5304> Nombre(s) <input${ssrRenderAttr("value", form.value.nombreP)} class="input" required autocomplete="given-name"${ssrRenderAttr("aria-invalid", Boolean(errors.value.nombreP))}${ssrRenderAttr("aria-describedby", errors.value.nombreP ? "pa-edit-nombre-error" : void 0)} data-v-a44d5304>`);
      if (errors.value.nombreP) {
        _push(`<small id="pa-edit-nombre-error" class="field-error" data-v-a44d5304>${ssrInterpolate(errors.value.nombreP)}</small>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label><label class="label" data-v-a44d5304> Apellido paterno <input${ssrRenderAttr("value", form.value.paternoP)} class="input" autocomplete="family-name" data-v-a44d5304></label><label class="label" data-v-a44d5304> Apellido materno <input${ssrRenderAttr("value", form.value.maternoP)} class="input" autocomplete="additional-name" data-v-a44d5304></label><label class="label" data-v-a44d5304> Parentesco <input${ssrRenderAttr("value", form.value.parenP)} class="input" required placeholder="Abuela, tio, nana..."${ssrRenderAttr("aria-invalid", Boolean(errors.value.parenP))}${ssrRenderAttr("aria-describedby", errors.value.parenP ? "pa-edit-parentesco-error" : void 0)} data-v-a44d5304>`);
      if (errors.value.parenP) {
        _push(`<small id="pa-edit-parentesco-error" class="field-error" data-v-a44d5304>${ssrInterpolate(errors.value.parenP)}</small>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label><label class="label" data-v-a44d5304> Fecha de alta <input${ssrRenderAttr("value", form.value.fechaP)} class="input readonly-input" type="date" readonly aria-readonly="true" data-v-a44d5304></label></div></div>`);
      _push(ssrRenderComponent(_component_FamilyPersonasImageUpload, {
        key: photoInputKey.value,
        "initial-src": form.value.compressed_foto || form.value.foto,
        "persona-id": form.value.id,
        eyebrow: "Foto de identificacion",
        title: "Foto",
        description: "Foto frontal, clara.",
        "confirm-label": "Confirmar foto",
        onProcessed: setProcessedPhoto,
        onProcessing: setPhotoBusy,
        onError: setVisionError
      }, null, _parent));
      _push(`</section>`);
      if (visionError.value) {
        _push(`<p class="alert compact-alert" role="alert" data-v-a44d5304>${ssrInterpolate(visionError.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="actions form-actions" data-v-a44d5304><button class="btn btn-primary" type="submit"${ssrIncludeBooleanAttr(submitDisabled.value) ? " disabled" : ""} data-diagnostic-action="guardar-persona-autorizada" data-v-a44d5304>${ssrInterpolate(__props.saving ? "Guardando..." : photoBusy.value ? "Preparando foto..." : "Guardar")}</button><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(__props.saving || photoBusy.value) ? " disabled" : ""} data-v-a44d5304>Cancelar</button></div></form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/AuthorizedPersonEditor.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_9 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a44d5304"]]);
export {
  __nuxt_component_9 as _,
  createAuthorizedPersonForm as c,
  toAuthorizedPersonSavePayload as t
};
//# sourceMappingURL=AuthorizedPersonEditor-pLz4ZZUc.js.map
