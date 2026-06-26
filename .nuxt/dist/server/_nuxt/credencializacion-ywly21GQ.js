import { _ as __nuxt_component_0, a as __nuxt_component_1 } from "./PersonasPageHeader-CbpYMeMe.js";
import { _ as __nuxt_component_2 } from "./PersonasProcessedPhoto-BWatNFQu.js";
import { _ as __nuxt_component_1$1 } from "./PersonasIcon-B5CnsWTN.js";
import { _ as __nuxt_component_4 } from "./PersonasModal-COKcp1xQ.js";
import { _ as __nuxt_component_5 } from "./PersonasImageUpload-C526Ralt.js";
import { defineComponent, ref, computed, mergeProps, withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderAttr, ssrInterpolate } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { b as _export_sfc } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { a as usePersonasFamilyPeople } from "./usePersonasTheme-CmVh5mbY.js";
import { n as normalizeVirtualAssetUrl } from "./daycare-xTCL2ANB.js";
import { r as resolvePersonasTheme } from "./personasTheme-CJ7aLgiL.js";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
import "./AccountMenu-Cc9CsO5z.js";
import "./_virtual_public-BTp6Nzoa.js";
import "@lucide/vue";
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
import "./useAppSession-D-b8QDDW.js";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "credencializacion",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: profile, refresh, pending, error: loadError } = useFetch("/api/personas-autorizadas/student", { key: "pa-student-profile", timeout: 15e3, dedupe: "defer" });
    const familyPeople = usePersonasFamilyPeople({ immediate: false });
    const photoModalOpen = ref(false);
    const currentPhotoModalOpen = ref(false);
    const processing = ref(false);
    const saving = ref(false);
    const error = ref("");
    const notice = ref("");
    const saved = ref(false);
    const pendingPhotoUrl = ref("");
    function retryLoad() {
      return refresh();
    }
    const theme = computed(() => resolvePersonasTheme({
      matricula: profile.value?.readonly.matricula,
      plantel: profile.value?.readonly.plantel,
      nivelEdu: profile.value?.readonly.nivel
    }));
    const currentPhoto = computed(() => normalizeVirtualAssetUrl(profile.value?.readonly.foto || ""));
    const studentName = computed(() => [profile.value?.editable.nombres, profile.value?.editable.apellido_paterno, profile.value?.editable.apellido_materno].filter(Boolean).join(" "));
    const academicLine = computed(() => [displayMatricula(profile.value?.readonly.matricula), profile.value?.readonly.nivel, profile.value?.readonly.grado, profile.value?.readonly.grupo].filter(Boolean).join(" / "));
    const statusText = computed(() => {
      if (processing.value) return "Preparando…";
      if (saving.value) return "Guardando…";
      if (saved.value) return "Guardada.";
      return currentPhoto.value ? "Lista." : "Pendiente.";
    });
    function openPhotoModal() {
      pendingPhotoUrl.value = "";
      error.value = "";
      notice.value = "";
      photoModalOpen.value = true;
    }
    function closePhotoModal() {
      if (processing.value || saving.value) return;
      photoModalOpen.value = false;
      pendingPhotoUrl.value = "";
    }
    function setUploadError(message) {
      error.value = message;
      notice.value = "";
    }
    function setPendingPhoto(payload) {
      pendingPhotoUrl.value = payload.url;
      error.value = "";
      notice.value = "";
    }
    async function savePendingPhoto() {
      if (!pendingPhotoUrl.value) return;
      saving.value = true;
      error.value = "";
      notice.value = "";
      saved.value = false;
      try {
        await $fetch("/api/personas-autorizadas/student-photo", {
          method: "POST",
          body: { foto: pendingPhotoUrl.value }
        });
        await refresh();
        await familyPeople.refresh().catch(() => void 0);
        saved.value = true;
        photoModalOpen.value = false;
        pendingPhotoUrl.value = "";
        notice.value = "Foto guardada.";
      } catch (err) {
        const failure = err;
        error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || "No fue posible guardar la foto.";
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAutorizadasShell = __nuxt_component_0;
      const _component_FamilyPersonasPageHeader = __nuxt_component_1;
      const _component_FamilyPersonasProcessedPhoto = __nuxt_component_2;
      const _component_FamilyPersonasIcon = __nuxt_component_1$1;
      const _component_FamilyPersonasModal = __nuxt_component_4;
      const _component_FamilyPersonasImageUpload = __nuxt_component_5;
      _push(ssrRenderComponent(_component_FamilyPersonasAutorizadasShell, mergeProps({ title: "Foto del alumno" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_FamilyPersonasPageHeader, {
              eyebrow: "Alumno",
              title: "Foto del alumno",
              description: "Mantén una fotografía clara y actual para generar los Husky Pass.",
              meta: currentPhoto.value ? "Foto lista" : "Foto pendiente",
              theme: theme.value,
              "ambassador-variant": "preview"
            }, null, _parent2, _scopeId));
            if (unref(loadError)) {
              _push2(`<div class="alert retry-alert" data-state="error" data-v-ee7c4699${_scopeId}><span data-v-ee7c4699${_scopeId}>No fue posible cargar los datos del alumno.</span><button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-foto-alumno" data-v-ee7c4699${_scopeId}>Reintentar</button></div>`);
            } else if (unref(pending)) {
              _push2(`<div class="card loading-row" data-product-loading data-v-ee7c4699${_scopeId}>Cargando…</div>`);
            } else if (unref(profile)) {
              _push2(`<section class="photo-studio" data-product-panel="student-photo-update" data-v-ee7c4699${_scopeId}><article class="photo-preview-stage" data-v-ee7c4699${_scopeId}><button class="photo-preview" type="button"${ssrIncludeBooleanAttr(!currentPhoto.value) ? " disabled" : ""} data-diagnostic-action="ver-foto-alumno" data-v-ee7c4699${_scopeId}>`);
              if (currentPhoto.value) {
                _push2(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                  src: currentPhoto.value,
                  alt: "Foto actual del alumno",
                  namespace: "pa-student-photo"
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<span data-v-ee7c4699${_scopeId}>Sin foto</span>`);
              }
              _push2(`</button><div class="status-card"${ssrRenderAttr("data-state", processing.value || saving.value ? "loading" : saved.value ? "saved" : currentPhoto.value ? "ready" : "idle")} data-v-ee7c4699${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "camera" }, null, _parent2, _scopeId));
              _push2(`<span data-v-ee7c4699${_scopeId}>${ssrInterpolate(statusText.value)}</span></div></article><article class="photo-action-panel" data-v-ee7c4699${_scopeId}><p class="eyebrow" data-v-ee7c4699${_scopeId}>${ssrInterpolate(academicLine.value || "Alumno")}</p><h2 data-v-ee7c4699${_scopeId}>${ssrInterpolate(studentName.value || "Alumno")}</h2><p class="photo-intro" data-v-ee7c4699${_scopeId}>La foto del alumno habilita la generación de Husky Pass y evita rechazos al imprimir.</p><div class="actions" data-v-ee7c4699${_scopeId}><button class="btn btn-primary pa-primary" type="button" data-diagnostic-action="abrir-modal-foto-alumno" data-v-ee7c4699${_scopeId}>${ssrInterpolate(currentPhoto.value ? "Actualizar foto" : "Subir foto")}</button>`);
              if (currentPhoto.value) {
                _push2(`<button class="btn btn-secondary" type="button" data-v-ee7c4699${_scopeId}>Ver actual</button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="photo-checklist" aria-label="Criterios de foto" data-v-ee7c4699${_scopeId}><span data-v-ee7c4699${_scopeId}>Frontal</span><span data-v-ee7c4699${_scopeId}>Clara</span><span data-v-ee7c4699${_scopeId}>Actual</span></div><div class="photo-next-step"${ssrRenderAttr("data-state", currentPhoto.value ? "ready" : "pending")} data-v-ee7c4699${_scopeId}><strong data-v-ee7c4699${_scopeId}>${ssrInterpolate(currentPhoto.value ? "Foto lista para Husky Pass" : "Siguiente paso")}</strong><span data-v-ee7c4699${_scopeId}>${ssrInterpolate(currentPhoto.value ? "Puedes actualizarla cuando cambie o si el colegio solicita una nueva toma." : "Sube una foto frontal y clara para habilitar la generación de Husky Pass.")}</span></div></article></section>`);
            } else {
              _push2(`<!---->`);
            }
            if (photoModalOpen.value) {
              _push2(ssrRenderComponent(_component_FamilyPersonasModal, {
                title: "Foto del alumno",
                eyebrow: "Alumno",
                description: pendingPhotoUrl.value ? "Confirma para guardar." : "",
                theme: theme.value,
                onClose: closePhotoModal
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_FamilyPersonasImageUpload, {
                      "initial-src": currentPhoto.value,
                      eyebrow: "Foto",
                      title: "Subir foto",
                      description: "Foto frontal, clara.",
                      "confirm-label": "Confirmar foto",
                      onProcessed: setPendingPhoto,
                      onProcessing: ($event) => processing.value = $event,
                      onError: setUploadError
                    }, null, _parent3, _scopeId2));
                    _push3(`<div class="modal-actions" data-v-ee7c4699${_scopeId2}><button class="btn btn-primary pa-primary" type="button"${ssrIncludeBooleanAttr(saving.value || processing.value || !pendingPhotoUrl.value) ? " disabled" : ""} data-diagnostic-action="guardar-foto-alumno" data-v-ee7c4699${_scopeId2}>${ssrInterpolate(saving.value ? "Guardando…" : "Guardar foto")}</button><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(saving.value || processing.value) ? " disabled" : ""} data-v-ee7c4699${_scopeId2}>Cancelar</button></div>`);
                  } else {
                    return [
                      createVNode(_component_FamilyPersonasImageUpload, {
                        "initial-src": currentPhoto.value,
                        eyebrow: "Foto",
                        title: "Subir foto",
                        description: "Foto frontal, clara.",
                        "confirm-label": "Confirmar foto",
                        onProcessed: setPendingPhoto,
                        onProcessing: ($event) => processing.value = $event,
                        onError: setUploadError
                      }, null, 8, ["initial-src", "onProcessing"]),
                      createVNode("div", { class: "modal-actions" }, [
                        createVNode("button", {
                          class: "btn btn-primary pa-primary",
                          type: "button",
                          disabled: saving.value || processing.value || !pendingPhotoUrl.value,
                          "data-diagnostic-action": "guardar-foto-alumno",
                          onClick: savePendingPhoto
                        }, toDisplayString(saving.value ? "Guardando…" : "Guardar foto"), 9, ["disabled"]),
                        createVNode("button", {
                          class: "btn btn-secondary",
                          type: "button",
                          disabled: saving.value || processing.value,
                          onClick: closePhotoModal
                        }, "Cancelar", 8, ["disabled"])
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (currentPhotoModalOpen.value && currentPhoto.value) {
              _push2(ssrRenderComponent(_component_FamilyPersonasModal, {
                title: "Foto actual",
                eyebrow: "Alumno",
                theme: theme.value,
                onClose: ($event) => currentPhotoModalOpen.value = false
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                      class: "current-photo-large",
                      src: currentPhoto.value,
                      alt: "Foto actual del alumno",
                      namespace: "pa-student-photo"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_FamilyPersonasProcessedPhoto, {
                        class: "current-photo-large",
                        src: currentPhoto.value,
                        alt: "Foto actual del alumno",
                        namespace: "pa-student-photo"
                      }, null, 8, ["src"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (error.value) {
              _push2(`<p class="alert" data-v-ee7c4699${_scopeId}>${ssrInterpolate(error.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (notice.value) {
              _push2(`<p class="notice" data-v-ee7c4699${_scopeId}>${ssrInterpolate(notice.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode(_component_FamilyPersonasPageHeader, {
                eyebrow: "Alumno",
                title: "Foto del alumno",
                description: "Mantén una fotografía clara y actual para generar los Husky Pass.",
                meta: currentPhoto.value ? "Foto lista" : "Foto pendiente",
                theme: theme.value,
                "ambassador-variant": "preview"
              }, null, 8, ["meta", "theme"]),
              unref(loadError) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "alert retry-alert",
                "data-state": "error"
              }, [
                createVNode("span", null, "No fue posible cargar los datos del alumno."),
                createVNode("button", {
                  class: "btn btn-secondary",
                  type: "button",
                  "data-diagnostic-action": "reintentar-foto-alumno",
                  onClick: retryLoad
                }, "Reintentar")
              ])) : unref(pending) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "card loading-row",
                "data-product-loading": ""
              }, "Cargando…")) : unref(profile) ? (openBlock(), createBlock("section", {
                key: 2,
                class: "photo-studio",
                "data-product-panel": "student-photo-update"
              }, [
                createVNode("article", { class: "photo-preview-stage" }, [
                  createVNode("button", {
                    class: "photo-preview",
                    type: "button",
                    disabled: !currentPhoto.value,
                    "data-diagnostic-action": "ver-foto-alumno",
                    onClick: ($event) => currentPhotoModalOpen.value = Boolean(currentPhoto.value)
                  }, [
                    currentPhoto.value ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                      key: 0,
                      src: currentPhoto.value,
                      alt: "Foto actual del alumno",
                      namespace: "pa-student-photo"
                    }, null, 8, ["src"])) : (openBlock(), createBlock("span", { key: 1 }, "Sin foto"))
                  ], 8, ["disabled", "onClick"]),
                  createVNode("div", {
                    class: "status-card",
                    "data-state": processing.value || saving.value ? "loading" : saved.value ? "saved" : currentPhoto.value ? "ready" : "idle"
                  }, [
                    createVNode(_component_FamilyPersonasIcon, { name: "camera" }),
                    createVNode("span", null, toDisplayString(statusText.value), 1)
                  ], 8, ["data-state"])
                ]),
                createVNode("article", { class: "photo-action-panel" }, [
                  createVNode("p", { class: "eyebrow" }, toDisplayString(academicLine.value || "Alumno"), 1),
                  createVNode("h2", null, toDisplayString(studentName.value || "Alumno"), 1),
                  createVNode("p", { class: "photo-intro" }, "La foto del alumno habilita la generación de Husky Pass y evita rechazos al imprimir."),
                  createVNode("div", { class: "actions" }, [
                    createVNode("button", {
                      class: "btn btn-primary pa-primary",
                      type: "button",
                      "data-diagnostic-action": "abrir-modal-foto-alumno",
                      onClick: openPhotoModal
                    }, toDisplayString(currentPhoto.value ? "Actualizar foto" : "Subir foto"), 1),
                    currentPhoto.value ? (openBlock(), createBlock("button", {
                      key: 0,
                      class: "btn btn-secondary",
                      type: "button",
                      onClick: ($event) => currentPhotoModalOpen.value = true
                    }, "Ver actual", 8, ["onClick"])) : createCommentVNode("", true)
                  ]),
                  createVNode("div", {
                    class: "photo-checklist",
                    "aria-label": "Criterios de foto"
                  }, [
                    createVNode("span", null, "Frontal"),
                    createVNode("span", null, "Clara"),
                    createVNode("span", null, "Actual")
                  ]),
                  createVNode("div", {
                    class: "photo-next-step",
                    "data-state": currentPhoto.value ? "ready" : "pending"
                  }, [
                    createVNode("strong", null, toDisplayString(currentPhoto.value ? "Foto lista para Husky Pass" : "Siguiente paso"), 1),
                    createVNode("span", null, toDisplayString(currentPhoto.value ? "Puedes actualizarla cuando cambie o si el colegio solicita una nueva toma." : "Sube una foto frontal y clara para habilitar la generación de Husky Pass."), 1)
                  ], 8, ["data-state"])
                ])
              ])) : createCommentVNode("", true),
              photoModalOpen.value ? (openBlock(), createBlock(_component_FamilyPersonasModal, {
                key: 3,
                title: "Foto del alumno",
                eyebrow: "Alumno",
                description: pendingPhotoUrl.value ? "Confirma para guardar." : "",
                theme: theme.value,
                onClose: closePhotoModal
              }, {
                default: withCtx(() => [
                  createVNode(_component_FamilyPersonasImageUpload, {
                    "initial-src": currentPhoto.value,
                    eyebrow: "Foto",
                    title: "Subir foto",
                    description: "Foto frontal, clara.",
                    "confirm-label": "Confirmar foto",
                    onProcessed: setPendingPhoto,
                    onProcessing: ($event) => processing.value = $event,
                    onError: setUploadError
                  }, null, 8, ["initial-src", "onProcessing"]),
                  createVNode("div", { class: "modal-actions" }, [
                    createVNode("button", {
                      class: "btn btn-primary pa-primary",
                      type: "button",
                      disabled: saving.value || processing.value || !pendingPhotoUrl.value,
                      "data-diagnostic-action": "guardar-foto-alumno",
                      onClick: savePendingPhoto
                    }, toDisplayString(saving.value ? "Guardando…" : "Guardar foto"), 9, ["disabled"]),
                    createVNode("button", {
                      class: "btn btn-secondary",
                      type: "button",
                      disabled: saving.value || processing.value,
                      onClick: closePhotoModal
                    }, "Cancelar", 8, ["disabled"])
                  ])
                ]),
                _: 1
              }, 8, ["description", "theme"])) : createCommentVNode("", true),
              currentPhotoModalOpen.value && currentPhoto.value ? (openBlock(), createBlock(_component_FamilyPersonasModal, {
                key: 4,
                title: "Foto actual",
                eyebrow: "Alumno",
                theme: theme.value,
                onClose: ($event) => currentPhotoModalOpen.value = false
              }, {
                default: withCtx(() => [
                  createVNode(_component_FamilyPersonasProcessedPhoto, {
                    class: "current-photo-large",
                    src: currentPhoto.value,
                    alt: "Foto actual del alumno",
                    namespace: "pa-student-photo"
                  }, null, 8, ["src"])
                ]),
                _: 1
              }, 8, ["theme", "onClose"])) : createCommentVNode("", true),
              error.value ? (openBlock(), createBlock("p", {
                key: 5,
                class: "alert"
              }, toDisplayString(error.value), 1)) : createCommentVNode("", true),
              notice.value ? (openBlock(), createBlock("p", {
                key: 6,
                class: "notice"
              }, toDisplayString(notice.value), 1)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/credencializacion.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const credencializacion = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ee7c4699"]]);
export {
  credencializacion as default
};
//# sourceMappingURL=credencializacion-ywly21GQ.js.map
