import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { isSuperAdmin } from '~/server/utils/authz'
import { publicError } from '~/server/utils/httpError'
import { listGestionPermissionUsers } from '~/server/data/gestionEscolar'
import { withRequestBoundary } from '~/server/utils/logger'
import { parseOrBadRequest } from '~/server/utils/validation'

const schema = z.object({
  search: z.string().trim().optional().default(''),
  plantel: z.string().trim().optional().default(''),
  limit: z.coerce.number().int().min(25).max(250).optional().default(120)
})

export default defineEventHandler((event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede asignar Gestion Escolar.')
  const query = parseOrBadRequest(schema, getQuery(event), 'Revisa los filtros del directorio.')
  return withRequestBoundary(event, 'superadmin.gestion-escolar.users', () => listGestionPermissionUsers(query), { userId: user.id })
})
