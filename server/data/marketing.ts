import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import {
  MKT_CHANNELS,
  MKT_STAGES,
  type CreateMktLeadInput,
  type MktJournalEntry,
  type MktJournalResponse,
  type MktLeadDetail,
  type MktLeadFilters,
  type MktLeadsResponse,
  type MktLeadSummary,
  type MktOverviewResponse,
  type MktStage,
  type MktStudentInterest
} from '~/types/mkt'
import { legacyOne, legacyQuery, legacyTransaction, legacyWrite } from '~/server/utils/mysql'
import { publicError } from '~/server/utils/httpError'

interface LeadRow extends RowDataPacket {
  id: number | string
  folio: string | null
  createdAt: string | null
  channel: string | null
  plantel: string | null
  campus: string | null
  fatherName: string | null
  motherName: string | null
  fatherEmail: string | null
  motherEmail: string | null
  fatherPhone: string | null
  motherPhone: string | null
  fatherAddress: string | null
  motherAddress: string | null
  fatherSource: string | null
  motherSource: string | null
  studentName: string | null
  level: string | null
  grade: string | null
  enrolled: number | boolean | null
  stage: string | null
  lastFollowUpAt: string | null
  lastFollowUp: string | null
  followUpCount: number | string | null
}

interface StudentRow extends RowDataPacket {
  id: number | string
  fullName: string | null
  paternalSurname: string | null
  maternalSurname: string | null
  firstName: string | null
  level: string | null
  grade: string | null
  birthDate: string | null
  enrolled: number | boolean | null
}

interface FollowUpRow extends RowDataPacket {
  id: number | string
  folio: string | null
  note: string | null
  stage: string | null
  createdAt: string | null
}

interface JournalRow extends RowDataPacket {
  id: number | string
  uid: string | null
  date: string | null
  achievements: string | null
  activities: string | null
  content: string | null
  comments: string | null
  feedback: string | null
}

interface CountRow extends RowDataPacket {
  total: number | string | null
}

interface OptionRow extends RowDataPacket {
  value: string | null
}

interface StageCountRow extends RowDataPacket {
  stage: string | null
  total: number | string | null
}

interface ChannelDayRow extends RowDataPacket {
  channel: string | null
  weekday: number | string | null
  total: number | string | null
}

interface MetricsRow extends RowDataPacket {
  totalLeads: number | string | null
  newThisWeek: number | string | null
  pendingContact: number | string | null
  followUpsToday: number | string | null
  enrolled: number | string | null
}

const LEAD_JOINS = `
  LEFT JOIN (
    SELECT parent_id, MIN(id) AS first_id
    FROM informes_mkt_siblings
    GROUP BY parent_id
  ) AS student_first ON student_first.parent_id = I.matricula
  LEFT JOIN informes_mkt_siblings AS S ON S.id = student_first.first_id
  LEFT JOIN (
    SELECT folio, MAX(id) AS latest_id, COUNT(*) AS follow_up_count
    FROM follow_ups
    GROUP BY folio
  ) AS follow_summary ON follow_summary.folio = I.matricula
  LEFT JOIN follow_ups AS F ON F.id = follow_summary.latest_id
`

const LEAD_SELECT = `
  SELECT
    I.id,
    I.matricula AS folio,
    I.timestamp AS createdAt,
    I.via_informes AS channel,
    I.plantel,
    I.campus,
    I.nombre_padre AS fatherName,
    I.nombre_madre AS motherName,
    I.email_padre AS fatherEmail,
    I.email_madre AS motherEmail,
    I.tel_padre AS fatherPhone,
    I.tel_madre AS motherPhone,
    I.domicilio_padre AS fatherAddress,
    I.domicilio_madre AS motherAddress,
    I.medio_padre AS fatherSource,
    I.medio_madre AS motherSource,
    COALESCE(NULLIF(S.nombre_alumno, ''), CONCAT_WS(' ', S.nombres, S.apellido_paterno, S.apellido_materno)) AS studentName,
    S.nivel_interes AS level,
    S.grado_interes AS grade,
    S.inscrito AS enrolled,
    COALESCE(NULLIF(F.stage, ''), 'Leads Entrantes') AS stage,
    F.created_at AS lastFollowUpAt,
    F.seguimiento AS lastFollowUp,
    COALESCE(follow_summary.follow_up_count, 0) AS followUpCount
  FROM informes_mkt AS I
  ${LEAD_JOINS}
`

