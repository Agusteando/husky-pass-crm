import { defineEventHandler, setHeader } from 'h3'
import { clearAppSession } from '~/server/utils/session'

export default defineEventHandler((event) => {
  setHeader(event, 'cache-control', 'private, no-store, max-age=0')
  clearAppSession(event)
  return { ok: true }
})
