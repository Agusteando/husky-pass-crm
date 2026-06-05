import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { externalUploadFolder, uploadToExternalService } from '~/server/utils/externalUpload'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede subir archivos.' })

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.data?.length)
  if (!filePart?.data?.length) throw createError({ statusCode: 400, statusMessage: 'Selecciona un archivo para subir.' })

  return uploadToExternalService(
    { data: filePart.data, filename: filePart.filename, type: filePart.type },
    {
      folder: externalUploadFolder('personas-resource'),
      maxBytes: 10 * 1024 * 1024,
      accept: 'imagesAndDocuments',
      filenamePrefix: 'recurso-personas'
    }
  )
})
