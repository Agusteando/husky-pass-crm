import { defineEventHandler } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { resolveFamilyScopedContent } from '~/server/data/gestionEscolar'
import { withRequestBoundary } from '~/server/utils/logger'

export default defineEventHandler((event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return withRequestBoundary(event, 'family.gestion-escolar.convenio', () => resolveFamilyScopedContent(user, 'convenio'), { userId: user.id })
})
