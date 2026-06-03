import { z } from 'zod'
import { getAdminResources } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({
  sala: z.coerce.number().int().positive(),
  type: z.enum(['hw', 'news', 'cal'])
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  return getAdminResources(user, query.sala, query.type)
})
