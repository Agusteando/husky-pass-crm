import { createError } from 'h3'
import type { RowDataPacket } from 'mysql2/promise'
import type {
  AccessActionType,
  AccessHistoryAction,
  AccessHistoryDay,
  AccessHistoryPerson,
  AccessHistoryRange,
  AccessHistoryStudent,
  AdminAccessHistoryResponse,
  FamilyAccessHistoryResponse
} from '~/types/accessHistory'
import type { AttendanceChild } from '~/types/attendance'
import type { AppSessionUser } from '~/types/session'
import { getAttendanceChildrenForFamily, resolveAttendanceChild } from '~/server/data/familyAttendance'
import { legacyQuery } from '~/server/utils/mysql'
import { dateOnly, formatAttendanceTime } from '~/utils/attendance'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { normalizePlantel } from '~/utils/personasTheme'
import { normalizeMatricula } from '~/utils/matricula'
import { isValidatedVisionPhotoUrl } from '~/utils/visionFace'
import { deriveSipaePlantelFromStudent } from '~/server/utils/sipaePlantel'

interface AccessHistoryRow extends RowDataPacket {
  accessId: number
  timestamp: string | Date | null
  type: string | null
  personId: number | null
  indice: number | null
  paternoP: string | null
  maternoP: string | null
  nombreP: string | null
  parenP: string | null
  fotoP: string | null
  compressedFotoP: string | null
  userId: number | null
  matricula: string | null
  campus: string | null
  studentNombre: string | null
  studentPaterno: string | null
  studentMaterno: string | null
  nivelEdu: string | null
  grado: string | null
  grupo: string | null
  studentFoto: string | null
  apNombre: string | null
  apPaterno: string | null
  apMaterno: string | null
  apNivel: string | null
  apGrado: string | null
  apGrupo: string | null
  apFoto: string | null
}

interface UserIdRow extends RowDataPacket {
  id: number
  matricula: string | null
}

const MAX_ADMIN_LIMIT = 1000

function clean(value: unknown) {
  return String(value || '').trim()
}

function compactName(...parts: Array<string | null | undefined>) {
  return parts.map(clean).filter(Boolean).join(' ')
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function safeDate(value?: string | null) {
  const raw = clean(value)
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : ''
}

export function resolveAccessHistoryRange(input: { startDate?: string | null; endDate?: string | null } = {}): AccessHistoryRange {
  const today = todayDate()
  const defaultEnd = today
  const defaultStart = addDays(new Date(`${today}T12:00:00`), -30).toISOString().slice(0, 10)
  let startDate = safeDate(input.startDate) || defaultStart
  let endDate = safeDate(input.endDate) || defaultEnd
  if (startDate > endDate) [startDate, endDate] = [endDate, startDate]
  return { startDate, endDate }
}

function rangeStart(range: AccessHistoryRange) {
  return `${range.startDate} 00:00:00`
}

function rangeEnd(range: AccessHistoryRange) {
  return `${range.endDate} 23:59:59`
}

function timestampParts(value: string | Date | null) {
  if (value instanceof Date) {
    const pad = (part: number) => String(part).padStart(2, '0')
    const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
    const time = `${pad(value.getHours())}:${pad(value.getMinutes())}`
    return { date, time, timestamp: `${date} ${time}` }
  }

  const raw = clean(value).replace('T', ' ')
  const date = dateOnly(raw)
  const rawTime = raw.slice(11, 19)
  const time = formatAttendanceTime(rawTime)
  return { date, time, timestamp: raw || `${date} ${time}`.trim() }
}

function normalizeActionType(value?: string | null): AccessActionType | null {
  const action = clean(value).toLowerCase()
  if (action.includes('entrada')) return 'entrada'
  if (action.includes('salida')) return 'salida'
  return null
}

function personFromRow(row: AccessHistoryRow): AccessHistoryPerson {
  const name = compactName(row.nombreP, row.paternoP, row.maternoP) || `Persona ${row.personId || ''}`.trim()
  const originalPhoto = normalizeVirtualAssetUrl(row.fotoP || '')
  const processedPhoto = normalizeVirtualAssetUrl(row.compressedFotoP || '')
  return {
    id: Number(row.personId || 0),
    name,
    parentesco: clean(row.parenP) || null,
    indice: Number(row.indice || 0) || null,
    photoUrl: originalPhoto || (isValidatedVisionPhotoUrl(processedPhoto) ? processedPhoto : '')
  }
}

function studentFromRow(row: AccessHistoryRow, knownChild?: AttendanceChild): AccessHistoryStudent {
  const matricula = normalizeMatricula(row.matricula || knownChild?.matricula)
  const nivelEdu = clean(row.nivelEdu || row.apNivel || knownChild?.nivelEdu) || null
  const plantel = deriveSipaePlantelFromStudent({
    matricula,
    nivelEdu,
    campus: row.campus || knownChild?.campus || null,
    plantel: knownChild?.plantel || null
  })
  const name = knownChild?.name
    || compactName(row.studentNombre || row.apNombre, row.studentPaterno || row.apPaterno, row.studentMaterno || row.apMaterno)
    || matricula

  return {
    matricula,
    name,
    plantel,
    nivelEdu,
    grado: clean(row.grado || row.apGrado || knownChild?.grado) || null,
    grupo: clean(row.grupo || row.apGrupo || knownChild?.grupo) || null,
    foto: normalizeVirtualAssetUrl(row.studentFoto || row.apFoto || knownChild?.foto || '')
  }
}

function rowToAction(row: AccessHistoryRow): { action: AccessHistoryAction; student: AccessHistoryStudent } | null {
  const type = normalizeActionType(row.type)
  const person = personFromRow(row)
  const parts = timestampParts(row.timestamp)
  const student = studentFromRow(row)
  if (!type || !parts.date || !person.id || !student.matricula) return null

  return {
    student,
    action: {
      id: Number(row.accessId),
      type,
      timestamp: parts.timestamp,
      date: parts.date,
      time: parts.time,
      person
    }
  }
}

function groupRows(rows: AccessHistoryRow[], childByMatricula = new Map<string, AttendanceChild>()) {
  const groups = new Map<string, AccessHistoryDay>()
  const people = new Map<number, AccessHistoryPerson>()

  for (const row of rows) {
    const matricula = normalizeMatricula(row.matricula)
    const knownChild = childByMatricula.get(matricula)
    const mapped = rowToAction(row)
    if (!mapped) continue

    const student = knownChild ? studentFromRow(row, knownChild) : mapped.student
    const key = `${student.matricula}:${mapped.action.date}`
    const day = groups.get(key) || {
      key,
      date: mapped.action.date,
      student,
      actions: [],
      entrada: null,
      salida: null,
      people: [],
      status: 'solo-entrada' as const
    }

    const action = mapped.action
    day.actions.push(action)
    people.set(action.person.id, action.person)
    groups.set(key, day)
  }

  for (const day of groups.values()) {
    day.actions.sort((a, b) => `${a.date} ${a.time} ${a.id}`.localeCompare(`${b.date} ${b.time} ${b.id}`))
    day.entrada = day.actions.find((action) => action.type === 'entrada') || null
    day.salida = [...day.actions].reverse().find((action) => action.type === 'salida') || null
    day.people = Array.from(new Map(day.actions.map((action) => [action.person.id, action.person])).values())
    day.status = day.entrada && day.salida ? 'entrada-salida' : day.salida ? 'solo-salida' : 'solo-entrada'
  }

  const days = Array.from(groups.values()).sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare) return dateCompare
    return a.student.name.localeCompare(b.student.name, 'es')
  })

  const summary = {
    days: days.length,
    entries: days.reduce((total, day) => total + day.actions.filter((action) => action.type === 'entrada').length, 0),
    exits: days.reduce((total, day) => total + day.actions.filter((action) => action.type === 'salida').length, 0),
    uniquePeople: people.size,
    students: new Set(days.map((day) => day.student.matricula)).size
  }

  return {
    days,
    people: Array.from(people.values()).sort((a, b) => a.name.localeCompare(b.name, 'es')),
    summary
  }
}

