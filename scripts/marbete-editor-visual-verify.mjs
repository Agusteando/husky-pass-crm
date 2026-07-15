import { existsSync } from 'node:fs'
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

const systemChromium = '/usr/bin/chromium'
const browser = await chromium.launch({
  headless: true,
  executablePath: existsSync(systemChromium) ? systemChromium : undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
})
const context = await browser.newContext({ viewport: { width: 1500, height: 1050 }, deviceScaleFactor: 1 })
const page = await context.newPage()
page.setDefaultTimeout(30000)
const errors = []
page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`) })
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

try {
  await page.goto(`${baseUrl}/__dev/marbete-editor`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.locator('[data-product-panel="marbete-svg-editor"]').waitFor({ state: 'visible' })
  await page.locator('.svg-stage-image').waitFor({ state: 'visible' })
  await page.locator('.layer-list article').filter({ hasText: 'Apellidos' }).waitFor()
  await page.locator('.layer-list article').filter({ hasText: 'Parentesco' }).waitFor()
  await page.screenshot({ path: resolve(outDir, '01-imported-fields.png'), fullPage: true })

  const selector = page.locator('.add-control select')
  await selector.selectOption('hologram')
  await page.getByRole('button', { name: 'Agregar' }).click()
  const hologram = page.locator('.layer-frame.kind-hologram')
  await hologram.waitFor({ state: 'visible' })
  const source = await hologram.locator('img').getAttribute('src')
  if (!source?.includes('/marbete/ciclo-tag.png')) throw new Error(`Textura de holograma incorrecta: ${source}`)

  const rotation = page.locator('.property-panel input[type="range"][min="-180"]')
  await rotation.evaluate((input) => {
    input.value = '-22'
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const transform = await hologram.evaluate((element) => getComputedStyle(element).transform)
  if (!transform || transform === 'none') throw new Error('El holograma no aplicó rotación.')

  const box = await hologram.boundingBox()
  if (!box) throw new Error('No fue posible ubicar el holograma.')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 36, box.y + box.height / 2 + 24, { steps: 8 })
  await page.mouse.up()
  await page.screenshot({ path: resolve(outDir, '02-hologram-placed.png'), fullPage: true })

  const hologramRow = page.locator('.layer-list article').filter({ hasText: 'Holograma' })
  await hologramRow.getByRole('button', { name: 'Quitar' }).click()
  await hologram.waitFor({ state: 'detached' })
  await selector.selectOption('hologram')
  await page.getByRole('button', { name: 'Agregar' }).click()
  await page.locator('.layer-frame.kind-hologram').waitFor({ state: 'visible' })

  const relationshipRow = page.locator('.layer-list article').filter({ hasText: 'Parentesco' })
  await relationshipRow.locator('.layer-select').click()
  const relationshipRotation = await page.locator('.property-panel input[type="range"][min="-180"]').inputValue()
  if (Math.round(Number(relationshipRotation)) !== 90) throw new Error(`No conservó la rotación original del parentesco: ${relationshipRotation}`)

  if (errors.length) throw new Error(`Errores de navegador:\n${errors.join('\n')}`)
  const summary = {
    ok: true,
    importedFields: ['photo', 'qr', 'surnames', 'given-name', 'relationship'],
    interactions: ['add-hologram', 'drag', 'rotate', 'remove', 'restore'],
    hologramAsset: '/marbete/ciclo-tag.png'
  }
  await writeFile(resolve(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(summary, null, 2))
} finally {
  await browser.close()
}