const ORPHAN_LEAD_SELECT = `
  SELECT
    0 AS id,
    F.folio,
    follow_summary.first_created_at AS createdAt,
    NULL AS channel,
    NULL AS plantel,
    NULL AS campus,
    NULL AS fatherName,
    NULL AS motherName,
    NULL AS fatherEmail,
    NULL AS motherEmail,
    NULL AS fatherPhone,
    NULL AS motherPhone,
    NULL AS fatherAddress,
    NULL AS motherAddress,
    NULL AS fatherSource,
    NULL AS motherSource,
    NULL AS studentName,
    NULL AS level,
    NULL AS grade,
    0 AS enrolled,
    COALESCE(NULLIF(F.stage, ''), 'Leads Entrantes') AS stage,
    F.created_at AS lastFollowUpAt,
    F.seguimiento AS lastFollowUp,
    follow_summary.follow_up_count AS followUpCount
  FROM (
    SELECT folio, MAX(id) AS latest_id, MIN(created_at) AS first_created_at, COUNT(*) AS follow_up_count
    FROM follow_ups
    WHERE folio IS NOT NULL AND TRIM(folio) <> ''
    GROUP BY folio
  ) AS follow_summary
  INNER JOIN follow_ups AS F ON F.id = follow_summary.latest_id
  LEFT JOIN informes_mkt AS I ON I.matricula = F.folio
`

function clean(value: unknown) {
  return String(value ?? '').trim()
}

function numberValue(value: unknown) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number : 0
}

function toIso(value: unknown) {
  const raw = clean(value)
  if (!raw) return null
  return raw.includes('T') ? raw : raw.replace(' ', 'T')
}

export function normalizeMktStage(value: unknown): MktStage {
  const normalized = clean(value).toLocaleLowerCase('es-MX')
  const exact = MKT_STAGES.find((stage) => stage.toLocaleLowerCase('es-MX') === normalized)
  if (exact) return exact
  if (/primer|contacto/.test(normalized)) return 'Primer contacto'
  if (/discu|evalu|inter[eé]s/.test(normalized)) return 'Discusión'
  if (/negocia|propuesta/.test(normalized)) return 'Negociación'
  if (/inscri|cierre|convert/.test(normalized)) return 'Inscrito'
  return 'Leads Entrantes'
}

function leadFromRow(row: LeadRow): MktLeadSummary {
  return {
    id: numberValue(row.id),
    folio: clean(row.folio),
    createdAt: toIso(row.createdAt),
    channel: clean(row.channel) || 'No reporta vía de informe',
    plantel: clean(row.plantel),
    campus: clean(row.campus),
    contactName: clean(row.motherName) || clean(row.fatherName) || 'Contacto pendiente',
    phone: clean(row.motherPhone) || clean(row.fatherPhone),
    email: clean(row.motherEmail) || clean(row.fatherEmail),
    studentName: clean(row.studentName) || 'Estudiante pendiente',
    level: clean(row.level),
    grade: clean(row.grade),
    enrolled: Boolean(Number(row.enrolled)),
    stage: normalizeMktStage(row.stage),
    lastFollowUpAt: toIso(row.lastFollowUpAt),
    lastFollowUp: clean(row.lastFollowUp),
    followUpCount: numberValue(row.followUpCount)
  }
}

function normalizedFilters(filters: MktLeadFilters = {}) {
  return {
    search: clean(filters.search).slice(0, 100),
    stage: clean(filters.stage),
    channel: clean(filters.channel).slice(0, 80),
    plantel: clean(filters.plantel).toUpperCase().slice(0, 20),
    from: /^\d{4}-\d{2}-\d{2}$/.test(clean(filters.from)) ? clean(filters.from) : '',
    to: /^\d{4}-\d{2}-\d{2}$/.test(clean(filters.to)) ? clean(filters.to) : '',
    limit: Math.min(Math.max(numberValue(filters.limit) || 240, 1), 5000)
  }
}

