import type { PersonasTheme, PersonasThemeKey } from '~/types/daycare'
import type { ExperienceContext, ExperienceName, InstitutionName } from '~/types/identity'
import {
  experienceThemeVars,
  normalizeNivelIdentity,
  normalizePlantelIdentity,
  resolveExperienceContext,
  visualIdentityForContext
} from '~/utils/experienceIdentity'
import { normalizeMatricula } from './matricula'
import { deriveSchoolPlantelFromMatricula } from './schoolCatalog'

export type PersonasMascotVariant = 'header' | 'hero' | 'empty' | 'help' | 'preview' | 'transition'

export const PA_COLORS = {
  escolar: '#236188',
  daycare: '#618B2F',
  preescolar: '#E83F4B',
  primaria: '#FCBF2C',
  secundaria: '#66A8D8',
  iedis: '#007F92',
  admin: '#334155',
  gray: '#50535A',
  muted: '#86888C'
} as const

type PersonasThemeInput = {
  matricula?: string | number | null
  plantel?: string | null
  nivelEdu?: string | null
  nivel?: string | null
  campus?: string | null
  grupo?: string | null
  themeKey?: string | null
  experience?: string | null
  institution?: string | null
}

function contextForThemeKey(key: PersonasThemeKey): ExperienceContext {
  if (key === 'admin') return { experience: 'admin', institution: null, nivel: null, plantel: null, grupo: null }
  if (key === 'daycare') return { experience: 'guarderia', institution: null, nivel: 'guarderia', plantel: 'CM', grupo: null }
  if (key === 'preescolar') return { experience: 'escolar', institution: 'iecs', nivel: 'preescolar', plantel: null, grupo: null }
  if (key === 'iecs') return { experience: 'escolar', institution: 'iecs', nivel: null, plantel: null, grupo: null }
  if (key === 'primaria') return { experience: 'escolar', institution: 'iedis', nivel: 'primaria', plantel: null, grupo: null }
  if (key === 'secundaria') return { experience: 'escolar', institution: 'iedis', nivel: 'secundaria', plantel: null, grupo: null }
  if (key === 'iedis') return { experience: 'escolar', institution: 'iedis', nivel: null, plantel: null, grupo: null }
  return { experience: 'escolar', institution: null, nivel: null, plantel: null, grupo: null }
}

function themeFromContext(context: ExperienceContext): PersonasTheme {
  const identity = visualIdentityForContext(context)
  return {
    key: identity.key as PersonasThemeKey,
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
    mascot: identity.assets.ambassador || undefined,
    mascotVariants: identity.assets.mascotVariants,
    logo: identity.assets.logo,
    wordmark: identity.assets.wordmark || undefined
  }
}

export const PERSONAS_THEMES: Record<PersonasThemeKey, PersonasTheme> = {
  escolar: themeFromContext(contextForThemeKey('escolar')),
  daycare: themeFromContext(contextForThemeKey('daycare')),
  iecs: themeFromContext(contextForThemeKey('iecs')),
  preescolar: themeFromContext(contextForThemeKey('preescolar')),
  primaria: themeFromContext(contextForThemeKey('primaria')),
  secundaria: themeFromContext(contextForThemeKey('secundaria')),
  iedis: themeFromContext(contextForThemeKey('iedis')),
  admin: themeFromContext(contextForThemeKey('admin'))
}

export function normalizePlantel(value?: string | null) {
  return normalizePlantelIdentity(value) || ''
}

export function normalizeNivel(value?: string | null) {
  return normalizeNivelIdentity(value) || ''
}

export function personasThemeKeyFromMatricula(value?: string | number | null): PersonasThemeKey {
  const plantel = deriveSchoolPlantelFromMatricula(value)
  if (plantel === 'PREEM' || plantel === 'GM' || plantel === 'CT') return 'preescolar'
  if (plantel === 'PM' || plantel === 'PT') return 'primaria'
  if (plantel === 'SM' || plantel === 'ST') return 'secundaria'
  const matricula = normalizeMatricula(value)
  if (matricula.startsWith('CM')) return 'daycare'
  return 'escolar'
}

function themeKeyToExperience(key?: string | null): { experience?: ExperienceName; institution?: InstitutionName; nivel?: string | null; plantel?: string | null } {
  const normalized = String(key || '').trim().toLowerCase() as PersonasThemeKey
  if (!normalized || !PERSONAS_THEMES[normalized]) return {}
  const context = contextForThemeKey(normalized)
  return {
    experience: context.experience,
    institution: context.institution,
    nivel: context.nivel,
    plantel: context.plantel
  }
}

export function resolvePersonasTheme(input: PersonasThemeInput = {}) {
  const explicit = themeKeyToExperience(input.themeKey)
  const resolution = resolveExperienceContext({
    requestedExperience: input.experience || explicit.experience,
    institution: input.institution || explicit.institution,
    matricula: input.matricula,
    plantel: input.plantel || explicit.plantel,
    nivelEdu: input.nivelEdu || input.nivel || explicit.nivel,
    campus: input.campus,
    grupo: input.grupo
  })
  return themeFromContext(resolution.context)
}

export function personasThemeStyle(theme: PersonasTheme) {
  const context = contextForThemeKey(theme.key)
  return experienceThemeVars(visualIdentityForContext({
    ...context,
    institution: theme.key === 'iedis' ? 'iedis' : context.institution,
    nivel: ['preescolar', 'primaria', 'secundaria'].includes(theme.key) ? theme.key : context.nivel
  }))
}

export function allPersonasThemes() {
  return Object.values(PERSONAS_THEMES)
}

export function personasMascot(theme: PersonasTheme, variant: PersonasMascotVariant = 'header') {
  return theme.mascotVariants?.[variant] || theme.mascot || ''
}

export function personasLevelName(theme: PersonasTheme) {
  if (theme.key === 'daycare') return { spanish: 'Guardería', english: 'Daycare' }
  if (theme.key === 'admin') return { spanish: 'Administración', english: 'Administration' }
  if (theme.key === 'escolar' || theme.key === 'iedis') return { spanish: 'Escolar', english: 'School' }
  return { spanish: theme.shortLabel || theme.label, english: theme.englishLabel || theme.label }
}

export function personasInstitutionName(theme: PersonasTheme) {
  if (theme.key === 'daycare') return 'Guardería'
  if (theme.key === 'admin') return 'Administración'
  if (theme.key === 'preescolar' || theme.key === 'iecs') return 'IECS'
  if (theme.key === 'primaria' || theme.key === 'secundaria' || theme.key === 'iedis') return 'IEDIS'
  return 'Escolar'
}

export function personasInstitutionLogo(theme: PersonasTheme, mode: 'logo' | 'wordmark' = 'logo') {
  if (mode === 'wordmark') return theme.wordmark || theme.logo || '/brand/husky-pass-logo.png'
  return theme.logo || '/brand/husky-pass-logo.png'
}
