import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { logPersonasDiagnostic } from '~/server/utils/personasDiagnostics'
import { dataUrlToUploadFile, externalUploadFolder, uploadToExternalService } from '~/server/utils/externalUpload'

const schema = z.object({
  src: z.string().min(64)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  try {
    const body = schema.parse(await readBody(event))
    const file = dataUrlToUploadFile(body.src, 'foto-original')
    return uploadToExternalService(file, {
      folder: externalUploadFolder('personas-source', user.id),
      maxBytes: 5 * 1024 * 1024,
      accept: 'images',
      filenamePrefix: 'foto-original'
    })
  } catch (error) {
    logPersonasDiagnostic('photo-source-api-upload', error, { userId: user.id, username: user.username })
    throw error
  }
})