function leadWhere(filters: ReturnType<typeof normalizedFilters>) {
  const where: string[] = []
  const params: Array<string | number> = []

  if (filters.search) {
    where.push(`(
      I.matricula LIKE ? OR I.nombre_padre LIKE ? OR I.nombre_madre LIKE ? OR
      I.email_padre LIKE ? OR I.email_madre LIKE ? OR I.tel_padre LIKE ? OR I.tel_madre LIKE ? OR
      S.nombre_alumno LIKE ?
    )`)
    const like = `%${filters.search}%`
    params.push(like, like, like, like, like, like, like, like)
  }
  if (filters.stage && filters.stage !== 'all') {
    where.push(`COALESCE(NULLIF(F.stage, ''), 'Leads Entrantes') = ?`)
    params.push(normalizeMktStage(filters.stage))
  }
  if (filters.channel && filters.channel !== 'all') {
    where.push('LOWER(COALESCE(I.via_informes, \'\')) = LOWER(?)')
    params.push(filters.channel)
  }
  if (filters.plantel && filters.plantel !== 'ALL') {
    where.push('UPPER(COALESCE(I.plantel, \'\')) = ?')
    params.push(filters.plantel)
  }
  if (filters.from) {
    where.push('DATE(I.timestamp) >= ?')
    params.push(filters.from)
  }
  if (filters.to) {
    where.push('DATE(I.timestamp) <= ?')
    params.push(filters.to)
  }

  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params }
}

function orphanLeadWhere(filters: ReturnType<typeof normalizedFilters>) {
  const where = ['I.id IS NULL']
  const params: Array<string | number> = []
  if (filters.search) {
    where.push('(F.folio LIKE ? OR F.seguimiento LIKE ?)')
    const like = `%${filters.search}%`
    params.push(like, like)
  }
  if (filters.stage && filters.stage !== 'all') {
    where.push(`COALESCE(NULLIF(F.stage, ''), 'Leads Entrantes') = ?`)
    params.push(normalizeMktStage(filters.stage))
  }
  if ((filters.channel && filters.channel !== 'all') || (filters.plantel && filters.plantel !== 'ALL')) {
    where.push('1 = 0')
  }
  if (filters.from) {
    where.push('DATE(follow_summary.first_created_at) >= ?')
    params.push(filters.from)
  }
  if (filters.to) {
    where.push('DATE(follow_summary.first_created_at) <= ?')
    params.push(filters.to)
  }
  return { sql: `WHERE ${where.join(' AND ')}`, params }
}

export async function listMktLeads(input: MktLeadFilters = {}): Promise<MktLeadsResponse> {
  const filters = normalizedFilters(input)
  const where = leadWhere(filters)
  const orphanWhere = orphanLeadWhere(filters)
  const [rows, orphanRows, totalRow, orphanTotalRow, channelRows, plantelRows] = await Promise.all([
    legacyQuery<LeadRow[]>(`${LEAD_SELECT} ${where.sql} ORDER BY I.timestamp DESC, I.id DESC LIMIT ${filters.limit}`, where.params),
    legacyQuery<LeadRow[]>(`${ORPHAN_LEAD_SELECT} ${orphanWhere.sql} ORDER BY F.created_at DESC, F.id DESC LIMIT ${filters.limit}`, orphanWhere.params),
    legacyOne<CountRow>(`SELECT COUNT(*) AS total FROM informes_mkt AS I ${LEAD_JOINS} ${where.sql}`, where.params),
    legacyOne<CountRow>(`SELECT COUNT(*) AS total FROM (${ORPHAN_LEAD_SELECT} ${orphanWhere.sql}) AS orphan_leads`, orphanWhere.params),
    legacyQuery<OptionRow[]>(`SELECT DISTINCT LOWER(TRIM(via_informes)) AS value FROM informes_mkt WHERE via_informes IS NOT NULL AND TRIM(via_informes) <> '' ORDER BY value ASC LIMIT 100`),
    legacyQuery<OptionRow[]>(`SELECT DISTINCT UPPER(TRIM(plantel)) AS value FROM informes_mkt WHERE plantel IS NOT NULL AND TRIM(plantel) <> '' ORDER BY value ASC LIMIT 100`)
  ])

  const leads = [...rows, ...orphanRows]
    .map(leadFromRow)
    .sort((a, b) => clean(b.lastFollowUpAt || b.createdAt).localeCompare(clean(a.lastFollowUpAt || a.createdAt)))
    .slice(0, filters.limit)

  return {
    leads,
    total: numberValue(totalRow?.total) + numberValue(orphanTotalRow?.total),
    filters,
    options: {
      channels: Array.from(new Set([...MKT_CHANNELS, ...channelRows.map((row) => clean(row.value)).filter(Boolean)])),
      planteles: plantelRows.map((row) => clean(row.value)).filter(Boolean),
      stages: [...MKT_STAGES]
    }
  }
}

