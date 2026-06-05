export function normalizeMatricula(value?: string | number | null) {
  return String(value ?? '').trim().toUpperCase()
}

export function displayMatricula(value?: string | number | null, fallback = '') {
  return normalizeMatricula(value) || fallback
}

export function isMatriculaLike(value?: string | number | null) {
  const normalized = normalizeMatricula(value)
  if (!normalized || normalized.includes('@')) return false
  return /^[A-Z]{1,6}[A-Z0-9-]*\d[A-Z0-9-]*$/.test(normalized)
}

export function displayMatriculaCandidate(value?: string | number | null, fallback = '') {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  return isMatriculaLike(raw) ? normalizeMatricula(raw) : raw
}

export function sameMatricula(left?: string | number | null, right?: string | number | null) {
  const normalizedLeft = normalizeMatricula(left)
  const normalizedRight = normalizeMatricula(right)
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight)
}

export function matriculaSearchText(value?: string | number | null) {
  return normalizeMatricula(value).toLowerCase()
}
