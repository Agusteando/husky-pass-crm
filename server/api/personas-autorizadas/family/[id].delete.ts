import { defineEventHandler, getRouterParam } from 'h3'
import { requireSession } from '~/server/utils/session'
import { deleteAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return deleteAuthorizedPersona(user, Number(getRouterParam(event, 'id')))
})
