import type { AppSessionUser } from '~/types/session'
import type {
  ExperienceAssets,
  ExperienceContext,
  ExperienceContextInput,
  ExperienceName,
  ExperienceResolution,
  ExperienceVisualIdentity,
  InstitutionName
} from '~/types/identity'
import { normalizeMatricula } from './matricula'
import { hasFamilyScope } from './sessionScopes'

const HUSKY_LOGO = '/brand/husky-pass-logo.png'
const IECS_LOGO = '/brand/iecs-logo.png'
const IECS_WORDMARK = '/brand/iecs-wordmark-gradient.png'
const IEDIS_LOGO = '/brand/iedis-logo.png'
const IEDIS_WORDMARK = '/brand/iedis-wordmark-gradient.png'

const LEVEL_ASSETS = {
  guarderia: {
    header: '/personas-autorizadas/ambassadors/daycare-sunny.png',
    hero: '/personas-autorizadas/mascots/sunny-guarderia/1-SUNNY-GUARDERIA/SUNNY-1.png',
    empty: '/personas-autorizadas/mascots/sunny-guarderia/1-SUNNY-GUARDERIA/SUNNY-5.png',
    help: '/personas-autorizadas/mascots/sunny-guarderia/1-SUNNY-GUARDERIA/SUNNY-3.png',
    preview: '/personas-autorizadas/mascots/sunny-guarderia/1-SUNNY-GUARDERIA/SUNNY-8.png',
    transition: '/personas-autorizadas/ambassadors/daycare-sunny.png'
  },
  preescolar: {
    header: '/personas-autorizadas/ambassadors/preescolar-joy.png',
    hero: '/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-1.png',
    empty: '/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-7.png',
    help: '/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-3.png',
    preview: '/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-14.png',
    transition: '/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-4.png'
  },
  primaria: {
    header: '/personas-autorizadas/ambassadors/primaria-brave.png',
    hero: '/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-1.1.png',
    empty: '/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-3.png',
    help: '/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-5.png',
    preview: '/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-10.png',
    transition: '/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-6.png'
  },
  secundaria: {
    header: '/personas-autorizadas/ambassadors/secundaria-hope.png',
    hero: '/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-1.png',
    empty: '/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-5.png',
    help: '/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-3.png',
    preview: '/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-7.png',
    transition: '/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-4.png'
  }
} as const

const EXPERIENCE_LABELS: Record<ExperienceName, ExperienceVisualIdentity['officialName']> = {
  escolar: 'Experiencia Escolar',
  guarderia: 'Experiencia Guardería',
  admin: 'Experiencia Administrativa'
}

function clean(value?: string | number | null) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

function cleanLower(value?: string | number | null) {
  return clean(value)?.toLowerCase() || ''
}

function cleanUpper(value?: string | number | null) {
  return clean(value)?.toUpperCase() || ''
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
  return luminance > 0.68 ? '#26313d' : '#ffffff'
}

export function normalizeExperienceName(value?: string | null): ExperienceName | null {
  const normalized = String(value || '').trim().toLowerCase()
  if (['escolar', 'school', 'experiencia-escolar'].includes(normalized)) return 'escolar'
  if (['guarderia', 'guardería', 'daycare', 'experiencia-guarderia', 'experiencia-guardería'].includes(normalized)) return 'guarderia'
  if (['admin', 'administrativa', 'administracion', 'administración', 'superadmin', 'experiencia-administrativa'].includes(normalized)) return 'admin'
  return null
}

export function normalizeInstitutionName(value?: string | null): InstitutionName {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'iecs') return 'iecs'
  if (normalized === 'iedis') return 'iedis'
  return null
}

export function normalizeNivelIdentity(value?: string | null) {
  const nivel = cleanLower(value)
  if (!nivel) return null
  if (/guarder|lactante|baby|nursery/.test(nivel)) return 'guarderia'
  if (/preescolar|preeschool|preschool|kinder|kínder|kindergarten/.test(nivel)) return 'preescolar'
  if (/primaria|elementary/.test(nivel)) return 'primaria'
  if (/secundaria|secondary|middle/.test(nivel)) return 'secundaria'
  return nivel
}

export function normalizePlantelIdentity(value?: string | null) {
  return cleanUpper(value)
}

