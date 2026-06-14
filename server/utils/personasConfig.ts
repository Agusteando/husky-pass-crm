import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { PersonasAutorizadasConfig, PersonasSurveyConfig, PersonasSurveyNivelKey } from '~/types/daycare'
import { resolvePersonasTheme } from '~/utils/personasTheme'
import { runtimeDataDir } from '~/server/utils/serverlessPaths'
import { logPersonasWarning } from '~/server/utils/personasDiagnostics'
import bundledConfig from '../../data/personas-autorizadas/config.json'
import bundledAccessActions from '../../data/personas-autorizadas/access-actions.json'

const CONFIG_DIR = runtimeDataDir('personas-autorizadas')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')
const ACCESS_ACTION_PATH = join(CONFIG_DIR, 'access-actions.json')
export const SURVEY_NIVEL_OPTIONS: Array<{ key: PersonasSurveyNivelKey; label: string }> = [
  { key: 'preescolar', label: 'Preescolar' },
  { key: 'primaria', label: 'Primaria' },
  { key: 'secundaria', label: 'Secundaria' },
  { key: 'daycare', label: 'IECS / fallback' }
]

function defaultSurvey(title = 'Encuesta Personas Autorizadas'): PersonasSurveyConfig {
  return {
    enabled: false,
    title,
    embedUrl: '',
    updatedAt: '',
    updatedBy: null
  }
}

const defaultConfig: PersonasAutorizadasConfig = {
  survey: defaultSurvey(),
  surveysByNivel: {
    preescolar: defaultSurvey('Encuesta Preescolar'),
    primaria: defaultSurvey('Encuesta Primaria'),
    secundaria: defaultSurvey('Encuesta Secundaria'),
    daycare: defaultSurvey('Encuesta IECS')
  },
  conveniosUrl: '',
  helpUrl: '',
  updatedAt: '',
  updatedBy: null
}

async function ensureDir() {
  await mkdir(CONFIG_DIR, { recursive: true })
}

function normalizeUrl(value?: string | null) {
  return String(value || '').trim()
}

function normalizeSurvey(value?: Partial<PersonasSurveyConfig> | null, fallbackTitle = 'Encuesta Personas Autorizadas'): PersonasSurveyConfig {
  return {
    enabled: Boolean(value?.enabled),
    title: String(value?.title || fallbackTitle).trim() || fallbackTitle,
    embedUrl: normalizeGoogleFormEmbedUrl(value?.embedUrl),
    updatedAt: value?.updatedAt || '',
    updatedBy: value?.updatedBy || null
  }
}

function normalizeSurveysByNivel(value?: Partial<Record<PersonasSurveyNivelKey, Partial<PersonasSurveyConfig>>> | null) {
  const next = {} as Record<PersonasSurveyNivelKey, PersonasSurveyConfig>
  for (const option of SURVEY_NIVEL_OPTIONS) {
    const fallback = defaultConfig.surveysByNivel?.[option.key]
    next[option.key] = normalizeSurvey(value?.[option.key] || fallback, fallback?.title || `Encuesta ${option.label}`)
  }
  return next
}

