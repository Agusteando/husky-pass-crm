import { getFamilyDashboard } from '~/server/data/mysqlDaycare'
import { assertDaycareFamily } from '~/server/utils/authz'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertDaycareFamily(user)
  return getFamilyDashboard(user)
})
