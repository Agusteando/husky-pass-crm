import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertSchoolAdmin } from '~/server/utils/authz'
import { listAdminCommunications } from '~/server/data/communications'
import { withRequestBoundary } from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertSchoolAdmin(user)
  return withRequestBoundary(event, 'admin.communications.list', () => listAdminCommunications(user), { userId: user.id })
})
