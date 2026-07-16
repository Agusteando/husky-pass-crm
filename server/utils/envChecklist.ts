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

function serviceAccountDocument(env: EnvMap) {
  const candidates = [
    'GOOGLE_SERVICE_ACCOUNT_JSON',
    'GOOGLE_SERVICE_ACCOUNT_JSON_BASE64',
    'GOOGLE_SERVICE_ACCOUNT_CREDENTIALS',
    'GOOGLE_SERVICE_ACCOUNT',
    'GOOGLE_CREDENTIALS',
    'GOOGLE_CREDENTIALS_JSON',
    'GOOGLE_CREDENTIALS_BASE64',
    'GOOGLE_APPLICATION_CREDENTIALS_JSON',
    'GOOGLE_APPLICATION_CREDENTIALS_BASE64',
    'GCP_SERVICE_ACCOUNT_JSON',
    'GCP_SERVICE_ACCOUNT_CREDENTIALS',
    'GOOGLE_SERVICE_ACCOUNT_KEY'
  ]
  for (const key of candidates) {
    const raw = value(env, key)
    if (!raw) continue
    const attempts = [raw]
    try { attempts.push(Buffer.from(raw, 'base64').toString('utf8')) } catch {}
    for (const candidate of attempts) {
      try {
        const parsed = JSON.parse(candidate) as { client_email?: unknown; private_key?: unknown }
        if (parsed && typeof parsed === 'object') return parsed
      } catch {}
    }
  }

  const privateKeyValue = value(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
  if (privateKeyValue.startsWith('{')) {
    try {
      const parsed = JSON.parse(privateKeyValue) as { client_email?: unknown; private_key?: unknown }
      if (parsed && typeof parsed === 'object') return parsed
    } catch {}
  }
  return null
}

function serviceAccountEmailShape(env: EnvMap) {
  const aliases = ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL', 'GOOGLE_CLIENT_EMAIL', 'GOOGLE_CLOUD_SERVICE_ACCOUNT_EMAIL', 'GCP_SERVICE_ACCOUNT_EMAIL', 'GCLOUD_SERVICE_ACCOUNT_EMAIL']
  if (aliases.some((key) => validEmailLike(env, key))) return true
  const document = serviceAccountDocument(env)
  return /^[^@\s]+@[^@\s]+\.gserviceaccount\.com$/i.test(String(document?.client_email || '').trim())
}


function decodePrivateKeyBase64(env: EnvMap) {
  for (const key of ['GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64', 'GOOGLE_PRIVATE_KEY_BASE64', 'GCP_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64']) {
    const raw = value(env, key)
    if (!raw) continue
    try {
      const decoded = Buffer.from(raw, 'base64').toString('utf8')
      if (decoded.includes('-----BEGIN PRIVATE KEY-----')) return decoded
    } catch {}
  }
  return ''
}

function privateKeyShape(env: EnvMap) {
  const document = serviceAccountDocument(env)
  const normalized = String(
    document?.private_key
      || value(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
      || value(env, 'GOOGLE_PRIVATE_KEY')
      || value(env, 'GOOGLE_CLOUD_PRIVATE_KEY')
      || value(env, 'GCP_SERVICE_ACCOUNT_PRIVATE_KEY')
      || decodePrivateKeyBase64(env)
  ).replace(/\\n/g, '\n')
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
    item(env, 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'Service account', serviceAccountEmailShape(env), 'Cuenta de servicio identificada.', 'Falta client_email de la cuenta de servicio.'),
    item(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', 'Private key', privateKeyShape(env), 'Credencial privada valida.', 'Falta private_key o no tiene formato PEM.'),
    item(env, 'GOOGLE_WORKSPACE_DELEGATED_USER', 'Usuario delegado', validEmailLike(env, 'GOOGLE_WORKSPACE_DELEGATED_USER') || validEmailLike(env, 'GOOGLE_GMAIL_DELEGATED_USER'), 'Delegacion configurada.', 'Falta GOOGLE_WORKSPACE_DELEGATED_USER o GOOGLE_GMAIL_DELEGATED_USER.')
  ]

  if (hasValue(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64')) {
    recoveryItems.push(
      item(env, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64', 'Private key base64', Boolean(decodePrivateKeyBase64(env)), 'Credencial base64 valida.', 'La credencial base64 no contiene una private_key PEM valida.')
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