async function userIdsForMatriculas(matriculas: string[]) {
  if (!matriculas.length) return []
  return legacyQuery<UserIdRow[]>(
    `SELECT id, UPPER(username) AS matricula
     FROM users
     WHERE UPPER(username) IN (${matriculas.map(() => '?').join(',')})`,
    matriculas
  )
}

async function queryAccessRows(input: {
  range: AccessHistoryRange
  userIds?: number[]
  search?: string | null
  limit?: number
}) {
  const where = [
    'A.timestamp BETWEEN ? AND ?',
    "LOWER(COALESCE(A.type, '')) IN ('entrada', 'salida')"
  ]
  const params: Array<string | number> = [rangeStart(input.range), rangeEnd(input.range)]

  if (input.userIds?.length) {
    where.push(`P.user_id IN (${input.userIds.map(() => '?').join(',')})`)
    params.push(...input.userIds)
  }

  const search = clean(input.search)
  if (search) {
    where.push(`(
      UPPER(u.username) LIKE ?
      OR CONCAT_WS(' ', m.nombres, m.apellido_paterno, m.apellido_materno) LIKE ?
      OR CONCAT_WS(' ', AP.nombreA, AP.paternoA, AP.maternoA) LIKE ?
      OR CONCAT_WS(' ', P.nombreP, P.paternoP, P.maternoP) LIKE ?
    )`)
    const term = `%${search.toUpperCase()}%`
    params.push(term, `%${search}%`, `%${search}%`, `%${search}%`)
  }

  const limit = Math.min(Math.max(Number(input.limit || MAX_ADMIN_LIMIT), 1), MAX_ADMIN_LIMIT)
  return legacyQuery<AccessHistoryRow[]>(
    `SELECT
       A.id AS accessId,
       A.timestamp,
       A.type,
       P.id AS personId,
       P.indice,
       P.paternoP,
       P.maternoP,
       P.nombreP,
       P.parenP,
       P.foto AS fotoP,
       P.compressed_foto AS compressedFotoP,
       u.id AS userId,
       UPPER(u.username) AS matricula,
       u.campus,
       m.nombres AS studentNombre,
       m.apellido_paterno AS studentPaterno,
       m.apellido_materno AS studentMaterno,
       m.nivel AS nivelEdu,
       m.grado,
       m.grupo,
       m.foto AS studentFoto,
       AP.nombreA AS apNombre,
       AP.paternoA AS apPaterno,
       AP.maternoA AS apMaterno,
       AP.nivelEdu AS apNivel,
       AP.grado AS apGrado,
       AP.grupo AS apGrupo,
       AP.foto AS apFoto
     FROM acceso A
     INNER JOIN personas_autorizadas P ON P.id = A.ss_id
     INNER JOIN users u ON u.id = P.user_id
     LEFT JOIN alumno_pa AP ON AP.user_id = u.id
     LEFT JOIN matricula m ON UPPER(m.matricula) = UPPER(u.username)
     WHERE ${where.join('\n       AND ')}
     ORDER BY A.timestamp DESC, A.id DESC
     LIMIT ${limit}`,
    params
  )
}

