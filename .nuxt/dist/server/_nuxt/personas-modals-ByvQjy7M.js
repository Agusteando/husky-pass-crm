import { g as createError, e as useRoute, i as useRouter, a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_4 } from "./PersonasModal-COKcp1xQ.js";
import { _ as __nuxt_component_9 } from "./AuthorizedPersonEditor-pLz4ZZUc.js";
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, unref, openBlock, createBlock, createVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { d as personasThemeStyle, c as personasInstitutionLogo, b as personasInstitutionName, e as allPersonasThemes } from "./personasTheme-CJ7aLgiL.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "./PersonasImageUpload-C526Ralt.js";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "./daycare-xTCL2ANB.js";
import "./experienceIdentity-DUHnLdZH.js";
import "./matricula-C6apTRg-.js";
import "./sessionScopes-DtWD9iQ2.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "personas-modals",
  __ssrInlineRender: true,
  setup(__props) {
    if (process.env.NODE_ENV === "production") {
      throw createError({ statusCode: 404, statusMessage: "Ruta no disponible." });
    }
    const route = useRoute();
    useRouter();
    const themes = allPersonasThemes();
    const themeKey = ref(typeof route.query.theme === "string" ? route.query.theme : "escolar");
    const mode = ref(typeof route.query.mode === "string" ? route.query.mode : "edit");
    const closed = ref(false);
    const selectedTheme = computed(() => themes.find((theme) => theme.key === themeKey.value) || themes[0]);
    const themeVars = computed(() => personasThemeStyle(selectedTheme.value));
    const institutionLogo = computed(() => personasInstitutionLogo(selectedTheme.value));
    const institutionName = computed(() => personasInstitutionName(selectedTheme.value));
    const samplePerson = computed(() => ({
      id: 101,
      indice: 1,
      nombreP: selectedTheme.value.key === "secundaria" ? "Lucia Fernanda" : "Sofia",
      paternoP: "Lopez",
      maternoP: "Garcia",
      parenP: selectedTheme.value.key === "daycare" ? "Nana" : "Tia",
      fechaP: "2026-08-19",
      foto: `/api/dev/husky-pass/photo?seed=modal-${selectedTheme.value.key}&theme=${selectedTheme.value.key}&label=PA&mode=portrait`
    }));
    const sampleName = computed(() => [samplePerson.value.nombreP, samplePerson.value.paternoP, samplePerson.value.maternoP].filter(Boolean).join(" "));
    watch([themeKey, mode], () => {
      closed.value = false;
      return;
    });
    function noop() {
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_FamilyPersonasModal = __nuxt_component_4;
      const _component_FamilyAuthorizedPersonEditor = __nuxt_component_9;
      _push(`<main${ssrRenderAttrs(mergeProps({
        class: "dev-modal-page",
        style: themeVars.value,
        "data-product-area": "dev-personas-modals"
      }, _attrs))} data-v-49d68d41><header class="modal-lab-head" data-v-49d68d41><div data-v-49d68d41><p class="eyebrow" data-v-49d68d41>Dev harness</p><h1 data-v-49d68d41>Personas Autorizadas Modals</h1></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/__dev/husky-pass" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`PDF Lab`);
          } else {
            return [
              createTextVNode("PDF Lab")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header><section class="modal-controls" data-v-49d68d41><label data-v-49d68d41> Tema <select data-diagnostic-field="dev-modal-theme" data-v-49d68d41><!--[-->`);
      ssrRenderList(unref(themes), (item) => {
        _push(`<option${ssrRenderAttr("value", item.key)} data-v-49d68d41${ssrIncludeBooleanAttr(Array.isArray(themeKey.value) ? ssrLooseContain(themeKey.value, item.key) : ssrLooseEqual(themeKey.value, item.key)) ? " selected" : ""}>${ssrInterpolate(item.label)}</option>`);
      });
      _push(`<!--]--></select></label><label data-v-49d68d41> Modal <select data-diagnostic-field="dev-modal-mode" data-v-49d68d41><option value="edit" data-v-49d68d41${ssrIncludeBooleanAttr(Array.isArray(mode.value) ? ssrLooseContain(mode.value, "edit") : ssrLooseEqual(mode.value, "edit")) ? " selected" : ""}>Editar persona</option><option value="delete" data-v-49d68d41${ssrIncludeBooleanAttr(Array.isArray(mode.value) ? ssrLooseContain(mode.value, "delete") : ssrLooseEqual(mode.value, "delete")) ? " selected" : ""}>Eliminar</option><option value="busy" data-v-49d68d41${ssrIncludeBooleanAttr(Array.isArray(mode.value) ? ssrLooseContain(mode.value, "busy") : ssrLooseEqual(mode.value, "busy")) ? " selected" : ""}>Guardando</option></select></label></section><section class="theme-stage" data-v-49d68d41><img${ssrRenderAttr("src", institutionLogo.value)}${ssrRenderAttr("alt", institutionName.value)} data-v-49d68d41><div data-v-49d68d41><p class="eyebrow" data-v-49d68d41>${ssrInterpolate(selectedTheme.value.label)}</p><h2 data-v-49d68d41>${ssrInterpolate(institutionName.value)} / ${ssrInterpolate(selectedTheme.value.shortLabel)}</h2></div></section>`);
      if (!closed.value) {
        _push(ssrRenderComponent(_component_FamilyPersonasModal, {
          title: mode.value === "delete" ? "Eliminar registro" : "Persona 1",
          eyebrow: selectedTheme.value.label,
          theme: selectedTheme.value,
          "close-disabled": mode.value === "busy",
          onClose: ($event) => closed.value = true
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (mode.value !== "delete") {
                _push2(ssrRenderComponent(_component_FamilyAuthorizedPersonEditor, {
                  person: samplePerson.value,
                  label: "Persona 1",
                  saving: mode.value === "busy",
                  "server-error": mode.value === "busy" ? "" : "",
                  onBusy: noop,
                  onSave: noop,
                  onCancel: ($event) => closed.value = true
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<section class="delete-confirm" data-v-49d68d41${_scopeId}><p data-v-49d68d41${_scopeId}>${ssrInterpolate(sampleName.value)}</p><small data-v-49d68d41${_scopeId}>Tambien dejara de estar disponible para el Husky Pass.</small><div class="actions" data-v-49d68d41${_scopeId}><button class="btn btn-danger" type="button" data-v-49d68d41${_scopeId}>Eliminar</button><button class="btn btn-secondary" type="button" data-v-49d68d41${_scopeId}>Cancelar</button></div></section>`);
              }
            } else {
              return [
                mode.value !== "delete" ? (openBlock(), createBlock(_component_FamilyAuthorizedPersonEditor, {
                  key: 0,
                  person: samplePerson.value,
                  label: "Persona 1",
                  saving: mode.value === "busy",
                  "server-error": mode.value === "busy" ? "" : "",
                  onBusy: noop,
                  onSave: noop,
                  onCancel: ($event) => closed.value = true
                }, null, 8, ["person", "saving", "server-error", "onCancel"])) : (openBlock(), createBlock("section", {
                  key: 1,
                  class: "delete-confirm"
                }, [
                  createVNode("p", null, toDisplayString(sampleName.value), 1),
                  createVNode("small", null, "Tambien dejara de estar disponible para el Husky Pass."),
                  createVNode("div", { class: "actions" }, [
                    createVNode("button", {
                      class: "btn btn-danger",
                      type: "button"
                    }, "Eliminar"),
                    createVNode("button", {
                      class: "btn btn-secondary",
                      type: "button",
                      onClick: ($event) => closed.value = true
                    }, "Cancelar", 8, ["onClick"])
                  ])
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (closed.value) {
        _push(`<button class="reopen" type="button" data-v-49d68d41>Abrir modal</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/__dev/personas-modals.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const personasModals = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-49d68d41"]]);
export {
  personasModals as default
};
//# sourceMappingURL=personas-modals-ByvQjy7M.js.map
