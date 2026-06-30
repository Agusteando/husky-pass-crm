import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertGestionEscolarAdmin } from '~/server/utils/authz'
import { listGestionFamilies } from '~/server/data/gestionEscolar'
import { withRequestBoundary } from '~/server/utils/logger'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  search: z.string().trim().optional().default(''),
  limit: z.coerce.number().int().min(20).max(300).optional().default(80)
})

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  assertGestionEscolarAdmin(user)
  const query = parseOrBadRequest(schema, getQuery(event), 'Revisa los filtros de busqueda.')
  return withRequestBoundary(event, 'gestion-escolar.families.list', () => listGestionFamilies(user, query), { userId: user.id })
})
