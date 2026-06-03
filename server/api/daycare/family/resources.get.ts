import { defineEventHandler, getQuery } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { getFamilyResources } from '~/server/data/mysqlDaycare'
import { assertDaycareFamily } from '~/server/utils/authz'

const schema = z.object({ type: z.enum(['hw', 'news', 'cal']) })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertDaycareFamily(user)
  const query = schema.parse(getQuery(event))
  return getFamilyResources(user, query.type)
})
