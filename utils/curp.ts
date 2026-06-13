export interface CurpBirthDateResult {
  valid: boolean
  normalized: string
  birthDate: string | null
  reason?: 'empty' | 'format' | 'date'
}

const CURP_PATTERN = /^[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/

export function normalizeCurp(value?: string | null) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '')
}

function isRealDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function parseCurpBirthDate(value?: string | null): CurpBirthDateResult {
  const normalized = normalizeCurp(value)
  if (!normalized) return { valid: false, normalized, birthDate: null, reason: 'empty' }
  if (!CURP_PATTERN.test(normalized)) return { valid: false, normalized, birthDate: null, reason: 'format' }

  const yearPart = Number(normalized.slice(4, 6))
  const month = Number(normalized.slice(6, 8))
  const day = Number(normalized.slice(8, 10))
  const centuryMarker = normalized[16]
  const century = /[A-Z]/.test(centuryMarker) ? 2000 : 1900
  const year = century + yearPart

  if (!isRealDate(year, month, day)) {
    return { valid: false, normalized, birthDate: null, reason: 'date' }
  }

  return {
    valid: true,
    normalized,
    birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
}

export function calculateAgeFromIsoDate(isoDate?: string | null, now = new Date()) {
  if (!isoDate) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!isRealDate(year, month, day)) return null

  let age = now.getFullYear() - year
  const monthDelta = now.getMonth() + 1 - month
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < day)) age -= 1
  return age >= 0 ? age : null
}
