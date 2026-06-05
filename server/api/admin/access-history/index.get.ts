import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { assertAccessHistoryAdmin } from '~/server/utils/authz'
import { getAdminAccessHistory } from '~/server/data/accessHistory'
import { requireSession } from '~/server/utils/session'

const schema = z.object({
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  plantel: z.string().optional().default(''),
  search: z.string().optional().default(''),
  limit: z.coerce.number().int().min(25).max(1000).optional().default(500)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertAccessHistoryAdmin(user)
  return getAdminAccessHistory(schema.parse(getQuery(event)))
})
