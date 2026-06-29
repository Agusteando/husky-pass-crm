import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { listFamilyCommunications } from '~/server/data/communications'
import { withRequestBoundary } from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return withRequestBoundary(event, 'family.communications.summary', async () => {
    const response = await listFamilyCommunications(user)
    return {
      unread: response.metrics.unread,
      total: response.metrics.total,
      important: response.metrics.important,
      withAttachments: response.metrics.withAttachments
    }
  }, { userId: user.id })
})
