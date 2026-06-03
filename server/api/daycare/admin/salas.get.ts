import { defineEventHandler, getQuery } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { getSalasForUnidad } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({ unidad: z.string().optional().default('') })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  if (!query.unidad.trim()) return []
  return getSalasForUnidad(user, query.unidad)
})
