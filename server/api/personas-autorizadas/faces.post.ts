import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { dataUrlToUploadFile, uploadToExternalService } from '~/server/utils/externalUpload'
import { withRequestBoundary } from '~/server/utils/logger'

const schema = z.object({
  src: z.string().min(32),
  personaId: z.number().int().positive().optional().nullable()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  return withRequestBoundary(event, 'personas-autorizadas.face.upload', async () => {
    const body = schema.parse(await readBody(event))
    const file = dataUrlToUploadFile(body.src, body.personaId ? `persona-${body.personaId}` : 'persona-nueva')
    return uploadToExternalService(file, {
      maxBytes: 2 * 1024 * 1024,
      accept: 'images',
      filenamePrefix: body.personaId ? `persona-${body.personaId}` : 'persona-nueva'
    })
  }, { userId: user.id })
})
