import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'

function normalizeDraftValue(value: unknown): unknown {
  if (value === undefined) return '__undefined__'
  if (value === null || typeof value !== 'object') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof File !== 'undefined' && value instanceof File) {
    return {
      name: value.name,
      size: value.size,
      type: value.type,
      lastModified: value.lastModified
    }
  }
  if (Array.isArray(value)) return value.map(normalizeDraftValue)

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, normalizeDraftValue(entry)])
  )
}

export function draftFingerprint(value: unknown) {
  return JSON.stringify(normalizeDraftValue(value))
}

export function useDraftState<T>(source: MaybeRefOrGetter<T>) {
  const baseline = ref(draftFingerprint(toValue(source)))
  const isDirty = computed(() => draftFingerprint(toValue(source)) !== baseline.value)

  function resetDraft(value: T = toValue(source)) {
    baseline.value = draftFingerprint(value)
  }

  return {
    isDirty,
    resetDraft
  }
}
