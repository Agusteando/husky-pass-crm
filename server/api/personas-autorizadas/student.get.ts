import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getEditableStudentProfile } from '~/server/data/mysqlDaycare'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return getEditableStudentProfile(user)
})
