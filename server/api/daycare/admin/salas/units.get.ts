import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { listAdminDaycareUnits } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const unidades = await listAdminDaycareUnits(user)
  return { unidades }
})
