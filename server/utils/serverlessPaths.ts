import { tmpdir } from 'node:os'
import { join } from 'node:path'

export function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

export function runtimeDataDir(segment: string) {
  const baseDir = process.env.HUSKY_PASS_DATA_DIR
    || (isServerlessRuntime() ? join(tmpdir(), 'husky-pass-crm') : join(process.cwd(), 'data'))
  return join(baseDir, segment)
}
