import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { updateStudentCredentialPhoto } from '~/server/data/mysqlDaycare'
import { publicError } from '~/server/utils/httpError'
import { withRequestBoundary } from '~/server/utils/logger'

const schema = z.object({
  foto: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return withRequestBoundary(event, 'personas-autorizadas.student-photo.save', async () => {
    const body = schema.parse(await readBody(event))
    if (!/^https?:\/\//i.test(body.foto) && !body.foto.startsWith('/uploads/')) {
      throw publicError(400, 'La foto no es valida.')
    }
    return updateStudentCredentialPhoto(user, body.foto)
  }, { userId: user.id })
})
