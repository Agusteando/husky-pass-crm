import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { getMktEnrollmentOverview } from '~/server/data/marketingEnrollment'
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
  const query = parseOrBadRequest(schema, getQuery(event), 'El plantel o ciclo no son válidos.')
  return withRequestBoundary(event, 'mkt.enrollment.overview', () => getMktEnrollmentOverview(user, query), {
    userId: user.id,
    plantel: query.plantel
  })
})
