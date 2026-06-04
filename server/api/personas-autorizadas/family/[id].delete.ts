import { defineEventHandler, getRouterParam } from 'h3'
import { requireSession } from '~/server/utils/session'
import { deleteAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { logPersonasDiagnostic } from '~/server/utils/personasDiagnostics'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  try {
    return await deleteAuthorizedPersona(user, Number(getRouterParam(event, 'id')))
  } catch (error) {
    logPersonasDiagnostic('family-people-api-delete', error, { userId: user.id, username: user.username, id: getRouterParam(event, 'id') })
    throw error
  }
})
