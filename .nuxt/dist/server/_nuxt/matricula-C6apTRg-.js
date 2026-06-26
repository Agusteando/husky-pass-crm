function normalizeMatricula(value) {
  return String(value ?? "").trim().toUpperCase();
}
function displayMatricula(value, fallback = "") {
  return normalizeMatricula(value) || fallback;
}
function isMatriculaLike(value) {
  const normalized = normalizeMatricula(value);
  if (!normalized || normalized.includes("@")) return false;
  return /^[A-Z]{1,6}[A-Z0-9-]*\d[A-Z0-9-]*$/.test(normalized);
}
function displayMatriculaCandidate(value, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  return isMatriculaLike(raw) ? normalizeMatricula(raw) : raw;
}
export {
  displayMatricula as a,
  displayMatriculaCandidate as d,
  normalizeMatricula as n
};
//# sourceMappingURL=matricula-C6apTRg-.js.map
