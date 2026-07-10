import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { saveMktJournal } from '~/server/data/marketing'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const text = z.string().trim().max(20000).optional().default('')
const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  achievements: text,
  activities: text,
  content: text,
  comments: text
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const body = parseOrBadRequest(schema, await readBody(event), 'Revisa el contenido de la bitácora.')
  return withRequestBoundary(event, 'mkt.journal.save', () => saveMktJournal(user, body), { userId: user.id, date: body.date })
})
