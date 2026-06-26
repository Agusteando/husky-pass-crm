import { _ as __nuxt_component_1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, computed, ref, watch, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass, ssrRenderComponent } from "vue/server-renderer";
import { u as useAppSession } from "./useAppSession-D-b8QDDW.js";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { e as useRoute, i as useRouter, b as _export_sfc } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "./routeSession-DTQI2Jul.js";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdminSalasCommandCenter",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const { data: session, pending: sessionPending } = useAppSession();
    const unidades = computed(() => session.value?.user?.unidades || []);
    const noUnidadAvailable = computed(() => !sessionPending.value && unidades.value.length === 0);
    const selectedUnidad = ref(typeof route.query.unidad === "string" ? route.query.unidad : unidades.value[0] || "");
    const search = ref(typeof route.query.buscar === "string" ? route.query.buscar : "");
    const selectedSalaId = ref(normalizeSalaQuery(route.query.sala));
    const actionError = ref("");
    const actionNotice = ref("");
    const canPreviewAsFamily = computed(() => Boolean(session.value?.user?.kind === "admin"));
    watch(unidades, (value) => {
      if (!selectedUnidad.value && value.length) selectedUnidad.value = value[0];
    }, { immediate: true });
    watch(() => route.query.unidad, (value) => {
      if (typeof value === "string" && value && value !== selectedUnidad.value) selectedUnidad.value = value;
    });
    watch(() => route.query.buscar, (value) => {
      const next = typeof value === "string" ? value : "";
      if (next !== search.value) search.value = next;
    });
    watch(() => route.query.sala, (value) => {
      const next = normalizeSalaQuery(value);
      if (next !== selectedSalaId.value) selectedSalaId.value = next;
    });
    watch(search, () => syncQuery());
    const { data: salas, pending, error } = useFetch("/api/daycare/admin/salas/overview", {
      query: computed(() => ({ unidad: selectedUnidad.value })),
      watch: [selectedUnidad],
      timeout: 15e3,
      dedupe: "cancel"
    });
    const filteredSalas = computed(() => {
      const needle = search.value.trim().toLowerCase();
      const rows = salas.value || [];
      if (!needle) return rows;
      return rows.filter((sala) => `${sala.sala} ${sala.unidad}`.toLowerCase().includes(needle));
    });
    const selectedSala = computed(() => filteredSalas.value.find((sala) => sala.id === selectedSalaId.value) || filteredSalas.value[0] || null);
    watch(filteredSalas, (rows) => {
      if (!rows.length) {
        selectedSalaId.value = null;
        syncQuery();
        return;
      }
      const routeSala = normalizeSalaQuery(route.query.sala);
      if (routeSala && rows.some((sala) => sala.id === routeSala)) {
        selectedSalaId.value = routeSala;
        return;
      }
      if (!selectedSalaId.value || !rows.some((sala) => sala.id === selectedSalaId.value)) {
        selectedSalaId.value = rows[0].id;
        syncQuery();
      }
    }, { immediate: true });
    const totals = computed(() => filteredSalas.value.reduce((acc, sala) => {
      acc.familias += sala.metrics.familias;
      acc.totalRecursos += sala.metrics.totalRecursos;
      return acc;
    }, { familias: 0, totalRecursos: 0 }));
    function syncQuery() {
      if (selectedUnidad.value) selectedUnidad.value;
      if (selectedSalaId.value) String(selectedSalaId.value);
      if (search.value.trim()) search.value.trim();
    }
    function normalizeSalaQuery(value) {
      const source = Array.isArray(value) ? value[0] : value;
      const id = Number(source || 0);
      return Number.isInteger(id) && id > 0 ? id : null;
    }
    function roomInitials(value) {
      return String(value || "S").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_EmptyState = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "salas-command stack",
        "data-product-area": "daycare",
        "data-product-screen": "salas"
      }, _attrs))} data-v-f79d4df0><header class="command-hero" data-v-f79d4df0><div data-v-f79d4df0><p class="eyebrow" data-v-f79d4df0>Guardería admin</p><h1 data-v-f79d4df0>Salas</h1><p data-v-f79d4df0>Selecciona unidad y sala. Desde aquí se decide qué contenido familiar queda visible.</p></div><div class="hero-controls" data-v-f79d4df0><label class="label" data-v-f79d4df0> Unidad <select class="select" data-diagnostic-filter="unidad" data-v-f79d4df0><!--[-->`);
      ssrRenderList(unidades.value, (unidad) => {
        _push(`<option${ssrRenderAttr("value", unidad)} data-v-f79d4df0${ssrIncludeBooleanAttr(Array.isArray(selectedUnidad.value) ? ssrLooseContain(selectedUnidad.value, unidad) : ssrLooseEqual(selectedUnidad.value, unidad)) ? " selected" : ""}>${ssrInterpolate(unidad)}</option>`);
      });
      _push(`<!--]--></select></label><label class="label" data-v-f79d4df0> Buscar sala <input${ssrRenderAttr("value", search.value)} class="input" type="search" placeholder="Nombre de sala" data-diagnostic-filter="buscar-sala" data-v-f79d4df0></label></div></header>`);
      if (noUnidadAvailable.value) {
        _push(`<section class="card state-card" data-product-panel="daycare-unidades" data-state="unavailable" data-v-f79d4df0><p class="eyebrow" data-v-f79d4df0>Guardería no disponible</p><h2 data-v-f79d4df0>La sesión no tiene unidades de guardería para consultar.</h2><p data-v-f79d4df0>Verifica que el usuario tenga alcance interno de guardería o que existan unidades en la tabla de salas.</p></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="summary-strip" aria-label="Resumen de unidad" data-v-f79d4df0><article data-v-f79d4df0><span data-v-f79d4df0>Unidad</span><strong data-v-f79d4df0>${ssrInterpolate(selectedUnidad.value || "Sin unidad")}</strong></article><article data-v-f79d4df0><span data-v-f79d4df0>Salas</span><strong data-v-f79d4df0>${ssrInterpolate(filteredSalas.value.length)}</strong></article><article data-v-f79d4df0><span data-v-f79d4df0>Familias</span><strong data-v-f79d4df0>${ssrInterpolate(totals.value.familias)}</strong></article><article data-v-f79d4df0><span data-v-f79d4df0>Contenido</span><strong data-v-f79d4df0>${ssrInterpolate(totals.value.totalRecursos)}</strong></article></section>`);
      if (unref(error)) {
        _push(`<p class="alert" data-v-f79d4df0>No fue posible cargar las salas de esta unidad.</p>`);
      } else {
        _push(`<!---->`);
      }
      if (actionError.value) {
        _push(`<p class="alert" data-v-f79d4df0>${ssrInterpolate(actionError.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (actionNotice.value) {
        _push(`<p class="notice" data-v-f79d4df0>${ssrInterpolate(actionNotice.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending)) {
        _push(`<div class="card loading-card" data-product-loading data-v-f79d4df0> Cargando salas…</div>`);
      } else if (!noUnidadAvailable.value) {
        _push(`<section class="command-layout" data-v-f79d4df0><aside class="card sala-picker-card" data-product-panel="salas-list"${ssrRenderAttr("data-state", filteredSalas.value.length ? "content" : "empty")} data-v-f79d4df0><div class="list-head" data-v-f79d4df0><div data-v-f79d4df0><p class="eyebrow" data-v-f79d4df0>Directorio</p><h2 data-v-f79d4df0>${ssrInterpolate(filteredSalas.value.length)} salas</h2></div></div>`);
        if (filteredSalas.value.length) {
          _push(`<div class="sala-picker-list" role="list" data-v-f79d4df0><!--[-->`);
          ssrRenderList(filteredSalas.value, (sala) => {
            _push(`<button class="${ssrRenderClass([{ active: sala.id === selectedSalaId.value }, "sala-pick"])}" type="button" data-diagnostic-sala-option${ssrRenderAttr("data-sala-id", String(sala.id))}${ssrRenderAttr("aria-pressed", sala.id === selectedSalaId.value)} data-v-f79d4df0><span class="room-avatar" data-v-f79d4df0>${ssrInterpolate(roomInitials(sala.sala))}</span><span class="pick-copy" data-v-f79d4df0><strong data-v-f79d4df0>${ssrInterpolate(sala.sala)}</strong><small data-v-f79d4df0>${ssrInterpolate(sala.metrics.familias)} familias · ${ssrInterpolate(sala.metrics.totalRecursos)} publicaciones</small></span></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div data-diagnostic="sala-unavailable" data-v-f79d4df0>`);
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "Sin salas",
            description: "No hay salas que coincidan con esta búsqueda o unidad."
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`</aside>`);
        if (selectedSala.value) {
          _push(`<article class="card sala-focus-card" data-diagnostic="sala-context" data-product-panel="sala-context" data-state="content" data-v-f79d4df0><div class="focus-header" data-v-f79d4df0><div class="focus-title" data-v-f79d4df0><span class="room-avatar large" data-v-f79d4df0>${ssrInterpolate(roomInitials(selectedSala.value.sala))}</span><div data-v-f79d4df0><p class="eyebrow" data-v-f79d4df0>${ssrInterpolate(selectedSala.value.unidad)}</p><h2 data-v-f79d4df0>${ssrInterpolate(selectedSala.value.sala)}</h2><p data-v-f79d4df0>Workspace operativo para gestionar familias, tareas, avisos y calendario.</p></div></div><div class="focus-actions" data-v-f79d4df0><button class="btn btn-primary" type="button" data-diagnostic-action="nueva-tarea" data-v-f79d4df0>+ Nueva tarea</button><button class="btn btn-secondary" type="button" data-diagnostic-action="abrir-resumen" data-v-f79d4df0>Abrir resumen</button><button class="btn btn-secondary" type="button" data-diagnostic-action="gestionar-tareas" data-v-f79d4df0>Gestionar tareas</button>`);
          if (canPreviewAsFamily.value) {
            _push(`<button class="btn btn-secondary" type="button" data-diagnostic-action="preview-sala" data-v-f79d4df0>Vista familiar</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="metric-grid" data-v-f79d4df0><article data-v-f79d4df0><span data-v-f79d4df0>Familias</span><strong data-v-f79d4df0>${ssrInterpolate(selectedSala.value.metrics.familias)}</strong></article><article data-v-f79d4df0><span data-v-f79d4df0>Tareas</span><strong data-v-f79d4df0>${ssrInterpolate(selectedSala.value.metrics.tareas)}</strong></article><article data-v-f79d4df0><span data-v-f79d4df0>Avisos</span><strong data-v-f79d4df0>${ssrInterpolate(selectedSala.value.metrics.avisos)}</strong></article><article data-v-f79d4df0><span data-v-f79d4df0>Eventos</span><strong data-v-f79d4df0>${ssrInterpolate(selectedSala.value.metrics.calendario)}</strong></article></div><div class="module-launcher" data-v-f79d4df0><button type="button" data-diagnostic-action="abrir-familias" data-v-f79d4df0><strong data-v-f79d4df0>Familias</strong><span data-v-f79d4df0>Ver cuentas y soporte.</span></button><button type="button" data-diagnostic-action="abrir-tareas" data-v-f79d4df0><strong data-v-f79d4df0>Tareas</strong><span data-v-f79d4df0>Publicar o editar tareas.</span></button><button type="button" data-diagnostic-action="abrir-avisos" data-v-f79d4df0><strong data-v-f79d4df0>Avisos</strong><span data-v-f79d4df0>Comunicados familiares.</span></button><button type="button" data-diagnostic-action="abrir-calendario" data-v-f79d4df0><strong data-v-f79d4df0>Calendario</strong><span data-v-f79d4df0>Eventos próximos.</span></button></div></article>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminSalasCommandCenter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-f79d4df0"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminSalasCommandCenter = __nuxt_component_0;
      _push(ssrRenderComponent(_component_AdminSalasCommandCenter, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/daycare/salas/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-TFTD1EUp.js.map
