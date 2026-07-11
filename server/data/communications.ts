import { randomUUID } from 'node:crypto'
import type { RowDataPacket } from 'mysql2/promise'
import type { AppSessionUser } from '~/types/session'
import type {
  AdminCommunicationsResponse,
  CommunicationAttachment,
  CommunicationAttachmentKind,
  CommunicationAudience,
  CommunicationPriority,
  CommunicationStatus,
  FamilyCommunicationsResponse,
  SaveCommunicationInput,
  SchoolCommunication,
  CommunicationAdminScopeInput
} from '~/types/communications'
import type { AuthorizedChild } from '~/types/daycare'
import { getFamilyChildren } from '~/server/data/mysqlDaycare'
import { getGestionCommunicationScopes } from '~/server/data/gestionEscolar'
import { legacyOne, legacyQuery, legacyWrite } from '~/server/utils/mysql'
import { publicError } from '~/server/utils/httpError'
import { SCHOOL_PLANTELES, normalizeSchoolGrade, normalizeSchoolGradeForPlanteles, normalizeSchoolPlantel, schoolGradesForPlantel, schoolPlantelSqlFromMatricula } from '~/utils/schoolCatalog'

interface CommunicationRow extends RowDataPacket {
  id: number
  uid: string
  title: string | null
  summary: string | null
  body: string | null
  status: CommunicationStatus | null
  priority: CommunicationPriority | null
  sender_user_id: number | null
  sender_name: string | null
  sender_role: string | null
  created_at: string | null
  updated_at: string | null
  sent_at: string | null
  scheduled_for: string | null
}

interface CommunicationAudienceRow extends RowDataPacket {
  comunicado_id: number
  kind: CommunicationAudience['kind'] | null
  plantel: string | null
  nivel: string | null
  grado: string | null
  grupo: string | null
  label: string | null
}

interface CommunicationAttachmentRow extends RowDataPacket {
  comunicado_id: number
  attachment_uid: string | null
  name: string | null
  mime: string | null
  size: number | string | null
  url: string | null
  kind: CommunicationAttachmentKind | null
  thumbnail_url: string | null
  uploaded_at: string | null
}

interface CommunicationOptionsRow extends RowDataPacket {
  plantel: string | null
  nivel: string | null
  grado: string | null
  grupo: string | null
}

interface CommunicationReadRow extends RowDataPacket {
  comunicado_id: number
}

export interface CommunicationAdminScope extends Required<CommunicationAdminScopeInput> {
  userId?: number
}

interface CommunicationAccess {
  isGlobal: boolean
  canCreate: boolean
  canPublish: boolean
  scopes: CommunicationAdminScope[]
}

const DEFAULT_PLANTELES = [...SCHOOL_PLANTELES]
const SCHOOL_COMMUNICATION_PLANTELES = new Set(DEFAULT_PLANTELES)
const DEFAULT_NIVELES: string[] = []
const DEFAULT_GRADOS = Array.from(new Set(SCHOOL_PLANTELES.flatMap((plantel) => schoolGradesForPlantel(plantel))))
const DEFAULT_GRUPOS = ['A', 'B', 'C', 'G']

function clean(value: unknown) {
  return String(value || '').trim()
}

function upper(value: unknown) {
  return clean(value).toUpperCase()
}

function normalizeList(value: unknown) {
  return Array.isArray(value) ? value.map(clean).filter(Boolean) : []
}

function attachmentKind(mime: string): CommunicationAttachmentKind {
  if (mime === 'application/pdf') return 'pdf'
  if (mime.startsWith('image/')) return 'image'
  if (/spreadsheet|excel|csv/i.test(mime)) return 'spreadsheet'
  if (/word|document|text/i.test(mime)) return 'document'
  return 'other'
}

export function normalizeCommunicationAttachment(input: Partial<CommunicationAttachment>): CommunicationAttachment {
  const mime = clean(input.mime || 'application/octet-stream').toLowerCase()
  return {
    id: clean(input.id) || `att-${randomUUID()}`,
    name: clean(input.name) || 'Adjunto',
    mime,
    size: Math.max(0, Number(input.size || 0)),
    url: clean(input.url),
    kind: input.kind || attachmentKind(mime),
    thumbnailUrl: clean(input.thumbnailUrl) || null,
    uploadedAt: clean(input.uploadedAt) || new Date().toISOString()
  }
}

