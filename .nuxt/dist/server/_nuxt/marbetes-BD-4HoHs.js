import { a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, ref, reactive, computed, watch, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { f as formatDate } from "./daycare-xTCL2ANB.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "marbetes",
  __ssrInlineRender: true,
  setup(__props) {
    const { data, pending, error: loadError, refresh } = useFetch("/api/admin/marbete-templates", { timeout: 15e3 });
    const selectedId = ref("");
    const saving = ref(false);
    const actionError = ref("");
    const actionNotice = ref("");
    const selectedFile = ref(null);
    const fileName = ref("");
    const fileInput = ref(null);
    const form = reactive({
      id: "",
      name: "",
      nivel: "",
      planteles: "",
      themeKey: "preescolar"
    });
    const templates = computed(() => data.value?.templates || []);
    const themes = computed(() => data.value?.themes || []);
    const selected = computed(() => templates.value.find((template) => template.id === selectedId.value) || templates.value[0] || null);
    watch(selected, (template) => {
      if (template && !form.id && !actionNotice.value) selectTemplate(template);
    }, { immediate: true });
    function selectTemplate(template) {
      selectedId.value = template.id;
      Object.assign(form, {
        id: template.id,
        name: template.name,
        nivel: template.nivel,
        planteles: template.planteles.join(", "),
        themeKey: template.themeKey
      });
      selectedFile.value = null;
      fileName.value = "";
      actionError.value = "";
      actionNotice.value = "";
      if (fileInput.value) fileInput.value.value = "";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_EmptyState = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "marbete-admin stack",
        "data-product-area": "superadmin",
        "data-product-screen": "marbete-templates"
      }, _attrs))} data-v-d843629a><header class="workspace-head compact-head marbete-head" data-v-d843629a><div data-v-d843629a><p class="eyebrow" data-v-d843629a>Superadmin</p><h1 data-v-d843629a>Plantillas de marbete</h1><p data-v-d843629a>Gestiona los SVG institucionales usados por Personas Autorizadas segun plantel y nivel.</p></div><div class="head-actions" data-v-d843629a>`);
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
        to: "/admin/superadmin/entorno"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Entorno`);
          } else {
            return [
              createTextVNode("Entorno")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="btn btn-primary" type="button" data-diagnostic-action="nueva-plantilla" data-v-d843629a>Nueva plantilla</button></div></header>`);
      if (unref(loadError)) {
        _push(`<p class="alert" data-state="error" data-v-d843629a>No fue posible cargar plantillas.</p>`);
      } else if (unref(pending)) {
        _push(`<div class="card loading-card" data-product-loading data-state="loading" data-v-d843629a>Cargando plantillas...</div>`);
      } else {
        _push(`<section class="template-workspace" data-v-d843629a><div class="template-list" data-product-panel="marbete-template-list"${ssrRenderAttr("data-state", templates.value.length ? "content" : "empty")} data-v-d843629a><!--[-->`);
        ssrRenderList(templates.value, (template) => {
          _push(`<article class="${ssrRenderClass([{ active: selected.value?.id === template.id }, "template-row"])}" style="${ssrRenderStyle({ "--template-color": template.color })}" data-v-d843629a><button type="button" data-diagnostic-action="seleccionar-plantilla" data-v-d843629a><span class="color-dot" data-v-d843629a></span><span class="template-copy" data-v-d843629a><strong data-v-d843629a>${ssrInterpolate(template.name)}</strong><small data-v-d843629a>${ssrInterpolate(template.nivel)} / ${ssrInterpolate(template.planteles.length ? template.planteles.join(", ") : "Fallback")}</small></span><span class="badge" data-v-d843629a>${ssrInterpolate(template.themeKey)}</span></button></article>`);
        });
        _push(`<!--]-->`);
        if (!templates.value.length) {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "Sin plantillas",
            description: "Agrega una plantilla SVG para habilitar descargas de marbete."
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><aside class="editor-column" data-v-d843629a><section class="card template-detail" data-product-panel="marbete-template-detail"${ssrRenderAttr("data-state", selected.value ? "content" : "empty")} data-v-d843629a>`);
        if (selected.value) {
          _push(`<!--[--><div class="section-head" data-v-d843629a><div data-v-d843629a><p class="eyebrow" data-v-d843629a>Plantilla seleccionada</p><h2 data-v-d843629a>${ssrInterpolate(selected.value.name)}</h2></div><span class="theme-pill" style="${ssrRenderStyle({ background: selected.value.color })}" data-v-d843629a>${ssrInterpolate(selected.value.themeKey)}</span></div><dl data-v-d843629a><div data-v-d843629a><dt data-v-d843629a>Nivel</dt><dd data-v-d843629a>${ssrInterpolate(selected.value.nivel)}</dd></div><div data-v-d843629a><dt data-v-d843629a>Planteles</dt><dd data-v-d843629a>${ssrInterpolate(selected.value.planteles.length ? selected.value.planteles.join(", ") : "Fallback general")}</dd></div><div data-v-d843629a><dt data-v-d843629a>Archivo</dt><dd data-v-d843629a>${ssrInterpolate(selected.value.filename)}</dd></div><div data-v-d843629a><dt data-v-d843629a>Actualizada</dt><dd data-v-d843629a>${ssrInterpolate(unref(formatDate)(selected.value.updatedAt))}</dd></div></dl><iframe${ssrRenderAttr("src", `/api/admin/marbete-templates/${selected.value.id}`)} title="Vista previa de plantilla" data-v-d843629a></iframe><!--]-->`);
        } else {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "Selecciona una plantilla",
            description: "Verás aplicación, archivo y vista previa protegida."
          }, null, _parent));
        }
        _push(`</section><form class="card template-form" data-product-panel="marbete-template-form" data-v-d843629a><div class="section-head" data-v-d843629a><div data-v-d843629a><p class="eyebrow" data-v-d843629a>${ssrInterpolate(form.id ? "Actualizar plantilla" : "Nueva plantilla")}</p><h2 data-v-d843629a>${ssrInterpolate(form.id ? form.name || "Plantilla" : "Agregar SVG")}</h2></div><button class="btn btn-secondary compact" type="button" data-v-d843629a>Limpiar</button></div><label class="label" data-v-d843629a> Nombre <input${ssrRenderAttr("value", form.name)} class="input" required data-diagnostic-field="template-name" data-v-d843629a></label><div class="grid grid-2" data-v-d843629a><label class="label" data-v-d843629a> Tema <select class="select" required data-diagnostic-field="template-theme" data-v-d843629a><!--[-->`);
        ssrRenderList(themes.value, (theme) => {
          _push(`<option${ssrRenderAttr("value", theme.key)} data-v-d843629a${ssrIncludeBooleanAttr(Array.isArray(form.themeKey) ? ssrLooseContain(form.themeKey, theme.key) : ssrLooseEqual(form.themeKey, theme.key)) ? " selected" : ""}>${ssrInterpolate(theme.label)}</option>`);
        });
        _push(`<!--]--></select></label><label class="label" data-v-d843629a> Nivel <input${ssrRenderAttr("value", form.nivel)} class="input" required placeholder="preescolar, primaria, secundaria" data-diagnostic-field="template-nivel" data-v-d843629a></label></div><label class="label" data-v-d843629a> Planteles <input${ssrRenderAttr("value", form.planteles)} class="input" placeholder="PT, PM" data-diagnostic-field="template-planteles" data-v-d843629a></label><label class="label" data-v-d843629a> Archivo SVG <input class="input file-field" type="file" accept=".svg,image/svg+xml" data-diagnostic-field="template-file" data-v-d843629a></label><p class="muted helper" data-v-d843629a>${ssrInterpolate(fileName.value || (form.id ? "Puedes guardar metadatos sin reemplazar el SVG." : "La nueva plantilla requiere archivo SVG."))}</p><button class="btn btn-primary" type="submit"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-diagnostic-action="guardar-plantilla" data-v-d843629a>${ssrInterpolate(saving.value ? "Guardando..." : form.id ? "Actualizar plantilla" : "Crear plantilla")}</button>`);
        if (actionError.value) {
          _push(`<p class="alert compact-alert" data-v-d843629a>${ssrInterpolate(actionError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (actionNotice.value) {
          _push(`<p class="notice" data-v-d843629a>${ssrInterpolate(actionNotice.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</form></aside></section>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/superadmin/marbetes.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const marbetes = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d843629a"]]);
export {
  marbetes as default
};
//# sourceMappingURL=marbetes-BD-4HoHs.js.map