export async function getMktLead(folioInput: string): Promise<MktLeadDetail> {
  const folio = clean(folioInput).toUpperCase()
  const reportRow = await legacyOne<LeadRow>(`${LEAD_SELECT} WHERE I.matricula = ? LIMIT 1`, [folio])
  const row = reportRow || await legacyOne<LeadRow>(`${ORPHAN_LEAD_SELECT} WHERE I.id IS NULL AND F.folio = ? LIMIT 1`, [folio])
  if (!row) throw publicError(404, 'No encontramos el informe solicitado.')

  const [studentRows, followRows] = await Promise.all([
    legacyQuery<StudentRow[]>(
      `SELECT id, nombre_alumno AS fullName, apellido_paterno AS paternalSurname, apellido_materno AS maternalSurname,
              nombres AS firstName, nivel_interes AS level, grado_interes AS grade, fecha_nacimiento AS birthDate, inscrito AS enrolled
       FROM informes_mkt_siblings
       WHERE parent_id = ?
       ORDER BY id ASC`,
      [folio]
    ),
    legacyQuery<FollowUpRow[]>(
      `SELECT id, folio, seguimiento AS note, stage, created_at AS createdAt
       FROM follow_ups
       WHERE folio = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 100`,
      [folio]
    )
  ])

  const summary = leadFromRow(row)
  const students: MktStudentInterest[] = studentRows.map((student) => ({
    id: numberValue(student.id),
    fullName: clean(student.fullName) || [student.firstName, student.paternalSurname, student.maternalSurname].map(clean).filter(Boolean).join(' '),
    firstName: clean(student.firstName),
    paternalSurname: clean(student.paternalSurname),
    maternalSurname: clean(student.maternalSurname),
    level: clean(student.level),
    grade: clean(student.grade),
    birthDate: toIso(student.birthDate),
    enrolled: Boolean(Number(student.enrolled))
  }))

  return {
    ...summary,
    father: {
      name: clean(row.fatherName), email: clean(row.fatherEmail), phone: clean(row.fatherPhone),
      address: clean(row.fatherAddress), source: clean(row.fatherSource)
    },
    mother: {
      name: clean(row.motherName), email: clean(row.motherEmail), phone: clean(row.motherPhone),
      address: clean(row.motherAddress), source: clean(row.motherSource)
    },
    students,
    followUps: followRows.map((followUp) => ({
      id: numberValue(followUp.id),
      folio: clean(followUp.folio),
      note: clean(followUp.note),
      stage: normalizeMktStage(followUp.stage),
      createdAt: toIso(followUp.createdAt)
    }))
  }
}

function folioPrefix(value: unknown) {
  const prefix = clean(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  if (prefix.length < 2) throw publicError(400, 'Selecciona un plantel válido para generar el folio.')
  return prefix
}

async function nextFolio(prefix: string, client: {
  one: <T extends RowDataPacket = RowDataPacket>(sql: string, params?: Array<string | number | boolean | Date | null>) => Promise<T | undefined>
}) {
  const row = await client.one<RowDataPacket & { sequence: number | string | null }>(
    `SELECT MAX(CAST(SUBSTRING(matricula, ?) AS UNSIGNED)) AS sequence
     FROM informes_mkt
     WHERE matricula REGEXP ?`,
    [prefix.length + 1, `^${prefix}[0-9]+$`]
  )
  const sequence = numberValue(row?.sequence) + 1
  return `${prefix}${String(sequence).padStart(5, '0')}`
}

export async function createMktLead(input: CreateMktLeadInput) {
  const prefix = folioPrefix(input.plantel)
  const relationship = input.relationship === 'padre' ? 'padre' : 'madre'

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const folio = await legacyTransaction(async (client) => {
        const generatedFolio = await nextFolio(prefix, client)
        const isFather = relationship === 'padre'
        await client.write(
          `INSERT INTO informes_mkt (
             matricula, via_informes, plantel, campus,
             nombre_padre, nombre_madre, email_padre, email_madre, tel_padre, tel_madre,
             domicilio_padre, domicilio_madre, medio_padre, medio_madre
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            generatedFolio, clean(input.channel) || 'No reporta via de informe', prefix, clean(input.campus) || null,
            isFather ? clean(input.contactName) : null, isFather ? null : clean(input.contactName),
            isFather ? clean(input.email) || null : null, isFather ? null : clean(input.email) || null,
            isFather ? clean(input.phone) || null : null, isFather ? null : clean(input.phone) || null,
            isFather ? clean(input.address) || null : null, isFather ? null : clean(input.address) || null,
            isFather ? clean(input.source) || null : null, isFather ? null : clean(input.source) || null
          ]
        )
        await client.write(
          `INSERT INTO informes_mkt_siblings (
             parent_id, nombre_alumno, nivel_interes, grado_interes, fecha_nacimiento, inscrito
           ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            generatedFolio, clean(input.studentName), clean(input.level), clean(input.grade) || null,
            clean(input.birthDate) ? `${clean(input.birthDate)} 00:00:00` : null, Boolean(input.enrolled)
          ]
        )
        if (clean(input.initialNote)) {
          await client.write(
            `INSERT INTO follow_ups (folio, seguimiento, stage) VALUES (?, ?, ?)`,
            [generatedFolio, clean(input.initialNote), 'Leads Entrantes']
          )
        }
        return generatedFolio
      })
      return getMktLead(folio)
    } catch (error) {
      const code = error && typeof error === 'object' ? (error as { code?: string }).code : ''
      if (code !== 'ER_DUP_ENTRY' || attempt === 2) throw error
    }
  }
  throw publicError(409, 'No fue posible reservar el folio. Intenta nuevamente.')
}