function normalizeAudience(input: Partial<CommunicationAudience> | null | undefined): CommunicationAudience {
  const kind = ['plantel', 'grado', 'grupo', 'custom'].includes(clean(input?.kind)) ? clean(input?.kind) as CommunicationAudience['kind'] : 'plantel'
  return {
    kind,
    planteles: Array.from(new Set(normalizeList(input?.planteles).map((item) => normalizeSchoolPlantel(item)).filter(Boolean) as string[])),
    niveles: [],
    grados: Array.from(new Set(normalizeList(input?.grados).map((item) => normalizeSchoolGradeForPlanteles(item, normalizeList(input?.planteles))).filter(Boolean) as string[])),
    grupos: normalizeList(input?.grupos).map((item) => item.toUpperCase()),
    label: clean(input?.label) || null
  }
}

function normalizeStatus(value: unknown): CommunicationStatus {
  const status = clean(value)
  return status === 'draft' || status === 'scheduled' || status === 'sent' ? status : 'draft'
}

function normalizePriority(value: unknown): CommunicationPriority {
  const priority = clean(value)
  return priority === 'urgent' || priority === 'important' || priority === 'normal' ? priority : 'normal'
}

function toIso(value: string | null | undefined) {
  const raw = clean(value)
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw
  return raw.replace(' ', 'T').replace(/(\.\d{3})?$/, (match) => match || '.000') + 'Z'
}

