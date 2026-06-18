<template>
  <FamilyPersonasAutorizadasShell title="Husky Pass">
    <section class="pass-page" :style="themeVars" data-product-area="personas-autorizadas" data-product-screen="husky-pass">
      <header class="pass-head">
        <div>
          <p class="eyebrow">Husky Pass</p>
          <h1>{{ fullName || 'Persona autorizada' }}</h1>
          <p>{{ passContext }}</p>
        </div>
        <FamilyPersonasAmbassador class="pass-ambassador" :theme="theme" variant="preview" compact decorative />
        <div class="head-actions">
          <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${route.params.id}`">Volver</NuxtLink>
          <button
            v-if="downloadAvailable"
            class="btn btn-primary pa-primary"
            type="button"
            :disabled="downloading"
            data-diagnostic-action="descargar-husky-pass"
            @click="downloadHuskyPass"
          >
            {{ downloading ? 'Preparando...' : 'Descargar Husky Pass' }}
          </button>
          <button v-else class="btn btn-secondary" type="button" disabled>{{ readinessMessage }}</button>
        </div>
      </header>

      <p v-if="downloadError" class="alert" data-state="error">{{ downloadError }}</p>
      <p v-if="loadError || readinessError" class="alert" data-state="error">{{ readinessMessage || 'No fue posible cargar el Husky Pass.' }}</p>
      <div v-else-if="pending || readinessPending" class="preview-state" data-product-loading data-state="loading">
        <span></span>
        <strong>Generando vista...</strong>
      </div>

      <section v-else-if="downloadAvailable" class="preview-shell" data-product-panel="husky-pass-preview" data-state="content">
        <iframe :src="previewUrl" title="Vista previa de Husky Pass"></iframe>
        <div class="download-ready">
          <span>Listo para descargar</span>
          <strong>{{ theme.label }}</strong>
        </div>
      </section>

      <section v-else class="preview-state unavailable" data-product-panel="husky-pass-preview" data-state="unavailable">
        <FamilyPersonasAmbassador :theme="theme" variant="empty" compact decorative />
        <div>
          <strong>Husky Pass no disponible</strong>
          <p>{{ readinessMessage }}</p>
        </div>
      </section>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { MarbeteReadinessResponse, PrintableAuthorizedPerson } from '~/types/daycare'
import { usePersonasFamilyTheme, useResolvedPersonasTheme } from '~/composables/usePersonasTheme'
import { displayMatricula } from '~/utils/matricula'

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
const passContext = computed(() => [displayMatricula(data.value?.matricula || data.value?.child?.matricula), data.value?.plantel, data.value?.nivelEdu, data.value?.gradoA, data.value?.grupoA].filter(Boolean).join(' / ') || 'Datos escolares')
const previewUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&format=svg-preview`)
const downloadUrl = computed(() => `/api/personas-autorizadas/marbete?id=${route.params.id}&download=1`)
const downloading = ref(false)
const downloadError = ref('')
const downloadAvailable = computed(() => Boolean(readiness.value?.ok))
const readinessMessage = computed(() => friendlyReadinessMessage(readiness.value?.issues?.[0], Boolean(readinessError.value)))

function friendlyReadinessMessage(message?: string | null, hasError = false) {
  const value = String(message || '').toLowerCase()
  if (value.includes('foto') || value.includes('imagen') || value.includes('image')) return 'Actualiza la foto para descargar el Husky Pass o solicita apoyo a la escuela.'
  if (value.includes('dato') || value.includes('nombre') || value.includes('parentesco') || value.includes('matr')) return 'Completa los datos solicitados para descargar el Husky Pass.'
  if (hasError) return 'No pudimos validar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.'
  return 'Validando datos del Husky Pass...'
}

async function downloadHuskyPass() {
  if (downloading.value || !downloadAvailable.value) return
  downloadError.value = ''
  downloading.value = true
  try {
    const response = await fetch(downloadUrl.value, { credentials: 'include' })
    if (!response.ok) {
      const message = await response.text().catch(() => '')
      throw new Error(friendlyReadinessMessage(message, true))
    }
    const blob = await response.blob()
    if (!blob.size || !response.headers.get('content-type')?.toLowerCase().includes('pdf')) {
      throw new Error('No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.')
    }
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `husky-pass-${String(route.params.id)}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } catch (err: unknown) {
    downloadError.value = err instanceof Error ? err.message : 'No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.'
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.pass-page {
  --pa-primary: #618b2f;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  --pa-gray: #50535a;
  --pa-muted: #86888c;
  display: grid;
  gap: 12px;
}

.pass-head,
.preview-shell,
.preview-state {
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  box-shadow: var(--shadow-soft);
}

.pass-head {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: clamp(12px, 2vw, 16px);
}

.pass-head h1,
.pass-head p {
  margin-bottom: 0;
}
.pass-ambassador {
  justify-self: center;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.pa-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
}

.preview-state {
  align-items: center;
  display: flex;
  gap: 12px;
  padding: 12px;
}

.preview-state.unavailable {
  align-items: center;
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
}

.preview-state.unavailable p {
  color: var(--pa-muted);
  font-weight: 700;
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
  border-radius: 12px;
  height: min(540px, calc(100vh - 220px));
  min-height: 360px;
  width: 100%;
}

.download-ready {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 12px;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding: 10px 12px;
}

.download-ready span {
  color: var(--pa-muted);
  font-size: 0.76rem;
  font-weight: 800;
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
  .pass-head {
    align-items: stretch;
    grid-template-columns: 1fr;
  }
  .pass-ambassador {
    justify-self: start;
  }
  .preview-state.unavailable {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .head-actions {
    justify-content: stretch;
  }

  .head-actions .btn {
    flex: 1 1 150px;
  }

  iframe {
    height: min(420px, calc(100vh - 190px));
    min-height: 320px;
  }
}
</style>
