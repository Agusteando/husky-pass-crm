import { defineEventHandler, getQuery } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getParentAttendance } from '~/server/data/familyAttendance'
import { logErrorOnce, withRequestBoundary } from '~/server/utils/logger'

function firstQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '').trim()
  return String(value || '').trim()
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const query = getQuery(event)

  return withRequestBoundary(
    event,
    'family.attendance.list',
    () => getParentAttendance(user, {
      matricula: firstQueryValue(query.matricula),
      schoolYear: firstQueryValue(query.schoolYear)
    }, {
      onSourceError(source, error) {
        logErrorOnce(event, `family.attendance.source.${source}`, error, { userId: user.id })
      }
    }),
    { userId: user.id }
  )
})
