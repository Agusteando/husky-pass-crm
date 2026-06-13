import { defineEventHandler, getQuery } from 'h3'
import { passwordRecoveryStatusMessage, validatePasswordRecoveryToken } from '~/server/data/passwordRecovery'

export default defineEventHandler(async (event) => {
  const token = String(getQuery(event).token || '')
  const validation = await validatePasswordRecoveryToken(token)
  return {
    status: validation.status,
    valid: validation.status === 'valid',
    message: passwordRecoveryStatusMessage(validation.status)
  }
})
