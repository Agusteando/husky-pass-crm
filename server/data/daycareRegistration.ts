import bcrypt from 'bcryptjs'
import { publicError } from '~/server/utils/httpError'
import type { RowDataPacket } from 'mysql2/promise'
import { legacyOne, legacyQuery, legacyWrite, csvToList } from '~/server/utils/mysql'
import { DAYCARE_FAMILY_ROLE, hasRoleToken } from '~/utils/sessionScopes'
import { normalizeEmail } from '~/utils/superAdmin'

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

export interface DaycareRegistrationInput {
  parentName: string
  childName: string
  email: string
  password: string
  sala: number
  unidad?: string | null
  pictureUrl?: string | null
}

function clean(value: unknown) {
  return String(value || '').trim()
}

function normalizeName(value: string) {
  return clean(value).replace(/\s+/g, ' ')
}

function assertStrongEnoughPassword(password: string) {
  if (password.length < 8) {
    throw publicError(400, 'La contraseña debe tener al menos 8 caracteres.')
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw publicError(400, 'Usa una contraseña con letras y números.')
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
      null,
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
    unidad: sala.unidad,
    sala: String(sala.id),
    salaName: sala.sala,
    role: DAYCARE_FAMILY_ROLE
  }
}
