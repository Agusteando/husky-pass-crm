import { defineEventHandler, getQuery } from 'h3'
import { passwordRecoveryStatusMessage, validatePasswordRecoveryToken } from '~/server/data/passwordRecovery'
import { defaultLoginRouteForExperience, recoveryRouteForExperience } from '~/utils/experienceIdentity'

export default defineEventHandler(async (event) => {
  const token = String(getQuery(event).token || '')
  const validation = await validatePasswordRecoveryToken(token)
  return {
    status: validation.status,
    valid: validation.status === 'valid',
    message: passwordRecoveryStatusMessage(validation.status),
    experience: validation.experience || null,
    loginPath: validation.experience ? defaultLoginRouteForExperience(validation.experience) : '/login',
    recoveryPath: validation.experience ? recoveryRouteForExperience(validation.experience) : '/recuperar-contrasena'
  }
})
