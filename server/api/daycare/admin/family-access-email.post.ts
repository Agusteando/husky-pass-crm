import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getDaycareAccessEmailTargets } from '~/server/data/mysqlDaycare'
import { sendDaycareAccessEmail } from '~/server/utils/daycareAccessEmail'
import { publicError } from '~/server/utils/httpError'

const schema = z.object({
  sala: z.coerce.number().int().positive(),
  userIds: z.array(z.coerce.number().int().positive()).optional()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  const { sala, targets } = await getDaycareAccessEmailTargets(user, { sala: body.sala, userIds: body.userIds || null })
  if (!targets.length) throw publicError(422, 'No hay cuentas con correo y contraseña visible para enviar.')

  let emailed = 0
  for (const account of targets) {
    await sendDaycareAccessEmail({
      to: account.email,
      childName: account.nombre_nino,
      login: account.username || account.email,
      password: account.plaintext || '',
      unidad: sala.unidad,
      sala: sala.sala
    })
    emailed += 1
  }

  return { ok: true, emailed }
})
