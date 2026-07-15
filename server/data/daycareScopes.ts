import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import type { Sala } from '~/types/daycare'
import { assertUnidadAccess } from '~/server/utils/authz'
import { legacyQuery } from '~/server/utils/mysql'

export async function getSalasForUnidad(user: AppSessionUser, unidad: string) {
  assertUnidadAccess(user, unidad)
  const rows = await legacyQuery<(Sala & RowDataPacket)[]>('SELECT id, sala, unidad FROM salas WHERE unidad = ? ORDER BY id ASC', [unidad])
  return rows.map((row) => ({ id: Number(row.id), sala: row.sala, unidad: row.unidad }))
}

export async function listAdminDaycareUnits(user: AppSessionUser) {
  if (!user.isSuperAdmin) return Array.from(new Set(user.unidades.filter(Boolean)))
  const rows = await legacyQuery<(RowDataPacket & { unidad: string | null })[]>(
    `SELECT DISTINCT unidad
     FROM salas
     WHERE unidad IS NOT NULL AND TRIM(unidad) <> ''
     ORDER BY unidad ASC`
  )
  return rows.map((row) => String(row.unidad || '').trim()).filter(Boolean)
}
