import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { useStorage } from 'nitropack/runtime'
import type { MarbeteSvgDesign, MarbeteTemplateMeta, MarbeteTemplateSettings, PersonasThemeKey, PrintableAuthorizedPerson } from '~/types/daycare'
import { allPersonasThemes, normalizeNivel, PA_COLORS, resolveAuthorizedPersonMarbeteLevel, resolveAuthorizedPersonMarbetePlantel, resolvePersonasTheme } from '~/utils/personasTheme'
import { displayMatricula } from '~/utils/matricula'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { isValidatedVisionPhotoUrl } from '~/utils/visionFace'
import { runtimeDataDir } from '~/server/utils/serverlessPaths'
import { logPersonasWarning } from '~/server/utils/personasDiagnostics'
import { publicError } from '~/server/utils/httpError'
import { marbeteQrDataUrl, marbeteValidationUrl } from '~/server/utils/marbeteQr'
import { dataUrlToUploadFile, uploadToExternalService } from '~/server/utils/externalUpload'
import { compileMarbeteVisualSvg, normalizeMarbeteVisualDesign } from '~/utils/marbeteDesigner'
import { appendMarbeteSvgDesign, normalizeMarbeteSvgDesign } from '~/utils/marbeteSvgEditor'
import { renderMarbeteSvgValues } from '~/utils/marbeteSvgRuntime'
import { readMarbeteTemplateSettings } from '~/server/utils/marbeteSettings'

const LEGACY_TEMPLATE_DIR = runtimeDataDir('marbete-templates')
const TEMPLATE_STATE_DIR = runtimeDataDir('marbete-template-state')
const TEMPLATE_INDEX = join(TEMPLATE_STATE_DIR, 'custom-templates.json')
const LEGACY_TEMPLATE_INDEX = join(LEGACY_TEMPLATE_DIR, 'templates.json')
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

export function normalizeSchoolCycle(value?: string | number | null) {
  const match = String(value || '').trim().match(/(20\d{2})\s*[-–/]\s*(20\d{2})/)
  if (!match) return ''
  const start = Number(match[1])
  const end = Number(match[2])
  if (end !== start + 1) return ''
  return `${start}-${end}`
}

function escapeXml(value?: string | number | null) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function normalizeTemplate(row: Partial<MarbeteTemplateMeta>, source: 'bundled-svg' | 'custom' = 'custom'): MarbeteTemplateMeta | null {
  if (!row.id) return null
  if (!VALID_THEME_KEYS.has(row.themeKey as PersonasThemeKey)) return null
  const themeKey = row.themeKey as PersonasThemeKey
  const theme = resolvePersonasTheme({ themeKey })
  const mode = row.mode === 'visual' ? 'visual' : 'legacy-svg'
  const filename = String(row.filename || '')
  if (mode === 'legacy-svg' && !filename) return null
  return {
    id: String(row.id),
    name: String(row.name || row.id),
    filename,
    url: /^https?:\/\//i.test(String(row.url || '')) ? String(row.url) : undefined,
    themeKey,
    nivel: String(row.nivel || ''),
    planteles: [],
    color: String(row.color || theme.primary),
    isDefault: row.status === 'draft' ? false : Boolean(row.isDefault),
    mode,
    status: row.status === 'draft' ? 'draft' : 'published',
    cicloEscolar: '',
    visualDesign: mode === 'visual' ? normalizeMarbeteVisualDesign(row.visualDesign, themeKey) : undefined,
    svgDesign: mode === 'legacy-svg' && row.svgDesign ? normalizeMarbeteSvgDesign(row.svgDesign, themeKey) : undefined,
    basedOnId: row.basedOnId ? String(row.basedOnId) : undefined,
    publishedAt: row.publishedAt ? String(row.publishedAt) : undefined,
    createdAt: row.createdAt || new Date().toISOString(),
    updatedAt: row.updatedAt || new Date().toISOString(),
    source
  }
}

async function ensureTemplateDir() {
  await mkdir(TEMPLATE_STATE_DIR, { recursive: true })
}

