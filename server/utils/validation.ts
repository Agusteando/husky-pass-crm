import type { z } from 'zod'
import { publicError } from '~/server/utils/httpError'

export function parseOrBadRequest<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: unknown,
  message = 'Revisa los datos e intenta nuevamente.'
): z.infer<TSchema> {
  const parsed = schema.safeParse(value)
  if (!parsed.success) throw publicError(400, message)
  return parsed.data
}
