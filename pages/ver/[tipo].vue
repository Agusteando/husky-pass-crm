<template>
  <section class="stack">
    <div class="screen-head">
      <div>
        <p class="eyebrow">{{ session?.user?.sala || session?.user?.scopes.daycare?.sala || 'Guardería' }}</p>
        <h1>{{ resource.label }}</h1>
        <p>{{ sectionCopy }}</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" to="/daycare">Volver al inicio</NuxtLink>
      </div>
    </div>

    <p v-if="error" class="alert">No fue posible cargar esta sección.</p>
    <div v-else-if="pending" class="card loading-card">Cargando publicaciones…</div>
    <section v-else-if="items?.length" class="resource-list" :class="{ 'calendar-list': resource.type === 'cal' }">
      <ResourceCard v-for="item in items" :key="item.id || `${item.title}-${item.date}`" :resource="item" :variant="resource.type === 'hw' ? 'homework' : 'notice'" />
    </section>
    <EmptyState v-else title="Sin publicaciones" description="No hay registros vigentes para esta sección." />
  </section>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import type { DaycareResource } from '~/types/daycare'

definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })

const route = useRoute()
const resource = useDaycareResource(String(route.params.tipo))
const { data: session } = await useFetch<PublicSession>('/api/auth/me')
const { data: items, pending, error } = await useFetch<DaycareResource[]>('/api/daycare/family/resources', {
  query: { type: resource.type }
})

const sectionCopy = computed(() => {
  if (resource.type === 'hw') return 'Tareas publicadas para la sala.'
  if (resource.type === 'news') return 'Avisos y comunicados vigentes.'
  return 'Eventos próximos del calendario mensual.'
})
</script>

<style scoped>
.resource-list {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 16px;
  padding: clamp(16px, 2.6vw, 22px);
}

.calendar-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 820px) {
  .calendar-list {
    grid-template-columns: 1fr;
  }
}
</style>