async function writeTemplateIndex(templates: MarbeteTemplateMeta[]) {
  await ensureTemplateDir()
  const customTemplates = templates
    .filter((template) => template.source !== 'bundled-svg')
    .map(({ source: _source, ...template }) => template)
  await writeFile(TEMPLATE_INDEX, `${JSON.stringify(customTemplates, null, 2)}\n`, 'utf8')
}

async function readBundledTemplateIndex() {
  const raw = await useStorage('assets:marbete-templates').getItem('templates.json')
  if (!raw) return []
  if (Array.isArray(raw)) return raw as Partial<MarbeteTemplateMeta>[]
  if (typeof raw === 'string') return JSON.parse(raw) as Partial<MarbeteTemplateMeta>[]
  return JSON.parse(JSON.stringify(raw)) as Partial<MarbeteTemplateMeta>[]
}

async function readBundledTemplateSvg(filename: string) {
  const raw = await useStorage('assets:marbete-templates').getItem(filename)
  if (!raw) return ''
  if (typeof raw === 'string') return raw
  if (raw instanceof Uint8Array) return new TextDecoder('utf-8').decode(raw)
  if (raw instanceof ArrayBuffer) return new TextDecoder('utf-8').decode(new Uint8Array(raw))
  return String(raw)
}

export async function listBundledMarbeteTemplates() {
  const parsed = await readBundledTemplateIndex()
  return parsed
    .map((row) => normalizeTemplate({ ...row, mode: 'legacy-svg', status: 'published', isDefault: true }, 'bundled-svg'))
    .filter(Boolean) as MarbeteTemplateMeta[]
}

async function readCustomTemplateRows() {
  try {
    return JSON.parse(await readFile(TEMPLATE_INDEX, 'utf8')) as Partial<MarbeteTemplateMeta>[]
  } catch {
    try {
      return JSON.parse(await readFile(LEGACY_TEMPLATE_INDEX, 'utf8')) as Partial<MarbeteTemplateMeta>[]
    } catch {
      return []
    }
  }
}

export async function listCustomMarbeteTemplates() {
  await ensureTemplateDir()
  const parsed = await readCustomTemplateRows()
  const bundledIds = new Set((await listBundledMarbeteTemplates()).map((template) => template.id))
  return parsed
    .filter((row) => row.id && !bundledIds.has(String(row.id)))
    .map((row) => normalizeTemplate(row, 'custom'))
    .filter(Boolean) as MarbeteTemplateMeta[]
}

export async function listMarbeteTemplates() {
  const [bundled, custom] = await Promise.all([
    listBundledMarbeteTemplates(),
    listCustomMarbeteTemplates()
  ])
  if (!bundled.length) {
    logPersonasWarning('marbete-template-index-missing', { message: 'No bundled SVG templates were found.' })
  }
  return [...bundled, ...custom]
}

export function marbeteTemplateThemes() {
  return allPersonasThemes().filter((theme) => VALID_THEME_KEYS.has(theme.key))
}

export async function readMarbeteBaseSvg(template: MarbeteTemplateMeta) {
  if (template.mode === 'visual') {
    return compileMarbeteVisualSvg(normalizeMarbeteVisualDesign(template.visualDesign, template.themeKey), { mode: 'print' })
  }
  let svg: string
  if (template.source === 'bundled-svg') {
    svg = await readBundledTemplateSvg(template.filename)
  } else if (template.url) {
    try {
      const response = await fetch(template.url, { signal: AbortSignal.timeout(30000) })
      if (!response.ok) throw new Error(`Upload service responded ${response.status}`)
      svg = await response.text()
    } catch {
      throw publicError(502, 'No fue posible leer la plantilla SVG del expediente externo.')
    }
  } else {
    try {
      svg = await readFile(join(LEGACY_TEMPLATE_DIR, template.filename), 'utf8')
    } catch {
      svg = await readBundledTemplateSvg(template.filename)
    }
  }
  if (!svg) throw publicError(404, `No se encontro la plantilla SVG ${template.filename}.`)
  if (!svg.includes('<svg')) throw publicError(422, 'La plantilla SVG no es valida.')
  return svg
}

