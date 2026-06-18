import { defineNitroPlugin } from 'nitropack/runtime'
import { ensureRequestId } from '~/server/utils/logger'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    ensureRequestId(event)
  })
})
