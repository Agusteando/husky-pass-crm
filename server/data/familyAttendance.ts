import { createError } from 'h3'
import type { RowDataPacket } from 'mysql2/promise'
import type {
  AttendanceAbsenceRecord,
  AttendanceCalendarDay,
  AttendanceChild,
  AttendanceEvent,
  AttendanceTardyRecord,
  ParentAttendanceResponse,
  ParentAttendanceSummary,
  SchoolYearRange
} from '~/types/attendance'
import type { AppSessionUser } from '~/types/session'
import { legacyOne, legacyQuery } from '~/server/utils/mysql'
import { attendanceOne, attendanceQuery, attendanceWrite } from '~/server/utils/attendanceMysql'
import { resolveGrupoSigil } from '~/server/utils/grupoIcons'
import { deriveSipaePlantelFromStudent, plantelMatches, resolveSipaePlantel } from '~/server/utils/sipaePlantel'
import {
  fetchSipaeAttendanceDetail,
  fetchSipaeTardies,
  sipaeErrorMessage,
  sipaeErrorState,
  type SipaeAbsentStudent,
  type SipaeAttendanceDetailResponse,
  type SipaeAttendanceGroup,
  type SipaeTardiesResponse,
  type SipaeTardyRecord
} from '~/server/utils/sipaeAttendance'
import {
  buildSchoolYearOptions,
  dateOnly,
  formatAttendanceDate,
  formatAttendanceTime,
  normalizeAttendanceText,
  resolveSchoolYearOption
} from '~/utils/attendance'

interface StudentMetaRow extends RowDataPacket {
  matricula: string | null
  nombres: string | null
  apellido_paterno: string | null
  apellido_materno: string | null
  nivel: string | null
  grado: string | null
  grupo: string | null
  ciclo: string | null
  foto: string | null
  user_id: number | string | null
  campus: string | null
  nombre_padre: string | null
  apellido_paterno_padre: string | null
  apellido_materno_padre: string | null
  nombre_madre: string | null
  apellido_paterno_madre: string | null
  apellido_materno_madre: string | null
}

interface AttendanceDbRow extends RowDataPacket {
  id: number
  fecha: string | Date | null
  name: string | null
  grado: string | null
  grupo: string | null
  plantel: string | null
  attendance: number | boolean | null
  motivo: string | null
}

interface LegacyUserIdRow extends RowDataPacket {
  id: number
}

interface AccessScanRow extends RowDataPacket {
  id: number
  timestamp: string | Date | null
}

function cleanText(value: unknown) {
  const raw = String(value || '').trim()
  if (!/[\u00c3\u00c2\ufffd\u0080-\u009f]/.test(raw)) return raw
  try {
    return Buffer.from(raw, 'latin1').toString('utf8')
  } catch {
    return raw
  }
}

function nullable(value: unknown) {
  const normalized = cleanText(value).trim()
  return normalized || null
}

function surnameFirstName(child: AttendanceChild) {
  return [child.paternalName, child.maternalName, child.givenName].filter(Boolean).join(' ')
}

function givenFirstName(child: AttendanceChild) {
  return [child.givenName, child.paternalName, child.maternalName].filter(Boolean).join(' ')
}

function tokenKey(value: string) {
  return normalizeAttendanceText(value).split(' ').filter(Boolean).sort().join('|')
}

function childNameMatches(child: AttendanceChild, candidate?: string | null) {
  const normalizedCandidate = normalizeAttendanceText(cleanText(candidate))
  if (!normalizedCandidate) return false
  const variants = [child.name, givenFirstName(child), surnameFirstName(child)]
    .map((value) => normalizeAttendanceText(value))
    .filter(Boolean)
  return variants.includes(normalizedCandidate) || variants.some((variant) => tokenKey(variant) === tokenKey(normalizedCandidate))
}

function knownFieldMatches(childValue?: string | null, recordValue?: string | null) {
  const childKey = normalizeAttendanceText(cleanText(childValue))
  if (!childKey) return true
  return childKey === normalizeAttendanceText(cleanText(recordValue))
}

function groupMatches(child: AttendanceChild, record: { grado?: string | null; grupo?: string | null }) {
  return knownFieldMatches(child.grado, record.grado) && knownFieldMatches(child.grupo, record.grupo)
}

