export const DAYCARE_ROSTER_SOURCE_URL = 'https://script.google.com/macros/s/AKfycbxRHKUV9nxTn4k4VONI3Svlcg0dpaaXbGrPAlpO2SXMpDpCNOKgVjD3G_m_e5crm5k9/exec'

export function normalizeRosterText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9@._+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeRosterEmail(value: unknown) {
  return normalizeRosterText(value).toLowerCase().replace(/\s+/g, '')
}

export function normalizeRosterName(value: unknown) {
  return normalizeRosterText(value).toUpperCase()
}

export function normalizeRosterSala(value: unknown) {
  return normalizeRosterName(value)
    .replace(/\bSALA\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function compactRosterName(...parts: unknown[]) {
  return parts.map((part) => normalizeRosterText(part)).filter(Boolean).join(' ')
}

export function unitRosterKey(value: unknown) {
  const raw = String(value || '')
  const digits = raw.match(/\d+/g)?.join('') || ''
  return digits.replace(/^0+/, '') || digits
}

export function rosterSheetMatchesUnidad(sheetName: unknown, unidad: unknown) {
  const sheet = String(sheetName || '').trim()
  const unit = String(unidad || '').trim()
  if (!sheet || !unit) return false
  const normalizedSheet = normalizeRosterName(sheet)
  const normalizedUnit = normalizeRosterName(unit)
  if (normalizedUnit.includes(normalizedSheet)) return true
  const sheetDigits = unitRosterKey(sheet)
  const unitDigits = unitRosterKey(unit)
  return Boolean(sheetDigits && unitDigits && sheetDigits === unitDigits)
}

const SALA_STAGE_ORDER: Record<string, number> = {
  LACTANTES: 1,
  MATERNAL: 2
}

function salaStageParts(value: unknown) {
  const sala = normalizeRosterSala(value)
  const match = /^(LACTANTES|MATERNAL)\s+([A-Z])\s*(\d+)?/.exec(sala)
  if (!match) return null
  const [, family, letter, number] = match
  const familyOrder = SALA_STAGE_ORDER[family] || 0
  const letterOrder = Math.max(1, letter.charCodeAt(0) - 64)
  const suffixOrder = number ? Number(number) : 0
  return familyOrder * 1000 + letterOrder * 20 + suffixOrder
}

export function compareRosterSalaProgression(currentSala: unknown, sourceSala: unknown): 'same' | 'forward' | 'backward' | 'different' {
  const current = normalizeRosterSala(currentSala)
  const source = normalizeRosterSala(sourceSala)
  if (!current || !source) return 'different'
  if (current === source) return 'same'
  const currentStage = salaStageParts(current)
  const sourceStage = salaStageParts(source)
  if (!currentStage || !sourceStage) return 'different'
  if (sourceStage > currentStage) return 'forward'
  if (sourceStage < currentStage) return 'backward'
  return 'different'
}
