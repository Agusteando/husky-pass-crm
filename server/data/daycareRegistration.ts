import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { publicError } from '~/server/utils/httpError'
import { useRuntimeConfig } from 'nitropack/runtime'
import { logPersonasWarning } from '~/server/utils/personasDiagnostics'
import type { RowDataPacket } from 'mysql2/promise'
import type { H3Event } from 'h3'
import type { AppSessionUser } from '~/types/session'
import { legacyOne, legacyQuery, legacyWrite, csvToList } from '~/server/utils/mysql'
import { DAYCARE_FAMILY_ROLE, hasRoleToken } from '~/utils/sessionScopes'
import { normalizeEmail } from '~/utils/superAdmin'
import { assertUnidadAccess } from '~/server/utils/authz'

interface SalaRegistrationRow extends RowDataPacket {
  id: number
  sala: string
  unidad: string
}

interface ExistingUserRow extends RowDataPacket {
  id: number
  email: string | null
  username: string | null
  role: string | null
  unidad: string | null
  sala: string | null
}

interface RegistrationLinkRow extends RowDataPacket {
  id: number
  token: string
  sala_id: number
  unidad: string
  sala_name: string
  active: number | boolean | string | null
  created_at?: string | Date | null
  regenerated_at?: string | Date | null
}

export interface DaycareRegistrationInput {
  parentName: string
  childName: string
  email: string
  password: string
  sala: number
  unidad?: string | null
  pictureUrl?: string | null
}

export interface DaycareRegistrationLink {
  token: string
  salaId: number
  sala: string
  unidad: string
  url?: string
  qrUrl?: string
  createdAt?: string | null
  regeneratedAt?: string | null
}

const REGISTRATION_LINK_TABLE = 'hp_daycare_registration_links'
const SIGNED_LINK_PREFIX = 'g-'

function clean(value: unknown) {
  return String(value || '').trim()
}

function normalizeName(value: string) {
  return clean(value).replace(/\s+/g, ' ')
}

function boolFromDb(value: unknown) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return String(value || '').trim() !== '0'
}

