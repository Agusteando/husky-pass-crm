import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { moveDaycareRoomMembers } from '~/server/data/daycareRoomManagement'

const schema = z.object({
  userIds: z.array(z.number().int().positive()).min(1).max(250),
  targetSalaId: z.number().int().positive()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  return moveDaycareRoomMembers(user, body)
})
