import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { listMktEnrollmentStudents } from '~/server/data/marketingEnrollment'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  plantel: z.string().trim().min(1).max(40),
  ciclo: z.string().trim().regex(/^\d{4}$/),
  search: z.string().trim().max(120).optional().default(''),
  grado: z.string().trim().max(80).optional().default(''),
  grupo: z.string().trim().max(80).optional().default(''),
  nivel: z.string().trim().max(80).optional().default(''),
  status: z.string().trim().max(80).optional().default(''),
  cursor: z.string().trim().max(300).optional().default(''),
  limit: z.coerce.number().int().min(25).max(500).optional().default(100)
})

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const query = parseOrBadRequest(schema, getQuery(event), 'Los filtros de matrícula actual no son válidos.')
  return withRequestBoundary(event, 'mkt.enrollment.students', () => listMktEnrollmentStudents(user, query), {
    userId: user.id,
    plantel: query.plantel
  })
})
