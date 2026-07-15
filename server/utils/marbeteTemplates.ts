import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { useStorage } from 'nitropack/runtime'
import type { MarbeteSvgDesign, MarbeteTemplateMeta, MarbeteTemplateSettings, MarbeteVisualDesign, PersonasThemeKey, PrintableAuthorizedPerson } from '~/types/daycare'
import { allPersonasThemes, normalizeNivel, PA_COLORS, resolveAuthorizedPersonMarbeteLevel, resolveAuthorizedPersonMarbetePlantel, resolvePersonasTheme } from '~/utils/personasTheme'
import { normalizeSchoolPlantel } from '~/utils/schoolCatalog'
import { displayMatricula } from '~/utils/matricula'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { isValidatedVisionPhotoUrl } from '~/utils/visionFace'
import { runtimeDataDir } from '~/server/utils/serverlessPaths'
import { logPersonasWarning } from '~/server/utils/personasDiagnostics'
import { publicError } from '~/server/utils/httpError'
import QRCode from 'qrcode'
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

function normalizeTemplatePlanteles(values?: unknown[] | null): string[] {
  if (!Array.isArray(values)) return []
  const planteles: string[] = []
  for (const item of values) {
    const plantel = normalizeSchoolPlantel(String(item || ''))
    if (plantel) planteles.push(plantel)
  }
  return planteles
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
    planteles: normalizeTemplatePlanteles(row.planteles),
    color: String(row.color || theme.primary),
    isDefault: row.status === 'draft' ? false : Boolean(row.isDefault),
    mode,
    status: row.status === 'draft' ? 'draft' : 'published',
    cicloEscolar: normalizeSchoolCycle(row.cicloEscolar),
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
  const plantel = normalizeSchoolPlantel(input.plantel) || normalizeSchoolPlantel(input.matricula) || ''
  const nivel = normalizeNivel(input.nivelEdu)
  const ciclo = normalizeSchoolCycle(input.cicloEscolar)
  const sameCycle = ciclo ? templates.filter((template) => normalizeSchoolCycle(template.cicloEscolar) === ciclo) : []
  const pool = (sameCycle.length ? sameCycle : templates).sort((left, right) => {
    const active = Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault))
    if (active) return active
    return String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''))
  })
  const themedPool = pool.filter((template) => template.themeKey === theme.key)

  const byPlantel = themedPool.find((template) => template.planteles.includes(plantel))
  if (byPlantel) return byPlantel

  const byNivel = themedPool.find((template) => normalizeNivel(template.nivel) && nivel.includes(normalizeNivel(template.nivel)))
  if (byNivel) return byNivel

  const byTheme = themedPool[0]
  if (byTheme) return byTheme

  throw publicError(422, `No hay una plantilla SVG compatible con nivel ${input.nivelEdu || 'sin nivel'} y plantel ${input.plantel || 'sin plantel'}.`)
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
  const customPublished = templates.filter((template) => template.source === 'custom' && template.status !== 'draft')
  if (!customPublished.length) return null
  const ciclo = normalizeSchoolCycle(input.cicloEscolar)
  if (ciclo) {
    const sameCycle = customPublished.filter((template) => normalizeSchoolCycle(template.cicloEscolar) === ciclo)
    if (sameCycle.length) {
      try {
        return selectFromPool(sameCycle, input)
      } catch {
        // Continue to the active fallback when no exact-cycle template matches the requested scope.
      }
    }
  }
  const active = customPublished.filter((template) => template.isDefault)
  if (active.length) {
    try {
      return selectFromPool(active, input)
    } catch {
      // Return null below when the active custom templates do not cover this scope.
    }
  }
  return null
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
  planteles: string[]
  themeKey: PersonasThemeKey
  cicloEscolar?: string | null
  file?: { filename?: string | null; data: Buffer }
  svgDesign?: MarbeteSvgDesign | null
}) {
  if (!VALID_THEME_KEYS.has(input.themeKey)) {
    throw publicError(400, 'Tema de plantilla invalido.')
  }

  const templates = await listCustomMarbeteTemplates()
  const existingIndex = input.id ? templates.findIndex((template) => template.id === input.id) : -1
  const now = new Date().toISOString()
  const baseId = input.id || safeId(input.name || `${input.themeKey}-${input.nivel}`) || `template-${Date.now()}`
  const existing = existingIndex >= 0 ? templates[existingIndex] : null

  if (existing?.status === 'published') {
    throw publicError(409, 'Duplica la versión publicada para preparar un reemplazo sin afectar a las familias.')
  }

  if (!existing && !input.file?.data?.length) {
    throw publicError(400, 'Agrega un archivo SVG o duplica una versión existente para iniciar el marbete.')
  }

  let filename = existing?.filename || ''
  let url = existing?.url
  if (input.file?.data?.length) {
    const sourceName = String(input.file.filename || '')
    if (!sourceName.toLowerCase().endsWith('.svg')) throw publicError(415, 'La plantilla debe ser SVG.')
    const text = input.file.data.toString('utf8')
    if (!text.includes('<svg')) throw publicError(422, 'El archivo no parece ser una plantilla SVG valida.')
    const uploaded = await uploadToExternalService(
      { data: input.file.data, filename: sourceName, type: 'image/svg+xml' },
      {
        maxBytes: 5 * 1024 * 1024,
        accept: 'svg',
        filenamePrefix: `marbete-${safeId(baseId)}`
      }
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
        dataUrlToUploadFile(layer.assetUrl, `marbete-overlay-${safeId(layer.id || baseId)}`),
        {
          maxBytes: 10 * 1024 * 1024,
          accept: 'images',
          filenamePrefix: `marbete-overlay-${safeId(layer.id || baseId)}`
        }
      )
      return { ...layer, assetUrl: uploaded.absoluteUrl }
    }))
  }

  const theme = resolvePersonasTheme({ themeKey: input.themeKey })
  const next: MarbeteTemplateMeta = {
    id: existing?.id || safeId(baseId),
    name: input.name.trim(),
    filename,
    url,
    themeKey: input.themeKey,
    nivel: input.nivel.trim(),
    planteles: normalizeTemplatePlanteles(input.planteles),
    color: theme.primary,
    isDefault: existing?.isDefault || false,
    mode: 'legacy-svg',
    status: existing?.status || 'draft',
    cicloEscolar: normalizeSchoolCycle(input.cicloEscolar),
    svgDesign,
    basedOnId: existing?.basedOnId,
    publishedAt: existing?.publishedAt,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    source: 'custom'
  }

  if (existingIndex >= 0) templates.splice(existingIndex, 1, next)
  else templates.push(next)
  await writeTemplateIndex(templates)
  return next
}

