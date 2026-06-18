import { defineEventHandler, getRouterParam } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { requireSession } from '~/server/utils/session'
import { deleteAdminResource } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw publicError(400, 'Recurso inválido')
  return deleteAdminResource(user, id)
})
