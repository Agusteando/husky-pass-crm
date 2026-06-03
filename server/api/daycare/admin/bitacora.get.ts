import { z } from 'zod'
import { getCurrentBitacora } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({ fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  return getCurrentBitacora(user, query.fecha)
})
