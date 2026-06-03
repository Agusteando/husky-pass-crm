import { z } from 'zod'
import { upsertFamilyAccount } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({
  id: z.number().int().positive().optional(),
  nombre_nino: z.string().optional().nullable(),
  username: z.string().min(1),
  email: z.string().email(),
  plaintext: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  unidad: z.string().optional(),
  sala: z.union([z.string(), z.number()])
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  return upsertFamilyAccount(user, body)
})
