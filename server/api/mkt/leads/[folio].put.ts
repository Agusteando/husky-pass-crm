import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { updateMktLead } from '~/server/data/marketing'
import { assertMarketingAdmin } from '~/server/utils/authz'
import { publicError } from '~/server/utils/httpError'
import { withRequestBoundary } from '~/server/utils/logger'
import { requireSession } from '~/server/utils/session'
import { parseOrBadRequest } from '~/server/utils/validation'

const optionalText = (max: number) => z.string().trim().max(max).optional().default('')
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T12:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}, 'La fecha no es válida.')
const contactSchema = z.object({
  name: optionalText(255),
  email: z.union([z.string().trim().email().max(255), z.literal('')]).optional().default(''),
  phone: optionalText(40),
  address: optionalText(255),
  source: optionalText(255)
})
const studentSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  fullName: z.string().trim().min(2).max(255),
  level: z.string().trim().min(1).max(100),
  grade: optionalText(100),
  birthDate: z.union([isoDate, z.literal('')]).optional().default(''),
  enrolled: z.boolean().optional().default(false)
})
const schema = z.object({
  plantel: z.string().trim().min(2).max(20),
  campus: optionalText(100),
  channel: z.string().trim().min(1).max(100),
  father: contactSchema,
  mother: contactSchema,
  students: z.array(studentSchema).min(1).max(5)
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertMarketingAdmin(user)
  const folio = String(getRouterParam(event, 'folio') || '').trim().toUpperCase()
  if (!/^[A-Z0-9-]{3,50}$/.test(folio)) throw publicError(400, 'El folio no es válido.')
  const body = parseOrBadRequest(schema, await readBody(event), 'Revisa los datos de la familia y del estudiante.')
  return withRequestBoundary(event, 'mkt.leads.update', () => updateMktLead(folio, body), { userId: user.id, matricula: folio })
})
