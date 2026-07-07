import { defineEventHandler, getQuery, setHeader } from 'h3'
import { z } from 'zod'
import QRCode from 'qrcode'
import { daycareRegistrationUrl, resolveDaycareRegistrationLink } from '~/server/data/daycareRegistration'

const schema = z.object({ codigo: z.string().trim().min(4) })

export default defineEventHandler(async (event) => {
  const query = schema.parse(getQuery(event))
  const link = await resolveDaycareRegistrationLink(query.codigo, event)
  const svg = await QRCode.toString(daycareRegistrationUrl(event, link.token), {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 340,
    color: { dark: '#102235', light: '#ffffff' }
  })
  setHeader(event, 'content-type', 'image/svg+xml; charset=utf-8')
  setHeader(event, 'cache-control', 'private, max-age=300')
  return svg
})
