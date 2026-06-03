import { defineEventHandler, readBody } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { upsertAdminResource } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

type AdminResourceBody = {
  id?: number
  title: string
  description?: string | null
  date?: string | null
  timestamp?: string | null
  resource?: string | null
  autor?: string | null
  unidad?: string
  sala: string | number
  type: 'hw' | 'news' | 'cal'
  starred?: number | boolean | null
  hidden?: number | boolean | string | null
}

const schema: z.ZodType<AdminResourceBody> = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  timestamp: z.string().optional().nullable(),
  resource: z.string().optional().nullable(),
  autor: z.string().optional().nullable(),
  unidad: z.string().optional(),
  sala: z.union([z.string(), z.number()]),
  type: z.enum(['hw', 'news', 'cal']),
  starred: z.union([z.boolean(), z.number()]).optional().nullable(),
  hidden: z.union([z.boolean(), z.number(), z.string()]).optional().nullable()
})

export default defineEventHandler(async (event) => {
  const user = requireSession(event, 'admin')
  assertDaycareAdmin(user)
  const body = schema.parse(await readBody(event))
  return upsertAdminResource(user, body)
})
