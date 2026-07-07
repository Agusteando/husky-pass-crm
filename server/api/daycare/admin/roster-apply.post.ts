import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { applyDaycareRosterSuggestion } from '~/server/data/daycareRoster'

const schema = z.object({
  sala: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
  applyChildName: z.boolean().optional(),
  applySala: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  return applyDaycareRosterSuggestion(user, body)
})
