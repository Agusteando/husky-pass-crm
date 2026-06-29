import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireSession } from '~/server/utils/session'
import { assertCommunicationsAdmin } from '~/server/utils/authz'
import { saveCommunication } from '~/server/data/communications'
import { publicError } from '~/server/utils/httpError'

const attachmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mime: z.string().min(1),
  size: z.coerce.number().nonnegative(),
  url: z.string().min(1),
  kind: z.enum(['pdf', 'image', 'document', 'spreadsheet', 'other']),
  thumbnailUrl: z.string().nullable().optional(),
  uploadedAt: z.string().nullable().optional()
})

const audienceSchema = z.object({
  kind: z.enum(['plantel', 'grado', 'grupo', 'custom']),
  planteles: z.array(z.string()).default([]),
  niveles: z.array(z.string()).optional().default([]),
  grados: z.array(z.string()).optional().default([]),
  grupos: z.array(z.string()).optional().default([]),
  label: z.string().nullable().optional()
})

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(4).max(140),
  summary: z.string().min(8).max(240),
  body: z.string().min(8).max(4000),
  status: z.enum(['draft', 'scheduled', 'sent']),
  priority: z.enum(['normal', 'important', 'urgent']),
  audience: audienceSchema,
  scheduledFor: z.string().nullable().optional(),
  attachments: z.array(attachmentSchema).default([])
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertCommunicationsAdmin(user)
  const body = schema.parse(await readBody(event))
  if (body.status === 'sent' && !body.audience.planteles.length) {
    throw publicError(400, 'Selecciona al menos un plantel antes de enviar.')
  }
  if (body.status === 'scheduled' && !body.scheduledFor) {
    throw publicError(400, 'Selecciona fecha y hora para programar el comunicado.')
  }
  return saveCommunication(user, body)
})
