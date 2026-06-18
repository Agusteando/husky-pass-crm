import { defineEventHandler, getRouterParam } from 'h3'
import { requireSession } from '~/server/utils/session'
import { deleteAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { withRequestBoundary } from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return withRequestBoundary(event, 'personas-autorizadas.family.delete', async () => {
    return await deleteAuthorizedPersona(user, Number(getRouterParam(event, 'id')))
  }, { userId: user.id, personId: getRouterParam(event, 'id') })
})
