import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { upsertAuthorizedChildren } from '~/server/data/mysqlDaycare'

const childSchema = z.object({
  id: z.number().int().positive().optional().nullable(),
  paternoA: z.string().optional().nullable(),
  maternoA: z.string().optional().nullable(),
  nombreA: z.string().optional().nullable(),
  grupo: z.string().optional().nullable(),
  grado: z.string().optional().nullable(),
  nivelEdu: z.string().optional().nullable(),
  campus: z.string().optional().nullable(),
  fechaA: z.string().optional().nullable()
})

const schema = z.object({
  children: z.array(childSchema).min(1)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const body = schema.parse(await readBody(event))
  return upsertAuthorizedChildren(user, body.children)
})
