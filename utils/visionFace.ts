export interface VisionFaceResult {
  src: string
  rawVisionData: Record<string, unknown>
  fromCache?: boolean
}

const VISION_BASE = 'https://vision.casitaapps.com'
const CACHE_PREFIX = 'pa:vision-face:'
const CACHE_VERSION = 'v2'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30
const CACHE_MAX_ITEMS = 36

interface CachedVisionFace {
  src: string
  rawVisionData?: Record<string, unknown>
  createdAt: number
  lastUsedAt: number
}

function loadVisionImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No fue posible cargar la imagen seleccionada.'))
    img.src = url
  })
}

function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export function toVisionImageUrl(imageUrl?: string | null) {
  const value = String(imageUrl || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  if (typeof window !== 'undefined' && value.startsWith('/')) return `${window.location.origin}${value}`
  return value
}

function cacheKeyFor(imageUrl: string, namespace = 'default') {
  return `${CACHE_PREFIX}${CACHE_VERSION}:${namespace}:${stableHash(imageUrl)}`
}

function readCachedFace(imageUrl: string, namespace?: string): VisionFaceResult | null {
  if (typeof window === 'undefined') return null
  try {
    const key = cacheKeyFor(imageUrl, namespace)
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const cached = JSON.parse(raw) as CachedVisionFace
    if (!cached?.src || Date.now() - Number(cached.createdAt || 0) > CACHE_TTL_MS) {
      window.localStorage.removeItem(key)
      return null
    }
    cached.lastUsedAt = Date.now()
    window.localStorage.setItem(key, JSON.stringify(cached))
    return { src: cached.src, rawVisionData: cached.rawVisionData || {}, fromCache: true }
  } catch {
    return null
  }
}

export function getCachedProcessedFaceImage(imageUrl?: string | null, namespace?: string) {
  const normalized = toVisionImageUrl(imageUrl)
  if (!normalized) return ''
  return readCachedFace(normalized, namespace)?.src || ''
}

function pruneFaceCache() {
  if (typeof window === 'undefined') return
  try {
    const entries: Array<{ key: string; lastUsedAt: number }> = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index) || ''
      if (!key.startsWith(CACHE_PREFIX)) continue
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      const cached = JSON.parse(raw) as CachedVisionFace
      if (!cached?.src || Date.now() - Number(cached.createdAt || 0) > CACHE_TTL_MS) {
        window.localStorage.removeItem(key)
        continue
      }
      entries.push({ key, lastUsedAt: Number(cached.lastUsedAt || cached.createdAt || 0) })
    }
    entries
      .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
      .slice(CACHE_MAX_ITEMS)
      .forEach((entry) => window.localStorage.removeItem(entry.key))
  } catch {
    // Cache is an optimization only.
  }
}

function writeCachedFace(imageUrl: string, result: VisionFaceResult, namespace?: string) {
  if (typeof window === 'undefined') return
  try {
    pruneFaceCache()
    window.localStorage.setItem(cacheKeyFor(imageUrl, namespace), JSON.stringify({
      src: result.src,
      rawVisionData: result.rawVisionData,
      createdAt: Date.now(),
      lastUsedAt: Date.now()
    } satisfies CachedVisionFace))
  } catch {
    // Cache is an optimization only.
  }
}

export async function processFaceImage(imageUrl: string): Promise<VisionFaceResult> {
  const visionImageUrl = toVisionImageUrl(imageUrl)
  if (!visionImageUrl) throw new Error('Selecciona una imagen para continuar.')
  if (typeof document === 'undefined') throw new Error('El procesamiento de imagen requiere navegador.')

  const formData = new FormData()
  formData.append('imageUrl', visionImageUrl)

  const analyzeRes = await fetch(`${VISION_BASE}/analyze`, {
    method: 'POST',
    body: formData
  })

  const data = await analyzeRes.json()
  if (!data || data.ok !== true) throw new Error('No fue posible preparar la fotografía.')

  const img = await loadVisionImage(`${VISION_BASE}/image/${data.imageKey}`)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('No fue posible preparar la imagen.')

  let sx = 0
  let sy = 0
  let sWidth = img.width
  let sHeight = img.height
  if (data.cropBox) {
    sx = data.cropBox.xMin * img.width
    sy = data.cropBox.yMin * img.height
    sWidth = (data.cropBox.xMax - data.cropBox.xMin) * img.width
    sHeight = (data.cropBox.yMax - data.cropBox.yMin) * img.height
  }

  const maxRes = 256
  const scale = Math.min(1, maxRes / sWidth, maxRes / sHeight)
  const cW = Math.max(1, Math.floor(sWidth * scale))
  const cH = Math.max(1, Math.floor(sHeight * scale))

  canvas.width = cW
  canvas.height = cH
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, cW, cH)

  if (data.maskAvailable && data.maskUrl) {
    const maskImg = await loadVisionImage(data.maskUrl)
    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = cW
    maskCanvas.height = cH
    const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true })
    if (!mCtx) throw new Error('No fue posible preparar la imagen.')

    const mScaleX = maskImg.width / img.width
    const mScaleY = maskImg.height / img.height
    mCtx.drawImage(maskImg, sx * mScaleX, sy * mScaleY, sWidth * mScaleX, sHeight * mScaleY, 0, 0, cW, cH)

    const mainPixels = ctx.getImageData(0, 0, cW, cH)
    const maskPixels = mCtx.getImageData(0, 0, cW, cH)
    let usesAlpha = false
    for (let i = 3; i < maskPixels.data.length; i += 16) {
      if (maskPixels.data[i] < 255) {
        usesAlpha = true
        break
      }
    }

    for (let i = 0; i < mainPixels.data.length; i += 4) {
      const maskIntensity = usesAlpha ? maskPixels.data[i + 3] : maskPixels.data[i]
      mainPixels.data[i + 3] = (mainPixels.data[i + 3] * maskIntensity) / 255
    }

    ctx.putImageData(mainPixels, 0, 0)
  }

  return {
    src: canvas.toDataURL('image/png'),
    rawVisionData: data
  }
}

export async function processFaceImageCached(imageUrl: string, options: { namespace?: string; force?: boolean } = {}): Promise<VisionFaceResult> {
  const visionImageUrl = toVisionImageUrl(imageUrl)
  if (!visionImageUrl) throw new Error('Selecciona una imagen para continuar.')
  if (!options.force) {
    const cached = readCachedFace(visionImageUrl, options.namespace)
    if (cached) return cached
  }
  const result = await processFaceImage(visionImageUrl)
  writeCachedFace(visionImageUrl, result, options.namespace)
  return result
}
