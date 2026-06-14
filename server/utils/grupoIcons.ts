import type { GrupoSigil } from '~/types/attendance'
import { normalizeAttendanceText } from '~/utils/attendance'
import bundledManifest from '../../public/grupo-icons/manifest.json'

interface GrupoManifestEntry {
  grupoValue: string
  normalizedKey?: string
  previewGreenPng: string
}

interface GrupoManifest {
  fallbackGrupo: string
  aliases?: Record<string, string>
  entries: GrupoManifestEntry[]
}

let manifestCache: GrupoManifest | null = null

function repairMojibake(value: string) {
  if (!/[\u00c3\u00c2\ufffd\u0080-\u009f]/.test(value)) return value
  try {
    return Buffer.from(value, 'latin1').toString('utf8')
  } catch {
    return value
  }
}

async function loadGrupoManifest() {
  if (manifestCache) return manifestCache
  const parsed = bundledManifest as GrupoManifest
  manifestCache = {
    ...parsed,
    fallbackGrupo: repairMojibake(parsed.fallbackGrupo),
    aliases: Object.fromEntries(Object.entries(parsed.aliases || {}).map(([key, value]) => [normalizeAttendanceText(repairMojibake(key)), normalizeAttendanceText(repairMojibake(value))])),
    entries: parsed.entries.map((entry) => ({
      ...entry,
      grupoValue: repairMojibake(entry.grupoValue),
      normalizedKey: normalizeAttendanceText(repairMojibake(entry.normalizedKey || entry.grupoValue))
    }))
  }
  return manifestCache
}

export async function resolveGrupoSigil(grupo?: string | null): Promise<GrupoSigil> {
  try {
    const manifest = await loadGrupoManifest()
    const requested = normalizeAttendanceText(repairMojibake(String(grupo || '')))
    const alias = requested ? (manifest.aliases?.[requested] || requested) : ''
    const exact = manifest.entries.find((entry) => entry.normalizedKey === alias || normalizeAttendanceText(entry.grupoValue) === alias)
    const fallbackKey = normalizeAttendanceText(manifest.fallbackGrupo)
    const fallback = manifest.entries.find((entry) => entry.normalizedKey === fallbackKey) || manifest.entries[0]
    const entry = exact || fallback

    return {
      grupoValue: entry?.grupoValue || manifest.fallbackGrupo || 'Grupo',
      image: entry?.previewGreenPng ? `/grupo-icons/${entry.previewGreenPng}` : '',
      fallback: !exact
    }
  } catch {
    return {
      grupoValue: String(grupo || 'Grupo').trim() || 'Grupo',
      image: '',
      fallback: true
    }
  }
}
