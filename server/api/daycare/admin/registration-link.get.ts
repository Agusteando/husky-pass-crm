import { defineEventHandler, getQuery, setHeader } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getOrCreateDaycareRegistrationLink } from '~/server/data/daycareRegistration'
import { publicError } from '~/server/utils/httpError'

const schema = z.object({ sala: z.coerce.number().int().positive() })

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  const link = await getOrCreateDaycareRegistrationLink(user, event, query.sala, false)
  if (!link.url) throw publicError(500, 'No fue posible generar el enlace de registro.')

  setHeader(event, 'cache-control', 'private, no-store, max-age=0, must-revalidate')

  return {
    ok: true,
    link: {
      url: link.url,
      sala: link.sala,
      unidad: link.unidad
    }
  }
})
