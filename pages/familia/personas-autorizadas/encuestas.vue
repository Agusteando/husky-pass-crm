<template>
  <FamilyPersonasAutorizadasShell title="Encuestas">
    <section class="card survey-card" :class="{ unavailable: !surveyAvailable }" data-product-panel="surveys" :data-state="surveyAvailable ? 'content' : 'unavailable'">
      <header class="section-head">
        <div>
          <p class="eyebrow">Encuestas</p>
          <h1>{{ activeSurvey.title || 'Encuesta' }}</h1>
          <p>{{ surveyAvailable ? `Disponible para ${nivelLabel}.` : `Sin encuesta activa para ${nivelLabel}.` }}</p>
        </div>
        <div class="head-side">
          <FamilyPersonasAmbassador variant="help" compact decorative />
          <span class="status-pill">{{ surveyAvailable ? 'Disponible' : 'No disponible' }}</span>
        </div>
      </header>
      <iframe v-if="surveyAvailable" :src="activeSurvey.embedUrl" title="Encuesta Personas Autorizadas" loading="lazy"></iframe>
      <div v-else class="compact-empty">
        <FamilyPersonasAmbassador variant="empty" compact decorative />
        <div>
          <strong>No hay formulario publicado</strong>
          <span>Cuando el colegio active una encuesta para este nivel, aparecerá aquí.</span>
        </div>
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
const nivelLabel = computed(() => nivelLabels[config.value?.activeSurveyNivel || 'escolar'])

const nivelLabels: Record<PersonasSurveyNivelKey, string> = {
  escolar: 'Escolar',
  preescolar: 'Preescolar',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  daycare: 'Guardería'
}
</script>

<style scoped>
.survey-card { display: grid; gap: 12px; min-height: 0; }
.section-head { align-items: center; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) auto; }
.section-head h1 { margin-bottom: 8px; }
.head-side { align-items: center; display: flex; gap: 10px; justify-content: flex-end; }
.status-pill { background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 10px; color: var(--pa-primary); font-weight: 600; padding: 8px 12px; }
iframe { border: 1px solid var(--pa-border); border-radius: 12px; height: min(620px, calc(100vh - 190px));
  min-height: 360px; width: 100%; }
.compact-empty { align-items: center; background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .08), #fff); border: 1px solid var(--pa-border); border-radius: 12px; display: grid; gap: 10px; grid-template-columns: 92px minmax(0, 1fr); min-height: 132px; padding: 16px; text-align: left; }
.compact-empty strong { color: var(--pa-gray); display: block; }
.compact-empty span { color: var(--pa-muted); display: block; font-weight: 600; }
@media (max-width: 760px) { .section-head { grid-template-columns: 1fr; } .head-side { justify-content: flex-start; } .compact-empty { grid-template-columns: 64px minmax(0, 1fr); } }
</style>
