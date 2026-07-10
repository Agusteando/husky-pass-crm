import { computed, onScopeDispose, ref } from 'vue'

export type OptimisticSyncState = 'pending' | 'done' | 'error'

export interface OptimisticSyncStatus {
  key: string
  state: OptimisticSyncState
  label: string
  detail?: string
  showInTray: boolean
  updatedAt: number
}

interface StatusOptions {
  detail?: string
  showInTray?: boolean
  clearAfterMs?: number | null
}

export function useOptimisticStatus() {
  const statuses = ref<Record<string, OptimisticSyncStatus>>({})
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  const entries = computed(() => Object.values(statuses.value)
    .filter((entry) => entry.showInTray)
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 4))

  function clearTimer(key: string) {
    const timer = timers.get(key)
    if (timer) clearTimeout(timer)
    timers.delete(key)
  }

  function clearStatus(key: string) {
    clearTimer(key)
    if (!statuses.value[key]) return
    const next = { ...statuses.value }
    delete next[key]
    statuses.value = next
  }

  function setStatus(key: string, state: OptimisticSyncState, label?: string, options: StatusOptions = {}) {
    clearTimer(key)
    const previous = statuses.value[key]
    const entry: OptimisticSyncStatus = {
      key,
      state,
      label: label || previous?.label || 'Actualizando elemento',
      detail: options.detail ?? previous?.detail,
      showInTray: options.showInTray ?? previous?.showInTray ?? true,
      updatedAt: Date.now()
    }
    statuses.value = { ...statuses.value, [key]: entry }

    const defaultDelay = state === 'done' ? 3200 : state === 'error' ? 9000 : null
    const clearAfterMs = options.clearAfterMs === undefined ? defaultDelay : options.clearAfterMs
    if (clearAfterMs) {
      timers.set(key, setTimeout(() => clearStatus(key), clearAfterMs))
    }
    return entry
  }

  function markPending(key: string, label: string, options: StatusOptions = {}) {
    return setStatus(key, 'pending', label, { ...options, clearAfterMs: null })
  }

  function markDone(key: string, label?: string, options: StatusOptions = {}) {
    return setStatus(key, 'done', label, options)
  }

  function markError(key: string, label?: string, options: StatusOptions = {}) {
    return setStatus(key, 'error', label, options)
  }

  function moveStatus(fromKey: string, toKey: string) {
    if (fromKey === toKey || !statuses.value[fromKey]) return
    const entry = statuses.value[fromKey]
    clearTimer(fromKey)
    clearTimer(toKey)
    const next = { ...statuses.value }
    delete next[fromKey]
    next[toKey] = { ...entry, key: toKey, updatedAt: Date.now() }
    statuses.value = next
  }

  function getStatus(key: string) {
    return statuses.value[key]
  }

  function isPending(key: string) {
    return statuses.value[key]?.state === 'pending'
  }

  onScopeDispose(() => {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
  })

  return {
    entries,
    getStatus,
    isPending,
    markPending,
    markDone,
    markError,
    moveStatus,
    clearStatus
  }
}