function requestedFromRoute(routePath?: string | null): ExperienceName | null {
  const path = String(routePath || '').toLowerCase()
  if (!path) return null
  if (path.startsWith('/admin')) return 'admin'
  if (path.startsWith('/familia/daycare') || path.startsWith('/registro-guarderia') || path.startsWith('/login/guarderia')) return 'guarderia'
  if (path.startsWith('/login/escolar')) return 'escolar'
  return null
}

function experienceFromStudent(input: ExperienceContextInput): ExperienceName | null {
  const matricula = normalizeMatricula(input.matricula)
  const plantel = normalizePlantelIdentity(input.plantel || input.campus)

  if (matricula.startsWith('CM') || plantel === 'CM') return 'guarderia'
  if (matricula.startsWith('PREEM') || matricula.startsWith('PREET') || matricula.startsWith('PM') || matricula.startsWith('PT') || matricula.startsWith('SM') || matricula.startsWith('ST')) return 'escolar'
  if (plantel && ['PREEM', 'PREET', 'PM', 'PT', 'SM', 'ST', 'IECS', 'IEDIS'].includes(plantel)) return 'escolar'
  return null
}

export function institutionFromContextData(input: ExperienceContextInput): InstitutionName {
  const explicit = normalizeInstitutionName(input.institution)
  if (explicit) return explicit

  const matricula = normalizeMatricula(input.matricula)
  const plantel = normalizePlantelIdentity(input.plantel || input.campus)
  const nivel = normalizeNivelIdentity(input.nivel || input.nivelEdu)

  if (plantel === 'IECS' || plantel === 'PREEM' || plantel === 'PREET' || matricula.startsWith('PREEM') || matricula.startsWith('PREET')) return 'iecs'
  if (plantel === 'IEDIS' || plantel === 'PM' || plantel === 'PT' || plantel === 'SM' || plantel === 'ST') return 'iedis'
  if (matricula.startsWith('PM') || matricula.startsWith('PT') || matricula.startsWith('SM') || matricula.startsWith('ST')) return 'iedis'
  if (nivel === 'preescolar') return 'iecs'
  if (nivel === 'primaria' || nivel === 'secundaria') return 'iedis'
  return null
}

function userCanUseExperience(user: AppSessionUser | null | undefined, experience: ExperienceName) {
  if (!user) return false
  if (experience === 'admin') return user.kind === 'admin'
  if (user.kind !== 'family') return false
  if (experience === 'guarderia') return hasFamilyScope(user, 'daycare')
  return hasFamilyScope(user, 'personasAutorizadas')
}

export function defaultLoginRouteForExperience(_experience: ExperienceName) {
  return '/login'
}

export function recoveryRouteForExperience(experience: ExperienceName) {
  return `/recuperar-contrasena?experiencia=${encodeURIComponent(experience)}`
}

export function defaultRouteForExperience(user: AppSessionUser | null | undefined, experience: ExperienceName) {
  if (experience === 'admin') return user?.isSuperAdmin ? '/admin/superadmin' : '/admin/daycare/salas'
  if (experience === 'guarderia' && hasFamilyScope(user, 'daycare')) return '/familia/daycare'
  if (experience === 'escolar' && hasFamilyScope(user, 'personasAutorizadas')) return '/familia/personas-autorizadas'
  return '/login'
}

