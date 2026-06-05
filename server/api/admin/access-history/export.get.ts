import { defineEventHandler, getQuery, setHeader } from 'h3'
import { z } from 'zod'
import { assertAccessHistoryAdmin } from '~/server/utils/authz'
import { accessHistoryCsv, getAdminAccessHistory } from '~/server/data/accessHistory'
import { requireSession } from '~/server/utils/session'

const schema = z.object({
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  plantel: z.string().optional().default(''),
  search: z.string().optional().default(''),
  limit: z.coerce.number().int().min(25).max(1000).optional().default(1000)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertAccessHistoryAdmin(user)
  const response = await getAdminAccessHistory(schema.parse(getQuery(event)))
  const csv = accessHistoryCsv(response)

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="historial-accesos-${response.range.startDate}-${response.range.endDate}.csv"`)
  return `\uFEFF${csv}`
})
