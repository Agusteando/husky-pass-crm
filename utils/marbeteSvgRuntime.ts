import { renderMarbeteVisualValues } from '~/utils/marbeteDesigner'

function escapeXml(value?: string | number | null) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function normalizeDynamicPhotoFrames(svg: string) {
  return svg.replace(/<image\b([^>]*\{\{\s*getTrustedUrl\(data\.(?:foto|fotoP|compressed_foto|studentPhoto|fotoA|qrImage)\)\s*\}\}[^>]*?)(\s*\/?)>/g, (_match, attrs: string, close: string) => {
    let nextAttrs = attrs.replace(/\s*\/\s*$/, '')
    if (/\spreserveAspectRatio=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\spreserveAspectRatio=(["'])[^"']*\1/i, ' preserveAspectRatio="xMidYMid slice"')
    } else {
      nextAttrs += ' preserveAspectRatio="xMidYMid slice"'
    }
    if (/\soverflow=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\soverflow=(["'])[^"']*\1/i, ' overflow="hidden"')
    } else {
      nextAttrs += ' overflow="hidden"'
    }
    return `<image${nextAttrs}${close.includes('/') ? '/>' : '>'}`
  })
}

export function renderMarbeteSvgValues(svg: string, values: Record<string, string>) {
  return renderMarbeteVisualValues(normalizeDynamicPhotoFrames(svg), values)
    .replace(/{{\s*getTrustedUrl\(data\.([A-Za-z0-9_]+)\)\s*}}/g, (_match, key: string) => escapeXml(values[key]))
    .replace(/{{\s*data\.([A-Za-z0-9_]+)\s*}}/g, (_match, key: string) => escapeXml(values[key]))
    .replace(/{{\s*[^}]+\s*}}/g, '')
}
