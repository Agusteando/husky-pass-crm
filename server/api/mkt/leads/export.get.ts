import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { z } from 'zod'
import { listMktLeads, mktLeadsToCsv } from '~/server/data/marketing'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const isoDateFilter = z.string().trim().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T12:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}, 'La fecha no es válida.')

const schema = z.object({
  search: z.string().trim().max(100).optional(),
  stage: z.string().trim().max(80).optional(),
  channel: z.string().trim().max(80).optional(),
  plantel: z.string().trim().max(20).optional(),
  from: isoDateFilter.optional(),
  to: isoDateFilter.optional(),
  attention: z.enum(['uncontacted', 'stale', 'cold', 'negotiating']).optional()
}).superRefine((value, context) => {
  if (value.from && value.to && value.from > value.to) context.addIssue({ code: z.ZodIssueCode.custom, path: ['from'], message: 'La fecha inicial debe ser anterior a la fecha final.' })
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
