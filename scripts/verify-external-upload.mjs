const DEFAULT_ENDPOINT = 'https://expediente.casitaapps.com/upload.ashx'
const FOLDER = 'virtual'
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
)
const FILES = [
  { name: 'husky-pass-upload-verification.png', type: 'image/png', data: PNG },
  {
    name: 'husky-pass-upload-verification.svg',
    type: 'image/svg+xml',
    data: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1"/></svg>')
  }
]

function option(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : ''
}

function resolveEndpoint(value) {
  const endpoint = new URL(value || DEFAULT_ENDPOINT)
  if (!endpoint.pathname || endpoint.pathname === '/') endpoint.pathname = '/upload.ashx'
  return endpoint
}

const endpoint = resolveEndpoint(option('--endpoint') || process.env.EXPEDIENTE_UPLOAD_URL)
endpoint.searchParams.set('includeUrl', '1')

for (const file of FILES) {
  const body = new FormData()
  body.append('file', new Blob([file.data], { type: file.type }), file.name)
  body.append('folder', FOLDER)
  body.append('includeUrl', '1')

  const response = await fetch(endpoint, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(30000)
  })
  const responseText = await response.text()
  let result
  try {
    result = JSON.parse(responseText)
  } catch {
    result = null
  }

  if (!response.ok || result?.success !== true) {
    throw new Error(`La carga externa respondio ${response.status}.`)
  }

  const expectedPath = `/${FOLDER}/${file.name}`
  const uploadedUrl = new URL(String(result.url || ''))
  if (result.path !== expectedPath || uploadedUrl.pathname !== expectedPath || result.fileName !== file.name) {
    throw new Error(`La carga no quedo en ${expectedPath}.`)
  }

  const download = await fetch(uploadedUrl, { signal: AbortSignal.timeout(30000) })
  const downloadedFile = Buffer.from(await download.arrayBuffer())
  if (!download.ok || !downloadedFile.equals(file.data)) {
    throw new Error(`El archivo ${file.name} no pudo recuperarse integro.`)
  }

  console.log(`Carga externa verificada: ${uploadedUrl.origin}${uploadedUrl.pathname}`)
}
