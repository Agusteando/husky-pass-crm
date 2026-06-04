import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { updateStudentCredentialPhoto } from '~/server/data/mysqlDaycare'

const schema = z.object({
  foto: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const body = schema.parse(await readBody(event))
  if (!/^https?:\/\//i.test(body.foto) && !body.foto.startsWith('/uploads/')) {
    throw createError({ statusCode: 400, statusMessage: 'La foto debe ser una URL absoluta existente o un archivo procesado de Husky Pass.' })
  }
  return updateStudentCredentialPhoto(user, body.foto)
})
