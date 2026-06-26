function normalizeAttendanceText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
}
function dateOnly(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value));
  return match?.[1] || "";
}
function formatAttendanceDate(value, style = "long") {
  const date = dateOnly(value);
  if (!date) return "";
  const parsed = /* @__PURE__ */ new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("es-MX", {
    weekday: style === "long" ? "long" : void 0,
    day: "numeric",
    month: style === "long" ? "long" : "short"
  }).format(parsed);
}
export {
  formatAttendanceDate as f,
  normalizeAttendanceText as n
};
//# sourceMappingURL=attendance-D-E_6rKQ.js.map
