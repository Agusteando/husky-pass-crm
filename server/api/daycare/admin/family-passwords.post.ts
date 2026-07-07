import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getDaycareAccessEmailTargets, setFamilyPassword, setSalaFamilyPassword } from '~/server/data/mysqlDaycare'
import { sendDaycareAccessEmail } from '~/server/utils/daycareAccessEmail'

const schema = z.object({
  sala: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive().optional(),
  password: z.string().min(4),
  passwordCanChange: z.boolean().default(true),
  sendEmail: z.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  const result = body.userId
    ? { rows: [await setFamilyPassword(user, { sala: body.sala, userId: body.userId, password: body.password, passwordCanChange: body.passwordCanChange })], updated: 1 }
    : await setSalaFamilyPassword(user, { sala: body.sala, password: body.password, passwordCanChange: body.passwordCanChange })

  let emailed = 0
  let skipped = 0
  if (body.sendEmail) {
    const userIds = body.userId ? [body.userId] : result.rows.map((row) => Number(row.id)).filter(Boolean)
    const { sala, targets } = await getDaycareAccessEmailTargets(user, { sala: body.sala, userIds })
    for (const account of targets) {
      try {
        await sendDaycareAccessEmail({
          to: account.email,
          childName: account.nombre_nino,
          login: account.username || account.email,
          password: account.plaintext || body.password,
          unidad: sala.unidad,
          sala: sala.sala,
          canChangePassword: account.passwordCanChange
        })
        emailed += 1
      } catch {
        skipped += 1
      }
    }
    skipped += Math.max(0, userIds.length - targets.length)
  }

  return { ok: true, updated: result.updated, emailed, skipped, rows: result.rows }
})
