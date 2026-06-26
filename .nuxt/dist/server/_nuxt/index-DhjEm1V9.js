import { a as __nuxt_component_0, c as useRuntimeConfig, b as _export_sfc } from "../server.mjs";
import { _ as __nuxt_component_1 } from "./ResourceCard-Bp89BKc3.js";
import { _ as __nuxt_component_1$1 } from "./EmptyState-BVTldcCZ.js";
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import { u as useAppSession } from "./useAppSession-D-b8QDDW.js";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { f as formatDate, s as stripHtml, c as formatCalendarDay } from "./daycare-xTCL2ANB.js";
import { h as hasFamilyScope } from "./sessionScopes-DtWD9iQ2.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const config = useRuntimeConfig();
    const { data: session } = useAppSession();
    const { data: dashboard, pending, error } = useFetch("/api/daycare/family/dashboard", { timeout: 15e3 });
    const canUsePersonasAutorizadas = computed(() => hasFamilyScope(session.value?.user, "personasAutorizadas"));
    const latestNotice = computed(() => dashboard.value?.circulares?.[0] || null);
    const nextCalendar = computed(() => dashboard.value?.calendario?.[0] || null);
    const salaLine = computed(() => {
      const user = session.value?.user;
      return [user?.scopes.daycare?.unidad || "Unidad", user?.scopes.daycare?.sala ? `Sala ${user.scopes.daycare.sala}` : null].filter(Boolean).join(" · ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ResourceCard = __nuxt_component_1;
      const _component_EmptyState = __nuxt_component_1$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "daycare-home" }, _attrs))} data-v-a41f64ec>`);
      if (unref(error)) {
        _push(`<p class="alert" data-v-a41f64ec>No fue posible cargar la información de guardería.</p>`);
      } else if (unref(pending)) {
        _push(`<div class="card loading-card" data-v-a41f64ec>Cargando publicaciones...</div>`);
      } else {
        _push(`<!--[--><section class="daycare-command" data-v-a41f64ec><article class="command-main" data-v-a41f64ec><div class="command-copy" data-v-a41f64ec><p class="eyebrow" data-v-a41f64ec>Hoy en guardería</p><h1 data-v-a41f64ec>${ssrInterpolate(unref(session)?.user?.displayName || "Husky Pass")}</h1><p data-v-a41f64ec>${ssrInterpolate(salaLine.value)}</p></div><div class="command-stats" aria-label="Resumen de guardería" data-v-a41f64ec><span data-v-a41f64ec><strong data-v-a41f64ec>${ssrInterpolate(unref(dashboard)?.circulares?.length || 0)}</strong> avisos</span><span data-v-a41f64ec><strong data-v-a41f64ec>${ssrInterpolate(unref(dashboard)?.tareas?.length || 0)}</strong> tareas</span><span data-v-a41f64ec><strong data-v-a41f64ec>${ssrInterpolate(unref(dashboard)?.calendario?.length || 0)}</strong> eventos</span></div><div class="command-actions" data-v-a41f64ec>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "btn btn-primary",
          to: "/familia/daycare/avisos"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Revisar avisos`);
            } else {
              return [
                createTextVNode("Revisar avisos")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "btn btn-secondary",
          to: "/familia/daycare/calendario"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Ver calendario`);
            } else {
              return [
                createTextVNode("Ver calendario")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></article><aside class="command-side" data-v-a41f64ec><article class="latest-card" data-v-a41f64ec><span class="latest-label" data-v-a41f64ec>Más reciente</span>`);
        if (latestNotice.value) {
          _push(`<!--[--><small data-v-a41f64ec>${ssrInterpolate(unref(formatDate)(latestNotice.value.date || latestNotice.value.timestamp))}</small><h2 data-v-a41f64ec>${ssrInterpolate(latestNotice.value.title || "Aviso publicado")}</h2><p data-v-a41f64ec>${ssrInterpolate(unref(stripHtml)(latestNotice.value.description || latestNotice.value.html) || "Abre el recurso para consultar el comunicado completo.")}</p>`);
          if (latestNotice.value.resource) {
            _push(`<a class="btn btn-primary"${ssrRenderAttr("href", latestNotice.value.resource)} target="_blank" rel="noopener" data-v-a41f64ec>Abrir recurso</a>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        } else {
          _push(`<!--[--><h2 data-v-a41f64ec>Sin avisos nuevos</h2><p data-v-a41f64ec>Cuando la sala publique un comunicado, aparecerá aquí como primera prioridad.</p><!--]-->`);
        }
        _push(`</article><nav class="quick-dock" aria-label="Accesos rápidos de guardería" data-v-a41f64ec><a class="quick-card richmond"${ssrRenderAttr("href", unref(config).public.richmondUrl)} target="_blank" rel="noopener" data-v-a41f64ec><span data-v-a41f64ec>Richmond</span><strong data-v-a41f64ec>Acceder</strong></a>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "quick-card calendar",
          to: "/familia/daycare/calendario"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-a41f64ec${_scopeId}>Agenda</span><strong data-v-a41f64ec${_scopeId}>${ssrInterpolate(nextCalendar.value ? unref(formatCalendarDay)(nextCalendar.value.date).day : "Hoy")}</strong>`);
            } else {
              return [
                createVNode("span", null, "Agenda"),
                createVNode("strong", null, toDisplayString(nextCalendar.value ? unref(formatCalendarDay)(nextCalendar.value.date).day : "Hoy"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(config).public.pasePlatformUrl) {
          _push(`<a class="quick-card neutral"${ssrRenderAttr("href", unref(config).public.pasePlatformUrl)} target="_blank" rel="noopener" data-v-a41f64ec><span data-v-a41f64ec>PASE</span><strong data-v-a41f64ec>Entrar</strong></a>`);
        } else {
          _push(`<!---->`);
        }
        if (canUsePersonasAutorizadas.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            class: "quick-card school",
            to: "/familia/personas-autorizadas"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span data-v-a41f64ec${_scopeId}>Personas</span><strong data-v-a41f64ec${_scopeId}>Ver</strong>`);
              } else {
                return [
                  createVNode("span", null, "Personas"),
                  createVNode("strong", null, "Ver")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</nav></aside></section><section class="today-grid" data-v-a41f64ec><article class="card focus-panel" data-v-a41f64ec><header class="section-head" data-v-a41f64ec><div data-v-a41f64ec><p class="eyebrow" data-v-a41f64ec>Qué revisar ahora</p><h2 data-v-a41f64ec>Comunicados de la sala</h2></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "btn btn-secondary",
          to: "/familia/daycare/avisos"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Ver todos`);
            } else {
              return [
                createTextVNode("Ver todos")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</header>`);
        if (unref(dashboard)?.circulares?.length) {
          _push(`<div class="notice-timeline" data-v-a41f64ec><!--[-->`);
          ssrRenderList(unref(dashboard).circulares.slice(0, 3), (item) => {
            _push(ssrRenderComponent(_component_ResourceCard, {
              key: `news-${item.id || item.title}`,
              resource: item,
              variant: "notice"
            }, null, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "No hay avisos",
            description: "Por ahora no hay comunicados publicados."
          }, null, _parent));
        }
        _push(`</article><aside class="side-panel-stack" data-v-a41f64ec><article class="card compact-panel-card" data-v-a41f64ec><header class="section-head small-head" data-v-a41f64ec><div data-v-a41f64ec><p class="eyebrow" data-v-a41f64ec>Próximo</p><h2 data-v-a41f64ec>Calendario</h2></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "btn btn-secondary",
          to: "/familia/daycare/calendario"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Ver`);
            } else {
              return [
                createTextVNode("Ver")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</header>`);
        if (nextCalendar.value) {
          _push(`<article class="next-event" data-v-a41f64ec><div class="date-box" data-v-a41f64ec><strong data-v-a41f64ec>${ssrInterpolate(unref(formatCalendarDay)(nextCalendar.value.date).day)}</strong><span data-v-a41f64ec>${ssrInterpolate(unref(formatCalendarDay)(nextCalendar.value.date).month)}</span></div><div data-v-a41f64ec><h3 data-v-a41f64ec>${ssrInterpolate(nextCalendar.value.title || "Evento")}</h3><p data-v-a41f64ec>${ssrInterpolate(unref(stripHtml)(nextCalendar.value.description || nextCalendar.value.html))}</p></div></article>`);
        } else {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: "No hay eventos próximos",
            description: "Cuando haya eventos publicados, aparecerán aquí."
          }, null, _parent));
        }
        _push(`</article><article class="card compact-panel-card homework-panel" data-v-a41f64ec><header class="section-head small-head" data-v-a41f64ec><div data-v-a41f64ec><p class="eyebrow" data-v-a41f64ec>Tareas</p><h2 data-v-a41f64ec>${ssrInterpolate(unref(dashboard)?.tareas?.length ? "Pendiente" : "Sin pendientes")}</h2></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "btn btn-secondary",
          to: "/familia/daycare/tareas"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Ver`);
            } else {
              return [
                createTextVNode("Ver")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</header>`);
        if (unref(dashboard)?.tareas?.[0]) {
          _push(ssrRenderComponent(_component_ResourceCard, {
            resource: unref(dashboard).tareas[0],
            variant: "homework"
          }, null, _parent));
        } else {
          _push(`<p class="quiet-copy" data-v-a41f64ec>No hay tarea publicada para revisar en este momento.</p>`);
        }
        _push(`</article>`);
        if (unref(dashboard)?.valor?.length) {
          _push(`<div class="value-box" data-v-a41f64ec><span data-v-a41f64ec>Valor del mes</span><strong data-v-a41f64ec>${ssrInterpolate(unref(dashboard).valor[0].valor)}</strong></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</aside></section><!--]-->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/daycare/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a41f64ec"]]);
export {
  index as default
};
//# sourceMappingURL=index-DhjEm1V9.js.map
