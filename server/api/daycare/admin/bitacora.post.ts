import { z } from 'zod'
import { saveBitacora } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({
  uid: z.string().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  logros: z.string().optional(),
  contenido: z.string().optional(),
  actividades: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  return saveBitacora(user, body)
})
