import { defineEventHandler, readMultipartFormData } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getSalaById } from '~/server/data/mysqlDaycare'
import { uploadToExternalService } from '~/server/utils/externalUpload'

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw publicError(400, 'Selecciona un archivo para subir.')

  const salaPart = parts.find((part) => part.name === 'sala')
  const filePart = parts.find((part) => part.name === 'file' && part.data?.length)
  const salaId = Number(salaPart?.data?.toString('utf8') || 0)
  if (!Number.isInteger(salaId) || salaId <= 0) throw publicError(400, 'Sala inválida para la carga.')
  if (!filePart?.data?.length) throw publicError(400, 'Archivo no recibido.')

  const sala = await getSalaById(user, salaId)

  return uploadToExternalService(
    { data: filePart.data, filename: filePart.filename, type: filePart.type },
    {
      maxBytes: 8 * 1024 * 1024,
      accept: 'imagesAndDocuments',
      filenamePrefix: `recurso-sala-${sala.id}`
    }
  )
})
