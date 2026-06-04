import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { updateStudentCredentialPhoto } from '~/server/data/mysqlDaycare'
import { logPersonasDiagnostic } from '~/server/utils/personasDiagnostics'

const schema = z.object({
  foto: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  try {
    const body = schema.parse(await readBody(event))
    if (!/^https?:\/\//i.test(body.foto) && !body.foto.startsWith('/uploads/')) {
      throw createError({ statusCode: 400, statusMessage: 'La foto no es válida.' })
    }
    return await updateStudentCredentialPhoto(user, body.foto)
  } catch (error) {
    logPersonasDiagnostic('student-photo-api-save', error, { userId: user.id, username: user.username })
    throw error
  }
})
