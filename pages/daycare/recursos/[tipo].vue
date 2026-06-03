<template>
  <section class="stack">
    <div class="hero-panel">
      <p class="eyebrow">{{ resource.label }}</p>
      <h1>{{ resource.label }} de la sala</h1>
      <p>Publicaciones vigentes para tu cuenta familiar, filtradas por la unidad y sala asignadas en la base MySQL actual.</p>
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
