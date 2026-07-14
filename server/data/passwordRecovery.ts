import { getHeader, type H3Event } from 'h3'
import { publicError } from '~/server/utils/httpError'
import type { RowDataPacket } from 'mysql2/promise'
import { randomBytes, createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { useRuntimeConfig } from 'nitropack/runtime'
import { findLegacyFamilyById, updateLegacyFamilyPassword } from '~/server/data/mysqlAuth'
import { legacyOne, legacyWrite } from '~/server/utils/mysql'
import { logSecurityDiagnostic, logSecurityWarning, securityHash } from '~/server/utils/securityDiagnostics'
import type { ExperienceName } from '~/types/identity'
import { hasFamilyScope } from '~/utils/sessionScopes'

type RecoveryStatus = 'valid' | 'invalid' | 'expired' | 'used' | 'superseded'

interface RecoveryTokenRow extends RowDataPacket {
  id: number
  user_id: number
  email: string
  account_kind: string
  token_hash: string
  expires_at: string
  used_at: string | null
  superseded_at: string | null
  created_at: string
}

interface DevRecoveryTokenRow {
  id: number
  user_id: number
  email: string
  account_kind: string
  token_hash: string
  expires_at: string
  used_at: string | null
  superseded_at: string | null
  created_at: string
}

export interface RecoveryTokenValidation {
  status: RecoveryStatus
  row?: RecoveryTokenRow
  experience?: Extract<ExperienceName, 'escolar' | 'guarderia'> | null
}

let schemaReady = false
let devFileStore = false

const TOKEN_BYTES = 32
const LEGACY_ACCOUNT_KIND = 'family'
const DEV_STORE_PATH = join(process.cwd(), 'artifacts', 'password-recovery-emails', 'dev-token-store.json')

interface DevRecoveryStore {
  nextId: number
  rows: DevRecoveryTokenRow[]
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function accountKindForExperience(experience: Extract<ExperienceName, 'escolar' | 'guarderia'>) {
  return `${LEGACY_ACCOUNT_KIND}:${experience}`
}

function experienceFromAccountKind(value?: string | null): Extract<ExperienceName, 'escolar' | 'guarderia'> | null {
  if (value === 'family:escolar') return 'escolar'
  if (value === 'family:guarderia') return 'guarderia'
  return null
}

function isFamilyRecoveryKind(value?: string | null) {
  return value === LEGACY_ACCOUNT_KIND || value === 'family:escolar' || value === 'family:guarderia'
}

function mysqlDateUtc(date: Date) {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

function parseMysqlUtc(value?: string | null) {
  if (!value) return null
  const normalized = String(value).includes('T') ? String(value) : `${String(value).replace(' ', 'T')}Z`
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function clientIp(event: H3Event) {
  const forwarded = getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || getHeader(event, 'x-real-ip') || event.node.req.socket.remoteAddress || 'unknown'
}

function tokenTtlMs() {
  const config = useRuntimeConfig()
  const minutes = Number(process.env.PASSWORD_RECOVERY_TOKEN_TTL_MINUTES || config.passwordRecovery?.tokenTtlMinutes || 30)
  return Math.max(5, Math.min(minutes, 24 * 60)) * 60 * 1000
}

function canUseDevFileStore() {
  const config = useRuntimeConfig()
  return process.env.NODE_ENV !== 'production' && String(process.env.PASSWORD_RECOVERY_EMAIL_MODE || config.passwordRecovery?.emailMode || '').toLowerCase() === 'preview'
}

function isTokenShape(token: string) {
  return /^[A-Za-z0-9_-]{32,220}$/.test(token)
}

async function readDevStore(): Promise<DevRecoveryStore> {
  try {
    const content = await readFile(DEV_STORE_PATH, 'utf8')
    const parsed = JSON.parse(content) as DevRecoveryStore
    return {
      nextId: Number(parsed.nextId || 1),
      rows: Array.isArray(parsed.rows) ? parsed.rows : []
    }
  } catch {
    return { nextId: 1, rows: [] }
  }
}

async function writeDevStore(store: DevRecoveryStore) {
  await mkdir(join(process.cwd(), 'artifacts', 'password-recovery-emails'), { recursive: true })
  await writeFile(DEV_STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
}

export async function ensurePasswordRecoveryStorage() {
  if (schemaReady) return
  try {
    await legacyOne<RowDataPacket>('SELECT 1 AS ready FROM password_recovery_tokens LIMIT 0')
    schemaReady = true
  } catch (error) {
    if (canUseDevFileStore()) {
      devFileStore = true
      schemaReady = true
      logSecurityWarning('password-recovery-storage-dev-file-store', { table: 'password_recovery_tokens', storePath: DEV_STORE_PATH })
      return
    }
    logSecurityDiagnostic('password-recovery-storage-unavailable', error, { table: 'password_recovery_tokens' })
    throw publicError(503, 'La recuperación de contraseña no está configurada.')
  }
}

export async function createPasswordRecoveryToken(input: { event: H3Event; userId: number; email: string; experience: Extract<ExperienceName, 'escolar' | 'guarderia'> }) {
  await ensurePasswordRecoveryStorage()
  const expiresAt = new Date(Date.now() + tokenTtlMs())
  const token = randomBytes(TOKEN_BYTES).toString('base64url')
  const tokenHash = hashToken(token)
  const email = input.email.trim().toLowerCase()
  const accountKind = accountKindForExperience(input.experience)

  try {
    if (devFileStore) {
      const store = await readDevStore()
      const now = Date.now()
      store.rows = store.rows.map((row) => {
        const expires = parseMysqlUtc(row.expires_at)?.getTime() || 0
        if (Number(row.user_id) === input.userId && row.account_kind === accountKind && !row.used_at && !row.superseded_at && expires > now) {
          return { ...row, superseded_at: mysqlDateUtc(new Date()) }
        }
        return row
      })
      store.rows.push({
        id: store.nextId,
        user_id: input.userId,
        email,
        account_kind: accountKind,
        token_hash: tokenHash,
        expires_at: mysqlDateUtc(expiresAt),
        used_at: null,
        superseded_at: null,
        created_at: mysqlDateUtc(new Date())
      })
      store.nextId += 1
      await writeDevStore(store)
      return { token, expiresAt }
    }

    await legacyWrite(
      `UPDATE password_recovery_tokens
       SET superseded_at = UTC_TIMESTAMP()
       WHERE user_id = ? AND account_kind = ? AND used_at IS NULL AND superseded_at IS NULL AND expires_at > UTC_TIMESTAMP()`,
      [input.userId, accountKind]
    )
    await legacyWrite(
      `INSERT INTO password_recovery_tokens
       (user_id, email, account_kind, token_hash, requested_ip_hash, user_agent_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.userId,
        email,
        accountKind,
        tokenHash,
        securityHash(clientIp(input.event)),
        securityHash(getHeader(input.event, 'user-agent') || ''),
        mysqlDateUtc(expiresAt)
      ]
    )
    return { token, expiresAt }
  } catch (error) {
    logSecurityDiagnostic('password-recovery-token-create-failed', error, {
      userId: input.userId,
      emailHash: securityHash(email)
    })
    throw publicError(500, 'No fue posible preparar el enlace de recuperación.')
  }
}

export async function validatePasswordRecoveryToken(rawToken: string): Promise<RecoveryTokenValidation> {
  const token = String(rawToken || '').trim()
  if (!isTokenShape(token)) return { status: 'invalid' }
  await ensurePasswordRecoveryStorage()
  try {
    if (devFileStore) {
      const store = await readDevStore()
      const row = store.rows.find((candidate) => candidate.token_hash === hashToken(token)) as RecoveryTokenRow | undefined
      if (!row || !isFamilyRecoveryKind(row.account_kind)) return { status: 'invalid' }
      const experience = experienceFromAccountKind(row.account_kind)
      if (row.used_at) return { status: 'used', row, experience }
      if (row.superseded_at) return { status: 'superseded', row, experience }
      const expiresAt = parseMysqlUtc(row.expires_at)
      if (!expiresAt || expiresAt.getTime() <= Date.now()) return { status: 'expired', row, experience }
      return { status: 'valid', row, experience }
    }

    const row = await legacyOne<RecoveryTokenRow>(
      `SELECT id, user_id, email, account_kind, token_hash, expires_at, used_at, superseded_at, created_at
       FROM password_recovery_tokens
       WHERE token_hash = ?
       LIMIT 1`,
      [hashToken(token)]
    )
    if (!row || !isFamilyRecoveryKind(row.account_kind)) return { status: 'invalid' }
    const experience = experienceFromAccountKind(row.account_kind)
    if (row.used_at) return { status: 'used', row, experience }
    if (row.superseded_at) return { status: 'superseded', row, experience }
    const expiresAt = parseMysqlUtc(row.expires_at)
    if (!expiresAt || expiresAt.getTime() <= Date.now()) return { status: 'expired', row, experience }
    return { status: 'valid', row, experience }
  } catch (error) {
    logSecurityDiagnostic('password-recovery-token-validate-failed', error, { tokenHash: securityHash(token) })
    throw publicError(500, 'No fue posible validar el enlace.')
  }
}

export function passwordRecoveryStatusMessage(status: RecoveryStatus) {
  if (status === 'expired') return 'El enlace expiró. Solicita uno nuevo.'
  if (status === 'used') return 'Este enlace ya fue utilizado.'
  if (status === 'superseded') return 'Hay un enlace más reciente para esta cuenta.'
  if (status === 'valid') return 'Enlace válido.'
  return 'El enlace no es válido.'
}

export async function resetPasswordWithRecoveryToken(rawToken: string, password: string) {
  const validation = await validatePasswordRecoveryToken(rawToken)
  if (validation.status !== 'valid' || !validation.row) {
    throw publicError(400, passwordRecoveryStatusMessage(validation.status))
  }

  const row = validation.row
  const familyUser = await findLegacyFamilyById(Number(row.user_id))
  if (!familyUser) {
    logSecurityWarning('password-recovery-family-account-missing', {
      tokenId: row.id,
      userId: row.user_id,
      emailHash: securityHash(row.email)
    })
    throw publicError(400, 'El enlace no es válido.')
  }

  const sessionUser = familyUser.toSession('family')
  if (validation.experience === 'escolar' && !hasFamilyScope(sessionUser, 'personasAutorizadas')) {
    logSecurityWarning('password-recovery-experience-mismatch', {
      tokenId: row.id,
      userId: row.user_id,
      tokenExperience: validation.experience,
      scopes: sessionUser.productScopes
    })
    throw publicError(400, 'El enlace no es válido.')
  }
  if (validation.experience === 'guarderia' && !hasFamilyScope(sessionUser, 'daycare')) {
    logSecurityWarning('password-recovery-experience-mismatch', {
      tokenId: row.id,
      userId: row.user_id,
      tokenExperience: validation.experience,
      scopes: sessionUser.productScopes
    })
    throw publicError(400, 'El enlace no es válido.')
  }

  try {
    if (devFileStore) {
      const store = await readDevStore()
      let consumed = false
      const nowLabel = mysqlDateUtc(new Date())
      store.rows = store.rows.map((candidate) => {
        if (Number(candidate.id) === Number(row.id) && candidate.account_kind === row.account_kind && !candidate.used_at && !candidate.superseded_at) {
          const expiresAt = parseMysqlUtc(candidate.expires_at)
          if (expiresAt && expiresAt.getTime() > Date.now()) {
            consumed = true
            return { ...candidate, used_at: nowLabel }
          }
        }
        return candidate
      })
      if (!consumed) throw publicError(400, 'El enlace ya no está disponible.')
      await writeDevStore(store)
    } else {
      const consumed = await legacyWrite(
        `UPDATE password_recovery_tokens
         SET used_at = UTC_TIMESTAMP()
         WHERE id = ? AND account_kind = ? AND used_at IS NULL AND superseded_at IS NULL AND expires_at > UTC_TIMESTAMP()`,
        [row.id, row.account_kind]
      )
      if (consumed.affectedRows !== 1) {
        throw publicError(400, 'El enlace ya no está disponible.')
      }
    }

    await updateLegacyFamilyPassword(Number(row.user_id), password)
    if (devFileStore) {
      const store = await readDevStore()
      const nowLabel = mysqlDateUtc(new Date())
      store.rows = store.rows.map((candidate) => (
        Number(candidate.user_id) === Number(row.user_id) && candidate.account_kind === row.account_kind && Number(candidate.id) !== Number(row.id) && !candidate.used_at
          ? { ...candidate, superseded_at: candidate.superseded_at || nowLabel }
          : candidate
      ))
      await writeDevStore(store)
    } else {
      await legacyWrite(
        `UPDATE password_recovery_tokens
         SET superseded_at = COALESCE(superseded_at, UTC_TIMESTAMP())
         WHERE user_id = ? AND account_kind = ? AND id <> ? AND used_at IS NULL`,
        [row.user_id, row.account_kind, row.id]
      )
    }
    return { userId: Number(row.user_id), email: row.email, experience: validation.experience }
  } catch (error) {
    logSecurityDiagnostic('password-recovery-password-update-failed', error, {
      tokenId: row.id,
      userId: row.user_id,
      emailHash: securityHash(row.email)
    })
    throw error
  }
}
