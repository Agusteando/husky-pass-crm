import type { PersonasTheme, PersonasThemeKey } from '~/types/daycare'

export const PA_COLORS = {
  daycare: '#618B2F',
  preescolar: '#E83F4B',
  primaria: '#FCBF2C',
  secundaria: '#66A8D8',
  iedis: '#007F92',
  gray: '#50535A',
  muted: '#86888C'
} as const

const THEME_LABELS: Record<PersonasThemeKey, string> = {
  daycare: 'IECS',
  preescolar: 'Preescolar',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  iedis: 'IEDIS'
}

const THEME_SHORT_LABELS: Record<PersonasThemeKey, string> = {
  daycare: 'Daycare',
  preescolar: 'Preescolar',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  iedis: 'IEDIS'
}

const THEME_ENGLISH_LABELS: Record<PersonasThemeKey, string> = {
  daycare: 'Daycare',
  preescolar: 'Preschool',
  primaria: 'Elementary School',
  secundaria: 'Middle School',
  iedis: 'Institutional'
}

const THEME_MASCOTS: Record<PersonasThemeKey, string> = {
  daycare: '/personas-autorizadas/ambassadors/daycare-sunny.png',
  preescolar: '/personas-autorizadas/ambassadors/preescolar-joy.png',
  primaria: '/personas-autorizadas/ambassadors/primaria-brave.png',
  secundaria: '/personas-autorizadas/ambassadors/secundaria-hope.png',
  iedis: '/personas-autorizadas/ambassadors/secundaria-hope.png'
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '')
  const parsed = Number.parseInt(value.length === 3 ? value.split('').map((part) => `${part}${part}`).join('') : value, 16)
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255
  }
}

function alpha(hex: string, opacity: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function contrastFor(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.68 ? '#2A2A2A' : '#FFFFFF'
}

function theme(key: PersonasThemeKey, primary: string): PersonasTheme {
  return {
    key,
    label: THEME_LABELS[key],
    shortLabel: THEME_SHORT_LABELS[key],
    englishLabel: THEME_ENGLISH_LABELS[key],
    primary,
    contrast: contrastFor(primary),
    soft: alpha(primary, 0.12),
    border: alpha(primary, 0.28),
    muted: PA_COLORS.muted,
    gray: PA_COLORS.gray,
    institutional: PA_COLORS.iedis,
    mascot: THEME_MASCOTS[key]
  }
}

export const PERSONAS_THEMES: Record<PersonasThemeKey, PersonasTheme> = {
  daycare: theme('daycare', PA_COLORS.daycare),
  preescolar: theme('preescolar', PA_COLORS.preescolar),
  primaria: theme('primaria', PA_COLORS.primaria),
  secundaria: theme('secundaria', PA_COLORS.secundaria),
  iedis: theme('iedis', PA_COLORS.iedis)
}

export function normalizePlantel(value?: string | null) {
  return String(value || '').trim().toUpperCase()
}

export function normalizeNivel(value?: string | null) {
  return String(value || '').trim().toLowerCase()
}

export function resolvePersonasTheme(input: { plantel?: string | null; nivelEdu?: string | null; campus?: string | null; themeKey?: string | null }) {
  const explicit = String(input.themeKey || '').trim().toLowerCase() as PersonasThemeKey
  if (explicit && PERSONAS_THEMES[explicit]) return PERSONAS_THEMES[explicit]

  const plantel = normalizePlantel(input.plantel || input.campus)
  const nivel = normalizeNivel(input.nivelEdu)

  if (nivel.includes('preescolar') || nivel.includes('kinder') || nivel.includes('maternal')) return PERSONAS_THEMES.preescolar
  if (plantel === 'PT' || plantel === 'PM' || nivel.includes('primaria') || nivel.includes('elementary')) return PERSONAS_THEMES.primaria
  if (plantel === 'ST' || plantel === 'SM' || nivel.includes('secundaria') || nivel.includes('secondary')) return PERSONAS_THEMES.secundaria
  if (plantel === 'IEDIS' || nivel.includes('iedis')) return PERSONAS_THEMES.iedis

  return PERSONAS_THEMES.daycare
}

export function personasThemeStyle(theme: PersonasTheme) {
  const rgb = hexToRgb(theme.primary)
  return {
    '--pa-primary': theme.primary,
    '--pa-primary-rgb': `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    '--pa-contrast': theme.contrast,
    '--pa-soft': theme.soft,
    '--pa-border': theme.border,
    '--pa-gray': theme.gray,
    '--pa-muted': theme.muted,
    '--pa-institutional': theme.institutional
  }
}

export function allPersonasThemes() {
  return Object.values(PERSONAS_THEMES)
}

export function personasMascot(theme: PersonasTheme) {
  return theme.mascot || THEME_MASCOTS.daycare
}

export function personasLevelName(theme: PersonasTheme) {
  if (theme.key === 'daycare') return { spanish: 'Guarderia', english: 'Daycare' }
  return { spanish: theme.shortLabel || theme.label, english: theme.englishLabel || theme.label }
}

export function personasInstitutionName(theme: PersonasTheme) {
  return theme.key === 'daycare' || theme.key === 'preescolar' ? 'IECS' : 'IEDIS'
}
