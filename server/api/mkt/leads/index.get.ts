import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { listMktLeads } from '~/server/data/marketing'
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
  to: z.string().trim().max(10).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional()
})

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const query = parseOrBadRequest(schema, getQuery(event), 'Revisa los filtros de informes.')
  return withRequestBoundary(event, 'mkt.leads.list', () => listMktLeads(query), { userId: user.id })
})
