import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getOrCreateDaycareRegistrationLink } from '~/server/data/daycareRegistration'
import { sendDaycareRegistrationLinkEmail } from '~/server/utils/daycareRegistrationLinkEmail'

const schema = z.object({
  sala: z.coerce.number().int().positive(),
  to: z.string().trim().email().max(180),
  regenerate: z.boolean().optional().default(false)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  const link = await getOrCreateDaycareRegistrationLink(user, event, body.sala, Boolean(body.regenerate))
  await sendDaycareRegistrationLinkEmail({ to: body.to, unidad: link.unidad, sala: link.sala, url: link.url || '', qrUrl: link.qrUrl || '' })
  return { ok: true, emailed: 1, link }
})
