import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { mergeDaycareRoomMembers } from '~/server/data/daycareRoomManagement'

const schema = z.object({
  canonicalId: z.number().int().positive(),
  duplicateIds: z.array(z.number().int().positive()).min(1).max(24),
  targetSalaId: z.number().int().positive()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  return mergeDaycareRoomMembers(user, body)
})
