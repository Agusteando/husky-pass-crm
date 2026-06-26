import { e as useRoute, a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_1$1 } from "./PersonasIcon-B5CnsWTN.js";
import { _ as __nuxt_component_2 } from "./AccountMenu-Cc9CsO5z.js";
import { defineComponent, computed, mergeProps, withCtx, createVNode, toDisplayString, useSSRContext, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderSlot } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { d as displayMatriculaCandidate } from "./matricula-C6apTRg-.js";
import { h as hasFamilyScope, f as familyNavItems, d as defaultFamilyRoute } from "./sessionScopes-DtWD9iQ2.js";
import { u as useAppSession } from "./useAppSession-D-b8QDDW.js";
import { c as resolveVisualIdentity } from "./experienceIdentity-DUHnLdZH.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "@lucide/vue";
import "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./routeSession-DTQI2Jul.js";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "FamilyExperienceTopbar",
  __ssrInlineRender: true,
  props: {
    session: {},
    homeTo: {},
    identity: {}
  },
  setup(__props) {
    const props = __props;
    const route = useRoute();
    const isGuarderia = computed(() => props.identity.context.experience === "guarderia");
    const brandLogo = computed(() => props.identity.assets.wordmark || props.identity.assets.logo || "/brand/husky-pass-logo.png");
    const brandLabel = computed(() => isGuarderia.value ? "Husky Pass Guarderia" : props.identity.label || "Husky Pass");
    const brandTitle = computed(() => isGuarderia.value ? "Guarderia" : props.identity.shortLabel || "Escolar");
    const contextLine = computed(() => {
      const user = props.session?.user;
      if (!user) return props.identity.officialName;
      if (isGuarderia.value) return [user.scopes.daycare?.unidad, user.scopes.daycare?.sala ? `Sala ${user.scopes.daycare.sala}` : null].filter(Boolean).join(" / ") || "Familia guarderia";
      return [props.identity.levelLabel, props.identity.context.plantel].filter(Boolean).join(" / ") || props.identity.officialName;
    });
    const activeStudent = computed(() => {
      const user = props.session?.user;
      if (!user || user.kind !== "family") return null;
      if (isGuarderia.value) {
        return { label: "Sala", value: [user.scopes.daycare?.unidad, user.scopes.daycare?.sala].filter(Boolean).join(" / ") || "Guarderia" };
      }
      const matricula = displayMatriculaCandidate(user.username);
      return matricula ? { label: "Matricula", value: matricula } : null;
    });
    const securityTo = computed(() => `/familia/cuenta/seguridad?experiencia=${isGuarderia.value ? "guarderia" : "escolar"}`);
    const navItems = computed(() => {
      const user = props.session?.user;
      const items = [];
      if (isGuarderia.value && hasFamilyScope(user, "daycare")) {
        items.push(
          { key: "daycare-home", label: "Inicio", to: "/familia/daycare", icon: "home" },
          { key: "daycare-tareas", label: "Tareas", to: "/familia/daycare/tareas", icon: "edit" },
          { key: "daycare-avisos", label: "Avisos", to: "/familia/daycare/avisos", icon: "survey" },
          { key: "daycare-calendario", label: "Calendario", to: "/familia/daycare/calendario", icon: "calendar" }
        );
      }
      if (!isGuarderia.value && hasFamilyScope(user, "personasAutorizadas")) {
        items.push({ key: "personas-autorizadas", label: "Personas", to: "/familia/personas-autorizadas", icon: "people" });
      }
      items.push({ key: "seguridad", label: "Seguridad", to: securityTo.value, icon: "security" });
      return items;
    });
    function isActive(to) {
      const target = to.split("?")[0] || to;
      return route.path === target || target !== "/familia/daycare" && route.path.startsWith(`${target}/`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_FamilyPersonasIcon = __nuxt_component_1$1;
      const _component_TopbarAccountMenu = __nuxt_component_2;
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: "role-topbar family-topbar",
        "data-experience": __props.identity.context.experience
      }, _attrs))} data-v-9f84a589><div class="page-shell role-topbar-inner" data-v-9f84a589>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "brand-lockup",
        to: __props.homeTo,
        "aria-label": brandLabel.value
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img class="brand-logo"${ssrRenderAttr("src", brandLogo.value)}${ssrRenderAttr("alt", brandLabel.value)} data-v-9f84a589${_scopeId}><span class="brand-copy" data-v-9f84a589${_scopeId}><strong data-v-9f84a589${_scopeId}>${ssrInterpolate(brandTitle.value)}</strong><small data-v-9f84a589${_scopeId}>${ssrInterpolate(contextLine.value)}</small></span>`);
          } else {
            return [
              createVNode("img", {
                class: "brand-logo",
                src: brandLogo.value,
                alt: brandLabel.value
              }, null, 8, ["src", "alt"]),
              createVNode("span", { class: "brand-copy" }, [
                createVNode("strong", null, toDisplayString(brandTitle.value), 1),
                createVNode("small", null, toDisplayString(contextLine.value), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="${ssrRenderClass([{ "mobile-only-nav": isGuarderia.value }, "role-nav"])}" aria-label="Navegacion familiar" data-v-9f84a589><!--[-->`);
      ssrRenderList(navItems.value, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.to,
          to: item.to,
          class: { active: isActive(item.to) },
          "data-product-nav": item.key
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_FamilyPersonasIcon, {
                name: item.icon
              }, null, _parent2, _scopeId));
              _push2(`<span data-v-9f84a589${_scopeId}>${ssrInterpolate(item.label)}</span>`);
            } else {
              return [
                createVNode(_component_FamilyPersonasIcon, {
                  name: item.icon
                }, null, 8, ["name"]),
                createVNode("span", null, toDisplayString(item.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav>`);
      if (activeStudent.value) {
        _push(`<section class="student-chip" aria-label="Alumno activo" data-v-9f84a589><span data-v-9f84a589>${ssrInterpolate(activeStudent.value.label)}</span><strong data-v-9f84a589>${ssrInterpolate(activeStudent.value.value)}</strong></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_TopbarAccountMenu, {
        session: __props.session,
        experience: __props.identity.context.experience,
        "security-to": securityTo.value
      }, null, _parent));
      _push(`</div>`);
      if (__props.session?.user?.impersonation) {
        _push(`<div class="impersonation-strip" data-v-9f84a589><div class="page-shell" data-v-9f84a589><strong data-v-9f84a589>Vista administrativa activa</strong><span data-v-9f84a589>Estas operando como familia.</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/topbar/FamilyExperienceTopbar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-9f84a589"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "FamilySidebar",
  __ssrInlineRender: true,
  props: {
    session: {}
  },
  setup(__props) {
    const props = __props;
    const route = useRoute();
    const activeProduct = computed(() => {
      if (route.path.startsWith("/familia/personas-autorizadas")) return "personasAutorizadas";
      if (route.path.startsWith("/familia/asistencia")) return "attendance";
      if (route.path.startsWith("/familia/daycare")) return "daycare";
      if (hasFamilyScope(props.session?.user, "daycare") && !hasFamilyScope(props.session?.user, "personasAutorizadas")) return "daycare";
      if (hasFamilyScope(props.session?.user, "personasAutorizadas") && !hasFamilyScope(props.session?.user, "daycare")) return "personasAutorizadas";
      return "chooser";
    });
    const items = computed(() => familyNavItems(props.session?.user, activeProduct.value).map((item) => {
      if (item.icon !== "security") return item;
      const experience = activeProduct.value === "daycare" ? "guarderia" : "escolar";
      return { ...item, to: `${item.to}?experiencia=${experience}` };
    }));
    const contextLabel = computed(() => {
      if (activeProduct.value === "daycare") return "Guardería";
      if (activeProduct.value === "personasAutorizadas") return "Personas Autorizadas";
      if (activeProduct.value === "attendance") return "Asistencia";
      return "Familia";
    });
    const primaryName = computed(() => props.session?.user?.displayName || displayMatriculaCandidate(props.session?.user?.username) || props.session?.user?.email || "Husky Pass");
    const secondaryName = computed(() => {
      const user = props.session?.user;
      if (!user) return "";
      if (activeProduct.value === "daycare") return [user.scopes.daycare?.unidad, user.scopes.daycare?.sala ? `Sala ${user.scopes.daycare.sala}` : null].filter(Boolean).join(" · ");
      return user.email || "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_FamilyPersonasIcon = __nuxt_component_1$1;
      if (__props.session?.user) {
        _push(`<aside${ssrRenderAttrs(mergeProps({
          class: "family-panel",
          "aria-label": "Husky Pass familiar"
        }, _attrs))} data-v-c1a4d3ba><section class="family-context" data-v-c1a4d3ba><span data-v-c1a4d3ba>${ssrInterpolate(contextLabel.value)}</span><strong data-v-c1a4d3ba>${ssrInterpolate(primaryName.value)}</strong><small data-v-c1a4d3ba>${ssrInterpolate(secondaryName.value)}</small></section><nav class="family-nav" aria-label="Navegación familiar" data-v-c1a4d3ba><!--[-->`);
        ssrRenderList(items.value, (item) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: item.to,
            to: item.to
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, {
                  name: item.icon
                }, null, _parent2, _scopeId));
                _push2(`<span data-v-c1a4d3ba${_scopeId}>${ssrInterpolate(item.label)}</span>`);
              } else {
                return [
                  createVNode(_component_FamilyPersonasIcon, {
                    name: item.icon
                  }, null, 8, ["name"]),
                  createVNode("span", null, toDisplayString(item.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></nav>`);
        if (__props.session.user.impersonation) {
          _push(`<button class="btn btn-primary exit-preview" type="button" data-v-c1a4d3ba>Volver a admin</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</aside>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/FamilySidebar.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-c1a4d3ba"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "family",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { data: session } = useAppSession();
    const homeTo = computed(() => defaultFamilyRoute(session.value?.user));
    const requestedExperience = computed(() => typeof route.query.experiencia === "string" ? route.query.experiencia : void 0);
    const resolvedIdentity = computed(() => resolveVisualIdentity({ routePath: route.path, requestedExperience: requestedExperience.value, user: session.value?.user }));
    const identity = computed(() => resolvedIdentity.value.identity);
    const identityVars = computed(() => resolvedIdentity.value.vars);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TopbarFamilyExperienceTopbar = __nuxt_component_0;
      const _component_FamilySidebar = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "family-experience-root",
        style: identityVars.value,
        "data-experience": identity.value.context.experience
      }, _attrs))} data-v-e445b75c>`);
      _push(ssrRenderComponent(_component_TopbarFamilyExperienceTopbar, {
        session: unref(session),
        "home-to": homeTo.value,
        identity: identity.value
      }, null, _parent));
      _push(`<div class="page-shell workspace-shell" data-v-e445b75c>`);
      _push(ssrRenderComponent(_component_FamilySidebar, { session: unref(session) }, null, _parent));
      _push(`<main class="layout-main" data-v-e445b75c>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/family.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const family = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e445b75c"]]);
export {
  family as default
};
//# sourceMappingURL=family-urJypaLy.js.map
