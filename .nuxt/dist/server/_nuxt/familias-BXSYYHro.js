import { _ as __nuxt_component_0 } from "./AdminModuleTabs-CA5msHHS.js";
import { _ as __nuxt_component_1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, ref, computed, watch, resolveComponent, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { u as useAppSession } from "./useAppSession-D-b8QDDW.js";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { e as useRoute, i as useRouter, b as _export_sfc } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { d as displayMatriculaCandidate } from "./matricula-C6apTRg-.js";
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
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "familias",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const salaId = Number(route.params.id);
    const editing = ref(null);
    const selected = ref(null);
    const saving = ref(false);
    const search = ref(typeof route.query.buscar === "string" ? route.query.buscar : "");
    const actionError = ref("");
    const actionNotice = ref("");
    const previewing = ref(false);
    const impersonatingId = ref(null);
    const confirmingImpersonationId = ref(null);
    const { data: session } = useAppSession();
    const canPreviewSala = computed(() => Boolean(session.value?.user?.kind === "admin"));
    const canImpersonateAccounts = computed(() => Boolean(session.value?.user?.isSuperAdmin));
    const { data, refresh, pending, error } = useFetch("/api/daycare/admin/family-accounts", {
      query: { sala: salaId },
      timeout: 15e3
    });
    const selectedAccountId = computed(() => Number(route.query.familia || 0));
    watch(search, () => syncQuery());
    watch(() => route.query.buscar, (value) => {
      const next = typeof value === "string" ? value : "";
      if (next !== search.value) search.value = next;
    });
    watch(() => route.query.familia, (value) => {
      const id = Number(value || 0);
      if (!id) return;
      const row = filteredAccounts.value.find((account) => account.id === id);
      if (row) selected.value = row;
    });
    function accountLabel(value) {
      return displayMatriculaCandidate(value);
    }
    const filteredAccounts = computed(() => {
      const rows = data.value?.rows || [];
      const needle = search.value.trim().toLowerCase();
      if (!needle) return rows;
      return rows.filter((account) => `${account.nombre_nino || ""} ${account.username || ""} ${accountLabel(account.username) || ""} ${account.email || ""}`.toLowerCase().includes(needle));
    });
    watch(filteredAccounts, (rows) => {
      if (!rows.length) {
        selected.value = null;
        return;
      }
      const routeSelected = rows.find((row) => row.id === selectedAccountId.value);
      if (routeSelected) {
        selected.value = routeSelected;
        return;
      }
      if (!selected.value || !rows.some((row) => row.id === selected.value?.id)) {
        selected.value = rows[0] || null;
        syncQuery(selected.value?.id);
      }
    }, { immediate: true });
    function syncQuery(selectedId = selected.value?.id) {
      if (search.value.trim()) search.value.trim();
    }
    async function save(payload) {
      saving.value = true;
      actionError.value = "";
      actionNotice.value = "";
      try {
        const saved = await $fetch("/api/daycare/admin/family-accounts", { method: "POST", body: { ...payload, sala: String(salaId) } });
        editing.value = null;
        await refresh();
        selected.value = (data.value?.rows || []).find((account) => account.id === saved.id) || selected.value;
        syncQuery(saved.id);
        actionNotice.value = saved.id === payload.id ? "Cuenta familiar actualizada." : "Cuenta familiar creada.";
      } catch (err) {
        actionError.value = err?.data?.statusMessage || err?.statusMessage || "No fue posible guardar la cuenta familiar.";
      } finally {
        saving.value = false;
      }
    }
    function impersonationButtonLabel(userId) {
      if (!userId) return "Impersonar";
      if (impersonatingId.value === userId) return "Abriendo…";
      if (confirmingImpersonationId.value === userId) return "Confirmar impersonación";
      return "Impersonar";
    }
    function initials(value) {
      return String(value || "HP").split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminModuleTabs = __nuxt_component_0;
      const _component_FamilyAccountEditor = resolveComponent("FamilyAccountEditor");
      const _component_EmptyState = __nuxt_component_1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "family-module stack",
        "data-product-area": "daycare",
        "data-product-screen": "familias"
      }, _attrs))} data-v-06cbde36>`);
      _push(ssrRenderComponent(_component_AdminModuleTabs, { "sala-id": unref(salaId) }, null, _parent));
      _push(`<header class="family-hero" data-v-06cbde36><div data-v-06cbde36><p class="eyebrow" data-v-06cbde36>${ssrInterpolate(unref(data)?.sala?.unidad || "Guardería")} · ${ssrInterpolate(unref(data)?.sala?.sala || "Sala")}</p><h1 data-v-06cbde36>Familias</h1><p data-v-06cbde36>Administra cuentas familiares de guardería y revisa el acceso familiar de esta sala.</p></div><div class="family-actions" data-v-06cbde36><label class="search-field" data-v-06cbde36><span data-v-06cbde36>Buscar</span><input${ssrRenderAttr("value", search.value)} class="input" type="search" placeholder="Niño/a, usuario o correo" data-diagnostic-filter="buscar-familia" data-v-06cbde36></label><button class="btn btn-primary" type="button" data-diagnostic-action="crear-familia" data-v-06cbde36>Nueva familia</button></div></header>`);
      if (editing.value) {
        _push(ssrRenderComponent(_component_FamilyAccountEditor, {
          account: editing.value,
          saving: saving.value,
          onSave: save,
          onCancel: ($event) => editing.value = null
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<p class="alert" data-v-06cbde36>No fue posible cargar las cuentas familiares.</p>`);
      } else {
        _push(`<!---->`);
      }
      if (actionError.value) {
        _push(`<p class="alert" data-v-06cbde36>${ssrInterpolate(actionError.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (actionNotice.value) {
        _push(`<p class="notice" data-v-06cbde36>${ssrInterpolate(actionNotice.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending)) {
        _push(`<div class="card loading-card" data-product-loading data-v-06cbde36>Cargando familias…</div>`);
      } else {
        _push(`<section class="family-desk" data-v-06cbde36><div class="card family-list-card" data-product-panel="familias-list"${ssrRenderAttr("data-state", filteredAccounts.value.length ? "content" : "empty")} data-v-06cbde36><div class="section-head" data-v-06cbde36><div data-v-06cbde36><p class="eyebrow" data-v-06cbde36>Cuentas</p><h2 data-v-06cbde36>${ssrInterpolate(filteredAccounts.value.length)} familias</h2></div>`);
        if (canPreviewSala.value) {
          _push(`<button class="btn btn-secondary" type="button" data-diagnostic-action="preview-sala"${ssrIncludeBooleanAttr(previewing.value) ? " disabled" : ""}${ssrRenderAttr("data-unavailable-reason", previewing.value ? "Abriendo vista familiar" : void 0)} data-v-06cbde36>${ssrInterpolate(previewing.value ? "Abriendo…" : "Vista familiar de sala")}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (filteredAccounts.value.length) {
          _push(`<div class="family-list" data-v-06cbde36><!--[-->`);
          ssrRenderList(filteredAccounts.value, (account) => {
            _push(`<button class="${ssrRenderClass([{ active: selected.value?.id === account.id }, "family-row"])}" type="button" data-diagnostic-action="seleccionar-familia"${ssrRenderAttr("aria-pressed", selected.value?.id === account.id)} data-v-06cbde36><span class="family-avatar" data-v-06cbde36>${ssrInterpolate(initials(account.nombre_nino || accountLabel(account.username)))}</span><span class="family-copy" data-v-06cbde36><strong data-v-06cbde36>${ssrInterpolate(account.nombre_nino || "Sin nombre de niño/a")}</strong><small data-v-06cbde36>${ssrInterpolate([accountLabel(account.username) || "Sin usuario", account.email || "Sin correo"].join(" · "))}</small></span><span class="role-pill" data-v-06cbde36>${ssrInterpolate(account.role || "HUSKY")}</span></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "Sin familias",
            description: "No hay cuentas familiares para esta búsqueda o sala."
          }, null, _parent));
        }
        _push(`</div><aside class="card family-preview-card" data-product-panel="familia-preview"${ssrRenderAttr("data-state", selected.value ? "content" : "empty")} data-v-06cbde36>`);
        if (selected.value) {
          _push(`<!--[--><div class="section-head" data-v-06cbde36><div data-v-06cbde36><p class="eyebrow" data-v-06cbde36>Detalle</p><h2 data-v-06cbde36>${ssrInterpolate(selected.value.nombre_nino || accountLabel(selected.value.username))}</h2></div></div><dl data-v-06cbde36><div data-v-06cbde36><dt data-v-06cbde36>Usuario</dt><dd data-v-06cbde36>${ssrInterpolate(accountLabel(selected.value.username) || "Sin usuario")}</dd></div><div data-v-06cbde36><dt data-v-06cbde36>Correo</dt><dd data-v-06cbde36>${ssrInterpolate(selected.value.email || "Sin correo")}</dd></div><div data-v-06cbde36><dt data-v-06cbde36>Rol</dt><dd data-v-06cbde36>${ssrInterpolate(selected.value.role || "—")}</dd></div><div data-v-06cbde36><dt data-v-06cbde36>Visible en</dt><dd data-v-06cbde36>${ssrInterpolate(unref(data)?.sala?.unidad)} · ${ssrInterpolate(unref(data)?.sala?.sala)}</dd></div></dl><div class="preview-actions" data-v-06cbde36>`);
          if (canImpersonateAccounts.value) {
            _push(`<button class="btn btn-primary" type="button" data-diagnostic-action="impersonar-familia"${ssrIncludeBooleanAttr(impersonatingId.value === selected.value.id) ? " disabled" : ""}${ssrRenderAttr("data-unavailable-reason", impersonatingId.value === selected.value.id ? "Abriendo impersonación" : void 0)} data-v-06cbde36>${ssrInterpolate(impersonationButtonLabel(selected.value.id))}</button>`);
          } else {
            _push(`<!---->`);
          }
          if (confirmingImpersonationId.value === selected.value.id) {
            _push(`<button class="btn btn-secondary" type="button" data-diagnostic-action="cancelar-impersonacion" data-v-06cbde36>Cancelar</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="btn btn-secondary" type="button" data-diagnostic-action="editar-familia" data-v-06cbde36>Editar</button></div><!--]-->`);
        } else {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "Selecciona una familia",
            description: "El detalle y las acciones aparecerán aquí."
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/daycare/salas/[id]/familias.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const familias = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-06cbde36"]]);
export {
  familias as default
};
//# sourceMappingURL=familias-BXSYYHro.js.map
