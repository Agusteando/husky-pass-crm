<template>
  <span v-if="status" class="sync-cue" :class="{ compact }" :data-state="status.state" role="status" aria-live="polite">
    <span class="sync-icon" aria-hidden="true">
      <span v-if="status.state === 'pending'" class="sync-spinner" />
      <span v-else-if="status.state === 'done'">✓</span>
      <span v-else>!</span>
    </span>
    <span>{{ statusLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OptimisticSyncStatus } from '~/composables/useOptimisticStatus'

const props = defineProps<{
  status?: OptimisticSyncStatus | null
  compact?: boolean
}>()

const statusLabel = computed(() => {
  if (props.status?.state === 'pending') return 'Procesando'
  if (props.status?.state === 'done') return 'Listo'
  return 'No se guardó'
})
</script>

<style scoped>
.sync-cue {
  align-items: center;
  background: #eef7ff;
  border: 1px solid #bfdcf2;
  border-radius: 999px;
  color: #175d87;
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 900;
  gap: 6px;
  min-height: 28px;
  padding: 5px 9px;
  white-space: nowrap;
}

.sync-cue.compact {
  font-size: 0.68rem;
  min-height: 24px;
  padding: 3px 7px;
}

.sync-cue[data-state='done'] {
  background: #edf9f2;
  border-color: #b8e0c8;
  color: #17633b;
}

.sync-cue[data-state='error'] {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #a71935;
}

.sync-icon {
  align-items: center;
  display: inline-flex;
  height: 14px;
  justify-content: center;
  width: 14px;
}

.sync-spinner {
  animation: sync-spin 0.8s linear infinite;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 999px;
  height: 12px;
  width: 12px;
}

@keyframes sync-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .sync-spinner { animation: none; }
}
</style>