export async function readMarbeteTemplateSvg(template: MarbeteTemplateMeta) {
  const baseSvg = await readMarbeteBaseSvg(template)
  if (template.mode === 'visual') return baseSvg
  if (!template.svgDesign?.layers?.length) return baseSvg
  return appendMarbeteSvgDesign(baseSvg, normalizeMarbeteSvgDesign(template.svgDesign, template.themeKey), template.themeKey)
}

export type MarbeteTemplateSelectionInput = {
  matricula?: string | null
  plantel?: string | null
  nivelEdu?: string | null
  themeKey?: string | null
  cicloEscolar?: string | null
}

function selectFromPool(templates: MarbeteTemplateMeta[], input: MarbeteTemplateSelectionInput) {
  const theme = resolvePersonasTheme(input)
  const nivel = normalizeNivel(input.nivelEdu)
  const published = templates
    .filter((template) => template.status !== 'draft')
    .sort((left, right) => {
      const active = Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault))
      if (active) return active
      return String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''))
    })

  const byTheme = published.find((template) => template.themeKey === theme.key)
  if (byTheme) return byTheme

  const byNivel = published.find((template) => {
    const templateNivel = normalizeNivel(template.nivel)
    return templateNivel && nivel.includes(templateNivel)
  })
  if (byNivel) return byNivel

  throw publicError(422, `No hay un SVG compatible con el nivel ${input.nivelEdu || theme.label || theme.key}.`)
}

export function authorizedPersonMarbeteSelectionInput(input: MarbeteTemplateSelectionInput): MarbeteTemplateSelectionInput {
  const plantel = resolveAuthorizedPersonMarbetePlantel(input)
  const level = resolveAuthorizedPersonMarbeteLevel({ matricula: input.matricula, plantel })
  return {
    ...input,
    plantel,
    nivelEdu: level,
    themeKey: level
  }
}

export function selectBundledMarbeteTemplate(templates: MarbeteTemplateMeta[], input: MarbeteTemplateSelectionInput) {
  const bundled = templates.filter((template) => template.source === 'bundled-svg')
  return selectFromPool(bundled, input)
}

export function selectCustomMarbeteTemplate(templates: MarbeteTemplateMeta[], input: MarbeteTemplateSelectionInput) {
  const theme = resolvePersonasTheme(input)
  const nivel = normalizeNivel(input.nivelEdu)
  const active = templates
    .filter((template) => template.source === 'custom' && template.status === 'published' && template.isDefault)
    .sort((left, right) => String(right.updatedAt || '').localeCompare(String(left.updatedAt || '')))

  return active.find((template) => template.themeKey === theme.key)
    || active.find((template) => {
      const templateNivel = normalizeNivel(template.nivel)
      return templateNivel && nivel.includes(templateNivel)
    })
    || null
}

export function selectEffectiveMarbeteTemplate(
  templates: MarbeteTemplateMeta[],
  _settings: MarbeteTemplateSettings,
  input: MarbeteTemplateSelectionInput
) {
  const custom = selectCustomMarbeteTemplate(templates, input)
  if (custom) return custom
  return selectBundledMarbeteTemplate(templates, input)
}

export function selectMarbeteTemplate(templates: MarbeteTemplateMeta[], input: MarbeteTemplateSelectionInput) {
  return selectBundledMarbeteTemplate(templates, input)
}

export async function resolveEffectiveMarbeteTemplate(input: MarbeteTemplateSelectionInput) {
  const [templates, settings] = await Promise.all([
    listMarbeteTemplates(),
    readMarbeteTemplateSettings()
  ])
  return {
    template: selectEffectiveMarbeteTemplate(templates, settings, input),
    templates,
    settings
  }
}

