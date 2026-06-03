<template>
  <section class="stack">
    <div class="workspace-head compact-head">
      <div>
        <p class="eyebrow">Guardería</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <NuxtLink class="btn btn-secondary" to="/familia/daycare">Inicio</NuxtLink>
    </div>

    <p v-if="error" class="alert">No fue posible cargar esta sección.</p>
    <div v-else-if="pending" class="card loading-card">Cargando publicaciones…</div>
    <section v-else-if="items?.length" class="resource-list" :class="{ 'calendar-list': type === 'cal' }">
      <ResourceCard v-for="item in items" :key="item.id || `${item.title}-${item.date}`" :resource="item" :variant="type === 'hw' ? 'homework' : 'notice'" />
    </section>
    <EmptyState v-else title="Sin publicaciones" description="No hay registros vigentes para esta sección." />
  </section>
</template>

<script setup lang="ts">
import { useFetch } from 'nuxt/app'
import type { DaycareResource } from '~/types/daycare'

const props = defineProps<{
  type: 'hw' | 'news' | 'cal'
  title: string
  description: string
}>()

const { data: items, pending, error } = useFetch<DaycareResource[]>('/api/daycare/family/resources', {
  query: { type: props.type }
})
</script>

<style scoped>
.resource-list {
  display: grid;
  gap: 12px;
}

.calendar-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 760px) {
  .calendar-list {
    grid-template-columns: 1fr;
  }
}
</style>
