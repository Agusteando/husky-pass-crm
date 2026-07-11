import { defineEventHandler } from 'h3'
import { getMktEnrollmentOptions } from '~/server/data/marketingEnrollment'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  return withRequestBoundary(event, 'mkt.enrollment.options', () => getMktEnrollmentOptions(user), { userId: user.id })
})
