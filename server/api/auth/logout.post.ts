export default defineEventHandler((event) => {
  clearAppSession(event)
  return { ok: true }
})
