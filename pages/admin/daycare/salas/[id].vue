<template>
  <section class="stack">
    <div class="hero-panel">
      <p class="eyebrow">{{ sala?.unidad }}</p>
      <h1>{{ sala?.sala || 'Sala' }}</h1>
      <p>Panel operativo de guardería para esta sala. Cada módulo mantiene los filtros legacy por unidad, sala y tipo de recurso.</p>
    </div>

    <section class="grid grid-2">
      <NuxtLink v-for="item in modules" :key="item.to" class="module-card card" :to="item.to">
        <span class="badge">{{ item.badge }}</span>
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
      </NuxtLink>
    </section>
  </section>
</template>

<script setup lang="ts">
import type { Sala } from '~/types/daycare'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const salaId = Number(route.params.id)
const { data: sala } = await useFetch<Sala>(`/api/daycare/admin/salas/${salaId}`)

const modules = computed(() => [
  { title: 'Familias', badge: 'users', description: 'Cuentas familiares daycare: identidad, usuario, contraseña temporal, unidad y sala.', to: `/admin/daycare/salas/${salaId}/usuarios` },
  { title: 'Tareas', badge: 'hw', description: 'Publicaciones para seguimiento en casa.', to: `/admin/daycare/salas/${salaId}/tareas` },
  { title: 'Circulares', badge: 'news', description: 'Comunicados y avisos visibles para familias.', to: `/admin/daycare/salas/${salaId}/circulares` },
  { title: 'Calendario', badge: 'cal', description: 'Eventos vigentes de la sala.', to: `/admin/daycare/salas/${salaId}/calendario` }
])
</script>

<style scoped>
.module-card {
  min-height: 210px;
}
</style>
