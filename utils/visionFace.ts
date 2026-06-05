export interface VisionFaceResult {
  src: string
  rawVisionData: Record<string, unknown>
  validation: VisionFaceValidation
  fromCache?: boolean
}

export interface VisionFaceValidation {
  valid: boolean
  message: string
  missingMarks: string[]
}

const VISION_BASE = 'https://vision.casitaapps.com'
const CACHE_PREFIX = 'pa:vision-face:'
const CACHE_VERSION = 'v5'
const VALIDATED_MARKER = 'vision=marks-ok'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30
const CACHE_MAX_ITEMS = 36

const inFlight = new Map<string, Promise<VisionFaceResult>>()

interface CachedVisionFace {
  src: string
  rawVisionData?: Record<string, unknown>
  validation?: VisionFaceValidation
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

function normalizeVisionAssetUrl(value?: string | null) {
  const url = String(value || '').trim()
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  return `${VISION_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item || '').trim()).filter(Boolean)
}

function marksObjectComplete(value: unknown) {
  const marks = asRecord(value)
  if (!marks) return null
  const entries = Object.entries(marks)
  if (!entries.length) return null
  return entries.every(([, present]) => present === true || present === 1 || present === 'true' || present === 'present')
}

export function evaluateVisionFaceValidation(data: Record<string, unknown>): VisionFaceValidation {
  const explicitMissing = [
    ...stringList(data.missingRequiredFaceMarks),
    ...stringList(data.missingRequiredMarks),
    ...stringList(asRecord(data.validation)?.missingRequiredFaceMarks),
    ...stringList(asRecord(data.validation)?.missingRequiredMarks),
    ...stringList(asRecord(data.faceValidation)?.missingRequiredFaceMarks),
    ...stringList(asRecord(data.faceValidation)?.missingRequiredMarks)
  ]

  if (explicitMissing.length) {
    return {
      valid: false,
      missingMarks: explicitMissing,
      message: `La foto no pudo validarse. Faltan marcas faciales requeridas: ${explicitMissing.join(', ')}.`
    }
  }

  const flags = [
    data.requiredFaceMarksPresent,
    data.requiredMarksPresent,
    data.allRequiredFaceMarksPresent,
    data.allRequiredMarksPresent,
    asRecord(data.validation)?.requiredFaceMarksPresent,
    asRecord(data.validation)?.requiredMarksPresent,
    asRecord(data.faceValidation)?.requiredFaceMarksPresent,
    asRecord(data.faceValidation)?.requiredMarksPresent
  ]
  if (flags.some((value) => value === true || value === 1 || value === 'true')) {
    return { valid: true, missingMarks: [], message: 'Foto validada.' }
  }

  const markGroups = [
    marksObjectComplete(data.requiredFaceMarks),
    marksObjectComplete(data.requiredMarks),
    marksObjectComplete(asRecord(data.validation)?.requiredFaceMarks),
    marksObjectComplete(asRecord(data.validation)?.requiredMarks),
    marksObjectComplete(asRecord(data.faceValidation)?.requiredFaceMarks),
    marksObjectComplete(asRecord(data.faceValidation)?.requiredMarks)
  ]
  if (markGroups.some((value) => value === true)) {
    return { valid: true, missingMarks: [], message: 'Foto validada.' }
  }

  return {
    valid: false,
    missingMarks: [],
    message: 'La foto no pudo validarse porque Vision no confirmó todas las marcas faciales requeridas.'
  }
}

export function toVisionImageUrl(imageUrl?: string | null) {
  const value = String(imageUrl || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  if (typeof window !== 'undefined' && value.startsWith('/')) return `${window.location.origin}${value}`
  return value
}

export function canProcessWithVision(imageUrl?: string | null) {
  return /^https?:\/\//i.test(toVisionImageUrl(imageUrl))
}

export function markValidatedVisionPhotoUrl(value?: string | null) {
  const url = String(value || '').trim()
  if (!url || isValidatedVisionPhotoUrl(url)) return url
  return `${url}${url.includes('?') ? '&' : '?'}${VALIDATED_MARKER}`
}

export function isValidatedVisionPhotoUrl(value?: string | null) {
  return String(value || '').includes(VALIDATED_MARKER)
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
    if (!cached.validation?.valid) {
      window.localStorage.removeItem(key)
      return null
    }
    return { src: cached.src, rawVisionData: cached.rawVisionData || {}, validation: cached.validation, fromCache: true }
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
      validation: result.validation,
      createdAt: Date.now(),
      lastUsedAt: Date.now()
    } satisfies CachedVisionFace))
  } catch {
    // Cache is an optimization only.
  }
}

async function readVisionAnalyzeResponse(response: Response) {
  let data: Record<string, unknown> | null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok || !data || data.ok !== true) {
    throw new Error('No fue posible preparar la fotografía.')
  }

  return data
}

export async function processFaceImage(imageUrl: string): Promise<VisionFaceResult> {
  const visionImageUrl = toVisionImageUrl(imageUrl)
  if (!visionImageUrl) throw new Error('Selecciona una imagen para continuar.')
  if (!canProcessWithVision(visionImageUrl)) throw new Error('La imagen debe estar disponible por URL pública.')
  if (typeof document === 'undefined') throw new Error('El procesamiento de imagen requiere navegador.')

  const formData = new FormData()
  formData.append('imageUrl', visionImageUrl)

  const data = await readVisionAnalyzeResponse(await fetch(`${VISION_BASE}/analyze`, {
    method: 'POST',
    body: formData
  }))
  const validation = evaluateVisionFaceValidation(data)
  if (!validation.valid) throw new Error(validation.message)

  const imageKey = String(data.imageKey || '')
  if (!imageKey) throw new Error('No fue posible preparar la fotografía.')

  const img = await loadVisionImage(normalizeVisionAssetUrl(`/image/${imageKey}`))
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('No fue posible preparar la imagen.')

  let sx = 0
  let sy = 0
  let sWidth = img.width
  let sHeight = img.height
  const cropBox = data.cropBox as { xMin?: number; yMin?: number; xMax?: number; yMax?: number } | null | undefined
  if (cropBox) {
    const xMin = Number(cropBox.xMin)
    const yMin = Number(cropBox.yMin)
    const xMax = Number(cropBox.xMax)
    const yMax = Number(cropBox.yMax)
    if ([xMin, yMin, xMax, yMax].every(Number.isFinite) && xMax > xMin && yMax > yMin) {
      sx = Math.max(0, xMin * img.width)
      sy = Math.max(0, yMin * img.height)
      sWidth = Math.min(img.width - sx, (xMax - xMin) * img.width)
      sHeight = Math.min(img.height - sy, (yMax - yMin) * img.height)
    }
  }

  const maxRes = 256
  const scale = Math.min(1, maxRes / sWidth, maxRes / sHeight)
  const cW = Math.max(1, Math.floor(sWidth * scale))
  const cH = Math.max(1, Math.floor(sHeight * scale))

  canvas.width = cW
  canvas.height = cH
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, cW, cH)

  if (data.maskAvailable && data.maskUrl) {
    const maskImg = await loadVisionImage(normalizeVisionAssetUrl(String(data.maskUrl)))
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
    rawVisionData: data,
    validation
  }
}

export async function processFaceImageCached(imageUrl: string, options: { namespace?: string; force?: boolean } = {}): Promise<VisionFaceResult> {
  const visionImageUrl = toVisionImageUrl(imageUrl)
  if (!visionImageUrl) throw new Error('Selecciona una imagen para continuar.')
  if (!options.force) {
    const cached = readCachedFace(visionImageUrl, options.namespace)
    if (cached) return cached
  }

  const key = cacheKeyFor(visionImageUrl, options.namespace)
  const active = inFlight.get(key)
  if (active && !options.force) return active

  const promise = processFaceImage(visionImageUrl)
    .then((result) => {
      writeCachedFace(visionImageUrl, result, options.namespace)
      return result
    })
    .finally(() => {
      if (inFlight.get(key) === promise) inFlight.delete(key)
    })

  inFlight.set(key, promise)
  return promise
}
