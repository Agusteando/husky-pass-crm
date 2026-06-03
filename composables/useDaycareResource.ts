import { daycareResourceLabels, daycareResourceMap, isDaycareResourceRoute } from '~/utils/daycare'

export function useDaycareResource(routeValue: string) {
  if (!isDaycareResourceRoute(routeValue)) {
    throw createError({ statusCode: 404, statusMessage: 'Sección no encontrada' })
  }

  return {
    routeValue,
    label: daycareResourceLabels[routeValue],
    type: daycareResourceMap[routeValue]
  }
}
