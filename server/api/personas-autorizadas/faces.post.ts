import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { logPersonasDiagnostic } from '~/server/utils/personasDiagnostics'
import { dataUrlToUploadFile, externalUploadFolder, uploadToExternalService } from '~/server/utils/externalUpload'

const schema = z.object({
  src: z.string().min(32),
  personaId: z.number().int().positive().optional().nullable()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  try {
    const body = schema.parse(await readBody(event))
    const file = dataUrlToUploadFile(body.src, body.personaId ? `persona-${body.personaId}` : 'persona-nueva')
    return uploadToExternalService(file, {
      folder: externalUploadFolder('personas-face', user.id),
      maxBytes: 2 * 1024 * 1024,
      accept: 'images',
      filenamePrefix: body.personaId ? `persona-${body.personaId}` : 'persona-nueva'
    })
  } catch (error) {
    logPersonasDiagnostic('face-image-api-store', error, { userId: user.id, username: user.username })
    throw error
  }
})
