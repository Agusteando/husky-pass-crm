import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { MktEnrollmentOptionsResponse } from '~/types/mktEnrollment'

export function useMktEnrollmentOptions() {
  const request = useFetch<MktEnrollmentOptionsResponse>('/api/mkt/enrollment/options', {
    key: 'mkt-enrollment-options',
    server: false,
    lazy: true,
    dedupe: 'defer'
  })

  const availablePlanteles = computed(() => (
    request.data.value?.planteles.filter((plantel) => plantel.available) || []
  ))
  const available = computed(() => Boolean(
    !request.error.value &&
    request.data.value?.connected &&
    availablePlanteles.value.length
  ))

  return {
    ...request,
    available,
    availablePlanteles
  }
}
