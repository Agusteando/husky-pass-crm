<template>
  <FamilyPersonasAutorizadasShell title="Marbete">
    <section class="marbete-page stack" :style="themeVars" data-product-area="personas-autorizadas" data-product-screen="marbete">
    <header class="marbete-head">
      <div>
        <p class="eyebrow">Marbete</p>
        <h1>{{ fullName || 'Persona autorizada' }}</h1>
        <p>{{ templateContext }}</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${route.params.id}`">Volver</NuxtLink>
        <a v-if="downloadAvailable" class="btn btn-primary" :href="downloadUrl" data-diagnostic-link="descargar-marbete">Descargar PDF</a>
        <button v-else class="btn btn-secondary" type="button" disabled>{{ readinessMessage }}</button>
      </div>
    </header>

    <p v-if="loadError || readinessError" class="alert" data-state="error">{{ readinessMessage || 'No fue posible cargar el marbete.' }}</p>
    <div v-else-if="pending || readinessPending" class="preview-state" data-product-loading data-state="loading">
      <span></span>
      <strong>Generando vista...</strong>
    </div>

    <section v-else-if="downloadAvailable" class="preview-shell" data-product-panel="marbete-preview" data-state="content">
      <iframe :src="previewUrl" title="Vista previa de marbete"></iframe>
      <div class="download-ready">
        <span>PDF listo para imprimir</span>
        <strong>{{ theme.label }}</strong>
      </div>
    </section>

    <section v-else class="preview-state unavailable" data-product-panel="marbete-preview" data-state="unavailable">
      <strong>Marbete no disponible</strong>
      <p>{{ readinessMessage }}</p>
    </section>
  </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { MarbeteReadinessResponse, PrintableAuthorizedPerson } from '~/types/daycare'
import { usePersonasFamilyTheme, useResolvedPersonasTheme } from '~/composables/usePersonasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const familyTheme = usePersonasFamilyTheme({ key: `pa-marbete-${route.params.id}` })
const { data, pending, error: loadError } = useFetch<PrintableAuthorizedPerson>('/api/personas-autorizadas/credential', { query: { id: route.params.id }, timeout: 15000 })
const { data: readiness, pending: readinessPending, error: readinessError } = useFetch<MarbeteReadinessResponse>('/api/personas-autorizadas/marbete', {
  key: `pa-marbete-readiness-${route.params.id}`,
  query: { id: route.params.id, format: 'readiness' },
  timeout: 20000
})
const { theme, themeVars } = useResolvedPersonasTheme(() => ({
  matricula: data.value?.matricula || data.value?.child?.matricula || familyTheme.primaryChild.value?.matricula || familyTheme.session.value?.user?.username,
  plantel: data.value?.plantel || familyTheme.primaryChild.value?.plantel || familyTheme.session.value?.user?.plantel?.[0],
  nivelEdu: data.value?.nivelEdu || data.value?.child?.nivelEdu || familyTheme.primaryChild.value?.nivelEdu,
  campus: data.value?.child?.campus || familyTheme.primaryChild.value?.campus || familyTheme.session.value?.user?.campus
}))
const fullName = computed(() => [data.value?.nombreP, data.value?.paternoP, data.value?.maternoP].filter(Boolean).join(' '))
const templateContext = computed(() => [data.value?.plantel, data.value?.nivelEdu, data.value?.gradoA, data.value?.grupoA].filter(Boolean).join(' / ') || 'Plantilla institucional')
const previewUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&format=svg-preview`)
const downloadUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&download=1`)
const downloadAvailable = computed(() => Boolean(readiness.value?.ok))
const readinessMessage = computed(() => readiness.value?.issues?.[0] || (readinessError.value ? 'No fue posible validar los datos e imágenes del marbete.' : 'Validando datos e imágenes del marbete…'))
</script>

<style scoped>
.marbete-page {
  --pa-primary: #618b2f;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  --pa-gray: #50535a;
  --pa-muted: #86888c;
}

.marbete-head,
.preview-shell,
.preview-state {
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
}

.marbete-head {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: clamp(14px, 2.4vw, 20px);
}

.marbete-head h1 {
  color: var(--pa-gray);
  font-size: clamp(1.55rem, 3vw, 2.25rem);
  margin-bottom: 6px;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-state {
  align-items: center;
  display: flex;
  gap: 12px;
  padding: 16px;
}

.preview-state.unavailable {
  align-items: start;
  display: grid;
}

.preview-state.unavailable p {
  color: var(--pa-muted);
  font-weight: 600;
  margin: 0;
}

.preview-state span {
  animation: pulse 0.9s ease-in-out infinite alternate;
  background: var(--pa-primary);
  border-radius: 999px;
  height: 14px;
  width: 14px;
}

.preview-shell {
  display: grid;
  gap: 12px;
  padding: 12px;
}

iframe {
  aspect-ratio: 612 / 792;
  background: #f8f8f7;
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  min-height: 560px;
  width: 100%;
}

.download-ready {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding: 10px 12px;
}

.download-ready span {
  color: var(--pa-muted);
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.download-ready strong {
  color: var(--pa-gray);
}

@keyframes pulse {
  from { opacity: 0.35; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 760px) {
  .marbete-head {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .head-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  iframe {
    min-height: 420px;
  }
}
</style>
