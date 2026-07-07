import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { resolveDaycareRegistrationLink } from '~/server/data/daycareRegistration'
import { findDaycareRosterMatch } from '~/server/data/daycareRoster'
import { publicError } from '~/server/utils/httpError'

const schema = z.object({
  email: z.string().email(),
  codigo: z.string().optional(),
  sala: z.coerce.number().int().positive().optional(),
  unidad: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const query = schema.parse(getQuery(event))
  const linked = query.codigo ? await resolveDaycareRegistrationLink(query.codigo) : null
  const unidad = linked?.unidad || query.unidad
  const salaId = linked?.salaId || query.sala
  const salaName = linked?.sala || null
  if (!unidad || !salaId) throw publicError(400, 'Selecciona una sala para revisar el correo.')
  return findDaycareRosterMatch({ email: query.email, unidad, salaId, salaName })
})
