import { defineEventHandler, readMultipartFormData } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { assertRegistrationAntibot } from '~/server/utils/antibot'
import { registerDaycareFamily, resolveDaycareRegistrationLink } from '~/server/data/daycareRegistration'
import { uploadToExternalService } from '~/server/utils/externalUpload'
import { sendDaycareAccessEmail } from '~/server/utils/daycareAccessEmail'
import { logSecurityDiagnostic, securityHash } from '~/server/utils/securityDiagnostics'

const schema = z.object({
  parentName: z.string().trim().min(3).max(120),
  childName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  emailConfirm: z.string().trim().email().max(160),
  password: z.string().min(8).max(100),
  sala: z.coerce.number().int().positive().optional(),
  unidad: z.string().trim().optional().nullable(),
  registrationToken: z.string().trim().optional().nullable(),
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
  if (!parts?.length) throw publicError(400, 'Completa el formulario de registro.')

  const body = schema.parse({
    parentName: field(parts, 'parentName'),
    childName: field(parts, 'childName'),
    email: field(parts, 'email'),
    emailConfirm: field(parts, 'emailConfirm'),
    password: field(parts, 'password'),
    sala: field(parts, 'sala') || undefined,
    unidad: field(parts, 'unidad'),
    registrationToken: field(parts, 'registrationToken'),
    captchaToken: field(parts, 'captchaToken'),
    captchaAnswer: field(parts, 'captchaAnswer'),
    startedAt: field(parts, 'startedAt'),
    website: field(parts, 'website')
  })

  if (body.email.trim().toLowerCase() !== body.emailConfirm.trim().toLowerCase()) {
    throw publicError(400, 'Confirma el mismo correo familiar.')
  }

  assertRegistrationAntibot(event, body)

  const linkedSala = body.registrationToken ? await resolveDaycareRegistrationLink(body.registrationToken) : null
  const salaId = linkedSala?.salaId || body.sala
  const unidad = linkedSala?.unidad || body.unidad
  if (!salaId) throw publicError(400, 'El enlace no tiene una sala válida.')

  const filePart = parts.find((part) => part.name === 'picture' && part.data?.length)
  let pictureUrl: string | null = null
  if (filePart?.data?.length) {
    const uploaded = await uploadToExternalService(
      { data: filePart.data, filename: filePart.filename, type: filePart.type },
      {
        maxBytes: 4 * 1024 * 1024,
        accept: 'images',
        filenamePrefix: 'foto-familia'
      }
    )
    pictureUrl = uploaded.absoluteUrl
  }

  const registration = await registerDaycareFamily({ ...body, sala: salaId, unidad, pictureUrl })
  let emailSent = false
  try {
    await sendDaycareAccessEmail({
      to: registration.email,
      childName: registration.childName,
      login: registration.username,
      password: registration.password,
      unidad: registration.unidad,
      sala: registration.salaName,
      canChangePassword: true
    })
    emailSent = true
  } catch (error) {
    logSecurityDiagnostic('daycare-registration-access-email-failed', error, { toHash: securityHash(registration.email), salaHash: securityHash(registration.sala) })
  }

  return {
    ok: true,
    registration: { ...registration, password: undefined },
    emailSent,
    message: emailSent
      ? 'Registro creado. Enviamos tus credenciales al correo familiar.'
      : 'Registro creado. Guarda tu contraseña; no fue posible enviar el correo automático.'
  }
})
