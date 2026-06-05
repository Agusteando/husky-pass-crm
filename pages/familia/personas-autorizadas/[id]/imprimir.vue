<template>
  <main class="print-shell" :style="themeVars">
    <section v-if="pending || readinessPending" class="status-card" data-product-loading>
      <h1>Preparando marbete...</h1>
    </section>

    <section v-else-if="loadError || !data || readinessError || !marbeteReady" class="status-card" data-state="error">
      <h1>Marbete no disponible</h1>
      <p>{{ marbeteMessage }}</p>
      <NuxtLink class="btn btn-secondary no-print" to="/familia/personas-autorizadas">Volver</NuxtLink>
    </section>

    <section v-else class="print-card" data-product-panel="marbete-print" data-state="content">
      <div class="print-actions no-print">
        <strong>{{ fullName }}</strong>
        <span>{{ templateContext }}</span>
        <a v-if="marbeteReady" class="btn btn-primary" :href="downloadUrl">Descargar</a>
      </div>
      <iframe ref="frame" :src="previewUrl" title="Marbete imprimible" @load="printFrame"></iframe>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { MarbeteReadinessResponse, PrintableAuthorizedPerson } from '~/types/daycare'
import { usePersonasFamilyTheme, useResolvedPersonasTheme } from '~/composables/usePersonasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const familyTheme = usePersonasFamilyTheme({ key: `pa-printable-${route.params.id}` })
const frame = ref<HTMLIFrameElement | null>(null)
const { data, pending, error: loadError } = useFetch<PrintableAuthorizedPerson>('/api/personas-autorizadas/credential', { query: { id: route.params.id }, timeout: 15000 })
const { data: readiness, pending: readinessPending, error: readinessError } = useFetch<MarbeteReadinessResponse>('/api/personas-autorizadas/marbete', {
  key: `pa-print-marbete-readiness-${route.params.id}`,
  query: { id: route.params.id, format: 'readiness' },
  timeout: 20000
})
const { themeVars } = useResolvedPersonasTheme(() => ({
  matricula: data.value?.matricula || data.value?.child?.matricula || familyTheme.primaryChild.value?.matricula || familyTheme.session.value?.user?.username,
  plantel: data.value?.plantel || familyTheme.primaryChild.value?.plantel || familyTheme.session.value?.user?.plantel?.[0],
  nivelEdu: data.value?.nivelEdu || familyTheme.primaryChild.value?.nivelEdu,
  campus: data.value?.child?.campus || familyTheme.primaryChild.value?.campus || familyTheme.session.value?.user?.campus
}))
const fullName = computed(() => [data.value?.nombreP, data.value?.paternoP, data.value?.maternoP].filter(Boolean).join(' '))
const templateContext = computed(() => [data.value?.plantel, data.value?.nivelEdu, data.value?.gradoA, data.value?.grupoA].filter(Boolean).join(' / ') || 'Plantilla institucional')
const marbeteReady = computed(() => Boolean(readiness.value?.ok))
const marbeteMessage = computed(() => {
  if (loadError.value || !data.value) return 'No encontramos esta persona autorizada dentro de tu cuenta.'
  if (readinessPending.value) return 'Validando datos e imágenes del marbete.'
  if (readinessError.value) return 'No fue posible validar los datos e imágenes del marbete.'
  return readiness.value?.ok ? 'Marbete listo para imprimir.' : readiness.value?.issues?.[0] || 'Marbete no disponible.'
})
const previewUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}`)
const downloadUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&download=1`)

function printFrame() {
  if (!marbeteReady.value) return
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
