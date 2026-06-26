import { e as useRoute, i as useRouter, a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const scopeOptions = [
      { value: "all", label: "Todos", description: "Directorio completo" },
      { value: "daycare", label: "Guardería", description: "Familias de guardería" },
      { value: "schoolFamilies", label: "Personas Autorizadas", description: "Familias escolares" },
      { value: "internal", label: "Internos", description: "Roles administrativos" },
      { value: "impersonable", label: "Soporte", description: "Cuentas familiares" }
    ];
    const selectedPlantel = ref(typeof route.query.plantel === "string" ? route.query.plantel : "");
    const selectedScope = ref(normalizeScope(route.query.scope));
    const selectedUser = ref(null);
    const clientReady = ref(false);
    const search = ref(typeof route.query.buscar === "string" ? route.query.buscar : "");
    const limit = ref(normalizeLimit(route.query.limite));
    const actionError = ref("");
    const actionNotice = ref("");
    const impersonatingId = ref(null);
    const confirmingImpersonationId = ref(null);
    const query = computed(() => ({
      plantel: selectedPlantel.value,
      search: search.value,
      scope: selectedScope.value,
      limit: limit.value
    }));
    const activeScopeLabel = computed(() => scopeOptions.find((option) => option.value === selectedScope.value)?.label || "Todos");
    const { data: directory, pending, error: loadError, refresh } = useFetch("/api/admin/superadmin/users", {
      query,
      watch: [query],
      timeout: 15e3,
      dedupe: "cancel"
    });
    const directoryTimedOut = ref(false);
    let directoryTimer = null;
    const isLoadingVisible = computed(() => pending.value && !directoryTimedOut.value);
    const loadProblem = computed(() => Boolean(directoryTimedOut.value || loadError.value));
    const loadProblemMessage = computed(() => {
      if (directoryTimedOut.value) return "La consulta excedió el tiempo de espera. Reintenta para abrir una conexión nueva a base de datos.";
      const error = loadError.value;
      return error?.data?.statusMessage || error?.statusMessage || error?.message || "La consulta falló antes de entregar un estado de contenido o vacío.";
    });
    watch(pending, (value) => {
      if (directoryTimer) {
        clearTimeout(directoryTimer);
        directoryTimer = null;
      }
      if (!value) return;
      directoryTimedOut.value = false;
      directoryTimer = setTimeout(() => {
        if (pending.value) directoryTimedOut.value = true;
      }, 15e3);
    }, { immediate: true });
    watch(loadError, (value) => {
      if (value) directoryTimedOut.value = false;
    });
    watch([selectedPlantel, selectedScope, search, limit], () => {
      confirmingImpersonationId.value = null;
      syncQuery();
    });
    watch(() => route.query.plantel, (value) => {
      const next = typeof value === "string" ? value : "";
      if (next !== selectedPlantel.value) selectedPlantel.value = next;
    });
    watch(() => route.query.buscar, (value) => {
      const next = typeof value === "string" ? value : "";
      if (next !== search.value) search.value = next;
    });
    watch(() => route.query.scope, (value) => {
      const next = normalizeScope(value);
      if (next !== selectedScope.value) selectedScope.value = next;
    });
    watch(() => route.query.limite, (value) => {
      const next = normalizeLimit(value);
      if (next !== limit.value) limit.value = next;
    });
    watch(() => route.query.usuario, (value) => {
      const id = Number(value || 0);
      if (!id) return;
      const user = directory.value?.users.find((item) => item.id === id);
      if (user) selectedUser.value = user;
    });
    watch(directory, (value) => {
      if (!value?.users?.length) {
        selectedUser.value = null;
        return;
      }
      const routeUser = Number(route.query.usuario || 0);
      const selectedFromRoute = value.users.find((user) => user.id === routeUser);
      if (selectedFromRoute) {
        selectedUser.value = selectedFromRoute;
        return;
      }
      if (!selectedUser.value || !value.users.some((user) => user.id === selectedUser.value?.id)) {
        selectedUser.value = value.users[0] || null;
        syncQuery(selectedUser.value?.id);
      }
    }, { immediate: true });
    function syncQuery(selectedId = selectedUser.value?.id || null) {
      if (selectedPlantel.value) selectedPlantel.value;
      if (selectedScope.value !== "all") selectedScope.value;
      if (search.value.trim()) search.value.trim();
      if (limit.value !== 120) String(limit.value);
    }
    function displayName(user) {
      return user.displayName || user.nombre_nino || loginLabel(user.username) || user.email || `Usuario ${user.id}`;
    }
    function loginLabel(value) {
      const raw = String(value || "").trim();
      if (!raw) return "";
      if (raw.includes("@")) return raw;
      return /\d/.test(raw) ? displayMatricula(raw) : raw;
    }
    function initials(user) {
      return displayName(user).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "HP";
    }
    function labelList(values, fallback) {
      const unique = Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
      return unique.length ? unique.join(" · ") : fallback;
    }
    function productScopeLabel(scope) {
      if (scope === "daycare") return "Familia guardería";
      if (scope === "personasAutorizadas") return "Personas Autorizadas";
      return scope;
    }
    function audienceLabel(user) {
      if (user.audience === "multiProductFamily") return "Familia multiproducto";
      if (user.audience === "daycareFamily") return "Familia guardería";
      if (user.audience === "schoolFamily") return "Personas Autorizadas";
      if (user.audience === "internal") return "Interno";
      return "Sin clasificar";
    }
    function impersonationButtonLabel(user) {
      if (!user.canImpersonate) return "No disponible";
      if (impersonatingId.value === user.id) return "Abriendo…";
      if (confirmingImpersonationId.value === user.id) return "Confirmar impersonación";
      return "Impersonar familia";
    }
    function normalizeScope(value) {
      return value === "daycare" || value === "schoolFamilies" || value === "internal" || value === "impersonable" ? value : "all";
    }
    function normalizeLimit(value) {
      const parsed = Number(value || 120);
      return parsed === 50 || parsed === 250 ? parsed : 120;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_EmptyState = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "superadmin-page stack",
        "data-product-area": "superadmin",
        "data-product-screen": "directory"
      }, _attrs))} data-v-744bd0e5><header class="admin-command" data-v-744bd0e5><div class="admin-command-copy" data-v-744bd0e5><p class="eyebrow" data-v-744bd0e5>Superadmin</p><h1 data-v-744bd0e5>Gestión de usuarios y productos</h1><p data-v-744bd0e5>Encuentra cuentas, revisa alcances y abre soporte familiar desde un directorio operativo.</p><div class="head-actions" data-v-744bd0e5>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-primary",
        to: "/admin/superadmin/personas-autorizadas"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Husky Pass`);
          } else {
            return [
              createTextVNode("Husky Pass")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/admin/historial-accesos"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Historial`);
          } else {
            return [
              createTextVNode("Historial")
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
      _push(`<button class="btn btn-secondary" type="button" data-diagnostic-action="actualizar-directorio"${ssrIncludeBooleanAttr(isLoadingVisible.value) ? " disabled" : ""}${ssrRenderAttr("data-unavailable-reason", isLoadingVisible.value ? "Actualizando directorio" : void 0)} data-v-744bd0e5>${ssrInterpolate(isLoadingVisible.value ? "Actualizando..." : "Actualizar")}</button></div></div>`);
      if (unref(directory) && !loadProblem.value) {
        _push(`<section class="command-metrics" aria-label="Resumen del directorio" data-v-744bd0e5><article class="metric-feature" data-v-744bd0e5><span data-v-744bd0e5>Total visible</span><strong data-v-744bd0e5>${ssrInterpolate(unref(directory).metrics.total)}</strong><small data-v-744bd0e5>${ssrInterpolate(activeScopeLabel.value)}</small></article><article data-v-744bd0e5><span data-v-744bd0e5>Familias</span><strong data-v-744bd0e5>${ssrInterpolate(unref(directory).metrics.familyUsers)}</strong></article><article data-v-744bd0e5><span data-v-744bd0e5>Guardería</span><strong data-v-744bd0e5>${ssrInterpolate(unref(directory).metrics.daycareFamilies)}</strong></article><article data-v-744bd0e5><span data-v-744bd0e5>Husky Pass</span><strong data-v-744bd0e5>${ssrInterpolate(unref(directory).metrics.schoolFamilies)}</strong></article><article data-v-744bd0e5><span data-v-744bd0e5>Soporte</span><strong data-v-744bd0e5>${ssrInterpolate(unref(directory).metrics.impersonable)}</strong></article></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header><section class="directory-control card" data-v-744bd0e5><div class="scope-tabs" aria-label="Alcance de usuarios" data-v-744bd0e5><!--[-->`);
      ssrRenderList(scopeOptions, (option) => {
        _push(`<button class="${ssrRenderClass([{ active: selectedScope.value === option.value }, "scope-tab"])}" type="button" data-diagnostic-action="filtrar-scope"${ssrRenderAttr("aria-pressed", selectedScope.value === option.value)} data-v-744bd0e5><strong data-v-744bd0e5>${ssrInterpolate(option.label)}</strong><span data-v-744bd0e5>${ssrInterpolate(option.description)}</span></button>`);
      });
      _push(`<!--]--></div><div class="filters-card" data-v-744bd0e5><label class="label" data-v-744bd0e5> Plantel <select class="select" data-diagnostic-filter="plantel" data-v-744bd0e5><option value="" data-v-744bd0e5${ssrIncludeBooleanAttr(Array.isArray(selectedPlantel.value) ? ssrLooseContain(selectedPlantel.value, "") : ssrLooseEqual(selectedPlantel.value, "")) ? " selected" : ""}>Todos</option><!--[-->`);
      ssrRenderList(unref(directory)?.planteles || [], (plantel) => {
        _push(`<option${ssrRenderAttr("value", plantel)} data-v-744bd0e5${ssrIncludeBooleanAttr(Array.isArray(selectedPlantel.value) ? ssrLooseContain(selectedPlantel.value, plantel) : ssrLooseEqual(selectedPlantel.value, plantel)) ? " selected" : ""}>${ssrInterpolate(plantel)}</option>`);
      });
      _push(`<!--]--></select></label><label class="label search-label" data-v-744bd0e5> Buscar usuario <input${ssrRenderAttr("value", search.value)} class="input" type="search" placeholder="Nombre, correo, matrícula, rol, sala o campus" data-diagnostic-filter="buscar-usuario" data-v-744bd0e5></label><label class="label" data-v-744bd0e5> Límite <select class="select" data-diagnostic-filter="limite" data-v-744bd0e5><option${ssrRenderAttr("value", 50)} data-v-744bd0e5${ssrIncludeBooleanAttr(Array.isArray(limit.value) ? ssrLooseContain(limit.value, 50) : ssrLooseEqual(limit.value, 50)) ? " selected" : ""}>50</option><option${ssrRenderAttr("value", 120)} data-v-744bd0e5${ssrIncludeBooleanAttr(Array.isArray(limit.value) ? ssrLooseContain(limit.value, 120) : ssrLooseEqual(limit.value, 120)) ? " selected" : ""}>120</option><option${ssrRenderAttr("value", 250)} data-v-744bd0e5${ssrIncludeBooleanAttr(Array.isArray(limit.value) ? ssrLooseContain(limit.value, 250) : ssrLooseEqual(limit.value, 250)) ? " selected" : ""}>250</option></select></label></div></section>`);
      if (actionError.value) {
        _push(`<p class="alert" data-v-744bd0e5>${ssrInterpolate(actionError.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (actionNotice.value) {
        _push(`<p class="notice" data-v-744bd0e5>${ssrInterpolate(actionNotice.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (loadProblem.value) {
        _push(`<section class="card state-card" data-product-panel="superadmin-directory" data-state="error" data-v-744bd0e5><p class="eyebrow" data-v-744bd0e5>Directorio no disponible</p><h2 data-v-744bd0e5>No fue posible cargar usuarios.</h2><p data-v-744bd0e5>${ssrInterpolate(loadProblemMessage.value)}</p><button class="btn btn-secondary compact" type="button" data-diagnostic-action="reintentar-directorio" data-v-744bd0e5>Reintentar</button></section>`);
      } else if (isLoadingVisible.value) {
        _push(`<div class="card loading-card" data-product-loading data-v-744bd0e5>Cargando usuarios…</div>`);
      } else if (unref(directory)?.users?.length) {
        _push(`<section class="directory-grid" data-product-panel="superadmin-directory" data-state="content" data-v-744bd0e5><article class="card users-card" data-v-744bd0e5><div class="section-head" data-v-744bd0e5><div data-v-744bd0e5><p class="eyebrow" data-v-744bd0e5>Directorio</p><h2 data-v-744bd0e5>${ssrInterpolate(unref(directory).users.length)} usuarios</h2></div><span class="muted" data-v-744bd0e5>${ssrInterpolate(activeScopeLabel.value)}</span></div><div class="table-wrap responsive-card-wrap" data-v-744bd0e5><table class="table responsive-table users-table" data-v-744bd0e5><thead data-v-744bd0e5><tr data-v-744bd0e5><th data-v-744bd0e5>Usuario</th><th data-v-744bd0e5>Tipo</th><th data-v-744bd0e5>Plantel</th><th data-v-744bd0e5>Alcances</th><th data-v-744bd0e5>Acciones</th></tr></thead><tbody data-v-744bd0e5><!--[-->`);
        ssrRenderList(unref(directory).users, (user) => {
          _push(`<tr class="${ssrRenderClass({ selected: clientReady.value && selectedUser.value?.id === user.id })}" data-v-744bd0e5><td data-label="Usuario" data-v-744bd0e5><div class="user-cell" data-v-744bd0e5><span class="user-avatar" data-v-744bd0e5>${ssrInterpolate(initials(user))}</span><span data-v-744bd0e5><strong data-v-744bd0e5>${ssrInterpolate(displayName(user))}</strong><small data-v-744bd0e5>${ssrInterpolate(user.email || loginLabel(user.username) || `ID ${user.id}`)}</small>`);
          if (user.nombre_nino) {
            _push(`<em data-v-744bd0e5>${ssrInterpolate(user.nombre_nino)}</em>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span></div></td><td data-label="Tipo" data-v-744bd0e5><span class="type-pill" data-v-744bd0e5>${ssrInterpolate(audienceLabel(user))}</span></td><td data-label="Plantel" data-v-744bd0e5><div class="scope-stack" data-v-744bd0e5><span data-v-744bd0e5>${ssrInterpolate(labelList([...user.plantel, ...user.unidad], "—"))}</span>`);
          if (user.sala) {
            _push(`<small data-v-744bd0e5>Sala ${ssrInterpolate(user.sala)}</small>`);
          } else {
            _push(`<!---->`);
          }
          if (user.campus) {
            _push(`<small data-v-744bd0e5>${ssrInterpolate(user.campus)}</small>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td><td data-label="Alcances" data-v-744bd0e5><div class="pills" data-v-744bd0e5><!--[-->`);
          ssrRenderList(user.productScopes, (scope) => {
            _push(`<span class="scope-pill" data-v-744bd0e5>${ssrInterpolate(productScopeLabel(scope))}</span>`);
          });
          _push(`<!--]-->`);
          if (user.adminScopes.includes("daycare")) {
            _push(`<span class="scope-pill muted-pill" data-v-744bd0e5>Guardería interna</span>`);
          } else {
            _push(`<!---->`);
          }
          if (!user.productScopes.length && !user.adminScopes.length) {
            _push(`<span class="muted" data-v-744bd0e5>Sin alcance detectado</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td><td data-label="Acciones" data-v-744bd0e5><div class="row-actions" data-v-744bd0e5><button class="btn btn-secondary compact" type="button" data-diagnostic-action="detalle-usuario" data-v-744bd0e5>Detalle</button>`);
          if (user.productScopes.includes("daycare") && user.sala) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              class: "btn btn-secondary compact",
              to: `/admin/daycare/salas/${user.sala}/familias`,
              "data-diagnostic-link": "ver-sala-usuario"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Ver sala `);
                } else {
                  return [
                    createTextVNode(" Ver sala ")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="btn btn-primary compact" type="button" data-diagnostic-action="impersonar-usuario"${ssrIncludeBooleanAttr(!user.canImpersonate || impersonatingId.value === user.id) ? " disabled" : ""}${ssrRenderAttr("data-unavailable-reason", !user.canImpersonate ? "Usuario sin producto familiar impersonable" : impersonatingId.value === user.id ? "Abriendo impersonación" : void 0)} data-v-744bd0e5>${ssrInterpolate(impersonationButtonLabel(user))}</button>`);
          if (confirmingImpersonationId.value === user.id) {
            _push(`<button class="btn btn-secondary compact" type="button" data-diagnostic-action="cancelar-impersonacion" data-v-744bd0e5> Cancelar </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></article><aside class="card detail-card" data-v-744bd0e5>`);
        if (clientReady.value && selectedUser.value) {
          _push(`<!--[--><p class="eyebrow" data-v-744bd0e5>Detalle de usuario</p><h2 data-v-744bd0e5>${ssrInterpolate(displayName(selectedUser.value))}</h2><dl data-v-744bd0e5><div data-v-744bd0e5><dt data-v-744bd0e5>ID</dt><dd data-v-744bd0e5>${ssrInterpolate(selectedUser.value.id)}</dd></div><div data-v-744bd0e5><dt data-v-744bd0e5>Correo</dt><dd data-v-744bd0e5>${ssrInterpolate(selectedUser.value.email || "—")}</dd></div><div data-v-744bd0e5><dt data-v-744bd0e5>Usuario</dt><dd data-v-744bd0e5>${ssrInterpolate(loginLabel(selectedUser.value.username) || "—")}</dd></div><div data-v-744bd0e5><dt data-v-744bd0e5>Rol legado</dt><dd data-v-744bd0e5>${ssrInterpolate(selectedUser.value.role || "—")}</dd></div><div data-v-744bd0e5><dt data-v-744bd0e5>Producto</dt><dd data-v-744bd0e5>${ssrInterpolate(selectedUser.value.productScopes.map(productScopeLabel).join(" · ") || "Interno / sin producto familiar")}</dd></div><div data-v-744bd0e5><dt data-v-744bd0e5>Plantel</dt><dd data-v-744bd0e5>${ssrInterpolate(labelList([...selectedUser.value.plantel, ...selectedUser.value.unidad], "—"))}</dd></div><div data-v-744bd0e5><dt data-v-744bd0e5>Rutas heredadas</dt><dd data-v-744bd0e5>${ssrInterpolate(selectedUser.value.routes.length ? selectedUser.value.routes.join(" · ") : "—")}</dd></div></dl><!--]-->`);
        } else {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "Selecciona un usuario",
            description: "Verás su rol, producto, plantel y rutas heredadas sin salir del directorio."
          }, null, _parent));
        }
        _push(`</aside></section>`);
      } else {
        _push(`<div data-product-panel="superadmin-directory" data-state="empty" data-v-744bd0e5>`);
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Sin usuarios",
          description: "Ajusta el producto, plantel o búsqueda para encontrar usuarios con datos reales."
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/superadmin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-744bd0e5"]]);
export {
  index as default
};
//# sourceMappingURL=index-CtXtyg7h.js.map
