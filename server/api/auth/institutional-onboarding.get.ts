import { defineEventHandler } from 'h3'
import { getAllDaycareUnidades } from '~/server/data/mysqlAuth'
import { requireSession } from '~/server/utils/session'
import type { InstitutionalAccessRole, InstitutionalOnboardingResponse } from '~/types/institutionalOnboarding'
import { INSTITUTIONAL_PLANTEL_OPTIONS, INSTITUTIONAL_ROLE_OPTIONS } from '~/utils/institutionalOnboarding'
import {
  defaultAdminRoute,
  hasDaycareAdminRole,
  hasMarketingAdminRole,
  hasSchoolAdminRole,
  isInstitutionalAdminIdentity,
  requiresInstitutionalOnboarding
} from '~/utils/sessionScopes'
import { publicError } from '~/server/utils/httpError'

function currentRole(user: ReturnType<typeof requireSession>): InstitutionalAccessRole | null {
  if (hasMarketingAdminRole(user)) return 'marketingAdmin'
  if (hasSchoolAdminRole(user)) return 'schoolAdmin'
  if (hasDaycareAdminRole(user)) return 'daycareAdmin'
  return null
}

export default defineEventHandler(async (event): Promise<InstitutionalOnboardingResponse> => {
  const user = requireSession(event, 'admin')
  if (!isInstitutionalAdminIdentity(user) || user.isSuperAdmin) {
    throw publicError(403, 'Esta cuenta no puede usar el onboarding institucional.')
  }

  return {
    account: {
      id: user.id,
      displayName: user.displayName || user.email.split('@')[0] || 'Colaborador',
      email: user.email,
      picture: user.picture
    },
    roles: INSTITUTIONAL_ROLE_OPTIONS,
    planteles: INSTITUTIONAL_PLANTEL_OPTIONS,
    unidades: await getAllDaycareUnidades().catch(() => []),
    current: {
      role: currentRole(user),
      planteles: [...user.plantel],
      unidades: [...user.unidades],
      complete: !requiresInstitutionalOnboarding(user),
      defaultPath: defaultAdminRoute(user)
    }
  }
})
