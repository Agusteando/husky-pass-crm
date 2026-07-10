<template>
  <Teleport to="body">
    <TransitionGroup v-if="items.length" name="processing-tray" tag="aside" class="processing-tray" aria-label="Estado de operaciones" aria-live="polite">
      <article v-for="item in items" :key="item.key" class="processing-item" :data-state="item.state">
        <div class="processing-copy">
          <strong>{{ item.label }}</strong>
          <small>{{ item.detail || fallbackDetail(item.state) }}</small>
        </div>
        <AdminSyncCue :status="item" compact />
      </article>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import type { OptimisticSyncState, OptimisticSyncStatus } from '~/composables/useOptimisticStatus'

withDefaults(defineProps<{
  items?: OptimisticSyncStatus[]
}>(), {
  items: () => []
})

function fallbackDetail(state: OptimisticSyncState) {
  if (state === 'pending') return 'Terminando el proceso en el servidor.'
  if (state === 'done') return 'El cambio quedó confirmado.'
  return 'Se restauró el estado anterior.'
}
</script>

<style scoped>
.processing-tray {
  bottom: 18px;
  display: grid;
  gap: 9px;
  max-width: min(390px, calc(100vw - 28px));
  position: fixed;
  right: 18px;
  width: 100%;
  z-index: 1400;
}

.processing-item {
  align-items: center;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(22, 93, 135, 0.2);
  border-radius: 17px;
  box-shadow: 0 20px 54px rgba(13, 30, 45, 0.2);
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px 13px;
}

.processing-item[data-state='done'] { border-color: rgba(23, 99, 59, 0.2); }
.processing-item[data-state='error'] { border-color: rgba(167, 25, 53, 0.24); }

.processing-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.processing-copy strong,
.processing-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.processing-copy strong {
  color: #102235;
  font-size: 0.86rem;
}

.processing-copy small {
  color: #607086;
  font-size: 0.72rem;
  font-weight: 700;
}

.processing-tray-enter-active,
.processing-tray-leave-active,
.processing-tray-move {
  transition: opacity 180ms ease, transform 180ms ease;
}

.processing-tray-enter-from,
.processing-tray-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 640px) {
  .processing-tray {
    bottom: 10px;
    left: 10px;
    max-width: none;
    right: 10px;
    width: auto;
  }
}
</style>
