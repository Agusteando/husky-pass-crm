import { computed, toValue } from "vue";
import { u as useNuxtApp } from "../server.mjs";
import { b as useState } from "./routeSession-DTQI2Jul.js";
import "C:/Users/hp/husky-pass-crm/node_modules/klona/dist/index.mjs";
import "#internal/nuxt/paths";
import "C:/Users/hp/husky-pass-crm/node_modules/defu/dist/defu.mjs";
import { n as normalizeVirtualAssetUrl } from "./daycare-xTCL2ANB.js";
import { r as resolvePersonasTheme, d as personasThemeStyle } from "./personasTheme-CJ7aLgiL.js";
import { n as normalizeMatricula } from "./matricula-C6apTRg-.js";
import { u as useAppSession } from "./useAppSession-D-b8QDDW.js";
const personasFamilyThemeContextKey = /* @__PURE__ */ Symbol("personas-family-theme-context");
function childrenFromPeople(people) {
  return people?.find((person) => person.children?.length)?.children || [];
}
function fetchErrorMessage(error) {
  const failure = error;
  return failure?.data?.statusMessage || failure?.data?.message || failure?.statusMessage || failure?.message || "No fue posible cargar Personas Autorizadas.";
}
function usePersonasFamilyPeople(options = {}) {
  const data = useState("pa-family-people:data", () => []);
  const loaded = useState("pa-family-people:loaded", () => false);
  const pendingState = useState("pa-family-people:pending", () => false);
  const errorMessage = useState("pa-family-people:error", () => "");
  const shouldLoad = computed(() => toValue(options.immediate) !== false);
  const pending = computed(() => pendingState.value || shouldLoad.value && !loaded.value && !errorMessage.value);
  const error = computed(() => errorMessage.value || null);
  async function load(force = false) {
    if (!force && loaded.value) return data.value;
    const holder = useNuxtApp();
    if (holder._personasFamilyPeoplePromise) return holder._personasFamilyPeoplePromise;
    pendingState.value = true;
    errorMessage.value = "";
    holder._personasFamilyPeoplePromise = $fetch("/api/personas-autorizadas/family", {
      timeout: 15e3
    }).then((rows) => {
      data.value = Array.isArray(rows) ? rows : [];
      loaded.value = true;
      return data.value;
    }).catch((error2) => {
      errorMessage.value = fetchErrorMessage(error2);
      throw error2;
    }).finally(() => {
      pendingState.value = false;
      holder._personasFamilyPeoplePromise = void 0;
    });
    return holder._personasFamilyPeoplePromise;
  }
  function ensure() {
    if (!shouldLoad.value || loaded.value || pendingState.value) return Promise.resolve(data.value);
    return load(false);
  }
  function refresh() {
    return load(true);
  }
  return {
    data,
    pending,
    error,
    loaded,
    ensure,
    refresh
  };
}
function useResolvedPersonasTheme(source) {
  const theme = computed(() => resolvePersonasTheme(toValue(source) || {}));
  const themeVars = computed(() => personasThemeStyle(theme.value));
  return { theme, themeVars };
}
function usePersonasFamilyTheme(options = {}) {
  const sessionState = useAppSession();
  const peopleState = usePersonasFamilyPeople({ immediate: options.immediate });
  const selectedMatricula = computed(() => normalizeMatricula(toValue(options.selectedMatricula)));
  const fallback = computed(() => toValue(options.fallback) || {});
  const people = peopleState.data;
  const session = sessionState.data;
  const children = computed(() => childrenFromPeople(people.value));
  const primaryChild = computed(() => {
    const selected = selectedMatricula.value;
    if (selected) {
      const byMatricula = children.value.find((child) => normalizeMatricula(child.matricula) === selected);
      if (byMatricula) return byMatricula;
    }
    return children.value.find((child) => child.isCurrent) || children.value[0] || null;
  });
  const themeSource = computed(() => ({
    matricula: primaryChild.value?.matricula || selectedMatricula.value || fallback.value.matricula || session.value?.user?.username,
    plantel: primaryChild.value?.plantel || fallback.value.plantel || session.value?.user?.plantel?.[0],
    nivelEdu: primaryChild.value?.nivelEdu || fallback.value.nivelEdu,
    campus: primaryChild.value?.campus || fallback.value.campus || session.value?.user?.campus,
    themeKey: fallback.value.themeKey
  }));
  const { theme, themeVars } = useResolvedPersonasTheme(themeSource);
  const studentName = computed(() => [primaryChild.value?.nombreA, primaryChild.value?.paternoA, primaryChild.value?.maternoA].filter(Boolean).join(" "));
  const studentPhoto = computed(() => normalizeVirtualAssetUrl(primaryChild.value?.foto || ""));
  return {
    session,
    sessionPending: sessionState.pending,
    people,
    peoplePending: peopleState.pending,
    peopleError: peopleState.error,
    refreshPeople: peopleState.refresh,
    ensurePeople: peopleState.ensure,
    children,
    primaryChild,
    studentName,
    studentPhoto,
    theme,
    themeVars
  };
}
export {
  usePersonasFamilyPeople as a,
  useResolvedPersonasTheme as b,
  personasFamilyThemeContextKey as p,
  usePersonasFamilyTheme as u
};
//# sourceMappingURL=usePersonasTheme-CmVh5mbY.js.map
