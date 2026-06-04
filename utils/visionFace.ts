export interface VisionFaceResult {
  src: string
  rawVisionData: Record<string, unknown>
}

function loadVisionImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`No fue posible cargar la imagen: ${url}`))
    img.src = url
  })
}

export async function processFaceImage(imageUrl: string): Promise<VisionFaceResult> {
  if (!imageUrl) throw new Error('Agrega una URL publica de imagen para procesar la foto.')
  if (typeof document === 'undefined') throw new Error('El procesamiento de imagen requiere navegador.')

  const visionBase = 'https://vision.casitaapps.com'
  const formData = new FormData()
  formData.append('imageUrl', imageUrl)

  const analyzeRes = await fetch(`${visionBase}/analyze`, {
    method: 'POST',
    body: formData
  })

  const data = await analyzeRes.json()
  if (!data || data.ok !== true) throw new Error('Vision API no pudo procesar la fotografia.')

  const img = await loadVisionImage(`${visionBase}/image/${data.imageKey}`)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('No fue posible preparar el lienzo de imagen.')

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
    if (!mCtx) throw new Error('No fue posible preparar la mascara.')

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
