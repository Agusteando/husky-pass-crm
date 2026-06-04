<template>
  <section class="marbete-page stack" :style="themeVars" data-product-area="personas-autorizadas" data-product-screen="marbete">
    <header class="marbete-head">
      <div>
        <p class="eyebrow">Marbete</p>
        <h1>{{ fullName || 'Persona autorizada' }}</h1>
        <p>{{ templateContext }}</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${route.params.id}`">Volver</NuxtLink>
        <a class="btn btn-primary" :href="downloadUrl" data-diagnostic-link="descargar-marbete">Descargar marbete</a>
      </div>
    </header>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar el marbete.</p>
    <div v-else-if="pending" class="preview-state" data-product-loading data-state="loading">
      <span></span>
      <strong>Generando vista...</strong>
    </div>

    <section v-else class="preview-shell" data-product-panel="marbete-preview" data-state="content">
      <iframe :src="previewUrl" title="Vista previa de marbete"></iframe>
      <div class="download-ready">
        <span>Listo para descargar</span>
        <strong>{{ theme.label }}</strong>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { PrintableAuthorizedPerson } from '~/types/daycare'
import { personasThemeStyle, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: 'family', middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const { data, pending, error: loadError } = useFetch<PrintableAuthorizedPerson>('/api/personas-autorizadas/credential', { query: { id: route.params.id }, timeout: 15000 })
const theme = computed(() => resolvePersonasTheme({ plantel: data.value?.plantel, nivelEdu: data.value?.nivelEdu, campus: data.value?.child?.campus }))
const themeVars = computed(() => personasThemeStyle(theme.value))
const fullName = computed(() => [data.value?.nombreP, data.value?.paternoP, data.value?.maternoP].filter(Boolean).join(' '))
const templateContext = computed(() => [data.value?.plantel, data.value?.nivelEdu, data.value?.gradoA, data.value?.grupoA].filter(Boolean).join(' / ') || 'Plantilla institucional')
const previewUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}`)
const downloadUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&download=1`)
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