export async function getFamilyAccessHistory(user: AppSessionUser, input: {
  matricula?: string | null
  startDate?: string | null
  endDate?: string | null
} = {}): Promise<FamilyAccessHistoryResponse> {
  const range = resolveAccessHistoryRange(input)
  const { selected, children } = await resolveAttendanceChild(user, input.matricula)
  const childMatricula = normalizeMatricula(selected.matricula)
  const childByMatricula = new Map(children.map((child) => [normalizeMatricula(child.matricula), child]))
  const users = await userIdsForMatriculas([childMatricula])

  if (!users.length) {
    return {
      scope: 'family',
      range,
      selectedChild: selected,
      children,
      days: [],
      people: [],
      summary: { days: 0, entries: 0, exits: 0, uniquePeople: 0, students: 0 }
    }
  }

  const rows = await queryAccessRows({ range, userIds: users.map((row) => Number(row.id)), limit: MAX_ADMIN_LIMIT })
  const grouped = groupRows(rows, childByMatricula)
  return {
    scope: 'family',
    range,
    selectedChild: selected,
    children,
    ...grouped
  }
}

export async function getAdminAccessHistory(input: {
  startDate?: string | null
  endDate?: string | null
  plantel?: string | null
  search?: string | null
  limit?: number | null
} = {}): Promise<AdminAccessHistoryResponse> {
  const range = resolveAccessHistoryRange(input)
  const filters = {
    plantel: normalizePlantel(input.plantel),
    search: clean(input.search),
    limit: Math.min(Math.max(Number(input.limit || 500), 25), MAX_ADMIN_LIMIT)
  }
  const rows = await queryAccessRows({ range, search: filters.search, limit: filters.limit })
  const grouped = groupRows(rows)
  const planteles = Array.from(new Set(grouped.days.map((day) => normalizePlantel(day.student.plantel)).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'))
  const days = filters.plantel
    ? grouped.days.filter((day) => normalizePlantel(day.student.plantel) === filters.plantel)
    : grouped.days
  const visiblePeople = new Map<number, AccessHistoryPerson>()
  for (const day of days) for (const action of day.actions) visiblePeople.set(action.person.id, action.person)
  const summary = {
    days: days.length,
    entries: days.reduce((total, day) => total + day.actions.filter((action) => action.type === 'entrada').length, 0),
    exits: days.reduce((total, day) => total + day.actions.filter((action) => action.type === 'salida').length, 0),
    uniquePeople: visiblePeople.size,
    students: new Set(days.map((day) => day.student.matricula)).size
  }

  return {
    scope: 'admin',
    range,
    filters,
    planteles,
    days,
    people: Array.from(visiblePeople.values()).sort((a, b) => a.name.localeCompare(b.name, 'es')),
    summary
  }
}

export function accessHistoryCsv(response: AdminAccessHistoryResponse) {
  const rows = [
    ['Fecha', 'Alumno', 'Matrícula', 'Plantel', 'Grado', 'Grupo', 'Entrada', 'Persona entrada', 'Salida', 'Persona salida', 'Eventos']
  ]

  for (const day of response.days) {
    rows.push([
      day.date,
      day.student.name,
      day.student.matricula,
      day.student.plantel || '',
      day.student.grado || '',
      day.student.grupo || '',
      day.entrada?.time || '',
      day.entrada?.person.name || '',
      day.salida?.time || '',
      day.salida?.person.name || '',
      day.actions.map((action) => `${action.type} ${action.time} ${action.person.name}`).join(' | ')
    ])
  }

  return rows.map((row) => row.map((value) => {
    const text = String(value ?? '')
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }).join(',')).join('\n')
}

export async function assertFamilyCanAccessHistoryChild(user: AppSessionUser, matricula?: string | null) {
  const children = await getAttendanceChildrenForFamily(user)
  const requested = normalizeMatricula(matricula)
  if (!requested) return children
  if (!children.some((child) => normalizeMatricula(child.matricula) === requested)) {
    throw createError({ statusCode: 403, statusMessage: 'El alumno solicitado no pertenece a esta cuenta familiar.' })
  }
  return children
}
