import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { getPersonasAccessUser } from '~/server/data/mysqlPersonasAdmin'
import { appendAccessActionLog } from '~/server/utils/personasConfig'

const schema = z.object({
  userId: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  const admin = requireSession(event, 'admin')
  if (!isSuperAdmin(admin)) throw createError({ statusCode: 403, statusMessage: 'Solo superadmin puede preparar acceso Husky Pass.' })
  const body = schema.parse(await readBody(event))
  const user = await getPersonasAccessUser(body.userId)
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Familia no encontrada.' })

  const login = user.email || user.username || ''
  if (!login) throw createError({ statusCode: 422, statusMessage: 'La familia no tiene correo ni usuario para preparar acceso.' })

  const payload = {
    userId: Number(user.id),
    login,
    contact: user.email || user.username || null,
    displayName: user.displayName || user.nombre_nino || user.username || `Familia ${user.id}`,
    passwordAvailable: Boolean(user.plaintext),
    password: user.plaintext || null,
    status: 'prepared' as const,
    message: user.plaintext
      ? 'Acceso preparado. No se envio automaticamente porque no hay mecanismo real de entrega configurado.'
      : 'Acceso preparado sin contrasena visible. Revisa la cuenta antes de compartir instrucciones.',
    preparedBy: admin.email || admin.username || String(admin.id)
  }

  await appendAccessActionLog({
    userId: payload.userId,
    login: payload.login,
    contact: payload.contact,
    passwordAvailable: payload.passwordAvailable,
    preparedBy: payload.preparedBy
  })

  return payload
})
