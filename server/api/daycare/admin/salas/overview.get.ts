import { defineEventHandler, getQuery } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { getSalasOverviewForUnidad } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({ unidad: z.string().optional().default('') })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  const unidad = query.unidad.trim()
  if (!unidad) return []
  return getSalasOverviewForUnidad(user, unidad)
})