export async function addMktFollowUp(folioInput: string, noteInput: string, stageInput: string) {
  const folio = clean(folioInput).toUpperCase()
  const note = clean(noteInput)
  const stage = normalizeMktStage(stageInput)
  if (!note) throw publicError(400, 'Escribe el resultado del seguimiento.')
  const exists = await legacyOne<RowDataPacket & { id: number }>(
    `SELECT 1 AS id
     WHERE EXISTS (SELECT 1 FROM informes_mkt WHERE matricula = ?)
        OR EXISTS (SELECT 1 FROM follow_ups WHERE folio = ?)`,
    [folio, folio]
  )
  if (!exists) throw publicError(404, 'No encontramos el informe solicitado.')
  await legacyWrite('INSERT INTO follow_ups (folio, seguimiento, stage) VALUES (?, ?, ?)', [folio, note, stage])
  return getMktLead(folio)
}

const HTML_ENTITIES: Record<string, string> = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
  ntilde: 'ñ', Ntilde: 'Ñ'
}

export function legacyHtmlToText(value: unknown) {
  return clean(value)
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])\s*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (entity.startsWith('#x')) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16))
      if (entity.startsWith('#')) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10))
      return HTML_ENTITIES[entity] ?? match
    })
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function textToLegacyHtml(value: unknown) {
  const escaped = clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  if (!escaped) return null
  return escaped.split(/\n+/).map((line) => `<p>${line || '&nbsp;'}</p>`).join('\n')
}

function dateOnly(value: unknown) {
  const date = clean(value).slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw publicError(400, 'Selecciona una fecha válida.')
  return date
}

function journalFromRow(row: JournalRow | undefined, userId: number, date: string): MktJournalEntry {
  const entry = {
    id: row ? numberValue(row.id) : null,
    uid: clean(row?.uid) || `${userId}_${date}`,
    date: clean(row?.date).slice(0, 10) || date,
    achievements: legacyHtmlToText(row?.achievements),
    activities: legacyHtmlToText(row?.activities),
    content: legacyHtmlToText(row?.content),
    comments: legacyHtmlToText(row?.comments),
    feedback: legacyHtmlToText(row?.feedback),
    completed: false
  }
  entry.completed = Boolean(entry.achievements || entry.activities || entry.content || entry.comments)
  return entry
}

async function journalRowForDate(userId: number, date: string) {
  return legacyOne<JournalRow>(
    `SELECT id, uid, fecha AS date, logros AS achievements, actividades AS activities,
            contenido AS content, comentarios AS comments, feedback
     FROM \`bitácoras\`
     WHERE user_id = ? AND DATE(fecha) = ?
     ORDER BY id DESC
     LIMIT 1`,
    [userId, date]
  )
}

