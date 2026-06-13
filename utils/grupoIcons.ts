import type { GrupoSigil } from '~/types/attendance'
import { normalizeAttendanceText } from '~/utils/attendance'

export interface GrupoIconManifestEntry {
  grupoValue: string
  normalizedKey?: string
  maskPng?: string
  previewGreenPng?: string
}

export interface GrupoIconManifest {
  fallbackGrupo: string
  aliases?: Record<string, string>
  entries: GrupoIconManifestEntry[]
}

export interface ResolvedGrupoIcon extends GrupoSigil {
  maskImage: string
  previewImage: string
}

function repairMojibake(value: string) {
  if (!/[\u00c3\u00c2\u0080-\u009f]/.test(value)) return value
  try {
    const bytes = Uint8Array.from(Array.from(value, (char) => char.charCodeAt(0) & 255))
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return value
  }
}

function normalized(value?: string | null) {
  return normalizeAttendanceText(repairMojibake(String(value || '')))
}

function assetPath(value?: string | null) {
  const clean = String(value || '').trim().replace(/^\/+/, '')
  return clean ? `/grupo-icons/${clean}` : ''
}

export function resolveGrupoIcon(manifest?: GrupoIconManifest | null, grupo?: string | null): ResolvedGrupoIcon {
  const fallback: ResolvedGrupoIcon = {
    grupoValue: String(grupo || 'Grupo').trim() || 'Grupo',
    image: '',
    previewImage: '',
    maskImage: '',
    fallback: true
  }
  if (!manifest?.entries?.length) return fallback

  const aliasMap = Object.fromEntries(Object.entries(manifest.aliases || {}).map(([key, value]) => [normalized(key), normalized(value)]))
  const requested = normalized(grupo)
  const alias = requested ? (aliasMap[requested] || requested) : ''
  const entries = manifest.entries.map((entry) => ({
    ...entry,
    grupoValue: repairMojibake(entry.grupoValue),
    normalizedKey: normalized(entry.normalizedKey || entry.grupoValue)
  }))
  const exact = entries.find((entry) => entry.normalizedKey === alias || normalized(entry.grupoValue) === alias)
  const fallbackKey = normalized(manifest.fallbackGrupo)
  const manifestFallback = entries.find((entry) => entry.normalizedKey === fallbackKey) || entries[0]
  const entry = exact || manifestFallback

  return {
    grupoValue: entry?.grupoValue || fallback.grupoValue,
    image: assetPath(entry?.previewGreenPng),
    previewImage: assetPath(entry?.previewGreenPng),
    maskImage: assetPath(entry?.maskPng),
    fallback: !exact
  }
}
