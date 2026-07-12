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

  const available = computed(() => Boolean(
    !request.error.value &&
    request.data.value?.connected &&
    request.data.value.planteles.some((plantel) => plantel.hasData)
  ))

  return {
    ...request,
    available
  }
}