export async function getMktJournal(user: AppSessionUser, dateInput: string): Promise<MktJournalResponse> {
  const date = dateOnly(dateInput)
  const [row, recentRows] = await Promise.all([
    journalRowForDate(user.id, date),
    legacyQuery<JournalRow[]>(
      `SELECT id, uid, fecha AS date, logros AS achievements, actividades AS activities,
              contenido AS content, comentarios AS comments, feedback
       FROM \`bitácoras\`
       WHERE user_id = ?
       ORDER BY fecha DESC, id DESC
       LIMIT 14`,
      [user.id]
    )
  ])
  return {
    entry: journalFromRow(row, user.id, date),
    recent: recentRows.map((recent) => journalFromRow(recent, user.id, clean(recent.date).slice(0, 10)))
  }
}

export async function saveMktJournal(user: AppSessionUser, input: {
  date: string
  achievements?: string
  activities?: string
  content?: string
  comments?: string
}) {
  const date = dateOnly(input.date)
  const uid = `${user.id}_${date}`
  await legacyWrite(
    `INSERT INTO \`bitácoras\` (uid, user_id, fecha, logros, actividades, contenido, comentarios)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       user_id = VALUES(user_id), fecha = VALUES(fecha), logros = VALUES(logros),
       actividades = VALUES(actividades), contenido = VALUES(contenido), comentarios = VALUES(comentarios)`,
    [
      uid, user.id, `${date} 00:00:00`, textToLegacyHtml(input.achievements),
      textToLegacyHtml(input.activities), textToLegacyHtml(input.content), textToLegacyHtml(input.comments)
    ]
  )
  return getMktJournal(user, date)
}