function toMysqlDate(value: string | null | undefined) {
  const raw = clean(value)
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw.slice(0, 19).replace('T', ' ')
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

function normalizeCommunication(input: Partial<SchoolCommunication>): SchoolCommunication {
  const now = new Date().toISOString()
  const createdAt = clean(input.createdAt) || now
  return {
    id: clean(input.id) || `com-${randomUUID()}`,
    title: clean(input.title) || 'Comunicado sin título',
    summary: clean(input.summary) || 'Comunicado del colegio.',
    body: clean(input.body) || clean(input.summary) || 'Comunicado del colegio.',
    status: normalizeStatus(input.status),
    priority: normalizePriority(input.priority),
    audience: normalizeAudience(input.audience),
    senderName: clean(input.senderName) || 'Husky Pass',
    senderRole: clean(input.senderRole) || 'Comunicación escolar',
    createdAt,
    updatedAt: clean(input.updatedAt) || createdAt,
    sentAt: clean(input.sentAt) || null,
    scheduledFor: clean(input.scheduledFor) || null,
    attachments: Array.isArray(input.attachments) ? input.attachments.map(normalizeCommunicationAttachment).filter((item) => item.url) : []
  }
}

function communicationFromRow(row: CommunicationRow, audience: CommunicationAudience, attachments: CommunicationAttachment[]): SchoolCommunication {
  return normalizeCommunication({
    id: row.uid,
    title: row.title || '',
    summary: row.summary || '',
    body: row.body || '',
    status: row.status || 'draft',
    priority: row.priority || 'normal',
    audience,
    senderName: row.sender_name || '',
    senderRole: row.sender_role || '',
    createdAt: toIso(row.created_at) || new Date().toISOString(),
    updatedAt: toIso(row.updated_at) || toIso(row.created_at) || new Date().toISOString(),
    sentAt: toIso(row.sent_at),
    scheduledFor: toIso(row.scheduled_for),
    attachments
  })
}

function normalizeScopeInput(scope: CommunicationAdminScopeInput): CommunicationAdminScopeInput {
  const isGlobal = Boolean(scope.isGlobal)
  return {
    isGlobal,
    plantel: isGlobal ? null : normalizeSchoolPlantel(scope.plantel),
    nivel: null,
    grado: isGlobal ? null : normalizeSchoolGrade(scope.grado, scope.plantel),
    grupo: null,
    canCreate: scope.canCreate !== false,
    canPublish: Boolean(scope.canPublish)
  }
}

function formatAudienceLabel(audience: CommunicationAudience) {
  if (audience.label) return audience.label
  if (audience.kind === 'grupo') return [audience.planteles.join(', '), audience.grados?.join(', '), audience.grupos?.map((item) => `Grupo ${item}`).join(', ')].filter(Boolean).join(' · ') || 'Grupo'
  if (audience.kind === 'grado') return [audience.planteles.join(', '), audience.grados?.join(', ') || audience.niveles?.join(', ')].filter(Boolean).join(' · ') || 'Grado'
  if (audience.kind === 'custom') return 'Audiencia personalizada'
  return audience.planteles.length ? `Plantel ${audience.planteles.join(', ')}` : 'Comunidad escolar'
}

function valueMatches(candidates: string[] | undefined, value: string | null | undefined) {
  if (!candidates?.length) return true
  const normalized = upper(value)
  return Boolean(normalized && candidates.map(upper).includes(normalized))
}

function gradeMatches(candidates: string[] | undefined, value: string | null | undefined, plantel?: string | null) {
  if (!candidates?.length) return true
  const normalizedValue = normalizeSchoolGrade(value, plantel)
  return Boolean(normalizedValue && candidates.some((candidate) => normalizeSchoolGrade(candidate, plantel) === normalizedValue))
}


function communicationMatchesChild(message: SchoolCommunication, child: AuthorizedChild) {
  const audience = message.audience
  const childPlantel = normalizeSchoolPlantel(child.matricula) || normalizeSchoolPlantel(child.plantel || child.campus)
  const plantelMatches = audience.planteles.length ? Boolean(childPlantel && audience.planteles.includes(childPlantel)) : true
  if (!plantelMatches) return false
  if (audience.kind === 'plantel') return true
  const gradoMatchesAudience = gradeMatches(audience.grados, child.grado, childPlantel)
  if (audience.kind === 'grado') return gradoMatchesAudience
  if (audience.kind === 'grupo') return gradoMatchesAudience && valueMatches(audience.grupos, child.grupo)
  return true
}

function sortForParent(a: SchoolCommunication, b: SchoolCommunication) {
  const dateA = a.sentAt || a.updatedAt || a.createdAt
  const dateB = b.sentAt || b.updatedAt || b.createdAt
  return dateB.localeCompare(dateA)
}

function derivedPlantelSql(alias = 'm') {
  return schoolPlantelSqlFromMatricula(`${alias}.matricula`)
}




async function getCommunicationAccess(user: AppSessionUser): Promise<CommunicationAccess> {
  if (user.isSuperAdmin) {
    return { isGlobal: true, canCreate: true, canPublish: true, scopes: [{ isGlobal: true, plantel: null, nivel: null, grado: null, grupo: null, canCreate: true, canPublish: true }] }
  }

  const gestionScopes = (await getGestionCommunicationScopes(user)).map((scope) => {
    const normalized = normalizeScopeInput(scope)
    return {
      userId: user.id,
      isGlobal: Boolean(normalized.isGlobal),
      plantel: normalized.plantel || null,
      nivel: normalized.nivel || null,
      grado: normalized.grado || null,
      grupo: normalized.grupo || null,
      canCreate: Boolean(normalized.canCreate),
      canPublish: Boolean(normalized.canPublish)
    }
  })
  if (gestionScopes.length) {
    return {
      isGlobal: gestionScopes.some((scope) => scope.isGlobal),
      canCreate: gestionScopes.some((scope) => scope.canCreate),
      canPublish: gestionScopes.some((scope) => scope.canPublish),
      scopes: gestionScopes
    }
  }

  return {
    isGlobal: false,
    canCreate: false,
    canPublish: false,
    scopes: []
  }
}

function assertAccessConfigured(access: CommunicationAccess) {
  if (!access.isGlobal && !access.scopes.length) {
    throw publicError(403, 'No tienes permiso para comunicados.')
  }
}

function audienceTargets(audience: CommunicationAudience) {
  const planteles = audience.planteles.length ? audience.planteles : ['']
  const niveles = audience.kind === 'plantel' ? [''] : (audience.niveles?.length ? audience.niveles : [''])
  const grados = audience.kind === 'plantel' ? [''] : (audience.grados?.length ? audience.grados : [''])
  const grupos = audience.kind === 'grupo' ? (audience.grupos?.length ? audience.grupos : ['']) : ['']
  return planteles.flatMap((plantel) => niveles.flatMap((_nivel) => grados.flatMap((grado) => grupos.map((grupo) => ({
    plantel: normalizeSchoolPlantel(plantel) || '',
    nivel: '',
    grado: normalizeSchoolGrade(grado, plantel) || '',
    grupo: upper(grupo)
  })))))
}

function scopeCoversTarget(scope: CommunicationAdminScope, target: { plantel: string; nivel: string; grado: string; grupo: string }) {
  if (scope.isGlobal) return true
  if (normalizeSchoolPlantel(scope.plantel) !== normalizeSchoolPlantel(target.plantel)) return false
  if (scope.nivel && upper(scope.nivel) !== upper(target.nivel)) return false
  if (scope.grado && !gradeMatches([scope.grado], target.grado, scope.plantel)) return false
  if (scope.grupo && upper(scope.grupo) !== target.grupo) return false
  return true
}

function accessCoversAudience(access: CommunicationAccess, audience: CommunicationAudience, intent: 'create' | 'publish') {
  const targets = audienceTargets(audience)
  if (!targets.length || targets.some((target) => !target.plantel)) return false
  return targets.every((target) => access.scopes.some((scope) => {
    const allowedAction = intent === 'publish' ? scope.canPublish : scope.canCreate
    return allowedAction && scopeCoversTarget(scope, target)
  }))
}

function communicationVisibleForAccess(access: CommunicationAccess, message: SchoolCommunication) {
  if (access.isGlobal) return true
  const targets = audienceTargets(message.audience)
  if (!targets.length || targets.some((target) => !target.plantel)) return false
  return targets.every((target) => access.scopes.some((scope) => (scope.canCreate || scope.canPublish) && scopeCoversTarget(scope, target)))
}

function childMatchesScope(scope: CommunicationAdminScope, child: AuthorizedChild) {
  if (scope.isGlobal) return true
  const target = {
    plantel: normalizeSchoolPlantel(child.matricula) || normalizeSchoolPlantel(child.plantel || child.campus) || '',
    nivel: '',
    grado: normalizeSchoolGrade(child.grado, child.plantel || child.campus) || '',
    grupo: upper(child.grupo)
  }
  return scopeCoversTarget(scope, target)
}

function optionAllowed(access: CommunicationAccess, row: CommunicationOptionsRow) {
  const plantel = normalizeSchoolPlantel(row.plantel)
  if (!plantel || !SCHOOL_COMMUNICATION_PLANTELES.has(plantel)) return false
  if (access.isGlobal) return true
  const child = { plantel: row.plantel, campus: row.plantel, nivelEdu: row.nivel, grado: row.grado, grupo: row.grupo } as AuthorizedChild
  return access.scopes.some((scope) => childMatchesScope(scope, child))
}

function mergeAudienceRows(rows: CommunicationAudienceRow[]): CommunicationAudience {
  const first = rows[0]
  if (!first) return normalizeAudience({ kind: 'plantel', planteles: [] })
  const planteles = Array.from(new Set(rows.map((row) => upper(row.plantel)).filter(Boolean)))
  const niveles = Array.from(new Set(rows.map((row) => clean(row.nivel)).filter(Boolean)))
  const grados = Array.from(new Set(rows.map((row) => clean(row.grado)).filter(Boolean)))
  const grupos = Array.from(new Set(rows.map((row) => upper(row.grupo)).filter(Boolean)))
  return normalizeAudience({
    kind: first.kind || 'plantel',
    planteles,
    niveles,
    grados,
    grupos,
    label: first.label || null
  })
}

function attachmentFromRow(row: CommunicationAttachmentRow): CommunicationAttachment {
  return normalizeCommunicationAttachment({
    id: row.attachment_uid || '',
    name: row.name || '',
    mime: row.mime || '',
    size: Number(row.size || 0),
    url: row.url || '',
    kind: row.kind || undefined,
    thumbnailUrl: row.thumbnail_url || null,
    uploadedAt: toIso(row.uploaded_at)
  })
}

async function readCommunicationRows(limit = 300) {
  const rows = await legacyQuery<CommunicationRow[]>(
    `SELECT id, uid, title, summary, body, status, priority, sender_user_id, sender_name, sender_role, created_at, updated_at, sent_at, scheduled_for
     FROM comunicados
     ORDER BY COALESCE(updated_at, created_at) DESC, id DESC
     LIMIT ${Math.min(Math.max(limit, 1), 500)}`
  )
  return hydrateCommunications(rows)
}

async function hydrateCommunications(rows: CommunicationRow[]) {
  if (!rows.length) return []
  const ids = rows.map((row) => Number(row.id))
  const placeholders = ids.map(() => '?').join(',')
  const audienceRows = await legacyQuery<CommunicationAudienceRow[]>(
    `SELECT comunicado_id, kind, plantel, nivel, grado, grupo, label
     FROM comunicado_audiences
     WHERE comunicado_id IN (${placeholders})
     ORDER BY id ASC`,
    ids
  )
  const attachmentRows = await legacyQuery<CommunicationAttachmentRow[]>(
    `SELECT comunicado_id, attachment_uid, name, mime, size, url, kind, thumbnail_url, uploaded_at
     FROM comunicado_attachments
     WHERE comunicado_id IN (${placeholders})
     ORDER BY id ASC`,
    ids
  )

  const audiencesById = new Map<number, CommunicationAudienceRow[]>()
  for (const row of audienceRows) {
    const key = Number(row.comunicado_id)
    audiencesById.set(key, [...(audiencesById.get(key) || []), row])
  }

  const attachmentsById = new Map<number, CommunicationAttachment[]>()
  for (const row of attachmentRows) {
    const attachment = attachmentFromRow(row)
    if (!attachment.url) continue
    const key = Number(row.comunicado_id)
    attachmentsById.set(key, [...(attachmentsById.get(key) || []), attachment])
  }

  return rows.map((row) => communicationFromRow(row, mergeAudienceRows(audiencesById.get(Number(row.id)) || []), attachmentsById.get(Number(row.id)) || []))
}

function optionValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map(clean).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
}

