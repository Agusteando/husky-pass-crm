<template>
  <FamilyPersonasAutorizadasShell title="Encuestas">
    <section class="survey-screen">
      <FamilyPersonasPageHeader
        eyebrow="Participación"
        title="Encuestas"
        :description="surveyAvailable ? `Hay una encuesta disponible para ${nivelLabel}.` : `No hay una encuesta activa para ${nivelLabel}.`"
        :meta="surveyAvailable ? 'Disponible' : 'Sin formulario publicado'"
        ambassador-variant="help"
        :ambassador-title="surveyAvailable ? 'Tu opinión cuenta' : 'Sin pendientes por ahora'"
        :ambassador-message="surveyAvailable ? 'Completa la encuesta cuando tengas unos minutos.' : 'Te mostraremos aquí cualquier formulario activo del colegio.'"
        :ambassador-tone="surveyAvailable ? 'notice' : 'empty'"
      />

      <section class="card survey-card" :class="{ unavailable: !surveyAvailable }" data-product-panel="surveys" :data-state="surveyAvailable ? 'content' : 'unavailable'">
        <FamilyPersonasSectionHeading
          :title="activeSurvey.title || 'Encuesta'"
          :description="surveyAvailable ? 'Completa el formulario directamente en esta página.' : 'Cuando el colegio publique una encuesta para este nivel, aparecerá aquí.'"
        />
        <iframe v-if="surveyAvailable" :src="activeSurvey.embedUrl" title="Encuesta Personas Autorizadas" loading="lazy"></iframe>
        <div v-else class="compact-empty">
          <div class="compact-empty-ambassador" aria-hidden="true">
            <FamilyPersonasAmbassador variant="empty" compact contained decorative />
          </div>
          <div>
            <strong>No hay formulario publicado</strong>
            <span>No necesitas realizar ninguna acción por ahora.</span>
          </div>
        </div>
      </section>
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
.survey-screen,
.survey-card {
  display: grid;
  gap: 18px;
  min-height: 0;
}

.survey-card {
  background: rgba(255, 255, 255, 0.95);
  border-color: #e2e8ec;
  border-radius: 20px;
  padding: clamp(16px, 2vw, 22px);
}

.survey-card.unavailable {
  max-width: 900px;
}

iframe {
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  height: min(620px, calc(100vh - 240px));
  min-height: 360px;
  width: 100%;
}

.compact-empty {
  align-items: center;
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .08), #fff);
  border: 1px solid var(--pa-border);
  border-radius: 16px;
  display: grid;
  gap: 14px;
  grid-template-columns: 76px minmax(0, 1fr);
  min-height: 136px;
  overflow: hidden;
  padding: 16px;
  text-align: left;
}

.compact-empty-ambassador {
  height: 84px;
  overflow: hidden;
  width: 76px;
}

.compact-empty-ambassador :deep(.pa-ambassador-card),
.compact-empty-ambassador :deep(.pa-ambassador-visual) {
  height: 84px;
  width: 76px;
}

.compact-empty strong,
.compact-empty span {
  display: block;
}

.compact-empty strong {
  color: var(--pa-gray);
}

.compact-empty span {
  color: var(--pa-muted);
  font-size: 0.82rem;
  font-weight: 650;
  line-height: 1.5;
  margin-top: 4px;
}

@media (max-width: 620px) {
  .compact-empty {
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .compact-empty-ambassador,
  .compact-empty-ambassador :deep(.pa-ambassador-card),
  .compact-empty-ambassador :deep(.pa-ambassador-visual) {
    height: 66px;
    width: 58px;
  }
}
</style>