function absenceMatchesChild(child: AttendanceChild, record: { name?: string | null; grado?: string | null; grupo?: string | null }) {
  return childNameMatches(child, record.name) && groupMatches(child, record)
}

function dbAbsenceMatchesChild(child: AttendanceChild, record: AttendanceDbRow) {
  return Number(record.attendance) === 0
    && plantelMatches(record.plantel, child.plantelCode)
    && absenceMatchesChild(child, { name: record.name, grado: record.grado, grupo: record.grupo })
}

function tardyMatchesChild(child: AttendanceChild, record: SipaeTardyRecord) {
  const recordMatricula = normalizeAttendanceText(record.matricula)
  if (recordMatricula && recordMatricula !== 'N A') {
    return recordMatricula === normalizeAttendanceText(child.matricula)
  }
  return childNameMatches(child, record.student_fullname)
}

function groupDataMatchesChild(child: AttendanceChild, group: SipaeAttendanceGroup) {
  return groupMatches(child, { grado: group.grado || null, grupo: group.grupo || null })
}

function mapAbsence(absence: SipaeAbsentStudent & { date: string; plantel?: string | null }): AttendanceAbsenceRecord {
  const motivo = nullable(absence.motivo)
  return {
    id: Number(absence.id),
    date: absence.date,
    studentName: cleanText(absence.name),
    grado: nullable(absence.grado),
    grupo: nullable(absence.grupo),
    plantel: nullable(absence.plantel),
    motivo,
    motivoState: motivo ? 'provided' : 'missing',
    canUpdate: true
  }
}

function mapDbAbsence(row: AttendanceDbRow): AttendanceAbsenceRecord {
  const motivo = nullable(row.motivo)
  return {
    id: Number(row.id),
    date: dateOnly(row.fecha),
    studentName: cleanText(row.name),
    grado: nullable(row.grado),
    grupo: nullable(row.grupo),
    plantel: nullable(row.plantel),
    motivo,
    motivoState: motivo ? 'provided' : 'missing',
    canUpdate: true
  }
}

