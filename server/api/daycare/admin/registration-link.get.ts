import { defineEventHandler, getQuery, setHeader } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertDaycareAdmin } from '~/server/utils/authz'
import { getSalaById } from '~/server/data/mysqlDaycare'

const schema = z.object({ sala: z.coerce.number().int().positive() })

/**
 * Compatibility response for browser tabs that still have the retired
 * link/copy modal loaded. It deliberately does not create or expose a
 * registration token. Fresh clients use registration-link-email.post.ts.
 */
export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const query = schema.parse(getQuery(event))
  const sala = await getSalaById(user, query.sala)

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