export async function getMktOverview(user: AppSessionUser, todayInput: string): Promise<MktOverviewResponse> {
  const today = dateOnly(todayInput)
  const [metrics, stageRows, orphanStageRows, channelRows, weeklyRows, recentRows, recentOrphanRows, journalRow] = await Promise.all([
    legacyOne<MetricsRow>(
      `SELECT
         ((SELECT COUNT(*) FROM informes_mkt) +
          (SELECT COUNT(*) FROM (SELECT F.folio FROM follow_ups F LEFT JOIN informes_mkt I ON I.matricula = F.folio WHERE I.id IS NULL GROUP BY F.folio) O)) AS totalLeads,
         ((SELECT COUNT(*) FROM informes_mkt WHERE timestamp >= DATE_SUB(?, INTERVAL WEEKDAY(?) DAY)) +
          (SELECT COUNT(*) FROM (
             SELECT F.folio, MIN(F.created_at) AS first_created_at
             FROM follow_ups F LEFT JOIN informes_mkt I ON I.matricula = F.folio
             WHERE I.id IS NULL GROUP BY F.folio
           ) O WHERE O.first_created_at >= DATE_SUB(?, INTERVAL WEEKDAY(?) DAY))) AS newThisWeek,
         (SELECT COUNT(*) FROM informes_mkt I WHERE NOT EXISTS (SELECT 1 FROM follow_ups F WHERE F.folio = I.matricula)) AS pendingContact,
         (SELECT COUNT(*) FROM follow_ups WHERE DATE(created_at) = ?) AS followUpsToday,
         (SELECT COUNT(DISTINCT parent_id) FROM informes_mkt_siblings WHERE inscrito = 1) AS enrolled`,
      [today, today, today, today, today]
    ),
    legacyQuery<StageCountRow[]>(
      `SELECT COALESCE(NULLIF(F.stage, ''), 'Leads Entrantes') AS stage, COUNT(*) AS total
       FROM informes_mkt I
       LEFT JOIN (SELECT folio, MAX(id) AS latest_id FROM follow_ups GROUP BY folio) L ON L.folio = I.matricula
       LEFT JOIN follow_ups F ON F.id = L.latest_id
       GROUP BY COALESCE(NULLIF(F.stage, ''), 'Leads Entrantes')`,
    ),
    legacyQuery<StageCountRow[]>(
      `SELECT COALESCE(NULLIF(F.stage, ''), 'Leads Entrantes') AS stage, COUNT(*) AS total
       FROM (SELECT folio, MAX(id) AS latest_id FROM follow_ups GROUP BY folio) L
       INNER JOIN follow_ups F ON F.id = L.latest_id
       LEFT JOIN informes_mkt I ON I.matricula = F.folio
       WHERE I.id IS NULL
       GROUP BY COALESCE(NULLIF(F.stage, ''), 'Leads Entrantes')`,
    ),
    legacyQuery<StageCountRow[]>(
      `SELECT LOWER(COALESCE(NULLIF(TRIM(via_informes), ''), 'sin especificar')) AS stage, COUNT(*) AS total
       FROM informes_mkt
       WHERE timestamp >= DATE_SUB(?, INTERVAL 30 DAY)
       GROUP BY LOWER(COALESCE(NULLIF(TRIM(via_informes), ''), 'sin especificar'))
       ORDER BY total DESC
       LIMIT 8`,
      [today]
    ),
    legacyQuery<ChannelDayRow[]>(
      `SELECT LOWER(COALESCE(NULLIF(TRIM(via_informes), ''), 'sin especificar')) AS channel,
              WEEKDAY(timestamp) AS weekday, COUNT(*) AS total
       FROM informes_mkt
       WHERE DATE(timestamp) BETWEEN DATE_SUB(?, INTERVAL WEEKDAY(?) DAY)
                                 AND DATE_ADD(DATE_SUB(?, INTERVAL WEEKDAY(?) DAY), INTERVAL 6 DAY)
       GROUP BY LOWER(COALESCE(NULLIF(TRIM(via_informes), ''), 'sin especificar')), WEEKDAY(timestamp)
       ORDER BY channel ASC, weekday ASC`,
      [today, today, today, today]
    ),
    legacyQuery<LeadRow[]>(`${LEAD_SELECT} ORDER BY I.timestamp DESC, I.id DESC LIMIT 6`),
    legacyQuery<LeadRow[]>(`${ORPHAN_LEAD_SELECT} WHERE I.id IS NULL ORDER BY F.created_at DESC, F.id DESC LIMIT 6`),
    journalRowForDate(user.id, today)
  ])

  const stageMap = new Map<MktStage, number>(MKT_STAGES.map((stage) => [stage, 0]))
  for (const row of [...stageRows, ...orphanStageRows]) {
    const stage = normalizeMktStage(row.stage)
    stageMap.set(stage, (stageMap.get(stage) || 0) + numberValue(row.total))
  }
  const weeklyMap = new Map<string, number[]>()
  for (const row of weeklyRows) {
    const channel = clean(row.channel) || 'sin especificar'
    const days = weeklyMap.get(channel) || [0, 0, 0, 0, 0, 0, 0]
    const weekday = Math.min(Math.max(numberValue(row.weekday), 0), 6)
    days[weekday] = numberValue(row.total)
    weeklyMap.set(channel, days)
  }
  const journal = journalFromRow(journalRow, user.id, today)

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      totalLeads: numberValue(metrics?.totalLeads),
      newThisWeek: numberValue(metrics?.newThisWeek),
      pendingContact: numberValue(metrics?.pendingContact),
      followUpsToday: numberValue(metrics?.followUpsToday),
      enrolled: numberValue(metrics?.enrolled)
    },
    stageBreakdown: MKT_STAGES.map((stage) => ({ stage, count: stageMap.get(stage) || 0 })),
    channelBreakdown: channelRows.map((row) => ({ channel: clean(row.stage), count: numberValue(row.total) })),
    weeklyChannels: Array.from(weeklyMap, ([channel, days]) => ({ channel, days, total: days.reduce((sum, value) => sum + value, 0) })),
    recentLeads: [...recentRows, ...recentOrphanRows]
      .map(leadFromRow)
      .sort((a, b) => clean(b.lastFollowUpAt || b.createdAt).localeCompare(clean(a.lastFollowUpAt || a.createdAt)))
      .slice(0, 6),
    journal: {
      completedToday: journal.completed,
      achievements: journal.achievements,
      activities: journal.activities
    }
  }
}

export function mktLeadsToCsv(leads: MktLeadSummary[]) {
  const columns = ['Folio', 'Fecha', 'Etapa', 'Plantel', 'Campus', 'Alumno', 'Tutor', 'Teléfono', 'Correo', 'Vía de informe', 'Nivel', 'Grado', 'Seguimientos']
  const escape = (value: unknown) => {
    const raw = String(value ?? '')
    const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw
    return `"${safe.replace(/"/g, '""')}"`
  }
  const rows = leads.map((lead) => [
    lead.folio, lead.createdAt, lead.stage, lead.plantel, lead.campus, lead.studentName,
    lead.contactName, lead.phone, lead.email, lead.channel, lead.level, lead.grade, lead.followUpCount
  ].map(escape).join(','))
  return `\uFEFF${columns.map(escape).join(',')}\r\n${rows.join('\r\n')}`
}
