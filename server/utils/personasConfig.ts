import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { PersonasAutorizadasConfig } from '~/types/daycare'

const CONFIG_DIR = join(process.cwd(), 'data', 'personas-autorizadas')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')
const ACCESS_ACTION_PATH = join(CONFIG_DIR, 'access-actions.json')

const defaultConfig: PersonasAutorizadasConfig = {
  survey: {
    enabled: false,
    title: 'Encuesta Personas Autorizadas',
    embedUrl: '',
    updatedAt: '',
    updatedBy: null
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
    return {
      ...defaultConfig,
      ...parsed,
      survey: {
        ...defaultConfig.survey,
        ...(parsed.survey || {}),
        embedUrl: normalizeGoogleFormEmbedUrl(parsed.survey?.embedUrl)
      },
      conveniosUrl: normalizeUrl(parsed.conveniosUrl),
      helpUrl: normalizeUrl(parsed.helpUrl)
    }
  } catch {
    await writePersonasConfig(defaultConfig)
    return defaultConfig
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
  conveniosUrl: string
  helpUrl?: string
  updatedBy?: string | null
}) {
  const now = new Date().toISOString()
  const config: PersonasAutorizadasConfig = {
    survey: {
      enabled: input.surveyEnabled,
      title: input.surveyTitle.trim() || 'Encuesta Personas Autorizadas',
      embedUrl: normalizeGoogleFormEmbedUrl(input.surveyEmbedUrl),
      updatedAt: now,
      updatedBy: input.updatedBy || null
    },
    conveniosUrl: normalizeUrl(input.conveniosUrl),
    helpUrl: normalizeUrl(input.helpUrl),
    updatedAt: now,
    updatedBy: input.updatedBy || null
  }
  return writePersonasConfig(config)
}

export async function appendAccessActionLog(entry: Record<string, unknown>) {
  await ensureDir()
  let rows: Record<string, unknown>[]
  try {
    rows = JSON.parse(await readFile(ACCESS_ACTION_PATH, 'utf8')) as Record<string, unknown>[]
  } catch {
    rows = []
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
