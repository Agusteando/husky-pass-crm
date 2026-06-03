<template>
  <section class="stack">
    <div class="section-card">
      <p class="eyebrow">{{ session?.user?.sala }}</p>
      <h1>{{ resource.label }}</h1>
    </div>

    <section class="resource-list" v-if="items?.length">
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
const { data: items } = await useFetch<DaycareResource[]>('/api/daycare/family/resources', {
  query: { type: resource.type }
})
</script>

<style scoped>
.section-card {
  background: #fff;
  border: 3px solid rgba(142, 193, 82, 0.15);
  border-radius: 30px;
  box-shadow: var(--shadow-soft);
  padding: clamp(24px, 4vw, 38px);
  text-align: center;
}

.resource-list {
  display: grid;
  gap: 18px;
}
</style>
