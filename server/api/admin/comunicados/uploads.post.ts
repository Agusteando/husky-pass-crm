import { defineEventHandler, readMultipartFormData } from 'h3'
import { requireSession } from '~/server/utils/session'
import { assertSchoolAdmin } from '~/server/utils/authz'
import { uploadToExternalService } from '~/server/utils/externalUpload'
import { normalizeCommunicationAttachment } from '~/server/data/communications'
import { publicError } from '~/server/utils/httpError'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertSchoolAdmin(user)
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.data?.length)
  if (!filePart?.data?.length) throw publicError(400, 'Selecciona un archivo para adjuntar.')

  const uploaded = await uploadToExternalService(
    { data: filePart.data, filename: filePart.filename, type: filePart.type },
    {
      maxBytes: 12 * 1024 * 1024,
      accept: 'imagesAndDocuments',
      filenamePrefix: 'comunicado'
    }
  )

  return normalizeCommunicationAttachment({
    id: uploaded.storedFilename,
    name: uploaded.filename,
    mime: uploaded.mime,
    size: uploaded.size,
    url: uploaded.absoluteUrl,
    thumbnailUrl: uploaded.mime.startsWith('image/') ? uploaded.absoluteUrl : null,
    uploadedAt: new Date().toISOString()
  })
})
