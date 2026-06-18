import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { setAdminResourceHidden } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({ hidden: z.boolean() })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) throw publicError(400, 'Recurso inválido')
  const body = schema.parse(await readBody(event))
  return setAdminResourceHidden(user, id, body.hidden)
})