export function normalizeGoogleFormEmbedUrl(value?: string | null) {
  const url = normalizeUrl(value)
  if (!url) return ''
  if (!/^https:\/\/docs\.google\.com\/forms\//i.test(url)) return url
  const withoutQuery = url.split('?')[0]
  return `${withoutQuery}?embedded=true`
}

export async function readPersonasConfig(): Promise<PersonasAutorizadasConfig> {
  await ensureDir()
  try {
    const raw = await readFile(CONFIG_PATH, 'utf8')
    const parsed = JSON.parse(raw) as Partial<PersonasAutorizadasConfig>
    const legacySurvey = normalizeSurvey(parsed.survey, defaultConfig.survey.title)
    return {
      ...defaultConfig,
      ...parsed,
      survey: legacySurvey,
      surveysByNivel: normalizeSurveysByNivel(parsed.surveysByNivel),
      conveniosUrl: normalizeUrl(parsed.conveniosUrl),
      helpUrl: normalizeUrl(parsed.helpUrl)
    }
  } catch (error) {
    const parsed = bundledConfig as Partial<PersonasAutorizadasConfig>
    if (!parsed || typeof parsed !== 'object') {
      logPersonasWarning('config-bundled-default-missing', { message: error instanceof Error ? error.message : String(error) })
      return defaultConfig
    }
    const legacySurvey = normalizeSurvey(parsed.survey, defaultConfig.survey.title)
    return {
      ...defaultConfig,
      ...parsed,
      survey: legacySurvey,
      surveysByNivel: normalizeSurveysByNivel(parsed.surveysByNivel),
      conveniosUrl: normalizeUrl(parsed.conveniosUrl),
      helpUrl: normalizeUrl(parsed.helpUrl)
    }
  }
}

export async function writePersonasConfig(config: PersonasAutorizadasConfig) {
  await ensureDir()
  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
  return config
}

export async function savePersonasConfig(input: {
  surveyEnabled: boolean
  surveyTitle: string
  surveyEmbedUrl: string
  surveysByNivel?: Partial<Record<PersonasSurveyNivelKey, Partial<PersonasSurveyConfig>>>
  conveniosUrl: string
  helpUrl?: string
  updatedBy?: string | null
}) {
  const now = new Date().toISOString()
  const existing = await readPersonasConfig()
  const legacySurvey = normalizeSurvey({
    enabled: input.surveyEnabled,
    title: input.surveyTitle,
    embedUrl: input.surveyEmbedUrl,
    updatedAt: now,
    updatedBy: input.updatedBy || null
  })
  const surveysByNivel = input.surveysByNivel
    ? normalizeSurveysByNivel(Object.fromEntries(Object.entries(input.surveysByNivel).map(([key, survey]) => [key, {
      ...survey,
      updatedAt: now,
      updatedBy: input.updatedBy || null
    }])) as Partial<Record<PersonasSurveyNivelKey, Partial<PersonasSurveyConfig>>>)
    : normalizeSurveysByNivel(existing.surveysByNivel)
  const config: PersonasAutorizadasConfig = {
    survey: legacySurvey,
    surveysByNivel,
    conveniosUrl: normalizeUrl(input.conveniosUrl),
    helpUrl: normalizeUrl(input.helpUrl),
    updatedAt: now,
    updatedBy: input.updatedBy || null
  }
  return writePersonasConfig(config)
}

export function surveyNivelFromStudent(input: { matricula?: string | null; plantel?: string | null; nivelEdu?: string | null; campus?: string | null }) {
  const key = resolvePersonasTheme(input).key
  return key === 'preescolar' || key === 'primaria' || key === 'secundaria' ? key : 'daycare'
}

export function resolveSurveyForStudent(config: PersonasAutorizadasConfig, input: { matricula?: string | null; plantel?: string | null; nivelEdu?: string | null; campus?: string | null }) {
  const nivelKey = surveyNivelFromStudent(input)
  const byNivel = normalizeSurveysByNivel(config.surveysByNivel)
  const survey = byNivel[nivelKey] || defaultSurvey()
  return {
    activeSurveyNivel: nivelKey,
    activeSurvey: survey
  }
}

export async function appendAccessActionLog(entry: Record<string, unknown>) {
  await ensureDir()
  let rows: Record<string, unknown>[]
  try {
    rows = JSON.parse(await readFile(ACCESS_ACTION_PATH, 'utf8')) as Record<string, unknown>[]
  } catch {
    rows = Array.isArray(bundledAccessActions) ? bundledAccessActions as Record<string, unknown>[] : []
  }
  rows.unshift({ ...entry, createdAt: new Date().toISOString() })
  await writeFile(ACCESS_ACTION_PATH, `${JSON.stringify(rows.slice(0, 500), null, 2)}\n`, 'utf8')
}

export async function readLastAccessActions() {
  await ensureDir()
  try {
    const rows = JSON.parse(await readFile(ACCESS_ACTION_PATH, 'utf8')) as Array<{ userId?: number; createdAt?: string }>
    const map = new Map<number, string>()
    for (const row of rows) {
      const userId = Number(row.userId)
      if (Number.isFinite(userId) && row.createdAt && !map.has(userId)) map.set(userId, row.createdAt)
    }
    return map
  } catch {
    return new Map<number, string>()
  }
}
