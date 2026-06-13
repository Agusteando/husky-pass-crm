export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 100

export function validateFamilyPassword(password: string) {
  const issues: string[] = []
  if (password.length < PASSWORD_MIN_LENGTH) issues.push(`Usa al menos ${PASSWORD_MIN_LENGTH} caracteres.`)
  if (password.length > PASSWORD_MAX_LENGTH) issues.push(`Usa máximo ${PASSWORD_MAX_LENGTH} caracteres.`)
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(password)) issues.push('Incluye al menos una letra.')
  if (!/\d/.test(password)) issues.push('Incluye al menos un número.')
  if (/^\s|\s$/.test(password)) issues.push('Quita espacios al inicio o al final.')
  return issues
}

export function assertPasswordConfirmation(password: string, confirmation: string) {
  if (password !== confirmation) return ['Las contraseñas no coinciden.']
  return validateFamilyPassword(password)
}
