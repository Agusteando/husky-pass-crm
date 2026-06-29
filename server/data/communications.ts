import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
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
  SchoolCommunication
} from '~/types/communications'
import type { AuthorizedChild } from '~/types/daycare'
import { runtimeDataDir } from '~/server/utils/serverlessPaths'
import { getFamilyChildren } from '~/server/data/mysqlDaycare'
import bundledCommunications from '../../data/comunicados/communications.json'

const COMMUNICATIONS_DIR = runtimeDataDir('comunicados')
const COMMUNICATIONS_PATH = join(COMMUNICATIONS_DIR, 'communications.json')

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
    planteles: normalizeList(input?.planteles).map((item) => item.toUpperCase()),
    niveles: normalizeList(input?.niveles),
    grados: normalizeList(input?.grados),
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

async function ensureDir() {
  await mkdir(COMMUNICATIONS_DIR, { recursive: true })
}

export async function readCommunications() {
  await ensureDir()
  try {
    const parsed = JSON.parse(await readFile(COMMUNICATIONS_PATH, 'utf8')) as Partial<SchoolCommunication>[]
    return parsed.map(normalizeCommunication)
  } catch {
    return (bundledCommunications as Partial<SchoolCommunication>[]).map(normalizeCommunication)
  }
}

async function writeCommunications(rows: SchoolCommunication[]) {
  await ensureDir()
  await writeFile(COMMUNICATIONS_PATH, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')
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

function normalizedGradeValues(value: string | null | undefined) {
  const raw = clean(value)
  const normalized = raw.toLowerCase()
  const map: Record<string, string[]> = {
    '1': ['1', '1°', 'primero'],
    '1°': ['1', '1°', 'primero'],
    primero: ['1', '1°', 'primero'],
    '2': ['2', '2°', 'segundo'],
    '2°': ['2', '2°', 'segundo'],
    segundo: ['2', '2°', 'segundo'],
    '3': ['3', '3°', 'tercero'],
    '3°': ['3', '3°', 'tercero'],
    tercero: ['3', '3°', 'tercero']
  }
  return new Set([raw, normalized, ...(map[normalized] || [])].map((item) => item.toLowerCase()))
}

function gradeMatches(candidates: string[] | undefined, value: string | null | undefined) {
  if (!candidates?.length) return true
  const values = normalizedGradeValues(value)
  return candidates.some((candidate) => values.has(clean(candidate).toLowerCase()))
}

function communicationMatchesChild(message: SchoolCommunication, child: AuthorizedChild) {
  const audience = message.audience
  const plantelMatches = valueMatches(audience.planteles, child.plantel || child.campus)
  if (!plantelMatches) return false
  if (audience.kind === 'plantel') return true
  const nivelMatches = valueMatches(audience.niveles, child.nivelEdu)
  const gradoMatchesAudience = gradeMatches(audience.grados, child.grado)
  if (audience.kind === 'grado') return nivelMatches && gradoMatchesAudience
  if (audience.kind === 'grupo') return nivelMatches && gradoMatchesAudience && valueMatches(audience.grupos, child.grupo)
  return true
}

function sortForParent(a: SchoolCommunication, b: SchoolCommunication) {
  const dateA = a.sentAt || a.updatedAt || a.createdAt
  const dateB = b.sentAt || b.updatedAt || b.createdAt
  return dateB.localeCompare(dateA)
}

export async function listFamilyCommunications(user: AppSessionUser): Promise<FamilyCommunicationsResponse> {
  let children: AuthorizedChild[] = []
  try {
    children = await getFamilyChildren(user)
  } catch {
    children = []
  }

  const currentChild = children.find((child) => child.isCurrent) || children[0] || null
  const rows = await readCommunications()
  const items = rows
    .filter((message) => message.status === 'sent')
    .filter((message) => currentChild ? children.some((child) => communicationMatchesChild(message, child)) : false)
    .sort(sortForParent)
    .map((message, index) => ({
      ...message,
      audienceLabel: formatAudienceLabel(message.audience),
      readState: index < 2 ? 'unread' as const : 'read' as const
    }))

  return {
    items,
    context: {
      student: currentChild,
      audienceLabel: currentChild ? [currentChild.plantel, currentChild.grado, currentChild.grupo ? `Grupo ${currentChild.grupo}` : ''].filter(Boolean).join(' · ') : 'Cuenta familiar'
    },
    metrics: {
      total: items.length,
      unread: items.filter((item) => item.readState === 'unread').length,
      important: items.filter((item) => item.priority !== 'normal').length,
      withAttachments: items.filter((item) => item.attachments.length > 0).length
    },
    state: items.length ? 'ready' : 'empty',
    message: items.length ? undefined : 'Cuando tu colegio publique avisos para tu alumno, aparecerán aquí.'
  }
}

export async function listAdminCommunications(): Promise<AdminCommunicationsResponse> {
  const rows = (await readCommunications()).sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt))
  const planteles = Array.from(new Set(rows.flatMap((row) => row.audience.planteles))).sort()
  const niveles = Array.from(new Set(rows.flatMap((row) => row.audience.niveles || []))).sort((a, b) => a.localeCompare(b, 'es'))
  const grados = Array.from(new Set(rows.flatMap((row) => row.audience.grados || []))).sort((a, b) => a.localeCompare(b, 'es'))
  const grupos = Array.from(new Set(rows.flatMap((row) => row.audience.grupos || []))).sort((a, b) => a.localeCompare(b, 'es'))

  return {
    rows,
    metrics: {
      drafts: rows.filter((row) => row.status === 'draft').length,
      scheduled: rows.filter((row) => row.status === 'scheduled').length,
      sent: rows.filter((row) => row.status === 'sent').length,
      total: rows.length
    },
    options: {
      planteles: planteles.length ? planteles : ['PREEM', 'PM', 'PT', 'SM', 'ST'],
      niveles: niveles.length ? niveles : ['Preescolar', 'Primaria', 'Secundaria'],
      grados: grados.length ? grados : ['1°', '2°', '3°'],
      grupos: grupos.length ? grupos : ['A', 'B', 'C', 'G']
    }
  }
}

export async function saveCommunication(user: AppSessionUser, input: SaveCommunicationInput) {
  const now = new Date().toISOString()
  const rows = await readCommunications()
  const existingIndex = input.id ? rows.findIndex((row) => row.id === input.id) : -1
  const existing = existingIndex >= 0 ? rows[existingIndex] : null
  const status = normalizeStatus(input.status)
  const message = normalizeCommunication({
    ...existing,
    ...input,
    id: input.id || existing?.id || `com-${randomUUID()}`,
    status,
    senderName: user.displayName || user.email || 'Usuario institucional',
    senderRole: user.isSuperAdmin ? 'Super Admin' : 'Comunicación institucional',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    sentAt: status === 'sent' ? (existing?.sentAt || now) : null,
    scheduledFor: status === 'scheduled' ? input.scheduledFor || existing?.scheduledFor || now : null
  })

  const next = existingIndex >= 0
    ? rows.map((row, index) => index === existingIndex ? message : row)
    : [message, ...rows]
  await writeCommunications(next.slice(0, 300))
  return message
}
