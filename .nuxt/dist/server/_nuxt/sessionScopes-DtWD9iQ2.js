const DAYCARE_ADMIN_ROLE = "ROLE_HUSKY";
function hasRoleToken(roles, role) {
  return Boolean(roles?.some((candidate) => candidate.trim().toUpperCase() === role.toUpperCase()));
}
function hasFamilyScope(user, scope) {
  if (!user || user.kind !== "family") return false;
  if (scope === "daycare") {
    const daycare = user.scopes?.daycare;
    return Boolean(daycare?.unidad && daycare?.sala);
  }
  if (scope === "personasAutorizadas") {
    return Boolean(user.scopes?.personasAutorizadas);
  }
  return false;
}
function hasDaycareAdminScope(user) {
  if (!user || user.kind !== "admin") return false;
  if (user.isSuperAdmin) return true;
  const hasPermission = hasRoleToken(user.roles, DAYCARE_ADMIN_ROLE) || user.routes.some((route) => /guarder[ií]a|husky|daycare/i.test(route.route));
  return hasPermission && user.unidades.length > 0;
}
function defaultFamilyRoute(user) {
  const daycare = hasFamilyScope(user, "daycare");
  const personas = hasFamilyScope(user, "personasAutorizadas");
  if (daycare && personas) return "/familia";
  if (daycare) return "/familia/daycare";
  if (personas) return "/familia/personas-autorizadas";
  return "/login";
}
function familyNavItems(user, activeScope) {
  const items = [];
  const showDaycare = activeScope ? activeScope === "daycare" || activeScope === "chooser" : hasFamilyScope(user, "daycare");
  const showPersonas = activeScope ? activeScope === "personasAutorizadas" || activeScope === "attendance" || activeScope === "chooser" : hasFamilyScope(user, "personasAutorizadas");
  if (showDaycare && hasFamilyScope(user, "daycare")) {
    items.push(
      { label: "Guardería", to: "/familia/daycare", icon: "daycare" },
      { label: "Tareas", to: "/familia/daycare/tareas", icon: "edit" },
      { label: "Avisos", to: "/familia/daycare/avisos", icon: "survey" },
      { label: "Calendario", to: "/familia/daycare/calendario", icon: "calendar" }
    );
  }
  if (showPersonas && hasFamilyScope(user, "personasAutorizadas")) {
    items.push({ label: "Personas autorizadas", to: "/familia/personas-autorizadas", icon: "people" });
    items.push({ label: "Asistencia", to: "/familia/asistencia", icon: "calendar" });
  }
  if (items.length) {
    items.push({ label: "Seguridad", to: "/familia/cuenta/seguridad", icon: "security" });
  }
  return items;
}
export {
  hasDaycareAdminScope as a,
  defaultFamilyRoute as d,
  familyNavItems as f,
  hasFamilyScope as h
};
//# sourceMappingURL=sessionScopes-DtWD9iQ2.js.map