function normalizeDate(value: unknown) {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function assertStrongEnoughPassword(password: string) {
  if (password.length < 8) {
    throw publicError(400, 'La contraseña debe tener al menos 8 caracteres.')
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw publicError(400, 'Usa una contraseña con letras y números.')
  }
}

function slugPart(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function unidadCode(value: unknown) {
  const raw = String(value || '')
  const digits = raw.match(/\d+/g)?.join('') || ''
  if (digits) return `u${digits.replace(/^0+/, '') || digits}`
  return slugPart(raw) || 'unidad'
}

function salaCode(value: unknown) {
  return slugPart(value) || 'sala'
}

function friendlyRegistrationToken(sala: Pick<SalaRegistrationRow, 'unidad' | 'sala'>, suffix?: number | string | null) {
  const base = `${unidadCode(sala.unidad)}-${salaCode(sala.sala)}`.slice(0, 58).replace(/-+$/g, '')
  if (!suffix) return base
  return `${base}-${String(suffix).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6)}`.slice(0, 72).replace(/-+$/g, '')
}

function isFriendlyRegistrationTokenForSala(token: unknown, sala: Pick<SalaRegistrationRow, 'unidad' | 'sala'>) {
  const code = clean(token).toLowerCase()
  const base = friendlyRegistrationToken(sala)
  return Boolean(code && (code === base || code.startsWith(`${base}-`)))
}

function shortFallbackSignature(salaId: number) {
  return signLinkPayload(`sala:${salaId}`).slice(0, 8).toLowerCase()
}

function randomShortCode() {
  return randomBytes(3).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 4) || String(Date.now()).slice(-4)
}

function registrationLinkSecret() {
  return String(useRuntimeConfig().sessionSecret || process.env.SESSION_SECRET || 'change-me-before-production')
}

function signLinkPayload(payload: string) {
  return createHmac('sha256', registrationLinkSecret()).update(payload).digest('base64url')
}

function verifyLinkSignature(payload: string, signature: string) {
  const expected = signLinkPayload(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function makeSignedRegistrationToken(salaId: number) {
  return `${SIGNED_LINK_PREFIX}${salaId}-${shortFallbackSignature(salaId)}`
}

function parseSignedRegistrationToken(token: string) {
  const raw = clean(token).toLowerCase()
  if (!raw.startsWith(SIGNED_LINK_PREFIX)) return null
  const body = raw.slice(SIGNED_LINK_PREFIX.length)
  const [salaIdRaw, signature] = body.split('-')
  const salaId = Number(salaIdRaw)
  if (!Number.isInteger(salaId) || salaId <= 0 || !signature || signature !== shortFallbackSignature(salaId)) {
    throw publicError(404, 'El enlace de registro no es válido.')
  }
  return salaId
}

async function signedRegistrationLinkFor(event: H3Event, salaId: number) {
  const sala = await resolvePublicSala(salaId)
  const token = makeSignedRegistrationToken(sala.id)
  return {
    token,
    salaId: sala.id,
    sala: sala.sala,
    unidad: sala.unidad,
    createdAt: null,
    regeneratedAt: null,
    url: daycareRegistrationUrl(event, token),
    qrUrl: daycareRegistrationQrUrl(event, token)
  }
}

function publicBaseUrl(event: H3Event) {
  const requestUrl = new URL(event.node.req.url || '/', `http://${event.node.req.headers.host || 'localhost'}`)
  const forwardedProto = String(event.node.req.headers['x-forwarded-proto'] || '').split(',')[0]?.trim()
  const forwardedHost = String(event.node.req.headers['x-forwarded-host'] || '').split(',')[0]?.trim()
  const proto = forwardedProto || requestUrl.protocol.replace(':', '')
  const host = forwardedHost || event.node.req.headers.host || requestUrl.host
  return `${proto}://${host}`
}

export function daycareRegistrationUrl(event: H3Event, token: string) {
  const base = publicBaseUrl(event)
  return `${base}/r/${encodeURIComponent(token)}`
}

export function daycareRegistrationFormUrl(event: H3Event, token: string) {
  const base = publicBaseUrl(event)
  return `${base}/registro-guarderia?codigo=${encodeURIComponent(token)}`
}

export function daycareRegistrationQrUrl(event: H3Event, token: string) {
  const base = publicBaseUrl(event)
  return `${base}/api/daycare/registration/qr?codigo=${encodeURIComponent(token)}`
}

async function assertRegistrationLinkStoreAvailable() {
  await legacyQuery<RowDataPacket[]>(`SELECT 1 FROM ${REGISTRATION_LINK_TABLE} LIMIT 0`)
}

function mapLink(row: RegistrationLinkRow, event?: H3Event): DaycareRegistrationLink {
  const token = clean(row.token)
  return {
    token,
    salaId: Number(row.sala_id),
    sala: clean(row.sala_name),
    unidad: clean(row.unidad),
    createdAt: normalizeDate(row.created_at),
    regeneratedAt: normalizeDate(row.regenerated_at),
    url: event ? daycareRegistrationUrl(event, token) : undefined,
    qrUrl: event ? daycareRegistrationQrUrl(event, token) : undefined
  }
}

export async function listPublicDaycareSalas() {
  const rows = await legacyQuery<SalaRegistrationRow[]>(
    `SELECT id, sala, unidad
     FROM salas
     WHERE unidad IS NOT NULL AND TRIM(unidad) <> ''
     ORDER BY unidad ASC, id ASC`
  )
  return rows.map((row) => ({
    id: Number(row.id),
    sala: clean(row.sala),
    unidad: clean(row.unidad)
  }))
}

async function resolvePublicSala(salaId: number, unidad?: string | null) {
  const sala = await legacyOne<SalaRegistrationRow>(
    `SELECT id, sala, unidad
     FROM salas
     WHERE id = ?
     LIMIT 1`,
    [salaId]
  )
  if (!sala) throw publicError(404, 'No encontramos la sala seleccionada.')

  const requestedUnidad = clean(unidad)
  if (requestedUnidad && requestedUnidad !== clean(sala.unidad)) {
    throw publicError(400, 'La unidad no coincide con la sala seleccionada.')
  }

  return {
    id: Number(sala.id),
    sala: clean(sala.sala),
    unidad: clean(sala.unidad)
  }
}

async function resolveAdminSala(user: AppSessionUser, salaId: number) {
  const sala = await resolvePublicSala(salaId)
  assertUnidadAccess(user, sala.unidad)
  return sala
}

async function findExistingUsers(email: string) {
  return legacyQuery<ExistingUserRow[]>(
    `SELECT id, email, username, role, unidad, sala
     FROM users
     WHERE LOWER(email) = ? OR LOWER(username) = ?
     LIMIT 5`,
    [email, email]
  )
}

function daycareScopeFor(row: ExistingUserRow) {
  const roles = csvToList(row.role)
  const unidades = csvToList(row.unidad)
  const sala = clean(row.sala)
  return hasRoleToken(roles, DAYCARE_FAMILY_ROLE) && unidades.length && sala
    ? { unidad: unidades[0], sala }
    : null
}

export async function getOrCreateDaycareRegistrationLink(user: AppSessionUser, event: H3Event, salaId: number, regenerate = false) {
  const sala = await resolveAdminSala(user, salaId)

  try {
    await assertRegistrationLinkStoreAvailable()

    if (regenerate) {
      await legacyWrite(`UPDATE ${REGISTRATION_LINK_TABLE} SET active = 0 WHERE sala_id = ? AND active = 1`, [sala.id])
    }

    const existing = !regenerate
      ? await legacyOne<RegistrationLinkRow>(`SELECT * FROM ${REGISTRATION_LINK_TABLE} WHERE sala_id = ? AND active = 1 LIMIT 1`, [sala.id])
      : null
    if (existing?.token && isFriendlyRegistrationTokenForSala(existing.token, sala)) return mapLink(existing, event)
    if (existing?.token) {
      await legacyWrite(`UPDATE ${REGISTRATION_LINK_TABLE} SET active = 0 WHERE id = ?`, [existing.id])
    }

    const baseToken = friendlyRegistrationToken(sala)
    const tokenAttempts = regenerate
      ? [friendlyRegistrationToken(sala, randomShortCode()), friendlyRegistrationToken(sala, randomShortCode()), friendlyRegistrationToken(sala, Date.now().toString(36).slice(-4))]
      : [baseToken, friendlyRegistrationToken(sala, 2), friendlyRegistrationToken(sala, 3), friendlyRegistrationToken(sala, randomShortCode())]

    for (let attempt = 0; attempt < tokenAttempts.length; attempt += 1) {
      const token = tokenAttempts[attempt]
      try {
        await legacyWrite(
          `INSERT INTO ${REGISTRATION_LINK_TABLE} (token, sala_id, unidad, sala_name, created_by, regenerated_at)
           VALUES (?, ?, ?, ?, ?, ${regenerate ? 'CURRENT_TIMESTAMP' : 'NULL'})`,
          [token, sala.id, sala.unidad, sala.sala, user.email || user.username || String(user.id)]
        )
        const row = await legacyOne<RegistrationLinkRow>(`SELECT * FROM ${REGISTRATION_LINK_TABLE} WHERE token = ? LIMIT 1`, [token])
        if (row) return mapLink(row, event)
      } catch (error) {
        if (attempt === tokenAttempts.length - 1) throw error
      }
    }
  } catch (error) {
    logPersonasWarning('daycare-registration-link-persistent-store-unavailable', {
      salaId: sala.id,
      unidad: sala.unidad,
      message: error instanceof Error ? error.message : String(error)
    })
    return signedRegistrationLinkFor(event, sala.id)
  }

  throw publicError(500, 'No fue posible generar el enlace de registro.')
}

export async function resolveDaycareRegistrationLink(token: string, event?: H3Event) {
  const code = clean(token)
  if (!code || code.length < 4) throw publicError(404, 'El enlace de registro no es válido.')

  const signedSalaId = parseSignedRegistrationToken(code)
  if (signedSalaId) {
    const sala = await resolvePublicSala(signedSalaId)
    return {
      token: code,
      salaId: sala.id,
      sala: sala.sala,
      unidad: sala.unidad,
      createdAt: null,
      regeneratedAt: null,
      url: event ? daycareRegistrationUrl(event, code) : undefined,
      qrUrl: event ? daycareRegistrationQrUrl(event, code) : undefined
    }
  }

  try {
    await assertRegistrationLinkStoreAvailable()
    const row = await legacyOne<RegistrationLinkRow>(
      `SELECT * FROM ${REGISTRATION_LINK_TABLE} WHERE token = ? AND active = 1 LIMIT 1`,
      [code]
    )
    if (!row || !boolFromDb(row.active)) throw publicError(404, 'El enlace de registro no está activo.')
    return mapLink(row, event)
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    logPersonasWarning('daycare-registration-link-resolve-failed', { message: error instanceof Error ? error.message : String(error) })
    throw publicError(503, 'No fue posible validar el enlace de registro. Intenta de nuevo.')
  }
}

export async function registerDaycareFamily(input: DaycareRegistrationInput) {
  const parentName = normalizeName(input.parentName)
  const childName = normalizeName(input.childName)
  const email = normalizeEmail(input.email)
  if (!parentName) throw publicError(400, 'Escribe el nombre de madre, padre o tutor.')
  if (!childName) throw publicError(400, 'Escribe el nombre del niño o niña.')
  if (!email) throw publicError(400, 'Escribe un correo válido.')
  assertStrongEnoughPassword(input.password)

  const sala = await resolvePublicSala(input.sala, input.unidad)
  const existing = await findExistingUsers(email)
  if (existing.length > 1) {
    throw publicError(409, 'Encontramos más de una cuenta con ese correo. Solicita apoyo de administración.')
  }

  const current = existing[0]
  if (current) {
    const daycare = daycareScopeFor(current)
    if (daycare?.unidad === sala.unidad && String(daycare.sala) === String(sala.id)) {
      throw publicError(409, 'Este correo ya tiene acceso a guardería. Ingresa con tu cuenta existente.')
    }
    if (daycare) {
      throw publicError(409, 'Este correo ya está vinculado a otra sala. Solicita apoyo de administración.')
    }
    throw publicError(409, 'Este correo ya existe en Husky Pass. Solicita a administración activar guardería en esa cuenta.')
  }

  const passwordHash = await bcrypt.hash(input.password, 10)
  const result = await legacyWrite(
    `INSERT INTO users (nombre_nino, username, email, password, plaintext, role, unidad, sala, displayName, picture)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      childName,
      email,
      email,
      passwordHash,
      input.password,
      DAYCARE_FAMILY_ROLE,
      sala.unidad,
      String(sala.id),
      parentName,
      clean(input.pictureUrl) || null
    ]
  )

  return {
    id: result.insertId,
    email,
    username: email,
    displayName: parentName,
    childName,
    password: input.password,
    unidad: sala.unidad,
    sala: String(sala.id),
    salaName: sala.sala,
    role: DAYCARE_FAMILY_ROLE
  }
}
