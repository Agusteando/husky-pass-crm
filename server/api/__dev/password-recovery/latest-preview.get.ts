import { defineEventHandler } from 'h3'
import { publicError } from '~/server/utils/httpError'
import { readLatestRecoveryEmailPreview } from '~/server/utils/recoveryEmail'

export default defineEventHandler(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw publicError(404, 'No disponible.')
  }
  const latest = await readLatestRecoveryEmailPreview()
  if (!latest) return { latest: null }
  return { latest }
})
