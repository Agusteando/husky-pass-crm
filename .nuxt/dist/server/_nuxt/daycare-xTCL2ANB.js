function parseLegacyDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const source = String(value).trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(source);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const normalized = source.includes(" ") ? source.replace(" ", "T") : source;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatDate(value, fallback = "Sin fecha") {
  const date = parseLegacyDate(value);
  if (!date || date.getFullYear() < 2e3) return fallback;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}
function formatCalendarDay(value) {
  const date = parseLegacyDate(value);
  if (!date) return { day: "—", weekday: "", month: "" };
  return {
    day: new Intl.DateTimeFormat("es-MX", { day: "2-digit" }).format(date),
    weekday: new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(date),
    month: new Intl.DateTimeFormat("es-MX", { month: "long" }).format(date)
  };
}
function isImageResource(resource) {
  return Boolean(resource && /\.(png|jpe?g|webp)(\?|#|$)/i.test(resource));
}
function isPdfResource(resource) {
  return Boolean(resource && /\.pdf(\?|#|$)/i.test(resource));
}
function stripHtml(value) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function publishedPdfViewerUrl(resource) {
  if (!resource) return "";
  if (/^https?:\/\//i.test(resource)) return resource;
  if (resource.startsWith("/uploads/")) return resource;
  const fileName = resource.split("/").pop()?.split("#")[0]?.split("?")[0];
  if (!fileName) return resource;
  return `https://admin.casitaiedis.edu.mx/pdfjs/web/viewer.html?file=${encodeURIComponent(`/virtual/${fileName}`)}`;
}
function normalizeVirtualAssetUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("/")) return value;
  return `https://admin.casitaiedis.edu.mx/virtual/${value.replace(/^\/?virtual\//, "")}`;
}
function authorizedPersonLabel(indice) {
  return indice === 4 ? "Pase Express" : `Persona ${indice}`;
}
function isHiddenResource(value) {
  return value === true || value === 1 || String(value) === "1" || String(value).toLowerCase() === "hidden";
}
function daycareResourceSection(type) {
  if (type === "hw") return "tareas";
  if (type === "news") return "avisos";
  if (type === "cal") return "calendario";
  return "";
}
export {
  isHiddenResource as a,
  parseLegacyDate as b,
  formatCalendarDay as c,
  daycareResourceSection as d,
  isImageResource as e,
  formatDate as f,
  authorizedPersonLabel as g,
  isPdfResource as i,
  normalizeVirtualAssetUrl as n,
  publishedPdfViewerUrl as p,
  stripHtml as s
};
//# sourceMappingURL=daycare-xTCL2ANB.js.map
