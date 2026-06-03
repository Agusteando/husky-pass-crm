export const SUPER_ADMIN_EMAIL = 'desarrollo.tecnologico@casitaiedis.edu.mx'

export function normalizeEmail(email?: string | null) {
  return String(email || '').trim().toLowerCase()
}

export function isConfiguredSuperAdminEmail(email?: string | null) {
  return normalizeEmail(email) === SUPER_ADMIN_EMAIL
}
