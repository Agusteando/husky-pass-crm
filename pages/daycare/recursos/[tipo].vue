<template>
  <section class="stack">
    <div class="section-band">
      <p class="eyebrow">{{ resource.label }}</p>
      <h1>{{ resource.label }}</h1>
    </div>
    <div class="grid grid-2" v-if="items?.length">
      <ResourceCard v-for="item in items" :key="item.id || item.title" :resource="item" />
    </div>
    <EmptyState v-else title="No hay publicaciones" description="No encontramos registros vigentes para esta sección." />
  </section>
</template>

<script setup lang="ts">
import type { DaycareResource } from '~/types/daycare'

definePageMeta({ layout: 'family', middleware: 'family' })

const route = useRoute()
const resource = useDaycareResource(String(route.params.tipo))
const { data: items } = await useFetch<DaycareResource[]>('/api/daycare/family/resources', {
  query: { type: resource.type }
})
</script>

<style scoped>
.section-band {
  background: #fff;
  border: 3px solid rgba(142, 193, 82, 0.15);
  border-radius: 30px;
  box-shadow: var(--shadow-soft);
  padding: clamp(24px, 4vw, 40px);
}
</style>
