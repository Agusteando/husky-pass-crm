import { _ as __nuxt_component_0, a as __nuxt_component_1$1, b as __nuxt_component_3 } from "./PersonasPageHeader-CbpYMeMe.js";
import { _ as __nuxt_component_1 } from "./PersonasIcon-B5CnsWTN.js";
import { b as _export_sfc, a as __nuxt_component_0$1 } from "../server.mjs";
import { _ as __nuxt_component_2 } from "./PersonasSectionHeading-Ts5ucEUy.js";
import { _ as __nuxt_component_2$1, i as isValidatedVisionPhotoUrl } from "./PersonasProcessedPhoto-BWatNFQu.js";
import { defineComponent, ref, computed, mergeProps, useSSRContext, watch, withCtx, unref, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, createCommentVNode, Fragment, renderList, withModifiers } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { d as personasThemeStyle, a as personasLevelName, b as personasInstitutionName, r as resolvePersonasTheme } from "./personasTheme-CJ7aLgiL.js";
import { _ as __nuxt_component_4 } from "./PersonasModal-COKcp1xQ.js";
import { _ as __nuxt_component_9, t as toAuthorizedPersonSavePayload, c as createAuthorizedPersonForm } from "./AuthorizedPersonEditor-pLz4ZZUc.js";
import { a as usePersonasFamilyPeople } from "./usePersonasTheme-CmVh5mbY.js";
import { n as normalizeVirtualAssetUrl, g as authorizedPersonLabel } from "./daycare-xTCL2ANB.js";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import "./AccountMenu-Cc9CsO5z.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import "./matricula-C6apTRg-.js";
import "./_virtual_public-BTp6Nzoa.js";
import "@lucide/vue";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
import "./PersonasImageUpload-C526Ralt.js";
import "./routeSession-DTQI2Jul.js";
import "./ssr-BC0VN6Ct.js";
import "./useAppSession-D-b8QDDW.js";
import "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "PersonasTutorialVideo",
  __ssrInlineRender: true,
  props: {
    theme: {},
    videoId: {},
    title: {}
  },
  setup(__props) {
    const props = __props;
    const playing = ref(false);
    const safeVideoId = computed(() => encodeURIComponent(props.videoId.trim()));
    const thumbnailUrl = computed(() => `https://img.youtube.com/vi/${safeVideoId.value}/maxresdefault.jpg`);
    const embedUrl = computed(() => `https://www.youtube-nocookie.com/embed/${safeVideoId.value}?autoplay=1&rel=0&modestbranding=1&playsinline=1`);
    const frameStyle = computed(() => personasThemeStyle(props.theme));
    const themeLabel = computed(() => {
      const level = personasLevelName(props.theme).spanish;
      const institution = personasInstitutionName(props.theme);
      return institution === level ? level : `${institution} / ${level}`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasIcon = __nuxt_component_1;
      _push(`<figure${ssrRenderAttrs(mergeProps({
        class: "tutorial-video",
        "data-theme": __props.theme.key,
        "data-state": playing.value ? "playing" : "poster",
        style: frameStyle.value
      }, _attrs))} data-v-ae636833>`);
      if (!playing.value) {
        _push(`<button class="tutorial-poster" type="button" data-diagnostic-action="reproducir-tutorial-personas-autorizadas"${ssrRenderAttr("aria-label", `Reproducir ${__props.title}`)} data-v-ae636833><img class="tutorial-thumbnail"${ssrRenderAttr("src", thumbnailUrl.value)}${ssrRenderAttr("alt", __props.title)} loading="lazy" decoding="async" referrerpolicy="no-referrer" data-v-ae636833><span class="tutorial-shade" aria-hidden="true" data-v-ae636833></span><span class="tutorial-frame-ring" aria-hidden="true" data-v-ae636833><span data-v-ae636833></span><span data-v-ae636833></span><span data-v-ae636833></span><span data-v-ae636833></span></span><span class="tutorial-theme-pill" data-v-ae636833>${ssrInterpolate(themeLabel.value)}</span><span class="tutorial-play-button" aria-hidden="true" data-v-ae636833>`);
        _push(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "play" }, null, _parent));
        _push(`</span><span class="tutorial-copy" data-v-ae636833><strong data-v-ae636833>${ssrInterpolate(__props.title)}</strong><small data-v-ae636833>Reproducir en este sitio</small></span></button>`);
      } else {
        _push(`<div class="tutorial-embed" data-state="playing" data-v-ae636833><iframe${ssrRenderAttr("src", embedUrl.value)}${ssrRenderAttr("title", __props.title)} loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen data-v-ae636833></iframe></div>`);
      }
      _push(`</figure>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/family/PersonasTutorialVideo.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-ae636833"]]);
const faqIntro = "Sabemos que tendrás muchas preguntas, por eso reunimos aquí las respuestas más comunes. Si tienes una duda particular, contáctanos y con gusto te brindaremos atención personalizada.";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { data, refresh, pending, error: loadError } = usePersonasFamilyPeople();
    const editing = ref(null);
    const editorError = ref("");
    const editorBusy = ref(false);
    const annulTarget = ref(null);
    const saving = ref(false);
    const deleting = ref(false);
    const error = ref("");
    const notice = ref("");
    const selectedIndice = ref(1);
    const openFaq = ref(null);
    const marbeteReadiness = ref({});
    const downloadingId = ref(null);
    const downloadError = ref("");
    const editingKey = computed(() => editing.value ? `edit-${editing.value.id || "slot"}-${editing.value.indice}` : "edit-none");
    const people = computed(() => data.value || []);
    const children = computed(() => people.value.find((person) => person.children?.length)?.children || []);
    const primaryChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null);
    const theme = computed(() => resolvePersonasTheme({
      matricula: primaryChild.value?.matricula,
      plantel: primaryChild.value?.plantel,
      nivelEdu: primaryChild.value?.nivelEdu,
      campus: primaryChild.value?.campus
    }));
    const levelLabel = computed(() => personasLevelName(theme.value).spanish);
    const studentPhoto = computed(() => normalizeVirtualAssetUrl(primaryChild.value?.foto || ""));
    const studentName = computed(() => [primaryChild.value?.nombreA, primaryChild.value?.paternoA, primaryChild.value?.maternoA].filter(Boolean).join(" ") || "tu alumno");
    const studentFirstName = computed(() => String(primaryChild.value?.nombreA || studentName.value || "tu alumno").split(/\s+/)[0] || "tu alumno");
    const completedCount = computed(() => people.value.filter((person) => person.id).length);
    const completedRegularCount = computed(() => people.value.filter((person) => person.id && person.indice < 4).length);
    const registeredPeopleLabel = computed(() => completedRegularCount.value === 1 ? "1 persona registrada" : `${completedRegularCount.value} personas registradas`);
    const expressSlot = computed(() => people.value.find((person) => person.indice === 4) || null);
    function retryLoad() {
      return refresh();
    }
    const faqItems = [
      {
        question: "¿Qué es el módulo 'Personas Autorizadas' y para qué se utiliza?",
        answer: "El módulo 'Personas Autorizadas' en Husky Pass es una herramienta que permite a los padres de familia gestionar los registros de las personas autorizadas para entregar y recoger a los alumnos en los colegios."
      },
      {
        question: "¿Cuántas personas autorizadas puedo registrar por cada alumno matriculado?",
        answer: "Puedes registrar un máximo de tres personas autorizadas por cada alumno matriculado."
      },
      {
        question: "¿Qué información se requiere para registrar a una persona autorizada?",
        answer: "Para registrar a una persona autorizada, se deben completar los siguientes campos en el formulario: nombre completo de la persona, parentesco con el alumno y cargar una fotografía que cumpla con las especificaciones de estilo de pasaporte."
      },
      {
        question: "¿Qué debo hacer si ninguna de las tres personas autorizadas está disponible ante una eventualidad emergente?",
        answer: "En caso de una eventualidad donde ninguna de las tres personas autorizadas esté disponible, se puede generar un 'pase express' de manera rápida y segura. El pase express permite registrar temporalmente los datos de un familiar, conocido, tutor o persona encargada para que pueda entregar o recoger al alumno. El registro express será válido durante 24 horas a partir de su generación."
      },
      {
        question: "¿Cómo genero un pase express?",
        answer: "Para generar un pase express, sigue las instrucciones en la plataforma Husky Pass para completar los datos del familiar, conocido, tutor o persona encargada en el formulario correspondiente."
      },
      {
        question: "¿Qué hago si el pase express expiró?",
        answer: "Si el pase express ha expirado y aún necesitas que alguien recoja o entregue al alumno, te recomendamos comunicarte directamente con la recepción / Control escolar del colegio. El personal estará encantado de ayudarte a encontrar una solución adecuada y asegurarse de que el alumno esté en buenas manos."
      },
      {
        question: "¿Qué debo hacer después de guardar el registro normal o el pase express?",
        answer: "Después de generar y guardar el registro normal o el pase express, deberás realizar la impresión del PDF que contiene el formato para recortar, ya sea el hanger o el gafete."
      },
      {
        question: "¿Cómo elimino o anulo una persona autorizada?",
        answer: "Si necesitas eliminar a una persona autorizada de la lista, simplemente accede al módulo 'Personas Autorizadas' en Husky Pass, selecciona la persona que deseas eliminar y busca la opción de eliminar o anular el registro. Ten en cuenta que al eliminar a una persona autorizada, ya no podrá entregar o recoger al alumno a menos que se registre nuevamente."
      },
      {
        question: "¿Puedo editar la información después de guardar un registro?",
        answer: "No, la información de cada registro no se puede editar una vez guardada. En caso de algún error de captura de datos o de la foto, se deberá eliminar o anular el registro existente y crear uno nuevo desde cero con la información correcta."
      }
    ];
    watch(people, (value) => {
      if (!value.length) return;
      if (!value.some((person) => person.indice === selectedIndice.value)) selectedIndice.value = value[0]?.indice || 1;
    }, { immediate: true });
    watch(() => people.value.map((person) => `${person.id || "empty"}:${person.foto || ""}:${person.compressed_foto || ""}:${person.nombreP || ""}:${person.paternoP || ""}:${person.maternoP || ""}:${person.parenP || ""}`).join("|"), () => {
      void refreshMarbeteReadiness();
    }, { immediate: true });
    function fullName(person) {
      return [person.nombreP, person.paternoP, person.maternoP].filter(Boolean).join(" ");
    }
    function initials(person) {
      const name = fullName(person) || "PA";
      return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
    }
    function photoUrl(person) {
      const original = normalizeVirtualAssetUrl(person.foto || "");
      const processed = normalizeVirtualAssetUrl(person.compressed_foto || "");
      return original || (isValidatedVisionPhotoUrl(processed) ? processed : "");
    }
    function slotTitle(person) {
      if (person.id) return fullName(person) || authorizedPersonLabel(person.indice);
      return person.indice === 4 ? "Pase Express" : "Registrar persona";
    }
    function slotSubtitle(person) {
      if (!person.id) return person.indice === 4 ? "Opcional" : "Disponible";
      return person.parenP || "Datos pendientes";
    }
    function localMarbeteReady(person) {
      return Boolean(person.id && photoUrl(person) && fullName(person) && person.parenP);
    }
    function marbeteStatus(person) {
      const id = Number(person.id || 0);
      return id ? marbeteReadiness.value[id] : null;
    }
    function marbeteReady(person) {
      return Boolean(localMarbeteReady(person) && marbeteStatus(person)?.ok);
    }
    function friendlyReadinessMessage(message) {
      const value = String(message || "").toLowerCase();
      if (value.includes("imagen") || value.includes("foto") || value.includes("image")) return "Actualiza la foto";
      if (value.includes("dato") || value.includes("text") || value.includes("required")) return "Completa los datos";
      return "No disponible";
    }
    function friendlyDownloadMessage(message) {
      const value = String(message || "").toLowerCase();
      if (value.includes("foto") || value.includes("imagen") || value.includes("image")) return "Actualiza la foto para descargar el Husky Pass o solicita apoyo a la escuela.";
      if (value.includes("dato") || value.includes("nombre") || value.includes("parentesco") || value.includes("matr")) return "Completa los datos solicitados para descargar el Husky Pass.";
      return "No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.";
    }
    async function downloadHuskyPass(person) {
      if (!person?.id || downloadingId.value) return;
      downloadError.value = "";
      downloadingId.value = person.id;
      try {
        const response = await fetch(`/api/personas-autorizadas/marbete?id=${person.id}&download=1`, { credentials: "include" });
        if (!response.ok) {
          const message = await response.text().catch(() => "");
          throw new Error(friendlyDownloadMessage(message));
        }
        const blob = await response.blob();
        if (!blob.size || !response.headers.get("content-type")?.toLowerCase().includes("pdf")) {
          throw new Error("No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.");
        }
        const objectUrl = URL.createObjectURL(blob);
        const anchor = (void 0).createElement("a");
        anchor.href = objectUrl;
        anchor.download = `husky-pass-${String(person.indice || person.id).padStart(2, "0")}.pdf`;
        (void 0).body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        (void 0).setTimeout(() => URL.revokeObjectURL(objectUrl), 1e3);
      } catch (err) {
        downloadError.value = err instanceof Error ? err.message : "No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.";
      } finally {
        downloadingId.value = null;
      }
    }
    function marbeteState(person) {
      if (!person.id) return person.indice === 4 ? "Opcional" : "Disponible";
      if (!photoUrl(person)) return "Actualiza la foto";
      if (!fullName(person)) return "Completa el nombre";
      if (!person.parenP) return "Completa parentesco";
      const status = marbeteStatus(person);
      if (!status || status.pending) return "Validando Husky Pass";
      if (!status.ok) return friendlyReadinessMessage(status.issues[0]);
      return "Listo";
    }
    async function refreshMarbeteReadiness() {
      const candidates = people.value.filter((person) => localMarbeteReady(person));
      const candidateIds = new Set(candidates.map((person) => Number(person.id)));
      for (const id of Object.keys(marbeteReadiness.value)) {
        if (!candidateIds.has(Number(id))) delete marbeteReadiness.value[Number(id)];
      }
      await Promise.all(candidates.map(async (person) => {
        const id = Number(person.id);
        marbeteReadiness.value[id] = { ...marbeteReadiness.value[id] || { ok: false, issues: [] }, pending: true };
        try {
          const result = await $fetch("/api/personas-autorizadas/marbete", { query: { id, format: "readiness" } });
          marbeteReadiness.value[id] = { ...result, pending: false };
        } catch (err) {
          const failure = err;
          marbeteReadiness.value[id] = { ok: false, issues: [friendlyReadinessMessage(failure?.data?.statusMessage || failure?.statusMessage || failure?.message)], pending: false };
        }
      }));
    }
    function edit(person) {
      error.value = "";
      notice.value = "";
      editorError.value = "";
      editorBusy.value = false;
      selectedIndice.value = person.indice;
      if (person.id) {
        annulTarget.value = person;
        return;
      }
      editing.value = toAuthorizedPersonSavePayload(createAuthorizedPersonForm(person));
    }
    function openFreshCapture(indice) {
      editorError.value = "";
      editorBusy.value = false;
      selectedIndice.value = normalizeIndice(indice);
      editing.value = toAuthorizedPersonSavePayload(createAuthorizedPersonForm({ indice: selectedIndice.value }));
    }
    function closeEditor() {
      if (saving.value || editorBusy.value) return;
      editing.value = null;
      editorError.value = "";
      editorBusy.value = false;
    }
    function applySavedPerson(saved) {
      const current = data.value || [];
      const next = current.map((person) => {
        const sameRecord = saved.id && person.id && Number(person.id) === Number(saved.id);
        const sameSlot = Number(person.indice) === Number(saved.indice);
        if (!sameRecord && !sameSlot) return person;
        return {
          ...person,
          ...saved,
          id: saved.id ? Number(saved.id) : person.id || null,
          indice: Number(saved.indice || person.indice),
          children: person.children
        };
      });
      data.value = next.length ? next : current;
    }
    async function save(payload) {
      if (saving.value || editorBusy.value) return;
      saving.value = true;
      error.value = "";
      editorError.value = "";
      notice.value = "";
      try {
        const saved = await $fetch("/api/personas-autorizadas/family", { method: "POST", body: payload });
        applySavedPerson(saved);
        editing.value = null;
        notice.value = "Registro guardado.";
        await refresh();
        await refreshMarbeteReadiness();
      } catch (err) {
        const failure = err;
        editorError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || "No fue posible guardar el registro.";
      } finally {
        saving.value = false;
      }
    }
    async function remove(id, options = {}) {
      if (!id) return;
      deleting.value = true;
      error.value = "";
      notice.value = "";
      try {
        await $fetch(`/api/personas-autorizadas/family/${id}`, { method: "DELETE" });
        const nextIndice = normalizeIndice(options.indice);
        annulTarget.value = null;
        await refresh();
        await refreshMarbeteReadiness();
        if (options.recapture) {
          openFreshCapture(nextIndice);
          notice.value = "Registro anulado. Captura la información correcta.";
        } else {
          notice.value = "Registro anulado.";
        }
      } catch (err) {
        const failure = err;
        error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || "No fue posible anular el registro.";
      } finally {
        deleting.value = false;
      }
    }
    function normalizeIndice(value) {
      const parsed = Number(Array.isArray(value) ? value[0] : value || 1);
      return parsed >= 1 && parsed <= 4 ? parsed : 1;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAutorizadasShell = __nuxt_component_0;
      const _component_FamilyPersonasPageHeader = __nuxt_component_1$1;
      const _component_FamilyPersonasIcon = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_FamilyPersonasSectionHeading = __nuxt_component_2;
      const _component_FamilyPersonasAmbassador = __nuxt_component_3;
      const _component_FamilyPersonasProcessedPhoto = __nuxt_component_2$1;
      const _component_FamilyPersonasTutorialVideo = __nuxt_component_7;
      const _component_FamilyPersonasModal = __nuxt_component_4;
      const _component_FamilyAuthorizedPersonEditor = __nuxt_component_9;
      _push(ssrRenderComponent(_component_FamilyPersonasAutorizadasShell, mergeProps({ title: "Personas autorizadas" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (downloadError.value) {
              _push2(`<p class="alert pa-download-alert" data-state="error" data-v-3ae9df42${_scopeId}>${ssrInterpolate(downloadError.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(loadError)) {
              _push2(`<div class="alert retry-alert" data-state="error" data-v-3ae9df42${_scopeId}><span data-v-3ae9df42${_scopeId}>No fue posible cargar Personas Autorizadas.</span><button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-personas-autorizadas" data-v-3ae9df42${_scopeId}>Reintentar</button></div>`);
            } else if (unref(pending)) {
              _push2(`<div class="card loading-row" data-product-loading data-state="loading" data-v-3ae9df42${_scopeId}>Cargando...</div>`);
            } else {
              _push2(`<!--[--><section class="pa-home-screen" data-product-panel="personas-home" data-v-3ae9df42${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasPageHeader, {
                eyebrow: levelLabel.value,
                title: "Personas autorizadas",
                description: `Gestiona de forma segura quién puede recoger a ${studentFirstName.value}.`,
                theme: theme.value,
                "ambassador-variant": "hero"
              }, {
                actions: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    if (expressSlot.value && !expressSlot.value.id) {
                      _push3(`<button class="hero-express-action" type="button" data-diagnostic-action="agregar-pase-express-hero" data-v-3ae9df42${_scopeId2}>`);
                      _push3(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "plus" }, null, _parent3, _scopeId2));
                      _push3(` Agregar pase express </button>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    if (!studentPhoto.value) {
                      _push3(ssrRenderComponent(_component_NuxtLink, {
                        class: "student-photo-callout",
                        to: "/familia/personas-autorizadas/credencializacion"
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`<span class="callout-icon" aria-hidden="true" data-v-3ae9df42${_scopeId3}>i</span><span class="callout-copy" data-v-3ae9df42${_scopeId3}><strong data-v-3ae9df42${_scopeId3}>Foto del alumno pendiente</strong><small data-v-3ae9df42${_scopeId3}>Sube la foto de ${ssrInterpolate(studentFirstName.value)} para generar los Husky Pass.</small></span><span class="callout-action" data-v-3ae9df42${_scopeId3}>Subir foto</span>`);
                          } else {
                            return [
                              createVNode("span", {
                                class: "callout-icon",
                                "aria-hidden": "true"
                              }, "i"),
                              createVNode("span", { class: "callout-copy" }, [
                                createVNode("strong", null, "Foto del alumno pendiente"),
                                createVNode("small", null, "Sube la foto de " + toDisplayString(studentFirstName.value) + " para generar los Husky Pass.", 1)
                              ]),
                              createVNode("span", { class: "callout-action" }, "Subir foto")
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else {
                      _push3(`<!---->`);
                    }
                  } else {
                    return [
                      expressSlot.value && !expressSlot.value.id ? (openBlock(), createBlock("button", {
                        key: 0,
                        class: "hero-express-action",
                        type: "button",
                        "data-diagnostic-action": "agregar-pase-express-hero",
                        onClick: ($event) => edit(expressSlot.value)
                      }, [
                        createVNode(_component_FamilyPersonasIcon, { name: "plus" }),
                        createTextVNode(" Agregar pase express ")
                      ], 8, ["onClick"])) : createCommentVNode("", true),
                      !studentPhoto.value ? (openBlock(), createBlock(_component_NuxtLink, {
                        key: 1,
                        class: "student-photo-callout",
                        to: "/familia/personas-autorizadas/credencializacion"
                      }, {
                        default: withCtx(() => [
                          createVNode("span", {
                            class: "callout-icon",
                            "aria-hidden": "true"
                          }, "i"),
                          createVNode("span", { class: "callout-copy" }, [
                            createVNode("strong", null, "Foto del alumno pendiente"),
                            createVNode("small", null, "Sube la foto de " + toDisplayString(studentFirstName.value) + " para generar los Husky Pass.", 1)
                          ]),
                          createVNode("span", { class: "callout-action" }, "Subir foto")
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<section class="authorized-section" data-product-panel="authorized-people"${ssrRenderAttr("data-state", completedCount.value ? "content" : "empty")} data-v-3ae9df42${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasSectionHeading, {
                title: "Personas autorizadas",
                description: "Registros permanentes y pase temporal.",
                meta: registeredPeopleLabel.value
              }, null, _parent2, _scopeId));
              if (!completedCount.value) {
                _push2(`<div class="empty-guidance" data-state="empty" data-v-3ae9df42${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasAmbassador, {
                  theme: theme.value,
                  variant: "empty",
                  compact: "",
                  decorative: ""
                }, null, _parent2, _scopeId));
                _push2(`<div data-v-3ae9df42${_scopeId}><strong data-v-3ae9df42${_scopeId}>Empieza con una persona autorizada</strong><span data-v-3ae9df42${_scopeId}>Captura sus datos y foto para habilitar su Husky Pass.</span></div></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="person-slots" aria-label="Espacios de personas autorizadas" data-v-3ae9df42${_scopeId}><!--[-->`);
              ssrRenderList(people.value, (person) => {
                _push2(`<article class="${ssrRenderClass([{ empty: !person.id, express: person.indice === 4 }, "person-slot-card"])}"${ssrRenderAttr("data-state", person.id ? "registered" : "available")}${ssrRenderAttr("data-slot", person.indice)} data-v-3ae9df42${_scopeId}>`);
                if (person.id && marbeteReady(person)) {
                  _push2(`<span class="slot-check" aria-label="Husky Pass listo" data-v-3ae9df42${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "check" }, null, _parent2, _scopeId));
                  _push2(`</span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (!person.id && person.indice === 4) {
                  _push2(`<span class="slot-badge" data-v-3ae9df42${_scopeId}>Nuevo</span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (!person.id && person.indice === 4) {
                  _push2(`<span class="express-preview" aria-hidden="true" data-v-3ae9df42${_scopeId}><span class="express-preview-screen" data-v-3ae9df42${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "check" }, null, _parent2, _scopeId));
                  _push2(`</span></span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<span class="person-photo"${ssrRenderAttr("data-empty", !person.id)} data-v-3ae9df42${_scopeId}>`);
                if (photoUrl(person)) {
                  _push2(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                    src: person.foto,
                    "processed-src": person.compressed_foto,
                    "auto-process": true,
                    "trust-stored-processed": true,
                    namespace: `pa-person-${person.id || person.indice}`,
                    alt: fullName(person)
                  }, null, _parent2, _scopeId));
                } else if (person.id) {
                  _push2(`<strong data-v-3ae9df42${_scopeId}>${ssrInterpolate(initials(person))}</strong>`);
                } else {
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, {
                    name: person.indice === 4 ? "marbete" : "authorized"
                  }, null, _parent2, _scopeId));
                }
                _push2(`</span><div class="person-meta" data-v-3ae9df42${_scopeId}><h3 data-v-3ae9df42${_scopeId}>${ssrInterpolate(slotTitle(person))}</h3><p data-v-3ae9df42${_scopeId}>${ssrInterpolate(slotSubtitle(person))}</p>`);
                if (!person.id && person.indice === 4) {
                  _push2(`<span class="express-description" data-v-3ae9df42${_scopeId}>Crea un pase temporal para una persona que recogerá a ${ssrInterpolate(studentFirstName.value)} una sola vez.</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><div class="slot-actions" data-v-3ae9df42${_scopeId}>`);
                if (person.id && marbeteReady(person)) {
                  _push2(`<button class="slot-btn slot-btn-primary" type="button"${ssrIncludeBooleanAttr(downloadingId.value === person.id) ? " disabled" : ""} data-diagnostic-action="descargar-husky-pass-persona" data-v-3ae9df42${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "download" }, null, _parent2, _scopeId));
                  _push2(` ${ssrInterpolate(downloadingId.value === person.id ? "Preparando..." : "Descargar Husky Pass")}</button>`);
                } else if (person.id) {
                  _push2(`<button class="slot-btn slot-btn-muted" type="button" disabled data-v-3ae9df42${_scopeId}>${ssrInterpolate(marbeteState(person))}</button>`);
                } else {
                  _push2(`<button class="slot-btn slot-btn-outline" type="button"${ssrRenderAttr("data-diagnostic-action", person.indice === 4 ? "agregar-pase-express" : "capturar-persona-autorizada")} data-v-3ae9df42${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "plus" }, null, _parent2, _scopeId));
                  _push2(` ${ssrInterpolate(person.indice === 4 ? "Agregar pase" : "Capturar")}</button>`);
                }
                if (person.id) {
                  _push2(`<button class="slot-btn slot-btn-danger-outline" type="button" data-diagnostic-action="abrir-anular-persona-autorizada" data-v-3ae9df42${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "trash" }, null, _parent2, _scopeId));
                  _push2(` Anular o reemplazar </button>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></article>`);
              });
              _push2(`<!--]--></div></section><section id="ayuda" class="support-panel" data-product-panel="personas-help-tutorial" data-v-3ae9df42${_scopeId}><article class="card tutorial-card" data-v-3ae9df42${_scopeId}><header class="section-head branded-head" data-v-3ae9df42${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasSectionHeading, {
                title: "Tutorial",
                description: "Aprende a crear, descargar y usar los Husky Pass."
              }, null, _parent2, _scopeId));
              _push2(`<div class="section-ambassador" aria-hidden="true" data-v-3ae9df42${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasAmbassador, {
                theme: theme.value,
                variant: "help",
                compact: "",
                contained: "",
                decorative: ""
              }, null, _parent2, _scopeId));
              _push2(`</div></header>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasTutorialVideo, {
                theme: theme.value,
                "video-id": "PMBQolTRysg",
                title: "Tutorial Personas Autorizadas"
              }, null, _parent2, _scopeId));
              _push2(`</article><article class="card faq-card" data-product-panel="faq" data-state="content" data-v-3ae9df42${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasSectionHeading, {
                title: "Preguntas frecuentes",
                description: faqIntro
              }, null, _parent2, _scopeId));
              _push2(`<!--[-->`);
              ssrRenderList(faqItems, (item, index2) => {
                _push2(`<button class="faq-item" type="button"${ssrRenderAttr("aria-expanded", openFaq.value === index2)} data-v-3ae9df42${_scopeId}><span data-v-3ae9df42${_scopeId}><strong data-v-3ae9df42${_scopeId}>${ssrInterpolate(item.question)}</strong>`);
                if (openFaq.value === index2) {
                  _push2(`<em data-v-3ae9df42${_scopeId}>${ssrInterpolate(item.answer)}</em>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</span><span class="faq-chevron" aria-hidden="true" data-v-3ae9df42${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "chevron" }, null, _parent2, _scopeId));
                _push2(`</span></button>`);
              });
              _push2(`<!--]-->`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                class: "faq-support-link",
                to: "/familia/personas-autorizadas/tutorial"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`¿Tienes otra pregunta? Consulta el centro de ayuda `);
                    _push3(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "arrow" }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createTextVNode("¿Tienes otra pregunta? Consulta el centro de ayuda "),
                      createVNode(_component_FamilyPersonasIcon, { name: "arrow" })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</article></section></section>`);
              if (editing.value) {
                _push2(ssrRenderComponent(_component_FamilyPersonasModal, {
                  title: unref(authorizedPersonLabel)(Number(editing.value.indice || 1)),
                  eyebrow: "Persona autorizada",
                  theme: theme.value,
                  "close-disabled": saving.value || editorBusy.value,
                  onClose: closeEditor
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_FamilyAuthorizedPersonEditor, {
                        key: editingKey.value,
                        person: editing.value,
                        label: unref(authorizedPersonLabel)(Number(editing.value.indice || 1)),
                        saving: saving.value,
                        "server-error": editorError.value,
                        onBusy: ($event) => editorBusy.value = $event,
                        onSave: save,
                        onCancel: closeEditor
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        (openBlock(), createBlock(_component_FamilyAuthorizedPersonEditor, {
                          key: editingKey.value,
                          person: editing.value,
                          label: unref(authorizedPersonLabel)(Number(editing.value.indice || 1)),
                          saving: saving.value,
                          "server-error": editorError.value,
                          onBusy: ($event) => editorBusy.value = $event,
                          onSave: save,
                          onCancel: closeEditor
                        }, null, 8, ["person", "label", "saving", "server-error", "onBusy"]))
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (annulTarget.value) {
                _push2(ssrRenderComponent(_component_FamilyPersonasModal, {
                  title: "Anular persona autorizada",
                  eyebrow: unref(authorizedPersonLabel)(Number(annulTarget.value.indice || 1)),
                  theme: theme.value,
                  onClose: ($event) => annulTarget.value = null
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<section class="delete-confirm" data-v-3ae9df42${_scopeId2}><p data-v-3ae9df42${_scopeId2}>${ssrInterpolate(fullName(annulTarget.value) || "Este registro")}</p><small data-v-3ae9df42${_scopeId2}>Al anularlo, la persona ya no podrá entregar o recoger al alumno. Para corregir datos o foto, anula el registro y captura uno nuevo.</small><div class="actions form-actions" data-v-3ae9df42${_scopeId2}><button class="btn btn-danger" type="button"${ssrIncludeBooleanAttr(deleting.value) ? " disabled" : ""} data-diagnostic-action="anular-y-recapturar-persona-autorizada" data-v-3ae9df42${_scopeId2}>${ssrInterpolate(deleting.value ? "Anulando..." : "Anular y capturar de nuevo")}</button><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(deleting.value) ? " disabled" : ""} data-diagnostic-action="anular-persona-autorizada" data-v-3ae9df42${_scopeId2}> Solo anular </button><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(deleting.value) ? " disabled" : ""} data-v-3ae9df42${_scopeId2}>Cancelar</button></div></section>`);
                    } else {
                      return [
                        createVNode("section", { class: "delete-confirm" }, [
                          createVNode("p", null, toDisplayString(fullName(annulTarget.value) || "Este registro"), 1),
                          createVNode("small", null, "Al anularlo, la persona ya no podrá entregar o recoger al alumno. Para corregir datos o foto, anula el registro y captura uno nuevo."),
                          createVNode("div", { class: "actions form-actions" }, [
                            createVNode("button", {
                              class: "btn btn-danger",
                              type: "button",
                              disabled: deleting.value,
                              "data-diagnostic-action": "anular-y-recapturar-persona-autorizada",
                              onClick: ($event) => remove(annulTarget.value.id, { recapture: true, indice: annulTarget.value.indice })
                            }, toDisplayString(deleting.value ? "Anulando..." : "Anular y capturar de nuevo"), 9, ["disabled", "onClick"]),
                            createVNode("button", {
                              class: "btn btn-secondary",
                              type: "button",
                              disabled: deleting.value,
                              "data-diagnostic-action": "anular-persona-autorizada",
                              onClick: ($event) => remove(annulTarget.value.id)
                            }, " Solo anular ", 8, ["disabled", "onClick"]),
                            createVNode("button", {
                              class: "btn btn-secondary",
                              type: "button",
                              disabled: deleting.value,
                              onClick: ($event) => annulTarget.value = null
                            }, "Cancelar", 8, ["disabled", "onClick"])
                          ])
                        ])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--]-->`);
            }
            if (error.value) {
              _push2(`<p class="alert" data-v-3ae9df42${_scopeId}>${ssrInterpolate(error.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (notice.value) {
              _push2(`<p class="notice" data-v-3ae9df42${_scopeId}>${ssrInterpolate(notice.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              downloadError.value ? (openBlock(), createBlock("p", {
                key: 0,
                class: "alert pa-download-alert",
                "data-state": "error"
              }, toDisplayString(downloadError.value), 1)) : createCommentVNode("", true),
              unref(loadError) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "alert retry-alert",
                "data-state": "error"
              }, [
                createVNode("span", null, "No fue posible cargar Personas Autorizadas."),
                createVNode("button", {
                  class: "btn btn-secondary",
                  type: "button",
                  "data-diagnostic-action": "reintentar-personas-autorizadas",
                  onClick: retryLoad
                }, "Reintentar")
              ])) : unref(pending) ? (openBlock(), createBlock("div", {
                key: 2,
                class: "card loading-row",
                "data-product-loading": "",
                "data-state": "loading"
              }, "Cargando...")) : (openBlock(), createBlock(Fragment, { key: 3 }, [
                createVNode("section", {
                  class: "pa-home-screen",
                  "data-product-panel": "personas-home"
                }, [
                  createVNode(_component_FamilyPersonasPageHeader, {
                    eyebrow: levelLabel.value,
                    title: "Personas autorizadas",
                    description: `Gestiona de forma segura quién puede recoger a ${studentFirstName.value}.`,
                    theme: theme.value,
                    "ambassador-variant": "hero"
                  }, {
                    actions: withCtx(() => [
                      expressSlot.value && !expressSlot.value.id ? (openBlock(), createBlock("button", {
                        key: 0,
                        class: "hero-express-action",
                        type: "button",
                        "data-diagnostic-action": "agregar-pase-express-hero",
                        onClick: ($event) => edit(expressSlot.value)
                      }, [
                        createVNode(_component_FamilyPersonasIcon, { name: "plus" }),
                        createTextVNode(" Agregar pase express ")
                      ], 8, ["onClick"])) : createCommentVNode("", true),
                      !studentPhoto.value ? (openBlock(), createBlock(_component_NuxtLink, {
                        key: 1,
                        class: "student-photo-callout",
                        to: "/familia/personas-autorizadas/credencializacion"
                      }, {
                        default: withCtx(() => [
                          createVNode("span", {
                            class: "callout-icon",
                            "aria-hidden": "true"
                          }, "i"),
                          createVNode("span", { class: "callout-copy" }, [
                            createVNode("strong", null, "Foto del alumno pendiente"),
                            createVNode("small", null, "Sube la foto de " + toDisplayString(studentFirstName.value) + " para generar los Husky Pass.", 1)
                          ]),
                          createVNode("span", { class: "callout-action" }, "Subir foto")
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    _: 1
                  }, 8, ["eyebrow", "description", "theme"]),
                  createVNode("section", {
                    class: "authorized-section",
                    "data-product-panel": "authorized-people",
                    "data-state": completedCount.value ? "content" : "empty"
                  }, [
                    createVNode(_component_FamilyPersonasSectionHeading, {
                      title: "Personas autorizadas",
                      description: "Registros permanentes y pase temporal.",
                      meta: registeredPeopleLabel.value
                    }, null, 8, ["meta"]),
                    !completedCount.value ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "empty-guidance",
                      "data-state": "empty"
                    }, [
                      createVNode(_component_FamilyPersonasAmbassador, {
                        theme: theme.value,
                        variant: "empty",
                        compact: "",
                        decorative: ""
                      }, null, 8, ["theme"]),
                      createVNode("div", null, [
                        createVNode("strong", null, "Empieza con una persona autorizada"),
                        createVNode("span", null, "Captura sus datos y foto para habilitar su Husky Pass.")
                      ])
                    ])) : createCommentVNode("", true),
                    createVNode("div", {
                      class: "person-slots",
                      "aria-label": "Espacios de personas autorizadas"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(people.value, (person) => {
                        return openBlock(), createBlock("article", {
                          key: person.indice,
                          class: ["person-slot-card", { empty: !person.id, express: person.indice === 4 }],
                          "data-state": person.id ? "registered" : "available",
                          "data-slot": person.indice
                        }, [
                          person.id && marbeteReady(person) ? (openBlock(), createBlock("span", {
                            key: 0,
                            class: "slot-check",
                            "aria-label": "Husky Pass listo"
                          }, [
                            createVNode(_component_FamilyPersonasIcon, { name: "check" })
                          ])) : createCommentVNode("", true),
                          !person.id && person.indice === 4 ? (openBlock(), createBlock("span", {
                            key: 1,
                            class: "slot-badge"
                          }, "Nuevo")) : createCommentVNode("", true),
                          !person.id && person.indice === 4 ? (openBlock(), createBlock("span", {
                            key: 2,
                            class: "express-preview",
                            "aria-hidden": "true"
                          }, [
                            createVNode("span", { class: "express-preview-screen" }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "check" })
                            ])
                          ])) : createCommentVNode("", true),
                          createVNode("span", {
                            class: "person-photo",
                            "data-empty": !person.id
                          }, [
                            photoUrl(person) ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                              key: 0,
                              src: person.foto,
                              "processed-src": person.compressed_foto,
                              "auto-process": true,
                              "trust-stored-processed": true,
                              namespace: `pa-person-${person.id || person.indice}`,
                              alt: fullName(person)
                            }, null, 8, ["src", "processed-src", "namespace", "alt"])) : person.id ? (openBlock(), createBlock("strong", { key: 1 }, toDisplayString(initials(person)), 1)) : (openBlock(), createBlock(_component_FamilyPersonasIcon, {
                              key: 2,
                              name: person.indice === 4 ? "marbete" : "authorized"
                            }, null, 8, ["name"]))
                          ], 8, ["data-empty"]),
                          createVNode("div", { class: "person-meta" }, [
                            createVNode("h3", null, toDisplayString(slotTitle(person)), 1),
                            createVNode("p", null, toDisplayString(slotSubtitle(person)), 1),
                            !person.id && person.indice === 4 ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "express-description"
                            }, "Crea un pase temporal para una persona que recogerá a " + toDisplayString(studentFirstName.value) + " una sola vez.", 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("div", {
                            class: "slot-actions",
                            onClick: withModifiers(() => {
                            }, ["stop"])
                          }, [
                            person.id && marbeteReady(person) ? (openBlock(), createBlock("button", {
                              key: 0,
                              class: "slot-btn slot-btn-primary",
                              type: "button",
                              disabled: downloadingId.value === person.id,
                              "data-diagnostic-action": "descargar-husky-pass-persona",
                              onClick: ($event) => downloadHuskyPass(person)
                            }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "download" }),
                              createTextVNode(" " + toDisplayString(downloadingId.value === person.id ? "Preparando..." : "Descargar Husky Pass"), 1)
                            ], 8, ["disabled", "onClick"])) : person.id ? (openBlock(), createBlock("button", {
                              key: 1,
                              class: "slot-btn slot-btn-muted",
                              type: "button",
                              disabled: ""
                            }, toDisplayString(marbeteState(person)), 1)) : (openBlock(), createBlock("button", {
                              key: 2,
                              class: "slot-btn slot-btn-outline",
                              type: "button",
                              "data-diagnostic-action": person.indice === 4 ? "agregar-pase-express" : "capturar-persona-autorizada",
                              onClick: ($event) => edit(person)
                            }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "plus" }),
                              createTextVNode(" " + toDisplayString(person.indice === 4 ? "Agregar pase" : "Capturar"), 1)
                            ], 8, ["data-diagnostic-action", "onClick"])),
                            person.id ? (openBlock(), createBlock("button", {
                              key: 3,
                              class: "slot-btn slot-btn-danger-outline",
                              type: "button",
                              "data-diagnostic-action": "abrir-anular-persona-autorizada",
                              onClick: ($event) => annulTarget.value = person
                            }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "trash" }),
                              createTextVNode(" Anular o reemplazar ")
                            ], 8, ["onClick"])) : createCommentVNode("", true)
                          ], 8, ["onClick"])
                        ], 10, ["data-state", "data-slot"]);
                      }), 128))
                    ])
                  ], 8, ["data-state"]),
                  createVNode("section", {
                    id: "ayuda",
                    class: "support-panel",
                    "data-product-panel": "personas-help-tutorial"
                  }, [
                    createVNode("article", { class: "card tutorial-card" }, [
                      createVNode("header", { class: "section-head branded-head" }, [
                        createVNode(_component_FamilyPersonasSectionHeading, {
                          title: "Tutorial",
                          description: "Aprende a crear, descargar y usar los Husky Pass."
                        }),
                        createVNode("div", {
                          class: "section-ambassador",
                          "aria-hidden": "true"
                        }, [
                          createVNode(_component_FamilyPersonasAmbassador, {
                            theme: theme.value,
                            variant: "help",
                            compact: "",
                            contained: "",
                            decorative: ""
                          }, null, 8, ["theme"])
                        ])
                      ]),
                      createVNode(_component_FamilyPersonasTutorialVideo, {
                        theme: theme.value,
                        "video-id": "PMBQolTRysg",
                        title: "Tutorial Personas Autorizadas"
                      }, null, 8, ["theme"])
                    ]),
                    createVNode("article", {
                      class: "card faq-card",
                      "data-product-panel": "faq",
                      "data-state": "content"
                    }, [
                      createVNode(_component_FamilyPersonasSectionHeading, {
                        title: "Preguntas frecuentes",
                        description: faqIntro
                      }),
                      (openBlock(), createBlock(Fragment, null, renderList(faqItems, (item, index2) => {
                        return createVNode("button", {
                          key: item.question,
                          class: "faq-item",
                          type: "button",
                          "aria-expanded": openFaq.value === index2,
                          onClick: ($event) => openFaq.value = openFaq.value === index2 ? null : index2
                        }, [
                          createVNode("span", null, [
                            createVNode("strong", null, toDisplayString(item.question), 1),
                            openFaq.value === index2 ? (openBlock(), createBlock("em", { key: 0 }, toDisplayString(item.answer), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("span", {
                            class: "faq-chevron",
                            "aria-hidden": "true"
                          }, [
                            createVNode(_component_FamilyPersonasIcon, { name: "chevron" })
                          ])
                        ], 8, ["aria-expanded", "onClick"]);
                      }), 64)),
                      createVNode(_component_NuxtLink, {
                        class: "faq-support-link",
                        to: "/familia/personas-autorizadas/tutorial"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("¿Tienes otra pregunta? Consulta el centro de ayuda "),
                          createVNode(_component_FamilyPersonasIcon, { name: "arrow" })
                        ]),
                        _: 1
                      })
                    ])
                  ])
                ]),
                editing.value ? (openBlock(), createBlock(_component_FamilyPersonasModal, {
                  key: 0,
                  title: unref(authorizedPersonLabel)(Number(editing.value.indice || 1)),
                  eyebrow: "Persona autorizada",
                  theme: theme.value,
                  "close-disabled": saving.value || editorBusy.value,
                  onClose: closeEditor
                }, {
                  default: withCtx(() => [
                    (openBlock(), createBlock(_component_FamilyAuthorizedPersonEditor, {
                      key: editingKey.value,
                      person: editing.value,
                      label: unref(authorizedPersonLabel)(Number(editing.value.indice || 1)),
                      saving: saving.value,
                      "server-error": editorError.value,
                      onBusy: ($event) => editorBusy.value = $event,
                      onSave: save,
                      onCancel: closeEditor
                    }, null, 8, ["person", "label", "saving", "server-error", "onBusy"]))
                  ]),
                  _: 1
                }, 8, ["title", "theme", "close-disabled"])) : createCommentVNode("", true),
                annulTarget.value ? (openBlock(), createBlock(_component_FamilyPersonasModal, {
                  key: 1,
                  title: "Anular persona autorizada",
                  eyebrow: unref(authorizedPersonLabel)(Number(annulTarget.value.indice || 1)),
                  theme: theme.value,
                  onClose: ($event) => annulTarget.value = null
                }, {
                  default: withCtx(() => [
                    createVNode("section", { class: "delete-confirm" }, [
                      createVNode("p", null, toDisplayString(fullName(annulTarget.value) || "Este registro"), 1),
                      createVNode("small", null, "Al anularlo, la persona ya no podrá entregar o recoger al alumno. Para corregir datos o foto, anula el registro y captura uno nuevo."),
                      createVNode("div", { class: "actions form-actions" }, [
                        createVNode("button", {
                          class: "btn btn-danger",
                          type: "button",
                          disabled: deleting.value,
                          "data-diagnostic-action": "anular-y-recapturar-persona-autorizada",
                          onClick: ($event) => remove(annulTarget.value.id, { recapture: true, indice: annulTarget.value.indice })
                        }, toDisplayString(deleting.value ? "Anulando..." : "Anular y capturar de nuevo"), 9, ["disabled", "onClick"]),
                        createVNode("button", {
                          class: "btn btn-secondary",
                          type: "button",
                          disabled: deleting.value,
                          "data-diagnostic-action": "anular-persona-autorizada",
                          onClick: ($event) => remove(annulTarget.value.id)
                        }, " Solo anular ", 8, ["disabled", "onClick"]),
                        createVNode("button", {
                          class: "btn btn-secondary",
                          type: "button",
                          disabled: deleting.value,
                          onClick: ($event) => annulTarget.value = null
                        }, "Cancelar", 8, ["disabled", "onClick"])
                      ])
                    ])
                  ]),
                  _: 1
                }, 8, ["eyebrow", "theme", "onClose"])) : createCommentVNode("", true)
              ], 64)),
              error.value ? (openBlock(), createBlock("p", {
                key: 4,
                class: "alert"
              }, toDisplayString(error.value), 1)) : createCommentVNode("", true),
              notice.value ? (openBlock(), createBlock("p", {
                key: 5,
                class: "notice"
              }, toDisplayString(notice.value), 1)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3ae9df42"]]);
export {
  index as default
};
//# sourceMappingURL=index-C0svSRIc.js.map
