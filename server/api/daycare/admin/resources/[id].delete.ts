import { defineEventHandler, getRouterParam } from 'h3'
import { requireSession } from '~/server/utils/session'
import { hideAdminResource } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  return hideAdminResource(user, Number(getRouterParam(event, 'id')))
})
