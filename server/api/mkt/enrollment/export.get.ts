import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { z } from 'zod'
import { downloadMktEnrollmentExport } from '~/server/data/marketingEnrollment'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  plantel: z.string().trim().min(1).max(40),
  ciclo: z.string().trim().regex(/^\d{4}$/),
  search: z.string().trim().max(120).optional().default(''),
  grado: z.string().trim().max(80).optional().default(''),
  grupo: z.string().trim().max(80).optional().default(''),
  nivel: z.string().trim().max(80).optional().default(''),
  status: z.string().trim().max(80).optional().default('')
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const query = parseOrBadRequest(schema, getQuery(event), 'Los filtros de exportación no son válidos.')
  const { buffer, filename } = await downloadMktEnrollmentExport(user, query)
  setResponseHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'Content-Length', buffer.length)
  return buffer
})
