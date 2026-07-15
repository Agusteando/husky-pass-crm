import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { revokeUnconfirmedDaycareAccess } from '~/server/data/daycareRoomManagement'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'

const schema = z.object({
  userId: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  return revokeUnconfirmedDaycareAccess(user, body)
})
