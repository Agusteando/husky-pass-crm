import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getOrCreateDaycareRegistrationLink } from '~/server/data/daycareRegistration'

const schema = z.object({ sala: z.coerce.number().int().positive(), regenerate: z.boolean().default(false) })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  const link = await getOrCreateDaycareRegistrationLink(user, event, body.sala, body.regenerate)
  return { ok: true, link }
})
