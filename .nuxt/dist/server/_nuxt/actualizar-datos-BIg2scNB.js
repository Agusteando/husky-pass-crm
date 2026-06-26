import { _ as __nuxt_component_0, a as __nuxt_component_1 } from "./PersonasPageHeader-CbpYMeMe.js";
import { _ as __nuxt_component_2 } from "./PersonasProcessedPhoto-BWatNFQu.js";
import { _ as __nuxt_component_1$1 } from "./PersonasIcon-B5CnsWTN.js";
import { _ as __nuxt_component_4 } from "./PersonasModal-COKcp1xQ.js";
import { defineComponent, reactive, ref, computed, watch, mergeProps, withCtx, unref, createVNode, withModifiers, openBlock, createBlock, Fragment, renderList, createTextVNode, toDisplayString, withDirectives, vModelSelect, vModelDynamic, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderDynamicModel } from "vue/server-renderer";
import "C:/Users/hp/husky-pass-crm/node_modules/hookable/dist/index.mjs";
import { b as _export_sfc } from "../server.mjs";
import { u as useFetch } from "./fetch-BN3PQKmm.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { a as usePersonasFamilyPeople } from "./usePersonasTheme-CmVh5mbY.js";
import { a as displayMatricula } from "./matricula-C6apTRg-.js";
import { r as resolvePersonasTheme } from "./personasTheme-CJ7aLgiL.js";
import { n as normalizeAttendanceText } from "./attendance-D-E_6rKQ.js";
import "./AccountMenu-Cc9CsO5z.js";
import "./_virtual_public-BTp6Nzoa.js";
import "./daycare-xTCL2ANB.js";
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
import "./routeSession-DTQI2Jul.js";
import "./useAppSession-D-b8QDDW.js";
import "./experienceIdentity-DUHnLdZH.js";
import "./sessionScopes-DtWD9iQ2.js";
function repairMojibake(value) {
  if (!/[\u00c3\u00c2\u0080-\u009f]/.test(value)) return value;
  try {
    const bytes = Uint8Array.from(Array.from(value, (char) => char.charCodeAt(0) & 255));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return value;
  }
}
function normalized(value) {
  return normalizeAttendanceText(repairMojibake(String(value || "")));
}
function assetPath(value) {
  const clean = String(value || "").trim().replace(/^\/+/, "");
  return clean ? `/grupo-icons/${clean}` : "";
}
function resolveGrupoIcon(manifest, grupo) {
  const fallback = {
    grupoValue: String(grupo || "Grupo").trim() || "Grupo",
    image: "",
    previewImage: "",
    maskImage: "",
    fallback: true
  };
  if (!manifest?.entries?.length) return fallback;
  const aliasMap = Object.fromEntries(Object.entries(manifest.aliases || {}).map(([key, value]) => [normalized(key), normalized(value)]));
  const requested = normalized(grupo);
  const alias = requested ? aliasMap[requested] || requested : "";
  const entries = manifest.entries.map((entry2) => ({
    ...entry2,
    grupoValue: repairMojibake(entry2.grupoValue),
    normalizedKey: normalized(entry2.normalizedKey || entry2.grupoValue)
  }));
  const exact = entries.find((entry2) => entry2.normalizedKey === alias || normalized(entry2.grupoValue) === alias);
  const fallbackKey = normalized(manifest.fallbackGrupo);
  const manifestFallback = entries.find((entry2) => entry2.normalizedKey === fallbackKey) || entries[0];
  const entry = exact || manifestFallback;
  return {
    grupoValue: entry?.grupoValue || fallback.grupoValue,
    image: assetPath(entry?.previewGreenPng),
    previewImage: assetPath(entry?.previewGreenPng),
    maskImage: assetPath(entry?.maskPng),
    fallback: !exact
  };
}
const CURP_PATTERN = /^[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
function normalizeCurp(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}
function isRealDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
function parseCurpBirthDate(value) {
  const normalized2 = normalizeCurp(value);
  if (!normalized2) return { valid: false, normalized: normalized2, birthDate: null, reason: "empty" };
  if (!CURP_PATTERN.test(normalized2)) return { valid: false, normalized: normalized2, birthDate: null, reason: "format" };
  const yearPart = Number(normalized2.slice(4, 6));
  const month = Number(normalized2.slice(6, 8));
  const day = Number(normalized2.slice(8, 10));
  const centuryMarker = normalized2[16];
  const century = /[A-Z]/.test(centuryMarker) ? 2e3 : 1900;
  const year = century + yearPart;
  if (!isRealDate(year, month, day)) {
    return { valid: false, normalized: normalized2, birthDate: null, reason: "date" };
  }
  return {
    valid: true,
    normalized: normalized2,
    birthDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  };
}
function calculateAgeFromIsoDate(isoDate, now = /* @__PURE__ */ new Date()) {
  if (!isoDate) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isRealDate(year, month, day)) return null;
  let age = now.getFullYear() - year;
  const monthDelta = now.getMonth() + 1 - month;
  if (monthDelta < 0 || monthDelta === 0 && now.getDate() < day) age -= 1;
  return age >= 0 ? age : null;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "actualizar-datos",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: profile, refresh, pending, error: loadError } = useFetch("/api/personas-autorizadas/student", { key: "pa-student-profile", timeout: 15e3, dedupe: "defer" });
    const familyPeople = usePersonasFamilyPeople({ immediate: false });
    const { data: grupoManifest } = useFetch("/grupo-icons/manifest.json", { key: "pa-student-data-grupo-icons", timeout: 15e3 });
    const form = reactive({});
    const original = ref({});
    const fieldErrors = reactive({});
    const saving = ref(false);
    const error = ref("");
    const notice = ref("");
    const activeGroup = ref(null);
    function retryLoad() {
      return refresh();
    }
    const theme = computed(() => resolvePersonasTheme({
      matricula: profile.value?.readonly.matricula,
      plantel: profile.value?.readonly.plantel,
      nivelEdu: profile.value?.readonly.nivel
    }));
    const studentPhoto = computed(() => String(profile.value?.readonly.foto || "").trim());
    const studentDisplayName = computed(() => compactText([
      profile.value?.editable.nombres,
      profile.value?.editable.apellido_paterno,
      profile.value?.editable.apellido_materno
    ]) || "Alumno");
    const studentInitials = computed(() => studentDisplayName.value.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A");
    const academicNivel = computed(() => String(profile.value?.readonly.nivel || theme.value.shortLabel || "Nivel").trim());
    const academicGrado = computed(() => String(profile.value?.readonly.grado || "Grado").trim());
    const academicGrupo = computed(() => String(profile.value?.readonly.grupo || "Grupo").trim());
    const academicMatricula = computed(() => profile.value?.readonly.matricula ? displayMatricula(profile.value.readonly.matricula) : "—");
    const academicPlantel = computed(() => String(profile.value?.readonly.plantel || "—").trim());
    const academicSummary = computed(() => [academicNivel.value, academicGrado.value, academicGrupo.value].filter(Boolean).join(" / ") || "Datos escolares");
    const lastUpdateLabel = computed(() => profile.value?.meta?.updatedAt ? formatDate(profile.value.meta.updatedAt) : "Sin fecha reciente");
    const grupoIcon = computed(() => resolveGrupoIcon(grupoManifest.value, academicGrupo.value));
    const grupoMaskStyle = computed(() => grupoIcon.value.maskImage ? { "--grupo-mask-url": `url("${grupoIcon.value.maskImage}")` } : {});
    const decorativeGrade = computed(() => gradeNumberLabel(academicGrado.value));
    const curpBirth = computed(() => parseCurpBirthDate(profile.value?.editable.curp));
    const storedBirthDate = computed(() => formatEditableValue(profile.value?.editable.fecha_nacimiento));
    const derivedBirthDateLabel = computed(() => curpBirth.value.birthDate ? formatDate(curpBirth.value.birthDate) : curpBirth.value.reason === "empty" ? "Sin CURP" : "CURP no valida");
    const storedBirthDateLabel = computed(() => storedBirthDate.value ? formatDate(storedBirthDate.value) : "Sin fecha");
    const derivedAge = computed(() => calculateAgeFromIsoDate(curpBirth.value.birthDate));
    const derivedAgeLabel = computed(() => derivedAge.value === null ? "No disponible" : `${derivedAge.value} años`);
    const birthDateDiscrepancy = computed(() => Boolean(curpBirth.value.birthDate && storedBirthDate.value && curpBirth.value.birthDate !== storedBirthDate.value));
    const curpBirthState = computed(() => curpBirth.value.valid ? birthDateDiscrepancy.value ? "warning" : "ok" : curpBirth.value.reason === "empty" ? "empty" : "invalid");
    const serviceLabels = computed(() => normalizeServices(profile.value?.readonly.servicio));
    const groups = [
      {
        eyebrow: "Alumno",
        title: "Identidad y salud",
        fields: [
          { key: "curp", label: "CURP", maxlength: 18 },
          { key: "nombres", label: "Nombre(s)", autocomplete: "given-name" },
          { key: "apellido_paterno", label: "Apellido paterno", autocomplete: "family-name" },
          { key: "apellido_materno", label: "Apellido materno" },
          { key: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date" },
          { key: "lugar_nacimiento", label: "Lugar de nacimiento" },
          { key: "sexo", label: "Sexo", options: ["Femenino", "Masculino"] },
          { key: "talla", label: "Talla", inputmode: "decimal" },
          { key: "peso", label: "Peso", inputmode: "decimal" },
          { key: "tipo_sangre", label: "Tipo de sangre", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
          { key: "alergias", label: "Alergias" }
        ]
      },
      {
        eyebrow: "Padre / tutor",
        title: "Padre",
        fields: [
          { key: "nombre_padre", label: "Nombre" },
          { key: "apellido_paterno_padre", label: "Apellido paterno" },
          { key: "apellido_materno_padre", label: "Apellido materno" },
          { key: "lugar_trabajo_padre", label: "Lugar de trabajo" },
          { key: "puesto_padre", label: "Puesto" },
          { key: "email_padre", label: "Email", type: "email", autocomplete: "email" },
          { key: "telefono_padre", label: "Teléfono", type: "tel", inputmode: "tel", maxlength: 15 },
          { key: "estado_civil_padre", label: "Estado civil", options: ["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Viudo/a"] },
          { key: "fecha_nacimiento_padre", label: "Fecha de nacimiento", type: "date" },
          { key: "curp_padre", label: "CURP", maxlength: 18 },
          { key: "ine_padre", label: "INE", maxlength: 18 }
        ]
      },
      {
        eyebrow: "Madre / tutora",
        title: "Madre",
        fields: [
          { key: "nombre_madre", label: "Nombre" },
          { key: "apellido_paterno_madre", label: "Apellido paterno" },
          { key: "apellido_materno_madre", label: "Apellido materno" },
          { key: "lugar_trabajo_madre", label: "Lugar de trabajo" },
          { key: "puesto_madre", label: "Puesto" },
          { key: "email_madre", label: "Email", type: "email", autocomplete: "email" },
          { key: "telefono_madre", label: "Teléfono", type: "tel", inputmode: "tel", maxlength: 15 },
          { key: "estado_civil_madre", label: "Estado civil", options: ["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Viudo/a"] },
          { key: "fecha_nacimiento_madre", label: "Fecha de nacimiento", type: "date" },
          { key: "curp_madre", label: "CURP", maxlength: 18 },
          { key: "ine_madre", label: "INE", maxlength: 18 }
        ]
      },
      {
        eyebrow: "Domicilio",
        title: "Dirección",
        fields: [
          { key: "domicilio_calle", label: "Calle" },
          { key: "domicio_num", label: "Número" },
          { key: "domicilio_colonia", label: "Colonia" },
          { key: "domicilio_cp", label: "Código postal", inputmode: "numeric", maxlength: 5 },
          { key: "domicilio_municipio", label: "Municipio" }
        ]
      }
    ];
    const allowedFieldSet = computed(() => new Set(profile.value?.allowedFields || []));
    const visibleGroups = computed(() => groups.map((group) => ({ ...group, fields: group.fields.filter((field) => allowedFieldSet.value.has(field.key)) })).filter((group) => group.fields.length));
    const identityGroup = computed(() => visibleGroups.value.find((group) => group.eyebrow === "Alumno") || null);
    const fatherGroup = computed(() => visibleGroups.value.find((group) => group.title === "Padre") || null);
    const motherGroup = computed(() => visibleGroups.value.find((group) => group.title === "Madre") || null);
    const familyGroups = computed(() => [fatherGroup.value, motherGroup.value].filter(Boolean));
    const addressGroup = computed(() => visibleGroups.value.find((group) => group.title === "Dirección") || null);
    const changedFields = computed(() => activeGroup.value?.fields.filter((field) => String(form[field.key] || "") !== String(original.value[field.key] || "")) || []);
    const hasActiveGroupChanges = computed(() => changedFields.value.length > 0);
    watch(profile, (value) => {
      if (!value) return;
      for (const field of value.allowedFields) form[field] = formatEditableValue(value.editable[field]);
      original.value = Object.fromEntries(value.allowedFields.map((field) => [field, form[field] || ""]));
    }, { immediate: true });
    function compactText(parts) {
      return parts.map((part) => String(part || "").trim()).filter(Boolean).join(" ").replace(/\s+/g, " ");
    }
    function normalizeServices(value) {
      const seen = /* @__PURE__ */ new Set();
      return String(value || "").split(",").map((part) => part.trim().replace(/\s+/g, " ")).filter(Boolean).filter((part) => {
        const key = normalizeAttendanceText(part);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    function familyRowTitle(group) {
      if (group.title === "Padre") return "Padre / Tutor";
      if (group.title === "Madre") return "Madre / Tutora";
      return group.title;
    }
    function familyRowSubtitle(group) {
      const keys = group.title === "Padre" ? ["nombre_padre", "apellido_paterno_padre", "apellido_materno_padre"] : ["nombre_madre", "apellido_paterno_madre", "apellido_materno_madre"];
      return compactText(keys.map((key) => displayEditableField(key))) || (group.title === "Padre" ? "Padre" : "Madre");
    }
    function displayEditableField(key) {
      return form[key] || formatEditableValue(profile.value?.editable[key]);
    }
    function formatEditableValue(value) {
      const source = String(value ?? "");
      const date = /^(\d{4}-\d{2}-\d{2})/.exec(source);
      return date?.[1] || source;
    }
    function formatDate(value) {
      const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      const parsed = dateOnly ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])) : new Date(value);
      if (Number.isNaN(parsed.getTime())) return "recientemente";
      return parsed.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
    }
    function gradeNumberLabel(value) {
      const normalized2 = normalizeAttendanceText(value);
      const digit = normalized2.match(/\d+/)?.[0];
      if (digit) return digit;
      const names = {
        PRIMERO: "1",
        SEGUNDO: "2",
        TERCERO: "3",
        CUARTO: "4",
        QUINTO: "5",
        SEXTO: "6"
      };
      return names[normalized2] || "°";
    }
    function openGroup(group) {
      activeGroup.value = group;
      error.value = "";
      notice.value = "";
      clearFieldErrors();
    }
    function closeGroup() {
      if (saving.value) return;
      activeGroup.value = null;
      clearFieldErrors();
    }
    function clearFieldErrors() {
      for (const key of Object.keys(fieldErrors)) delete fieldErrors[key];
    }
    function normalizeField(field) {
      const key = field.key;
      const value = String(form[key] || "").trim();
      if (!value) {
        form[key] = "";
        return;
      }
      if (key.toString().includes("curp") || key.toString().includes("ine")) form[key] = value.toUpperCase().replace(/\s+/g, "");
      else if (key.toString().includes("telefono")) form[key] = value.replace(/[^0-9+]/g, "").slice(0, 15);
      else if (key === "domicilio_cp") form[key] = value.replace(/\D/g, "").slice(0, 5);
      else form[key] = value.replace(/\s+/g, " ");
    }
    function validateActiveGroup() {
      clearFieldErrors();
      if (!activeGroup.value) return false;
      for (const field of activeGroup.value.fields) {
        normalizeField(field);
        const key = field.key;
        const value = String(form[key] || "").trim();
        if (!value) continue;
        if (key.toString().includes("email") && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) fieldErrors[key] = "Email inválido.";
        if (key.toString().includes("curp") && !parseCurpBirthDate(value).valid) fieldErrors[key] = "CURP no valida.";
        if (key === "domicilio_cp" && !/^\d{5}$/.test(value)) fieldErrors[key] = "5 dígitos.";
        if (key.toString().includes("telefono") && !/^\+?\d{7,15}$/.test(value)) fieldErrors[key] = "Teléfono inválido.";
      }
      return Object.keys(fieldErrors).length === 0;
    }
    async function saveActiveGroup() {
      if (!activeGroup.value || !hasActiveGroupChanges.value) return;
      error.value = "";
      notice.value = "";
      if (!validateActiveGroup()) return;
      saving.value = true;
      const patch = Object.fromEntries(activeGroup.value.fields.filter((field) => String(form[field.key] || "") !== String(original.value[field.key] || "")).map((field) => [field.key, form[field.key] || null]));
      try {
        await $fetch("/api/personas-autorizadas/student", { method: "POST", body: patch });
        await refresh();
        await familyPeople.refresh().catch(() => void 0);
        activeGroup.value = null;
        notice.value = "Datos guardados.";
      } catch (err) {
        const failure = err;
        error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || "No fue posible guardar los datos.";
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FamilyPersonasAutorizadasShell = __nuxt_component_0;
      const _component_FamilyPersonasPageHeader = __nuxt_component_1;
      const _component_FamilyPersonasProcessedPhoto = __nuxt_component_2;
      const _component_FamilyPersonasIcon = __nuxt_component_1$1;
      const _component_FamilyPersonasModal = __nuxt_component_4;
      _push(ssrRenderComponent(_component_FamilyPersonasAutorizadasShell, mergeProps({ title: "Datos del alumno" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(loadError)) {
              _push2(`<div class="alert retry-alert" data-state="error" data-v-47e96e8e${_scopeId}><span data-v-47e96e8e${_scopeId}>No fue posible cargar los datos del alumno.</span><button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-datos-alumno" data-v-47e96e8e${_scopeId}>Reintentar</button></div>`);
            } else if (unref(pending)) {
              _push2(`<div class="card loading-row" data-product-loading data-v-47e96e8e${_scopeId}>Cargando…</div>`);
            } else if (unref(profile)) {
              _push2(`<!--[--><section class="student-data-screen" data-product-panel="student-data-home" data-v-47e96e8e${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasPageHeader, {
                eyebrow: "Alumno",
                title: "Datos del alumno",
                description: `Consulta y actualiza la información de ${studentDisplayName.value}.`,
                meta: `Última actualización: ${lastUpdateLabel.value}`,
                theme: theme.value,
                "ambassador-variant": "header"
              }, null, _parent2, _scopeId));
              _push2(`<section class="student-profile-card" data-product-panel="academic-readonly" data-v-47e96e8e${_scopeId}><div class="student-portrait"${ssrRenderAttr("data-has-photo", Boolean(studentPhoto.value))} data-v-47e96e8e${_scopeId}>`);
              if (studentPhoto.value) {
                _push2(ssrRenderComponent(_component_FamilyPersonasProcessedPhoto, {
                  src: studentPhoto.value,
                  namespace: "pa-student-data-photo",
                  alt: studentDisplayName.value
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<strong data-v-47e96e8e${_scopeId}>${ssrInterpolate(studentInitials.value)}</strong>`);
              }
              _push2(`<span class="student-verified" aria-hidden="true" data-v-47e96e8e${_scopeId}>✓</span></div><div class="student-profile-main" data-v-47e96e8e${_scopeId}><div class="student-profile-title" data-v-47e96e8e${_scopeId}><h2 data-v-47e96e8e${_scopeId}>${ssrInterpolate(studentDisplayName.value)}</h2><p data-v-47e96e8e${_scopeId}>${ssrInterpolate(academicSummary.value)}</p></div><dl class="academic-facts" aria-label="Datos escolares del alumno" data-v-47e96e8e${_scopeId}><div class="academic-fact feature-fact" data-v-47e96e8e${_scopeId}><span class="fact-icon" aria-hidden="true" data-v-47e96e8e${_scopeId}>`);
              _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "daycare" }, null, _parent2, _scopeId));
              _push2(`</span><dt data-v-47e96e8e${_scopeId}>Nivel</dt><dd data-v-47e96e8e${_scopeId}>${ssrInterpolate(academicNivel.value)}</dd></div><div class="academic-fact feature-fact" data-v-47e96e8e${_scopeId}><span class="grade-number" aria-hidden="true" data-v-47e96e8e${_scopeId}>${ssrInterpolate(decorativeGrade.value)}</span><dt data-v-47e96e8e${_scopeId}>Grado</dt><dd data-v-47e96e8e${_scopeId}>${ssrInterpolate(academicGrado.value)}</dd></div><div class="${ssrRenderClass([{ "has-group-mask": grupoIcon.value.maskImage }, "academic-fact group-fact"])}" style="${ssrRenderStyle(grupoMaskStyle.value)}" data-v-47e96e8e${_scopeId}><span class="${ssrRenderClass([{ "has-mask": grupoIcon.value.maskImage }, "group-token"])}" aria-hidden="true" data-v-47e96e8e${_scopeId}>`);
              if (grupoIcon.value.maskImage) {
                _push2(`<span class="group-mask" data-v-47e96e8e${_scopeId}></span>`);
              } else {
                _push2(`<span class="group-mask-fallback" data-v-47e96e8e${_scopeId}></span>`);
              }
              _push2(`</span><dt data-v-47e96e8e${_scopeId}>Grupo</dt><dd data-v-47e96e8e${_scopeId}>${ssrInterpolate(academicGrupo.value)}</dd></div><div class="academic-fact compact-fact" data-v-47e96e8e${_scopeId}><dt data-v-47e96e8e${_scopeId}>Matrícula</dt><dd data-v-47e96e8e${_scopeId}>${ssrInterpolate(academicMatricula.value)}</dd></div><div class="academic-fact compact-fact" data-v-47e96e8e${_scopeId}><dt data-v-47e96e8e${_scopeId}>Plantel</dt><dd data-v-47e96e8e${_scopeId}>${ssrInterpolate(academicPlantel.value)}</dd></div></dl><div class="student-readonly-strip" aria-label="Resumen de identidad y servicios" data-v-47e96e8e${_scopeId}><div class="readonly-pill"${ssrRenderAttr("data-state", curpBirthState.value)} data-v-47e96e8e${_scopeId}><span data-v-47e96e8e${_scopeId}>Nacimiento CURP</span><strong data-v-47e96e8e${_scopeId}>${ssrInterpolate(derivedBirthDateLabel.value)}</strong></div><div class="readonly-pill" data-v-47e96e8e${_scopeId}><span data-v-47e96e8e${_scopeId}>Edad actual</span><strong data-v-47e96e8e${_scopeId}>${ssrInterpolate(derivedAgeLabel.value)}</strong></div>`);
              if (birthDateDiscrepancy.value) {
                _push2(`<div class="readonly-pill warning" data-v-47e96e8e${_scopeId}><span data-v-47e96e8e${_scopeId}>Fecha registrada</span><strong data-v-47e96e8e${_scopeId}>${ssrInterpolate(storedBirthDateLabel.value)}</strong></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="services-chip-row" aria-label="Talleres y servicios" data-v-47e96e8e${_scopeId}><span class="services-label" data-v-47e96e8e${_scopeId}>Talleres y servicios</span>`);
              if (serviceLabels.value.length) {
                _push2(`<!--[-->`);
                ssrRenderList(serviceLabels.value, (service) => {
                  _push2(`<span class="service-chip" data-v-47e96e8e${_scopeId}>${ssrInterpolate(service)}</span>`);
                });
                _push2(`<!--]-->`);
              } else {
                _push2(`<span class="empty-service-chip" data-v-47e96e8e${_scopeId}>Sin servicios activos</span>`);
              }
              _push2(`</div></div></div></section><section class="student-section-stack" data-product-panel="student-data-sections" data-v-47e96e8e${_scopeId}>`);
              if (identityGroup.value) {
                _push2(`<article class="student-info-card compact-info-card" data-v-47e96e8e${_scopeId}><span class="section-avatar health" aria-hidden="true" data-v-47e96e8e${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "authorized" }, null, _parent2, _scopeId));
                _push2(`</span><div class="section-copy" data-v-47e96e8e${_scopeId}><h2 data-v-47e96e8e${_scopeId}>Identidad y salud</h2><p data-v-47e96e8e${_scopeId}>Información personal y datos de salud.</p></div><button class="section-action" type="button" data-diagnostic-action="editar-seccion-identidad" data-v-47e96e8e${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "edit" }, null, _parent2, _scopeId));
                _push2(` Actualizar </button></article>`);
              } else {
                _push2(`<!---->`);
              }
              if (familyGroups.value.length) {
                _push2(`<article class="student-info-card family-info-card" data-v-47e96e8e${_scopeId}><header class="card-section-head" data-v-47e96e8e${_scopeId}><span class="section-avatar family" aria-hidden="true" data-v-47e96e8e${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "people" }, null, _parent2, _scopeId));
                _push2(`</span><div class="section-copy" data-v-47e96e8e${_scopeId}><h2 data-v-47e96e8e${_scopeId}>Familia</h2><p data-v-47e96e8e${_scopeId}>Información de padre, madre o tutores.</p></div></header><div class="family-row-list" data-v-47e96e8e${_scopeId}><!--[-->`);
                ssrRenderList(familyGroups.value, (group) => {
                  _push2(`<button class="family-edit-row" type="button"${ssrRenderAttr("data-diagnostic-action", `editar-seccion-${group.title.toLowerCase()}`)} data-v-47e96e8e${_scopeId}><span class="family-row-icon" aria-hidden="true" data-v-47e96e8e${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "person" }, null, _parent2, _scopeId));
                  _push2(`</span><span class="family-row-copy" data-v-47e96e8e${_scopeId}><strong data-v-47e96e8e${_scopeId}>${ssrInterpolate(familyRowTitle(group))}</strong><small data-v-47e96e8e${_scopeId}>${ssrInterpolate(familyRowSubtitle(group))}</small></span><span class="row-action-mark" aria-hidden="true" data-v-47e96e8e${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "edit" }, null, _parent2, _scopeId));
                  _push2(`<b data-v-47e96e8e${_scopeId}>Actualizar</b></span></button>`);
                });
                _push2(`<!--]--></div></article>`);
              } else {
                _push2(`<!---->`);
              }
              if (addressGroup.value) {
                _push2(`<article class="student-info-card compact-info-card" data-v-47e96e8e${_scopeId}><span class="section-avatar address" aria-hidden="true" data-v-47e96e8e${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "home" }, null, _parent2, _scopeId));
                _push2(`</span><div class="section-copy" data-v-47e96e8e${_scopeId}><h2 data-v-47e96e8e${_scopeId}>Dirección</h2><p data-v-47e96e8e${_scopeId}>Información de domicilio.</p></div><button class="section-action" type="button" data-diagnostic-action="editar-seccion-direccion" data-v-47e96e8e${_scopeId}>`);
                _push2(ssrRenderComponent(_component_FamilyPersonasIcon, { name: "edit" }, null, _parent2, _scopeId));
                _push2(` Actualizar </button></article>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</section></section>`);
              if (activeGroup.value) {
                _push2(ssrRenderComponent(_component_FamilyPersonasModal, {
                  title: activeGroup.value.title,
                  eyebrow: activeGroup.value.eyebrow,
                  theme: theme.value,
                  onClose: closeGroup
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<form class="student-form" data-product-panel="student-data-modal" data-v-47e96e8e${_scopeId2}><div class="form-grid" data-v-47e96e8e${_scopeId2}><!--[-->`);
                      ssrRenderList(activeGroup.value.fields, (field) => {
                        _push3(`<label class="label" data-v-47e96e8e${_scopeId2}>${ssrInterpolate(field.label)} `);
                        if (field.options) {
                          _push3(`<select class="select"${ssrRenderAttr("aria-invalid", Boolean(fieldErrors[field.key]))} data-v-47e96e8e${_scopeId2}><option value="" data-v-47e96e8e${ssrIncludeBooleanAttr(Array.isArray(form[field.key]) ? ssrLooseContain(form[field.key], "") : ssrLooseEqual(form[field.key], "")) ? " selected" : ""}${_scopeId2}>Seleccionar</option><!--[-->`);
                          ssrRenderList(field.options, (option) => {
                            _push3(`<option${ssrRenderAttr("value", option)} data-v-47e96e8e${ssrIncludeBooleanAttr(Array.isArray(form[field.key]) ? ssrLooseContain(form[field.key], option) : ssrLooseEqual(form[field.key], option)) ? " selected" : ""}${_scopeId2}>${ssrInterpolate(option)}</option>`);
                          });
                          _push3(`<!--]--></select>`);
                        } else {
                          _push3(`<input${ssrRenderDynamicModel(field.type || "text", form[field.key], null)} class="input"${ssrRenderAttr("type", field.type || "text")}${ssrRenderAttr("autocomplete", field.autocomplete || "off")}${ssrRenderAttr("inputmode", field.inputmode)}${ssrRenderAttr("maxlength", field.maxlength)}${ssrRenderAttr("aria-invalid", Boolean(fieldErrors[field.key]))} data-v-47e96e8e${_scopeId2}>`);
                        }
                        if (fieldErrors[field.key]) {
                          _push3(`<small class="field-error" data-v-47e96e8e${_scopeId2}>${ssrInterpolate(fieldErrors[field.key])}</small>`);
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</label>`);
                      });
                      _push3(`<!--]--></div>`);
                      if (changedFields.value.length) {
                        _push3(`<div class="change-summary" aria-live="polite" data-v-47e96e8e${_scopeId2}><b data-v-47e96e8e${_scopeId2}>${ssrInterpolate(changedFields.value.length)}</b><span data-v-47e96e8e${_scopeId2}>${ssrInterpolate(changedFields.value.length === 1 ? "cambio" : "cambios")}</span></div>`);
                      } else {
                        _push3(`<!---->`);
                      }
                      _push3(`<div class="save-row" data-v-47e96e8e${_scopeId2}><button class="btn btn-primary pa-primary" type="submit"${ssrIncludeBooleanAttr(saving.value || !hasActiveGroupChanges.value) ? " disabled" : ""} data-diagnostic-action="guardar-seccion-datos" data-v-47e96e8e${_scopeId2}>${ssrInterpolate(saving.value ? "Guardando…" : hasActiveGroupChanges.value ? "Guardar" : "Sin cambios")}</button><button class="btn btn-secondary" type="button"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-47e96e8e${_scopeId2}>Cancelar</button></div></form>`);
                    } else {
                      return [
                        createVNode("form", {
                          class: "student-form",
                          "data-product-panel": "student-data-modal",
                          onSubmit: withModifiers(saveActiveGroup, ["prevent"])
                        }, [
                          createVNode("div", { class: "form-grid" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(activeGroup.value.fields, (field) => {
                              return openBlock(), createBlock("label", {
                                key: field.key,
                                class: "label"
                              }, [
                                createTextVNode(toDisplayString(field.label) + " ", 1),
                                field.options ? withDirectives((openBlock(), createBlock("select", {
                                  key: 0,
                                  "onUpdate:modelValue": ($event) => form[field.key] = $event,
                                  class: "select",
                                  "aria-invalid": Boolean(fieldErrors[field.key])
                                }, [
                                  createVNode("option", { value: "" }, "Seleccionar"),
                                  (openBlock(true), createBlock(Fragment, null, renderList(field.options, (option) => {
                                    return openBlock(), createBlock("option", {
                                      key: option,
                                      value: option
                                    }, toDisplayString(option), 9, ["value"]);
                                  }), 128))
                                ], 8, ["onUpdate:modelValue", "aria-invalid"])), [
                                  [vModelSelect, form[field.key]]
                                ]) : withDirectives((openBlock(), createBlock("input", {
                                  key: 1,
                                  "onUpdate:modelValue": ($event) => form[field.key] = $event,
                                  class: "input",
                                  type: field.type || "text",
                                  autocomplete: field.autocomplete || "off",
                                  inputmode: field.inputmode,
                                  maxlength: field.maxlength,
                                  "aria-invalid": Boolean(fieldErrors[field.key]),
                                  onBlur: ($event) => normalizeField(field)
                                }, null, 40, ["onUpdate:modelValue", "type", "autocomplete", "inputmode", "maxlength", "aria-invalid", "onBlur"])), [
                                  [vModelDynamic, form[field.key]]
                                ]),
                                fieldErrors[field.key] ? (openBlock(), createBlock("small", {
                                  key: 2,
                                  class: "field-error"
                                }, toDisplayString(fieldErrors[field.key]), 1)) : createCommentVNode("", true)
                              ]);
                            }), 128))
                          ]),
                          changedFields.value.length ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "change-summary",
                            "aria-live": "polite"
                          }, [
                            createVNode("b", null, toDisplayString(changedFields.value.length), 1),
                            createVNode("span", null, toDisplayString(changedFields.value.length === 1 ? "cambio" : "cambios"), 1)
                          ])) : createCommentVNode("", true),
                          createVNode("div", { class: "save-row" }, [
                            createVNode("button", {
                              class: "btn btn-primary pa-primary",
                              type: "submit",
                              disabled: saving.value || !hasActiveGroupChanges.value,
                              "data-diagnostic-action": "guardar-seccion-datos"
                            }, toDisplayString(saving.value ? "Guardando…" : hasActiveGroupChanges.value ? "Guardar" : "Sin cambios"), 9, ["disabled"]),
                            createVNode("button", {
                              class: "btn btn-secondary",
                              type: "button",
                              disabled: saving.value,
                              onClick: closeGroup
                            }, "Cancelar", 8, ["disabled"])
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
              _push2(`<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            if (error.value) {
              _push2(`<p class="alert" data-v-47e96e8e${_scopeId}>${ssrInterpolate(error.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            if (notice.value) {
              _push2(`<p class="notice" data-v-47e96e8e${_scopeId}>${ssrInterpolate(notice.value)}</p>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(loadError) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "alert retry-alert",
                "data-state": "error"
              }, [
                createVNode("span", null, "No fue posible cargar los datos del alumno."),
                createVNode("button", {
                  class: "btn btn-secondary",
                  type: "button",
                  "data-diagnostic-action": "reintentar-datos-alumno",
                  onClick: retryLoad
                }, "Reintentar")
              ])) : unref(pending) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "card loading-row",
                "data-product-loading": ""
              }, "Cargando…")) : unref(profile) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                createVNode("section", {
                  class: "student-data-screen",
                  "data-product-panel": "student-data-home"
                }, [
                  createVNode(_component_FamilyPersonasPageHeader, {
                    eyebrow: "Alumno",
                    title: "Datos del alumno",
                    description: `Consulta y actualiza la información de ${studentDisplayName.value}.`,
                    meta: `Última actualización: ${lastUpdateLabel.value}`,
                    theme: theme.value,
                    "ambassador-variant": "header"
                  }, null, 8, ["description", "meta", "theme"]),
                  createVNode("section", {
                    class: "student-profile-card",
                    "data-product-panel": "academic-readonly"
                  }, [
                    createVNode("div", {
                      class: "student-portrait",
                      "data-has-photo": Boolean(studentPhoto.value)
                    }, [
                      studentPhoto.value ? (openBlock(), createBlock(_component_FamilyPersonasProcessedPhoto, {
                        key: 0,
                        src: studentPhoto.value,
                        namespace: "pa-student-data-photo",
                        alt: studentDisplayName.value
                      }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("strong", { key: 1 }, toDisplayString(studentInitials.value), 1)),
                      createVNode("span", {
                        class: "student-verified",
                        "aria-hidden": "true"
                      }, "✓")
                    ], 8, ["data-has-photo"]),
                    createVNode("div", { class: "student-profile-main" }, [
                      createVNode("div", { class: "student-profile-title" }, [
                        createVNode("h2", null, toDisplayString(studentDisplayName.value), 1),
                        createVNode("p", null, toDisplayString(academicSummary.value), 1)
                      ]),
                      createVNode("dl", {
                        class: "academic-facts",
                        "aria-label": "Datos escolares del alumno"
                      }, [
                        createVNode("div", { class: "academic-fact feature-fact" }, [
                          createVNode("span", {
                            class: "fact-icon",
                            "aria-hidden": "true"
                          }, [
                            createVNode(_component_FamilyPersonasIcon, { name: "daycare" })
                          ]),
                          createVNode("dt", null, "Nivel"),
                          createVNode("dd", null, toDisplayString(academicNivel.value), 1)
                        ]),
                        createVNode("div", { class: "academic-fact feature-fact" }, [
                          createVNode("span", {
                            class: "grade-number",
                            "aria-hidden": "true"
                          }, toDisplayString(decorativeGrade.value), 1),
                          createVNode("dt", null, "Grado"),
                          createVNode("dd", null, toDisplayString(academicGrado.value), 1)
                        ]),
                        createVNode("div", {
                          class: ["academic-fact group-fact", { "has-group-mask": grupoIcon.value.maskImage }],
                          style: grupoMaskStyle.value
                        }, [
                          createVNode("span", {
                            class: ["group-token", { "has-mask": grupoIcon.value.maskImage }],
                            "aria-hidden": "true"
                          }, [
                            grupoIcon.value.maskImage ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "group-mask"
                            })) : (openBlock(), createBlock("span", {
                              key: 1,
                              class: "group-mask-fallback"
                            }))
                          ], 2),
                          createVNode("dt", null, "Grupo"),
                          createVNode("dd", null, toDisplayString(academicGrupo.value), 1)
                        ], 6),
                        createVNode("div", { class: "academic-fact compact-fact" }, [
                          createVNode("dt", null, "Matrícula"),
                          createVNode("dd", null, toDisplayString(academicMatricula.value), 1)
                        ]),
                        createVNode("div", { class: "academic-fact compact-fact" }, [
                          createVNode("dt", null, "Plantel"),
                          createVNode("dd", null, toDisplayString(academicPlantel.value), 1)
                        ])
                      ]),
                      createVNode("div", {
                        class: "student-readonly-strip",
                        "aria-label": "Resumen de identidad y servicios"
                      }, [
                        createVNode("div", {
                          class: "readonly-pill",
                          "data-state": curpBirthState.value
                        }, [
                          createVNode("span", null, "Nacimiento CURP"),
                          createVNode("strong", null, toDisplayString(derivedBirthDateLabel.value), 1)
                        ], 8, ["data-state"]),
                        createVNode("div", { class: "readonly-pill" }, [
                          createVNode("span", null, "Edad actual"),
                          createVNode("strong", null, toDisplayString(derivedAgeLabel.value), 1)
                        ]),
                        birthDateDiscrepancy.value ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "readonly-pill warning"
                        }, [
                          createVNode("span", null, "Fecha registrada"),
                          createVNode("strong", null, toDisplayString(storedBirthDateLabel.value), 1)
                        ])) : createCommentVNode("", true),
                        createVNode("div", {
                          class: "services-chip-row",
                          "aria-label": "Talleres y servicios"
                        }, [
                          createVNode("span", { class: "services-label" }, "Talleres y servicios"),
                          serviceLabels.value.length ? (openBlock(true), createBlock(Fragment, { key: 0 }, renderList(serviceLabels.value, (service) => {
                            return openBlock(), createBlock("span", {
                              key: service,
                              class: "service-chip"
                            }, toDisplayString(service), 1);
                          }), 128)) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "empty-service-chip"
                          }, "Sin servicios activos"))
                        ])
                      ])
                    ])
                  ]),
                  createVNode("section", {
                    class: "student-section-stack",
                    "data-product-panel": "student-data-sections"
                  }, [
                    identityGroup.value ? (openBlock(), createBlock("article", {
                      key: 0,
                      class: "student-info-card compact-info-card"
                    }, [
                      createVNode("span", {
                        class: "section-avatar health",
                        "aria-hidden": "true"
                      }, [
                        createVNode(_component_FamilyPersonasIcon, { name: "authorized" })
                      ]),
                      createVNode("div", { class: "section-copy" }, [
                        createVNode("h2", null, "Identidad y salud"),
                        createVNode("p", null, "Información personal y datos de salud.")
                      ]),
                      createVNode("button", {
                        class: "section-action",
                        type: "button",
                        "data-diagnostic-action": "editar-seccion-identidad",
                        onClick: ($event) => openGroup(identityGroup.value)
                      }, [
                        createVNode(_component_FamilyPersonasIcon, { name: "edit" }),
                        createTextVNode(" Actualizar ")
                      ], 8, ["onClick"])
                    ])) : createCommentVNode("", true),
                    familyGroups.value.length ? (openBlock(), createBlock("article", {
                      key: 1,
                      class: "student-info-card family-info-card"
                    }, [
                      createVNode("header", { class: "card-section-head" }, [
                        createVNode("span", {
                          class: "section-avatar family",
                          "aria-hidden": "true"
                        }, [
                          createVNode(_component_FamilyPersonasIcon, { name: "people" })
                        ]),
                        createVNode("div", { class: "section-copy" }, [
                          createVNode("h2", null, "Familia"),
                          createVNode("p", null, "Información de padre, madre o tutores.")
                        ])
                      ]),
                      createVNode("div", { class: "family-row-list" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(familyGroups.value, (group) => {
                          return openBlock(), createBlock("button", {
                            key: group.title,
                            class: "family-edit-row",
                            type: "button",
                            "data-diagnostic-action": `editar-seccion-${group.title.toLowerCase()}`,
                            onClick: ($event) => openGroup(group)
                          }, [
                            createVNode("span", {
                              class: "family-row-icon",
                              "aria-hidden": "true"
                            }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "person" })
                            ]),
                            createVNode("span", { class: "family-row-copy" }, [
                              createVNode("strong", null, toDisplayString(familyRowTitle(group)), 1),
                              createVNode("small", null, toDisplayString(familyRowSubtitle(group)), 1)
                            ]),
                            createVNode("span", {
                              class: "row-action-mark",
                              "aria-hidden": "true"
                            }, [
                              createVNode(_component_FamilyPersonasIcon, { name: "edit" }),
                              createVNode("b", null, "Actualizar")
                            ])
                          ], 8, ["data-diagnostic-action", "onClick"]);
                        }), 128))
                      ])
                    ])) : createCommentVNode("", true),
                    addressGroup.value ? (openBlock(), createBlock("article", {
                      key: 2,
                      class: "student-info-card compact-info-card"
                    }, [
                      createVNode("span", {
                        class: "section-avatar address",
                        "aria-hidden": "true"
                      }, [
                        createVNode(_component_FamilyPersonasIcon, { name: "home" })
                      ]),
                      createVNode("div", { class: "section-copy" }, [
                        createVNode("h2", null, "Dirección"),
                        createVNode("p", null, "Información de domicilio.")
                      ]),
                      createVNode("button", {
                        class: "section-action",
                        type: "button",
                        "data-diagnostic-action": "editar-seccion-direccion",
                        onClick: ($event) => openGroup(addressGroup.value)
                      }, [
                        createVNode(_component_FamilyPersonasIcon, { name: "edit" }),
                        createTextVNode(" Actualizar ")
                      ], 8, ["onClick"])
                    ])) : createCommentVNode("", true)
                  ])
                ]),
                activeGroup.value ? (openBlock(), createBlock(_component_FamilyPersonasModal, {
                  key: 0,
                  title: activeGroup.value.title,
                  eyebrow: activeGroup.value.eyebrow,
                  theme: theme.value,
                  onClose: closeGroup
                }, {
                  default: withCtx(() => [
                    createVNode("form", {
                      class: "student-form",
                      "data-product-panel": "student-data-modal",
                      onSubmit: withModifiers(saveActiveGroup, ["prevent"])
                    }, [
                      createVNode("div", { class: "form-grid" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(activeGroup.value.fields, (field) => {
                          return openBlock(), createBlock("label", {
                            key: field.key,
                            class: "label"
                          }, [
                            createTextVNode(toDisplayString(field.label) + " ", 1),
                            field.options ? withDirectives((openBlock(), createBlock("select", {
                              key: 0,
                              "onUpdate:modelValue": ($event) => form[field.key] = $event,
                              class: "select",
                              "aria-invalid": Boolean(fieldErrors[field.key])
                            }, [
                              createVNode("option", { value: "" }, "Seleccionar"),
                              (openBlock(true), createBlock(Fragment, null, renderList(field.options, (option) => {
                                return openBlock(), createBlock("option", {
                                  key: option,
                                  value: option
                                }, toDisplayString(option), 9, ["value"]);
                              }), 128))
                            ], 8, ["onUpdate:modelValue", "aria-invalid"])), [
                              [vModelSelect, form[field.key]]
                            ]) : withDirectives((openBlock(), createBlock("input", {
                              key: 1,
                              "onUpdate:modelValue": ($event) => form[field.key] = $event,
                              class: "input",
                              type: field.type || "text",
                              autocomplete: field.autocomplete || "off",
                              inputmode: field.inputmode,
                              maxlength: field.maxlength,
                              "aria-invalid": Boolean(fieldErrors[field.key]),
                              onBlur: ($event) => normalizeField(field)
                            }, null, 40, ["onUpdate:modelValue", "type", "autocomplete", "inputmode", "maxlength", "aria-invalid", "onBlur"])), [
                              [vModelDynamic, form[field.key]]
                            ]),
                            fieldErrors[field.key] ? (openBlock(), createBlock("small", {
                              key: 2,
                              class: "field-error"
                            }, toDisplayString(fieldErrors[field.key]), 1)) : createCommentVNode("", true)
                          ]);
                        }), 128))
                      ]),
                      changedFields.value.length ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "change-summary",
                        "aria-live": "polite"
                      }, [
                        createVNode("b", null, toDisplayString(changedFields.value.length), 1),
                        createVNode("span", null, toDisplayString(changedFields.value.length === 1 ? "cambio" : "cambios"), 1)
                      ])) : createCommentVNode("", true),
                      createVNode("div", { class: "save-row" }, [
                        createVNode("button", {
                          class: "btn btn-primary pa-primary",
                          type: "submit",
                          disabled: saving.value || !hasActiveGroupChanges.value,
                          "data-diagnostic-action": "guardar-seccion-datos"
                        }, toDisplayString(saving.value ? "Guardando…" : hasActiveGroupChanges.value ? "Guardar" : "Sin cambios"), 9, ["disabled"]),
                        createVNode("button", {
                          class: "btn btn-secondary",
                          type: "button",
                          disabled: saving.value,
                          onClick: closeGroup
                        }, "Cancelar", 8, ["disabled"])
                      ])
                    ], 32)
                  ]),
                  _: 1
                }, 8, ["title", "eyebrow", "theme"])) : createCommentVNode("", true)
              ], 64)) : createCommentVNode("", true),
              error.value ? (openBlock(), createBlock("p", {
                key: 3,
                class: "alert"
              }, toDisplayString(error.value), 1)) : createCommentVNode("", true),
              notice.value ? (openBlock(), createBlock("p", {
                key: 4,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/familia/personas-autorizadas/actualizar-datos.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const actualizarDatos = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-47e96e8e"]]);
export {
  actualizarDatos as default
};
//# sourceMappingURL=actualizar-datos-BIg2scNB.js.map
