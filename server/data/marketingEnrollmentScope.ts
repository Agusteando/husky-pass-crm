import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import { legacyQuery } from '~/server/utils/mysql'
import { isEffectiveSuperAdmin } from '~/utils/sessionScopes'

export const AURORA_ENROLLMENT_PLANTELES = ['PREEM', 'PREET', 'GM', 'PM', 'PT', 'SM', 'ST'] as const
export type AuroraEnrollmentPlantel = typeof AURORA_ENROLLMENT_PLANTELES[number]

interface AssignedPlantelRow extends RowDataPacket {
  plantel: string | null
  is_global: number | boolean | null
}

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

  const fromSession = normalizeAuroraEnrollmentPlanteles([
    ...(user.plantel || []),
    user.campus || ''
  ])

  let rows: AssignedPlantelRow[] = []
  try {
    rows = await legacyQuery<AssignedPlantelRow[]>(
      `SELECT DISTINCT plantel, is_global
       FROM gestion_escolar_permissions
       WHERE user_id = ?
         AND enabled = 1
         AND (capability IN ('role_mkt', 'role_ctrl') OR capability IS NULL OR TRIM(CAST(capability AS CHAR)) = '')
         AND (
           is_global = 1 OR (
             is_global = 0
             AND plantel IS NOT NULL
             AND TRIM(CAST(plantel AS CHAR)) <> ''
           )
         )
       ORDER BY plantel ASC`,
      [user.id]
    )
  } catch {
    // Older deployments may not have the permission table available to this connection.
    // The signed session and campus remain safe fallbacks.
  }

  if (rows.some((row) => row.is_global === true || Number(row.is_global) === 1)) return [...AURORA_ENROLLMENT_PLANTELES]

  return normalizeAuroraEnrollmentPlanteles([
    ...fromSession,
    ...rows.map((row) => row.plantel || '')
  ])
}