export function resolveExperienceContext(input: ExperienceContextInput = {}): ExperienceResolution {
  const explicitRequested = normalizeExperienceName(input.requestedExperience)
  const routeRequested = requestedFromRoute(input.routePath)
  const fromStudent = experienceFromStudent(input)
  const user = input.user || null
  const missing: string[] = []
  let conflict: string | null = null
  let status: ExperienceResolution['status'] = 'resolved'
  let reason: string

  let experience: ExperienceName
  if (user?.kind === 'admin' || explicitRequested === 'admin' || routeRequested === 'admin') {
    experience = 'admin'
    reason = 'resolved-administrative-context'
  } else if (explicitRequested) {
    experience = explicitRequested
    reason = 'resolved-from-explicit-intent'
  } else if (fromStudent) {
    experience = fromStudent
    reason = 'resolved-from-student-data'
  } else if (routeRequested) {
    experience = routeRequested
    reason = 'resolved-from-route-intent'
  } else if (user?.kind === 'family') {
    const hasDaycare = hasFamilyScope(user, 'daycare')
    const hasSchool = hasFamilyScope(user, 'personasAutorizadas')
    if (hasSchool && !hasDaycare) {
      experience = 'escolar'
      reason = 'resolved-from-family-school-scope'
    } else if (hasDaycare && !hasSchool) {
      experience = 'guarderia'
      reason = 'resolved-from-family-daycare-scope'
    } else {
      experience = 'escolar'
      status = 'neutral'
      reason = 'ambiguous-family-experience-neutral-escolar'
      missing.push('requestedExperience', 'studentContext')
    }
  } else {
    experience = 'escolar'
    status = 'neutral'
    reason = 'unauthenticated-neutral-escolar'
  }

  if (user && !userCanUseExperience(user, experience)) {
    conflict = `session-kind-or-scope-does-not-match-${experience}`
    status = 'blocked'
  }

  if (fromStudent && explicitRequested && experience !== 'admin' && fromStudent !== experience) {
    conflict = `student-context-${fromStudent}-conflicts-with-${experience}`
    status = 'blocked'
  }

  const nivel = normalizeNivelIdentity(input.nivel || input.nivelEdu)
  const plantel = normalizePlantelIdentity(input.plantel || input.campus)
  const context: ExperienceContext = {
    experience,
    institution: experience === 'escolar' ? institutionFromContextData(input) : null,
    nivel,
    plantel,
    grupo: clean(input.grupo)
  }

  if (context.experience === 'escolar' && !context.institution) {
    status = status === 'blocked' ? status : 'neutral'
    reason = reason === 'resolved-from-domain-data' ? 'school-institution-unresolved-neutral-escolar' : reason
    missing.push('institution')
  }

  return { context, status, reason, missing: Array.from(new Set(missing)), conflict }
}

function assetsForContext(context: ExperienceContext): ExperienceAssets {
  if (context.experience === 'admin') {
    return {
      logo: HUSKY_LOGO,
      huskyLogo: HUSKY_LOGO,
      emailLogo: HUSKY_LOGO,
      documentLogo: HUSKY_LOGO
    }
  }

  if (context.experience === 'guarderia') {
    return {
      logo: HUSKY_LOGO,
      huskyLogo: HUSKY_LOGO,
      ambassador: LEVEL_ASSETS.guarderia.header,
      mascotVariants: LEVEL_ASSETS.guarderia,
      emailLogo: HUSKY_LOGO,
      documentLogo: HUSKY_LOGO
    }
  }

  const logo = context.institution === 'iedis' ? IEDIS_LOGO : context.institution === 'iecs' ? IECS_LOGO : HUSKY_LOGO
  const wordmark = context.institution === 'iedis' ? IEDIS_WORDMARK : context.institution === 'iecs' ? IECS_WORDMARK : null
  const nivel = context.nivel || ''
  const mascotVariants = nivel === 'preescolar'
    ? LEVEL_ASSETS.preescolar
    : nivel === 'primaria'
      ? LEVEL_ASSETS.primaria
      : nivel === 'secundaria'
        ? LEVEL_ASSETS.secundaria
        : undefined
  return {
    logo,
    wordmark,
    huskyLogo: HUSKY_LOGO,
    ambassador: mascotVariants?.header || null,
    mascotVariants,
    emailLogo: logo,
    documentLogo: logo
  }
}

function identityKey(context: ExperienceContext) {
  if (context.experience === 'admin') return 'admin'
  if (context.experience === 'guarderia') return 'guarderia'
  return context.nivel && ['preescolar', 'primaria', 'secundaria'].includes(context.nivel)
    ? context.nivel
    : context.institution || 'escolar'
}

function primaryForContext(context: ExperienceContext) {
  if (context.experience === 'admin') return '#334155'
  if (context.experience === 'guarderia') return '#618B2F'
  if (context.nivel === 'preescolar') return '#E83F4B'
  if (context.nivel === 'primaria') return '#FCBF2C'
  if (context.nivel === 'secundaria') return '#66A8D8'
  if (context.institution === 'iedis') return '#007F92'
  if (context.institution === 'iecs') return '#2F7D54'
  return '#236188'
}

