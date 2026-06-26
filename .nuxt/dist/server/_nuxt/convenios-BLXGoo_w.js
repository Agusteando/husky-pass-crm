import { _ as __nuxt_component_0, a as __nuxt_component_1 } from "./PersonasPageHeader-CbpYMeMe.js";
import { _ as __nuxt_component_2 } from "./PersonasSectionHeading-Ts5ucEUy.js";
import { defineComponent, mergeProps, withCtx, unref, createSlots, createVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrInterpolate } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { b as _export_sfc } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "./PersonasProcessedPhoto-BWatNFQu.js";
import "./daycare-xTCL2ANB.js";
import "./AccountMenu-Cc9CsO5z.js";
import "./PersonasIcon-B5CnsWTN.js";
import "@lucide/vue";
import "./matricula-C6apTRg-.js";
import "./_virtual_public-BTp6Nzoa.js";
import "./personasTheme-CJ7aLgiL.js";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
import "./usePersonasTheme-CmVh5mbY.js";
import "./routeSession-DTQI2Jul.js";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "./useAppSession-D-b8QDDW.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "convenios",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: config } = useFetch("/api/personas-autorizadas/config", { key: "pa-convenios-config", timeout: 15e3 });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAutorizadasShell = __nuxt_component_0;
      const _component_FamilyPersonasPageHeader = __nuxt_component_1;
      const _component_FamilyPersonasSectionHeading = __nuxt_component_2;
      _push(ssrRenderComponent(_component_FamilyPersonasAutorizadasShell, mergeProps({ title: "Convenios" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="convenios-screen" data-v-6cd2ab7d${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FamilyPersonasPageHeader, {
              eyebrow: "Familias",
              title: "Convenios",
              description: unref(config)?.conveniosUrl ? "Consulta los beneficios institucionales disponibles para tu familia." : "Los beneficios institucionales aparecerán aquí cuando estén disponibles.",
              "ambassador-variant": "help"
            }, createSlots({ _: 2 }, [
              unref(config)?.conveniosUrl ? {
                name: "actions",
                fn: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<a class="btn btn-primary pa-primary"${ssrRenderAttr("href", unref(config).conveniosUrl)} target="_blank" rel="noopener noreferrer" data-v-6cd2ab7d${_scopeId2}>Abrir convenios</a>`);
                  } else {
                    return [
                      createVNode("a", {
                        class: "btn btn-primary pa-primary",
                        href: unref(config).conveniosUrl,
                        target: "_blank",
                        rel: "noopener noreferrer"
                      }, "Abrir convenios", 8, ["href"])
                    ];
                  }
                }),
                key: "0"
              } : void 0
            ]), _parent2, _scopeId));
            _push2(`<section class="${ssrRenderClass([{ unavailable: !unref(config)?.conveniosUrl }, "card convenios-card"])}" data-product-panel="convenios"${ssrRenderAttr("data-state", unref(config)?.conveniosUrl ? "content" : "unavailable")} data-v-6cd2ab7d${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FamilyPersonasSectionHeading, {
              title: "Beneficios institucionales",
              description: unref(config)?.conveniosUrl ? "El catálogo se abre en el sitio institucional correspondiente." : "No hay un catálogo publicado por el momento.",
              meta: unref(config)?.conveniosUrl ? "Disponible" : "Próximamente"
            }, null, _parent2, _scopeId));
            _push2(`<p data-v-6cd2ab7d${_scopeId}>${ssrInterpolate(unref(config)?.conveniosUrl ? "Revisa promociones, servicios y acuerdos vigentes para las familias de la comunidad escolar." : "No necesitas realizar ninguna acción. El acceso se habilitará automáticamente cuando el colegio publique nuevos convenios.")}</p></section></section>`);
          } else {
            return [
              createVNode("section", { class: "convenios-screen" }, [
                createVNode(_component_FamilyPersonasPageHeader, {
                  eyebrow: "Familias",
                  title: "Convenios",
                  description: unref(config)?.conveniosUrl ? "Consulta los beneficios institucionales disponibles para tu familia." : "Los beneficios institucionales aparecerán aquí cuando estén disponibles.",
                  "ambassador-variant": "help"
                }, createSlots({ _: 2 }, [
                  unref(config)?.conveniosUrl ? {
                    name: "actions",
                    fn: withCtx(() => [
                      createVNode("a", {
                        class: "btn btn-primary pa-primary",
                        href: unref(config).conveniosUrl,
                        target: "_blank",
                        rel: "noopener noreferrer"
                      }, "Abrir convenios", 8, ["href"])
                    ]),
                    key: "0"
                  } : void 0
                ]), 1032, ["description"]),
                createVNode("section", {
                  class: ["card convenios-card", { unavailable: !unref(config)?.conveniosUrl }],
                  "data-product-panel": "convenios",
                  "data-state": unref(config)?.conveniosUrl ? "content" : "unavailable"
                }, [
                  createVNode(_component_FamilyPersonasSectionHeading, {
                    title: "Beneficios institucionales",
                    description: unref(config)?.conveniosUrl ? "El catálogo se abre en el sitio institucional correspondiente." : "No hay un catálogo publicado por el momento.",
                    meta: unref(config)?.conveniosUrl ? "Disponible" : "Próximamente"
                  }, null, 8, ["description", "meta"]),
                  createVNode("p", null, toDisplayString(unref(config)?.conveniosUrl ? "Revisa promociones, servicios y acuerdos vigentes para las familias de la comunidad escolar." : "No necesitas realizar ninguna acción. El acceso se habilitará automáticamente cuando el colegio publique nuevos convenios."), 1)
                ], 10, ["data-state"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/convenios.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const convenios = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6cd2ab7d"]]);
export {
  convenios as default
};
//# sourceMappingURL=convenios-BLXGoo_w.js.map
