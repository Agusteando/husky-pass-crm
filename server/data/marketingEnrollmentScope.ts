import type { AppSessionUser } from '~/types/session'
import { readAssignedPlantelValues } from '~/server/data/userPlantelScope'
import { isEffectiveSuperAdmin } from '~/utils/sessionScopes'

export const AURORA_ENROLLMENT_PLANTELES = ['PREEM', 'PREET', 'GM', 'PM', 'PT', 'SM', 'ST'] as const
export type AuroraEnrollmentPlantel = typeof AURORA_ENROLLMENT_PLANTELES[number]

const AURORA_PLANTEL_SET = new Set<string>(AURORA_ENROLLMENT_PLANTELES)

const normalizeWords = (value: unknown) => String(value ?? '')
  .trim()
  .toUpperCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^A-Z0-9]+/g, ' ')
  .trim()

export function normalizeAuroraEnrollmentPlantel(value: unknown): AuroraEnrollmentPlantel | '' {
  const words = normalizeWords(value)
  if (!words) return ''
  const compact = words.replace(/\s+/g, '')

  const aliases: Record<string, AuroraEnrollmentPlantel> = {
    GM: 'GM',
    GUARDERIAMETEPEC: 'GM',
    CT: 'PREET',
    PREET: 'PREET',
    PREESCOLARVESPERTINO: 'PREET',
    PREESCOLARVESPERTINA: 'PREET',
    CM: 'PREEM',
    PREEM: 'PREEM',
    PREESCOLARMATUTINO: 'PREEM',
    PREESCOLARMATUTINA: 'PREEM',
    PMA: 'PM',
    PMB: 'PM',
    PM: 'PM',
    PRIMARIAMATUTINO: 'PM',
    PRIMARIAMATUTINA: 'PM',
    PT: 'PT',
    PRIMARIAVESPERTINO: 'PT',
    PRIMARIAVESPERTINA: 'PT',
    SM: 'SM',
    SECUNDARIAMATUTINO: 'SM',
    SECUNDARIAMATUTINA: 'SM',
    ST: 'ST',
    SECUNDARIAVESPERTINO: 'ST',
    SECUNDARIAVESPERTINA: 'ST'
  }

  if (aliases[compact]) return aliases[compact]
  if (AURORA_PLANTEL_SET.has(compact)) return compact as AuroraEnrollmentPlantel

  const code = words.split(/\s+/)
    .map((token) => aliases[token] || (AURORA_PLANTEL_SET.has(token) ? token as AuroraEnrollmentPlantel : ''))
    .find(Boolean)
  if (code) return code

  if (words.includes('PREESCOLAR') && words.includes('VESPERT')) return 'PREET'
  if (words.includes('PREESCOLAR') && words.includes('MATUT')) return 'PREEM'
  if (words.includes('PRIMARIA') && words.includes('VESPERT')) return 'PT'
  if (words.includes('PRIMARIA') && words.includes('MATUT')) return 'PM'
  if (words.includes('SECUNDARIA') && words.includes('VESPERT')) return 'ST'
  if (words.includes('SECUNDARIA') && words.includes('MATUT')) return 'SM'
  return ''
}

function splitScopeValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => splitScopeValues(item))
  return String(value ?? '').split(/[,;|/]+/).map((item) => item.trim()).filter(Boolean)
}

export function normalizeAuroraEnrollmentPlanteles(values: unknown[]) {
  const result = new Set<AuroraEnrollmentPlantel>()
  for (const value of values.flatMap(splitScopeValues)) {
    const plantel = normalizeAuroraEnrollmentPlantel(value)
    if (plantel) result.add(plantel)
  }
  return Array.from(result)
}

export async function resolveMarketingEnrollmentPlanteles(user: AppSessionUser) {
  if (isEffectiveSuperAdmin(user)) return [...AURORA_ENROLLMENT_PLANTELES]
  return normalizeAuroraEnrollmentPlanteles(await readAssignedPlantelValues(user))
}
