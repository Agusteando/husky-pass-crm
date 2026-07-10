import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { getMktOverview } from '~/server/data/marketing'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const query = parseOrBadRequest(schema, getQuery(event), 'La fecha de consulta no es válida.')
  return withRequestBoundary(event, 'mkt.overview', () => getMktOverview(user, query.today), { userId: user.id })
})
