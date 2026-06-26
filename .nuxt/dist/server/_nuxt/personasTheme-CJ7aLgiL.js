import { a as resolveExperienceContext, e as experienceThemeVars, v as visualIdentityForContext } from "./experienceIdentity-DUHnLdZH.js";
function contextForThemeKey(key) {
  if (key === "admin") return { experience: "admin", institution: null, nivel: null, plantel: null, grupo: null };
  if (key === "daycare") return { experience: "guarderia", institution: null, nivel: "guarderia", plantel: "CM", grupo: null };
  if (key === "preescolar") return { experience: "escolar", institution: "iecs", nivel: "preescolar", plantel: null, grupo: null };
  if (key === "iecs") return { experience: "escolar", institution: "iecs", nivel: null, plantel: null, grupo: null };
  if (key === "primaria") return { experience: "escolar", institution: "iedis", nivel: "primaria", plantel: null, grupo: null };
  if (key === "secundaria") return { experience: "escolar", institution: "iedis", nivel: "secundaria", plantel: null, grupo: null };
  if (key === "iedis") return { experience: "escolar", institution: "iedis", nivel: null, plantel: null, grupo: null };
  return { experience: "escolar", institution: null, nivel: null, plantel: null, grupo: null };
}
function themeFromContext(context) {
  const identity = visualIdentityForContext(context);
  return {
    key: identity.key,
    label: identity.label,
    shortLabel: identity.shortLabel,
    englishLabel: identity.officialName,
    primary: identity.primary,
    contrast: identity.contrast,
    soft: identity.soft,
    border: identity.border,
    muted: identity.muted,
    gray: identity.gray,
    institutional: identity.institutional,
    mascot: identity.assets.ambassador || void 0,
    mascotVariants: identity.assets.mascotVariants,
    logo: identity.assets.logo,
    wordmark: identity.assets.wordmark || void 0
  };
}
const PERSONAS_THEMES = {
  escolar: themeFromContext(contextForThemeKey("escolar")),
  daycare: themeFromContext(contextForThemeKey("daycare")),
  iecs: themeFromContext(contextForThemeKey("iecs")),
  preescolar: themeFromContext(contextForThemeKey("preescolar")),
  primaria: themeFromContext(contextForThemeKey("primaria")),
  secundaria: themeFromContext(contextForThemeKey("secundaria")),
  iedis: themeFromContext(contextForThemeKey("iedis")),
  admin: themeFromContext(contextForThemeKey("admin"))
};
function themeKeyToExperience(key) {
  const normalized = String(key || "").trim().toLowerCase();
  if (!normalized || !PERSONAS_THEMES[normalized]) return {};
  const context = contextForThemeKey(normalized);
  return {
    experience: context.experience,
    institution: context.institution,
    nivel: context.nivel,
    plantel: context.plantel
  };
}
function resolvePersonasTheme(input = {}) {
  const explicit = themeKeyToExperience(input.themeKey);
  const resolution = resolveExperienceContext({
    requestedExperience: input.experience || explicit.experience,
    institution: input.institution || explicit.institution,
    matricula: input.matricula,
    plantel: input.plantel || explicit.plantel,
    nivelEdu: input.nivelEdu || input.nivel || explicit.nivel,
    campus: input.campus,
    grupo: input.grupo
  });
  return themeFromContext(resolution.context);
}
function personasThemeStyle(theme) {
  const context = contextForThemeKey(theme.key);
  return experienceThemeVars(visualIdentityForContext({
    ...context,
    institution: theme.key === "iedis" ? "iedis" : context.institution,
    nivel: ["preescolar", "primaria", "secundaria"].includes(theme.key) ? theme.key : context.nivel
  }));
}
function allPersonasThemes() {
  return Object.values(PERSONAS_THEMES);
}
function personasMascot(theme, variant = "header") {
  return theme.mascotVariants?.[variant] || theme.mascot || "";
}
function personasLevelName(theme) {
  if (theme.key === "daycare") return { spanish: "Guardería", english: "Daycare" };
  if (theme.key === "admin") return { spanish: "Administración", english: "Administration" };
  if (theme.key === "escolar" || theme.key === "iedis") return { spanish: "Escolar", english: "School" };
  return { spanish: theme.shortLabel || theme.label, english: theme.englishLabel || theme.label };
}
function personasInstitutionName(theme) {
  if (theme.key === "daycare") return "Guardería";
  if (theme.key === "admin") return "Administración";
  if (theme.key === "preescolar" || theme.key === "iecs") return "IECS";
  if (theme.key === "primaria" || theme.key === "secundaria" || theme.key === "iedis") return "IEDIS";
  return "Escolar";
}
function personasInstitutionLogo(theme, mode = "logo") {
  if (mode === "wordmark") return theme.wordmark || theme.logo || "/brand/husky-pass-logo.png";
  return theme.logo || "/brand/husky-pass-logo.png";
}
export {
  personasLevelName as a,
  personasInstitutionName as b,
  personasInstitutionLogo as c,
  personasThemeStyle as d,
  allPersonasThemes as e,
  personasMascot as p,
  resolvePersonasTheme as r
};
//# sourceMappingURL=personasTheme-CJ7aLgiL.js.map
