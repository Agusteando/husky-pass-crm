import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { z } from 'zod'
import { assertRegistrationAntibot } from '~/server/utils/antibot'
import { registerDaycareFamily } from '~/server/data/daycareRegistration'
import { externalUploadFolder, uploadToExternalService } from '~/server/utils/externalUpload'

const schema = z.object({
  parentName: z.string().trim().min(3).max(120),
  childName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(100),
  sala: z.coerce.number().int().positive(),
  unidad: z.string().trim().optional().nullable(),
  captchaToken: z.string().min(20),
  captchaAnswer: z.string().min(1).max(8),
  startedAt: z.coerce.number(),
  website: z.string().optional().nullable()
})

function field(parts: NonNullable<Awaited<ReturnType<typeof readMultipartFormData>>>, name: string) {
  return parts.find((part) => part.name === name && !part.filename)?.data?.toString('utf8') || ''
}

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw createError({ statusCode: 400, statusMessage: 'Completa el formulario de registro.' })

  const body = schema.parse({
    parentName: field(parts, 'parentName'),
    childName: field(parts, 'childName'),
    email: field(parts, 'email'),
    password: field(parts, 'password'),
    sala: field(parts, 'sala'),
    unidad: field(parts, 'unidad'),
    captchaToken: field(parts, 'captchaToken'),
    captchaAnswer: field(parts, 'captchaAnswer'),
    startedAt: field(parts, 'startedAt'),
    website: field(parts, 'website')
  })

  assertRegistrationAntibot(event, body)

  const filePart = parts.find((part) => part.name === 'picture' && part.data?.length)
  let pictureUrl: string | null = null
  if (filePart?.data?.length) {
    const uploaded = await uploadToExternalService(
      { data: filePart.data, filename: filePart.filename, type: filePart.type },
      {
        folder: externalUploadFolder('daycare-registration', body.unidad || 'unidad', `sala-${body.sala}`),
        maxBytes: 4 * 1024 * 1024,
        accept: 'images',
        filenamePrefix: 'foto-familia'
      }
    )
    pictureUrl = uploaded.absoluteUrl
  }

  const registration = await registerDaycareFamily({ ...body, pictureUrl })
  return {
    ok: true,
    registration,
    message: 'Registro de guardería creado. Ya puedes iniciar sesión con tu correo y contraseña.'
  }
})
