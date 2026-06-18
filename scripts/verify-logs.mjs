import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOTS = ['server']
const ALLOWED_CREATE_ERROR = new Set(['server/utils/httpError.ts'])
const ALLOWED_CONSOLE = new Set([])

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name).replace(/\\/g, '/')
    if (entry.isDirectory()) return walk(full)
    return entry.isFile() && full.endsWith('.ts') ? [full] : []
  })
}

const issues = []
for (const file of ROOTS.flatMap(walk)) {
  const text = readFileSync(file, 'utf8')
  if (!ALLOWED_CREATE_ERROR.has(file) && /\bcreateError\s*\(/.test(text)) {
    issues.push({ file, rule: 'createError', message: 'Usa publicError para separar message de statusMessage.' })
  }
  if (!ALLOWED_CONSOLE.has(file) && /console\.(warn|error)\s*\(/.test(text)) {
    issues.push({ file, rule: 'console', message: 'Usa server/utils/logger.ts para logs estructurados y redactados.' })
  }
  if (/statusMessage:\s*(`[^`]{60,}`|'[^']{60,}')/.test(text)) {
    issues.push({ file, rule: 'long-statusMessage', message: 'statusMessage debe ser una frase HTTP breve; el texto largo va en message.' })
  }
}

if (issues.length) {
  console.error(JSON.stringify({ ok: false, issues }, null, 2))
  process.exit(1)
}

console.log(JSON.stringify({ ok: true }, null, 2))