function optionsScopeTree(rows: CommunicationOptionsRow[]): NonNullable<AdminCommunicationsResponse['options']['scopeTree']> {
  return {
    planteles: optionValues(rows.map((row) => normalizeSchoolPlantel(row.plantel))).map((plantel) => {
      const plantelRows = rows.filter((row) => normalizeSchoolPlantel(row.plantel) === plantel)
      return {
        value: plantel,
        label: plantel,
        families: 0,
        students: plantelRows.length,
        children: optionValues(plantelRows.map((row) => row.nivel)).map((nivel) => {
          const nivelRows = plantelRows.filter((row) => clean(row.nivel) === nivel)
          return {
            value: nivel,
            label: nivel,
            families: 0,
            students: nivelRows.length,
            children: optionValues(nivelRows.map((row) => normalizeSchoolGrade(row.grado, plantel))).map((grado) => {
              const gradoRows = nivelRows.filter((row) => normalizeSchoolGrade(row.grado, plantel) === grado)
              return {
                value: grado,
                label: grado,
                families: 0,
                students: gradoRows.length,
                children: optionValues(gradoRows.map((row) => upper(row.grupo))).map((grupo) => ({
                  value: grupo,
                  label: grupo,
                  families: 0,
                  students: gradoRows.filter((row) => upper(row.grupo) === grupo).length
                }))
              }
            })
          }
        })
      }
    })
  }
}

