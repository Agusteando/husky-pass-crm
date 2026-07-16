import { defineEventHandler, readMultipartFormData } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { saveMarbeteTemplate } from '~/server/utils/marbeteTemplates'
import { normalizeMarbeteSvgDesign } from '~/utils/marbeteSvgEditor'

const schema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().trim().min(1),
  nivel: z.string().trim().min(1),
  themeKey: z.enum(['daycare', 'preescolar', 'primaria', 'secundaria', 'iedis']),
  basedOnId: z.string().optional().nullable(),
  publish: z.enum(['0', '1']).optional().default('1'),
  svgDesign: z.string().optional().default('')
})

function field(parts: NonNullable<Awaited<ReturnType<typeof readMultipartFormData>>>, name: string) {
  return parts.find((part) => part.name === name)?.data?.toString('utf8') || ''
}

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  if (!isSuperAdmin(user)) throw publicError(403, 'Solo superadmin puede gestionar marbetes.')

  const parts = await readMultipartFormData(event)
  if (!parts?.length) throw publicError(400, 'Formulario vacío.')

  const body = schema.parse({
    id: field(parts, 'id') || null,
    name: field(parts, 'name'),
    nivel: field(parts, 'nivel'),
    themeKey: field(parts, 'themeKey'),
    basedOnId: field(parts, 'basedOnId') || null,
    publish: field(parts, 'publish') || '1',
    svgDesign: field(parts, 'svgDesign')
  })
  const svgDesign: unknown = (() => {
    try {
      return body.svgDesign ? JSON.parse(body.svgDesign) : null
    } catch {
      throw publicError(400, 'La configuración del marbete no es válida.')
    }
  })()
  const filePart = parts.find((part) => part.name === 'file' && part.data?.length)

  return saveMarbeteTemplate({
    id: body.id,
    name: body.name,
    nivel: body.nivel,
    themeKey: body.themeKey,
    basedOnId: body.basedOnId,
    publish: body.publish === '1',
    svgDesign: normalizeMarbeteSvgDesign(svgDesign, body.themeKey),
    file: filePart?.data?.length ? { filename: filePart.filename, data: filePart.data } : undefined
  })
})
