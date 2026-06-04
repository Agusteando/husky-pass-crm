import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertPersonasAutorizadasFamily } from '~/server/utils/authz'
import { PARENT_EDITABLE_STUDENT_FIELDS, updateEditableStudentProfile } from '~/server/data/mysqlDaycare'
import type { PersonasStudentEditable } from '~/types/daycare'

const editableFields = PARENT_EDITABLE_STUDENT_FIELDS as readonly string[]
const academicFields = new Set(['grado', 'grupo', 'nivel', 'nivelEdu', 'ciclo', 'plantel', 'matricula', 'servicio', 'baja', 'status', 'estatus', 'internal_status', 'campus'])
const valueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]).optional()
const schema = z.object(Object.fromEntries(editableFields.map((field) => [field, valueSchema]))).strict()

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'family')
  assertPersonasAutorizadasFamily(user)
  const rawBody = await readBody(event)
  const body = rawBody?.editable && typeof rawBody.editable === 'object' ? rawBody.editable : rawBody
  const illegal = Object.keys(body || {}).filter((field) => academicFields.has(field) || !editableFields.includes(field))
  if (illegal.length) {
    throw createError({ statusCode: 403, statusMessage: `Campo no editable por familia: ${illegal[0]}` })
  }
  const parsed = schema.parse(body) as Partial<PersonasStudentEditable>
  return updateEditableStudentProfile(user, parsed)
})
