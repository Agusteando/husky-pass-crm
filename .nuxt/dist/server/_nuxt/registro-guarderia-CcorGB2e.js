import { _ as __nuxt_component_0, a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { defineComponent, reactive, ref, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { v as visualIdentityForContext, e as experienceThemeVars } from "./experienceIdentity-DUHnLdZH.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./matricula-C6apTRg-.js";
import "./sessionScopes-DtWD9iQ2.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "registro-guarderia",
  __ssrInlineRender: true,
  setup(__props) {
    const identity = visualIdentityForContext({ experience: "guarderia", institution: null, nivel: "guarderia", plantel: "CM", grupo: null });
    const identityVars = experienceThemeVars(identity);
    const form = reactive({
      parentName: "",
      childName: "",
      email: "",
      password: "",
      unidad: "",
      sala: "",
      captchaAnswer: "",
      website: ""
    });
    ref(null);
    const selectedFileName = ref("");
    ref(null);
    const captcha = ref(null);
    const captchaPending = ref(false);
    const captchaError = ref("");
    const submitting = ref(false);
    const error = ref("");
    const notice = ref("");
    const { data: options, pending: optionsPending, error: optionsError } = useFetch("/api/daycare/registration/options", {
      timeout: 15e3
    });
    const unidades = computed(() => options.value?.unidades || []);
    const salasForUnidad = computed(() => (options.value?.salas || []).filter((sala) => sala.unidad === form.unidad));
    const pageState = computed(() => {
      if (optionsError.value || error.value || captchaError.value) return "error";
      if (optionsPending.value || captchaPending.value || submitting.value) return "loading";
      if (notice.value) return "success";
      return "ready";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BrandMark = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<main${ssrRenderAttrs(mergeProps({
        class: "registration-page",
        style: unref(identityVars),
        "data-experience": "guarderia"
      }, _attrs))} data-v-90e2e063><section class="registration-hero" data-v-90e2e063>`);
      _push(ssrRenderComponent(_component_BrandMark, {
        to: "/login/guarderia",
        logo: unref(identity).assets.logo,
        alt: unref(identity).label
      }, null, _parent));
      _push(`<div data-v-90e2e063><p class="eyebrow" data-v-90e2e063>Registro de guardería</p><h1 data-v-90e2e063>Activa tu acceso familiar</h1><p data-v-90e2e063>Registra la cuenta que usará tu familia para consultar avisos, tareas y calendario de la sala.</p></div><div class="hero-note" data-v-90e2e063><strong data-v-90e2e063>Acceso seguro</strong><span data-v-90e2e063>Validamos sala, CAPTCHA y datos antes de crear la cuenta.</span></div></section><section class="registration-card card"${ssrRenderAttr("data-state", pageState.value)} data-v-90e2e063><header class="form-head" data-v-90e2e063><div data-v-90e2e063><p class="eyebrow" data-v-90e2e063>Datos familiares</p><h2 data-v-90e2e063>Registro</h2></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/login/guarderia"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Ya tengo cuenta`);
          } else {
            return [
              createTextVNode("Ya tengo cuenta")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header>`);
      if (unref(optionsError)) {
        _push(`<p class="alert" data-v-90e2e063>No fue posible cargar las salas disponibles.</p>`);
      } else if (unref(optionsPending)) {
        _push(`<div class="loading-box" data-v-90e2e063>Cargando salas...</div>`);
      } else {
        _push(`<form class="registration-form" data-v-90e2e063><label class="label" data-v-90e2e063> Nombre de madre, padre o tutor <input${ssrRenderAttr("value", form.parentName)} class="input" autocomplete="name" required maxlength="120" data-v-90e2e063></label><label class="label" data-v-90e2e063> Nombre del niño o niña <input${ssrRenderAttr("value", form.childName)} class="input" required maxlength="120" data-v-90e2e063></label><label class="label" data-v-90e2e063> Correo familiar <input${ssrRenderAttr("value", form.email)} class="input" type="email" autocomplete="email" required maxlength="160" data-v-90e2e063></label><label class="label" data-v-90e2e063> Contraseña <input${ssrRenderAttr("value", form.password)} class="input" type="password" autocomplete="new-password" required minlength="8" data-v-90e2e063><small data-v-90e2e063>Al menos 8 caracteres, con letras y números.</small></label><div class="grid grid-2" data-v-90e2e063><label class="label" data-v-90e2e063> Unidad <select class="select" required data-v-90e2e063><option value="" disabled data-v-90e2e063${ssrIncludeBooleanAttr(Array.isArray(form.unidad) ? ssrLooseContain(form.unidad, "") : ssrLooseEqual(form.unidad, "")) ? " selected" : ""}>Selecciona unidad</option><!--[-->`);
        ssrRenderList(unidades.value, (unidad) => {
          _push(`<option${ssrRenderAttr("value", unidad)} data-v-90e2e063${ssrIncludeBooleanAttr(Array.isArray(form.unidad) ? ssrLooseContain(form.unidad, unidad) : ssrLooseEqual(form.unidad, unidad)) ? " selected" : ""}>${ssrInterpolate(unidad)}</option>`);
        });
        _push(`<!--]--></select></label><label class="label" data-v-90e2e063> Sala <select class="select" required${ssrIncludeBooleanAttr(!form.unidad) ? " disabled" : ""} data-v-90e2e063><option value="" disabled data-v-90e2e063${ssrIncludeBooleanAttr(Array.isArray(form.sala) ? ssrLooseContain(form.sala, "") : ssrLooseEqual(form.sala, "")) ? " selected" : ""}>${ssrInterpolate(form.unidad ? "Selecciona sala" : "Elige unidad primero")}</option><!--[-->`);
        ssrRenderList(salasForUnidad.value, (sala) => {
          _push(`<option${ssrRenderAttr("value", String(sala.id))} data-v-90e2e063${ssrIncludeBooleanAttr(Array.isArray(form.sala) ? ssrLooseContain(form.sala, String(sala.id)) : ssrLooseEqual(form.sala, String(sala.id))) ? " selected" : ""}>${ssrInterpolate(sala.sala)}</option>`);
        });
        _push(`<!--]--></select></label></div><label class="label upload-field" data-v-90e2e063> Foto familiar opcional <input class="input" type="file" accept="image/png,image/jpeg,image/webp" data-v-90e2e063><small data-v-90e2e063>${ssrInterpolate(selectedFileName.value || "PNG, JPG o WEBP hasta 4 MB.")}</small></label><label class="screen-reader-only" data-v-90e2e063> Sitio web <input${ssrRenderAttr("value", form.website)} autocomplete="off" tabindex="-1" data-v-90e2e063></label><section class="captcha-panel"${ssrRenderAttr("data-state", captchaError.value ? "error" : captchaPending.value ? "loading" : "ready")} data-v-90e2e063><div data-v-90e2e063><span data-v-90e2e063>Verificación</span>`);
        if (captcha.value?.question) {
          _push(`<strong data-v-90e2e063>${ssrInterpolate(captcha.value.question)} =</strong>`);
        } else {
          _push(`<strong data-v-90e2e063>Cargando...</strong>`);
        }
        _push(`</div><input${ssrRenderAttr("value", form.captchaAnswer)} class="input" inputmode="numeric" required placeholder="Respuesta" data-v-90e2e063><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(captchaPending.value) ? " disabled" : ""} data-v-90e2e063>Cambiar</button></section>`);
        if (captchaError.value) {
          _push(`<p class="alert" data-v-90e2e063>${ssrInterpolate(captchaError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (error.value) {
          _push(`<p class="alert" data-v-90e2e063>${ssrInterpolate(error.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (notice.value) {
          _push(`<p class="notice" data-v-90e2e063>${ssrInterpolate(notice.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="btn btn-primary" type="submit"${ssrIncludeBooleanAttr(submitting.value || !captcha.value) ? " disabled" : ""} data-v-90e2e063>${ssrInterpolate(submitting.value ? "Creando acceso..." : "Crear acceso de guardería")}</button></form>`);
      }
      _push(`</section></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/registro-guarderia.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const registroGuarderia = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-90e2e063"]]);
export {
  registroGuarderia as default
};
//# sourceMappingURL=registro-guarderia-CcorGB2e.js.map
