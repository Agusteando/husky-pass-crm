import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { getFamilyExpressAccessHistory } from '~/server/data/accessHistory'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'

const schema = z.object({
  matricula: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  limit: z.coerce.number().int().min(1).max(25).optional().default(6)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return getFamilyExpressAccessHistory(user, schema.parse(getQuery(event)))
})
