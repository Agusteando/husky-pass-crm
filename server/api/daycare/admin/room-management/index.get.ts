import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getDaycareRoomManagementOverview } from '~/server/data/daycareRoomManagement'

const schema = z.object({ unidad: z.string().optional().default('') })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  return getDaycareRoomManagementOverview(user, query.unidad)
})