export async function saveVisualMarbeteTemplate(input: {
  id?: string | null
  name: string
  nivel: string
  planteles: string[]
  themeKey: PersonasThemeKey
  cicloEscolar: string
  visualDesign: MarbeteVisualDesign
  artwork?: { filename?: string | null; type?: string | null; data: Buffer }
}) {
  if (!VALID_THEME_KEYS.has(input.themeKey)) throw publicError(400, 'Tema de plantilla inválido.')
  const cicloEscolar = normalizeSchoolCycle(input.cicloEscolar)
  if (!cicloEscolar) throw publicError(400, 'Usa un ciclo escolar válido, por ejemplo 2026-2027.')

  const templates = await listCustomMarbeteTemplates()
  const existingIndex = input.id ? templates.findIndex((template) => template.id === input.id) : -1
  const existing = existingIndex >= 0 ? templates[existingIndex] : null
  if (existing?.status === 'published') {
    throw publicError(409, 'Duplica la versión publicada para preparar un reemplazo sin afectar a las familias.')
  }
  if (existing && existing.mode !== 'visual') throw publicError(409, 'Esta versión usa SVG completo. Crea una versión visual nueva.')

  const now = new Date().toISOString()
  const baseId = input.id || safeId(`${input.themeKey}-${input.nivel}-${cicloEscolar}-${Date.now()}`)
  const visualDesign = normalizeMarbeteVisualDesign(input.visualDesign, input.themeKey)
  if (input.artwork?.data?.length) {
    const uploaded = await uploadToExternalService(
      { data: input.artwork.data, filename: input.artwork.filename, type: input.artwork.type },
      { maxBytes: 10 * 1024 * 1024, accept: 'images', filenamePrefix: `marbete-fondo-${safeId(baseId)}` }
    )
    visualDesign.background.url = uploaded.absoluteUrl
  }

  const theme = resolvePersonasTheme({ themeKey: input.themeKey })
  const next: MarbeteTemplateMeta = {
    id: existing?.id || baseId,
    name: input.name.trim(),
    filename: '',
    themeKey: input.themeKey,
    nivel: input.nivel.trim(),
    planteles: normalizeTemplatePlanteles(input.planteles),
    color: theme.primary,
    isDefault: false,
    mode: 'visual',
    status: 'draft',
    cicloEscolar,
    visualDesign,
    basedOnId: existing?.basedOnId,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    source: 'custom'
  }

  if (existingIndex >= 0) templates.splice(existingIndex, 1, next)
  else templates.push(next)
  await writeTemplateIndex(templates)
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
  action: 'duplicate' | 'publish' | 'activate'
  cicloEscolar?: string | null
  plantel?: string | null
  name?: string | null
}) {
  const [allTemplates, customTemplates] = await Promise.all([
    listMarbeteTemplates(),
    listCustomMarbeteTemplates()
  ])
  const current = allTemplates.find((template) => template.id === input.id)
  if (!current) throw publicError(404, 'Diseño de marbete no encontrado.')
  const index = customTemplates.findIndex((template) => template.id === input.id)
  const now = new Date().toISOString()

  if (input.action === 'duplicate') {
    const cicloEscolar = normalizeSchoolCycle(input.cicloEscolar)
    if (!cicloEscolar) throw publicError(400, 'Indica el nuevo ciclo escolar, por ejemplo 2027-2028.')
    const plantel = normalizeSchoolPlantel(input.plantel)
    const id = safeId(`${current.themeKey}-${plantel || current.nivel}-${cicloEscolar}-${Date.now()}`)
    const duplicate: MarbeteTemplateMeta = {
      ...current,
      id,
      name: String(input.name || '').trim() || `${current.name.replace(/\s+[·-]\s+20\d{2}-20\d{2}$/i, '')} · ${cicloEscolar}`,
      planteles: plantel ? [plantel] : current.planteles,
      cicloEscolar,
      isDefault: false,
      status: 'draft',
      basedOnId: current.id,
      publishedAt: undefined,
      visualDesign: current.visualDesign ? normalizeMarbeteVisualDesign(JSON.parse(JSON.stringify(current.visualDesign)), current.themeKey) : undefined,
      svgDesign: current.svgDesign ? normalizeMarbeteSvgDesign(JSON.parse(JSON.stringify(current.svgDesign)), current.themeKey) : undefined,
      createdAt: now,
      updatedAt: now,
      source: 'custom'
    }
    customTemplates.push(duplicate)
    await writeTemplateIndex(customTemplates)
    return duplicate
  }

  if (input.action === 'publish') {
    if (current.status === 'published') return current
    if (!normalizeSchoolCycle(current.cicloEscolar)) throw publicError(422, 'Completa el ciclo escolar antes de publicar.')
    if (current.mode === 'visual') {
      const design = normalizeMarbeteVisualDesign(current.visualDesign, current.themeKey)
      if (!design.background.url) throw publicError(422, 'Sube el arte de fondo antes de publicar.')
      const requiredKinds = new Set(['person-photo', 'qr', 'authorized-name', 'relationship', 'ciclo-tag'])
      const visibleKinds = new Set(design.elements.filter((element) => element.visible).map((element) => element.kind))
      const missing = [...requiredKinds].filter((kind) => !visibleKinds.has(kind as never))
      if (missing.length) throw publicError(422, 'Muestra foto, QR, nombre, parentesco y ciclo escolar antes de publicar.')
    }
    const published: MarbeteTemplateMeta = { ...current, status: 'published', publishedAt: now, updatedAt: now, isDefault: false }
    if (index < 0) throw publicError(409, 'La plantilla SVG institucional no se publica; duplícala para crear una personalizada.')
    customTemplates.splice(index, 1, { ...published, source: 'custom' })
    await writeTemplateIndex(customTemplates)
    return published
  }

  if (current.status !== 'published') throw publicError(409, 'Publica el diseño antes de activarlo.')
  const targetNivel = normalizeNivel(current.nivel)
  if (current.source === 'bundled-svg' || index < 0) throw publicError(409, 'La plantilla SVG institucional ya es la base predeterminada.')
  const activated = customTemplates.map((template) => {
    if (template.id === current.id) return { ...template, isDefault: true, updatedAt: now }
    if (template.status !== 'draft' && template.themeKey === current.themeKey && normalizeNivel(template.nivel) === targetNivel && template.isDefault) {
      return { ...template, isDefault: false, updatedAt: now }
    }
    return template
  })
  await writeTemplateIndex(activated)
  return activated.find((template) => template.id === current.id) as MarbeteTemplateMeta
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

function qrDataUrl(value: string) {
  const qr = QRCode.create(value, { errorCorrectionLevel: 'M' })
  const size = qr.modules.size
  const matrix = qr.modules.data as unknown as ArrayLike<number | boolean>
  const margin = 2
  const paths: string[] = []
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (matrix[row * size + column]) paths.push(`M${column + margin} ${row + margin}h1v1h-1z`)
    }
  }
  const total = size + margin * 2
  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#fff"/><path d="${paths.join('')}" fill="#111"/></svg>`)
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
  const validationUrl = `${origin.replace(/\/$/, '')}/validar/persona-autorizada/${data.id}`
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
  const qrImage = qrDataUrl(validationUrl)

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
