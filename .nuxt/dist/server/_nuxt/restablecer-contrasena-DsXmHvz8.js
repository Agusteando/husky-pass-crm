import { _ as __nuxt_component_0 } from "./LoginPanel-DubcRLKI.js";
import { e as useRoute, a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { defineComponent, reactive, ref, withAsyncContext, computed, mergeProps, withCtx, unref, createTextVNode, openBlock, createBlock, createVNode, toDisplayString, withModifiers, withDirectives, vModelText, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { n as normalizeExperienceName, d as defaultLoginRouteForExperience, r as recoveryRouteForExperience } from "./experienceIdentity-DUHnLdZH.js";
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
  __name: "restablecer-contrasena",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const token = String(route.query.token || "");
    const form = reactive({ password: "", confirmation: "" });
    const loading = ref(false);
    const success = ref(false);
    const error = ref("");
    const successLoginPath = ref("");
    const { data: tokenState, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/auth/password/reset", {
      key: `password-reset-token-${token.slice(0, 8)}`,
      query: { token }
    })), __temp = await __temp, __restore(), __temp);
    const pageExperience = computed(() => {
      const fromToken = normalizeExperienceName(tokenState.value?.experience || "");
      if (fromToken === "guarderia") return "guarderia";
      if (fromToken === "escolar") return "escolar";
      return normalizeExperienceName(String(route.query.experiencia || "")) === "guarderia" ? "guarderia" : "escolar";
    });
    const loginTo = computed(() => tokenState.value?.loginPath || defaultLoginRouteForExperience(pageExperience.value));
    const recoveryTo = computed(() => tokenState.value?.recoveryPath || recoveryRouteForExperience(pageExperience.value));
    const eyebrow = computed(() => pageExperience.value === "guarderia" ? "Experiencia Guardería" : "Experiencia Escolar");
    async function submit() {
      loading.value = true;
      error.value = "";
      try {
        const response = await $fetch("/api/auth/password/reset", {
          method: "POST",
          body: { token, password: form.password, confirmation: form.confirmation }
        });
        successLoginPath.value = response.loginPath || loginTo.value;
        success.value = true;
      } catch (err) {
        const failure = err;
        error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || "No fue posible actualizar la contraseña.";
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LoginPanel = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(ssrRenderComponent(_component_LoginPanel, mergeProps({
        "brand-to": loginTo.value,
        eyebrow: eyebrow.value,
        title: "Nueva contraseña",
        description: "Crea una contraseña para volver a entrar a Husky Pass.",
        experience: pageExperience.value
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="stack" data-v-3ed619ab${_scopeId}><div class="loading-row" data-v-3ed619ab${_scopeId}>Validando enlace...</div></div>`);
            } else if (success.value) {
              _push2(`<section class="stack" aria-live="polite" data-v-3ed619ab${_scopeId}><div data-v-3ed619ab${_scopeId}><h2 data-v-3ed619ab${_scopeId}>Contraseña actualizada</h2><p class="quiet" data-v-3ed619ab${_scopeId}>Ya puedes iniciar sesión con tu nueva contraseña.</p></div>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                class: "btn btn-primary",
                to: successLoginPath.value || loginTo.value
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Iniciar sesión`);
                  } else {
                    return [
                      createTextVNode("Iniciar sesión")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</section>`);
            } else if (!unref(tokenState)?.valid) {
              _push2(`<section class="stack" aria-live="polite" data-v-3ed619ab${_scopeId}><div data-v-3ed619ab${_scopeId}><h2 data-v-3ed619ab${_scopeId}>Enlace no disponible</h2><p class="quiet" data-v-3ed619ab${_scopeId}>${ssrInterpolate(unref(tokenState)?.message || "Solicita un enlace nuevo.")}</p></div>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                class: "btn btn-primary",
                to: recoveryTo.value
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Solicitar enlace`);
                  } else {
                    return [
                      createTextVNode("Solicitar enlace")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                class: "btn btn-secondary",
                to: loginTo.value
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Volver a iniciar sesión`);
                  } else {
                    return [
                      createTextVNode("Volver a iniciar sesión")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</section>`);
            } else {
              _push2(`<form class="stack" data-v-3ed619ab${_scopeId}><div data-v-3ed619ab${_scopeId}><h2 data-v-3ed619ab${_scopeId}>Elige una nueva contraseña</h2></div><label class="label" for="new-password" data-v-3ed619ab${_scopeId}> Nueva contraseña <input id="new-password"${ssrRenderAttr("value", form.password)} class="input" type="password" autocomplete="new-password" required minlength="8"${ssrRenderAttr("aria-invalid", Boolean(error.value))} data-v-3ed619ab${_scopeId}></label><label class="label" for="new-password-confirmation" data-v-3ed619ab${_scopeId}> Confirmar contraseña <input id="new-password-confirmation"${ssrRenderAttr("value", form.confirmation)} class="input" type="password" autocomplete="new-password" required minlength="8"${ssrRenderAttr("aria-invalid", Boolean(error.value))} aria-describedby="reset-message" data-v-3ed619ab${_scopeId}></label>`);
              if (error.value) {
                _push2(`<p id="reset-message" class="alert" data-v-3ed619ab${_scopeId}>${ssrInterpolate(error.value)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button class="btn btn-primary" type="submit"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-3ed619ab${_scopeId}>${ssrInterpolate(loading.value ? "Guardando..." : "Actualizar contraseña")}</button>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                class: "btn btn-secondary",
                to: loginTo.value
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Cancelar`);
                  } else {
                    return [
                      createTextVNode("Cancelar")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</form>`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "stack"
              }, [
                createVNode("div", { class: "loading-row" }, "Validando enlace...")
              ])) : success.value ? (openBlock(), createBlock("section", {
                key: 1,
                class: "stack",
                "aria-live": "polite"
              }, [
                createVNode("div", null, [
                  createVNode("h2", null, "Contraseña actualizada"),
                  createVNode("p", { class: "quiet" }, "Ya puedes iniciar sesión con tu nueva contraseña.")
                ]),
                createVNode(_component_NuxtLink, {
                  class: "btn btn-primary",
                  to: successLoginPath.value || loginTo.value
                }, {
                  default: withCtx(() => [
                    createTextVNode("Iniciar sesión")
                  ]),
                  _: 1
                }, 8, ["to"])
              ])) : !unref(tokenState)?.valid ? (openBlock(), createBlock("section", {
                key: 2,
                class: "stack",
                "aria-live": "polite"
              }, [
                createVNode("div", null, [
                  createVNode("h2", null, "Enlace no disponible"),
                  createVNode("p", { class: "quiet" }, toDisplayString(unref(tokenState)?.message || "Solicita un enlace nuevo."), 1)
                ]),
                createVNode(_component_NuxtLink, {
                  class: "btn btn-primary",
                  to: recoveryTo.value
                }, {
                  default: withCtx(() => [
                    createTextVNode("Solicitar enlace")
                  ]),
                  _: 1
                }, 8, ["to"]),
                createVNode(_component_NuxtLink, {
                  class: "btn btn-secondary",
                  to: loginTo.value
                }, {
                  default: withCtx(() => [
                    createTextVNode("Volver a iniciar sesión")
                  ]),
                  _: 1
                }, 8, ["to"])
              ])) : (openBlock(), createBlock("form", {
                key: 3,
                class: "stack",
                onSubmit: withModifiers(submit, ["prevent"])
              }, [
                createVNode("div", null, [
                  createVNode("h2", null, "Elige una nueva contraseña")
                ]),
                createVNode("label", {
                  class: "label",
                  for: "new-password"
                }, [
                  createTextVNode(" Nueva contraseña "),
                  withDirectives(createVNode("input", {
                    id: "new-password",
                    "onUpdate:modelValue": ($event) => form.password = $event,
                    class: "input",
                    type: "password",
                    autocomplete: "new-password",
                    required: "",
                    minlength: "8",
                    "aria-invalid": Boolean(error.value)
                  }, null, 8, ["onUpdate:modelValue", "aria-invalid"]), [
                    [vModelText, form.password]
                  ])
                ]),
                createVNode("label", {
                  class: "label",
                  for: "new-password-confirmation"
                }, [
                  createTextVNode(" Confirmar contraseña "),
                  withDirectives(createVNode("input", {
                    id: "new-password-confirmation",
                    "onUpdate:modelValue": ($event) => form.confirmation = $event,
                    class: "input",
                    type: "password",
                    autocomplete: "new-password",
                    required: "",
                    minlength: "8",
                    "aria-invalid": Boolean(error.value),
                    "aria-describedby": "reset-message"
                  }, null, 8, ["onUpdate:modelValue", "aria-invalid"]), [
                    [vModelText, form.confirmation]
                  ])
                ]),
                error.value ? (openBlock(), createBlock("p", {
                  key: 0,
                  id: "reset-message",
                  class: "alert"
                }, toDisplayString(error.value), 1)) : createCommentVNode("", true),
                createVNode("button", {
                  class: "btn btn-primary",
                  type: "submit",
                  disabled: loading.value
                }, toDisplayString(loading.value ? "Guardando..." : "Actualizar contraseña"), 9, ["disabled"]),
                createVNode(_component_NuxtLink, {
                  class: "btn btn-secondary",
                  to: loginTo.value
                }, {
                  default: withCtx(() => [
                    createTextVNode("Cancelar")
                  ]),
                  _: 1
                }, 8, ["to"])
              ], 32))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/restablecer-contrasena.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const restablecerContrasena = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3ed619ab"]]);
export {
  restablecerContrasena as default
};
//# sourceMappingURL=restablecer-contrasena-DsXmHvz8.js.map
