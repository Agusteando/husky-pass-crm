import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getOrCreateDaycareRegistrationLink } from '~/server/data/daycareRegistration'
import { sendDaycareRegistrationLinkEmail } from '~/server/utils/daycareRegistrationLinkEmail'
import { publicError } from '~/server/utils/httpError'
import { GoogleServiceAccountConfigurationError } from '~/server/utils/googleServiceAccountCredentials'

const schema = z.object({
  sala: z.coerce.number().int().positive(),
  to: z.string().trim().email().max(180)
})

function institutionalSender(user: ReturnType<typeof requireSession>) {
  const email = String(user.email || user.username || '').trim().toLowerCase()
  if (!/^[^@\s]+@casitaiedis\.edu\.mx$/i.test(email)) {
    throw publicError(400, 'Tu cuenta institucional no tiene un correo válido para enviar el registro.')
  }
  return {
    email,
    name: String(user.displayName || user.username || 'Equipo de Guardería').trim()
  }
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  const sender = institutionalSender(user)
  const link = await getOrCreateDaycareRegistrationLink(user, event, body.sala, false)
  if (!link.url) throw publicError(500, 'No fue posible generar el enlace de registro.')

  try {
    await sendDaycareRegistrationLinkEmail({
      to: body.to,
      unidad: link.unidad,
      sala: link.sala,
      url: link.url,
      senderEmail: sender.email,
      senderName: sender.name
    })
  } catch (error) {
    if (error instanceof GoogleServiceAccountConfigurationError) {
      throw publicError(503, 'El servicio de correo institucional no está configurado en este despliegue.')
    }
    throw publicError(502, 'No fue posible enviar el correo de registro con tu cuenta institucional.')
  }

  return { ok: true, emailed: 1, url: link.url }
})
