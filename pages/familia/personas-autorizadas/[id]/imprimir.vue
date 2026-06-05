<template>
  <main class="print-shell" :style="themeVars">
    <section v-if="pending" class="status-card" data-product-loading>
      <h1>Preparando marbete...</h1>
    </section>

    <section v-else-if="loadError || !data" class="status-card" data-state="error">
      <h1>Marbete no disponible</h1>
      <p>No encontramos esta persona autorizada dentro de tu cuenta.</p>
      <NuxtLink class="btn btn-secondary no-print" to="/familia/personas-autorizadas">Volver</NuxtLink>
    </section>

    <section v-else class="print-card" data-product-panel="marbete-print" data-state="content">
      <div class="print-actions no-print">
        <strong>{{ fullName }}</strong>
        <span>{{ templateContext }}</span>
        <a class="btn btn-primary" :href="downloadUrl">Descargar</a>
      </div>
      <iframe ref="frame" :src="previewUrl" title="Marbete imprimible" @load="printFrame"></iframe>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { PrintableAuthorizedPerson } from '~/types/daycare'
import { personasThemeStyle, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const frame = ref<HTMLIFrameElement | null>(null)
const { data, pending, error: loadError } = useFetch<PrintableAuthorizedPerson>('/api/personas-autorizadas/credential', { query: { id: route.params.id }, timeout: 15000 })
const theme = computed(() => resolvePersonasTheme({
  matricula: data.value?.matricula || data.value?.child?.matricula,
  plantel: data.value?.plantel,
  nivelEdu: data.value?.nivelEdu,
  campus: data.value?.child?.campus
}))
const themeVars = computed(() => personasThemeStyle(theme.value))
const fullName = computed(() => [data.value?.nombreP, data.value?.paternoP, data.value?.maternoP].filter(Boolean).join(' '))
const templateContext = computed(() => [data.value?.plantel, data.value?.nivelEdu, data.value?.gradoA, data.value?.grupoA].filter(Boolean).join(' / ') || 'Plantilla institucional')
const previewUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}`)
const downloadUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&download=1`)

function printFrame() {
  setTimeout(() => {
    frame.value?.contentWindow?.focus()
    frame.value?.contentWindow?.print()
  }, 250)
}
</script>

<style scoped>
.print-shell {
  --pa-primary: #618b2f;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  --pa-gray: #50535a;
  background: #fff;
  display: grid;
  min-height: 100vh;
  padding: 14px;
  place-items: center;
}

.status-card,
.print-card {
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 12px;
  padding: 14px;
  width: min(100%, 740px);
}

.status-card {
  justify-items: center;
  text-align: center;
}

.print-actions {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 16px;
  display: grid;
  gap: 4px 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 10px;
}

.print-actions strong,
.print-actions span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.print-actions span {
  color: var(--pa-gray);
  font-size: 0.86rem;
}

iframe {
  aspect-ratio: 612 / 792;
  border: 0;
  width: 100%;
}

@media print {
  .print-shell,
  .print-card {
    border: 0;
    box-shadow: none;
    padding: 0;
  }

  .no-print {
    display: none;
  }

  iframe {
    height: 100vh;
  }
}

@media (max-width: 640px) {
  .print-actions {
    grid-template-columns: 1fr;
  }
}
</style>