export async function resolveEffectiveMarbeteTemplateSvg(input: MarbeteTemplateSelectionInput) {
  const [templates, settings] = await Promise.all([
    listMarbeteTemplates(),
    readMarbeteTemplateSettings()
  ])

  const custom = selectCustomMarbeteTemplate(templates, input)
  if (custom) {
    try {
      return { template: custom, templateSvg: await readMarbeteTemplateSvg(custom), settings }
    } catch (error) {
      logPersonasWarning('marbete-custom-template-fallback', {
        templateId: custom.id,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }

  const bundled = selectBundledMarbeteTemplate(templates, input)
  return { template: bundled, templateSvg: await readMarbeteTemplateSvg(bundled), settings }
}

export async function resolveAuthorizedPersonMarbeteTemplateSvg(input: MarbeteTemplateSelectionInput) {
  return resolveEffectiveMarbeteTemplateSvg(authorizedPersonMarbeteSelectionInput(input))
}

export async function saveMarbeteTemplate(input: {
  id?: string | null
  name: string
  nivel: string
  themeKey: PersonasThemeKey
  basedOnId?: string | null
  publish?: boolean
  file?: { filename?: string | null; data: Buffer }
  svgDesign?: MarbeteSvgDesign | null
}) {
  if (!VALID_THEME_KEYS.has(input.themeKey)) throw publicError(400, 'Nivel de marbete inválido.')

  const [allTemplates, customTemplates] = await Promise.all([
    listMarbeteTemplates(),
    listCustomMarbeteTemplates()
  ])
  const existingIndex = input.id ? customTemplates.findIndex((template) => template.id === input.id) : -1
  const existing = existingIndex >= 0 ? customTemplates[existingIndex] : null
  const baseTemplate = input.basedOnId ? allTemplates.find((template) => template.id === input.basedOnId) : null
  const now = new Date().toISOString()
  const stableId = existing?.id || `marbete-personalizado-${safeId(input.themeKey)}`

  if (!existing && !baseTemplate && !input.file?.data?.length) {
    throw publicError(400, 'Selecciona un SVG base.')
  }

  let filename = existing?.filename || baseTemplate?.filename || ''
  let url = existing?.url || baseTemplate?.url
  if (input.file?.data?.length) {
    const sourceName = String(input.file.filename || '')
    if (!sourceName.toLowerCase().endsWith('.svg')) throw publicError(415, 'El archivo debe ser SVG.')
    const text = input.file.data.toString('utf8')
    if (!/<svg\b/i.test(text)) throw publicError(422, 'El archivo SVG no es válido.')
    const uploaded = await uploadToExternalService(
      { data: input.file.data, filename: sourceName, type: 'image/svg+xml' },
      { maxBytes: 5 * 1024 * 1024, accept: 'svg', filenamePrefix: `marbete-${safeId(input.themeKey)}` }
    )
    filename = uploaded.storedFilename
    url = uploaded.absoluteUrl
  }

  let svgDesign = normalizeMarbeteSvgDesign(input.svgDesign, input.themeKey)
  svgDesign = {
    ...svgDesign,
    layers: await Promise.all(svgDesign.layers.map(async (layer) => {
      if (layer.kind !== 'static-image' || !layer.assetUrl || !/^data:image\//i.test(layer.assetUrl)) return layer
      const uploaded = await uploadToExternalService(
        dataUrlToUploadFile(layer.assetUrl, `marbete-overlay-${safeId(layer.id || stableId)}`),
        { maxBytes: 10 * 1024 * 1024, accept: 'images', filenamePrefix: `marbete-overlay-${safeId(layer.id || stableId)}` }
      )
      return { ...layer, assetUrl: uploaded.absoluteUrl }
    }))
  }

  const theme = resolvePersonasTheme({ themeKey: input.themeKey })
  const next: MarbeteTemplateMeta = {
    id: stableId,
    name: input.name.trim() || theme.label,
    filename,
    url,
    themeKey: input.themeKey,
    nivel: input.nivel.trim(),
    planteles: [],
    color: theme.primary,
    isDefault: Boolean(input.publish),
    mode: 'legacy-svg',
    status: input.publish ? 'published' : 'draft',
    cicloEscolar: '',
    svgDesign,
    basedOnId: baseTemplate?.id || existing?.basedOnId,
    publishedAt: input.publish ? now : existing?.publishedAt,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    source: 'custom'
  }

  const targetNivel = normalizeNivel(next.nivel)
  const withoutLevelDuplicates = customTemplates.filter((template, index) => {
    if (index === existingIndex) return false
    return !(template.themeKey === next.themeKey || (targetNivel && normalizeNivel(template.nivel) === targetNivel))
  })
  withoutLevelDuplicates.push(next)
  await writeTemplateIndex(withoutLevelDuplicates)
  return next
}

export async function deleteMarbeteTemplate(id: string) {
  const templates = await listCustomMarbeteTemplates()
  const index = templates.findIndex((template) => template.id === id)
  if (index < 0) throw publicError(404, 'Plantilla no encontrada.')

  const current = templates[index]
  if (!current) throw publicError(404, 'Plantilla no encontrada.')
  if (current.status !== 'draft') throw publicError(409, 'Solo se pueden eliminar borradores.')
  if (current.isDefault) throw publicError(409, 'La plantilla activa no se puede eliminar.')

  templates.splice(index, 1)
  await writeTemplateIndex(templates)
  return { id: current.id, deleted: true }
}

export async function applyMarbeteTemplateAction(input: {
  id: string
  action: 'publish' | 'unpublish'
}) {
  const customTemplates = await listCustomMarbeteTemplates()
  const index = customTemplates.findIndex((template) => template.id === input.id)
  if (index < 0) throw publicError(404, 'Diseño personalizado no encontrado.')
  const current = customTemplates[index]
  if (!current) throw publicError(404, 'Diseño personalizado no encontrado.')
  const now = new Date().toISOString()

  if (input.action === 'unpublish') {
    const targetNivel = normalizeNivel(current.nivel)
    const unpublished: MarbeteTemplateMeta = {
      ...current,
      status: 'draft',
      isDefault: false,
      updatedAt: now
    }
    const next = customTemplates
      .filter((template, templateIndex) => templateIndex === index || !(template.themeKey === current.themeKey || (targetNivel && normalizeNivel(template.nivel) === targetNivel)))
      .map((template) => template.id === current.id ? unpublished : template)
    await writeTemplateIndex(next)
    return unpublished
  }

  const targetNivel = normalizeNivel(current.nivel)
  const published: MarbeteTemplateMeta = {
    ...current,
    status: 'published',
    isDefault: true,
    planteles: [],
    cicloEscolar: '',
    publishedAt: now,
    updatedAt: now
  }
  const next = customTemplates
    .filter((template, templateIndex) => templateIndex === index || !(template.themeKey === current.themeKey || (targetNivel && normalizeNivel(template.nivel) === targetNivel)))
    .map((template) => template.id === current.id ? published : template)
  await writeTemplateIndex(next)
  return published
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


function svgDataUrl(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`
}

function initialsDataUrl(name: string, color: string) {
  const initials = String(name || 'PA').trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'PA'
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 720"><rect width="600" height="720" fill="#F3F7EF"/><circle cx="300" cy="265" r="138" fill="${escapeXml(color)}" opacity=".18"/><circle cx="300" cy="220" r="84" fill="${escapeXml(color)}" opacity=".42"/><path d="M122 650c18-160 106-250 178-250s160 90 178 250" fill="${escapeXml(color)}" opacity=".42"/><text x="300" y="696" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="700" fill="${escapeXml(color)}">${escapeXml(initials)}</text></svg>`)
}
function currentSchoolYearLabel(date = new Date()) {
  const year = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1
  return `${year}-${year + 1}`
}


export function buildMarbeteRenderValues(data: PrintableAuthorizedPerson, origin: string, templateCycle?: string | null): MarbeteRenderValues {
  const validationUrl = marbeteValidationUrl(origin, data.id)
  const trustedProcessedPhoto = isValidatedVisionPhotoUrl(data.compressed_foto) ? data.compressed_foto : ''
  const personPhotoSource = absoluteAssetUrl(String(trustedProcessedPhoto || data.foto || ''), origin)
  const studentPhotoSource = absoluteAssetUrl(String(data.fotoA || data.child?.foto || ''), origin)
  const studentName = fullName([
    data.fullnameA || '',
  ]) || fullName([data.child?.nombreA, data.child?.paternoA, data.child?.maternoA])
  const authorizedName = fullName([data.nombreP, data.paternoP, data.maternoP])
  const plantel = String(data.plantel || data.child?.plantel || '')
  const nivel = String(data.nivelEdu || data.child?.nivelEdu || '')
  const grado = String(data.gradoA || data.child?.grado || '')
  const grupo = String(data.grupoA || data.child?.grupo || '')
  const matricula = displayMatricula(data.matricula || data.child?.matricula)
  const ciclo = normalizeSchoolCycle(templateCycle) || normalizeSchoolCycle(data.cicloEscolar) || currentSchoolYearLabel()
  const validityLabel = String(data.fechaP || '').trim()
    ? `Vigente desde ${String(data.fechaP).slice(0, 10)}`
    : `Vigente ciclo ${ciclo}`
  const theme = resolvePersonasTheme({ matricula: data.matricula || data.child?.matricula, plantel, nivelEdu: nivel })
  const personPhoto = personPhotoSource || initialsDataUrl(authorizedName, theme.primary)
  const studentPhoto = studentPhotoSource || initialsDataUrl(studentName || 'Alumno', theme.primary)
  const qrImage = marbeteQrDataUrl(validationUrl)

  return {
    validationUrl,
    values: {
      id: String(data.id || ''),
      qr: String(data.qr || data.id || ''),
      paternoP: String(data.paternoP || ''),
      maternoP: String(data.maternoP || ''),
      authorizedSurnames: fullName([data.paternoP, data.maternoP]),
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
      schoolDetail: [grado ? `${grado}°` : '', grupo, plantel ? `Plantel ${plantel}` : ''].filter(Boolean).join(' · '),
      validityLabel,
      vigencia: validityLabel,
      ciclo,
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
  if (['plantel'].includes(key)) return 'Plantel del alumno no disponible.'
  if (['nivel', 'nivelEdu'].includes(key)) return 'Nivel del alumno no disponible.'
  if (['grado', 'gradoA'].includes(key)) return 'Grado del alumno no disponible.'
  if (['grupo', 'grupoA'].includes(key)) return 'Grupo del alumno no disponible.'
  if (key === 'schoolDetail') return 'Grado, grupo o plantel del alumno no disponible.'
  if (['validityLabel', 'vigencia', 'ciclo'].includes(key)) return 'Vigencia del Husky Pass no disponible.'
  if (['fullnameA', 'nombreAlumno', 'studentName', 'alumno'].includes(key)) return 'Nombre del alumno no disponible.'
  if (['fullnameP', 'nombreCompletoP', 'authorizedPersonName', 'nombreP'].includes(key)) return 'Nombre de la persona autorizada no disponible.'
  if (['parenP', 'parentesco'].includes(key)) return 'Parentesco de la persona autorizada no disponible.'
  return `Dato requerido no disponible: ${key}.`
}

export function validateMarbeteRequirements(svg: string, data: PrintableAuthorizedPerson, origin: string, templateCycle?: string | null): MarbeteRequirementStatus {
  const { values } = buildMarbeteRenderValues(data, origin, templateCycle)
  const optionalTokens = new Set(['maternoP', 'fechaP', 'id', 'qr', 'validationUrl'])
  const requiredTokens = unique([...dataTokens(svg).filter((key) => !optionalTokens.has(key)), ...imageTokens(svg)])
  const issues = requiredTokens
    .filter((key) => !String(values[key] || '').trim())
    .map(missingLabelFor)

  if (!String(values.fullnameP || '').trim()) issues.push(missingLabelFor('fullnameP'))
  if (!String(values.parenP || '').trim()) issues.push(missingLabelFor('parenP'))
  if (!String(values.fotoP || values.foto || '').trim()) issues.push(missingLabelFor('fotoP'))

  return { ok: !unique(issues).length, issues: unique(issues) }
}


export function renderMarbeteSvg(svg: string, data: PrintableAuthorizedPerson, origin: string, templateCycle?: string | null) {
  const { values } = buildMarbeteRenderValues(data, origin, templateCycle)
  return renderMarbeteSvgValues(svg, values)
}

export function marbeteDownloadName(data: PrintableAuthorizedPerson, template: MarbeteTemplateMeta) {
  const name = [data.nombreP, data.paternoP, data.maternoP].filter(Boolean).join(' ') || `persona-${data.id}`
  return `${safeId(`marbete-${template.themeKey}-${name}`) || `marbete-${data.id}`}.pdf`
}

export function fallbackTemplateColor(themeKey?: string | null) {
  const theme = resolvePersonasTheme({ themeKey })
  return theme.primary || PA_COLORS.daycare
}
