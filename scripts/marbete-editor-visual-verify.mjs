import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const args = process.argv.slice(2)
const readArg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : fallback
}

const baseUrl = readArg('--base-url', 'http://127.0.0.1:3000').replace(/\/$/, '')
const outDir = resolve(readArg('--out', '.agent-artifacts/marbete-editor-verification'))
await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const page = await context.newPage()
const errors = []

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

async function screenshot(name, options = {}) {
  await page.screenshot({ path: resolve(outDir, `${name}.png`), fullPage: true, ...options })
}

async function assertResponse(url, expectedContentType) {
  const response = await context.request.get(url, { timeout: 60000 })
  if (!response.ok()) throw new Error(`${url} devolvió ${response.status()}`)
  const contentType = response.headers()['content-type'] || ''
  if (!contentType.includes(expectedContentType)) throw new Error(`${url} devolvió ${contentType}`)
  return response
}

try {
  await page.goto(`${baseUrl}/__dev/marbete-editor`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.locator('[data-product-panel="marbete-visual-editor"]').waitFor({ state: 'visible' })
  await page.locator('.card-canvas svg image').first().waitFor({ state: 'visible' })
  await screenshot('01-editor-default')

  const cicloRow = page.locator('.element-list article').filter({ hasText: 'Etiqueta de ciclo escolar' })
  await cicloRow.locator('.element-select').click()
  const rotation = page.locator('.property-panel input[type="range"]').first()
  await rotation.evaluate((input) => {
    input.value = '12'
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })

  const cicloFrame = page.locator('[aria-label="Mover Etiqueta de ciclo escolar"]')
  const frameBox = await cicloFrame.boundingBox()
  if (!frameBox) throw new Error('No fue posible ubicar la etiqueta de ciclo en el lienzo.')
  await page.mouse.move(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(frameBox.x + frameBox.width / 2 - 24, frameBox.y + frameBox.height / 2 + 18, { steps: 8 })
  await page.mouse.up()

  await page.getByLabel('Ciclo').fill('2031-2032')
  await page.getByRole('button', { name: 'Hoja carta' }).click()
  await page.locator('[data-diagnostic-preview="marbete-print"] svg').waitFor({ state: 'visible' })
  await screenshot('02-editor-print-adjusted')

  const visualCases = [
    ['03-primaria-long', 'theme=primaria&variant=primaria-pt&scenario=long-name&ciclo=2026-2027&preset=default'],
    ['04-secundaria-rotated', 'theme=secundaria&variant=secundaria-st&scenario=wide-photo&ciclo=2031-2032&preset=rotated'],
    ['05-guarderia-crop', 'theme=daycare&variant=guarderia-cm&scenario=wide-photo&ciclo=2027-2028&preset=wide-crop'],
    ['06-preescolar-minimal', 'theme=preescolar&variant=preescolar-preem&scenario=missing-optional&ciclo=2028-2029&preset=minimal']
  ]

  for (const [name, query] of visualCases) {
    const url = `${baseUrl}/api/dev/husky-pass/editor-pass?${query}&format=svg-preview`
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await screenshot(name)
    const response = await assertResponse(url, 'image/svg+xml')
    const svg = await response.text()
    if (svg.includes('{{')) throw new Error(`${name} conserva tokens sin resolver.`)
    if (!svg.includes('CICLO ESCOLAR')) throw new Error(`${name} no contiene la etiqueta programática.`)
  }

  const newPdf = await assertResponse(`${baseUrl}/api/dev/husky-pass/editor-pass?theme=primaria&variant=primaria-pt&scenario=long-name&ciclo=2026-2027&preset=default&format=pdf`, 'application/pdf')
  const newPdfBytes = await newPdf.body()
  if (!newPdfBytes.subarray(0, 4).equals(Buffer.from('%PDF'))) throw new Error('El PDF del editor no tiene cabecera PDF válida.')
  await writeFile(resolve(outDir, 'marbete-editor.pdf'), newPdfBytes)

  const legacySvg = await assertResponse(`${baseUrl}/api/dev/husky-pass/pass?variant=primaria-pt&scenario=long-name&format=svg-preview`, 'image/svg+xml')
  if (legacySvg.headers()['x-husky-marbete-template'] !== 'primaria-2024') throw new Error('La selección de plantilla SVG heredada cambió.')
  const legacyPdf = await assertResponse(`${baseUrl}/api/dev/husky-pass/pass?variant=primaria-pt&scenario=long-name&format=pdf`, 'application/pdf')
  const legacyPdfBytes = await legacyPdf.body()
  if (!legacyPdfBytes.subarray(0, 4).equals(Buffer.from('%PDF'))) throw new Error('El PDF heredado no tiene cabecera PDF válida.')

  if (errors.length) throw new Error(`Errores de navegador:\n${errors.join('\n')}`)

  const summary = {
    ok: true,
    baseUrl,
    visualCases: visualCases.map(([name]) => name),
    interactions: ['move', 'rotation', 'cycle-update', 'print-preview'],
    exports: ['visual-svg', 'visual-pdf', 'legacy-svg', 'legacy-pdf'],
    screenshots: visualCases.length + 2
  }
  await writeFile(resolve(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(summary, null, 2))
} finally {
  await browser.close()
}
