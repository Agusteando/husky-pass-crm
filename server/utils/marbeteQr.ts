import QRCode from 'qrcode'
import { PNG } from 'pngjs'

const QR_ERROR_CORRECTION = 'M' as const
const QR_MARGIN_MODULES = 4
const QR_PIXELS_PER_MODULE = 8

export function marbeteValidationUrl(origin: string, authorizedPersonId: unknown) {
  const base = String(origin || '').replace(/\/$/, '')
  const id = String(authorizedPersonId ?? '').trim()
  return id ? `${base}/validar/persona-autorizada/${encodeURIComponent(id)}` : ''
}

export function marbeteQrDataUrl(value: string) {
  const payload = String(value || '').trim()
  if (!payload) return ''

  const qr = QRCode.create(payload, { errorCorrectionLevel: QR_ERROR_CORRECTION })
  const moduleCount = qr.modules.size
  const matrix = qr.modules.data as unknown as ArrayLike<number | boolean>
  const imageSize = (moduleCount + QR_MARGIN_MODULES * 2) * QR_PIXELS_PER_MODULE
  const png = new PNG({ width: imageSize, height: imageSize, colorType: 6 })

  for (let y = 0; y < imageSize; y += 1) {
    for (let x = 0; x < imageSize; x += 1) {
      const moduleX = Math.floor(x / QR_PIXELS_PER_MODULE) - QR_MARGIN_MODULES
      const moduleY = Math.floor(y / QR_PIXELS_PER_MODULE) - QR_MARGIN_MODULES
      const isDark = moduleX >= 0
        && moduleY >= 0
        && moduleX < moduleCount
        && moduleY < moduleCount
        && Boolean(matrix[moduleY * moduleCount + moduleX])
      const offset = (imageSize * y + x) * 4
      const channel = isDark ? 17 : 255
      png.data[offset] = channel
      png.data[offset + 1] = channel
      png.data[offset + 2] = channel
      png.data[offset + 3] = 255
    }
  }

  return `data:image/png;base64,${PNG.sync.write(png).toString('base64')}`
}
