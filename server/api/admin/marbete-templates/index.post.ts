import { defineEventHandler, readMultipartFormData } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { z } from 'zod'
import { isSuperAdmin } from '~/server/utils/authz'
import { requireSession } from '~/server/utils/session'
import { saveMarbeteTemplate, saveVisualMarbeteTemplate } from '~/server/utils/marbeteTemplates'
import { normalizeMarbeteVisualDesign } from '~/utils/marbeteDesigner'

const schema = z.object({
  id: z.string().optional().nullable(),
  name: z.string().trim().min(1),
  nivel: z.string().trim().min(1),
  planteles: z.string().optional().default(''),
  themeKey: z.enum(['daycare', 'preescolar', 'primaria', 'secundaria', 'iedis']),
  mode: z.enum(['legacy-svg', 'visual']).optional().default('legacy-svg'),
  cicloEscolar: z.string().optional().default(''),
  visualDesign: z.string().optional().default('')
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
    themeKey: field(parts, 'themeKey'),
    mode: field(parts, 'mode') || 'legacy-svg',
    cicloEscolar: field(parts, 'cicloEscolar'),
    visualDesign: field(parts, 'visualDesign')
  })
  const planteles = body.planteles.split(',').map((item) => item.trim()).filter(Boolean)

  if (body.mode === 'visual') {
    const visualDesign: unknown = (() => {
      try {
        return body.visualDesign ? JSON.parse(body.visualDesign) : null
      } catch {
        throw publicError(400, 'La configuración visual no es válida.')
      }
    })()
    const artworkPart = parts.find((part) => part.name === 'artwork' && part.data?.length)
    return saveVisualMarbeteTemplate({
      id: body.id,
      name: body.name,
      nivel: body.nivel,
      planteles,
      themeKey: body.themeKey,
      cicloEscolar: body.cicloEscolar,
      visualDesign: normalizeMarbeteVisualDesign(visualDesign, body.themeKey),
      artwork: artworkPart?.data?.length ? { filename: artworkPart.filename, type: artworkPart.type, data: artworkPart.data } : undefined
    })
  }

  const filePart = parts.find((part) => part.name === 'file' && part.data?.length)

  return saveMarbeteTemplate({
    id: body.id,
    name: body.name,
    nivel: body.nivel,
    planteles,
    themeKey: body.themeKey,
    cicloEscolar: body.cicloEscolar,
    file: filePart?.data?.length ? { filename: filePart.filename, data: filePart.data } : undefined
  })
})