function levelLabel(context: ExperienceContext) {
  if (context.experience === 'admin') return 'Administración'
  if (context.experience === 'guarderia') return 'Guardería'
  if (context.nivel === 'preescolar') return 'Preescolar'
  if (context.nivel === 'primaria') return 'Primaria'
  if (context.nivel === 'secundaria') return 'Secundaria'
  return 'Escolar'
}

function identityLabel(context: ExperienceContext) {
  if (context.experience === 'admin') return 'Administración'
  if (context.experience === 'guarderia') return 'Guardería'
  if (context.institution === 'iecs') return 'IECS'
  if (context.institution === 'iedis') return 'IEDIS'
  return 'Escolar'
}

export function visualIdentityForContext(context: ExperienceContext): ExperienceVisualIdentity {
  const primary = primaryForContext(context)
  const assets = assetsForContext(context)
  return {
    key: identityKey(context),
    officialName: EXPERIENCE_LABELS[context.experience],
    context,
    label: identityLabel(context),
    shortLabel: identityLabel(context),
    levelLabel: levelLabel(context),
    primary,
    contrast: contrastFor(primary),
    soft: alpha(primary, 0.12),
    border: alpha(primary, 0.28),
    muted: context.experience === 'admin' ? '#64748B' : '#86888C',
    gray: context.experience === 'admin' ? '#1E293B' : '#50535A',
    institutional: context.institution === 'iedis' ? '#007F92' : context.institution === 'iecs' ? '#2F7D54' : primary,
    surface: context.experience === 'admin' ? '#F8FAFC' : '#FFFFFF',
    page: context.experience === 'admin' ? '#F3F6F9' : context.experience === 'guarderia' ? '#F6F8F1' : '#F7F9FB',
    assets,
    allowedAssetFamilies: context.experience === 'admin'
      ? ['admin', 'husky-pass']
      : context.experience === 'guarderia'
        ? ['guarderia', 'husky-pass', 'grupo-icons']
        : ['escolar', context.institution || 'school-neutral', context.nivel || 'school-neutral', 'husky-pass', 'grupo-icons']
  }
}

export function experienceThemeVars(identity: ExperienceVisualIdentity) {
  const rgb = hexToRgb(identity.primary)
  return {
    '--color-brand-950': identity.context.experience === 'admin' ? '#0F172A' : undefined,
    '--color-brand-900': identity.gray,
    '--color-brand-800': identity.primary,
    '--color-brand-700': identity.primary,
    '--color-brand-600': identity.primary,
    '--color-brand-300': identity.border,
    '--color-brand-200': identity.border,
    '--color-brand-100': identity.soft,
    '--color-ink': identity.gray,
    '--color-muted': identity.muted,
    '--color-border': identity.border,
    '--color-page': identity.page,
    '--surface-muted': identity.context.experience === 'admin' ? '#F8FAFC' : '#F8FAF4',
    '--pa-primary': identity.primary,
    '--pa-primary-rgb': `${rgb.r}, ${rgb.g}, ${rgb.b}`,
    '--pa-contrast': identity.contrast,
    '--pa-soft': identity.soft,
    '--pa-border': identity.border,
    '--pa-gray': identity.gray,
    '--pa-muted': identity.muted,
    '--pa-institutional': identity.institutional
  }
}

export function resolveVisualIdentity(input: ExperienceContextInput = {}) {
  const resolution = resolveExperienceContext(input)
  return {
    ...resolution,
    identity: visualIdentityForContext(resolution.context),
    vars: experienceThemeVars(visualIdentityForContext(resolution.context))
  }
}

export function identityDiagnosticsPayload(input: ExperienceResolution & { routePath?: string | null; role?: string | null; userId?: number | string | null }) {
  return {
    route: input.routePath || null,
    experienceResolved: input.context.experience,
    institution: input.context.institution,
    nivel: input.context.nivel,
    plantel: input.context.plantel,
    grupo: input.context.grupo,
    reason: input.reason,
    missing: input.missing,
    conflict: input.conflict,
    role: input.role || null,
    userId: input.userId || null
  }
}