async function getAudienceOptions(access: CommunicationAccess): Promise<AdminCommunicationsResponse['options']> {
  const rows = await legacyQuery<CommunicationOptionsRow[]>(
    `SELECT DISTINCT ${derivedPlantelSql('m')} AS plantel, m.nivel, m.grado, m.grupo
     FROM matricula m
     WHERE m.matricula IS NOT NULL AND TRIM(CAST(m.matricula AS CHAR)) <> ''
     ORDER BY plantel ASC, m.nivel ASC, m.grado ASC, m.grupo ASC
     LIMIT 5000`
  )
  const allowedRows = rows.filter((row) => optionAllowed(access, row))
  const planteles = optionValues(allowedRows.map((row) => normalizeSchoolPlantel(row.plantel)))
  const niveles = optionValues(allowedRows.map((row) => row.nivel))
  const grados = optionValues(allowedRows.map((row) => normalizeSchoolGrade(row.grado, row.plantel)))
  const grupos = optionValues(allowedRows.map((row) => upper(row.grupo)))

  return {
    planteles: planteles.length ? planteles : access.isGlobal ? DEFAULT_PLANTELES : Array.from(new Set(access.scopes.map((scope) => normalizeSchoolPlantel(scope.plantel)).filter(Boolean) as string[])).sort(),
    niveles: niveles.length ? niveles : DEFAULT_NIVELES,
    grados: grados.length ? grados : DEFAULT_GRADOS,
    grupos: grupos.length ? grupos : DEFAULT_GRUPOS,
    scopeTree: optionsScopeTree(allowedRows)
  }
}

