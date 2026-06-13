import { createError, defineEventHandler } from 'h3'
import { readLatestRecoveryEmailPreview } from '~/server/utils/recoveryEmail'

export default defineEventHandler(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404, statusMessage: 'No disponible.' })
  }
  const latest = await readLatestRecoveryEmailPreview()
  if (!latest) return { latest: null }
  return { latest }
})
