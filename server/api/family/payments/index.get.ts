import { defineEventHandler, getQuery } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { getFamilyPayments } from '~/server/data/payments'
import { withRequestBoundary } from '~/server/utils/logger'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  const query = getQuery(event)
  const ciclo = Array.isArray(query.ciclo) ? query.ciclo[0] : query.ciclo
  assertPersonasAutorizadasFamily(user)
  return withRequestBoundary(
    event,
    'family.payments.list',
    () => getFamilyPayments(user, { ciclo: ciclo ? String(ciclo) : undefined }),
    { userId: user.id }
  )
})
