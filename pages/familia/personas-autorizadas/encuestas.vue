<template>
  <FamilyPersonasAutorizadasShell title="Encuestas">
    <section class="card survey-card" :class="{ unavailable: !surveyAvailable }" data-product-panel="surveys" :data-state="surveyAvailable ? 'content' : 'unavailable'">
      <header class="section-head">
        <div>
          <p class="eyebrow">Encuestas</p>
          <h1>{{ activeSurvey.title || 'Encuesta' }}</h1>
          <p>{{ surveyAvailable ? `Disponible para ${nivelLabel}.` : `Sin encuesta activa para ${nivelLabel}.` }}</p>
        </div>
        <span class="status-pill">{{ surveyAvailable ? 'Disponible' : 'No disponible' }}</span>
      </header>
      <iframe v-if="surveyAvailable" :src="activeSurvey.embedUrl" title="Encuesta Personas Autorizadas" loading="lazy"></iframe>
      <div v-else class="compact-empty">
        <strong>No hay formulario publicado</strong>
        <span>Cuando el colegio active una encuesta para este nivel, aparecerá aquí.</span>
      </div>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { PersonasAutorizadasConfig, PersonasSurveyConfig, PersonasSurveyNivelKey } from '~/types/daycare'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
const { data: config } = useFetch<PersonasAutorizadasConfig>('/api/personas-autorizadas/config', { key: 'pa-survey-config', timeout: 15000 })
const emptySurvey: PersonasSurveyConfig = { enabled: false, title: 'Encuesta', embedUrl: '' }
const activeSurvey = computed(() => config.value?.activeSurvey || emptySurvey)
const surveyAvailable = computed(() => Boolean(activeSurvey.value.enabled && activeSurvey.value.embedUrl))
const nivelLabel = computed(() => nivelLabels[config.value?.activeSurveyNivel || 'daycare'])

const nivelLabels: Record<PersonasSurveyNivelKey, string> = {
  preescolar: 'Preescolar',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  daycare: 'IECS'
}
</script>

<style scoped>
.survey-card { display: grid; gap: 16px; min-height: 0; }
.section-head { align-items: center; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) auto; }
.section-head h1 { margin-bottom: 8px; }
.status-pill { background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 999px; color: var(--pa-primary); font-weight: 600; padding: 8px 12px; }
iframe { border: 1px solid var(--pa-border); border-radius: 18px; min-height: 620px; width: 100%; }
.compact-empty { align-items: center; background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .08), #fff); border: 1px solid var(--pa-border); border-radius: 18px; display: grid; gap: 4px; min-height: 180px; padding: 22px; text-align: center; }
.compact-empty strong { color: var(--pa-gray); }
.compact-empty span { color: var(--pa-muted); font-weight: 600; }
@media (max-width: 760px) { .section-head { grid-template-columns: 1fr; } }
</style>
