<template>
  <section class="stack">
    <div class="sala-header">
      <div>
        <p class="eyebrow">{{ sala?.unidad }}</p>
        <h1>{{ sala?.sala || 'Sala' }}</h1>
      </div>
      <button class="btn btn-primary" type="button" @click="previewSala">Vista familiar</button>
    </div>

    <section class="module-grid">
      <NuxtLink v-for="item in modules" :key="item.to" class="module-card" :to="item.to">
        <div class="module-body">
          <h2>{{ item.title }}</h2>
          <h3>{{ item.subtitle }}</h3>
          <p>{{ item.description }}</p>
        </div>
        <div class="module-footer">{{ item.action }}</div>
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

async function previewSala() {
  await $fetch('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: salaId } })
  await navigateTo('/daycare')
}

const modules = computed(() => [
  { title: 'USUARIOS', subtitle: 'Gestiona a tus usuarios aquí', description: `Usuarios para ${sala.value?.sala || 'esta sala'}`, action: 'Nuevo', to: `/admin/daycare/salas/${salaId}/usuarios` },
  { title: 'TAREAS', subtitle: 'Publica tareas', description: `Tareas para la sala de ${sala.value?.sala || ''}`, action: 'Añadir', to: `/admin/daycare/salas/${salaId}/tareas` },
  { title: 'AVISOS', subtitle: 'Añade avisos', description: `Circulares y avisos de ${sala.value?.sala || ''}`, action: 'Nuevo', to: `/admin/daycare/salas/${salaId}/circulares` },
  { title: 'CALENDARIO', subtitle: 'Añade eventos', description: `Eventos de calendario de ${sala.value?.sala || ''}`, action: 'Nuevo', to: `/admin/daycare/salas/${salaId}/calendario` }
])
</script>

<style scoped>
.sala-header {
  align-items: center;
  background: #fff;
  border: 5px solid rgba(142, 193, 82, 0.2);
  border-radius: 30px;
  box-shadow: var(--shadow-soft);
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: clamp(24px, 4vw, 40px);
}

.sala-header div {
  text-align: left;
}

.sala-header h1 {
  margin-bottom: 0;
}

.module-grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.module-card {
  background: #fff;
  border: 5px solid rgba(142, 193, 82, 0.2);
  border-radius: 30px;
  box-shadow: var(--shadow-soft);
  display: grid;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.module-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-4px);
}

.module-body {
  display: grid;
  gap: 10px;
  min-height: 190px;
  padding: 30px;
  place-items: center;
  text-align: center;
}

.module-body h2 {
  color: #585858;
  font-family: Fredoka, Inter, sans-serif;
  font-size: 1.9rem;
  margin-bottom: 0;
}

.module-body h3,
.module-body p {
  color: #585858;
  margin-bottom: 0;
}

.module-footer {
  align-items: center;
  background: var(--color-brand-700);
  color: #fff;
  display: flex;
  font-weight: 900;
  justify-content: center;
  min-height: 48px;
  padding: 10px;
}

@media (max-width: 760px) {
  .sala-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
