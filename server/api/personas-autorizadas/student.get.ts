import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getEditableStudentProfile } from '~/server/data/mysqlDaycare'
import { logPersonasDiagnostic } from '~/server/utils/personasDiagnostics'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  try {
    return await getEditableStudentProfile(user)
  } catch (error) {
    logPersonasDiagnostic('student-profile-api-load', error, { userId: user.id, username: user.username })
    throw error
  }
})
