import { readFile } from 'node:fs/promises'

function argValue(name, fallback = '') {
  const flag = `--${name}`
  const index = process.argv.indexOf(flag)
  if (index >= 0) return process.argv[index + 1] || fallback
  const inline = process.argv.find((arg) => arg.startsWith(`${flag}=`))
  return inline ? inline.slice(flag.length + 1) : fallback
}

function command() {
  return process.argv.find((arg) => !arg.startsWith('-') && !arg.endsWith('.mjs') && arg !== 'node') || 'help'
}

function parseDotEnv(text) {
  return Object.fromEntries(text.split(/\r?\n/).map((line) => {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim())
    if (!match) return null
    return [match[1], match[2].replace(/^['"]|['"]$/g, '')]
  }).filter(Boolean))
}

async function defaultBaseUrl() {
  const explicit = argValue('base-url', process.env.PASSWORD_RECOVERY_BASE_URL || '')
  if (explicit) return explicit.replace(/\/+$/, '')
  try {
    const env = parseDotEnv(await readFile('.env', 'utf8'))
    return (env.PASSWORD_RECOVERY_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '')
  } catch {
    return 'http://127.0.0.1:3000'
  }
}

async function request(baseUrl) {
  const email = argValue('email')
  if (!email) throw new Error('Missing --email parent@example.com')
  const response = await fetch(`${baseUrl}/api/auth/password/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text}`)
  console.log(text)
}

async function latest(baseUrl) {
  const response = await fetch(`${baseUrl}/api/__dev/password-recovery/latest-preview`)
  const text = await response.text()
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text}`)
  console.log(text)
}

async function main() {
  const baseUrl = await defaultBaseUrl()
  const cmd = command()
  if (cmd === 'request') return request(baseUrl)
  if (cmd === 'latest') return latest(baseUrl)
  console.log([
    'Password recovery dev helper',
    '',
    'Commands:',
    '  npm run dev:password-recovery -- request --email parent@example.com --base-url http://127.0.0.1:3000',
    '  npm run dev:password-recovery -- latest --base-url http://127.0.0.1:3000',
    '',
    'Use PASSWORD_RECOVERY_EMAIL_MODE=preview in local .env to write preview files under artifacts/password-recovery-emails.'
  ].join('\n'))
}

main().catch((error) => {
  console.error(error.message || error)
  process.exitCode = 1
})
