import { defineEventHandler, readBody } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { upsertAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'

const childSchema = z.object({
  id: z.number().int().positive().optional().nullable(),
  paternoA: z.string().optional().nullable(),
  maternoA: z.string().optional().nullable(),
  nombreA: z.string().optional().nullable(),
  grupo: z.string().optional().nullable(),
  grado: z.string().optional().nullable(),
  nivelEdu: z.string().optional().nullable(),
  campus: z.string().optional().nullable(),
  fechaA: z.string().optional().nullable(),
  user_id: z.number().optional().nullable()
})

const schema = z.object({
  indice: z.coerce.number().int().min(1).max(4),
  id: z.number().int().positive().optional().nullable(),
  paternoP: z.string().optional().nullable(),
  maternoP: z.string().optional().nullable(),
  nombreP: z.string().min(1),
  parenP: z.string().min(1),
  foto: z.string().optional().nullable(),
  compressed_foto: z.string().optional().nullable(),
  fechaP: z.string().optional().nullable(),
  children: z.array(childSchema).optional()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const body = schema.parse(await readBody(event))
  return upsertAuthorizedPersona(user, body)
})
