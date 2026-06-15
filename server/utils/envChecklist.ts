import type { SuperAdminEnvChecklistGroup, SuperAdminEnvChecklistItem, SuperAdminEnvChecklistResponse } from '~/types/superadmin'

type EnvMap = Record<string, string | undefined>

function value(env: EnvMap, key: string) {
  return String(env[key] || '').trim()
}

function hasValue(env: EnvMap, key: string) {
  return value(env, key).length > 0
}

function validPositiveNumber(env: EnvMap, key: string) {
  const raw = value(env, key)
  if (!raw) return false
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0
}

function validOptionalPositiveNumber(env: EnvMap, key: string) {
  return !hasValue(env, key) || validPositiveNumber(env, key)
}

function validUrl(env: EnvMap, key: string) {
  const raw = value(env, key)
  if (!raw) return false
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validOptionalUrl(env: EnvMap, key: string) {
  return !hasValue(env, key) || validUrl(env, key)
}

function validEmailLike(env: EnvMap, key: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value(env, key))
}

function privateKeyShape(env: EnvMap) {
  const normalized = value(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY').replace(/\\n/g, '\n')
  return Boolean(
    normalized
    && normalized.includes('-----BEGIN PRIVATE KEY-----')
    && normalized.includes('-----END PRIVATE KEY-----')
    && normalized.includes('\n')
  )
}

function item(
  env: EnvMap,
  key: string,
  label: string,
  ok: boolean,
  messageOk: string,
  messageFail: string,
  severity: SuperAdminEnvChecklistItem['severity'] = 'required'
): SuperAdminEnvChecklistItem {
  return {
    key,
    label,
    ok,
    severity,
    message: ok ? messageOk : messageFail
  }
}

function group(id: string, label: string, items: SuperAdminEnvChecklistItem[]): SuperAdminEnvChecklistGroup {
  return { id, label, items }
}

export function buildEnvChecklist(env: EnvMap = process.env): SuperAdminEnvChecklistResponse {
  const core = group('core', 'Base de aplicacion', [
    item(env, 'MYSQL_HOST', 'MySQL host', hasValue(env, 'MYSQL_HOST'), 'Configurado.', 'Falta MYSQL_HOST.'),
    item(env, 'MYSQL_PORT', 'MySQL puerto', validPositiveNumber(env, 'MYSQL_PORT'), 'Puerto numerico.', 'MYSQL_PORT debe ser numerico.'),
    item(env, 'MYSQL_USER', 'MySQL usuario', hasValue(env, 'MYSQL_USER'), 'Configurado.', 'Falta MYSQL_USER.'),
    item(env, 'MYSQL_PASSWORD', 'MySQL password', hasValue(env, 'MYSQL_PASSWORD'), 'Configurado.', 'Falta MYSQL_PASSWORD.'),
    item(env, 'MYSQL_DATABASE', 'MySQL base', hasValue(env, 'MYSQL_DATABASE'), 'Configurado.', 'Falta MYSQL_DATABASE.'),
    item(env, 'MYSQL_CONNECTION_LIMIT', 'Pool MySQL', validOptionalPositiveNumber(env, 'MYSQL_CONNECTION_LIMIT'), 'Valor valido o usando default.', 'MYSQL_CONNECTION_LIMIT debe ser numerico.', 'warning'),
    item(env, 'SESSION_SECRET', 'Session secret', value(env, 'SESSION_SECRET').length >= 32, 'Longitud suficiente.', 'SESSION_SECRET debe tener al menos 32 caracteres.'),
    item(env, 'GOOGLE_CLIENT_ID', 'Google client ID', hasValue(env, 'GOOGLE_CLIENT_ID'), 'Configurado.', 'Falta GOOGLE_CLIENT_ID.')
  ])

  const recoveryItems: SuperAdminEnvChecklistItem[] = [
    item(env, 'PASSWORD_RECOVERY_BASE_URL', 'URL publica', validUrl(env, 'PASSWORD_RECOVERY_BASE_URL'), 'URL valida.', 'PASSWORD_RECOVERY_BASE_URL falta o no es URL.'),
    item(env, 'PASSWORD_RECOVERY_TOKEN_TTL_MINUTES', 'Vigencia token', validOptionalPositiveNumber(env, 'PASSWORD_RECOVERY_TOKEN_TTL_MINUTES'), 'Valor valido o usando default.', 'Debe ser un numero positivo.', 'warning'),
    item(env, 'PASSWORD_RECOVERY_EMAIL_MODE', 'Modo de correo', ['gmail', 'preview', ''].includes(value(env, 'PASSWORD_RECOVERY_EMAIL_MODE').toLowerCase()), 'Modo valido.', 'Usa gmail o preview.', 'warning'),
    item(env, 'PASSWORD_RECOVERY_FROM_EMAIL', 'Remitente', validEmailLike(env, 'PASSWORD_RECOVERY_FROM_EMAIL'), 'Correo valido.', 'Falta remitente o no parece correo.'),
    item(env, 'PASSWORD_RECOVERY_FROM_NAME', 'Nombre remitente', hasValue(env, 'PASSWORD_RECOVERY_FROM_NAME'), 'Configurado.', 'Falta PASSWORD_RECOVERY_FROM_NAME.', 'warning'),
    item(env, 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'Service account', validEmailLike(env, 'GOOGLE_SERVICE_ACCOUNT_EMAIL'), 'Correo valido.', 'Falta service account o no parece correo.'),
    item(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', 'Private key directa', privateKeyShape(env), 'PEM directo valido.', 'Usa GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY con saltos \\n; no uses _BASE64.'),
    item(env, 'GOOGLE_WORKSPACE_DELEGATED_USER', 'Usuario delegado', validEmailLike(env, 'GOOGLE_WORKSPACE_DELEGATED_USER') || validEmailLike(env, 'GOOGLE_GMAIL_DELEGATED_USER'), 'Delegacion configurada.', 'Falta GOOGLE_WORKSPACE_DELEGATED_USER o GOOGLE_GMAIL_DELEGATED_USER.')
  ]

  if (hasValue(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64')) {
    recoveryItems.push(
      item(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64', 'Base64 obsoleto', false, '', 'No se usa: reemplazalo por GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.', 'warning')
    )
  }

  const recovery = group('passwordRecovery', 'Recuperacion de contrasena', recoveryItems)

  const services = group('services', 'Servicios externos', [
    item(env, 'SIPAE_API_BASE_URL', 'SIPAE API', validOptionalUrl(env, 'SIPAE_API_BASE_URL'), 'URL valida o usando default.', 'SIPAE_API_BASE_URL no es URL.', 'warning'),
    item(env, 'SIPAE_API_TIMEOUT_MS', 'Timeout SIPAE', validOptionalPositiveNumber(env, 'SIPAE_API_TIMEOUT_MS'), 'Valor valido o usando default.', 'SIPAE_API_TIMEOUT_MS debe ser numerico.', 'warning'),
    item(env, 'EXPEDIENTE_UPLOAD_URL', 'Expediente upload', validOptionalUrl(env, 'EXPEDIENTE_UPLOAD_URL'), 'URL valida o usando default.', 'EXPEDIENTE_UPLOAD_URL no es URL.', 'warning'),
    item(env, 'NUXT_PUBLIC_PASE_PLATFORM_URL', 'Pase platform', validOptionalUrl(env, 'NUXT_PUBLIC_PASE_PLATFORM_URL'), 'URL valida o vacia.', 'NUXT_PUBLIC_PASE_PLATFORM_URL no es URL.', 'warning')
  ])

  const groups = [core, recovery, services]
  const ok = groups.every((entry) => entry.items.every((check) => check.ok || check.severity !== 'required'))
  return {
    ok,
    checkedAt: new Date().toISOString(),
    groups
  }
}
