import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { getAuthorizedPersonas } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { logPersonasDiagnostic } from '~/server/utils/personasDiagnostics'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  try {
    return await getAuthorizedPersonas(user)
  } catch (error) {
    logPersonasDiagnostic('family-people-api-load', error, { userId: user.id, username: user.username })
    throw error
  }
})
