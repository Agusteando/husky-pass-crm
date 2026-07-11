import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import { z } from 'zod'
import { getMktEnrollmentStudent } from '~/server/data/marketingEnrollment'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  plantel: z.string().trim().min(1).max(40),
  ciclo: z.string().trim().regex(/^\d{4}$/)
})

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const matricula = String(getRouterParam(event, 'matricula') || '').trim().toUpperCase()
  const query = parseOrBadRequest(schema, getQuery(event), 'La consulta del alumno no es válida.')
  return withRequestBoundary(event, 'mkt.enrollment.student', () => getMktEnrollmentStudent(user, matricula, query), {
    userId: user.id,
    plantel: query.plantel,
    matricula
  })
})
