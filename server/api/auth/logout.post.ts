import { defineEventHandler } from 'h3'
import { clearAppSession } from '~/server/utils/session'
export default defineEventHandler((event) => {
  clearAppSession(event)
  return { ok: true }
})
