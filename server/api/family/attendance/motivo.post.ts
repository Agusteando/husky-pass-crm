import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { updateParentAbsenceMotivo } from '~/server/data/familyAttendance'

const schema = z.object({
  matricula: z.string().min(1),
  schoolYear: z.string().optional().nullable(),
  absenceId: z.coerce.number().int().positive(),
  motivo: z.string().trim().min(3).max(700)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const body = schema.parse(await readBody(event))
  return updateParentAbsenceMotivo(user, body)
})
