import { e as useRoute, i as useRouter, a as __nuxt_component_0, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, ref, reactive, computed, watch, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderStyle } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { d as displayMatriculaCandidate } from "./matricula-C6apTRg-.js";
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
  __name: "personas-autorizadas",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const search = ref(typeof route.query.buscar === "string" ? route.query.buscar : "");
    const selectedPlantel = ref(typeof route.query.plantel === "string" ? route.query.plantel : "");
    const selectedNivel = ref(typeof route.query.nivel === "string" ? route.query.nivel : "");
    const selectedPass = ref(null);
    const clientReady = ref(false);
    const actionError = ref("");
    const actionNotice = ref("");
    const diagnostics = ref("");
    const diagnosticsPending = ref(false);
    const accessPreparingId = ref(null);
    const previewBump = ref(0);
    const configSaving = ref(false);
    const conveniosUploading = ref(false);
    const conveniosFile = ref(null);
    const surveyLevelOptions = [
      { key: "preescolar", label: "Preescolar", defaultTitle: "Encuesta Preescolar" },
      { key: "primaria", label: "Primaria", defaultTitle: "Encuesta Primaria" },
      { key: "secundaria", label: "Secundaria", defaultTitle: "Encuesta Secundaria" },
      { key: "daycare", label: "IECS", defaultTitle: "Encuesta IECS" }
    ];
    const configForm = reactive({
      surveyEnabled: false,
      surveyTitle: "Encuesta Personas Autorizadas",
      surveyEmbedUrl: "",
      surveysByNivel: surveyLevelOptions.reduce((acc, option) => {
        acc[option.key] = { enabled: false, title: option.defaultTitle, embedUrl: "" };
        return acc;
      }, {}),
      conveniosUrl: "",
      helpUrl: ""
    });
    const passQuery = computed(() => ({
      search: search.value,
      plantel: selectedPlantel.value,
      nivel: selectedNivel.value,
      fixture: route.query.fixture === "1" ? "1" : "",
      limit: 120
    }));
    const { data: passSearch, pending: passPending, error: passError, refresh: refreshPass } = useFetch("/api/admin/personas-autorizadas/pass-search", {
      query: passQuery,
      watch: [passQuery],
      timeout: 2e4,
      dedupe: "cancel"
    });
    const { data: config, refresh: refreshConfig } = useFetch("/api/admin/personas-autorizadas/config", { timeout: 15e3 });
    const passRows = computed(() => passSearch.value?.rows || []);
    const passState = computed(() => passPending.value && !passRows.value.length ? "loading" : passError.value ? "error" : passRows.value.length ? "content" : "empty");
    const passFixtureMode = computed(() => route.query.fixture === "1");
    const passStatusLabel = computed(() => passPending.value ? "Consultando..." : passFixtureMode.value ? "Fixtures dev" : "Datos reales PA");
    computed(() => `svg-${selectedPass.value?.personId || "none"}-${previewBump.value}`);
    computed(() => `pdf-${selectedPass.value?.personId || "none"}-${previewBump.value}`);
    watch(config, (value) => {
      if (!value) return;
      configForm.surveyEnabled = Boolean(value.survey.enabled);
      configForm.surveyTitle = value.survey.title || "Encuesta Personas Autorizadas";
      configForm.surveyEmbedUrl = value.survey.embedUrl || "";
      for (const option of surveyLevelOptions) {
        const survey = value.surveysByNivel?.[option.key];
        configForm.surveysByNivel[option.key].enabled = Boolean(survey?.enabled);
        configForm.surveysByNivel[option.key].title = survey?.title || option.defaultTitle;
        configForm.surveysByNivel[option.key].embedUrl = survey?.embedUrl || "";
      }
      configForm.conveniosUrl = value.conveniosUrl || "";
      configForm.helpUrl = value.helpUrl || "";
    }, { immediate: true });
    function syncSelectedPass(rows) {
      if (!rows.length) {
        selectedPass.value = null;
        return;
      }
      const routeId = Number(route.query.persona || 0);
      const fromRoute = rows.find((row) => Number(row.personId || 0) === routeId);
      if (fromRoute) {
        selectedPass.value = fromRoute;
        return;
      }
      if (!selectedPass.value || !rows.some((row) => row.personId === selectedPass.value?.personId)) {
        selectedPass.value = rows.find((row) => row.readiness.ok) || rows[0];
      }
    }
    watch(passRows, (rows) => {
      if (!clientReady.value) return;
      syncSelectedPass(rows);
    }, { immediate: true });
    watch([search, selectedPlantel, selectedNivel], () => {
      return;
    });
    function adminPdfUrl(row, download) {
      if (!row.personId) return "";
      return `/api/admin/personas-autorizadas/marbete?id=${row.personId}&format=pdf${download ? "&download=1" : ""}&v=${previewBump.value}`;
    }
    function adminSvgUrl(row) {
      if (!row.personId) return "";
      return `/api/admin/personas-autorizadas/marbete?id=${row.personId}&format=svg-preview&v=${previewBump.value}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_EmptyState = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "pass-admin",
        "data-product-area": "superadmin",
        "data-product-screen": "husky-pass-desk"
      }, _attrs))} data-v-0229dd3c><header class="workspace-head compact-head pass-head" data-v-0229dd3c><div data-v-0229dd3c><p class="eyebrow" data-v-0229dd3c>Superadmin</p><h1 data-v-0229dd3c>Husky Pass</h1><p data-v-0229dd3c>Busca un alumno o persona autorizada, confirma plantilla y genera el PDF correcto.</p></div><div class="head-actions" data-v-0229dd3c>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/admin/superadmin"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Directorio`);
          } else {
            return [
              createTextVNode("Directorio")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "btn btn-secondary",
        to: "/admin/superadmin/marbetes"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Plantillas`);
          } else {
            return [
              createTextVNode("Plantillas")
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
      _push(`</div></header><section class="pass-search-strip" data-v-0229dd3c><label class="search-box" data-v-0229dd3c><span data-v-0229dd3c>Buscar</span><input${ssrRenderAttr("value", search.value)} class="input" type="search" placeholder="Alumno, persona, matricula, correo o ID" data-diagnostic-filter="pass-search" data-v-0229dd3c></label><label data-v-0229dd3c><span data-v-0229dd3c>Plantel</span><select class="select" data-diagnostic-filter="pass-plantel" data-v-0229dd3c><option value="" data-v-0229dd3c${ssrIncludeBooleanAttr(Array.isArray(selectedPlantel.value) ? ssrLooseContain(selectedPlantel.value, "") : ssrLooseEqual(selectedPlantel.value, "")) ? " selected" : ""}>Todos</option><!--[-->`);
      ssrRenderList(unref(passSearch)?.planteles || [], (plantel) => {
        _push(`<option${ssrRenderAttr("value", plantel)} data-v-0229dd3c${ssrIncludeBooleanAttr(Array.isArray(selectedPlantel.value) ? ssrLooseContain(selectedPlantel.value, plantel) : ssrLooseEqual(selectedPlantel.value, plantel)) ? " selected" : ""}>${ssrInterpolate(plantel)}</option>`);
      });
      _push(`<!--]--></select></label><label data-v-0229dd3c><span data-v-0229dd3c>Nivel</span><select class="select" data-diagnostic-filter="pass-nivel" data-v-0229dd3c><option value="" data-v-0229dd3c${ssrIncludeBooleanAttr(Array.isArray(selectedNivel.value) ? ssrLooseContain(selectedNivel.value, "") : ssrLooseEqual(selectedNivel.value, "")) ? " selected" : ""}>Todos</option><!--[-->`);
      ssrRenderList(unref(passSearch)?.niveles || [], (nivel) => {
        _push(`<option${ssrRenderAttr("value", nivel)} data-v-0229dd3c${ssrIncludeBooleanAttr(Array.isArray(selectedNivel.value) ? ssrLooseContain(selectedNivel.value, nivel) : ssrLooseEqual(selectedNivel.value, nivel)) ? " selected" : ""}>${ssrInterpolate(nivel)}</option>`);
      });
      _push(`<!--]--></select></label><button class="btn btn-primary" type="button"${ssrIncludeBooleanAttr(unref(passPending)) ? " disabled" : ""} data-diagnostic-action="pass-refresh" data-v-0229dd3c>${ssrInterpolate(unref(passPending) ? "Actualizando..." : "Actualizar")}</button></section>`);
      if (actionError.value) {
        _push(`<p class="alert" data-v-0229dd3c>${ssrInterpolate(actionError.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (actionNotice.value) {
        _push(`<p class="notice" data-v-0229dd3c>${ssrInterpolate(actionNotice.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="pass-layout" data-v-0229dd3c><article class="pass-results" data-product-panel="pass-results"${ssrRenderAttr("data-state", passState.value)} data-v-0229dd3c><header class="section-head" data-v-0229dd3c><div data-v-0229dd3c><p class="eyebrow" data-v-0229dd3c>Resultados</p><h2 data-v-0229dd3c>${ssrInterpolate(passRows.value.length)} registros</h2></div><span class="muted" data-v-0229dd3c>${ssrInterpolate(passStatusLabel.value)}</span></header>`);
      if (unref(passPending) && !passRows.value.length) {
        _push(`<div class="loading-row" data-state="loading" data-v-0229dd3c>Cargando Husky Pass...</div>`);
      } else if (unref(passError)) {
        _push(`<p class="alert" data-v-0229dd3c>No fue posible cargar candidatos.</p>`);
      } else if (!passRows.value.length) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Sin resultados",
          description: "Busca por nombre, matricula, correo o ID de persona autorizada."
        }, null, _parent));
      } else {
        _push(`<div class="result-list" data-v-0229dd3c><!--[-->`);
        ssrRenderList(passRows.value, (row) => {
          _push(`<button class="${ssrRenderClass([{ selected: selectedPass.value?.personId === row.personId }, "result-row"])}" style="${ssrRenderStyle({ "--row-color": row.theme.primary })}" type="button" data-diagnostic-action="select-pass-candidate" data-v-0229dd3c><span class="row-status"${ssrRenderAttr("data-ready", row.readiness.ok)} data-v-0229dd3c></span><span class="row-main" data-v-0229dd3c><strong data-v-0229dd3c>${ssrInterpolate(row.authorizedName)}</strong><small data-v-0229dd3c>${ssrInterpolate(row.studentName)} / ${ssrInterpolate(unref(displayMatriculaCandidate)(row.matricula) || "sin matricula")}</small></span><span class="row-scope" data-v-0229dd3c><strong data-v-0229dd3c>${ssrInterpolate(row.plantel || "Plantel pendiente")}</strong><small data-v-0229dd3c>${ssrInterpolate([row.nivel, row.grado, row.grupo].filter(Boolean).join(" / ") || "Datos pendientes")}</small></span><span class="${ssrRenderClass([{ ok: row.readiness.ok }, "status-pill"])}" data-v-0229dd3c>${ssrInterpolate(row.readiness.ok ? "Listo" : "Faltan datos")}</span></button>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</article><aside class="pass-detail" data-product-panel="pass-detail"${ssrRenderAttr("data-state", selectedPass.value ? "content" : "empty")} data-v-0229dd3c>`);
      if (selectedPass.value) {
        _push(`<!--[--><section class="detail-identity" style="${ssrRenderStyle({ "--theme-color": selectedPass.value.theme.primary })}" data-v-0229dd3c><span class="theme-mark" data-v-0229dd3c>${ssrInterpolate(selectedPass.value.theme.shortLabel?.slice(0, 2).toUpperCase() || selectedPass.value.theme.label.slice(0, 2).toUpperCase())}</span><div data-v-0229dd3c><p class="eyebrow" data-v-0229dd3c>${ssrInterpolate(selectedPass.value.theme.label)}</p><h2 data-v-0229dd3c>${ssrInterpolate(selectedPass.value.authorizedName)}</h2><p data-v-0229dd3c>${ssrInterpolate(selectedPass.value.parentesco || "Persona autorizada")}</p></div></section><dl class="detail-facts" data-v-0229dd3c><div data-v-0229dd3c><dt data-v-0229dd3c>Alumno</dt><dd data-v-0229dd3c>${ssrInterpolate(selectedPass.value.studentName)}</dd></div><div data-v-0229dd3c><dt data-v-0229dd3c>Matricula</dt><dd data-v-0229dd3c>${ssrInterpolate(unref(displayMatriculaCandidate)(selectedPass.value.matricula) || "Pendiente")}</dd></div><div data-v-0229dd3c><dt data-v-0229dd3c>Nivel / plantel</dt><dd data-v-0229dd3c>${ssrInterpolate(selectedPass.value.nivel)} / ${ssrInterpolate(selectedPass.value.plantel)}</dd></div><div data-v-0229dd3c><dt data-v-0229dd3c>Grupo</dt><dd data-v-0229dd3c>${ssrInterpolate([selectedPass.value.grado, selectedPass.value.grupo].filter(Boolean).join(" / ") || "Pendiente")}</dd></div><div data-v-0229dd3c><dt data-v-0229dd3c>Plantilla</dt><dd data-v-0229dd3c>${ssrInterpolate(selectedPass.value.template?.name || "No disponible")}</dd></div></dl><div class="issue-list" data-v-0229dd3c><!--[-->`);
        ssrRenderList(selectedPass.value.readiness.issues, (issue) => {
          _push(`<span class="issue-pill" data-v-0229dd3c>${ssrInterpolate(issue)}</span>`);
        });
        _push(`<!--]-->`);
        if (selectedPass.value.readiness.ok) {
          _push(`<span class="issue-pill ok" data-v-0229dd3c>PDF listo para generar</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="pass-actions" data-v-0229dd3c><a class="btn btn-primary"${ssrRenderAttr("href", selectedPass.value.readiness.ok ? adminPdfUrl(selectedPass.value, false) : void 0)} target="_blank" rel="noopener"${ssrRenderAttr("aria-disabled", !selectedPass.value.readiness.ok)}${ssrRenderAttr("data-unavailable-reason", !selectedPass.value.readiness.ok ? selectedPass.value.readiness.issues[0] : void 0)} data-diagnostic-action="preview-admin-husky-pass" data-v-0229dd3c> Previsualizar PDF </a><a class="btn btn-secondary"${ssrRenderAttr("href", selectedPass.value.readiness.ok ? adminPdfUrl(selectedPass.value, true) : void 0)}${ssrRenderAttr("aria-disabled", !selectedPass.value.readiness.ok)}${ssrRenderAttr("data-unavailable-reason", !selectedPass.value.readiness.ok ? selectedPass.value.readiness.issues[0] : void 0)} data-diagnostic-action="download-admin-husky-pass" data-v-0229dd3c> Descargar </a><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(diagnosticsPending.value) ? " disabled" : ""} data-diagnostic-action="diagnose-admin-husky-pass" data-v-0229dd3c>${ssrInterpolate(diagnosticsPending.value ? "Diagnosticando..." : "Diagnostico")}</button><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(accessPreparingId.value === selectedPass.value.userId) ? " disabled" : ""} data-diagnostic-action="prepare-pass-access" data-v-0229dd3c>${ssrInterpolate(accessPreparingId.value === selectedPass.value.userId ? "Preparando..." : "Preparar acceso")}</button></div><section class="preview-pair"${ssrRenderAttr("data-state", selectedPass.value.readiness.ok ? "ready" : "blocked")} data-v-0229dd3c>`);
        if (selectedPass.value.readiness.ok && selectedPass.value.personId) {
          _push(`<iframe${ssrRenderAttr("src", adminSvgUrl(selectedPass.value))} title="Vista SVG Husky Pass" data-v-0229dd3c></iframe>`);
        } else {
          _push(`<!---->`);
        }
        if (selectedPass.value.readiness.ok) {
          _push(`<div class="pdf-preview" data-v-0229dd3c><iframe${ssrRenderAttr("src", adminPdfUrl(selectedPass.value, false))} title="PDF Husky Pass" data-v-0229dd3c></iframe></div>`);
        } else {
          _push(`<div class="blocked-preview" data-v-0229dd3c><strong data-v-0229dd3c>PDF no disponible</strong><span data-v-0229dd3c>${ssrInterpolate(selectedPass.value.readiness.issues[0] || "Faltan datos para generar.")}</span></div>`);
        }
        _push(`</section>`);
        if (diagnostics.value) {
          _push(`<pre class="diagnostics" data-v-0229dd3c>${ssrInterpolate(diagnostics.value)}</pre>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Selecciona un registro",
          description: "Veras la plantilla, faltantes y acciones de PDF."
        }, null, _parent));
      }
      _push(`</aside></section><section class="admin-config" data-v-0229dd3c><article class="config-panel" data-v-0229dd3c><header class="section-head" data-v-0229dd3c><div data-v-0229dd3c><p class="eyebrow" data-v-0229dd3c>Encuestas</p><h2 data-v-0229dd3c>Por nivel</h2></div><button class="btn btn-primary compact" type="button"${ssrIncludeBooleanAttr(configSaving.value) ? " disabled" : ""} data-diagnostic-action="guardar-config-pa" data-v-0229dd3c>${ssrInterpolate(configSaving.value ? "Guardando..." : "Guardar")}</button></header><div class="survey-list" data-v-0229dd3c><!--[-->`);
      ssrRenderList(surveyLevelOptions, (option) => {
        _push(`<article class="survey-row" data-v-0229dd3c><label class="switch-line" data-v-0229dd3c><input${ssrIncludeBooleanAttr(Array.isArray(configForm.surveysByNivel[option.key].enabled) ? ssrLooseContain(configForm.surveysByNivel[option.key].enabled, null) : configForm.surveysByNivel[option.key].enabled) ? " checked" : ""} type="checkbox" data-v-0229dd3c><span data-v-0229dd3c>${ssrInterpolate(option.label)}</span></label><input${ssrRenderAttr("value", configForm.surveysByNivel[option.key].title)} class="input"${ssrRenderAttr("aria-label", `Titulo ${option.label}`)} data-v-0229dd3c><input${ssrRenderAttr("value", configForm.surveysByNivel[option.key].embedUrl)} class="input" placeholder="https://docs.google.com/forms/..."${ssrRenderAttr("data-diagnostic-field", `survey-url-${option.key}`)} data-v-0229dd3c></article>`);
      });
      _push(`<!--]--></div></article><article class="config-panel" data-v-0229dd3c><header class="section-head" data-v-0229dd3c><div data-v-0229dd3c><p class="eyebrow" data-v-0229dd3c>Convenios</p><h2 data-v-0229dd3c>Archivo familiar</h2></div>`);
      if (configForm.conveniosUrl) {
        _push(`<a class="btn btn-secondary compact"${ssrRenderAttr("href", configForm.conveniosUrl)} target="_blank" rel="noopener" data-v-0229dd3c>Abrir</a>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header><div class="upload-row" data-v-0229dd3c><input type="file" accept="image/*,application/pdf,.doc,.docx,.txt" data-diagnostic-field="convenios-file" data-v-0229dd3c><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(!conveniosFile.value || conveniosUploading.value) ? " disabled" : ""} data-diagnostic-action="subir-convenios" data-v-0229dd3c>${ssrInterpolate(conveniosUploading.value ? "Subiendo..." : configForm.conveniosUrl && !conveniosFile.value ? "Archivo listo" : "Subir archivo")}</button></div></article></section></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/superadmin/personas-autorizadas.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const personasAutorizadas = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0229dd3c"]]);
export {
  personasAutorizadas as default
};
//# sourceMappingURL=personas-autorizadas-D3l1Jz6V.js.map