async function loadReadMessageIds(userId: number, comunicadoIds: number[]) {
  if (!comunicadoIds.length) return new Set<number>()
  const placeholders = comunicadoIds.map(() => '?').join(',')
  const rows = await legacyQuery<CommunicationReadRow[]>(
    `SELECT comunicado_id
     FROM comunicado_reads
     WHERE user_id = ? AND comunicado_id IN (${placeholders})`,
    [userId, ...comunicadoIds]
  )
  return new Set(rows.map((row) => Number(row.comunicado_id)).filter((id) => Number.isFinite(id)))
}

export async function listFamilyCommunications(user: AppSessionUser): Promise<FamilyCommunicationsResponse> {
  let children: AuthorizedChild[] = []
  try {
    children = await getFamilyChildren(user)
  } catch {
    children = []
  }

  const currentChild = children.find((child) => child.isCurrent) || children[0] || null
  const allRows = await legacyQuery<CommunicationRow[]>(
    `SELECT id, uid, title, summary, body, status, priority, sender_user_id, sender_name, sender_role, created_at, updated_at, sent_at, scheduled_for
     FROM comunicados
     WHERE status = 'sent' AND (sent_at IS NULL OR sent_at <= UTC_TIMESTAMP())
     ORDER BY COALESCE(sent_at, updated_at, created_at) DESC, id DESC
     LIMIT 300`
  )
  const rows = await hydrateCommunications(allRows)
  const visibleIdsByUid = new Map(allRows.map((row) => [row.uid, Number(row.id)]))
  const visible = rows
    .filter((message) => currentChild ? children.some((child) => communicationMatchesChild(message, child)) : false)
    .sort(sortForParent)
  const readIds = await loadReadMessageIds(user.id, visible.map((message) => visibleIdsByUid.get(message.id)).filter((id): id is number => Boolean(id)))
  const items = visible.map((message) => ({
    ...message,
    audienceLabel: formatAudienceLabel(message.audience),
    readState: readIds.has(visibleIdsByUid.get(message.id) || 0) ? 'read' as const : 'unread' as const
  }))

  return {
    items,
    context: {
      student: currentChild,
      audienceLabel: currentChild ? [currentChild.plantel || currentChild.campus, currentChild.grado, currentChild.grupo ? `Grupo ${currentChild.grupo}` : ''].filter(Boolean).join(' · ') : 'Cuenta familiar'
    },
    metrics: {
      total: items.length,
      unread: items.filter((item) => item.readState === 'unread').length,
      important: items.filter((item) => item.priority !== 'normal').length,
      withAttachments: items.filter((item) => item.attachments.length > 0).length
    },
    state: items.length ? 'ready' : 'empty',
    message: items.length ? undefined : 'No hay publicaciones vigentes.'
  }
}

export async function listAdminCommunications(user: AppSessionUser): Promise<AdminCommunicationsResponse> {
  const access = await getCommunicationAccess(user)
  assertAccessConfigured(access)
  const rows = (await readCommunicationRows()).filter((message) => communicationVisibleForAccess(access, message))
  const options = await getAudienceOptions(access)

  return {
    rows,
    metrics: {
      drafts: rows.filter((row) => row.status === 'draft').length,
      scheduled: rows.filter((row) => row.status === 'scheduled').length,
      sent: rows.filter((row) => row.status === 'sent').length,
      total: rows.length
    },
    options,
    actions: {
      canCreate: access.canCreate,
      canPublish: access.canPublish,
      isGlobal: access.isGlobal
    }
  }
}

