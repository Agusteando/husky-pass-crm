import { e as useRoute, d as __nuxt_component_0, a as __nuxt_component_0$2, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_0$1 } from "./AdminModuleTabs-CA5msHHS.js";
import { _ as __nuxt_component_1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import { u as useAppSession } from "./useAppSession-D-b8QDDW.js";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { d as displayMatriculaCandidate } from "./matricula-C6apTRg-.js";
import { f as formatDate } from "./daycare-xTCL2ANB.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "./routeSession-DTQI2Jul.js";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const salaId = Number(route.params.id);
    const actionError = ref("");
    const isSalaSummary = computed(() => route.path.replace(/\/$/, "") === `/admin/daycare/salas/${salaId}`);
    const { data: session } = useAppSession();
    const { data: overview, pending, error } = useFetch(`/api/daycare/admin/salas/${salaId}/overview`, { timeout: 15e3 });
    const canPreviewAsFamily = computed(() => Boolean(session.value?.user?.kind === "admin"));
    const modules = computed(() => [
      { abbr: "FA", title: "Familias", description: "Cuentas, soporte e impersonación.", to: `/admin/daycare/salas/${salaId}/familias` },
      { abbr: "TA", title: "Tareas", description: "Publicaciones visibles para casa.", to: `/admin/daycare/salas/${salaId}/tareas` },
      { abbr: "AV", title: "Avisos", description: "Comunicados y circulares.", to: `/admin/daycare/salas/${salaId}/avisos` },
      { abbr: "CA", title: "Calendario", description: "Eventos por fecha.", to: `/admin/daycare/salas/${salaId}/calendario` }
    ]);
    function roomInitials(value) {
      return String(value || "S").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    }
    function resourceTypeLabel(type) {
      if (type === "hw") return "Tarea";
      if (type === "news") return "Aviso";
      if (type === "cal") return "Evento";
      return "Contenido";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtPage = __nuxt_component_0;
      const _component_AdminModuleTabs = __nuxt_component_0$1;
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_EmptyState = __nuxt_component_1;
      if (!isSalaSummary.value) {
        _push(ssrRenderComponent(_component_NuxtPage, _attrs, null, _parent));
      } else {
        _push(`<section${ssrRenderAttrs(mergeProps({
          class: "sala-workspace stack",
          "data-product-area": "daycare",
          "data-product-screen": "sala-resumen"
        }, _attrs))} data-v-09d35e9f>`);
        _push(ssrRenderComponent(_component_AdminModuleTabs, { "sala-id": unref(salaId) }, null, _parent));
        if (unref(error)) {
          _push(`<p class="alert" data-v-09d35e9f>No fue posible cargar el workspace de la sala.</p>`);
        } else {
          _push(`<!---->`);
        }
        if (actionError.value) {
          _push(`<p class="alert" data-v-09d35e9f>${ssrInterpolate(actionError.value)}</p>`);
        } else if (unref(pending)) {
          _push(`<div class="card loading-card" data-product-loading data-v-09d35e9f>Cargando sala…</div>`);
        } else if (unref(overview)) {
          _push(`<!--[--><header class="sala-hero" data-diagnostic="sala-context" data-v-09d35e9f><div class="hero-title" data-v-09d35e9f><span class="room-avatar" data-v-09d35e9f>${ssrInterpolate(roomInitials(unref(overview).sala.sala))}</span><div data-v-09d35e9f><p class="eyebrow" data-v-09d35e9f>${ssrInterpolate(unref(overview).sala.unidad)}</p><h1 data-v-09d35e9f>${ssrInterpolate(unref(overview).sala.sala)}</h1><p data-v-09d35e9f>Centro operativo de sala. Gestiona familias y contenido visible desde la experiencia familiar.</p></div></div><div class="hero-actions" data-v-09d35e9f>`);
          if (canPreviewAsFamily.value) {
            _push(`<button class="btn btn-secondary" type="button" data-diagnostic-action="preview-sala" data-v-09d35e9f>Vista familiar</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(ssrRenderComponent(_component_NuxtLink, {
            class: "btn btn-primary",
            to: `/admin/daycare/salas/${unref(salaId)}/familias`,
            "data-diagnostic-link": "gestionar-familias"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Gestionar familias`);
              } else {
                return [
                  createTextVNode("Gestionar familias")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></header><section class="metric-grid" aria-label="Resumen de sala" data-v-09d35e9f><article data-v-09d35e9f><span data-v-09d35e9f>Familias</span><strong data-v-09d35e9f>${ssrInterpolate(unref(overview).metrics.familias)}</strong></article><article data-v-09d35e9f><span data-v-09d35e9f>Tareas</span><strong data-v-09d35e9f>${ssrInterpolate(unref(overview).metrics.tareas)}</strong></article><article data-v-09d35e9f><span data-v-09d35e9f>Avisos</span><strong data-v-09d35e9f>${ssrInterpolate(unref(overview).metrics.avisos)}</strong></article><article data-v-09d35e9f><span data-v-09d35e9f>Eventos</span><strong data-v-09d35e9f>${ssrInterpolate(unref(overview).metrics.calendario)}</strong></article></section><section class="workspace-grid" data-product-panel="sala-workspace"${ssrRenderAttr("data-state", unref(overview) ? "content" : "empty")} data-v-09d35e9f><div class="module-panel card" data-v-09d35e9f><div class="panel-head" data-v-09d35e9f><div data-v-09d35e9f><p class="eyebrow" data-v-09d35e9f>Módulos</p><h2 data-v-09d35e9f>Qué quieres operar</h2></div></div><div class="module-cards" data-v-09d35e9f><!--[-->`);
          ssrRenderList(modules.value, (module) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: module.to,
              to: module.to,
              class: "module-card",
              "data-diagnostic-link": "modulo-sala"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span data-v-09d35e9f${_scopeId}>${ssrInterpolate(module.abbr)}</span><strong data-v-09d35e9f${_scopeId}>${ssrInterpolate(module.title)}</strong><small data-v-09d35e9f${_scopeId}>${ssrInterpolate(module.description)}</small>`);
                } else {
                  return [
                    createVNode("span", null, toDisplayString(module.abbr), 1),
                    createVNode("strong", null, toDisplayString(module.title), 1),
                    createVNode("small", null, toDisplayString(module.description), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div><aside class="card activity-panel" data-v-09d35e9f><div class="panel-head" data-v-09d35e9f><div data-v-09d35e9f><p class="eyebrow" data-v-09d35e9f>Actividad</p><h2 data-v-09d35e9f>Últimos cambios</h2></div></div>`);
          if (unref(overview).latestResources.length) {
            _push(`<div class="activity-list" data-v-09d35e9f><!--[-->`);
            ssrRenderList(unref(overview).latestResources, (item) => {
              _push(`<article data-v-09d35e9f><span class="type-pill" data-v-09d35e9f>${ssrInterpolate(resourceTypeLabel(item.type))}</span><strong data-v-09d35e9f>${ssrInterpolate(item.title || "Sin título")}</strong><small data-v-09d35e9f>${ssrInterpolate(unref(formatDate)(item.date || item.timestamp, "Sin fecha"))}</small></article>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(ssrRenderComponent(_component_EmptyState, {
              title: "Sin publicaciones",
              description: "La sala aún no tiene tareas, avisos o eventos activos."
            }, null, _parent));
          }
          _push(`</aside></section><section class="family-strip card" data-product-panel="sala-families"${ssrRenderAttr("data-state", unref(overview).latestFamilies.length ? "content" : "empty")} data-v-09d35e9f><div class="panel-head" data-v-09d35e9f><div data-v-09d35e9f><p class="eyebrow" data-v-09d35e9f>Familias recientes</p><h2 data-v-09d35e9f>Accesos de guardería</h2></div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            class: "btn btn-secondary",
            to: `/admin/daycare/salas/${unref(salaId)}/familias`,
            "data-diagnostic-link": "ver-familias"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Ver todas`);
              } else {
                return [
                  createTextVNode("Ver todas")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
          if (unref(overview).latestFamilies.length) {
            _push(`<div class="family-mini-list" data-v-09d35e9f><!--[-->`);
            ssrRenderList(unref(overview).latestFamilies, (family) => {
              _push(`<article data-v-09d35e9f><strong data-v-09d35e9f>${ssrInterpolate(family.nombre_nino || unref(displayMatriculaCandidate)(family.username))}</strong><small data-v-09d35e9f>${ssrInterpolate(family.email)}</small></article>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(ssrRenderComponent(_component_EmptyState, {
              title: "Sin familias",
              description: "Agrega cuentas familiares para esta sala."
            }, null, _parent));
          }
          _push(`</section><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/daycare/salas/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-09d35e9f"]]);
export {
  _id_ as default
};
//# sourceMappingURL=_id_-DDkBMuiV.js.map
