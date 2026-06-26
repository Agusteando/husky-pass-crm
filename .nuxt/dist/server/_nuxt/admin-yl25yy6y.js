import { e as useRoute, a as __nuxt_component_0$1, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_1$1 } from "./PersonasIcon-B5CnsWTN.js";
import { _ as __nuxt_component_2 } from "./AccountMenu-Cc9CsO5z.js";
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, toDisplayString, useSSRContext, watch, unref, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderSlot } from "vue/server-renderer";
import { _ as _imports_0 } from "./_virtual_public-BTp6Nzoa.js";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { _ as __nuxt_component_1$2 } from "./EmptyState-BVTldcCZ.js";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import { u as useRequestFetch } from "./ssr-BC0VN6Ct.js";
import { u as useAppSession } from "./useAppSession-D-b8QDDW.js";
import { e as experienceThemeVars, v as visualIdentityForContext } from "./experienceIdentity-DUHnLdZH.js";
import { a as hasDaycareAdminScope } from "./sessionScopes-DtWD9iQ2.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "@lucide/vue";
import "./matricula-C6apTRg-.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./routeSession-DTQI2Jul.js";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AdminExperienceTopbar",
  __ssrInlineRender: true,
  props: {
    session: {},
    homeTo: {},
    items: {}
  },
  setup(__props) {
    const props = __props;
    const route = useRoute();
    const search = ref("");
    const title = computed(() => props.session?.user?.isSuperAdmin ? "Super Admin" : "Admin Guarderia");
    const subtitle = computed(() => props.session?.user?.isSuperAdmin ? "Operacion institucional" : props.session?.user?.unidades?.[0] || "Guarderia");
    function isActive(to) {
      const targetPath = to.split("?")[0] || to;
      if (targetPath === "/admin/superadmin") return route.path === "/admin/superadmin";
      if (targetPath === "/admin/daycare/salas") return route.path.startsWith("/admin/daycare");
      return route.path === targetPath || route.path.startsWith(`${targetPath}/`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_FamilyPersonasIcon = __nuxt_component_1$1;
      const _component_TopbarAccountMenu = __nuxt_component_2;
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: "admin-topbar",
        "data-experience": "admin"
      }, _attrs))} data-v-d1172177><div class="page-shell admin-topbar-inner" data-v-d1172177>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "admin-brand",
        to: __props.homeTo,
        "aria-label": "Husky Pass Administracion"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", _imports_0)} alt="Husky Pass" data-v-d1172177${_scopeId}><span data-v-d1172177${_scopeId}><strong data-v-d1172177${_scopeId}>${ssrInterpolate(title.value)}</strong><small data-v-d1172177${_scopeId}>${ssrInterpolate(subtitle.value)}</small></span>`);
          } else {
            return [
              createVNode("img", {
                src: _imports_0,
                alt: "Husky Pass"
              }),
              createVNode("span", null, [
                createVNode("strong", null, toDisplayString(title.value), 1),
                createVNode("small", null, toDisplayString(subtitle.value), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (__props.session?.user?.isSuperAdmin) {
        _push(`<form class="admin-search" role="search" data-v-d1172177>`);
        _push(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "person" }, null, _parent));
        _push(`<input${ssrRenderAttr("value", search.value)} type="search" placeholder="Buscar usuario, matricula o persona" aria-label="Buscar en administracion" data-v-d1172177></form>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<nav class="admin-nav" aria-label="Navegacion administrativa" data-v-d1172177><!--[-->`);
      ssrRenderList(__props.items, (item) => {
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
              _push2(`<span data-v-d1172177${_scopeId}>${ssrInterpolate(item.label)}</span>`);
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
      _push(ssrRenderComponent(_component_TopbarAccountMenu, {
        session: __props.session,
        experience: "admin"
      }, null, _parent));
      _push(`</div></header>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/topbar/AdminExperienceTopbar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-d1172177"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdminDaycareSidebar",
  __ssrInlineRender: true,
  props: {
    session: {}
  },
  setup(__props) {
    const props = __props;
    const route = useRoute();
    const requestFetch = useRequestFetch();
    const unidades = computed(() => props.session?.user?.unidades || []);
    const routeSalaId = computed(() => {
      const raw = route.params.id;
      return typeof raw === "string" && /^\d+$/.test(raw) ? raw : "";
    });
    const selectedUnidad = ref(typeof route.query.unidad === "string" ? route.query.unidad : unidades.value[0] || "");
    const selectedSala = ref(routeSalaId.value);
    const search = ref("");
    const actionError = ref("");
    const actionNotice = ref("");
    const previewing = ref(false);
    const canPreviewAsFamily = computed(() => Boolean(props.session?.user?.kind === "admin"));
    watch(unidades, (value) => {
      if (!selectedUnidad.value && value.length) selectedUnidad.value = value[0];
    }, { immediate: true });
    watch(() => route.query.unidad, (unidad) => {
      if (typeof unidad === "string" && unidad && unidad !== selectedUnidad.value) selectedUnidad.value = unidad;
    });
    watch(routeSalaId, async (id) => {
      selectedSala.value = id;
      if (!id) return;
      try {
        const sala = await requestFetch(`/api/daycare/admin/salas/${id}`);
        if (sala?.unidad && sala.unidad !== selectedUnidad.value) selectedUnidad.value = sala.unidad;
      } catch {
        selectedSala.value = "";
      }
    }, { immediate: true });
    const { data: salas } = useFetch("/api/daycare/admin/salas/overview", {
      query: computed(() => ({ unidad: selectedUnidad.value })),
      watch: [selectedUnidad],
      timeout: 15e3,
      dedupe: "cancel"
    });
    const filteredSalas = computed(() => {
      const rows = salas.value || [];
      const needle = search.value.trim().toLowerCase();
      if (!needle) return rows;
      return rows.filter((sala) => `${sala.sala} ${sala.unidad}`.toLowerCase().includes(needle));
    });
    watch(salas, (value) => {
      if (!value?.length) {
        if (!routeSalaId.value) selectedSala.value = "";
        return;
      }
      if (routeSalaId.value && value.some((sala) => String(sala.id) === routeSalaId.value)) {
        selectedSala.value = routeSalaId.value;
        return;
      }
      if (selectedSala.value && !value.some((sala) => String(sala.id) === selectedSala.value)) {
        selectedSala.value = "";
      }
    }, { immediate: true });
    function salaRoute(id, section) {
      const path = section ? `/admin/daycare/salas/${id}/${section}` : `/admin/daycare/salas/${id}`;
      return { path, query: selectedUnidad.value ? { unidad: selectedUnidad.value } : {} };
    }
    function roomInitials(value) {
      return String(value || "S").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_EmptyState = __nuxt_component_1$2;
      if (__props.session?.user?.kind === "admin") {
        _push(`<aside${ssrRenderAttrs(mergeProps({
          class: "workspace-rail",
          "aria-label": "Workspace de guardería",
          "data-product-panel": "daycare-sidebar",
          "data-state": "content"
        }, _attrs))} data-v-ba4de1a7><div class="rail-header" data-v-ba4de1a7><div data-v-ba4de1a7><p class="eyebrow" data-v-ba4de1a7>Workspace</p><strong data-v-ba4de1a7>Guardería</strong></div>`);
        if (__props.session.user.isSuperAdmin) {
          _push(`<span class="status-pill" data-v-ba4de1a7>Super admin</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><section class="rail-context" data-v-ba4de1a7><label class="label compact-label" data-v-ba4de1a7> Unidad <select class="select"${ssrIncludeBooleanAttr(!unidades.value.length) ? " disabled" : ""} data-diagnostic-filter="unidad" data-v-ba4de1a7>`);
        if (!unidades.value.length) {
          _push(`<option value="" data-v-ba4de1a7${ssrIncludeBooleanAttr(Array.isArray(selectedUnidad.value) ? ssrLooseContain(selectedUnidad.value, "") : ssrLooseEqual(selectedUnidad.value, "")) ? " selected" : ""}>Sin unidades</option>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unidades.value, (unidad) => {
          _push(`<option${ssrRenderAttr("value", unidad)} data-v-ba4de1a7${ssrIncludeBooleanAttr(Array.isArray(selectedUnidad.value) ? ssrLooseContain(selectedUnidad.value, unidad) : ssrLooseEqual(selectedUnidad.value, unidad)) ? " selected" : ""}>${ssrInterpolate(unidad)}</option>`);
        });
        _push(`<!--]--></select></label><label class="label compact-label" data-v-ba4de1a7> Sala <select class="select"${ssrIncludeBooleanAttr(!unref(salas)?.length) ? " disabled" : ""} data-diagnostic="sala-select" data-diagnostic-filter="sala" data-v-ba4de1a7><option value="" data-v-ba4de1a7${ssrIncludeBooleanAttr(Array.isArray(selectedSala.value) ? ssrLooseContain(selectedSala.value, "") : ssrLooseEqual(selectedSala.value, "")) ? " selected" : ""}>Selecciona sala</option><!--[-->`);
        ssrRenderList(unref(salas) || [], (sala) => {
          _push(`<option${ssrRenderAttr("value", String(sala.id))} data-v-ba4de1a7${ssrIncludeBooleanAttr(Array.isArray(selectedSala.value) ? ssrLooseContain(selectedSala.value, String(sala.id)) : ssrLooseEqual(selectedSala.value, String(sala.id))) ? " selected" : ""}>${ssrInterpolate(sala.sala)}</option>`);
        });
        _push(`<!--]--></select></label>`);
        if (canPreviewAsFamily.value) {
          _push(`<button class="btn btn-primary preview-btn" type="button" data-diagnostic-action="preview-sala"${ssrIncludeBooleanAttr(!selectedSala.value || previewing.value) ? " disabled" : ""}${ssrRenderAttr("data-unavailable-reason", !selectedSala.value ? "Selecciona una sala" : previewing.value ? "Abriendo vista familiar" : void 0)} data-v-ba4de1a7>${ssrInterpolate(previewing.value ? "Abriendo…" : "Vista familiar")}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (actionError.value) {
          _push(`<p class="rail-alert" data-v-ba4de1a7>${ssrInterpolate(actionError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (actionNotice.value) {
          _push(`<p class="rail-notice" data-v-ba4de1a7>${ssrInterpolate(actionNotice.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section><nav class="primary-nav" aria-label="Navegación daycare admin" data-v-ba4de1a7>`);
        if (__props.session.user.isSuperAdmin) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/admin/superadmin",
            "active-class": "active",
            "data-diagnostic-link": "superadmin"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Superadmin`);
              } else {
                return [
                  createTextVNode("Superadmin")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (__props.session.user.isSuperAdmin) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/admin/superadmin/marbetes",
            "active-class": "active",
            "data-diagnostic-link": "marbetes"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Marbetes`);
              } else {
                return [
                  createTextVNode("Marbetes")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/admin/daycare/salas", query: selectedUnidad.value ? { unidad: selectedUnidad.value } : {} },
          "active-class": "active",
          "data-diagnostic-link": "salas"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Salas`);
            } else {
              return [
                createTextVNode("Salas")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (selectedSala.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: salaRoute(selectedSala.value, "familias"),
            "active-class": "active",
            "data-diagnostic-link": "familias"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Familias`);
              } else {
                return [
                  createTextVNode("Familias")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (selectedSala.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: salaRoute(selectedSala.value, "tareas"),
            "active-class": "active",
            "data-diagnostic-link": "tareas"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Tareas`);
              } else {
                return [
                  createTextVNode("Tareas")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (selectedSala.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: salaRoute(selectedSala.value, "avisos"),
            "active-class": "active",
            "data-diagnostic-link": "avisos"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Avisos`);
              } else {
                return [
                  createTextVNode("Avisos")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (selectedSala.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: salaRoute(selectedSala.value, "calendario"),
            "active-class": "active",
            "data-diagnostic-link": "calendario"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Calendario`);
              } else {
                return [
                  createTextVNode("Calendario")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</nav><section class="rail-section" data-v-ba4de1a7><div class="rail-title" data-v-ba4de1a7><span data-v-ba4de1a7>Salas activas</span><small data-v-ba4de1a7>${ssrInterpolate(unref(salas)?.length || 0)}</small></div><input${ssrRenderAttr("value", search.value)} class="input compact-search" type="search" placeholder="Buscar sala" data-diagnostic-filter="buscar-sala" data-v-ba4de1a7>`);
        if (filteredSalas.value.length) {
          _push(`<div class="rail-salas" role="list" data-v-ba4de1a7><!--[-->`);
          ssrRenderList(filteredSalas.value, (sala) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: sala.id,
              to: salaRoute(sala.id),
              class: { active: String(sala.id) === selectedSala.value },
              "data-diagnostic-link": "sala-sidebar"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="room-dot" data-v-ba4de1a7${_scopeId}>${ssrInterpolate(roomInitials(sala.sala))}</span><span class="sala-copy" data-v-ba4de1a7${_scopeId}><strong data-v-ba4de1a7${_scopeId}>${ssrInterpolate(sala.sala)}</strong><small data-v-ba4de1a7${_scopeId}>${ssrInterpolate(sala.metrics.familias)} familias · ${ssrInterpolate(sala.metrics.totalRecursos)} publicaciones</small></span>`);
                } else {
                  return [
                    createVNode("span", { class: "room-dot" }, toDisplayString(roomInitials(sala.sala)), 1),
                    createVNode("span", { class: "sala-copy" }, [
                      createVNode("strong", null, toDisplayString(sala.sala), 1),
                      createVNode("small", null, toDisplayString(sala.metrics.familias) + " familias · " + toDisplayString(sala.metrics.totalRecursos) + " publicaciones", 1)
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div data-diagnostic="sala-unavailable" data-product-panel="sidebar-salas" data-state="empty" data-v-ba4de1a7>`);
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "Sin salas",
            description: "Cambia de unidad o ajusta la búsqueda."
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`</section></aside>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminDaycareSidebar.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-ba4de1a7"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { data: session } = useAppSession();
    const adminVars = experienceThemeVars(visualIdentityForContext({ experience: "admin", institution: null, nivel: null, plantel: null, grupo: null }));
    const homeTo = computed(() => {
      const user = session.value?.user;
      if (user?.isSuperAdmin) return "/admin/superadmin";
      if (hasDaycareAdminScope(user)) return "/admin/daycare/salas";
      if (canAccessHistory.value) return "/admin/historial-accesos";
      return "/admin/login";
    });
    const canAccessHistory = computed(() => {
      const user = session.value?.user;
      if (!user || user.kind !== "admin") return false;
      if (user.isSuperAdmin) return true;
      const routeText = user.routes.map((item) => item.route).join(" ");
      const roleText = user.roles.join(" ");
      return /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|marbete|validar|historial|acceso|husky/i.test(`${routeText} ${roleText}`);
    });
    const topbarItems = computed(() => {
      const firstUnidad = session.value?.user?.unidades?.[0] || "";
      const daycareTo = firstUnidad ? `/admin/daycare/salas?unidad=${encodeURIComponent(firstUnidad)}` : "/admin/daycare/salas";
      const items = [];
      if (hasDaycareAdminScope(session.value?.user)) {
        items.push({ key: "guarderia-admin", label: "Guarderia", to: daycareTo, icon: "daycare" });
      }
      if (session.value?.user?.isSuperAdmin) {
        items.unshift(
          { key: "superadmin", label: "Directorio", to: "/admin/superadmin", icon: "people" },
          { key: "personas-autorizadas", label: "Husky Pass", to: "/admin/superadmin/personas-autorizadas", icon: "marbete" },
          { key: "historial-accesos", label: "Historial", to: "/admin/historial-accesos", icon: "history" },
          { key: "marbetes", label: "Plantillas", to: "/admin/superadmin/marbetes", icon: "document" }
        );
      } else if (canAccessHistory.value) {
        items.unshift({ key: "historial-accesos", label: "Historial", to: "/admin/historial-accesos", icon: "history" });
      }
      return items;
    });
    const isDaycareWorkspace = computed(() => route.path.startsWith("/admin/daycare"));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_TopbarAdminExperienceTopbar = __nuxt_component_0;
      const _component_AdminDaycareSidebar = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "admin-experience-root",
        style: unref(adminVars),
        "data-experience": "admin"
      }, _attrs))} data-v-c5aad243>`);
      _push(ssrRenderComponent(_component_TopbarAdminExperienceTopbar, {
        session: unref(session),
        "home-to": homeTo.value,
        items: topbarItems.value
      }, null, _parent));
      _push(`<div class="${ssrRenderClass([isDaycareWorkspace.value ? "with-rail" : "full-width", "page-shell workspace-shell"])}" data-v-c5aad243>`);
      if (isDaycareWorkspace.value) {
        _push(ssrRenderComponent(_component_AdminDaycareSidebar, { session: unref(session) }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="${ssrRenderClass([{ "layout-main-wide": !isDaycareWorkspace.value }, "layout-main"])}" data-v-c5aad243>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const admin = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c5aad243"]]);
export {
  admin as default
};
//# sourceMappingURL=admin-yl25yy6y.js.map
