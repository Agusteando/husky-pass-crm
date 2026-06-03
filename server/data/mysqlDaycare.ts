import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import type {
  AuthorizedChild,
  AuthorizedPerson,
  DaycareResource,
  FamilyAccount,
  PrintableAuthorizedPerson,
  Sala,
  ScanAuthorizedPerson
} from '~/types/daycare'
import { assertSalaAccess, assertUnidadAccess } from '~/server/utils/authz'
import { legacyOne, legacyQuery, legacyWrite } from '~/server/utils/mysql'

type AdminResourcePayload = Omit<DaycareResource, 'unidad'> & { unidad?: string }
type FamilyAccountPayload = Omit<FamilyAccount, 'unidad'> & { unidad?: string }
type AuthorizedPersonPayload = Partial<AuthorizedPerson> & { children?: AuthorizedChild[] }

function assertFamilyOwner(user: AppSessionUser, ownerId?: number | string | null) {
  if (String(user.id) !== String(ownerId)) {
    throw createError({ statusCode: 403, statusMessage: 'Registro fuera del alcance de la cuenta familiar' })
  }
}

function normalizeString(value: unknown) {
  if (value === undefined || value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

export async function getSalasForUnidad(user: AppSessionUser, unidad: string) {
  assertUnidadAccess(user, unidad)
  const rows = await legacyQuery<(Sala & RowDataPacket)[]>('SELECT id, sala, unidad FROM salas WHERE unidad = ? ORDER BY id ASC', [unidad])
  return rows.map((row) => ({ id: Number(row.id), sala: row.sala, unidad: row.unidad }))
}

export async function getSalaById(user: AppSessionUser, salaId: number) {
  assertSalaAccess(user, salaId)
  const sala = await legacyOne<(Sala & RowDataPacket)>('SELECT id, sala, unidad FROM salas WHERE id = ? LIMIT 1', [salaId])
  if (!sala) throw createError({ statusCode: 404, statusMessage: 'Sala no encontrada' })
  assertUnidadAccess(user, sala.unidad)
  return { id: Number(sala.id), sala: sala.sala, unidad: sala.unidad }
}

export async function getFamilyDashboard(user: AppSessionUser) {
  const unidad = user.scopes.daycare?.unidad
  const sala = user.scopes.daycare?.sala
  if (!unidad || !sala) throw createError({ statusCode: 403, statusMessage: 'La cuenta no tiene alcance de guardería' })

  const [tareas, circulares, calendario, valor] = await Promise.all([
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT *
       FROM recursos
       WHERE type = 'hw' AND sala = ? AND unidad = ? AND hidden = '0'
       ORDER BY id DESC`,
      [sala, unidad]
    ),
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT *
       FROM recursos
       WHERE type = 'news' AND unidad = ? AND sala = ? AND hidden = '0'
       GROUP BY timestamp
       ORDER BY id DESC`,
      [unidad, sala]
    ),
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT DISTINCT id, date, title, description,
        CONCAT('<p>', title, '</p>', '</br><p class="truncar">', description, '</p>') AS html,
        resource, starred, autor, unidad, sala, type, timestamp
       FROM recursos
       WHERE type = 'cal' AND unidad = ? AND sala = ? AND DATE(date) >= CURDATE() AND hidden = '0'
       GROUP BY date, title, description, timestamp, sala
       ORDER BY date`,
      [unidad, sala]
    ),
    legacyQuery<RowDataPacket[]>(`SELECT valor FROM valores_mensuales WHERE mes_en = MONTHNAME(CURDATE())`)
  ])

  return { tareas, circulares, calendario, valor }
}

export async function getFamilyResources(user: AppSessionUser, type: 'hw' | 'news' | 'cal') {
  const unidad = user.scopes.daycare?.unidad
  const sala = user.scopes.daycare?.sala
  if (!unidad || !sala) throw createError({ statusCode: 403, statusMessage: 'La cuenta no tiene alcance de guardería' })

  if (type === 'cal') {
    return legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT DISTINCT id, date, title, description,
        CONCAT('<p>', title, '</p>', '</br><p class="truncar">', description, '</p>') AS html,
        resource, starred, autor, unidad, sala, type, timestamp
       FROM recursos
       WHERE type = 'cal' AND unidad = ? AND sala = ? AND DATE(date) >= CURDATE() AND hidden = '0'
       GROUP BY date, title, description, timestamp, sala
       ORDER BY date`,
      [unidad, sala]
    )
  }

  const groupClause = type === 'news' ? 'GROUP BY timestamp' : ''
  return legacyQuery<(DaycareResource & RowDataPacket)[]>(
    `SELECT id, starred, title, description, date, timestamp, resource, autor, unidad, sala, type
     FROM recursos
     WHERE type = ? AND sala = ? AND unidad = ? AND hidden = 0
     ${groupClause}
     ORDER BY id DESC`,
    [type, sala, unidad]
  )
}

export async function getFamilyChildren(user: AppSessionUser) {
  return legacyQuery<(AuthorizedChild & RowDataPacket)[]>(
    `SELECT
      B.id,
      IFNULL(matricula.apellido_paterno, B.paternoA) AS paternoA,
      IFNULL(matricula.apellido_materno, B.maternoA) AS maternoA,
      IFNULL(matricula.nombres, B.nombreA) AS nombreA,
      IFNULL(matricula.grupo, B.grupo) AS grupo,
      IFNULL(matricula.grado, B.grado) AS grado,
      B.nivelEdu,
      B.campus,
      B.fechaA,
      B.user_id
    FROM alumno_pa B
    JOIN users ON B.user_id = users.id
    LEFT JOIN matricula ON users.username = matricula.matricula
    WHERE B.user_id = ?`,
    [user.id]
  )
}

export async function getAdminResources(user: AppSessionUser, salaId: number, type: 'hw' | 'news' | 'cal') {
  const sala = await getSalaById(user, salaId)
  const rows = await legacyQuery<(DaycareResource & RowDataPacket)[]>(
    `SELECT id, starred, title, description, date, timestamp, resource, autor, unidad, sala, type
     FROM recursos
     WHERE type = ? AND sala = ? AND unidad = ? AND hidden = 0
     ORDER BY date DESC, id DESC`,
    [type, salaId, sala.unidad]
  )
  return { sala, rows }
}

export async function upsertAdminResource(user: AppSessionUser, payload: AdminResourcePayload) {
  const sala = await getSalaById(user, Number(payload.sala))
  const data = {
    id: payload.id,
    title: payload.title,
    description: payload.description || '',
    date: payload.date || null,
    resource: payload.resource || null,
    autor: payload.autor || user.displayName || user.email,
    unidad: sala.unidad,
    sala: String(sala.id),
    type: payload.type,
    starred: payload.starred ? 1 : 0
  }

  if (data.id) {
    const existing = await legacyOne<RowDataPacket>('SELECT id, unidad, sala, type FROM recursos WHERE id = ? LIMIT 1', [data.id])
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Recurso no encontrado' })
    if (String(existing.unidad) !== data.unidad || String(existing.sala) !== data.sala || String(existing.type) !== data.type) {
      throw createError({ statusCode: 403, statusMessage: 'Recurso fuera del alcance de esta sala' })
    }

    await legacyWrite(
      `UPDATE recursos
       SET title = ?, description = ?, date = ?, resource = ?, autor = ?, starred = ?
       WHERE id = ? AND sala = ? AND unidad = ? AND type = ?`,
      [data.title, data.description, data.date, data.resource, data.autor, data.starred, data.id, data.sala, data.unidad, data.type]
    )
    return { ...data, id: data.id }
  }

  const result = await legacyWrite(
    `INSERT INTO recursos (title, description, date, resource, autor, unidad, sala, type, starred, hidden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [data.title, data.description, data.date, data.resource, data.autor, data.unidad, data.sala, data.type, data.starred]
  )
  return { ...data, id: result.insertId }
}

export async function hideAdminResource(user: AppSessionUser, id: number) {
  const row = await legacyOne<RowDataPacket>('SELECT id, unidad, sala FROM recursos WHERE id = ? LIMIT 1', [id])
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Recurso no encontrado' })
  assertUnidadAccess(user, String(row.unidad))
  assertSalaAccess(user, String(row.sala))
  await legacyWrite('UPDATE recursos SET hidden = 1 WHERE id = ?', [id])
  return { ok: true }
}

export async function getFamilyAccounts(user: AppSessionUser, salaId: number) {
  const sala = await getSalaById(user, salaId)
  const rows = await legacyQuery<(FamilyAccount & RowDataPacket)[]>(
    `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala
     FROM users
     WHERE FIND_IN_SET(?, unidad) AND role LIKE '%HUSKY%' AND sala = ?
     ORDER BY id ASC`,
    [sala.unidad, salaId]
  )
  return { sala, rows }
}

export async function upsertFamilyAccount(user: AppSessionUser, payload: FamilyAccountPayload) {
  const sala = await getSalaById(user, Number(payload.sala))
  const role = payload.role && payload.role.includes('HUSKY') ? payload.role : 'ROLE_HUSKY_USER'

  if (payload.id) {
    const existing = await legacyOne<RowDataPacket>('SELECT id, role, unidad, sala FROM users WHERE id = ? LIMIT 1', [payload.id])
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Cuenta familiar no encontrada' })

    const existingRole = String(existing.role || '').toUpperCase()
    const existingUnidades = String(existing.unidad || '').split(',').map((item) => item.trim()).filter(Boolean)
    const sameSala = String(existing.sala || '') === String(sala.id)
    const sameUnidad = existingUnidades.includes(sala.unidad)

    if (!existingRole.includes('HUSKY') || !sameSala || !sameUnidad) {
      throw createError({ statusCode: 403, statusMessage: 'Cuenta familiar fuera del alcance de esta sala' })
    }

    await legacyWrite(
      `UPDATE users
       SET nombre_nino = ?, username = ?, email = ?, plaintext = ?, role = ?, unidad = ?, sala = ?
       WHERE id = ?`,
      [payload.nombre_nino || null, payload.username, payload.email, payload.plaintext || null, role, sala.unidad, String(sala.id), payload.id]
    )
    return { ...payload, role, unidad: sala.unidad, sala: String(sala.id) }
  }

  const result = await legacyWrite(
    `INSERT INTO users (nombre_nino, username, email, plaintext, role, unidad, sala)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [payload.nombre_nino || null, payload.username, payload.email, payload.plaintext || null, role, sala.unidad, String(sala.id)]
  )
  return { ...payload, id: result.insertId, role, unidad: sala.unidad, sala: String(sala.id) }
}

export async function getAuthorizedPersonas(user: AppSessionUser) {
  const [people, children] = await Promise.all([
    legacyQuery<(AuthorizedPerson & RowDataPacket)[]>(
      `SELECT *
       FROM (SELECT 1 AS indice) AS indice
       LEFT JOIN (
         SELECT id, CAST(id AS CHAR) qr, paternoP, maternoP, nombreP, parenP, foto, compressed_foto, fechaP, user_id
         FROM personas_autorizadas
         WHERE user_id = ? AND indice = '1'
       ) AS personas_autorizadas ON true
       UNION ALL
       SELECT *
       FROM (SELECT 2 AS indice) AS indice
       LEFT JOIN (
         SELECT id, CAST(id AS CHAR) qr, paternoP, maternoP, nombreP, parenP, foto, compressed_foto, fechaP, user_id
         FROM personas_autorizadas
         WHERE user_id = ? AND indice = '2'
       ) AS personas_autorizadas ON true
       UNION ALL
       SELECT *
       FROM (SELECT 3 AS indice) AS indice
       LEFT JOIN (
         SELECT id, CAST(id AS CHAR) qr, paternoP, maternoP, nombreP, parenP, foto, compressed_foto, fechaP, user_id
         FROM personas_autorizadas
         WHERE user_id = ? AND indice = '3'
       ) AS personas_autorizadas ON true
       UNION ALL
       SELECT *
       FROM (SELECT 4 AS indice) AS indice
       LEFT JOIN (
         SELECT id, CAST(id AS CHAR) qr, paternoP, maternoP, nombreP, parenP, foto, compressed_foto, fechaP, user_id
         FROM personas_autorizadas
         WHERE user_id = ? AND indice = '4'
       ) AS personas_autorizadas ON true`,
      [user.id, user.id, user.id, user.id]
    ),
    getFamilyChildren(user)
  ])

  return people.map((person, index) => ({
    ...person,
    indice: Number(person.indice || index + 1),
    id: person.id ? Number(person.id) : null,
    children
  }))
}

async function saveAuthorizedChildren(user: AppSessionUser, children?: AuthorizedChild[]) {
  if (!children) return

  for (const child of children) {
    const values = {
      paternoA: normalizeString(child.paternoA),
      maternoA: normalizeString(child.maternoA),
      nombreA: normalizeString(child.nombreA),
      grupo: normalizeString(child.grupo),
      grado: normalizeString(child.grado),
      nivelEdu: normalizeString(child.nivelEdu),
      campus: normalizeString(child.campus),
      fechaA: normalizeString(child.fechaA)
    }

    const hasContent = Object.values(values).some(Boolean)
    if (!hasContent) continue

    if (child.id) {
      await legacyWrite(
        `UPDATE alumno_pa
         SET paternoA = ?, maternoA = ?, nombreA = ?, grupo = ?, grado = ?, nivelEdu = ?, campus = ?, fechaA = ?, user_id = ?
         WHERE id = ? AND user_id = ?`,
        [values.paternoA, values.maternoA, values.nombreA, values.grupo, values.grado, values.nivelEdu, values.campus, values.fechaA, user.id, child.id, user.id]
      )
    } else {
      await legacyWrite(
        `INSERT INTO alumno_pa (paternoA, maternoA, nombreA, grupo, grado, nivelEdu, campus, fechaA, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [values.paternoA, values.maternoA, values.nombreA, values.grupo, values.grado, values.nivelEdu, values.campus, values.fechaA, user.id]
      )
    }
  }
}

export async function upsertAuthorizedPersona(user: AppSessionUser, payload: AuthorizedPersonPayload) {
  const indice = Number(payload.indice || 1)
  if (indice < 1 || indice > 4) {
    throw createError({ statusCode: 400, statusMessage: 'Índice de persona autorizada inválido' })
  }

  await saveAuthorizedChildren(user, payload.children)

  const values = {
    paternoP: normalizeString(payload.paternoP),
    maternoP: normalizeString(payload.maternoP),
    nombreP: normalizeString(payload.nombreP),
    parenP: normalizeString(payload.parenP),
    foto: normalizeString(payload.foto),
    compressed_foto: normalizeString(payload.compressed_foto),
    fechaP: normalizeString(payload.fechaP)
  }

  if (payload.id) {
    const existing = await legacyOne<RowDataPacket>('SELECT id, user_id FROM personas_autorizadas WHERE id = ? LIMIT 1', [payload.id])
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Persona autorizada no encontrada' })
    assertFamilyOwner(user, existing.user_id as number)

    await legacyWrite(
      `UPDATE personas_autorizadas
       SET indice = ?, paternoP = ?, maternoP = ?, nombreP = ?, parenP = ?, foto = ?, compressed_foto = ?, fechaP = ?, user_id = ?
       WHERE id = ? AND user_id = ?`,
      [indice, values.paternoP, values.maternoP, values.nombreP, values.parenP, values.foto, values.compressed_foto, values.fechaP, user.id, payload.id, user.id]
    )
    return { ...payload, indice, user_id: user.id }
  }

  const result = await legacyWrite(
    `INSERT INTO personas_autorizadas (indice, paternoP, maternoP, nombreP, parenP, foto, compressed_foto, fechaP, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [indice, values.paternoP, values.maternoP, values.nombreP, values.parenP, values.foto, values.compressed_foto, values.fechaP, user.id]
  )

  return { ...payload, id: result.insertId, indice, user_id: user.id, qr: String(result.insertId) }
}

export async function deleteAuthorizedPersona(user: AppSessionUser, id: number) {
  const existing = await legacyOne<RowDataPacket>('SELECT id, user_id FROM personas_autorizadas WHERE id = ? LIMIT 1', [id])
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Persona autorizada no encontrada' })
  assertFamilyOwner(user, existing.user_id as number)
  await legacyWrite('DELETE FROM personas_autorizadas WHERE id = ? AND user_id = ?', [id, user.id])
  return { ok: true }
}

export async function getCredentialAuthorizedPersona(user: AppSessionUser, id: number) {
  const row = await legacyOne<(PrintableAuthorizedPerson & RowDataPacket)>(
    `SELECT A.*, IFNULL(MAX(B.nivelEdu), 'preescolar') AS nivelEdu
     FROM personas_autorizadas A
     LEFT JOIN alumno_pa B ON A.user_id = B.user_id
     WHERE A.id = ?
     GROUP BY A.id`,
    [id]
  )
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Persona autorizada no encontrada' })
  assertFamilyOwner(user, row.user_id)
  return row
}

export async function getScanAuthorizedPersona(id: number) {
  const rows = await legacyQuery<(ScanAuthorizedPerson & RowDataPacket)[]>(
    `SELECT
       CONCAT(p.nombreP, ' ', p.paternoP, ' ', p.maternoP) AS fullnameP,
       CASE
         WHEN p.compressed_foto IS NOT NULL THEN CONCAT('https://casitaiedis.edu.mx/virtual/', p.compressed_foto)
         ELSE p.foto
       END AS fotoP,
       CONCAT(IFNULL(m.nombres, a.nombreA), ' ', IFNULL(m.apellido_paterno, a.paternoA), ' ', IFNULL(m.apellido_materno, a.maternoA)) AS fullnameA,
       MAX(c.foto) AS fotoA,
       IFNULL(m.grado, a.grado) AS gradoA,
       IFNULL(m.grupo, a.grupo) AS grupoA,
       p.parenP AS parentesco,
       u.username AS matricula,
       CASE
         WHEN LEFT(u.username, 2) = 'PT' AND a.nivelEdu LIKE '%sec%' THEN 'ST'
         WHEN LEFT(u.username, 2) = 'PT' AND a.nivelEdu LIKE '%prim%' THEN 'PT'
         WHEN LEFT(u.username, 2) = 'DM' THEN 'CM'
         ELSE LEFT(u.username, 2)
       END AS plantel,
       SUBSTRING_INDEX(LOWER(a.nivelEdu), ' ', 1) AS nivelEduA
     FROM personas_autorizadas p
     LEFT JOIN users u ON u.id = p.user_id
     LEFT JOIN alumno_pa a ON u.id = a.user_id
     LEFT JOIN matricula m ON u.username = m.matricula
     LEFT JOIN credenciales c ON u.username = c.matricula
     WHERE p.id = ?
     GROUP BY p.id`,
    [id]
  )
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'No se encontró el registro' })
  return rows[0]
}

async function getSalaMetrics(sala: Sala) {
  const [familyRow, resourceRow] = await Promise.all([
    legacyOne<RowDataPacket>(
      `SELECT COUNT(*) AS familias
       FROM users
       WHERE FIND_IN_SET(?, unidad) AND role LIKE '%HUSKY%' AND sala = ?`,
      [sala.unidad, sala.id]
    ),
    legacyOne<RowDataPacket>(
      `SELECT
        SUM(CASE WHEN type = 'hw' THEN 1 ELSE 0 END) AS tareas,
        SUM(CASE WHEN type = 'news' THEN 1 ELSE 0 END) AS avisos,
        SUM(CASE WHEN type = 'cal' THEN 1 ELSE 0 END) AS calendario,
        COUNT(*) AS totalRecursos,
        MAX(COALESCE(timestamp, date)) AS lastResourceAt
       FROM recursos
       WHERE sala = ? AND unidad = ? AND hidden = 0`,
      [sala.id, sala.unidad]
    )
  ])

  return {
    familias: Number(familyRow?.familias || 0),
    tareas: Number(resourceRow?.tareas || 0),
    avisos: Number(resourceRow?.avisos || 0),
    calendario: Number(resourceRow?.calendario || 0),
    totalRecursos: Number(resourceRow?.totalRecursos || 0),
    lastResourceAt: resourceRow?.lastResourceAt ? String(resourceRow.lastResourceAt) : null
  }
}

export async function getSalasOverviewForUnidad(user: AppSessionUser, unidad: string) {
  const salas = await getSalasForUnidad(user, unidad)
  return Promise.all(salas.map(async (sala) => ({
    ...sala,
    metrics: await getSalaMetrics(sala)
  })))
}

export async function getSalaOperationalOverview(user: AppSessionUser, salaId: number) {
  const sala = await getSalaById(user, salaId)
  const [metrics, latestResources, latestFamilies] = await Promise.all([
    getSalaMetrics(sala),
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT id, starred, title, description, date, timestamp, resource, autor, unidad, sala, type
       FROM recursos
       WHERE sala = ? AND unidad = ? AND hidden = 0
       ORDER BY id DESC
       LIMIT 6`,
      [sala.id, sala.unidad]
    ),
    legacyQuery<(FamilyAccount & RowDataPacket)[]>(
      `SELECT id, nombre_nino, username, email, plaintext, role, unidad, sala
       FROM users
       WHERE FIND_IN_SET(?, unidad) AND role LIKE '%HUSKY%' AND sala = ?
       ORDER BY id DESC
       LIMIT 5`,
      [sala.unidad, sala.id]
    )
  ])

  return { sala, metrics, latestResources, latestFamilies }
}
