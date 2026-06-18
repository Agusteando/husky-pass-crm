import { defineEventHandler, readMultipartFormData } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { saveMarbeteTemplate } from '~/server/utils/marbeteTemplates'

const schema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().trim().min(1),
  nivel: z.string().trim().min(1),
  planteles: z.string().optional().default(''),
  themeKey: z.enum(['daycare', 'preescolar', 'primaria', 'secundaria', 'iedis'])
})

function field(parts: NonNullable<Awaited<ReturnType<typeof readMultipartFormData>>>, name: string) {
  return parts.find((part) => part.name === name)?.data?.toString('utf8') || ''
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede gestionar plantillas.')

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw publicError(400, 'Formulario de plantilla vacio.')

  const body = schema.parse({
    id: field(parts, 'id') || null,
    name: field(parts, 'name'),
    nivel: field(parts, 'nivel'),
    planteles: field(parts, 'planteles'),
    themeKey: field(parts, 'themeKey')
  })
  const filePart = parts.find((part) => part.name === 'file' && part.data?.length)
  const planteles = body.planteles.split(',').map((item) => item.trim()).filter(Boolean)

  return saveMarbeteTemplate({
    id: body.id,
    name: body.name,
    nivel: body.nivel,
    planteles,
    themeKey: body.themeKey,
    file: filePart?.data?.length ? { filename: filePart.filename, data: filePart.data } : undefined
  })
})
