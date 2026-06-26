import { b as _export_sfc, e as useRoute, a as __nuxt_component_0$1 } from "../server.mjs";
import { _ as __nuxt_component_2 } from "./PersonasProcessedPhoto-BWatNFQu.js";
import { _ as __nuxt_component_2$1 } from "./AccountMenu-Cc9CsO5z.js";
import { _ as __nuxt_component_1$1 } from "./PersonasIcon-B5CnsWTN.js";
import { defineComponent, computed, mergeProps, useSSRContext, provide, unref, withCtx, createVNode, toDisplayString, createTextVNode, useSlots, inject } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderSlot, ssrInterpolate, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import { _ as _imports_0 } from "./_virtual_public-BTp6Nzoa.js";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { r as resolvePersonasTheme, p as personasMascot, a as personasLevelName, b as personasInstitutionName, c as personasInstitutionLogo } from "./personasTheme-CJ7aLgiL.js";
import { u as usePersonasFamilyTheme, p as personasFamilyThemeContextKey } from "./usePersonasTheme-CmVh5mbY.js";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "PersonasAmbassador",
  __ssrInlineRender: true,
  props: {
    theme: {},
    variant: { default: "hero" },
    alt: { default: "" },
    title: { default: "" },
    text: { default: "" },
    compact: { type: Boolean, default: false },
    contained: { type: Boolean, default: false },
    decorative: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const neutralTheme = resolvePersonasTheme({});
    const resolvedTheme = computed(() => props.theme || neutralTheme);
    const imageSrc = computed(() => personasMascot(resolvedTheme.value, props.variant));
    const levelName = computed(() => personasLevelName(resolvedTheme.value));
    const computedAlt = computed(() => props.alt || `${levelName.value.spanish} Personas Autorizadas`);
    return (_ctx, _push, _parent, _attrs) => {
      if (imageSrc.value || __props.title || __props.text || _ctx.$slots.default || !__props.decorative) {
        _push(`<figure${ssrRenderAttrs(mergeProps({
          class: "pa-ambassador-card",
          "data-variant": __props.variant,
          "data-compact": __props.compact ? "true" : "false",
          "data-contained": __props.contained ? "true" : "false",
          "aria-label": __props.decorative ? void 0 : computedAlt.value
        }, _attrs))} data-v-ab3f71f9>`);
        if (imageSrc.value) {
          _push(`<span class="pa-ambassador-visual" data-v-ab3f71f9><img${ssrRenderAttr("src", imageSrc.value)}${ssrRenderAttr("alt", __props.decorative ? "" : computedAlt.value)} loading="lazy" decoding="async" data-v-ab3f71f9></span>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.title || __props.text || _ctx.$slots.default) {
          _push(`<figcaption data-v-ab3f71f9>`);
          ssrRenderSlot(_ctx.$slots, "default", {}, () => {
            if (__props.title) {
              _push(`<strong data-v-ab3f71f9>${ssrInterpolate(__props.title)}</strong>`);
            } else {
              _push(`<!---->`);
            }
            if (__props.text) {
              _push(`<span data-v-ab3f71f9>${ssrInterpolate(__props.text)}</span>`);
            } else {
              _push(`<!---->`);
            }
          }, _push, _parent);
          _push(`</figcaption>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</figure>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/PersonasAmbassador.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-ab3f71f9"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "PersonasAutorizadasShell",
  __ssrInlineRender: true,
  props: {
    title: { default: "Personas Autorizadas" }
  },
  setup(__props) {
    const route = useRoute();
    const { session, primaryChild, studentName, studentPhoto, theme, themeVars } = usePersonasFamilyTheme({});
    provide(personasFamilyThemeContextKey, { theme });
    const studentInitials = computed(() => (studentName.value || "A").split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(""));
    const institution = computed(() => personasInstitutionName(theme.value));
    const institutionLogo = computed(() => personasInstitutionLogo(theme.value));
    const contextLine = computed(() => [displayMatricula(primaryChild.value?.matricula), primaryChild.value?.nivelEdu, primaryChild.value?.grado, primaryChild.value?.grupo].filter(Boolean).join(" · ") || "Cuenta familiar");
    const navItems = [
      { key: "personas", label: "Personas autorizadas", shortLabel: "Personas", icon: "people", to: "/familia/personas-autorizadas" },
      { key: "actualizar", label: "Datos del alumno", shortLabel: "Datos", icon: "edit", to: "/familia/personas-autorizadas/actualizar-datos" },
      { key: "credencializacion", label: "Foto del alumno", shortLabel: "Foto", icon: "camera", to: "/familia/personas-autorizadas/credencializacion" },
      { key: "hermanos", label: "Hermanos", shortLabel: "Hermanos", icon: "siblings", to: "/familia/personas-autorizadas/hermanos" },
      { key: "asistencia", label: "Asistencia", shortLabel: "Asistencia", icon: "calendar", to: "/familia/asistencia" },
      { key: "encuestas", label: "Encuestas", shortLabel: "Encuestas", icon: "survey", to: "/familia/personas-autorizadas/encuestas" },
      { key: "convenios", label: "Convenios", shortLabel: "Convenios", icon: "handshake", to: "/familia/personas-autorizadas/convenios" },
      { key: "seguridad", label: "Seguridad", shortLabel: "Seguridad", icon: "security", to: "/familia/cuenta/seguridad?experiencia=escolar" }
    ];
    function isActive(item) {
      const target = item.to.split("?")[0] || item.to;
      return route.path === target || target !== "/familia/personas-autorizadas" && route.path.startsWith(`${target}/`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_FamilyPersonasProcessedPhoto = __nuxt_component_2;
      const _component_TopbarAccountMenu = __nuxt_component_2$1;
      const _component_FamilyPersonasIcon = __nuxt_component_1$1;
      const _component_FamilyPersonasAmbassador = __nuxt_component_3;
      _push(`<main${ssrRenderAttrs(mergeProps({
        class: "pa-shell-app",
        style: unref(themeVars),
        "data-product-area": "personas-autorizadas"
      }, _attrs))} data-v-8ed14c5e><header class="pa-product-topbar" data-v-8ed14c5e><div class="pa-topbar-brand-zone" data-v-8ed14c5e>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "pa-brand",
        to: "/familia/personas-autorizadas",
        "aria-label": `${institution.value} Husky Pass Personas Autorizadas`
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="pa-product-lockup" data-v-8ed14c5e${_scopeId}><img class="pa-institution-logo"${ssrRenderAttr("src", institutionLogo.value)}${ssrRenderAttr("alt", institution.value)} data-v-8ed14c5e${_scopeId}><span class="pa-lockup-divider" aria-hidden="true" data-v-8ed14c5e${_scopeId}></span><img class="pa-husky-pass-logo"${ssrRenderAttr("src", _imports_0)} alt="Husky Pass" data-v-8ed14c5e${_scopeId}></span>`);
          } else {
            return [
              createVNode("span", { class: "pa-product-lockup" }, [
                createVNode("img", {
                  class: "pa-institution-logo",
                  src: institutionLogo.value,
                  alt: institution.value
                }, null, 8, ["src", "alt"]),
                createVNode("span", {
                  class: "pa-lockup-divider",
                  "aria-hidden": "true"
                }),
                createVNode("img", {
                  class: "pa-husky-pass-logo",
                  src: _imports_0,
                  alt: "Husky Pass"
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(primaryChild)) {
        _push(`<section class="pa-student-context" data-product-panel="active-student" aria-label="Contexto del alumno" data-v-8ed14c5e><span class="pa-student-avatar" data-v-8ed14c5e>`);
        if (unref(studentPhoto)) {
          _push(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
            src: unref(studentPhoto),
            namespace: "pa-active-student"
          }, null, _parent));
        } else {
          _push(`<b data-v-8ed14c5e>${ssrInterpolate(studentInitials.value)}</b>`);
        }
        _push(`</span><span class="pa-student-copy" data-v-8ed14c5e><small data-v-8ed14c5e>Estás consultando a</small><strong data-v-8ed14c5e>${ssrInterpolate(unref(studentName) || "Alumno")}</strong><span data-v-8ed14c5e>${ssrInterpolate(contextLine.value)}</span></span></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_TopbarAccountMenu, {
        session: unref(session),
        experience: "escolar",
        "security-to": "/familia/cuenta/seguridad?experiencia=escolar"
      }, null, _parent));
      _push(`</header><div class="pa-product-layout" data-v-8ed14c5e><aside class="pa-product-nav" aria-label="Navegación Personas Autorizadas" data-v-8ed14c5e><nav data-v-8ed14c5e><!--[-->`);
      ssrRenderList(navItems, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.to,
          to: item.to,
          class: ["pa-nav-link", { active: isActive(item) }],
          "data-product-nav": item.key
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="pa-nav-icon" data-v-8ed14c5e${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasIcon, {
                name: item.icon
              }, null, _parent2, _scopeId));
              _push2(`</span><span class="pa-nav-label" data-v-8ed14c5e${_scopeId}>${ssrInterpolate(item.label)}</span>`);
            } else {
              return [
                createVNode("span", { class: "pa-nav-icon" }, [
                  createVNode(_component_FamilyPersonasIcon, {
                    name: item.icon
                  }, null, 8, ["name"])
                ]),
                createVNode("span", { class: "pa-nav-label" }, toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><section class="pa-help-card" aria-label="Centro de ayuda" data-v-8ed14c5e><div class="pa-help-ambassador" aria-hidden="true" data-v-8ed14c5e>`);
      _push(ssrRenderComponent(_component_FamilyPersonasAmbassador, {
        theme: unref(theme),
        variant: "help",
        compact: "",
        contained: "",
        decorative: ""
      }, null, _parent));
      _push(`</div><div class="pa-help-copy" data-v-8ed14c5e><strong data-v-8ed14c5e>¿Necesitas ayuda?</strong><span data-v-8ed14c5e>Consulta la guía o contacta a tu colegio.</span></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/familia/personas-autorizadas#ayuda" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Centro de ayuda`);
          } else {
            return [
              createTextVNode("Centro de ayuda")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section></aside><section class="pa-route-content" data-v-8ed14c5e><nav class="pa-mobile-nav" aria-label="Secciones Personas Autorizadas" data-v-8ed14c5e><!--[-->`);
      ssrRenderList(navItems, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: `mobile-${item.to}`,
          to: item.to,
          class: { active: isActive(item) },
          "data-product-mobile-nav": item.key
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_FamilyPersonasIcon, {
                name: item.icon
              }, null, _parent2, _scopeId));
              _push2(`<span data-v-8ed14c5e${_scopeId}>${ssrInterpolate(item.shortLabel || item.label)}</span>`);
            } else {
              return [
                createVNode(_component_FamilyPersonasIcon, {
                  name: item.icon
                }, null, 8, ["name"]),
                createVNode("span", null, toDisplayString(item.shortLabel || item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</section></div></main>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/PersonasAutorizadasShell.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-8ed14c5e"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PersonasPageHeader",
  __ssrInlineRender: true,
  props: {
    eyebrow: { default: "" },
    title: {},
    description: { default: "" },
    meta: { default: "" },
    theme: { default: null },
    ambassadorVariant: { default: "header" },
    showAmbassador: { type: Boolean, default: true }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const familyThemeContext = inject(personasFamilyThemeContextKey, null);
    const resolvedTheme = computed(() => props.theme || familyThemeContext?.theme.value || resolvePersonasTheme({}));
    const hasActions = computed(() => Boolean(slots.actions));
    const hasMetaSlot = computed(() => Boolean(slots.meta));
    const showVisual = computed(() => props.showAmbassador || Boolean(slots.visual));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAmbassador = __nuxt_component_3;
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: "pa-page-header",
        "data-product-component": "personas-page-header"
      }, _attrs))} data-v-4c5600a3><div class="pa-page-header-copy" data-v-4c5600a3>`);
      if (__props.eyebrow) {
        _push(`<p class="pa-page-header-eyebrow" data-v-4c5600a3>${ssrInterpolate(__props.eyebrow)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<h1 data-v-4c5600a3>${ssrInterpolate(__props.title)}</h1>`);
      if (__props.description) {
        _push(`<p class="pa-page-header-description" data-v-4c5600a3>${ssrInterpolate(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.meta || hasMetaSlot.value) {
        _push(`<div class="pa-page-header-meta" data-v-4c5600a3>`);
        ssrRenderSlot(_ctx.$slots, "meta", {}, () => {
          _push(`${ssrInterpolate(__props.meta)}`);
        }, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (showVisual.value) {
        _push(`<div class="pa-page-header-ambassador" data-v-4c5600a3>`);
        ssrRenderSlot(_ctx.$slots, "visual", {}, () => {
          _push(ssrRenderComponent(_component_FamilyPersonasAmbassador, {
            theme: resolvedTheme.value,
            variant: __props.ambassadorVariant,
            compact: "",
            contained: "",
            decorative: ""
          }, null, _parent));
        }, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (hasActions.value) {
        _push(`<div class="pa-page-header-actions" data-v-4c5600a3>`);
        ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/PersonasPageHeader.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4c5600a3"]]);
export {
  __nuxt_component_0 as _,
  __nuxt_component_1 as a,
  __nuxt_component_3 as b
};
//# sourceMappingURL=PersonasPageHeader-CbpYMeMe.js.map
