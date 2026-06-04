<template>
  <FamilyPersonasAutorizadasShell title="Encuestas">
    <section class="card survey-card" :class="{ unavailable: !surveyAvailable }" data-product-panel="surveys" :data-state="surveyAvailable ? 'content' : 'unavailable'">
      <header class="section-head">
        <div>
          <p class="eyebrow">Encuestas</p>
          <h1>{{ config?.survey.title || 'Encuesta Personas Autorizadas' }}</h1>
          <p>{{ surveyAvailable ? 'Formulario institucional disponible.' : 'No hay encuesta activa en este momento.' }}</p>
        </div>
        <span class="status-pill">{{ surveyAvailable ? 'Disponible' : 'No disponible' }}</span>
      </header>
      <iframe v-if="surveyAvailable" :src="config?.survey.embedUrl" title="Encuesta Personas Autorizadas" loading="lazy"></iframe>
      <button v-else class="btn btn-secondary" type="button" disabled data-unavailable-reason="Sin formulario publicado">Pendiente de publicación</button>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { PersonasAutorizadasConfig } from '~/types/daycare'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const { data: config } = useFetch<PersonasAutorizadasConfig>('/api/personas-autorizadas/config', { key: 'pa-survey-config', timeout: 15000 })
const surveyAvailable = computed(() => Boolean(config.value?.survey.enabled && config.value?.survey.embedUrl))
</script>

<style scoped>
.survey-card { display: grid; gap: 16px; }
.section-head { align-items: center; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) auto; }
.section-head h1 { margin-bottom: 8px; }
.status-pill { background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 999px; color: var(--pa-primary); font-weight: 950; padding: 8px 12px; }
iframe { border: 1px solid var(--pa-border); border-radius: 18px; min-height: 680px; width: 100%; }
@media (max-width: 760px) { .section-head { grid-template-columns: 1fr; } }
</style>
