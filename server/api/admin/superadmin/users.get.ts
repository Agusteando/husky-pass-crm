import { createError, defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { listSuperAdminDirectory } from '~/server/data/mysqlAuth'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'

const schema = z.object({
  plantel: z.string().optional().default(''),
  search: z.string().optional().default(''),
  scope: z.enum(['all', 'daycare', 'schoolFamilies', 'internal', 'impersonable']).optional().default('all'),
  limit: z.coerce.number().int().min(25).max(250).optional().default(120)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) {
    throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede consultar el directorio de usuarios.' })
  }

  const query = schema.parse(getQuery(event))
  return listSuperAdminDirectory(query)
})
