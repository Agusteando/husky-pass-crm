import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { resolveDaycareRegistrationLink } from '~/server/data/daycareRegistration'

const schema = z.object({ codigo: z.string().trim().min(4) })

export default defineEventHandler(async (event) => {
  const query = schema.parse(getQuery(event))
  const link = await resolveDaycareRegistrationLink(query.codigo, event)
  return { ok: true, sala: { id: link.salaId, sala: link.sala, unidad: link.unidad }, link }
})
