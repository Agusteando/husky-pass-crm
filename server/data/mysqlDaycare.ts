import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import type { DaycareResource, FamilyAccount, Sala } from '~/types/daycare'
import { assertSalaAccess, assertUnidadAccess } from '~/server/utils/authz'
import { legacyOne, legacyQuery, legacyWrite } from '~/server/utils/mysql'

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
  const unidad = user.unidades[0]
  const sala = user.sala
  if (!unidad || !sala) throw createError({ statusCode: 403, statusMessage: 'La cuenta no tiene unidad o sala asignada' })

  const [tareas, circulares, calendario, valor] = await Promise.all([
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT * FROM recursos WHERE type = 'hw' AND sala = ? AND unidad = ? AND hidden = '0' ORDER BY id DESC`,
      [sala, unidad]
    ),
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT * FROM recursos WHERE type = 'news' AND unidad = ? AND sala = ? AND hidden = '0' GROUP BY timestamp ORDER BY id DESC`,
      [unidad, sala]
    ),
    legacyQuery<(DaycareResource & RowDataPacket)[]>(
      `SELECT DISTINCT date, title, description, resource, id, starred, autor, unidad, sala, type
       FROM recursos
       WHERE type = 'cal' AND unidad = ? AND DATE(date) >= CURDATE() AND hidden = '0'
       GROUP BY date, title, description, timestamp
       ORDER BY date`,
      [unidad]
    ),
    legacyQuery<RowDataPacket[]>(`SELECT valor FROM valores_mensuales WHERE mes_en = MONTHNAME(CURDATE())`)
  ])

  return { tareas, circulares, calendario, valor }
}

export async function getFamilyResources(user: AppSessionUser, type: 'hw' | 'news' | 'cal') {
  const unidad = user.unidades[0]
  const sala = user.sala
  if (!unidad || !sala) throw createError({ statusCode: 403, statusMessage: 'La cuenta no tiene unidad o sala asignada' })

  const dateClause = type === 'cal' ? 'AND DATE(date) >= CURDATE()' : ''
  return legacyQuery<(DaycareResource & RowDataPacket)[]>(
    `SELECT id, starred, title, description, date, resource, autor, unidad, sala, type
     FROM recursos
     WHERE type = ? AND sala = ? AND unidad = ? AND hidden = 0 ${dateClause}
     ORDER BY date DESC, id DESC`,
    [type, sala, unidad]
  )
}

export async function getFamilyChildren(user: AppSessionUser) {
  return legacyQuery<RowDataPacket[]>(
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
    `SELECT id, starred, title, description, date, resource, autor, unidad, sala, type
     FROM recursos
     WHERE type = ? AND sala = ? AND unidad = ? AND hidden = 0
     ORDER BY date DESC, id DESC`,
    [type, salaId, sala.unidad]
  )
  return { sala, rows }
}

export async function upsertAdminResource(user: AppSessionUser, payload: DaycareResource) {
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

export async function upsertFamilyAccount(user: AppSessionUser, payload: FamilyAccount) {
  const sala = await getSalaById(user, Number(payload.sala))
  const role = payload.role && payload.role.includes('HUSKY') ? payload.role : 'ROLE_HUSKY_USER'

  if (payload.id) {
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

export async function getCurrentBitacora(user: AppSessionUser, fecha: string) {
  const uid = `${user.id}_${fecha.replaceAll('-', '_')}`
  const bitacora = await legacyOne<RowDataPacket>(
    `SELECT id, uid, user_id, fecha, logros, contenido, actividades
     FROM \`bitácoras\`
     WHERE user_id = ? AND DATE(fecha) = DATE(?)
     LIMIT 1`,
    [user.id, fecha]
  )

  return bitacora || {
    uid,
    user_id: user.id,
    fecha,
    logros: '',
    contenido: '',
    actividades: ''
  }
}

export async function saveBitacora(user: AppSessionUser, payload: Record<string, unknown>) {
  const fecha = String(payload.fecha || new Date().toISOString().slice(0, 10))
  const uid = String(payload.uid || `${user.id}_${fecha.replaceAll('-', '_')}`)
  const existing = await legacyOne<RowDataPacket>('SELECT id FROM `bitácoras` WHERE uid = ? LIMIT 1', [uid])

  if (existing) {
    await legacyWrite(
      `UPDATE \`bitácoras\`
       SET fecha = ?, user_id = ?, logros = ?, contenido = ?, actividades = ?
       WHERE uid = ?`,
      [fecha, user.id, String(payload.logros || ''), String(payload.contenido || ''), String(payload.actividades || ''), uid]
    )
    return { id: existing.id, uid }
  }

  const result = await legacyWrite(
    `INSERT INTO \`bitácoras\` (uid, fecha, user_id, logros, contenido, actividades)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uid, fecha, user.id, String(payload.logros || ''), String(payload.contenido || ''), String(payload.actividades || '')]
  )
  return { id: result.insertId, uid }
}