async function existingCommunication(uid: string) {
  if (!uid) return null
  return legacyOne<CommunicationRow>(
    `SELECT id, uid, title, summary, body, status, priority, sender_user_id, sender_name, sender_role, created_at, updated_at, sent_at, scheduled_for
     FROM comunicados
     WHERE uid = ?
     LIMIT 1`,
    [uid]
  )
}

async function insertAudiences(comunicadoId: number, audience: CommunicationAudience) {
  const targets = audienceTargets(audience)
  for (const target of targets) {
    await legacyWrite(
      `INSERT INTO comunicado_audiences (comunicado_id, kind, plantel, nivel, grado, grupo, label)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [comunicadoId, audience.kind, target.plantel, target.nivel || null, target.grado || null, target.grupo || null, audience.label || formatAudienceLabel(audience)]
    )
  }
}

async function insertAttachments(comunicadoId: number, attachments: CommunicationAttachment[]) {
  for (const attachment of attachments) {
    const normalized = normalizeCommunicationAttachment(attachment)
    if (!normalized.url) continue
    await legacyWrite(
      `INSERT INTO comunicado_attachments (comunicado_id, attachment_uid, name, mime, size, url, kind, thumbnail_url, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [comunicadoId, normalized.id, normalized.name, normalized.mime, normalized.size, normalized.url, normalized.kind, normalized.thumbnailUrl || null, toMysqlDate(normalized.uploadedAt)]
    )
  }
}

export async function saveCommunication(user: AppSessionUser, input: SaveCommunicationInput) {
  const access = await getCommunicationAccess(user)
  assertAccessConfigured(access)
  const now = new Date().toISOString()
  const existing = input.id ? await existingCommunication(input.id) : null
  const status = normalizeStatus(input.status)
  const message = normalizeCommunication({
    ...input,
    id: input.id || existing?.uid || `com-${randomUUID()}`,
    status,
    senderName: user.displayName || user.email || 'Usuario institucional',
    senderRole: user.isSuperAdmin ? 'Super Admin' : 'Comunicación institucional',
    createdAt: toIso(existing?.created_at) || now,
    updatedAt: now,
    sentAt: status === 'sent' ? (toIso(existing?.sent_at) || now) : null,
    scheduledFor: status === 'scheduled' ? input.scheduledFor || toIso(existing?.scheduled_for) || now : null
  })
  const intent = status === 'sent' || status === 'scheduled' ? 'publish' : 'create'
  if (!accessCoversAudience(access, message.audience, intent)) {
    const action = intent === 'publish' ? 'enviar o programar' : 'crear'
    throw publicError(403, `No puedes ${action} comunicados para ${formatAudienceLabel(message.audience)}.`)
  }

  let comunicadoId = Number(existing?.id || 0)
  if (existing) {
    await legacyWrite(
      `UPDATE comunicados
       SET title = ?, summary = ?, body = ?, status = ?, priority = ?, sender_user_id = ?, sender_name = ?, sender_role = ?, updated_at = UTC_TIMESTAMP(), sent_at = ?, scheduled_for = ?
       WHERE id = ?`,
      [message.title, message.summary, message.body, message.status, message.priority, user.id, message.senderName, message.senderRole, toMysqlDate(message.sentAt), toMysqlDate(message.scheduledFor), comunicadoId]
    )
    await legacyWrite('DELETE FROM comunicado_audiences WHERE comunicado_id = ?', [comunicadoId])
    await legacyWrite('DELETE FROM comunicado_attachments WHERE comunicado_id = ?', [comunicadoId])
  } else {
    const result = await legacyWrite(
      `INSERT INTO comunicados (uid, title, summary, body, status, priority, sender_user_id, sender_name, sender_role, created_at, updated_at, sent_at, scheduled_for)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), ?, ?)`,
      [message.id, message.title, message.summary, message.body, message.status, message.priority, user.id, message.senderName, message.senderRole, toMysqlDate(message.sentAt), toMysqlDate(message.scheduledFor)]
    )
    comunicadoId = Number(result.insertId)
  }

  await insertAudiences(comunicadoId, message.audience)
  await insertAttachments(comunicadoId, message.attachments)
  return message
}
