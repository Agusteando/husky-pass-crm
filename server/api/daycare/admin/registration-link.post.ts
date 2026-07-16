import { defineEventHandler, readBody, setHeader } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getSalaById } from '~/server/data/mysqlDaycare'

const schema = z.object({
  sala: z.coerce.number().int().positive(),
  regenerate: z.boolean().optional()
})

/**
 * No-op compatibility route for stale clients. Regeneration is intentionally
 * disabled because registration links are delivered only through email.
 */
export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  const sala = await getSalaById(user, body.sala)

  setHeader(event, 'cache-control', 'private, no-store, max-age=0, must-revalidate')
  setHeader(event, 'deprecation', 'true')

  return {
    ok: true,
    deprecated: true,
    delivery: 'email',
    link: {
      token: '—',
      url: '',
      qrUrl: '',
      sala: sala.sala,
      unidad: sala.unidad
    }
  }
})
