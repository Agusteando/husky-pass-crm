import { defineEventHandler } from 'h3'
import { getAppSession } from '~/server/utils/session'
export default defineEventHandler((event) => {
  return getAppSession(event)
})
