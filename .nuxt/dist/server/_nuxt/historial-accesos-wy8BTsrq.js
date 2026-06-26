import { _ as __nuxt_component_2 } from "./PersonasProcessedPhoto-BWatNFQu.js";
import { _ as __nuxt_component_1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { e as useRoute, i as useRouter, b as _export_sfc } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { f as formatAttendanceDate } from "./attendance-D-E_6rKQ.js";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
import "./daycare-xTCL2ANB.js";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "historial-accesos",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const startDate = ref(queryValue(route.query.startDate));
    const endDate = ref(queryValue(route.query.endDate));
    const plantel = ref(queryValue(route.query.plantel));
    const search = ref(queryValue(route.query.search));
    const query = computed(() => ({
      startDate: startDate.value || void 0,
      endDate: endDate.value || void 0,
      plantel: plantel.value || void 0,
      search: search.value || void 0,
      limit: 700
    }));
    const { data, pending, error: loadError, refresh } = useFetch("/api/admin/access-history", {
      query,
      watch: [query],
      timeout: 3e4,
      key: "admin-access-history"
    });
    const rangeLabel = computed(() => {
      if (!data.value) return "";
      return `${shortDate(data.value.range.startDate)} - ${shortDate(data.value.range.endDate)}`;
    });
    const exportHref = computed(() => {
      const params = new URLSearchParams();
      if (startDate.value) params.set("startDate", startDate.value);
      if (endDate.value) params.set("endDate", endDate.value);
      if (plantel.value) params.set("plantel", plantel.value);
      if (search.value) params.set("search", search.value);
      params.set("limit", "1000");
      return `/api/admin/access-history/export?${params.toString()}`;
    });
    function queryValue(value) {
      if (Array.isArray(value)) return String(value[0] || "").trim();
      return String(value || "").trim();
    }
    function dateLabel(date) {
      return formatAttendanceDate(date);
    }
    function shortDate(date) {
      return formatAttendanceDate(date, "short");
    }
    function initials(name) {
      return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PA";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasProcessedPhoto = __nuxt_component_2;
      const _component_EmptyState = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "access-admin stack",
        "data-product-area": "admin-access-history"
      }, _attrs))} data-v-a52a9eb9><header class="workspace-head compact-head access-head" data-v-a52a9eb9><div data-v-a52a9eb9><p class="eyebrow" data-v-a52a9eb9>Personas Autorizadas</p><h1 data-v-a52a9eb9>Historial de accesos</h1><p data-v-a52a9eb9>Consulta entradas y salidas agrupadas por alumno y fecha.</p></div><div class="head-actions" data-v-a52a9eb9><a class="btn btn-secondary"${ssrRenderAttr("href", exportHref.value)} data-diagnostic-action="exportar-accesos" data-v-a52a9eb9>Exportar CSV</a><button class="btn btn-secondary" type="button" data-diagnostic-action="imprimir-accesos" data-v-a52a9eb9>Imprimir / PDF</button><button class="btn btn-primary" type="button"${ssrIncludeBooleanAttr(unref(pending)) ? " disabled" : ""} data-diagnostic-action="actualizar-accesos" data-v-a52a9eb9>${ssrInterpolate(unref(pending) ? "Actualizando..." : "Actualizar")}</button></div></header><section class="filters-card card" data-v-a52a9eb9><label class="label" data-v-a52a9eb9> Desde <input${ssrRenderAttr("value", startDate.value)} class="input" type="date" data-diagnostic-filter="fecha-inicio" data-v-a52a9eb9></label><label class="label" data-v-a52a9eb9> Hasta <input${ssrRenderAttr("value", endDate.value)} class="input" type="date" data-diagnostic-filter="fecha-fin" data-v-a52a9eb9></label><label class="label" data-v-a52a9eb9> Plantel <select class="select" data-diagnostic-filter="plantel-accesos" data-v-a52a9eb9><option value="" data-v-a52a9eb9${ssrIncludeBooleanAttr(Array.isArray(plantel.value) ? ssrLooseContain(plantel.value, "") : ssrLooseEqual(plantel.value, "")) ? " selected" : ""}>Todos</option><!--[-->`);
      ssrRenderList(unref(data)?.planteles || [], (option) => {
        _push(`<option${ssrRenderAttr("value", option)} data-v-a52a9eb9${ssrIncludeBooleanAttr(Array.isArray(plantel.value) ? ssrLooseContain(plantel.value, option) : ssrLooseEqual(plantel.value, option)) ? " selected" : ""}>${ssrInterpolate(option)}</option>`);
      });
      _push(`<!--]--></select></label><label class="label search-label" data-v-a52a9eb9> Buscar <input${ssrRenderAttr("value", search.value)} class="input" type="search" placeholder="Matrícula, alumno o persona autorizada" data-diagnostic-filter="buscar-accesos" data-v-a52a9eb9></label></section>`);
      if (unref(data)) {
        _push(`<section class="metric-grid" data-v-a52a9eb9><article data-v-a52a9eb9><span data-v-a52a9eb9>Días</span><strong data-v-a52a9eb9>${ssrInterpolate(unref(data).summary.days)}</strong></article><article data-v-a52a9eb9><span data-v-a52a9eb9>Entradas</span><strong data-v-a52a9eb9>${ssrInterpolate(unref(data).summary.entries)}</strong></article><article data-v-a52a9eb9><span data-v-a52a9eb9>Salidas</span><strong data-v-a52a9eb9>${ssrInterpolate(unref(data).summary.exits)}</strong></article><article data-v-a52a9eb9><span data-v-a52a9eb9>Alumnos</span><strong data-v-a52a9eb9>${ssrInterpolate(unref(data).summary.students)}</strong></article><article data-v-a52a9eb9><span data-v-a52a9eb9>Personas</span><strong data-v-a52a9eb9>${ssrInterpolate(unref(data).summary.uniquePeople)}</strong></article></section>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loadError)) {
        _push(`<p class="alert" data-state="error" data-v-a52a9eb9>No fue posible cargar el historial de accesos.</p>`);
      } else if (unref(pending) && !unref(data)) {
        _push(`<div class="card loading-card" data-product-loading data-state="loading" data-v-a52a9eb9>Cargando historial...</div>`);
      } else if (unref(data)?.days.length) {
        _push(`<section class="report-layout" data-product-panel="admin-access-history" data-state="content" data-v-a52a9eb9><article class="card report-card" data-v-a52a9eb9><div class="section-head" data-v-a52a9eb9><div data-v-a52a9eb9><p class="eyebrow" data-v-a52a9eb9>${ssrInterpolate(rangeLabel.value)}</p><h2 data-v-a52a9eb9>${ssrInterpolate(unref(data).days.length)} registros consolidados</h2></div><span class="muted" data-v-a52a9eb9>${ssrInterpolate(unref(data).filters.limit)} eventos máximo</span></div><div class="table-wrap responsive-card-wrap" data-v-a52a9eb9><table class="table responsive-table access-table" data-v-a52a9eb9><thead data-v-a52a9eb9><tr data-v-a52a9eb9><th data-v-a52a9eb9>Alumno</th><th data-v-a52a9eb9>Fecha</th><th data-v-a52a9eb9>Entrada</th><th data-v-a52a9eb9>Salida</th><th data-v-a52a9eb9>Personas</th></tr></thead><tbody data-v-a52a9eb9><!--[-->`);
        ssrRenderList(unref(data).days, (day) => {
          _push(`<tr data-v-a52a9eb9><td data-label="Alumno" data-v-a52a9eb9><strong data-v-a52a9eb9>${ssrInterpolate(day.student.name)}</strong><small data-v-a52a9eb9>${ssrInterpolate(unref(displayMatricula)(day.student.matricula))} · ${ssrInterpolate([day.student.plantel, day.student.grado, day.student.grupo].filter(Boolean).join(" / "))}</small></td><td data-label="Fecha" data-v-a52a9eb9>${ssrInterpolate(dateLabel(day.date))}</td><td data-label="Entrada" data-v-a52a9eb9><strong data-v-a52a9eb9>${ssrInterpolate(day.entrada?.time || "Sin registro")}</strong><small data-v-a52a9eb9>${ssrInterpolate(day.entrada?.person.name || "")}</small></td><td data-label="Salida" data-v-a52a9eb9><strong data-v-a52a9eb9>${ssrInterpolate(day.salida?.time || "Sin registro")}</strong><small data-v-a52a9eb9>${ssrInterpolate(day.salida?.person.name || "")}</small></td><td data-label="Personas" data-v-a52a9eb9><span class="person-count" data-v-a52a9eb9>${ssrInterpolate(day.people.length)}</span></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></article><aside class="card gallery-card" data-product-panel="admin-access-gallery" data-v-a52a9eb9><p class="eyebrow" data-v-a52a9eb9>Galería</p><h2 data-v-a52a9eb9>Personas autorizadas</h2><div class="gallery-list" data-v-a52a9eb9><!--[-->`);
        ssrRenderList(unref(data).people, (person) => {
          _push(`<article class="gallery-person" data-v-a52a9eb9><span class="gallery-photo" data-v-a52a9eb9>`);
          if (person.photoUrl) {
            _push(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
              src: person.photoUrl,
              namespace: `admin-access-person-${person.id}`,
              alt: person.name
            }, null, _parent));
          } else {
            _push(`<b data-v-a52a9eb9>${ssrInterpolate(initials(person.name))}</b>`);
          }
          _push(`</span><span data-v-a52a9eb9><strong data-v-a52a9eb9>${ssrInterpolate(person.name)}</strong><small data-v-a52a9eb9>${ssrInterpolate(person.parentesco || "Persona autorizada")}</small></span></article>`);
        });
        _push(`<!--]--></div></aside></section>`);
      } else if (unref(data)) {
        _push(`<div data-product-panel="admin-access-history" data-state="empty" data-v-a52a9eb9>`);
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Sin accesos",
          description: "Ajusta fechas, plantel o búsqueda para encontrar registros."
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/historial-accesos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const historialAccesos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a52a9eb9"]]);
export {
  historialAccesos as default
};
//# sourceMappingURL=historial-accesos-wy8BTsrq.js.map
