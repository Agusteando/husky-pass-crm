import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import { legacyQuery } from '~/server/utils/mysql'
import { SCHOOL_PLANTELES, normalizeSchoolPlantel } from '~/utils/schoolCatalog'
import { isEffectiveSuperAdmin } from '~/utils/sessionScopes'

interface UserPlantelRow extends RowDataPacket {
  plantel: string | null
}

export function splitPlantelValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => splitPlantelValues(item))
  return String(value ?? '')
    .split(/[,;|/]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function normalizeAssignedSchoolPlanteles(values: unknown[]): string[] {
  const planteles = new Set<string>()
  for (const value of values.flatMap((item) => splitPlantelValues(item))) {
    const plantel = normalizeSchoolPlantel(value)
    if (plantel) planteles.add(plantel)
  }
  const order = new Map<string, number>(SCHOOL_PLANTELES.map((plantel, index) => [plantel, index]))
  return [...planteles].sort((left, right) => (order.get(left) ?? 99) - (order.get(right) ?? 99))
}

export async function readAssignedPlantelValues(user: AppSessionUser): Promise<string[]> {
  if (isEffectiveSuperAdmin(user)) return [...SCHOOL_PLANTELES]

  try {
    const rows = await legacyQuery<UserPlantelRow[]>(
      `SELECT plantel
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [user.id]
    )
    if (rows[0]) return splitPlantelValues(rows[0].plantel)
  } catch {
    // The signed session remains a safe fallback if the legacy source is unavailable.
  }

  return splitPlantelValues(user.plantel)
}

export async function resolveAssignedSchoolPlanteles(user: AppSessionUser): Promise<string[]> {
  if (isEffectiveSuperAdmin(user)) return [...SCHOOL_PLANTELES]
  return normalizeAssignedSchoolPlanteles(await readAssignedPlantelValues(user))
}
