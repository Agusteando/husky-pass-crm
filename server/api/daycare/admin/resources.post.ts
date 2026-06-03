import { defineEventHandler, readBody } from 'h3'
import { requireSession } from '~/server/utils/session'
import { z } from 'zod'
import { upsertAdminResource } from '~/server/data/mysqlDaycare'
import { assertDaycareAdmin } from '~/server/utils/authz'

const schema = z.object({
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
