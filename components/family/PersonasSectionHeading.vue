<template>
  <header class="pa-section-heading" :data-compact="compact ? 'true' : 'false'">
    <span class="pa-section-accent" aria-hidden="true"></span>
    <div class="pa-section-copy">
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <span v-if="meta" class="pa-section-meta">{{ meta }}</span>
    <div v-if="hasActions" class="pa-section-actions"><slot name="actions" /></div>
  </header>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

withDefaults(defineProps<{
  title: string
  description?: string
  meta?: string
  compact?: boolean
}>(), {
  description: '',
  meta: '',
  compact: false
})

const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))
</script>

<style scoped>
.pa-section-heading {
  align-items: start;
  display: grid;
  gap: 4px 10px;
  grid-template-columns: 4px minmax(0, 1fr) auto auto;
  min-width: 0;
}

.pa-section-accent {
  align-self: stretch;
  background: var(--pa-primary);
  border-radius: 999px;
  grid-row: 1 / span 2;
  min-height: 30px;
  width: 4px;
}

.pa-section-copy {
  min-width: 0;
}

.pa-section-copy h2,
.pa-section-copy p {
  margin: 0;
}

.pa-section-copy h2 {
  color: #26334b;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 850;
  letter-spacing: -0.015em;
  line-height: 1.25;
}

.pa-section-copy p {
  color: #778193;
  font-size: 0.74rem;
  font-weight: 650;
  line-height: 1.45;
  margin-top: 3px;
}

.pa-section-meta {
  color: #788294;
  font-size: 0.72rem;
  font-weight: 750;
  white-space: nowrap;
}

.pa-section-actions {
  align-items: center;
  display: flex;
}

.pa-section-heading[data-compact='true'] .pa-section-accent {
  min-height: 24px;
}

@media (max-width: 620px) {
  .pa-section-heading {
    grid-template-columns: 4px minmax(0, 1fr) auto;
  }

  .pa-section-actions {
    grid-column: 2 / -1;
  }

  .pa-section-meta {
    white-space: normal;
  }
}
</style>
