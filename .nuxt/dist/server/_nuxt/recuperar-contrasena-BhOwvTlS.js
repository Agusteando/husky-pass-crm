import { _ as __nuxt_component_0 } from "./LoginPanel-DubcRLKI.js";
import { e as useRoute, a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, openBlock, createBlock, withModifiers, createVNode, withDirectives, vModelText, toDisplayString, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { n as normalizeExperienceName, d as defaultLoginRouteForExperience } from "./experienceIdentity-DUHnLdZH.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "./matricula-C6apTRg-.js";
import "./sessionScopes-DtWD9iQ2.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "recuperar-contrasena",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const email = ref("");
    const loading = ref(false);
    const sent = ref(false);
    const error = ref("");
    const message = ref("Si existe una cuenta familiar con ese correo, enviaremos un enlace para restablecer la contraseña.");
    const experience = computed(() => normalizeExperienceName(String(route.query.experiencia || "")) === "guarderia" ? "guarderia" : "escolar");
    const loginTo = computed(() => defaultLoginRouteForExperience(experience.value));
    const eyebrow = computed(() => experience.value === "guarderia" ? "Experiencia Guardería" : "Experiencia Escolar");
    async function submit() {
      loading.value = true;
      error.value = "";
      try {
        const response = await $fetch("/api/auth/password/forgot", {
          method: "POST",
          body: { email: email.value, experience: experience.value }
        });
        message.value = response.message || message.value;
        sent.value = true;
      } catch (err) {
        const failure = err;
        error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || "Intenta de nuevo más tarde.";
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
        title: "Restablecer contraseña",
        description: "Recibe un enlace seguro en el correo de tu cuenta familiar.",
        experience: experience.value
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!sent.value) {
              _push2(`<form class="stack" data-v-e8109090${_scopeId}><div data-v-e8109090${_scopeId}><h2 data-v-e8109090${_scopeId}>Olvidaste tu contraseña</h2></div><label class="label" for="recovery-email" data-v-e8109090${_scopeId}> Correo <input id="recovery-email"${ssrRenderAttr("value", email.value)} class="input" type="email" autocomplete="email" required${ssrRenderAttr("aria-invalid", Boolean(error.value))} aria-describedby="recovery-message" data-v-e8109090${_scopeId}></label>`);
              if (error.value) {
                _push2(`<p id="recovery-message" class="alert" data-v-e8109090${_scopeId}>${ssrInterpolate(error.value)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button class="btn btn-primary" type="submit"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} data-v-e8109090${_scopeId}>${ssrInterpolate(loading.value ? "Enviando..." : "Enviar enlace")}</button>`);
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
              _push2(`</form>`);
            } else {
              _push2(`<section class="stack" aria-live="polite" data-v-e8109090${_scopeId}><div data-v-e8109090${_scopeId}><h2 data-v-e8109090${_scopeId}>Revisa tu correo</h2><p class="quiet" data-v-e8109090${_scopeId}>${ssrInterpolate(message.value)}</p></div>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                class: "btn btn-primary",
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
            }
          } else {
            return [
              !sent.value ? (openBlock(), createBlock("form", {
                key: 0,
                class: "stack",
                onSubmit: withModifiers(submit, ["prevent"])
              }, [
                createVNode("div", null, [
                  createVNode("h2", null, "Olvidaste tu contraseña")
                ]),
                createVNode("label", {
                  class: "label",
                  for: "recovery-email"
                }, [
                  createTextVNode(" Correo "),
                  withDirectives(createVNode("input", {
                    id: "recovery-email",
                    "onUpdate:modelValue": ($event) => email.value = $event,
                    class: "input",
                    type: "email",
                    autocomplete: "email",
                    required: "",
                    "aria-invalid": Boolean(error.value),
                    "aria-describedby": "recovery-message"
                  }, null, 8, ["onUpdate:modelValue", "aria-invalid"]), [
                    [vModelText, email.value]
                  ])
                ]),
                error.value ? (openBlock(), createBlock("p", {
                  key: 0,
                  id: "recovery-message",
                  class: "alert"
                }, toDisplayString(error.value), 1)) : createCommentVNode("", true),
                createVNode("button", {
                  class: "btn btn-primary",
                  type: "submit",
                  disabled: loading.value
                }, toDisplayString(loading.value ? "Enviando..." : "Enviar enlace"), 9, ["disabled"]),
                createVNode(_component_NuxtLink, {
                  class: "btn btn-secondary",
                  to: loginTo.value
                }, {
                  default: withCtx(() => [
                    createTextVNode("Volver a iniciar sesión")
                  ]),
                  _: 1
                }, 8, ["to"])
              ], 32)) : (openBlock(), createBlock("section", {
                key: 1,
                class: "stack",
                "aria-live": "polite"
              }, [
                createVNode("div", null, [
                  createVNode("h2", null, "Revisa tu correo"),
                  createVNode("p", { class: "quiet" }, toDisplayString(message.value), 1)
                ]),
                createVNode(_component_NuxtLink, {
                  class: "btn btn-primary",
                  to: loginTo.value
                }, {
                  default: withCtx(() => [
                    createTextVNode("Volver a iniciar sesión")
                  ]),
                  _: 1
                }, 8, ["to"])
              ]))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/recuperar-contrasena.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const recuperarContrasena = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e8109090"]]);
export {
  recuperarContrasena as default
};
//# sourceMappingURL=recuperar-contrasena-BhOwvTlS.js.map
