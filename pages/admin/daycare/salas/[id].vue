<template>
  <section class="stack">
    <div class="screen-head sala-header">
      <div>
        <p class="eyebrow">{{ sala?.unidad || 'Guardería' }}</p>
        <h1>{{ sala?.sala || 'Sala' }}</h1>
        <p>Gestiona el contenido que verán las familias de esta sala.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn-primary" type="button" @click="previewSala">Vista familiar</button>
      </div>
    </div>

    <section class="module-grid">
      <NuxtLink v-for="module in modules" :key="module.to" :to="module.to" class="module-card">
        <div class="module-body">
          <span class="module-icon">{{ module.icon }}</span>
          <div>
            <h2>{{ module.title }}</h2>
            <h3>{{ module.subtitle }}</h3>
            <p>{{ module.description }}</p>
          </div>
        </div>
        <div class="module-footer">{{ module.action }}</div>
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
  { icon: 'US', title: 'USUARIOS', subtitle: 'Gestiona usuarios', description: `Usuarios para ${sala.value?.sala || 'esta sala'}`, action: 'Abrir usuarios', to: `/admin/daycare/salas/${salaId}/usuarios` },
  { icon: 'TA', title: 'TAREAS', subtitle: 'Publica tareas', description: `Tareas para ${sala.value?.sala || 'esta sala'}`, action: 'Abrir tareas', to: `/admin/daycare/salas/${salaId}/tareas` },
  { icon: 'AV', title: 'AVISOS', subtitle: 'Añade avisos', description: `Circulares y avisos de ${sala.value?.sala || 'esta sala'}`, action: 'Abrir avisos', to: `/admin/daycare/salas/${salaId}/circulares` },
  { icon: 'CA', title: 'CALENDARIO', subtitle: 'Añade eventos', description: `Eventos de ${sala.value?.sala || 'esta sala'}`, action: 'Abrir calendario', to: `/admin/daycare/salas/${salaId}/calendario` }
])
</script>

<style scoped>
.module-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.module-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
  display: grid;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.module-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-3px);
}

.module-body {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: 58px minmax(0, 1fr);
  min-height: 146px;
  padding: 20px;
}

.module-icon {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  color: var(--color-brand-800);
  display: grid;
  font-weight: 900;
  height: 58px;
  place-items: center;
  width: 58px;
}

.module-body h2 {
  color: #585858;
  font-family: Fredoka, Inter, sans-serif;
  font-size: 1.45rem;
  margin-bottom: 2px;
}

.module-body h3,
.module-body p {
  color: #585858;
  margin-bottom: 0;
}

.module-body h3 {
  font-size: 1rem;
}

.module-footer {
  align-items: center;
  background: var(--color-brand-700);
  color: #fff;
  display: flex;
  font-weight: 900;
  justify-content: center;
  min-height: 42px;
  padding: 8px 10px;
}

@media (max-width: 720px) {
  .module-grid {
    grid-template-columns: 1fr;
  }

  .module-body {
    min-height: 0;
  }
}
</style>
