import { _ as __nuxt_component_0, a as __nuxt_component_1 } from "./PersonasPageHeader-CbpYMeMe.js";
import { _ as __nuxt_component_2 } from "./PersonasProcessedPhoto-BWatNFQu.js";
import { _ as __nuxt_component_1$1 } from "./PersonasIcon-B5CnsWTN.js";
import { _ as __nuxt_component_4 } from "./PersonasModal-COKcp1xQ.js";
import { defineComponent, ref, reactive, computed, watch, mergeProps, withCtx, unref, createSlots, createVNode, openBlock, createBlock, toDisplayString, createTextVNode, withDirectives, Fragment, renderList, vModelSelect, createCommentVNode, withModifiers, vModelText, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { e as useRoute, i as useRouter, b as _export_sfc } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { n as normalizeAttendanceText, f as formatAttendanceDate } from "./attendance-D-E_6rKQ.js";
import { n as normalizeMatricula, a as displayMatricula } from "./matricula-C6apTRg-.js";
import { r as resolvePersonasTheme } from "./personasTheme-CJ7aLgiL.js";
import "./AccountMenu-Cc9CsO5z.js";
import "./_virtual_public-BTp6Nzoa.js";
import "./usePersonasTheme-CmVh5mbY.js";
import "./routeSession-DTQI2Jul.js";
import "./ssr-BC0VN6Ct.js";
import "C:/Users/hp/husky-pass-crm/node_modules/h3/dist/index.mjs";
import "./daycare-xTCL2ANB.js";
import "./useAppSession-D-b8QDDW.js";
import "@lucide/vue";
import "C:/Users/hp/husky-pass-crm/node_modules/ofetch/dist/node.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/unctx/dist/index.mjs";
import "vue-router";
import "C:/Users/hp/husky-pass-crm/node_modules/ufo/dist/index.mjs";
import "C:/Users/hp/husky-pass-crm/node_modules/ohash/dist/index.mjs";
import "@vue/shared";
import "C:/Users/hp/husky-pass-crm/node_modules/perfect-debounce/dist/index.mjs";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "asistencia",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const selectedMatricula = ref(normalizeMatricula(queryValue(route.query.matricula)));
    const selectedSchoolYear = ref(queryValue(route.query.schoolYear));
    const editingAbsence = ref(null);
    const selectedAccessAction = ref(null);
    const cycleDrawerOpen = ref(false);
    const historyExpanded = ref(false);
    const motivoDraft = ref("");
    const motivoError = ref("");
    const notice = ref("");
    const savingMotivo = ref(false);
    const failedAbsenceId = ref(null);
    const recordLimit = ref(12);
    const recordFilters = reactive({
      search: "",
      type: "all",
      month: "all"
    });
    const requestQuery = computed(() => ({
      matricula: selectedMatricula.value || void 0,
      schoolYear: selectedSchoolYear.value || void 0
    }));
    const { data, pending, error: loadError, refresh } = useFetch("/api/family/attendance", {
      query: requestQuery,
      timeout: 45e3,
      watch: [requestQuery],
      key: "family-attendance"
    });
    const children = computed(() => data.value?.children || []);
    const schoolYears = computed(() => data.value?.schoolYears || []);
    const absences = computed(() => [...data.value?.absences || []].sort((a, b) => b.date.localeCompare(a.date)));
    const missingAbsences = computed(() => absences.value.filter((absence) => absence.motivoState === "missing"));
    const attentionAbsences = computed(() => missingAbsences.value.slice(0, 2));
    const selectedChildLine = computed(() => [data.value?.selectedChild.nivelEdu, data.value?.selectedChild.grado, data.value?.selectedChild.grupo].filter(Boolean).join(" / ") || data.value?.selectedChild.plantelCode || "");
    const selectedSchoolYearLabel = computed(() => data.value?.selectedSchoolYear.label || selectedSchoolYear.value || "");
    const theme = computed(() => resolvePersonasTheme({
      matricula: data.value?.selectedChild.matricula || selectedMatricula.value,
      plantel: data.value?.selectedChild.plantel || data.value?.selectedChild.plantelCode,
      nivelEdu: data.value?.selectedChild.nivelEdu,
      campus: data.value?.selectedChild.campus
    }));
    const selectedChildPhoto = computed(() => String(data.value?.selectedChild.foto || "").trim());
    const latestAccessAction = computed(() => {
      const actions = (data.value?.accessHistory.days || []).flatMap((day) => day.actions || []).slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const action = actions[0];
      if (!action) return null;
      return { action, label: accessLabel(action) };
    });
    const firstPendingAbsence = computed(() => missingAbsences.value[0] || null);
    const emptyState = computed(() => Boolean(data.value && !data.value.calendarDays.length && !data.value.accessHistory.days.length && data.value.status !== "unavailable"));
    const pageState = computed(() => {
      if (loadError.value) return "error";
      if (pending.value && !data.value) return "loading";
      if (!data.value) return "empty";
      if (data.value.status === "unavailable") return "unavailable";
      if (emptyState.value) return "empty";
      return "content";
    });
    const sourceWarnings = computed(() => {
      const source = data.value?.source;
      if (!source) return [];
      const warnings = [];
      if (source.attendance !== "ready") warnings.push(source.attendanceMessage || "Asistencia no disponible.");
      if (source.tardiness !== "ready") warnings.push(source.tardinessMessage || "Retardos no disponibles.");
      return warnings;
    });
    const attendanceByDate = computed(() => new Map((data.value?.calendarDays || []).map((day) => [day.date, day])));
    const absenceByDate = computed(() => new Map((data.value?.absences || []).map((absence) => [absence.date, absence])));
    const tardiesByDate = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const tardy of data.value?.tardies || []) {
        const current = map.get(tardy.date) || [];
        current.push(tardy);
        map.set(tardy.date, current);
      }
      return map;
    });
    const accessByDate = computed(() => new Map((data.value?.accessHistory.days || []).map((day) => [day.date, day])));
    const expedienteRecords = computed(() => {
      const dates = /* @__PURE__ */ new Set([
        ...attendanceByDate.value.keys(),
        ...absenceByDate.value.keys(),
        ...tardiesByDate.value.keys(),
        ...accessByDate.value.keys()
      ]);
      return Array.from(dates).sort((a, b) => b.localeCompare(a)).map((date) => buildRecord(date));
    });
    const recentRecords = computed(() => expedienteRecords.value.slice(0, 6));
    const recordMonths = computed(() => {
      const formatter = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" });
      const seen = /* @__PURE__ */ new Set();
      return expedienteRecords.value.slice().sort((a, b) => a.date.localeCompare(b.date)).map((record) => record.date.slice(0, 7)).filter((key) => {
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).map((key) => ({ key, label: formatter.format(/* @__PURE__ */ new Date(`${key}-15T12:00:00`)) }));
    });
    const filteredRecords = computed(() => {
      const search = normalizeAttendanceText(recordFilters.search);
      return expedienteRecords.value.filter((record) => {
        if (recordFilters.month !== "all" && record.date.slice(0, 7) !== recordFilters.month) return false;
        if (recordFilters.type === "absence" && !record.absence) return false;
        if (recordFilters.type === "missing" && record.absence?.motivoState !== "missing") return false;
        if (recordFilters.type === "provided" && record.absence?.motivoState !== "provided") return false;
        if (recordFilters.type === "tardy" && !record.tardies.length) return false;
        if (recordFilters.type === "access" && !record.accessDay) return false;
        if (!search) return true;
        return record.searchText.includes(search);
      });
    });
    const visibleRecords = computed(() => filteredRecords.value.slice(0, recordLimit.value));
    const canShowMoreRecords = computed(() => filteredRecords.value.length > visibleRecords.value.length);
    const filterOptions = computed(() => {
      const all = expedienteRecords.value;
      const count = (predicate) => all.filter(predicate).length;
      return [
        { value: "all", label: "Todo", count: all.length },
        { value: "missing", label: "Sin motivo", count: count((record) => record.absence?.motivoState === "missing") },
        { value: "absence", label: "Ausencias", count: count((record) => Boolean(record.absence)) },
        { value: "tardy", label: "Retardos", count: count((record) => record.tardies.length > 0) },
        { value: "access", label: "Entradas y salidas", count: count((record) => Boolean(record.accessDay)) },
        { value: "provided", label: "Con motivo", count: count((record) => record.absence?.motivoState === "provided") }
      ];
    });
    watch(data, (value) => {
      if (!value) return;
      if (!selectedMatricula.value) selectedMatricula.value = normalizeMatricula(value.selectedChild.matricula);
      if (!selectedSchoolYear.value) selectedSchoolYear.value = value.selectedSchoolYear.label;
      recordLimit.value = 12;
    }, { immediate: true });
    watch(() => [recordFilters.search, recordFilters.type, recordFilters.month], () => {
      recordLimit.value = 12;
    });
    function buildRecord(date) {
      const day = attendanceByDate.value.get(date);
      const absence = absenceByDate.value.get(date);
      const recordTardies = (tardiesByDate.value.get(date) || []).slice().sort((a, b) => a.time.localeCompare(b.time));
      const accessDay = accessByDate.value.get(date);
      const status = day?.status || (accessDay ? "access-only" : "clear");
      const tone = recordTone(status, absence);
      const label = recordLabel(status, absence);
      const accessText = accessDay?.actions.map((action) => `${action.type} ${action.time} ${action.person.name} ${action.person.parentesco || ""}`).join(" ") || "";
      const tardyText = recordTardies.map((tardy) => `${tardy.time} ${tardy.minutesLate} minutos tarde limite ${tardy.thresholdTime}`).join(" ");
      const searchText = normalizeAttendanceText([
        date,
        dateLabel(date),
        label,
        absence?.motivo,
        absence?.studentName,
        tardyText,
        accessText,
        data.value?.selectedChild.matricula,
        data.value?.selectedChild.name
      ].filter(Boolean).join(" "));
      return {
        key: `record-${date}`,
        date,
        status,
        tone,
        label,
        absence,
        tardies: recordTardies,
        accessDay,
        searchText
      };
    }
    function recordTone(status, absence) {
      if (status === "absence-tardy") return "combined";
      if (status === "absence") return absence?.motivoState === "provided" ? "provided" : "missing";
      if (status === "tardy") return "tardy";
      if (status === "access-only") return "access";
      return "clear";
    }
    function recordLabel(status, absence) {
      if (status === "absence-tardy") return "Ausencia y retardo";
      if (status === "absence") return absence?.motivoState === "provided" ? "Ausencia con motivo" : "Ausencia sin motivo";
      if (status === "tardy") return "Retardo";
      if (status === "access-only") return "Entrada/salida";
      return "Presente";
    }
    function queryValue(value) {
      if (Array.isArray(value)) return String(value[0] || "").trim();
      return String(value || "").trim();
    }
    function syncRoute() {
      notice.value = "";
      motivoError.value = "";
      failedAbsenceId.value = null;
      recordFilters.search = "";
      recordFilters.type = "all";
      recordFilters.month = "all";
      router.replace({
        path: route.path,
        query: {
          ...route.query,
          matricula: normalizeMatricula(selectedMatricula.value) || void 0,
          schoolYear: selectedSchoolYear.value || void 0
        }
      });
    }
    function selectSchoolYear(year) {
      selectedSchoolYear.value = year;
      cycleDrawerOpen.value = false;
      syncRoute();
    }
    function dateLabel(date) {
      return formatAttendanceDate(date);
    }
    function dayNumber(date) {
      return String(Number(date.slice(8, 10)) || "");
    }
    function monthShort(date) {
      return new Intl.DateTimeFormat("es-MX", { month: "short" }).format(/* @__PURE__ */ new Date(`${date}T12:00:00`));
    }
    function weekDay(date) {
      return new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(/* @__PURE__ */ new Date(`${date}T12:00:00`));
    }
    function initials(name) {
      return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "A";
    }
    function openMotivo(absence) {
      editingAbsence.value = absence;
      motivoDraft.value = absence.motivo || "";
      motivoError.value = "";
      notice.value = "";
    }
    function closeMotivo() {
      editingAbsence.value = null;
      motivoDraft.value = "";
      motivoError.value = "";
    }
    function openAccessDetail(action, label) {
      selectedAccessAction.value = { action, label };
    }
    function accessLabel(action) {
      return action.type === "salida" ? "Salida" : "Entrada";
    }
    function primaryAccessAction(record) {
      return record.accessDay?.salida || record.accessDay?.entrada || null;
    }
    function openPrimaryAccessDetail(record) {
      const action = primaryAccessAction(record);
      if (!action) return;
      openAccessDetail(action, accessLabel(action));
    }
    function recordStatusDetail(record) {
      if (record.absence) return record.absence.motivo || "Sin motivo";
      if (record.tardies.length) {
        const tardy = record.tardies[0];
        return `${tardy.minutesLate} min tarde${tardy.time ? ` · Entrada ${tardy.time}` : ""}`;
      }
      if (record.accessDay && record.status === "access-only") return "Acceso registrado";
      return "Sin incidencias";
    }
    async function saveMotivo() {
      if (!editingAbsence.value || !data.value) return;
      savingMotivo.value = true;
      motivoError.value = "";
      notice.value = "";
      failedAbsenceId.value = null;
      try {
        await $fetch("/api/family/attendance/motivo", {
          method: "POST",
          body: {
            matricula: data.value.selectedChild.matricula,
            schoolYear: data.value.selectedSchoolYear.label,
            absenceId: editingAbsence.value.id,
            motivo: motivoDraft.value
          }
        });
        closeMotivo();
        await refresh();
        notice.value = "Motivo guardado.";
      } catch (err) {
        const failure = err;
        failedAbsenceId.value = editingAbsence.value.id;
        motivoError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || "No fue posible guardar el motivo.";
      } finally {
        savingMotivo.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAutorizadasShell = __nuxt_component_0;
      const _component_FamilyPersonasPageHeader = __nuxt_component_1;
      const _component_FamilyPersonasProcessedPhoto = __nuxt_component_2;
      const _component_FamilyPersonasIcon = __nuxt_component_1$1;
      const _component_FamilyPersonasModal = __nuxt_component_4;
      _push(ssrRenderComponent(_component_FamilyPersonasAutorizadasShell, mergeProps({ title: "Asistencia y accesos" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<section class="attendance-page"${ssrRenderAttr("data-state", pageState.value)} data-product-panel="family-attendance-bitacora" data-v-4cf19162${_scopeId}>`);
            _push2(ssrRenderComponent(_component_FamilyPersonasPageHeader, {
              eyebrow: "Asistencia y accesos",
              title: unref(data)?.selectedChild.name || "Asistencia y accesos",
              description: selectedChildLine.value || unref(displayMatricula)(unref(data)?.selectedChild.matricula || ""),
              "show-ambassador": false
            }, createSlots({
              visual: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="student-avatar"${ssrRenderAttr("data-has-photo", Boolean(selectedChildPhoto.value))} data-v-4cf19162${_scopeId2}>`);
                  if (selectedChildPhoto.value) {
                    _push3(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                      src: selectedChildPhoto.value,
                      namespace: "attendance-student-photo",
                      alt: unref(data)?.selectedChild.name || "Alumno",
                      loading: "eager"
                    }, null, _parent3, _scopeId2));
                  } else {
                    _push3(`<span data-v-4cf19162${_scopeId2}>${ssrInterpolate(unref(data) ? initials(unref(data).selectedChild.name) : "A")}</span>`);
                  }
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", {
                      class: "student-avatar",
                      "data-has-photo": Boolean(selectedChildPhoto.value)
                    }, [
                      selectedChildPhoto.value ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                        key: 0,
                        src: selectedChildPhoto.value,
                        namespace: "attendance-student-photo",
                        alt: unref(data)?.selectedChild.name || "Alumno",
                        loading: "eager"
                      }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(unref(data) ? initials(unref(data).selectedChild.name) : "A"), 1))
                    ], 8, ["data-has-photo"])
                  ];
                }
              }),
              _: 2
            }, [
              unref(data) ? {
                name: "actions",
                fn: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="hero-controls" aria-label="Contexto de asistencia" data-v-4cf19162${_scopeId2}><button class="cycle-pill" type="button" data-testid="attendance-open-cycles" data-v-4cf19162${_scopeId2}>`);
                    _push3(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "calendar" }, null, _parent3, _scopeId2));
                    _push3(`<span data-v-4cf19162${_scopeId2}><small data-v-4cf19162${_scopeId2}>Este ciclo escolar</small><strong data-v-4cf19162${_scopeId2}>${ssrInterpolate(selectedSchoolYearLabel.value)}</strong></span>`);
                    _push3(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "chevron" }, null, _parent3, _scopeId2));
                    _push3(`</button><button class="btn btn-secondary history-button" type="button" data-v-4cf19162${_scopeId2}> Ciclos anteriores `);
                    _push3(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "arrow" }, null, _parent3, _scopeId2));
                    _push3(`</button>`);
                    if (children.value.length > 1) {
                      _push3(`<label class="compact-select" data-v-4cf19162${_scopeId2}><span data-v-4cf19162${_scopeId2}>Alumno</span><select class="select" data-testid="attendance-child-select" data-v-4cf19162${_scopeId2}><!--[-->`);
                      ssrRenderList(children.value, (child) => {
                        _push3(`<option${ssrRenderAttr("value", child.matricula)} data-v-4cf19162${ssrIncludeBooleanAttr(Array.isArray(selectedMatricula.value) ? ssrLooseContain(selectedMatricula.value, child.matricula) : ssrLooseEqual(selectedMatricula.value, child.matricula)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(child.name)}</option>`);
                      });
                      _push3(`<!--]--></select></label>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`</div>`);
                  } else {
                    return [
                      createVNode("div", {
                        class: "hero-controls",
                        "aria-label": "Contexto de asistencia"
                      }, [
                        createVNode("button", {
                          class: "cycle-pill",
                          type: "button",
                          "data-testid": "attendance-open-cycles",
                          onClick: ($event) => cycleDrawerOpen.value = true
                        }, [
                          createVNode(_component_FamilyPersonasIcon, { name: "calendar" }),
                          createVNode("span", null, [
                            createVNode("small", null, "Este ciclo escolar"),
                            createVNode("strong", null, toDisplayString(selectedSchoolYearLabel.value), 1)
                          ]),
                          createVNode(_component_FamilyPersonasIcon, { name: "chevron" })
                        ], 8, ["onClick"]),
                        createVNode("button", {
                          class: "btn btn-secondary history-button",
                          type: "button",
                          onClick: ($event) => cycleDrawerOpen.value = true
                        }, [
                          createTextVNode(" Ciclos anteriores "),
                          createVNode(_component_FamilyPersonasIcon, { name: "arrow" })
                        ], 8, ["onClick"]),
                        children.value.length > 1 ? (openBlock(), createBlock("label", {
                          key: 0,
                          class: "compact-select"
                        }, [
                          createVNode("span", null, "Alumno"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => selectedMatricula.value = $event,
                            class: "select",
                            "data-testid": "attendance-child-select",
                            onChange: syncRoute
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(children.value, (child) => {
                              return openBlock(), createBlock("option", {
                                key: child.matricula,
                                value: child.matricula
                              }, toDisplayString(child.name), 9, ["value"]);
                            }), 128))
                          ], 40, ["onUpdate:modelValue"]), [
                            [vModelSelect, selectedMatricula.value]
                          ])
                        ])) : createCommentVNode("", true)
                      ])
                    ];
                  }
                }),
                key: "0"
              } : void 0
            ]), _parent2, _scopeId));
            if (unref(loadError)) {
              _push2(`<p class="alert" data-state="error" data-v-4cf19162${_scopeId}>No fue posible abrir la bitácora de asistencia.</p>`);
            } else if (unref(pending) && !unref(data)) {
              _push2(`<section class="loading-layout" data-state="loading" data-v-4cf19162${_scopeId}><!--[-->`);
              ssrRenderList(6, (item) => {
                _push2(`<span class="loading-card" data-v-4cf19162${_scopeId}></span>`);
              });
              _push2(`<!--]--></section>`);
            } else if (unref(data)) {
              _push2(`<!--[-->`);
              if (sourceWarnings.value.length) {
                _push2(`<section class="source-strip"${ssrRenderAttr("data-state", unref(data).status)} data-v-4cf19162${_scopeId}><!--[-->`);
                ssrRenderList(sourceWarnings.value, (warning) => {
                  _push2(`<span data-v-4cf19162${_scopeId}>${ssrInterpolate(warning)}</span>`);
                });
                _push2(`<!--]--></section>`);
              } else {
                _push2(`<!---->`);
              }
              if (emptyState.value) {
                _push2(`<section class="empty-expediente card" data-state="empty" data-v-4cf19162${_scopeId}><div class="empty-mark" data-v-4cf19162${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "calendar" }, null, _parent2, _scopeId));
                _push2(`</div><div data-v-4cf19162${_scopeId}><p class="eyebrow" data-v-4cf19162${_scopeId}>${ssrInterpolate(selectedSchoolYearLabel.value)}</p><h2 data-v-4cf19162${_scopeId}>Sin registros para este ciclo escolar</h2><p data-v-4cf19162${_scopeId}>Cuando haya asistencia, ausencias, retardos o entradas y salidas, aparecerán aquí.</p></div></section>`);
              } else {
                _push2(`<!--[--><section class="priority-grid" aria-label="Estado principal de asistencia" data-v-4cf19162${_scopeId}><article class="attention-card card"${ssrRenderAttr("data-state", missingAbsences.value.length ? "pending" : "clear")} data-v-4cf19162${_scopeId}><div class="attention-icon" data-v-4cf19162${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, {
                  name: missingAbsences.value.length ? "alert" : "check"
                }, null, _parent2, _scopeId));
                _push2(`</div><div class="attention-copy-main" data-v-4cf19162${_scopeId}><p class="eyebrow" data-v-4cf19162${_scopeId}>${ssrInterpolate(missingAbsences.value.length ? "Por atender" : "Todo en orden")}</p><h2 data-v-4cf19162${_scopeId}>${ssrInterpolate(missingAbsences.value.length ? `${missingAbsences.value.length} ausencia${missingAbsences.value.length === 1 ? "" : "s"} por justificar` : "Sin ausencias pendientes")}</h2><p data-v-4cf19162${_scopeId}>${ssrInterpolate(firstPendingAbsence.value ? `Próxima: ${dateLabel(firstPendingAbsence.value.date)}` : "No hay motivos pendientes para este ciclo.")}</p>`);
                if (firstPendingAbsence.value) {
                  _push2(`<button class="btn btn-primary attention-primary" type="button" data-v-4cf19162${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "edit" }, null, _parent2, _scopeId));
                  _push2(` Agregar motivo </button>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
                if (attentionAbsences.value.length) {
                  _push2(`<div class="attention-preview-list" data-v-4cf19162${_scopeId}><!--[-->`);
                  ssrRenderList(attentionAbsences.value, (absence) => {
                    _push2(`<button class="attention-preview-row" type="button" data-v-4cf19162${_scopeId}><span class="date-tile soft-danger" data-v-4cf19162${_scopeId}><strong data-v-4cf19162${_scopeId}>${ssrInterpolate(dayNumber(absence.date))}</strong><small data-v-4cf19162${_scopeId}>${ssrInterpolate(monthShort(absence.date))}</small></span><span data-v-4cf19162${_scopeId}><strong data-v-4cf19162${_scopeId}>Ausencia</strong><small data-v-4cf19162${_scopeId}>${ssrInterpolate(absence.motivo || "sin motivo")}</small></span>`);
                    _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "chevron" }, null, _parent2, _scopeId));
                    _push2(`</button>`);
                  });
                  _push2(`<!--]--></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</article><article class="latest-access-card card"${ssrRenderAttr("data-state", latestAccessAction.value ? "ready" : "empty")} data-v-4cf19162${_scopeId}><div class="latest-copy" data-v-4cf19162${_scopeId}><div class="latest-title-row" data-v-4cf19162${_scopeId}><span class="latest-icon" data-v-4cf19162${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "check" }, null, _parent2, _scopeId));
                _push2(`</span><div data-v-4cf19162${_scopeId}><p class="eyebrow" data-v-4cf19162${_scopeId}>Último acceso registrado</p>`);
                if (latestAccessAction.value) {
                  _push2(`<h2 data-v-4cf19162${_scopeId}>${ssrInterpolate(latestAccessAction.value.label)} · ${ssrInterpolate(dateLabel(latestAccessAction.value.action.date))}</h2>`);
                } else {
                  _push2(`<h2 data-v-4cf19162${_scopeId}>Sin accesos recientes</h2>`);
                }
                _push2(`</div></div>`);
                if (latestAccessAction.value) {
                  _push2(`<!--[--><strong class="latest-time" data-v-4cf19162${_scopeId}>${ssrInterpolate(latestAccessAction.value.action.time)}</strong><div class="latest-person" data-v-4cf19162${_scopeId}><span class="person-thumb" data-v-4cf19162${_scopeId}>`);
                  if (latestAccessAction.value.action.person.photoUrl) {
                    _push2(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                      src: latestAccessAction.value.action.person.photoUrl,
                      "auto-process": false,
                      namespace: `latest-access-${latestAccessAction.value.action.id}`,
                      alt: latestAccessAction.value.action.person.name
                    }, null, _parent2, _scopeId));
                  } else {
                    _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "person" }, null, _parent2, _scopeId));
                  }
                  _push2(`</span><span data-v-4cf19162${_scopeId}><strong data-v-4cf19162${_scopeId}>${ssrInterpolate(latestAccessAction.value.action.person.name)}</strong><small data-v-4cf19162${_scopeId}>${ssrInterpolate(latestAccessAction.value.action.person.parentesco || "Persona autorizada")}</small></span></div><!--]-->`);
                } else {
                  _push2(`<p class="quiet-copy" data-v-4cf19162${_scopeId}>Cuando haya entrada o salida registrada, aparecerá aquí.</p>`);
                }
                _push2(`</div>`);
                if (latestAccessAction.value) {
                  _push2(`<button class="btn btn-secondary latest-action" type="button" data-v-4cf19162${_scopeId}> Ver registro </button>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</article></section><section class="bitacora-panel card" data-product-panel="attendance-day-records" data-v-4cf19162${_scopeId}><header class="bitacora-header" data-v-4cf19162${_scopeId}><div data-v-4cf19162${_scopeId}><p class="eyebrow" data-v-4cf19162${_scopeId}>Bitácora reciente</p><h2 data-v-4cf19162${_scopeId}>Asistencia y accesos</h2></div><div class="legend-row" aria-label="Estados de asistencia" data-v-4cf19162${_scopeId}><span data-v-4cf19162${_scopeId}><i class="legend-dot clear" data-v-4cf19162${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "check" }, null, _parent2, _scopeId));
                _push2(`</i>Presente</span><span data-v-4cf19162${_scopeId}><i class="legend-dot tardy" data-v-4cf19162${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "clock" }, null, _parent2, _scopeId));
                _push2(`</i>Retardo</span><span data-v-4cf19162${_scopeId}><i class="legend-dot missing" data-v-4cf19162${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "alert" }, null, _parent2, _scopeId));
                _push2(`</i>Ausencia</span><span data-v-4cf19162${_scopeId}><i class="legend-dot entry" data-v-4cf19162${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "entry" }, null, _parent2, _scopeId));
                _push2(`</i>Entrada</span><span data-v-4cf19162${_scopeId}><i class="legend-dot exit" data-v-4cf19162${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "exit" }, null, _parent2, _scopeId));
                _push2(`</i>Salida</span></div><button class="btn btn-secondary full-history-button" type="button" data-v-4cf19162${_scopeId}>${ssrInterpolate(historyExpanded.value ? "Ocultar historial" : "Ver historial completo")} `);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "arrow" }, null, _parent2, _scopeId));
                _push2(`</button></header>`);
                if (recentRecords.value.length) {
                  _push2(`<div class="bitacora-list" data-v-4cf19162${_scopeId}><!--[-->`);
                  ssrRenderList(recentRecords.value, (record) => {
                    _push2(`<article class="bitacora-row"${ssrRenderAttr("data-state", record.tone)} data-v-4cf19162${_scopeId}><div class="${ssrRenderClass([record.tone, "date-tile"])}" data-v-4cf19162${_scopeId}><span data-v-4cf19162${_scopeId}>${ssrInterpolate(weekDay(record.date))}</span><strong data-v-4cf19162${_scopeId}>${ssrInterpolate(dayNumber(record.date))}</strong><small data-v-4cf19162${_scopeId}>${ssrInterpolate(monthShort(record.date))}</small></div><div class="status-cell" data-v-4cf19162${_scopeId}><span class="${ssrRenderClass([record.tone, "status-symbol"])}" data-v-4cf19162${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_FamilyPersonasIcon, {
                      name: record.tone === "tardy" || record.tone === "combined" ? "clock" : record.tone === "missing" || record.tone === "provided" ? "alert" : "check"
                    }, null, _parent2, _scopeId));
                    _push2(`</span><span class="status-copy" data-v-4cf19162${_scopeId}><strong data-v-4cf19162${_scopeId}>${ssrInterpolate(record.label)}</strong><small data-v-4cf19162${_scopeId}>${ssrInterpolate(recordStatusDetail(record))}</small></span></div><div class="access-cell"${ssrRenderAttr("data-state", record.accessDay?.entrada ? "ready" : "missing")} data-v-4cf19162${_scopeId}><span class="access-symbol entry" data-v-4cf19162${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "entry" }, null, _parent2, _scopeId));
                    _push2(`</span><span class="access-copy" data-v-4cf19162${_scopeId}><strong data-v-4cf19162${_scopeId}>Entrada</strong><small data-v-4cf19162${_scopeId}>${ssrInterpolate(record.accessDay?.entrada?.time || "Sin registro")}</small>`);
                    if (record.accessDay?.entrada) {
                      _push2(`<span class="access-person-inline" data-v-4cf19162${_scopeId}><span class="person-thumb mini" data-v-4cf19162${_scopeId}>`);
                      if (record.accessDay.entrada.person.photoUrl) {
                        _push2(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                          src: record.accessDay.entrada.person.photoUrl,
                          "auto-process": false,
                          namespace: `record-entry-${record.accessDay.entrada.id}`,
                          alt: record.accessDay.entrada.person.name
                        }, null, _parent2, _scopeId));
                      } else {
                        _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "person" }, null, _parent2, _scopeId));
                      }
                      _push2(`</span><span data-v-4cf19162${_scopeId}><b data-v-4cf19162${_scopeId}>${ssrInterpolate(record.accessDay.entrada.person.name)}</b><em data-v-4cf19162${_scopeId}>${ssrInterpolate(record.accessDay.entrada.person.parentesco || "Persona autorizada")}</em></span></span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</span></div><div class="access-cell"${ssrRenderAttr("data-state", record.accessDay?.salida ? "ready" : "missing")} data-v-4cf19162${_scopeId}><span class="access-symbol exit" data-v-4cf19162${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "exit" }, null, _parent2, _scopeId));
                    _push2(`</span><span class="access-copy" data-v-4cf19162${_scopeId}><strong data-v-4cf19162${_scopeId}>Salida</strong><small data-v-4cf19162${_scopeId}>${ssrInterpolate(record.accessDay?.salida?.time || "Sin registro")}</small>`);
                    if (record.accessDay?.salida) {
                      _push2(`<span class="access-person-inline" data-v-4cf19162${_scopeId}><span class="person-thumb mini" data-v-4cf19162${_scopeId}>`);
                      if (record.accessDay.salida.person.photoUrl) {
                        _push2(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                          src: record.accessDay.salida.person.photoUrl,
                          "auto-process": false,
                          namespace: `record-exit-${record.accessDay.salida.id}`,
                          alt: record.accessDay.salida.person.name
                        }, null, _parent2, _scopeId));
                      } else {
                        _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "person" }, null, _parent2, _scopeId));
                      }
                      _push2(`</span><span data-v-4cf19162${_scopeId}><b data-v-4cf19162${_scopeId}>${ssrInterpolate(record.accessDay.salida.person.name)}</b><em data-v-4cf19162${_scopeId}>${ssrInterpolate(record.accessDay.salida.person.parentesco || "Persona autorizada")}</em></span></span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</span></div><div class="row-actions" data-v-4cf19162${_scopeId}>`);
                    if (record.absence) {
                      _push2(`<button class="btn btn-secondary row-action danger" type="button" data-v-4cf19162${_scopeId}>`);
                      _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "edit" }, null, _parent2, _scopeId));
                      _push2(` ${ssrInterpolate(record.absence.motivo ? "Actualizar motivo" : "Agregar motivo")}</button>`);
                    } else if (primaryAccessAction(record)) {
                      _push2(`<button class="btn btn-secondary row-action" type="button" data-v-4cf19162${_scopeId}> Ver registro </button>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</div></article>`);
                  });
                  _push2(`<!--]--></div>`);
                } else {
                  _push2(`<p class="quiet-empty" data-v-4cf19162${_scopeId}>Sin registros recientes para este ciclo.</p>`);
                }
                _push2(`</section>`);
                if (historyExpanded.value) {
                  _push2(`<section class="history-panel card" data-product-panel="attendance-history" data-v-4cf19162${_scopeId}><header class="section-head history-head" data-v-4cf19162${_scopeId}><div data-v-4cf19162${_scopeId}><p class="eyebrow" data-v-4cf19162${_scopeId}>Historial completo</p><h2 data-v-4cf19162${_scopeId}>${ssrInterpolate(filteredRecords.value.length)} registro${ssrInterpolate(filteredRecords.value.length === 1 ? "" : "s")}</h2></div></header><section class="record-filters" aria-label="Buscar y filtrar bitácora" data-v-4cf19162${_scopeId}><label class="control-label search-control" data-v-4cf19162${_scopeId}><span data-v-4cf19162${_scopeId}>Buscar</span><input${ssrRenderAttr("value", recordFilters.search)} class="input" type="search" placeholder="Fecha, persona, ausencia, retardo o matrícula" data-testid="attendance-record-search" data-v-4cf19162${_scopeId}></label><label class="control-label" data-v-4cf19162${_scopeId}><span data-v-4cf19162${_scopeId}>Mes</span><select class="select" data-testid="attendance-month-filter" data-v-4cf19162${_scopeId}><option value="all" data-v-4cf19162${ssrIncludeBooleanAttr(Array.isArray(recordFilters.month) ? ssrLooseContain(recordFilters.month, "all") : ssrLooseEqual(recordFilters.month, "all")) ? " selected" : ""}${_scopeId}>Todo el ciclo</option><!--[-->`);
                  ssrRenderList(recordMonths.value, (month) => {
                    _push2(`<option${ssrRenderAttr("value", month.key)} data-v-4cf19162${ssrIncludeBooleanAttr(Array.isArray(recordFilters.month) ? ssrLooseContain(recordFilters.month, month.key) : ssrLooseEqual(recordFilters.month, month.key)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(month.label)}</option>`);
                  });
                  _push2(`<!--]--></select></label></section><div class="filter-chips" aria-label="Tipo de registro" data-v-4cf19162${_scopeId}><!--[-->`);
                  ssrRenderList(filterOptions.value, (option) => {
                    _push2(`<button class="${ssrRenderClass([{ active: recordFilters.type === option.value }, "filter-chip"])}" type="button"${ssrRenderAttr("data-testid", `attendance-filter-${option.value}`)} data-v-4cf19162${_scopeId}><span data-v-4cf19162${_scopeId}>${ssrInterpolate(option.label)}</span><strong data-v-4cf19162${_scopeId}>${ssrInterpolate(option.count)}</strong></button>`);
                  });
                  _push2(`<!--]--></div>`);
                  if (visibleRecords.value.length) {
                    _push2(`<div class="history-list" data-v-4cf19162${_scopeId}><!--[-->`);
                    ssrRenderList(visibleRecords.value, (record) => {
                      _push2(`<article class="history-row"${ssrRenderAttr("data-state", record.tone)} data-v-4cf19162${_scopeId}><div class="${ssrRenderClass([record.tone, "date-tile mini"])}" data-v-4cf19162${_scopeId}><strong data-v-4cf19162${_scopeId}>${ssrInterpolate(dayNumber(record.date))}</strong><span data-v-4cf19162${_scopeId}>${ssrInterpolate(monthShort(record.date))}</span></div><div class="history-main" data-v-4cf19162${_scopeId}><div class="history-title" data-v-4cf19162${_scopeId}><strong data-v-4cf19162${_scopeId}>${ssrInterpolate(dateLabel(record.date))}</strong><span class="${ssrRenderClass([record.tone, "status-chip"])}" data-v-4cf19162${_scopeId}>${ssrInterpolate(record.label)}</span></div><div class="history-events" data-v-4cf19162${_scopeId}>`);
                      if (record.absence) {
                        _push2(`<span data-v-4cf19162${_scopeId}>${ssrInterpolate(record.absence.motivo || "Motivo pendiente")}</span>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      if (record.tardies.length) {
                        _push2(`<span data-v-4cf19162${_scopeId}>${ssrInterpolate(record.tardies.length)} retardo${ssrInterpolate(record.tardies.length === 1 ? "" : "s")}</span>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      if (record.accessDay) {
                        _push2(`<span data-v-4cf19162${_scopeId}>Entrada/salida registrada</span>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      if (record.status === "clear" && !record.accessDay) {
                        _push2(`<span data-v-4cf19162${_scopeId}>Presente</span>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      _push2(`</div></div>`);
                      if (record.absence) {
                        _push2(`<button class="btn btn-secondary row-action" type="button" data-v-4cf19162${_scopeId}>${ssrInterpolate(record.absence.motivo ? "Actualizar motivo" : "Agregar motivo")}</button>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      _push2(`</article>`);
                    });
                    _push2(`<!--]--></div>`);
                  } else {
                    _push2(`<p class="quiet-empty" data-v-4cf19162${_scopeId}>No encontramos registros con esos filtros.</p>`);
                  }
                  if (canShowMoreRecords.value) {
                    _push2(`<button class="btn btn-secondary show-more" type="button" data-testid="attendance-show-more" data-v-4cf19162${_scopeId}> Ver más registros </button>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</section>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<!--]-->`);
              }
              if (notice.value) {
                _push2(`<p class="notice" data-v-4cf19162${_scopeId}>${ssrInterpolate(notice.value)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            if (editingAbsence.value) {
              _push2(ssrRenderComponent(_component_FamilyPersonasModal, {
                title: "Agregar motivo de inasistencia",
                eyebrow: dateLabel(editingAbsence.value.date),
                theme: theme.value,
                onClose: closeMotivo
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<form class="motivo-form" data-testid="motivo-form" data-v-4cf19162${_scopeId2}><div class="modal-record-summary" data-v-4cf19162${_scopeId2}><div class="date-tile mini soft-danger" data-v-4cf19162${_scopeId2}><strong data-v-4cf19162${_scopeId2}>${ssrInterpolate(dayNumber(editingAbsence.value.date))}</strong><span data-v-4cf19162${_scopeId2}>${ssrInterpolate(monthShort(editingAbsence.value.date))}</span></div><div data-v-4cf19162${_scopeId2}><strong data-v-4cf19162${_scopeId2}>${ssrInterpolate(dateLabel(editingAbsence.value.date))}</strong><span data-v-4cf19162${_scopeId2}>Ausencia sin motivo</span></div></div><label class="label" data-v-4cf19162${_scopeId2}><span data-v-4cf19162${_scopeId2}>Motivo de inasistencia</span><textarea class="textarea" maxlength="700" required data-testid="motivo-textarea" placeholder="Escribe el motivo de la ausencia..." data-v-4cf19162${_scopeId2}>${ssrInterpolate(motivoDraft.value)}</textarea></label><p class="counter" data-v-4cf19162${_scopeId2}>${ssrInterpolate(motivoDraft.value.length)}/700</p>`);
                    if (motivoError.value) {
                      _push3(`<p class="alert" data-v-4cf19162${_scopeId2}>${ssrInterpolate(motivoError.value)}</p>`);
                    } else {
                      _push3(`<!---->`);
                    }
                    _push3(`<div class="form-actions" data-v-4cf19162${_scopeId2}><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(savingMotivo.value) ? " disabled" : ""} data-v-4cf19162${_scopeId2}>Cancelar</button><button class="btn btn-primary" type="submit"${ssrIncludeBooleanAttr(savingMotivo.value || motivoDraft.value.trim().length < 3) ? " disabled" : ""} data-testid="motivo-submit" data-v-4cf19162${_scopeId2}>${ssrInterpolate(savingMotivo.value ? "Guardando..." : "Guardar motivo")}</button></div></form>`);
                  } else {
                    return [
                      createVNode("form", {
                        class: "motivo-form",
                        "data-testid": "motivo-form",
                        onSubmit: withModifiers(saveMotivo, ["prevent"])
                      }, [
                        createVNode("div", { class: "modal-record-summary" }, [
                          createVNode("div", { class: "date-tile mini soft-danger" }, [
                            createVNode("strong", null, toDisplayString(dayNumber(editingAbsence.value.date)), 1),
                            createVNode("span", null, toDisplayString(monthShort(editingAbsence.value.date)), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("strong", null, toDisplayString(dateLabel(editingAbsence.value.date)), 1),
                            createVNode("span", null, "Ausencia sin motivo")
                          ])
                        ]),
                        createVNode("label", { class: "label" }, [
                          createVNode("span", null, "Motivo de inasistencia"),
                          withDirectives(createVNode("textarea", {
                            "onUpdate:modelValue": ($event) => motivoDraft.value = $event,
                            class: "textarea",
                            maxlength: "700",
                            required: "",
                            "data-testid": "motivo-textarea",
                            placeholder: "Escribe el motivo de la ausencia..."
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, motivoDraft.value]
                          ])
                        ]),
                        createVNode("p", { class: "counter" }, toDisplayString(motivoDraft.value.length) + "/700", 1),
                        motivoError.value ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "alert"
                        }, toDisplayString(motivoError.value), 1)) : createCommentVNode("", true),
                        createVNode("div", { class: "form-actions" }, [
                          createVNode("button", {
                            class: "btn btn-secondary",
                            type: "button",
                            disabled: savingMotivo.value,
                            onClick: closeMotivo
                          }, "Cancelar", 8, ["disabled"]),
                          createVNode("button", {
                            class: "btn btn-primary",
                            type: "submit",
                            disabled: savingMotivo.value || motivoDraft.value.trim().length < 3,
                            "data-testid": "motivo-submit"
                          }, toDisplayString(savingMotivo.value ? "Guardando..." : "Guardar motivo"), 9, ["disabled"])
                        ])
                      ], 32)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if (selectedAccessAction.value) {
              _push2(ssrRenderComponent(_component_FamilyPersonasModal, {
                title: `Registro de ${selectedAccessAction.value.label.toLowerCase()}`,
                eyebrow: dateLabel(selectedAccessAction.value.action.date),
                theme: theme.value,
                onClose: ($event) => selectedAccessAction.value = null
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<section class="access-detail-modal" data-v-4cf19162${_scopeId2}><div class="access-detail-copy" data-v-4cf19162${_scopeId2}><span class="status-chip access" data-v-4cf19162${_scopeId2}>${ssrInterpolate(selectedAccessAction.value.label)}</span><h3 data-v-4cf19162${_scopeId2}>${ssrInterpolate(selectedAccessAction.value.action.time)}</h3><p data-v-4cf19162${_scopeId2}>${ssrInterpolate(unref(data)?.selectedChild.name)} · ${ssrInterpolate(unref(displayMatricula)(unref(data)?.selectedChild.matricula || ""))}</p><dl data-v-4cf19162${_scopeId2}><div data-v-4cf19162${_scopeId2}><dt data-v-4cf19162${_scopeId2}>Persona autorizada</dt><dd data-v-4cf19162${_scopeId2}>${ssrInterpolate(selectedAccessAction.value.action.person.name)}</dd></div><div data-v-4cf19162${_scopeId2}><dt data-v-4cf19162${_scopeId2}>Relación</dt><dd data-v-4cf19162${_scopeId2}>${ssrInterpolate(selectedAccessAction.value.action.person.parentesco || "Persona autorizada")}</dd></div></dl></div><div class="access-detail-photo" data-v-4cf19162${_scopeId2}>`);
                    if (selectedAccessAction.value.action.person.photoUrl) {
                      _push3(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                        src: selectedAccessAction.value.action.person.photoUrl,
                        "auto-process": false,
                        namespace: `access-detail-${selectedAccessAction.value.action.id}`,
                        alt: selectedAccessAction.value.action.person.name
                      }, null, _parent3, _scopeId2));
                    } else {
                      _push3(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "person" }, null, _parent3, _scopeId2));
                    }
                    _push3(`</div></section>`);
                  } else {
                    return [
                      createVNode("section", { class: "access-detail-modal" }, [
                        createVNode("div", { class: "access-detail-copy" }, [
                          createVNode("span", { class: "status-chip access" }, toDisplayString(selectedAccessAction.value.label), 1),
                          createVNode("h3", null, toDisplayString(selectedAccessAction.value.action.time), 1),
                          createVNode("p", null, toDisplayString(unref(data)?.selectedChild.name) + " · " + toDisplayString(unref(displayMatricula)(unref(data)?.selectedChild.matricula || "")), 1),
                          createVNode("dl", null, [
                            createVNode("div", null, [
                              createVNode("dt", null, "Persona autorizada"),
                              createVNode("dd", null, toDisplayString(selectedAccessAction.value.action.person.name), 1)
                            ]),
                            createVNode("div", null, [
                              createVNode("dt", null, "Relación"),
                              createVNode("dd", null, toDisplayString(selectedAccessAction.value.action.person.parentesco || "Persona autorizada"), 1)
                            ])
                          ])
                        ]),
                        createVNode("div", { class: "access-detail-photo" }, [
                          selectedAccessAction.value.action.person.photoUrl ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                            key: 0,
                            src: selectedAccessAction.value.action.person.photoUrl,
                            "auto-process": false,
                            namespace: `access-detail-${selectedAccessAction.value.action.id}`,
                            alt: selectedAccessAction.value.action.person.name
                          }, null, 8, ["src", "namespace", "alt"])) : (openBlock(), createBlock(_component_FamilyPersonasIcon, {
                            key: 1,
                            name: "person"
                          }))
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
            if (cycleDrawerOpen.value) {
              _push2(ssrRenderComponent(_component_FamilyPersonasModal, {
                title: "Ciclos escolares",
                eyebrow: "Historial",
                theme: theme.value,
                onClose: ($event) => cycleDrawerOpen.value = false
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<section class="cycle-list" data-v-4cf19162${_scopeId2}><!--[-->`);
                    ssrRenderList(schoolYears.value, (year) => {
                      _push3(`<button class="${ssrRenderClass([{ active: year.label === selectedSchoolYearLabel.value }, "cycle-row"])}" type="button" data-v-4cf19162${_scopeId2}><span data-v-4cf19162${_scopeId2}><strong data-v-4cf19162${_scopeId2}>${ssrInterpolate(year.label)}</strong><small data-v-4cf19162${_scopeId2}>${ssrInterpolate(dateLabel(year.startDate))} - ${ssrInterpolate(dateLabel(year.endDate))}</small></span>`);
                      _push3(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "chevron" }, null, _parent3, _scopeId2));
                      _push3(`</button>`);
                    });
                    _push3(`<!--]--></section>`);
                  } else {
                    return [
                      createVNode("section", { class: "cycle-list" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(schoolYears.value, (year) => {
                          return openBlock(), createBlock("button", {
                            key: year.label,
                            class: ["cycle-row", { active: year.label === selectedSchoolYearLabel.value }],
                            type: "button",
                            onClick: ($event) => selectSchoolYear(year.label)
                          }, [
                            createVNode("span", null, [
                              createVNode("strong", null, toDisplayString(year.label), 1),
                              createVNode("small", null, toDisplayString(dateLabel(year.startDate)) + " - " + toDisplayString(dateLabel(year.endDate)), 1)
                            ]),
                            createVNode(_component_FamilyPersonasIcon, { name: "chevron" })
                          ], 10, ["onClick"]);
                        }), 128))
                      ])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</section>`);
          } else {
            return [
              createVNode("section", {
                class: "attendance-page",
                "data-state": pageState.value,
                "data-product-panel": "family-attendance-bitacora"
              }, [
                createVNode(_component_FamilyPersonasPageHeader, {
                  eyebrow: "Asistencia y accesos",
                  title: unref(data)?.selectedChild.name || "Asistencia y accesos",
                  description: selectedChildLine.value || unref(displayMatricula)(unref(data)?.selectedChild.matricula || ""),
                  "show-ambassador": false
                }, createSlots({
                  visual: withCtx(() => [
                    createVNode("div", {
                      class: "student-avatar",
                      "data-has-photo": Boolean(selectedChildPhoto.value)
                    }, [
                      selectedChildPhoto.value ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                        key: 0,
                        src: selectedChildPhoto.value,
                        namespace: "attendance-student-photo",
                        alt: unref(data)?.selectedChild.name || "Alumno",
                        loading: "eager"
                      }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(unref(data) ? initials(unref(data).selectedChild.name) : "A"), 1))
                    ], 8, ["data-has-photo"])
                  ]),
                  _: 2
                }, [
                  unref(data) ? {
                    name: "actions",
                    fn: withCtx(() => [
                      createVNode("div", {
                        class: "hero-controls",
                        "aria-label": "Contexto de asistencia"
                      }, [
                        createVNode("button", {
                          class: "cycle-pill",
                          type: "button",
                          "data-testid": "attendance-open-cycles",
                          onClick: ($event) => cycleDrawerOpen.value = true
                        }, [
                          createVNode(_component_FamilyPersonasIcon, { name: "calendar" }),
                          createVNode("span", null, [
                            createVNode("small", null, "Este ciclo escolar"),
                            createVNode("strong", null, toDisplayString(selectedSchoolYearLabel.value), 1)
                          ]),
                          createVNode(_component_FamilyPersonasIcon, { name: "chevron" })
                        ], 8, ["onClick"]),
                        createVNode("button", {
                          class: "btn btn-secondary history-button",
                          type: "button",
                          onClick: ($event) => cycleDrawerOpen.value = true
                        }, [
                          createTextVNode(" Ciclos anteriores "),
                          createVNode(_component_FamilyPersonasIcon, { name: "arrow" })
                        ], 8, ["onClick"]),
                        children.value.length > 1 ? (openBlock(), createBlock("label", {
                          key: 0,
                          class: "compact-select"
                        }, [
                          createVNode("span", null, "Alumno"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => selectedMatricula.value = $event,
                            class: "select",
                            "data-testid": "attendance-child-select",
                            onChange: syncRoute
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(children.value, (child) => {
                              return openBlock(), createBlock("option", {
                                key: child.matricula,
                                value: child.matricula
                              }, toDisplayString(child.name), 9, ["value"]);
                            }), 128))
                          ], 40, ["onUpdate:modelValue"]), [
                            [vModelSelect, selectedMatricula.value]
                          ])
                        ])) : createCommentVNode("", true)
                      ])
                    ]),
                    key: "0"
                  } : void 0
                ]), 1032, ["title", "description"]),
                unref(loadError) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "alert",
                  "data-state": "error"
                }, "No fue posible abrir la bitácora de asistencia.")) : unref(pending) && !unref(data) ? (openBlock(), createBlock("section", {
                  key: 1,
                  class: "loading-layout",
                  "data-state": "loading"
                }, [
                  (openBlock(), createBlock(Fragment, null, renderList(6, (item) => {
                    return createVNode("span", {
                      key: item,
                      class: "loading-card"
                    });
                  }), 64))
                ])) : unref(data) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                  sourceWarnings.value.length ? (openBlock(), createBlock("section", {
                    key: 0,
                    class: "source-strip",
                    "data-state": unref(data).status
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(sourceWarnings.value, (warning) => {
                      return openBlock(), createBlock("span", { key: warning }, toDisplayString(warning), 1);
                    }), 128))
                  ], 8, ["data-state"])) : createCommentVNode("", true),
                  emptyState.value ? (openBlock(), createBlock("section", {
                    key: 1,
                    class: "empty-expediente card",
                    "data-state": "empty"
                  }, [
                    createVNode("div", { class: "empty-mark" }, [
                      createVNode(_component_FamilyPersonasIcon, { name: "calendar" })
                    ]),
                    createVNode("div", null, [
                      createVNode("p", { class: "eyebrow" }, toDisplayString(selectedSchoolYearLabel.value), 1),
                      createVNode("h2", null, "Sin registros para este ciclo escolar"),
                      createVNode("p", null, "Cuando haya asistencia, ausencias, retardos o entradas y salidas, aparecerán aquí.")
                    ])
                  ])) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                    createVNode("section", {
                      class: "priority-grid",
                      "aria-label": "Estado principal de asistencia"
                    }, [
                      createVNode("article", {
                        class: "attention-card card",
                        "data-state": missingAbsences.value.length ? "pending" : "clear"
                      }, [
                        createVNode("div", { class: "attention-icon" }, [
                          createVNode(_component_FamilyPersonasIcon, {
                            name: missingAbsences.value.length ? "alert" : "check"
                          }, null, 8, ["name"])
                        ]),
                        createVNode("div", { class: "attention-copy-main" }, [
                          createVNode("p", { class: "eyebrow" }, toDisplayString(missingAbsences.value.length ? "Por atender" : "Todo en orden"), 1),
                          createVNode("h2", null, toDisplayString(missingAbsences.value.length ? `${missingAbsences.value.length} ausencia${missingAbsences.value.length === 1 ? "" : "s"} por justificar` : "Sin ausencias pendientes"), 1),
                          createVNode("p", null, toDisplayString(firstPendingAbsence.value ? `Próxima: ${dateLabel(firstPendingAbsence.value.date)}` : "No hay motivos pendientes para este ciclo."), 1),
                          firstPendingAbsence.value ? (openBlock(), createBlock("button", {
                            key: 0,
                            class: "btn btn-primary attention-primary",
                            type: "button",
                            onClick: ($event) => openMotivo(firstPendingAbsence.value)
                          }, [
                            createVNode(_component_FamilyPersonasIcon, { name: "edit" }),
                            createTextVNode(" Agregar motivo ")
                          ], 8, ["onClick"])) : createCommentVNode("", true)
                        ]),
                        attentionAbsences.value.length ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "attention-preview-list"
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(attentionAbsences.value, (absence) => {
                            return openBlock(), createBlock("button", {
                              key: absence.id,
                              class: "attention-preview-row",
                              type: "button",
                              onClick: ($event) => openMotivo(absence)
                            }, [
                              createVNode("span", { class: "date-tile soft-danger" }, [
                                createVNode("strong", null, toDisplayString(dayNumber(absence.date)), 1),
                                createVNode("small", null, toDisplayString(monthShort(absence.date)), 1)
                              ]),
                              createVNode("span", null, [
                                createVNode("strong", null, "Ausencia"),
                                createVNode("small", null, toDisplayString(absence.motivo || "sin motivo"), 1)
                              ]),
                              createVNode(_component_FamilyPersonasIcon, { name: "chevron" })
                            ], 8, ["onClick"]);
                          }), 128))
                        ])) : createCommentVNode("", true)
                      ], 8, ["data-state"]),
                      createVNode("article", {
                        class: "latest-access-card card",
                        "data-state": latestAccessAction.value ? "ready" : "empty"
                      }, [
                        createVNode("div", { class: "latest-copy" }, [
                          createVNode("div", { class: "latest-title-row" }, [
                            createVNode("span", { class: "latest-icon" }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "check" })
                            ]),
                            createVNode("div", null, [
                              createVNode("p", { class: "eyebrow" }, "Último acceso registrado"),
                              latestAccessAction.value ? (openBlock(), createBlock("h2", { key: 0 }, toDisplayString(latestAccessAction.value.label) + " · " + toDisplayString(dateLabel(latestAccessAction.value.action.date)), 1)) : (openBlock(), createBlock("h2", { key: 1 }, "Sin accesos recientes"))
                            ])
                          ]),
                          latestAccessAction.value ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                            createVNode("strong", { class: "latest-time" }, toDisplayString(latestAccessAction.value.action.time), 1),
                            createVNode("div", { class: "latest-person" }, [
                              createVNode("span", { class: "person-thumb" }, [
                                latestAccessAction.value.action.person.photoUrl ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                                  key: 0,
                                  src: latestAccessAction.value.action.person.photoUrl,
                                  "auto-process": false,
                                  namespace: `latest-access-${latestAccessAction.value.action.id}`,
                                  alt: latestAccessAction.value.action.person.name
                                }, null, 8, ["src", "namespace", "alt"])) : (openBlock(), createBlock(_component_FamilyPersonasIcon, {
                                  key: 1,
                                  name: "person"
                                }))
                              ]),
                              createVNode("span", null, [
                                createVNode("strong", null, toDisplayString(latestAccessAction.value.action.person.name), 1),
                                createVNode("small", null, toDisplayString(latestAccessAction.value.action.person.parentesco || "Persona autorizada"), 1)
                              ])
                            ])
                          ], 64)) : (openBlock(), createBlock("p", {
                            key: 1,
                            class: "quiet-copy"
                          }, "Cuando haya entrada o salida registrada, aparecerá aquí."))
                        ]),
                        latestAccessAction.value ? (openBlock(), createBlock("button", {
                          key: 0,
                          class: "btn btn-secondary latest-action",
                          type: "button",
                          onClick: ($event) => openAccessDetail(latestAccessAction.value.action, latestAccessAction.value.label)
                        }, " Ver registro ", 8, ["onClick"])) : createCommentVNode("", true)
                      ], 8, ["data-state"])
                    ]),
                    createVNode("section", {
                      class: "bitacora-panel card",
                      "data-product-panel": "attendance-day-records"
                    }, [
                      createVNode("header", { class: "bitacora-header" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "eyebrow" }, "Bitácora reciente"),
                          createVNode("h2", null, "Asistencia y accesos")
                        ]),
                        createVNode("div", {
                          class: "legend-row",
                          "aria-label": "Estados de asistencia"
                        }, [
                          createVNode("span", null, [
                            createVNode("i", { class: "legend-dot clear" }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "check" })
                            ]),
                            createTextVNode("Presente")
                          ]),
                          createVNode("span", null, [
                            createVNode("i", { class: "legend-dot tardy" }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "clock" })
                            ]),
                            createTextVNode("Retardo")
                          ]),
                          createVNode("span", null, [
                            createVNode("i", { class: "legend-dot missing" }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "alert" })
                            ]),
                            createTextVNode("Ausencia")
                          ]),
                          createVNode("span", null, [
                            createVNode("i", { class: "legend-dot entry" }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "entry" })
                            ]),
                            createTextVNode("Entrada")
                          ]),
                          createVNode("span", null, [
                            createVNode("i", { class: "legend-dot exit" }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "exit" })
                            ]),
                            createTextVNode("Salida")
                          ])
                        ]),
                        createVNode("button", {
                          class: "btn btn-secondary full-history-button",
                          type: "button",
                          onClick: ($event) => historyExpanded.value = !historyExpanded.value
                        }, [
                          createTextVNode(toDisplayString(historyExpanded.value ? "Ocultar historial" : "Ver historial completo") + " ", 1),
                          createVNode(_component_FamilyPersonasIcon, { name: "arrow" })
                        ], 8, ["onClick"])
                      ]),
                      recentRecords.value.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "bitacora-list"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(recentRecords.value, (record) => {
                          return openBlock(), createBlock("article", {
                            key: record.key,
                            class: "bitacora-row",
                            "data-state": record.tone
                          }, [
                            createVNode("div", {
                              class: ["date-tile", record.tone]
                            }, [
                              createVNode("span", null, toDisplayString(weekDay(record.date)), 1),
                              createVNode("strong", null, toDisplayString(dayNumber(record.date)), 1),
                              createVNode("small", null, toDisplayString(monthShort(record.date)), 1)
                            ], 2),
                            createVNode("div", { class: "status-cell" }, [
                              createVNode("span", {
                                class: ["status-symbol", record.tone]
                              }, [
                                createVNode(_component_FamilyPersonasIcon, {
                                  name: record.tone === "tardy" || record.tone === "combined" ? "clock" : record.tone === "missing" || record.tone === "provided" ? "alert" : "check"
                                }, null, 8, ["name"])
                              ], 2),
                              createVNode("span", { class: "status-copy" }, [
                                createVNode("strong", null, toDisplayString(record.label), 1),
                                createVNode("small", null, toDisplayString(recordStatusDetail(record)), 1)
                              ])
                            ]),
                            createVNode("div", {
                              class: "access-cell",
                              "data-state": record.accessDay?.entrada ? "ready" : "missing"
                            }, [
                              createVNode("span", { class: "access-symbol entry" }, [
                                createVNode(_component_FamilyPersonasIcon, { name: "entry" })
                              ]),
                              createVNode("span", { class: "access-copy" }, [
                                createVNode("strong", null, "Entrada"),
                                createVNode("small", null, toDisplayString(record.accessDay?.entrada?.time || "Sin registro"), 1),
                                record.accessDay?.entrada ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "access-person-inline"
                                }, [
                                  createVNode("span", { class: "person-thumb mini" }, [
                                    record.accessDay.entrada.person.photoUrl ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                                      key: 0,
                                      src: record.accessDay.entrada.person.photoUrl,
                                      "auto-process": false,
                                      namespace: `record-entry-${record.accessDay.entrada.id}`,
                                      alt: record.accessDay.entrada.person.name
                                    }, null, 8, ["src", "namespace", "alt"])) : (openBlock(), createBlock(_component_FamilyPersonasIcon, {
                                      key: 1,
                                      name: "person"
                                    }))
                                  ]),
                                  createVNode("span", null, [
                                    createVNode("b", null, toDisplayString(record.accessDay.entrada.person.name), 1),
                                    createVNode("em", null, toDisplayString(record.accessDay.entrada.person.parentesco || "Persona autorizada"), 1)
                                  ])
                                ])) : createCommentVNode("", true)
                              ])
                            ], 8, ["data-state"]),
                            createVNode("div", {
                              class: "access-cell",
                              "data-state": record.accessDay?.salida ? "ready" : "missing"
                            }, [
                              createVNode("span", { class: "access-symbol exit" }, [
                                createVNode(_component_FamilyPersonasIcon, { name: "exit" })
                              ]),
                              createVNode("span", { class: "access-copy" }, [
                                createVNode("strong", null, "Salida"),
                                createVNode("small", null, toDisplayString(record.accessDay?.salida?.time || "Sin registro"), 1),
                                record.accessDay?.salida ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "access-person-inline"
                                }, [
                                  createVNode("span", { class: "person-thumb mini" }, [
                                    record.accessDay.salida.person.photoUrl ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                                      key: 0,
                                      src: record.accessDay.salida.person.photoUrl,
                                      "auto-process": false,
                                      namespace: `record-exit-${record.accessDay.salida.id}`,
                                      alt: record.accessDay.salida.person.name
                                    }, null, 8, ["src", "namespace", "alt"])) : (openBlock(), createBlock(_component_FamilyPersonasIcon, {
                                      key: 1,
                                      name: "person"
                                    }))
                                  ]),
                                  createVNode("span", null, [
                                    createVNode("b", null, toDisplayString(record.accessDay.salida.person.name), 1),
                                    createVNode("em", null, toDisplayString(record.accessDay.salida.person.parentesco || "Persona autorizada"), 1)
                                  ])
                                ])) : createCommentVNode("", true)
                              ])
                            ], 8, ["data-state"]),
                            createVNode("div", { class: "row-actions" }, [
                              record.absence ? (openBlock(), createBlock("button", {
                                key: 0,
                                class: "btn btn-secondary row-action danger",
                                type: "button",
                                onClick: ($event) => openMotivo(record.absence)
                              }, [
                                createVNode(_component_FamilyPersonasIcon, { name: "edit" }),
                                createTextVNode(" " + toDisplayString(record.absence.motivo ? "Actualizar motivo" : "Agregar motivo"), 1)
                              ], 8, ["onClick"])) : primaryAccessAction(record) ? (openBlock(), createBlock("button", {
                                key: 1,
                                class: "btn btn-secondary row-action",
                                type: "button",
                                onClick: ($event) => openPrimaryAccessDetail(record)
                              }, " Ver registro ", 8, ["onClick"])) : createCommentVNode("", true)
                            ])
                          ], 8, ["data-state"]);
                        }), 128))
                      ])) : (openBlock(), createBlock("p", {
                        key: 1,
                        class: "quiet-empty"
                      }, "Sin registros recientes para este ciclo."))
                    ]),
                    historyExpanded.value ? (openBlock(), createBlock("section", {
                      key: 0,
                      class: "history-panel card",
                      "data-product-panel": "attendance-history"
                    }, [
                      createVNode("header", { class: "section-head history-head" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "eyebrow" }, "Historial completo"),
                          createVNode("h2", null, toDisplayString(filteredRecords.value.length) + " registro" + toDisplayString(filteredRecords.value.length === 1 ? "" : "s"), 1)
                        ])
                      ]),
                      createVNode("section", {
                        class: "record-filters",
                        "aria-label": "Buscar y filtrar bitácora"
                      }, [
                        createVNode("label", { class: "control-label search-control" }, [
                          createVNode("span", null, "Buscar"),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => recordFilters.search = $event,
                            class: "input",
                            type: "search",
                            placeholder: "Fecha, persona, ausencia, retardo o matrícula",
                            "data-testid": "attendance-record-search"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelText, recordFilters.search]
                          ])
                        ]),
                        createVNode("label", { class: "control-label" }, [
                          createVNode("span", null, "Mes"),
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => recordFilters.month = $event,
                            class: "select",
                            "data-testid": "attendance-month-filter"
                          }, [
                            createVNode("option", { value: "all" }, "Todo el ciclo"),
                            (openBlock(true), createBlock(Fragment, null, renderList(recordMonths.value, (month) => {
                              return openBlock(), createBlock("option", {
                                key: month.key,
                                value: month.key
                              }, toDisplayString(month.label), 9, ["value"]);
                            }), 128))
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, recordFilters.month]
                          ])
                        ])
                      ]),
                      createVNode("div", {
                        class: "filter-chips",
                        "aria-label": "Tipo de registro"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(filterOptions.value, (option) => {
                          return openBlock(), createBlock("button", {
                            key: option.value,
                            class: ["filter-chip", { active: recordFilters.type === option.value }],
                            type: "button",
                            "data-testid": `attendance-filter-${option.value}`,
                            onClick: ($event) => recordFilters.type = option.value
                          }, [
                            createVNode("span", null, toDisplayString(option.label), 1),
                            createVNode("strong", null, toDisplayString(option.count), 1)
                          ], 10, ["data-testid", "onClick"]);
                        }), 128))
                      ]),
                      visibleRecords.value.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "history-list"
                      }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(visibleRecords.value, (record) => {
                          return openBlock(), createBlock("article", {
                            key: `history-${record.key}`,
                            class: "history-row",
                            "data-state": record.tone
                          }, [
                            createVNode("div", {
                              class: ["date-tile mini", record.tone]
                            }, [
                              createVNode("strong", null, toDisplayString(dayNumber(record.date)), 1),
                              createVNode("span", null, toDisplayString(monthShort(record.date)), 1)
                            ], 2),
                            createVNode("div", { class: "history-main" }, [
                              createVNode("div", { class: "history-title" }, [
                                createVNode("strong", null, toDisplayString(dateLabel(record.date)), 1),
                                createVNode("span", {
                                  class: ["status-chip", record.tone]
                                }, toDisplayString(record.label), 3)
                              ]),
                              createVNode("div", { class: "history-events" }, [
                                record.absence ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(record.absence.motivo || "Motivo pendiente"), 1)) : createCommentVNode("", true),
                                record.tardies.length ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(record.tardies.length) + " retardo" + toDisplayString(record.tardies.length === 1 ? "" : "s"), 1)) : createCommentVNode("", true),
                                record.accessDay ? (openBlock(), createBlock("span", { key: 2 }, "Entrada/salida registrada")) : createCommentVNode("", true),
                                record.status === "clear" && !record.accessDay ? (openBlock(), createBlock("span", { key: 3 }, "Presente")) : createCommentVNode("", true)
                              ])
                            ]),
                            record.absence ? (openBlock(), createBlock("button", {
                              key: 0,
                              class: "btn btn-secondary row-action",
                              type: "button",
                              onClick: ($event) => openMotivo(record.absence)
                            }, toDisplayString(record.absence.motivo ? "Actualizar motivo" : "Agregar motivo"), 9, ["onClick"])) : createCommentVNode("", true)
                          ], 8, ["data-state"]);
                        }), 128))
                      ])) : (openBlock(), createBlock("p", {
                        key: 1,
                        class: "quiet-empty"
                      }, "No encontramos registros con esos filtros.")),
                      canShowMoreRecords.value ? (openBlock(), createBlock("button", {
                        key: 2,
                        class: "btn btn-secondary show-more",
                        type: "button",
                        "data-testid": "attendance-show-more",
                        onClick: ($event) => recordLimit.value += 12
                      }, " Ver más registros ", 8, ["onClick"])) : createCommentVNode("", true)
                    ])) : createCommentVNode("", true)
                  ], 64)),
                  notice.value ? (openBlock(), createBlock("p", {
                    key: 3,
                    class: "notice"
                  }, toDisplayString(notice.value), 1)) : createCommentVNode("", true)
                ], 64)) : createCommentVNode("", true),
                editingAbsence.value ? (openBlock(), createBlock(_component_FamilyPersonasModal, {
                  key: 3,
                  title: "Agregar motivo de inasistencia",
                  eyebrow: dateLabel(editingAbsence.value.date),
                  theme: theme.value,
                  onClose: closeMotivo
                }, {
                  default: withCtx(() => [
                    createVNode("form", {
                      class: "motivo-form",
                      "data-testid": "motivo-form",
                      onSubmit: withModifiers(saveMotivo, ["prevent"])
                    }, [
                      createVNode("div", { class: "modal-record-summary" }, [
                        createVNode("div", { class: "date-tile mini soft-danger" }, [
                          createVNode("strong", null, toDisplayString(dayNumber(editingAbsence.value.date)), 1),
                          createVNode("span", null, toDisplayString(monthShort(editingAbsence.value.date)), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("strong", null, toDisplayString(dateLabel(editingAbsence.value.date)), 1),
                          createVNode("span", null, "Ausencia sin motivo")
                        ])
                      ]),
                      createVNode("label", { class: "label" }, [
                        createVNode("span", null, "Motivo de inasistencia"),
                        withDirectives(createVNode("textarea", {
                          "onUpdate:modelValue": ($event) => motivoDraft.value = $event,
                          class: "textarea",
                          maxlength: "700",
                          required: "",
                          "data-testid": "motivo-textarea",
                          placeholder: "Escribe el motivo de la ausencia..."
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, motivoDraft.value]
                        ])
                      ]),
                      createVNode("p", { class: "counter" }, toDisplayString(motivoDraft.value.length) + "/700", 1),
                      motivoError.value ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "alert"
                      }, toDisplayString(motivoError.value), 1)) : createCommentVNode("", true),
                      createVNode("div", { class: "form-actions" }, [
                        createVNode("button", {
                          class: "btn btn-secondary",
                          type: "button",
                          disabled: savingMotivo.value,
                          onClick: closeMotivo
                        }, "Cancelar", 8, ["disabled"]),
                        createVNode("button", {
                          class: "btn btn-primary",
                          type: "submit",
                          disabled: savingMotivo.value || motivoDraft.value.trim().length < 3,
                          "data-testid": "motivo-submit"
                        }, toDisplayString(savingMotivo.value ? "Guardando..." : "Guardar motivo"), 9, ["disabled"])
                      ])
                    ], 32)
                  ]),
                  _: 1
                }, 8, ["eyebrow", "theme"])) : createCommentVNode("", true),
                selectedAccessAction.value ? (openBlock(), createBlock(_component_FamilyPersonasModal, {
                  key: 4,
                  title: `Registro de ${selectedAccessAction.value.label.toLowerCase()}`,
                  eyebrow: dateLabel(selectedAccessAction.value.action.date),
                  theme: theme.value,
                  onClose: ($event) => selectedAccessAction.value = null
                }, {
                  default: withCtx(() => [
                    createVNode("section", { class: "access-detail-modal" }, [
                      createVNode("div", { class: "access-detail-copy" }, [
                        createVNode("span", { class: "status-chip access" }, toDisplayString(selectedAccessAction.value.label), 1),
                        createVNode("h3", null, toDisplayString(selectedAccessAction.value.action.time), 1),
                        createVNode("p", null, toDisplayString(unref(data)?.selectedChild.name) + " · " + toDisplayString(unref(displayMatricula)(unref(data)?.selectedChild.matricula || "")), 1),
                        createVNode("dl", null, [
                          createVNode("div", null, [
                            createVNode("dt", null, "Persona autorizada"),
                            createVNode("dd", null, toDisplayString(selectedAccessAction.value.action.person.name), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("dt", null, "Relación"),
                            createVNode("dd", null, toDisplayString(selectedAccessAction.value.action.person.parentesco || "Persona autorizada"), 1)
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "access-detail-photo" }, [
                        selectedAccessAction.value.action.person.photoUrl ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                          key: 0,
                          src: selectedAccessAction.value.action.person.photoUrl,
                          "auto-process": false,
                          namespace: `access-detail-${selectedAccessAction.value.action.id}`,
                          alt: selectedAccessAction.value.action.person.name
                        }, null, 8, ["src", "namespace", "alt"])) : (openBlock(), createBlock(_component_FamilyPersonasIcon, {
                          key: 1,
                          name: "person"
                        }))
                      ])
                    ])
                  ]),
                  _: 1
                }, 8, ["title", "eyebrow", "theme", "onClose"])) : createCommentVNode("", true),
                cycleDrawerOpen.value ? (openBlock(), createBlock(_component_FamilyPersonasModal, {
                  key: 5,
                  title: "Ciclos escolares",
                  eyebrow: "Historial",
                  theme: theme.value,
                  onClose: ($event) => cycleDrawerOpen.value = false
                }, {
                  default: withCtx(() => [
                    createVNode("section", { class: "cycle-list" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(schoolYears.value, (year) => {
                        return openBlock(), createBlock("button", {
                          key: year.label,
                          class: ["cycle-row", { active: year.label === selectedSchoolYearLabel.value }],
                          type: "button",
                          onClick: ($event) => selectSchoolYear(year.label)
                        }, [
                          createVNode("span", null, [
                            createVNode("strong", null, toDisplayString(year.label), 1),
                            createVNode("small", null, toDisplayString(dateLabel(year.startDate)) + " - " + toDisplayString(dateLabel(year.endDate)), 1)
                          ]),
                          createVNode(_component_FamilyPersonasIcon, { name: "chevron" })
                        ], 10, ["onClick"]);
                      }), 128))
                    ])
                  ]),
                  _: 1
                }, 8, ["theme", "onClose"])) : createCommentVNode("", true)
              ], 8, ["data-state"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/asistencia.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const asistencia = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4cf19162"]]);
export {
  asistencia as default
};
//# sourceMappingURL=asistencia-DfbG_tFv.js.map
