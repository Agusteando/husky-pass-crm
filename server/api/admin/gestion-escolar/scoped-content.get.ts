import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertGestionEscolarAdmin } from '~/server/utils/authz'
import { listGestionScopedContent } from '~/server/data/gestionEscolar'
import { withRequestBoundary } from '~/server/utils/logger'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  kind: z.enum(['encuesta', 'convenio'])
})

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertGestionEscolarAdmin(user)
  const query = parseOrBadRequest(schema, getQuery(event), 'Selecciona un modulo valido.')
  return withRequestBoundary(event, 'gestion-escolar.scoped-content.list', () => listGestionScopedContent(user, query.kind), { userId: user.id, kind: query.kind })
})
