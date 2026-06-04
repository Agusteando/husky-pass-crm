import { defineEventHandler, readBody } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { upsertAuthorizedPersona } from '~/server/data/mysqlDaycare'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { logPersonasDiagnostic } from '~/server/utils/personasDiagnostics'

const schema = z.object({
  indice: z.coerce.number().int().min(1).max(4),
  id: z.number().int().positive().optional().nullable(),
  paternoP: z.string().optional().nullable(),
  maternoP: z.string().optional().nullable(),
  nombreP: z.string().min(1),
  parenP: z.string().min(1),
  foto: z.string().optional().nullable(),
  compressed_foto: z.string().optional().nullable(),
  fechaP: z.string().optional().nullable()
}).strict()

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  try {
    const body = schema.parse(await readBody(event))
    return await upsertAuthorizedPersona(user, body)
  } catch (error) {
    logPersonasDiagnostic('family-people-api-save', error, { userId: user.id, username: user.username })
    throw error
  }
})
