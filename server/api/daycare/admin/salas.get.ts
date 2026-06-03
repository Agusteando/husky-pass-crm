import { z } from 'zod'
import { getSalasForUnidad } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({ unidad: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  return getSalasForUnidad(user, query.unidad)
})
