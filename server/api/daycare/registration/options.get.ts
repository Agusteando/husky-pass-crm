import { defineEventHandler } from 'h3'
import { listPublicDaycareSalas } from '~/server/data/daycareRegistration'

export default defineEventHandler(async () => {
  const salas = await listPublicDaycareSalas()
  const unidades = Array.from(new Set(salas.map((sala) => sala.unidad))).sort((a, b) => a.localeCompare(b, 'es'))
  return { unidades, salas }
})
