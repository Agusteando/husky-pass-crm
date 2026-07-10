import { defineEventHandler, getRouterParam } from 'h3'
import { getMktLead } from '~/server/data/marketing'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { publicError } from '~/server/utils/httpError'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const folio = String(getRouterParam(event, 'folio') || '').trim().toUpperCase()
  if (!/^[A-Z0-9-]{3,50}$/.test(folio)) throw publicError(400, 'El folio no es válido.')
  return withRequestBoundary(event, 'mkt.leads.detail', () => getMktLead(folio), { userId: user.id, matricula: folio })
})
