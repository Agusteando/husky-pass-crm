import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getOrCreateDaycareRegistrationLink } from '~/server/data/daycareRegistration'

const schema = z.object({ sala: z.coerce.number().int().positive() })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  const link = await getOrCreateDaycareRegistrationLink(user, event, query.sala, false)
  return { ok: true, link }
})
