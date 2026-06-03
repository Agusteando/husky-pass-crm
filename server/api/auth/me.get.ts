export default defineEventHandler((event) => {
  return getAppSession(event)
})
