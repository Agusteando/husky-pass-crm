import { createError, defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { getPersonasReadiness } from '~/server/data/mysqlPersonasAdmin'

const schema = z.object({
  plantel: z.string().optional().default(''),
  nivel: z.string().optional().default(''),
  status: z.string().optional().default('all'),
  search: z.string().optional().default(''),
  limit: z.coerce.number().int().min(25).max(400).optional().default(120)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede consultar readiness PA.' })
  return getPersonasReadiness(schema.parse(getQuery(event)))
})
