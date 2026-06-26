import { _ as __nuxt_component_1 } from "./PersonasIcon-B5CnsWTN.js";
import { e as useRoute, a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { d as displayMatriculaCandidate } from "./matricula-C6apTRg-.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AccountMenu",
  __ssrInlineRender: true,
  props: {
    session: {},
    experience: {},
    securityTo: {}
  },
  setup(__props) {
    const props = __props;
    useRoute();
    const open = ref(false);
    const profileName = computed(() => props.session?.user?.displayName || displayMatriculaCandidate(props.session?.user?.username) || props.session?.user?.email || "Usuario");
    const profileDetail = computed(() => {
      const user = props.session?.user;
      if (!user) return "";
      if (user.kind === "admin") return user.isSuperAdmin ? "Super Admin" : user.unidades[0] || "Administracion";
      if (props.experience === "guarderia") return [user.scopes.daycare?.unidad, user.scopes.daycare?.sala ? `Sala ${user.scopes.daycare.sala}` : null].filter(Boolean).join(" / ") || "Familia guarderia";
      return displayMatriculaCandidate(user.username) || user.email || "Familia escolar";
    });
    const initials = computed(() => {
      const source = profileName.value || "HP";
      return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasIcon = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0;
      if (__props.session?.user) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          class: "account-menu",
          "data-account-kind": __props.session.user.kind
        }, _attrs))} data-v-5c99cb4a><button class="account-trigger" type="button" data-diagnostic-action="abrir-menu-cuenta"${ssrRenderAttr("aria-expanded", open.value)} data-v-5c99cb4a>`);
        if (__props.session.user.picture) {
          _push(`<img${ssrRenderAttr("src", __props.session.user.picture)} alt="" data-v-5c99cb4a>`);
        } else {
          _push(`<span class="avatar" data-v-5c99cb4a>${ssrInterpolate(initials.value)}</span>`);
        }
        _push(`<span class="account-copy" data-v-5c99cb4a><strong data-v-5c99cb4a>${ssrInterpolate(profileName.value)}</strong><small data-v-5c99cb4a>${ssrInterpolate(profileDetail.value)}</small></span>`);
        _push(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "chevron" }, null, _parent));
        _push(`</button>`);
        if (open.value) {
          _push(`<div class="account-popover" role="menu" data-v-5c99cb4a><div class="account-summary" data-v-5c99cb4a><strong data-v-5c99cb4a>${ssrInterpolate(profileName.value)}</strong><span data-v-5c99cb4a>${ssrInterpolate(profileDetail.value)}</span></div>`);
          if (__props.securityTo) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              class: "menu-item",
              to: __props.securityTo,
              role: "menuitem",
              onClick: ($event) => open.value = false
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "security" }, null, _parent2, _scopeId));
                  _push2(`<span data-v-5c99cb4a${_scopeId}>Seguridad</span>`);
                } else {
                  return [
                    createVNode(_component_FamilyPersonasIcon, { name: "security" }),
                    createVNode("span", null, "Seguridad")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (__props.session.user.impersonation) {
            _push(`<button class="menu-item" type="button" role="menuitem" data-diagnostic-action="terminar-impersonacion" data-v-5c99cb4a>`);
            _push(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "arrow" }, null, _parent));
            _push(`<span data-v-5c99cb4a>Volver a admin</span></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="menu-item danger" type="button" role="menuitem" data-diagnostic-action="logout" data-v-5c99cb4a>`);
          _push(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "exit" }, null, _parent));
          _push(`<span data-v-5c99cb4a>Salir</span></button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/topbar/AccountMenu.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5c99cb4a"]]);
export {
  __nuxt_component_2 as _
};
//# sourceMappingURL=AccountMenu-Cc9CsO5z.js.map
