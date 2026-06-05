import { createError } from 'h3'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { MarbeteTemplateMeta, PersonasThemeKey, PrintableAuthorizedPerson } from '~/types/daycare'
import { allPersonasThemes, normalizeNivel, normalizePlantel, PA_COLORS, resolvePersonasTheme } from '~/utils/personasTheme'
import { displayMatricula } from '~/utils/matricula'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { isValidatedVisionPhotoUrl } from '~/utils/visionFace'

const TEMPLATE_DIR = join(process.cwd(), 'data', 'marbete-templates')
const TEMPLATE_INDEX = join(TEMPLATE_DIR, 'templates.json')
const VALID_THEME_KEYS = new Set<PersonasThemeKey>(['daycare', 'preescolar', 'primaria', 'secundaria', 'iedis'])

export interface MarbeteRenderValues {
  values: Record<string, string>
  validationUrl: string
}

export interface MarbeteRequirementStatus {
  ok: boolean
  issues: string[]
}

function safeId(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function escapeXml(value?: string | number | null) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function filenameFor(id: string) {
  return `${id || `template-${Date.now()}`}.svg`
}

function normalizeTemplate(row: Partial<MarbeteTemplateMeta>): MarbeteTemplateMeta | null {
  if (!row.id || !row.filename) return null
  const themeKey = VALID_THEME_KEYS.has(row.themeKey as PersonasThemeKey) ? row.themeKey as PersonasThemeKey : 'daycare'
  const theme = resolvePersonasTheme({ themeKey })
  return {
    id: String(row.id),
    name: String(row.name || row.id),
    filename: String(row.filename),
    themeKey,
    nivel: String(row.nivel || ''),
    planteles: Array.isArray(row.planteles) ? row.planteles.map((item) => normalizePlantel(item)).filter(Boolean) : [],
    color: String(row.color || theme.primary),
    isDefault: Boolean(row.isDefault),
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString()
  }
}

async function ensureTemplateDir() {
  await mkdir(TEMPLATE_DIR, { recursive: true })
}

async function writeTemplateIndex(templates: MarbeteTemplateMeta[]) {
  await ensureTemplateDir()
  await writeFile(TEMPLATE_INDEX, `${JSON.stringify(templates, null, 2)}\n`, 'utf8')
}

export async function listMarbeteTemplates() {
  await ensureTemplateDir()
  try {
    const raw = await readFile(TEMPLATE_INDEX, 'utf8')
    const parsed = JSON.parse(raw) as Partial<MarbeteTemplateMeta>[]
    return parsed.map(normalizeTemplate).filter(Boolean) as MarbeteTemplateMeta[]
  } catch {
    return []
  }
}

export function marbeteTemplateThemes() {
  return allPersonasThemes()
}

export async function readMarbeteTemplateSvg(template: MarbeteTemplateMeta) {
  const svg = await readFile(join(TEMPLATE_DIR, template.filename), 'utf8')
  if (!svg.includes('<svg')) throw createError({ statusCode: 422, statusMessage: 'La plantilla SVG no es valida.' })
  return svg
}

export function selectMarbeteTemplate(templates: MarbeteTemplateMeta[], input: { matricula?: string | null; plantel?: string | null; nivelEdu?: string | null; themeKey?: string | null }) {
  const theme = resolvePersonasTheme(input)
  const plantel = normalizePlantel(input.plantel)
  const nivel = normalizeNivel(input.nivelEdu)

  const byPlantel = templates.find((template) => template.planteles.includes(plantel))
  if (byPlantel) return byPlantel

  const byThemeAndNivel = templates.find((template) => template.themeKey === theme.key && normalizeNivel(template.nivel) && nivel.includes(normalizeNivel(template.nivel)))
  if (byThemeAndNivel) return byThemeAndNivel

  const byTheme = templates.find((template) => template.themeKey === theme.key)
  if (byTheme) return byTheme

  return templates.find((template) => template.themeKey === 'daycare') || templates[0]
}

export async function saveMarbeteTemplate(input: {
  id?: string | null
  name: string
  nivel: string
  planteles: string[]
  themeKey: PersonasThemeKey
  file?: { filename?: string | null; data: Buffer }
}) {
  if (!VALID_THEME_KEYS.has(input.themeKey)) {
    throw createError({ statusCode: 400, statusMessage: 'Tema de plantilla invalido.' })
  }

  const templates = await listMarbeteTemplates()
  const existingIndex = input.id ? templates.findIndex((template) => template.id === input.id) : -1
  const now = new Date().toISOString()
  const baseId = input.id || safeId(input.name || `${input.themeKey}-${input.nivel}`) || `template-${Date.now()}`
  const existing = existingIndex >= 0 ? templates[existingIndex] : null

  if (!existing && !input.file?.data?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Agrega un archivo SVG para crear la plantilla.' })
  }

  const filename = input.file?.data?.length ? filenameFor(`${safeId(baseId)}-${Date.now()}`) : existing?.filename || filenameFor(safeId(baseId))
  if (input.file?.data?.length) {
    const sourceName = String(input.file.filename || '')
    if (!sourceName.toLowerCase().endsWith('.svg')) throw createError({ statusCode: 415, statusMessage: 'La plantilla debe ser SVG.' })
    const text = input.file.data.toString('utf8')
    if (!text.includes('<svg')) throw createError({ statusCode: 422, statusMessage: 'El archivo no parece ser una plantilla SVG valida.' })
    await ensureTemplateDir()
    await writeFile(join(TEMPLATE_DIR, filename), input.file.data)
  }

  const theme = resolvePersonasTheme({ themeKey: input.themeKey })
  const next: MarbeteTemplateMeta = {
    id: existing?.id || safeId(baseId),
    name: input.name.trim(),
    filename,
    themeKey: input.themeKey,
    nivel: input.nivel.trim(),
    planteles: input.planteles.map((item) => normalizePlantel(item)).filter(Boolean),
    color: theme.primary,
    isDefault: existing?.isDefault || false,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  }

  if (existingIndex >= 0) templates.splice(existingIndex, 1, next)
  else templates.push(next)
  await writeTemplateIndex(templates)
  return next
}

function absoluteAssetUrl(value: string, origin: string) {
  const normalized = normalizeVirtualAssetUrl(value)
  if (!normalized) return ''
  if (/^(?:https?:|data:)/i.test(normalized)) return normalized
  if (normalized.startsWith('/')) return `${origin.replace(/\/$/, '')}${normalized}`
  return normalized
}

function fullName(parts: Array<string | null | undefined>) {
  return parts.map((part) => String(part || '').trim()).filter(Boolean).join(' ')
}

export function buildMarbeteRenderValues(data: PrintableAuthorizedPerson, origin: string): MarbeteRenderValues {
  const validationUrl = `${origin.replace(/\/$/, '')}/validar/persona-autorizada/${data.id}`
  const trustedProcessedPhoto = isValidatedVisionPhotoUrl(data.compressed_foto) ? data.compressed_foto : ''
  const personPhoto = absoluteAssetUrl(String(trustedProcessedPhoto || data.foto || ''), origin)
  const studentPhoto = absoluteAssetUrl(String(data.fotoA || data.child?.foto || ''), origin)
  const studentName = fullName([
    data.fullnameA || '',
  ]) || fullName([data.child?.nombreA, data.child?.paternoA, data.child?.maternoA])
  const authorizedName = fullName([data.nombreP, data.paternoP, data.maternoP])
  const plantel = String(data.plantel || data.child?.plantel || '')
  const nivel = String(data.nivelEdu || data.child?.nivelEdu || '')
  const grado = String(data.gradoA || data.child?.grado || '')
  const grupo = String(data.grupoA || data.child?.grupo || '')
  const matricula = displayMatricula(data.matricula || data.child?.matricula)
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(validationUrl)}`

  return {
    validationUrl,
    values: {
      id: String(data.id || ''),
      qr: String(data.qr || data.id || ''),
      paternoP: String(data.paternoP || ''),
      maternoP: String(data.maternoP || ''),
      nombreP: String(data.nombreP || ''),
      parenP: String(data.parenP || ''),
      parentesco: String(data.parenP || ''),
      fullnameP: authorizedName,
      nombreCompletoP: authorizedName,
      authorizedPersonName: authorizedName,
      foto: personPhoto,
      fotoP: personPhoto,
      compressed_foto: personPhoto,
      qrImage,
      nivelEdu: nivel,
      nivel,
      plantel,
      matricula,
      fullnameA: studentName,
      nombreAlumno: studentName,
      studentName,
      alumno: studentName,
      gradoA: grado,
      grado,
      grupoA: grupo,
      grupo,
      fotoA: studentPhoto,
      studentPhoto,
      validationUrl
    }
  }
}

function dataTokens(svg: string) {
  return Array.from(svg.matchAll(/{{\s*data\.([A-Za-z0-9_]+)\s*}}/g)).map((match) => match[1])
}

function imageTokens(svg: string) {
  return Array.from(svg.matchAll(/{{\s*getTrustedUrl\(data\.([A-Za-z0-9_]+)\)\s*}}/g)).map((match) => match[1])
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function missingLabelFor(key: string) {
  if (['foto', 'fotoP', 'compressed_foto'].includes(key)) return 'Foto de la persona autorizada pendiente o no disponible.'
  if (['fotoA', 'studentPhoto'].includes(key)) return 'Foto del alumno pendiente o no disponible.'
  if (key === 'qrImage') return 'Código QR no disponible.'
  if (['matricula'].includes(key)) return 'Matrícula del alumno no disponible.'
  if (['fullnameA', 'nombreAlumno', 'studentName', 'alumno'].includes(key)) return 'Nombre del alumno no disponible.'
  if (['fullnameP', 'nombreCompletoP', 'authorizedPersonName', 'nombreP'].includes(key)) return 'Nombre de la persona autorizada no disponible.'
  if (['parenP', 'parentesco'].includes(key)) return 'Parentesco de la persona autorizada no disponible.'
  return `Dato requerido no disponible: ${key}.`
}

export function validateMarbeteRequirements(svg: string, data: PrintableAuthorizedPerson, origin: string): MarbeteRequirementStatus {
  const { values } = buildMarbeteRenderValues(data, origin)
  const requiredTokens = unique([...dataTokens(svg), ...imageTokens(svg)])
  const issues = requiredTokens
    .filter((key) => !String(values[key] || '').trim())
    .map(missingLabelFor)

  if (!String(values.fullnameP || '').trim()) issues.push(missingLabelFor('fullnameP'))
  if (!String(values.parenP || '').trim()) issues.push(missingLabelFor('parenP'))
  if (!String(values.fotoP || values.foto || '').trim()) issues.push(missingLabelFor('fotoP'))
  if (!String(values.fullnameA || '').trim()) issues.push(missingLabelFor('fullnameA'))
  if (!String(values.matricula || '').trim()) issues.push(missingLabelFor('matricula'))

  return { ok: !unique(issues).length, issues: unique(issues) }
}

export function renderMarbeteSvg(svg: string, data: PrintableAuthorizedPerson, origin: string) {
  const { values } = buildMarbeteRenderValues(data, origin)

  return svg
    .replace(/{{\s*getTrustedUrl\(data\.([A-Za-z0-9_]+)\)\s*}}/g, (_match, key: string) => escapeXml(values[key]))
    .replace(/{{\s*data\.([A-Za-z0-9_]+)\s*}}/g, (_match, key: string) => escapeXml(values[key]))
    .replace(/{{\s*[^}]+\s*}}/g, '')
}

export function marbeteDownloadName(data: PrintableAuthorizedPerson, template: MarbeteTemplateMeta) {
  const name = [data.nombreP, data.paternoP, data.maternoP].filter(Boolean).join(' ') || `persona-${data.id}`
  return `${safeId(`marbete-${template.themeKey}-${name}`) || `marbete-${data.id}`}.pdf`
}

export function fallbackTemplateColor(themeKey?: string | null) {
  const theme = resolvePersonasTheme({ themeKey })
  return theme.primary || PA_COLORS.daycare
}
