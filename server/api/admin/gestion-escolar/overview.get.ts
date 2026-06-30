import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertGestionEscolarAdmin } from '~/server/utils/authz'
import { getGestionOverview } from '~/server/data/gestionEscolar'
import { withRequestBoundary } from '~/server/utils/logger'

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertGestionEscolarAdmin(user)
  return withRequestBoundary(event, 'gestion-escolar.overview', () => getGestionOverview(user), { userId: user.id })
})