function rawSqlValues(values: Array<string | null | undefined>) {
  const seen = new Set<string>()
  return values
    .map((value) => cleanText(value).trim())
    .filter((value) => {
      const key = value.toUpperCase()
      if (!value || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function rawInClause(column: string, values: string[]) {
  return {
    clause: `${column} IN (${values.map(() => '?').join(',')})`,
    params: values
  }
}

function rawPlantelSqlClause(alias: string, plantelCode: string) {
  const plantel = resolveSipaePlantel(plantelCode)
  const values = rawSqlValues([
    plantel.dbCode,
    plantel.plantelCode,
    plantel.canonicalCode,
    plantel.resolvedName,
    ...plantel.dbCodes,
    ...plantel.sapfDataCampuses,
    ...plantel.huskyDbCodes
  ])

  return rawInClause(`${alias}.plantel`, values)
}

function rawKnownGroupWhere(child: AttendanceChild, alias: string) {
  const where: string[] = []
  const params: string[] = []
  const grado = cleanText(child.grado).trim()
  const grupo = cleanText(child.grupo).trim()
  if (grado) {
    where.push(`${alias}.grado = ?`)
    params.push(grado)
  }
  if (grupo) {
    where.push(`${alias}.grupo = ?`)
    params.push(grupo)
  }
  return { where, params }
}

function rawKnownNameWhere(child: AttendanceChild, alias: string) {
  const values = rawSqlValues([
    child.name,
    givenFirstName(child),
    surnameFirstName(child)
  ])

  if (!values.length) return { clause: '', params: [] as string[] }
  return rawInClause(`${alias}.name`, values)
}

function rangeStartTime(range: SchoolYearRange) {
  return `${range.startDate} 00:00:00`
}

function rangeEndTime(range: SchoolYearRange) {
  return `${range.endDate} 23:59:59`
}

async function fetchAttendanceDbFallback(child: AttendanceChild, range: SchoolYearRange) {
  const plantel = rawPlantelSqlClause('A', child.plantelCode)
  const group = rawKnownGroupWhere(child, 'A')
  const name = rawKnownNameWhere(child, 'A')
  const rows = await attendanceQuery<AttendanceDbRow[]>(
    `SELECT id, fecha, name, grado, grupo, plantel, attendance, motivo
     FROM asistencia A
     WHERE A.attendance = 0
       AND ${plantel.clause}
       AND A.fecha BETWEEN ? AND ?
       ${group.where.length ? `AND ${group.where.join(' AND ')}` : ''}
       ${name.clause ? `AND ${name.clause}` : ''}
     ORDER BY A.fecha ASC, A.id ASC`,
    [...plantel.params, rangeStartTime(range), rangeEndTime(range), ...group.params, ...name.params]
  )

  const absences = rows.filter((row) => dbAbsenceMatchesChild(child, row)).map(mapDbAbsence)
  const groupDates = new Set<string>()

  if (name.clause) {
    const groupRows = await attendanceQuery<RowDataPacket[]>(
      `SELECT DISTINCT DATE(A.fecha) AS fecha
       FROM asistencia A
       WHERE ${plantel.clause}
         AND A.fecha BETWEEN ? AND ?
         ${group.where.length ? `AND ${group.where.join(' AND ')}` : ''}
         AND ${name.clause}
       ORDER BY fecha ASC`,
      [...plantel.params, rangeStartTime(range), rangeEndTime(range), ...group.params, ...name.params]
    )
    for (const row of groupRows) {
      const date = dateOnly(row.fecha as string | Date | null)
      if (date) groupDates.add(date)
    }
  }

  for (const absence of absences) groupDates.add(absence.date)
  return { absences, groupDates }
}

function tardyThresholdForPlantel(plantelCode: string) {
  const dbCode = resolveSipaePlantel(plantelCode).dbCode
  if (dbCode === 'PM' || dbCode === 'PT') return '08:01:00'
  if (dbCode === 'SM' || dbCode === 'ST') return '07:01:00'
  return '09:01:00'
}

async function fetchTardiesDbFallback(child: AttendanceChild, range: SchoolYearRange) {
  const threshold = tardyThresholdForPlantel(child.plantelCode)
  const user = await legacyOne<LegacyUserIdRow>(
    `SELECT id
     FROM users
     WHERE username = ?
     LIMIT 1`,
    [child.matricula]
  )

  if (!user?.id) return []

  const directScans = await legacyQuery<AccessScanRow[]>(
    `SELECT id, timestamp
     FROM acceso
     WHERE ss_id = ?
       AND timestamp BETWEEN ? AND ?
       AND timestamp IS NOT NULL
       AND type = 'entrada'
       AND DAYOFWEEK(timestamp) NOT IN (1, 7)
     ORDER BY timestamp ASC`,
    [Number(user.id), rangeStartTime(range), rangeEndTime(range)]
  )
  const authorizedPeople = await legacyQuery<LegacyUserIdRow[]>(
    `SELECT id
     FROM personas_autorizadas
     WHERE user_id = ?`,
    [Number(user.id)]
  )
  const authorizedIds = authorizedPeople.map((row) => Number(row.id)).filter(Number.isFinite)
  const authorizedScans = authorizedIds.length
    ? await legacyQuery<AccessScanRow[]>(
      `SELECT id, timestamp
       FROM acceso
       WHERE ss_id IN (${authorizedIds.map(() => '?').join(',')})
         AND timestamp BETWEEN ? AND ?
         AND timestamp IS NOT NULL
         AND type = 'entrada'
         AND DAYOFWEEK(timestamp) NOT IN (1, 7)
       ORDER BY timestamp ASC`,
      [...authorizedIds, rangeStartTime(range), rangeEndTime(range)]
    )
    : []

  const firstScanByDate = new Map<string, AccessScanRow>()
  for (const scan of [...directScans, ...authorizedScans]) {
    const date = dateOnly(scan.timestamp)
    const timestamp = String(scan.timestamp || '')
    const previous = firstScanByDate.get(date)
    if (date && (!previous || timestamp < String(previous.timestamp || ''))) firstScanByDate.set(date, scan)
  }

  return Array.from(firstScanByDate.entries())
    .map(([date, scan]) => {
      const rawTimestamp = String(scan.timestamp || '')
      const rawTime = rawTimestamp.slice(11, 19)
      const time = formatAttendanceTime(rawTime)
      return { date, scan, rawTime, time }
    })
    .filter((record) => record.rawTime > threshold)
    .map(({ date, scan, time }) => mapTardy({
      id: scan.id,
      student_fullname: child.name,
      matricula: child.matricula,
      date,
      time
    }))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
}

function mapTardy(record: SipaeTardyRecord): AttendanceTardyRecord {
  return {
    id: Number(record.id),
    date: dateOnly(record.date),
    time: formatAttendanceTime(record.time),
    studentName: cleanText(record.student_fullname),
    matricula: nullable(record.matricula)
  }
}

function extractAbsences(payload: SipaeAttendanceDetailResponse, child: AttendanceChild) {
  const plantel = payload.resolved_name || payload.plantel_requested
  const records: Array<SipaeAbsentStudent & { date: string; plantel?: string | null }> = []

  if (payload.mode === 'daily') {
    const date = dateOnly(payload.date_range?.start)
    for (const absent of payload.absent_students || []) records.push({ ...absent, date, plantel })
  } else {
    for (const [date, day] of Object.entries(payload.daily_points || {})) {
      for (const absent of day.absent_students || []) records.push({ ...absent, date: dateOnly(date), plantel })
    }
  }

  const seen = new Set<number>()
  return records
    .filter((record) => absenceMatchesChild(child, record))
    .map(mapAbsence)
    .filter((record) => {
      if (!Number.isFinite(record.id) || seen.has(record.id)) return false
      seen.add(record.id)
      return true
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

function extractGroupDates(payload: SipaeAttendanceDetailResponse, child: AttendanceChild) {
  const dates = new Set<string>()

  if (payload.mode === 'daily') {
    if ((payload.groups || []).some((group) => groupDataMatchesChild(child, group))) dates.add(dateOnly(payload.date_range?.start))
  } else {
    for (const [date, day] of Object.entries(payload.daily_points || {})) {
      if ((day.groups || []).some((group) => groupDataMatchesChild(child, group))) dates.add(dateOnly(date))
    }
  }

  return dates
}

function extractTardies(payload: SipaeTardiesResponse, child: AttendanceChild) {
  const seen = new Set<string>()
  return (payload.retardos || [])
    .filter((record) => tardyMatchesChild(child, record))
    .map(mapTardy)
    .filter((record) => {
      const key = `${record.date}:${record.time}:${record.matricula || record.studentName}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
}

function buildCalendarDays(groupDates: Set<string>, absences: AttendanceAbsenceRecord[], tardies: AttendanceTardyRecord[]) {
  const absenceByDate = new Map(absences.map((absence) => [absence.date, absence]))
  const tardyDates = new Set(tardies.map((tardy) => tardy.date))
  const dates = new Set([...groupDates, ...absenceByDate.keys(), ...tardyDates])

  return Array.from(dates)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((date): AttendanceCalendarDay => {
      const absence = absenceByDate.get(date)
      const tardy = tardyDates.has(date)
      if (absence && tardy) return { date, status: 'absence-tardy', motivoState: absence.motivoState }
      if (absence) return { date, status: 'absence', motivoState: absence.motivoState }
      if (tardy) return { date, status: 'tardy' }
      return { date, status: 'clear' }
    })
}

function summarize(calendarDays: AttendanceCalendarDay[], absences: AttendanceAbsenceRecord[], tardies: AttendanceTardyRecord[]): ParentAttendanceSummary {
  return {
    schoolDaysWithAttendance: calendarDays.length,
    clearDays: calendarDays.filter((day) => day.status === 'clear' || day.status === 'tardy').length,
    absences: absences.length,
    tardies: tardies.length,
    unresolvedAbsences: absences.filter((absence) => absence.motivoState === 'missing').length,
    resolvedAbsences: absences.filter((absence) => absence.motivoState === 'provided').length
  }
}

function buildEvents(absences: AttendanceAbsenceRecord[], tardies: AttendanceTardyRecord[]) {
  const absenceEvents: AttendanceEvent[] = absences.map((absence) => ({
    key: `absence-${absence.id}`,
    type: 'absence',
    date: absence.date,
    title: 'Inasistencia',
    detail: absence.motivo ? 'Motivo registrado' : 'Motivo pendiente',
    absence
  }))
  const tardyEvents: AttendanceEvent[] = tardies.map((tardy) => ({
    key: `tardy-${tardy.id}-${tardy.date}-${tardy.time}`,
    type: 'tardy',
    date: tardy.date,
    time: tardy.time,
    title: 'Retardo',
    detail: tardy.time ? `Entrada ${tardy.time}` : 'Entrada fuera de horario',
    tardy
  }))

  return [...absenceEvents, ...tardyEvents]
    .sort((a, b) => `${b.date} ${b.time || '23:59'}`.localeCompare(`${a.date} ${a.time || '23:59'}`))
}

const FAMILY_PARENT_FIELDS = [
  'nombre_padre',
  'apellido_paterno_padre',
  'apellido_materno_padre',
  'nombre_madre',
  'apellido_paterno_madre',
  'apellido_materno_madre'
] as const

const STUDENT_SELECT = `
  m.matricula,
  m.nombres,
  m.apellido_paterno,
  m.apellido_materno,
  m.nivel,
  m.grado,
  m.grupo,
  m.ciclo,
  m.foto,
  m.nombre_padre,
  m.apellido_paterno_padre,
  m.apellido_materno_padre,
  m.nombre_madre,
  m.apellido_paterno_madre,
  m.apellido_materno_madre,
  u.id AS user_id,
  u.campus
`

function familyMatricula(user: AppSessionUser) {
  const matricula = String(user.username || '').trim()
  if (!matricula) throw createError({ statusCode: 403, statusMessage: 'La cuenta familiar no tiene matricula vinculada.' })
  return matricula
}

function isUsableMatricula(value: string) {
  return /^[A-Z0-9-]+$/i.test(value) && /\d/.test(value)
}

function completeAttendanceParentFields(row: StudentMetaRow) {
  return FAMILY_PARENT_FIELDS.every((field) => nullable(row[field]))
}

function attendanceChildFromRow(row: StudentMetaRow, currentMatricula: string, user: AppSessionUser): AttendanceChild | null {
  const matricula = String(row.matricula || '').trim()
  if (!matricula || !isUsableMatricula(matricula)) return null
  const nivelEdu = nullable(row.nivel)
  const campus = nullable(row.campus || user.campus || user.empresa)
  const plantelCode = deriveSipaePlantelFromStudent({
    matricula,
    nivelEdu,
    campus,
    plantel: user.plantel?.[0] || null
  })
  const name = [row.nombres, row.apellido_paterno, row.apellido_materno].map(nullable).filter(Boolean).join(' ') || matricula

  return {
    matricula,
    name,
    givenName: nullable(row.nombres),
    paternalName: nullable(row.apellido_paterno),
    maternalName: nullable(row.apellido_materno),
    grado: nullable(row.grado),
    grupo: nullable(row.grupo),
    nivelEdu,
    campus,
    plantel: plantelCode,
    plantelCode,
    foto: nullable(row.foto),
    ciclo: nullable(row.ciclo),
    isCurrent: matricula === currentMatricula
  }
}

async function loadAttendanceStudentRows(user: AppSessionUser) {
  const currentMatricula = familyMatricula(user)
  const current = await legacyOne<StudentMetaRow>(
    `SELECT ${STUDENT_SELECT}
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE m.matricula = ?
     LIMIT 1`,
    [currentMatricula]
  )

  if (!current) throw createError({ statusCode: 404, statusMessage: 'No encontramos la matricula vinculada a esta cuenta familiar.' })
  if (!completeAttendanceParentFields(current)) return [current]

  const where = FAMILY_PARENT_FIELDS.map((field) => `m.${field} = ?`).join(' AND ')
  const parentValues = FAMILY_PARENT_FIELDS.map((field) => String(current[field] || '').trim())
  const siblings = await legacyQuery<StudentMetaRow[]>(
    `SELECT ${STUDENT_SELECT}
     FROM matricula m
     LEFT JOIN users u ON u.username = m.matricula
     WHERE ${where}
     ORDER BY (m.matricula = ?) DESC, m.apellido_paterno ASC, m.apellido_materno ASC, m.nombres ASC
     LIMIT 8`,
    [...parentValues, currentMatricula]
  )

  if (siblings.length > 6) return [current]
  if (!siblings.some((row) => String(row.matricula || '').trim() === currentMatricula)) return [current, ...siblings]
  return siblings
}

export async function getAttendanceChildrenForFamily(user: AppSessionUser) {
  const currentMatricula = familyMatricula(user)
  const rows = await loadAttendanceStudentRows(user)
  const children = rows
    .map((row) => attendanceChildFromRow(row, currentMatricula, user))
    .filter(Boolean) as AttendanceChild[]

  if (!children.length) {
    throw createError({ statusCode: 404, statusMessage: 'No encontramos alumnos vinculados a esta cuenta familiar.' })
  }

  return children
}

export async function resolveAttendanceChild(user: AppSessionUser, matricula?: string | null) {
  const children = await getAttendanceChildrenForFamily(user)
  const requested = String(matricula || '').trim()
  const selected = requested
    ? children.find((child) => child.matricula === requested)
    : children.find((child) => child.isCurrent) || children[0]

  if (!selected) {
    throw createError({ statusCode: 403, statusMessage: 'El alumno solicitado no pertenece a esta cuenta familiar.' })
  }

  return { selected, children }
}

function sourceStatus(attendanceStatus: ParentAttendanceResponse['source']['attendance'], tardyStatus: ParentAttendanceResponse['source']['tardiness']): ParentAttendanceResponse['status'] {
  if (attendanceStatus === 'ready' && tardyStatus === 'ready') return 'ready'
  if (attendanceStatus === 'ready' || tardyStatus === 'ready') return 'partial'
  return 'unavailable'
}

const PARENT_SIPAE_DEADLINE_MS = 2500

function timedSource<T>(promise: Promise<T>, label: string) {
  let settled = false

  return new Promise<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }>((resolve) => {
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      resolve({ status: 'rejected', reason: new Error(`${label} exceeded parent read deadline`) })
    }, PARENT_SIPAE_DEADLINE_MS)

    promise.then((value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ status: 'fulfilled', value })
    }, (reason) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ status: 'rejected', reason })
    })
  })
}

async function resolveAttendanceSource(child: AttendanceChild, plantelCode: string, range: SchoolYearRange) {
  const dbResult = await fetchAttendanceDbFallback(child, range).then((value) => ({ status: 'fulfilled' as const, value }), (reason) => ({ status: 'rejected' as const, reason }))

  if (dbResult.status === 'fulfilled') {
    return {
      absences: dbResult.value.absences,
      groupDates: dbResult.value.groupDates,
      status: 'ready' as const
    }
  }

  const apiResult = await timedSource(fetchSipaeAttendanceDetail(plantelCode, range), 'SIPAE attendance')

  if (apiResult.status === 'fulfilled') {
    const apiAbsences = extractAbsences(apiResult.value, child)
    const apiGroupDates = extractGroupDates(apiResult.value, child)
    return {
      absences: apiAbsences,
      groupDates: apiGroupDates,
      status: 'ready' as const
    }
  }

  const reason = apiResult.reason || dbResult.reason
  return {
    absences: [] as AttendanceAbsenceRecord[],
    groupDates: new Set<string>(),
    status: sipaeErrorState(reason),
    message: sipaeErrorMessage(reason)
  }
}

async function resolveTardySource(child: AttendanceChild, plantelCode: string, range: SchoolYearRange) {
  const dbResult = await fetchTardiesDbFallback(child, range).then((value) => ({ status: 'fulfilled' as const, value }), (reason) => ({ status: 'rejected' as const, reason }))

  if (dbResult.status === 'fulfilled') {
    return {
      tardies: dbResult.value,
      status: 'ready' as const
    }
  }

  const apiResult = await timedSource(fetchSipaeTardies(plantelCode, range), 'SIPAE tardiness')

  if (apiResult.status === 'fulfilled') {
    const apiTardies = extractTardies(apiResult.value, child)
    return {
      tardies: apiTardies,
      status: 'ready' as const
    }
  }

  const reason = apiResult.reason || dbResult.reason
  return {
    tardies: [] as AttendanceTardyRecord[],
    status: sipaeErrorState(reason),
    message: sipaeErrorMessage(reason)
  }
}

export async function getParentAttendance(user: AppSessionUser, input: { matricula?: string | null; schoolYear?: string | null }) {
  const { selected, children } = await resolveAttendanceChild(user, input.matricula)
  const schoolYears = buildSchoolYearOptions(selected.ciclo)
  const selectedSchoolYear = resolveSchoolYearOption(input.schoolYear, schoolYears)
  const plantel = resolveSipaePlantel(selected.plantelCode)
  const grupoSigil = await resolveGrupoSigil(selected.grupo)
  const requestPlantel = plantel.canonicalCode || plantel.dbCode
  const [attendanceSource, tardySource] = await Promise.all([
    resolveAttendanceSource(selected, requestPlantel, selectedSchoolYear),
    resolveTardySource(selected, requestPlantel, selectedSchoolYear)
  ])

  const absences = attendanceSource.absences
  const groupDates = attendanceSource.groupDates
  const tardies = tardySource.tardies
  const attendanceStatus = attendanceSource.status
  const tardinessStatus = tardySource.status
  const attendanceMessage = attendanceSource.status === 'ready' ? undefined : attendanceSource.message
  const tardinessMessage = tardySource.status === 'ready' ? undefined : tardySource.message

  const calendarDays = buildCalendarDays(groupDates, absences, tardies)
  const summary = summarize(calendarDays, absences, tardies)

  return {
    status: sourceStatus(attendanceStatus, tardinessStatus),
    selectedChild: selected,
    children,
    selectedSchoolYear,
    schoolYears: schoolYears.some((year) => year.label === selectedSchoolYear.label)
      ? schoolYears
      : [selectedSchoolYear, ...schoolYears].sort((a, b) => b.label.localeCompare(a.label)),
    grupoSigil,
    summary,
    absences,
    tardies,
    calendarDays,
    events: buildEvents(absences, tardies),
    source: {
      label: 'SIPAE',
      attendance: attendanceStatus,
      tardiness: tardinessStatus,
      attendanceMessage,
      tardinessMessage
    }
  } satisfies ParentAttendanceResponse
}

function dateInRange(date: string, range: SchoolYearRange) {
  return date >= range.startDate && date <= range.endDate
}

export async function updateParentAbsenceMotivo(user: AppSessionUser, input: {
  matricula: string
  schoolYear?: string | null
  absenceId: number
  motivo: string
}) {
  const { selected } = await resolveAttendanceChild(user, input.matricula)
  const schoolYears = buildSchoolYearOptions(selected.ciclo)
  const selectedSchoolYear = resolveSchoolYearOption(input.schoolYear, schoolYears)
  const row = await attendanceOne<AttendanceDbRow>(
    `SELECT id, fecha, name, grado, grupo, plantel, attendance, motivo
     FROM asistencia
     WHERE id = ?
     LIMIT 1`,
    [input.absenceId]
  )

  if (!row) throw createError({ statusCode: 404, statusMessage: 'No encontramos la inasistencia solicitada.' })
  const recordDate = dateOnly(row.fecha)
  if (!recordDate || !dateInRange(recordDate, selectedSchoolYear)) {
    throw createError({ statusCode: 403, statusMessage: 'La inasistencia esta fuera del ciclo seleccionado.' })
  }
  if (!dbAbsenceMatchesChild(selected, row)) {
    throw createError({ statusCode: 403, statusMessage: 'La inasistencia no pertenece al alumno seleccionado.' })
  }

  const motivo = input.motivo.trim()
  await attendanceWrite(
    `UPDATE asistencia
     SET motivo = ?
     WHERE id = ? AND attendance = 0`,
    [motivo, input.absenceId]
  )

  return {
    absence: {
      ...mapDbAbsence({ ...row, motivo }),
      date: recordDate
    }
  }
}

export function attendanceEventDateLabel(date: string) {
  return formatAttendanceDate(date)
}
