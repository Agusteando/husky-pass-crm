import { _ as __nuxt_component_0$1 } from "./AdminModuleTabs-CA5msHHS.js";
import { _ as __nuxt_component_1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, reactive, ref, computed, watch, mergeProps, useSSRContext, unref, nextTick } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderAttr, ssrRenderList, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { b as _export_sfc, e as useRoute, i as useRouter } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { i as isPdfResource, p as publishedPdfViewerUrl, a as isHiddenResource, s as stripHtml, f as formatDate, d as daycareResourceSection, b as parseLegacyDate } from "./daycare-xTCL2ANB.js";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ResourceEditor",
  __ssrInlineRender: true,
  props: {
    resource: {},
    label: {},
    type: {},
    salaId: {},
    salaName: {},
    unidad: {},
    saving: { type: Boolean }
  },
  emits: ["save", "cancel"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const model = reactive({ ...props.resource, type: props.resource.type || props.type });
    const selectedFile = ref(null);
    const selectedFileName = ref("");
    const uploadedFileName = ref("");
    const uploadError = ref("");
    const uploading = ref(false);
    const categoryOptions = [
      { value: "hw", label: "Tarea" },
      { value: "news", label: "Aviso / noticia" },
      { value: "cal", label: "Calendario" }
    ];
    const published = computed({
      get: () => !isHidden(model.hidden),
      set: (value) => {
        model.hidden = value ? 0 : 1;
      }
    });
    const resourceHref = computed(() => isPdfResource(model.resource) ? publishedPdfViewerUrl(model.resource) : model.resource || "");
    const externalResource = computed(() => Boolean(model.resource && /^https?:\/\//i.test(String(model.resource))));
    const uploadState = computed(() => {
      if (uploadError.value) return "error";
      if (uploading.value) return "loading";
      if (model.resource) return "ready";
      return selectedFile.value ? "selected" : "empty";
    });
    watch(() => props.resource, (resource) => {
      Object.assign(model, resource, { type: resource.type || props.type });
      selectedFile.value = null;
      selectedFileName.value = "";
      uploadedFileName.value = resource.resource ? String(resource.resource).split("/").pop() || "" : "";
      uploadError.value = "";
    }, { deep: true });
    function isHidden(value) {
      return value === true || value === 1 || String(value) === "1";
    }
    function formatBytes(value) {
      if (value < 1024) return `${value} B`;
      if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
      return `${(value / 1024 / 1024).toFixed(1)} MB`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({
        class: "card editor-form",
        "data-product-panel": "resource-editor"
      }, _attrs))} data-v-e30e59c0><div class="editor-head" data-v-e30e59c0><div data-v-e30e59c0><p class="eyebrow" data-v-e30e59c0>${ssrInterpolate(model.id ? "Editar publicación" : "Nueva publicación")}</p><h2 data-v-e30e59c0>${ssrInterpolate(__props.label)}</h2><p data-v-e30e59c0>${ssrInterpolate(__props.unidad || "Guardería")} / ${ssrInterpolate(__props.salaName || `Sala ${__props.salaId}`)}</p></div><div class="actions top-actions" data-v-e30e59c0><button class="btn btn-primary" type="submit"${ssrIncludeBooleanAttr(__props.saving || uploading.value) ? " disabled" : ""} data-v-e30e59c0>${ssrInterpolate(__props.saving ? "Guardando..." : uploading.value ? "Subiendo..." : "Guardar")}</button><button class="btn btn-secondary" type="button" data-v-e30e59c0>Cancelar</button></div></div><section class="editor-grid" data-v-e30e59c0><label class="label" data-v-e30e59c0> Título <input${ssrRenderAttr("value", model.title)} class="input" required data-diagnostic-field="resource-title" data-v-e30e59c0></label><label class="label" data-v-e30e59c0> Categoría <select class="select"${ssrIncludeBooleanAttr(Boolean(model.id)) ? " disabled" : ""} data-diagnostic-field="resource-type" data-v-e30e59c0><!--[-->`);
      ssrRenderList(categoryOptions, (option) => {
        _push(`<option${ssrRenderAttr("value", option.value)} data-v-e30e59c0${ssrIncludeBooleanAttr(Array.isArray(model.type) ? ssrLooseContain(model.type, option.value) : ssrLooseEqual(model.type, option.value)) ? " selected" : ""}>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select></label><label class="label" data-v-e30e59c0> Fecha visible <input${ssrRenderAttr("value", model.date)} class="input" type="date"${ssrIncludeBooleanAttr(model.type === "cal") ? " required" : ""} data-diagnostic-field="resource-date" data-v-e30e59c0></label><div class="${ssrRenderClass([{ hidden: !published.value }, "publish-panel"])}" data-v-e30e59c0><span data-v-e30e59c0>${ssrInterpolate(published.value ? "Publicado" : "Borrador oculto")}</span><strong data-v-e30e59c0>${ssrInterpolate(published.value ? "Visible para familias" : "No aparece en la app familiar")}</strong><label class="switch-row" data-v-e30e59c0><input${ssrIncludeBooleanAttr(Array.isArray(published.value) ? ssrLooseContain(published.value, null) : published.value) ? " checked" : ""} type="checkbox" data-diagnostic-field="resource-published" data-v-e30e59c0><span data-v-e30e59c0>${ssrInterpolate(published.value ? "Publicar activo" : "Publicar después")}</span></label></div></section><label class="label" data-v-e30e59c0> Descripción para familias <textarea class="textarea" placeholder="Mensaje breve, instrucciones o detalle del recurso." data-diagnostic-field="resource-description" data-v-e30e59c0>${ssrInterpolate(model.description)}</textarea></label><section class="resource-attachment" data-v-e30e59c0><div class="attachment-head" data-v-e30e59c0><div data-v-e30e59c0><p class="eyebrow" data-v-e30e59c0>Recurso para familias</p><h3 data-v-e30e59c0>Archivo adjunto</h3></div><span class="mode-pill" data-v-e30e59c0>Carga directa</span></div><div class="upload-panel" data-product-panel="resource-upload"${ssrRenderAttr("data-state", uploadState.value)} data-v-e30e59c0><input class="file-input" type="file" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt" data-diagnostic-field="resource-file" data-v-e30e59c0><div class="upload-copy" data-v-e30e59c0><strong data-v-e30e59c0>${ssrInterpolate(selectedFileName.value || uploadedFileName.value || "Selecciona un archivo")}</strong><span data-v-e30e59c0>${ssrInterpolate(selectedFile.value ? formatBytes(selectedFile.value.size) : model.resource ? "Archivo listo para familias" : "PDF, imagen o documento hasta 8 MB")}</span></div><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(!selectedFile.value || uploading.value) ? " disabled" : ""} data-diagnostic-action="subir-recurso" data-v-e30e59c0>${ssrInterpolate(uploading.value ? "Subiendo..." : model.resource && !selectedFile.value ? "Archivo listo" : "Subir archivo")}</button></div>`);
      if (externalResource.value) {
        _push(`<p class="resource-ready muted-resource" data-v-e30e59c0><span data-v-e30e59c0>Recurso existente</span><a${ssrRenderAttr("href", resourceHref.value)} target="_blank" rel="noopener" data-v-e30e59c0>Abrir</a></p>`);
      } else {
        _push(`<!---->`);
      }
      if (uploadError.value) {
        _push(`<p class="alert compact-alert" data-v-e30e59c0>${ssrInterpolate(uploadError.value)}</p>`);
      } else if (model.resource && !externalResource.value) {
        _push(`<p class="resource-ready" data-v-e30e59c0><span data-v-e30e59c0>Listo</span><a${ssrRenderAttr("href", resourceHref.value)} target="_blank" rel="noopener" data-v-e30e59c0>Abrir archivo</a></p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><section class="editor-footer" data-v-e30e59c0><label class="check-row" data-v-e30e59c0><input${ssrIncludeBooleanAttr(Array.isArray(model.starred) ? ssrLooseContain(model.starred, null) : model.starred) ? " checked" : ""} type="checkbox" data-diagnostic-field="resource-starred" data-v-e30e59c0><span data-v-e30e59c0><strong data-v-e30e59c0>Prioritario</strong><small data-v-e30e59c0>Se destaca en la vista familiar.</small></span></label><div class="context-chip" data-v-e30e59c0><span data-v-e30e59c0>Destino</span><strong data-v-e30e59c0>${ssrInterpolate(__props.unidad || "Guardería")} / ${ssrInterpolate(__props.salaName || `Sala ${__props.salaId}`)}</strong></div></section></form>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/ResourceEditor.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ResourceEditor = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-e30e59c0"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminResourceModule",
  __ssrInlineRender: true,
  props: {
    type: {},
    title: {},
    description: {},
    actionLabel: {}
  },
  setup(__props) {
    const props = __props;
    const route = useRoute();
    const router = useRouter();
    const salaId = Number(route.params.id);
    const editing = ref(null);
    const selected = ref(null);
    const saving = ref(false);
    const search = ref(typeof route.query.buscar === "string" ? route.query.buscar : "");
    const visibilityFilter = ref(normalizeVisibilityFilter(route.query.estado));
    const resourceFilter = ref(normalizeResourceFilter(route.query.recurso));
    const actionError = ref("");
    const actionNotice = ref("");
    const selectedIdFromRoute = computed(() => Number(route.query.registro || 0));
    const createRequested = ref(isCreateQuery(route.query.create) || false);
    const { data, refresh, pending, error } = useFetch("/api/daycare/admin/resources", {
      query: { sala: salaId, type: props.type },
      timeout: 15e3
    });
    const filteredRows = computed(() => {
      const needle = search.value.trim().toLowerCase();
      const rows = data.value?.rows || [];
      return rows.filter((item) => {
        if (visibilityFilter.value === "published" && isHiddenResource(item.hidden)) return false;
        if (visibilityFilter.value === "hidden" && !isHiddenResource(item.hidden)) return false;
        if (resourceFilter.value === "with" && !item.resource) return false;
        if (resourceFilter.value === "without" && item.resource) return false;
        if (!needle) return true;
        return `${item.title || ""} ${stripHtml(item.description)} ${item.autor || ""}`.toLowerCase().includes(needle);
      });
    });
    watch([search, visibilityFilter, resourceFilter], () => {
      syncQuery();
    });
    watch(() => route.query.buscar, (value) => {
      const next = typeof value === "string" ? value : "";
      if (next !== search.value) search.value = next;
    });
    watch(() => route.query.estado, (value) => {
      const next = normalizeVisibilityFilter(value);
      if (next !== visibilityFilter.value) visibilityFilter.value = next;
    });
    watch(() => route.query.recurso, (value) => {
      const next = normalizeResourceFilter(value);
      if (next !== resourceFilter.value) resourceFilter.value = next;
    });
    watch(filteredRows, (rows) => {
      if (createRequested.value) return;
      if (!rows.length) {
        selected.value = null;
        return;
      }
      const routeSelected = rows.find((row) => row.id === selectedIdFromRoute.value);
      if (routeSelected) {
        selected.value = routeSelected;
        return;
      }
      if (!selected.value || !rows.some((row) => row.id === selected.value?.id)) {
        selected.value = rows[0] || null;
        syncSelectedQuery(selected.value?.id);
      }
    }, { immediate: true });
    watch(selectedIdFromRoute, (id) => {
      if (!id) return;
      const row = filteredRows.value.find((item) => item.id === id);
      if (row) selected.value = row;
    });
    watch(() => route.query.create, (value) => {
      if (isCreateQuery(value) && !editing.value) {
        createRequested.value = true;
        startCreate(false);
      }
    }, { immediate: true });
    function startCreate(updateRoute = true) {
      createRequested.value = true;
      actionError.value = "";
      actionNotice.value = "";
      editing.value = {
        sala: String(salaId),
        unidad: data.value?.sala.unidad,
        type: props.type,
        title: "",
        description: "",
        date: props.type === "cal" ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : null,
        starred: 0,
        hidden: 0
      };
      if (updateRoute) syncSelectedQuery(void 0, { create: "1" });
    }
    function closeEditor() {
      createRequested.value = false;
      editing.value = null;
      actionError.value = "";
      if (isCreateQuery(route.query.create)) syncSelectedQuery(selected.value?.id);
    }
    async function save(payload) {
      saving.value = true;
      actionError.value = "";
      actionNotice.value = "";
      try {
        const saved = await $fetch("/api/daycare/admin/resources", {
          method: "POST",
          body: { ...payload, sala: String(salaId), type: payload.type || props.type }
        });
        editing.value = null;
        createRequested.value = false;
        if (saved.type && saved.type !== props.type) {
          const section = daycareResourceSection(saved.type);
          if (section) {
            const query = route.query.unidad ? { unidad: String(route.query.unidad), registro: String(saved.id) } : { registro: String(saved.id) };
            await router.replace({ path: `/admin/daycare/salas/${salaId}/${section}`, query });
            actionNotice.value = "Publicación creada en otra categoría.";
            return;
          }
        }
        await refresh();
        await nextTick();
        const row = (data.value?.rows || []).find((item) => item.id === saved.id);
        selected.value = row || selected.value;
        syncSelectedQuery(saved.id);
        actionNotice.value = saved.id === payload.id ? "Publicación actualizada." : "Publicación creada.";
      } catch (err) {
        actionError.value = err?.data?.statusMessage || err?.statusMessage || "No fue posible guardar la publicación.";
      } finally {
        saving.value = false;
      }
    }
    function resourceHref(resource) {
      return isPdfResource(resource) ? publishedPdfViewerUrl(resource) : resource || "";
    }
    function compactDate(value) {
      const date = parseLegacyDate(value);
      if (!date) return "—";
      return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" }).format(date);
    }
    function syncQuery() {
      const nextQuery = { ...route.query };
      setQueryValue(nextQuery, "buscar", search.value.trim());
      setQueryValue(nextQuery, "estado", visibilityFilter.value === "published" ? "" : visibilityFilter.value);
      setQueryValue(nextQuery, "recurso", resourceFilter.value === "all" ? "" : resourceFilter.value);
      delete nextQuery.create;
      replaceQueryIfChanged();
    }
    function syncSelectedQuery(id, extra = {}) {
      const nextQuery = { ...route.query, ...extra };
      if (!Object.prototype.hasOwnProperty.call(extra, "create")) delete nextQuery.create;
      setQueryValue(nextQuery, "registro", id ? String(id) : "");
      replaceQueryIfChanged();
    }
    function setQueryValue(query, key, value) {
      if (value) query[key] = value;
      else delete query[key];
    }
    function replaceQueryIfChanged(query) {
      return Promise.resolve();
    }
    function normalizeVisibilityFilter(value) {
      return value === "hidden" || value === "all" ? value : "published";
    }
    function normalizeResourceFilter(value) {
      return value === "with" || value === "without" ? value : "all";
    }
    function isCreateQuery(value) {
      const source = Array.isArray(value) ? value[0] : value;
      return String(source || "") === "1";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminModuleTabs = __nuxt_component_0$1;
      const _component_EmptyState = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "resource-module stack",
        "data-product-area": "daycare",
        "data-product-screen": __props.type
      }, _attrs))} data-v-616ade3a>`);
      _push(ssrRenderComponent(_component_AdminModuleTabs, { "sala-id": unref(salaId) }, null, _parent));
      _push(`<header class="module-hero" data-v-616ade3a><div data-v-616ade3a><p class="eyebrow" data-v-616ade3a>${ssrInterpolate(unref(data)?.sala?.unidad || "Guardería")} · ${ssrInterpolate(unref(data)?.sala?.sala || "Sala")}</p><h1 data-v-616ade3a>${ssrInterpolate(__props.title)}</h1><p data-v-616ade3a>${ssrInterpolate(__props.description)}</p></div><div class="module-actions" data-v-616ade3a><label class="search-field" data-v-616ade3a><span data-v-616ade3a>Buscar</span><input${ssrRenderAttr("value", search.value)} class="input" type="search" placeholder="Título, descripción o autor" data-diagnostic-filter="buscar-recurso" data-v-616ade3a></label><label class="search-field" data-v-616ade3a><span data-v-616ade3a>Estado</span><select class="select" data-diagnostic-filter="estado-recurso" data-v-616ade3a><option value="published" data-v-616ade3a${ssrIncludeBooleanAttr(Array.isArray(visibilityFilter.value) ? ssrLooseContain(visibilityFilter.value, "published") : ssrLooseEqual(visibilityFilter.value, "published")) ? " selected" : ""}>Publicadas</option><option value="hidden" data-v-616ade3a${ssrIncludeBooleanAttr(Array.isArray(visibilityFilter.value) ? ssrLooseContain(visibilityFilter.value, "hidden") : ssrLooseEqual(visibilityFilter.value, "hidden")) ? " selected" : ""}>Ocultas</option><option value="all" data-v-616ade3a${ssrIncludeBooleanAttr(Array.isArray(visibilityFilter.value) ? ssrLooseContain(visibilityFilter.value, "all") : ssrLooseEqual(visibilityFilter.value, "all")) ? " selected" : ""}>Todas</option></select></label><label class="search-field" data-v-616ade3a><span data-v-616ade3a>Recurso</span><select class="select" data-diagnostic-filter="archivo-recurso" data-v-616ade3a><option value="all" data-v-616ade3a${ssrIncludeBooleanAttr(Array.isArray(resourceFilter.value) ? ssrLooseContain(resourceFilter.value, "all") : ssrLooseEqual(resourceFilter.value, "all")) ? " selected" : ""}>Todos</option><option value="with" data-v-616ade3a${ssrIncludeBooleanAttr(Array.isArray(resourceFilter.value) ? ssrLooseContain(resourceFilter.value, "with") : ssrLooseEqual(resourceFilter.value, "with")) ? " selected" : ""}>Con archivo</option><option value="without" data-v-616ade3a${ssrIncludeBooleanAttr(Array.isArray(resourceFilter.value) ? ssrLooseContain(resourceFilter.value, "without") : ssrLooseEqual(resourceFilter.value, "without")) ? " selected" : ""}>Sin recurso</option></select></label><button class="btn btn-primary" type="button" data-diagnostic-action="crear-recurso" data-v-616ade3a>${ssrInterpolate(__props.actionLabel)}</button></div></header>`);
      if (editing.value) {
        _push(ssrRenderComponent(ResourceEditor, {
          resource: editing.value,
          label: __props.title,
          type: __props.type,
          "sala-id": unref(salaId),
          "sala-name": unref(data)?.sala?.sala,
          unidad: unref(data)?.sala?.unidad,
          saving: saving.value,
          onSave: save,
          onCancel: closeEditor
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="alert" data-v-616ade3a>No fue posible cargar esta sección.</p>`);
      } else {
        _push(`<!---->`);
      }
      if (actionError.value) {
        _push(`<p class="alert" data-v-616ade3a>${ssrInterpolate(actionError.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (actionNotice.value) {
        _push(`<p class="notice" data-v-616ade3a>${ssrInterpolate(actionNotice.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending)) {
        _push(`<div class="card loading-card" data-product-loading data-v-616ade3a>Cargando publicaciones…</div>`);
      } else {
        _push(`<section class="resource-desk" data-v-616ade3a><div class="card resource-list-card" data-product-panel="resource-list"${ssrRenderAttr("data-state", filteredRows.value.length ? "content" : "empty")} data-v-616ade3a><div class="section-head" data-v-616ade3a><div data-v-616ade3a><p class="eyebrow" data-v-616ade3a>Listado</p><h2 data-v-616ade3a>${ssrInterpolate(filteredRows.value.length)} registros</h2></div><span class="scope-pill" data-v-616ade3a>${ssrInterpolate(unref(data)?.sala?.unidad)} · ${ssrInterpolate(unref(data)?.sala?.sala)}</span></div>`);
        if (filteredRows.value.length) {
          _push(`<div class="resource-list" data-v-616ade3a><!--[-->`);
          ssrRenderList(filteredRows.value, (item) => {
            _push(`<button class="${ssrRenderClass([{ active: selected.value?.id === item.id, hidden: unref(isHiddenResource)(item.hidden) }, "resource-row"])}" type="button" data-diagnostic-action="seleccionar-recurso"${ssrRenderAttr("aria-pressed", selected.value?.id === item.id)} data-v-616ade3a><span class="row-date" data-v-616ade3a>${ssrInterpolate(compactDate(item.date || item.timestamp))}</span><span class="row-main" data-v-616ade3a><strong data-v-616ade3a>${ssrInterpolate(item.title || "Sin título")}</strong><small data-v-616ade3a>${ssrInterpolate(unref(stripHtml)(item.description) || "Sin descripción")}</small></span><span class="row-status" data-v-616ade3a><strong class="${ssrRenderClass(unref(isHiddenResource)(item.hidden) ? "status-hidden" : "status-published")}" data-v-616ade3a>${ssrInterpolate(unref(isHiddenResource)(item.hidden) ? "Oculta" : "Publicada")}</strong><small data-v-616ade3a>${ssrInterpolate(item.resource ? "Con recurso" : "Sin recurso")}</small></span></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "Sin publicaciones",
            description: "No hay registros para esta búsqueda, estado o filtro de recurso."
          }, null, _parent));
        }
        _push(`</div><aside class="card preview-card" data-product-panel="resource-preview"${ssrRenderAttr("data-state", selected.value ? "content" : "empty")} data-v-616ade3a>`);
        if (selected.value) {
          _push(`<!--[--><div class="section-head" data-v-616ade3a><div data-v-616ade3a><p class="eyebrow" data-v-616ade3a>Vista previa</p><h2 data-v-616ade3a>${ssrInterpolate(selected.value.title || "Sin título")}</h2></div><span class="${ssrRenderClass([{ muted: unref(isHiddenResource)(selected.value.hidden) }, "scope-pill"])}" data-v-616ade3a>${ssrInterpolate(unref(isHiddenResource)(selected.value.hidden) ? "Oculta" : "Publicada")}</span></div><p data-v-616ade3a>${ssrInterpolate(unref(stripHtml)(selected.value.description) || "Sin descripción.")}</p><dl data-v-616ade3a><div data-v-616ade3a><dt data-v-616ade3a>Fecha</dt><dd data-v-616ade3a>${ssrInterpolate(unref(formatDate)(selected.value.date || selected.value.timestamp, "—"))}</dd></div><div data-v-616ade3a><dt data-v-616ade3a>Autor</dt><dd data-v-616ade3a>${ssrInterpolate(selected.value.autor || "—")}</dd></div><div data-v-616ade3a><dt data-v-616ade3a>Estado familiar</dt><dd data-v-616ade3a>${ssrInterpolate(unref(isHiddenResource)(selected.value.hidden) ? "No visible para familias" : "Visible para familias")}</dd></div><div data-v-616ade3a><dt data-v-616ade3a>Recurso</dt><dd data-v-616ade3a>${ssrInterpolate(selected.value.resource || "Sin archivo")}</dd></div><div data-v-616ade3a><dt data-v-616ade3a>Visible en</dt><dd data-v-616ade3a>${ssrInterpolate(unref(data)?.sala?.unidad)} · ${ssrInterpolate(unref(data)?.sala?.sala)}</dd></div></dl><div class="preview-actions" data-v-616ade3a>`);
          if (selected.value.resource) {
            _push(`<a class="btn btn-secondary"${ssrRenderAttr("href", resourceHref(selected.value.resource))} target="_blank" rel="noopener" data-diagnostic-link="abrir-recurso" data-v-616ade3a>Abrir recurso</a>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="btn btn-secondary" type="button" data-diagnostic-action="editar-recurso" data-v-616ade3a>Editar</button><button class="btn btn-secondary" type="button" data-diagnostic-action="toggle-publicacion" data-v-616ade3a>${ssrInterpolate(unref(isHiddenResource)(selected.value.hidden) ? "Publicar" : "Ocultar")}</button><button class="btn btn-danger" type="button" data-diagnostic-action="eliminar-recurso" data-v-616ade3a>Eliminar</button></div><!--]-->`);
        } else {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "Selecciona un registro",
            description: "El detalle aparecerá aquí. Los filtros actualizan el listado y la URL."
          }, null, _parent));
        }
        _push(`</aside></section>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminResourceModule.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-616ade3a"]]);
export {
  __nuxt_component_0 as _
};
//# sourceMappingURL=AdminResourceModule-7ZsQPB4H.js.map
