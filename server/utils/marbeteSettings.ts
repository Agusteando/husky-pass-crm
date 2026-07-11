import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { MarbeteTemplateSettings } from '~/types/daycare'
import { runtimeDataDir } from '~/server/utils/serverlessPaths'
import bundledSettings from '../../data/marbete-templates/settings.json'

const SETTINGS_DIR = runtimeDataDir('marbete-template-state')
const SETTINGS_PATH = join(SETTINGS_DIR, 'settings.json')
const LEGACY_SETTINGS_PATH = join(runtimeDataDir('marbete-templates'), 'settings.json')

const DEFAULT_SETTINGS: MarbeteTemplateSettings = {
  customTemplatesEnabled: false,
  updatedAt: '',
  updatedBy: null
}

function normalizeSettings(value?: Partial<MarbeteTemplateSettings> | null): MarbeteTemplateSettings {
  return {
    customTemplatesEnabled: Boolean(value?.customTemplatesEnabled),
    updatedAt: String(value?.updatedAt || ''),
    updatedBy: value?.updatedBy ? String(value.updatedBy) : null
  }
}

async function ensureSettingsDir() {
  await mkdir(SETTINGS_DIR, { recursive: true })
}

export async function readMarbeteTemplateSettings(): Promise<MarbeteTemplateSettings> {
  await ensureSettingsDir()
  for (const path of [SETTINGS_PATH, LEGACY_SETTINGS_PATH]) {
    try {
      const parsed = JSON.parse(await readFile(path, 'utf8')) as Partial<MarbeteTemplateSettings>
      return normalizeSettings(parsed)
    } catch {
      // Continue to the next compatible source.
    }
  }
  return normalizeSettings((bundledSettings || DEFAULT_SETTINGS) as Partial<MarbeteTemplateSettings>)
}

export async function saveMarbeteTemplateSettings(input: {
  customTemplatesEnabled: boolean
  updatedBy?: string | null
}): Promise<MarbeteTemplateSettings> {
  await ensureSettingsDir()
  const next: MarbeteTemplateSettings = {
    customTemplatesEnabled: Boolean(input.customTemplatesEnabled),
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy || null
  }
  await writeFile(SETTINGS_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  return next
}
