import { daycareResourceLabels, daycareResourceMap, isDaycareResourceRoute } from '~/utils/daycare'

export function useDaycareResource(routeValue: string) {
  if (!isDaycareResourceRoute(routeValue)) {
    throw createError({ statusCode: 404, statusMessage: 'Recurso no encontrado' })
  }

  return {
    routeValue,
    label: daycareResourceLabels[routeValue],
    type: daycareResourceMap[routeValue]
  }
}
