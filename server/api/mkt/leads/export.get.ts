import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { z } from 'zod'
import { listMktLeads, mktLeadsToCsv } from '~/server/data/marketing'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  search: z.string().trim().max(100).optional(),
  stage: z.string().trim().max(80).optional(),
  channel: z.string().trim().max(80).optional(),
  plantel: z.string().trim().max(20).optional(),
  from: z.string().trim().max(10).optional(),
  to: z.string().trim().max(10).optional()
})

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const query = parseOrBadRequest(schema, getQuery(event), 'Revisa los filtros del archivo.')
  return withRequestBoundary(event, 'mkt.leads.export', async () => {
    const response = await listMktLeads({ ...query, limit: 5000 })
    setResponseHeader(event, 'content-type', 'text/csv; charset=utf-8')
    setResponseHeader(event, 'content-disposition', `attachment; filename="informes-mkt-${new Date().toISOString().slice(0, 10)}.csv"`)
    return mktLeadsToCsv(response.leads)
  }, { userId: user.id })
})
