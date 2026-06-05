import type { SchoolYearRange } from '~/types/attendance'

const SCHOOL_YEAR_START_MONTH = 7

export function normalizeAttendanceText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

export function makeSchoolYearRange(startYear: number): SchoolYearRange {
  return {
    label: `${startYear}-${startYear + 1}`,
    startDate: `${startYear}-08-01`,
    endDate: `${startYear + 1}-07-31`
  }
}

export function parseSchoolYearLabel(value?: string | null): SchoolYearRange | null {
  const raw = String(value || '').trim()
  const full = /^(\d{4})-(\d{4})$/.exec(raw)
  if (full) {
    const start = Number(full[1])
    const end = Number(full[2])
    if (end === start + 1) return makeSchoolYearRange(start)
  }

  const single = /^(\d{4})$/.exec(raw)
  if (single) return makeSchoolYearRange(Number(single[1]))

  return null
}

export function currentSchoolYearStart(reference = new Date()) {
  const year = reference.getFullYear()
  return reference.getMonth() < SCHOOL_YEAR_START_MONTH ? year - 1 : year
}

export function buildSchoolYearOptions(extraCycle?: string | null, reference = new Date()) {
  const currentStart = currentSchoolYearStart(reference)
  const ranges = [
    makeSchoolYearRange(currentStart),
    makeSchoolYearRange(currentStart - 1),
    makeSchoolYearRange(currentStart - 2),
    makeSchoolYearRange(currentStart - 3)
  ]

  const extra = parseSchoolYearLabel(extraCycle)
  if (extra && !ranges.some((range) => range.label === extra.label)) ranges.push(extra)

  return ranges
    .sort((a, b) => b.label.localeCompare(a.label))
    .map((range) => ({ ...range, isCurrent: range.label === `${currentStart}-${currentStart + 1}` }))
}

export function resolveSchoolYearOption(label: string | null | undefined, options: SchoolYearRange[], reference = new Date()) {
  const fallback = options.find((option) => option.isCurrent) || options[0] || makeSchoolYearRange(currentSchoolYearStart(reference))
  const parsed = parseSchoolYearLabel(label)
  if (!parsed) return fallback

  const currentStart = currentSchoolYearStart(reference)
  const startYear = Number(parsed.label.slice(0, 4))
  if (!Number.isFinite(startYear) || startYear < currentStart - 8 || startYear > currentStart + 1) return fallback

  return options.find((option) => option.label === parsed.label) || { ...parsed, isCurrent: parsed.label === `${currentStart}-${currentStart + 1}` }
}

export function dateOnly(value?: string | Date | null) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value))
  return match?.[1] || ''
}

export function formatAttendanceDate(value?: string | null, style: 'short' | 'long' = 'long') {
  const date = dateOnly(value)
  if (!date) return ''
  const parsed = new Date(`${date}T12:00:00`)
  return new Intl.DateTimeFormat('es-MX', {
    weekday: style === 'long' ? 'long' : undefined,
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short'
  }).format(parsed)
}

export function formatAttendanceTime(value?: string | null) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const [hours = '0', minutes = '00'] = raw.split(':')
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}
