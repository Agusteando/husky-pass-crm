<template>
  <main class="dev-pass-page" data-product-area="dev-husky-pass" :data-state="pending ? 'loading' : loadError ? 'error' : 'content'">
    <header class="dev-pass-head">
      <div>
        <p class="eyebrow">Dev harness</p>
        <h1>Husky Pass PDF Lab</h1>
      </div>
      <nav class="dev-links" aria-label="Dev shortcuts">
        <NuxtLink to="/__dev/personas-modals">Modales PA</NuxtLink>
        <NuxtLink to="/__dev/marbete-editor">Editor visual</NuxtLink>
        <a :href="pdfUrl" target="_blank" rel="noopener" data-diagnostic-action="dev-open-pdf">Abrir PDF</a>
        <a :href="downloadUrl" data-diagnostic-action="dev-download-pdf">Descargar</a>
      </nav>
    </header>

    <section class="dev-controls" aria-label="Fixture controls">
      <label>
        Variante
        <select v-model="variant" data-diagnostic-field="dev-pass-variant">
          <option v-for="option in options?.variants || []" :key="option.id" :value="option.id">{{ option.label }}</option>
        </select>
      </label>
      <label>
        Estado
        <select v-model="scenario" data-diagnostic-field="dev-pass-scenario">
          <option v-for="option in options?.scenarios || []" :key="option.id" :value="option.id">{{ option.label }}</option>
        </select>
      </label>
      <label>
        Vista
        <select v-model="panel" data-diagnostic-field="dev-pass-panel">
          <option value="compare">Comparar</option>
          <option value="svg">SVG</option>
          <option value="pdf">PDF</option>
          <option value="diagnostics">Diagnostico</option>
        </select>
      </label>
    </section>

    <p v-if="loadError" class="dev-alert">No fue posible cargar fixtures dev.</p>
    <div v-else-if="pending" class="dev-loading">Cargando fixtures...</div>

    <section v-else class="dev-summary" data-product-panel="dev-pass-summary">
      <article>
        <span>Plantel</span>
        <strong>{{ selectedVariant?.plantel }}</strong>
      </article>
      <article>
        <span>Nivel</span>
        <strong>{{ selectedVariant?.nivelEdu }}</strong>
      </article>
      <article>
        <span>Plantilla esperada</span>
        <strong>{{ diagnostics?.template?.id || selectedVariant?.expectedTemplateId }}</strong>
      </article>
      <article :class="{ ok: diagnostics?.selectedExpectedTemplate, warn: diagnostics && !diagnostics.selectedExpectedTemplate }">
        <span>Seleccion</span>
        <strong>{{ diagnostics?.selectedExpectedTemplate === false ? 'Revisar' : 'OK' }}</strong>
      </article>
    </section>

    <section v-if="panel === 'diagnostics'" class="dev-diagnostics" data-product-panel="dev-pass-diagnostics">
      <pre>{{ formattedDiagnostics }}</pre>
    </section>

    <section v-else class="preview-grid" :class="`mode-${panel}`" data-product-panel="dev-pass-preview">
      <article v-if="panel !== 'pdf'" class="preview-pane">
        <header>
          <span>Browser SVG</span>
          <a :href="svgUrl" target="_blank" rel="noopener">Abrir</a>
        </header>
        <iframe class="svg-frame" :src="svgUrl" title="Vista previa SVG Husky Pass" data-diagnostic-preview="svg"></iframe>
      </article>
      <article v-if="panel !== 'svg'" class="preview-pane pdf-pane">
        <header>
          <span>PDF final</span>
          <a :href="pdfUrl" target="_blank" rel="noopener">Abrir</a>
        </header>
        <iframe :src="pdfUrl" title="PDF final Husky Pass" data-diagnostic-preview="pdf"></iframe>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { MarbeteTemplateMeta, PersonasTheme } from '~/types/daycare'

if (process.env.NODE_ENV === 'production') {
  throw createError({ statusCode: 404, statusMessage: 'Ruta no disponible.' })
}

interface DevOptions {
  variants: Array<{ id: string; label: string; plantel: string; nivelEdu: string; expectedTemplateId: string }>
  scenarios: Array<{ id: string; label: string; description: string }>
  templates: MarbeteTemplateMeta[]
  themes: PersonasTheme[]
}

interface DevDiagnostics {
  ok: boolean
  selectedExpectedTemplate: boolean
  template?: MarbeteTemplateMeta
  values?: Record<string, string>
}

definePageMeta({ layout: false, middleware: 'dev-only' })

const route = useRoute()
const router = useRouter()
const { data: options, pending, error: loadError } = useFetch<DevOptions>('/api/dev/husky-pass/options', { timeout: 15000 })

const variant = ref(typeof route.query.variant === 'string' ? route.query.variant : 'guarderia-cm')
const scenario = ref(typeof route.query.scenario === 'string' ? route.query.scenario : 'default')
const panel = ref(typeof route.query.panel === 'string' ? route.query.panel : 'compare')

const passQuery = computed(() => `variant=${encodeURIComponent(variant.value)}&scenario=${encodeURIComponent(scenario.value)}`)
const svgUrl = computed(() => `/api/dev/husky-pass/pass?${passQuery.value}&format=svg-preview`)
const pdfUrl = computed(() => `/api/dev/husky-pass/pass?${passQuery.value}&format=pdf`)
const downloadUrl = computed(() => `${pdfUrl.value}&download=1`)
const diagnosticsUrl = computed(() => `/api/dev/husky-pass/pass?${passQuery.value}&format=diagnostics`)
const { data: diagnostics, refresh: refreshDiagnostics } = useFetch<DevDiagnostics>(diagnosticsUrl, {
  watch: [diagnosticsUrl],
  timeout: 30000,
  dedupe: 'cancel'
})

const selectedVariant = computed(() => options.value?.variants.find((item) => item.id === variant.value) || options.value?.variants[0])
const formattedDiagnostics = computed(() => JSON.stringify(diagnostics.value || {}, null, 2))

watch(options, (value) => {
  if (!value) return
  if (!value.variants.some((item) => item.id === variant.value)) variant.value = value.variants[0]?.id || 'guarderia-cm'
  if (!value.scenarios.some((item) => item.id === scenario.value)) scenario.value = value.scenarios[0]?.id || 'default'
}, { immediate: true })

watch([variant, scenario, panel], () => {
  if (!import.meta.client) return
  router.replace({
    path: route.path,
    query: {
      variant: variant.value,
      scenario: scenario.value,
      panel: panel.value
    }
  })
  void refreshDiagnostics()
})
</script>

<style scoped>
.dev-pass-page {
  background: #f6f8fb;
  color: #1e2530;
  display: grid;
  gap: 14px;
  min-height: 100vh;
  padding: 16px;
}

.dev-pass-head {
  align-items: end;
  background: #fff;
  border: 1px solid #dce3ec;
  border-radius: 8px;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 14px;
}

.dev-pass-head h1,
.dev-pass-head p {
  margin: 0;
}

.eyebrow {
  color: #516175;
  font-size: .75rem;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.dev-links,
.dev-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dev-links a,
.dev-links :deep(a) {
  background: #1f6f9f;
  border-radius: 7px;
  color: #fff;
  font-weight: 700;
  padding: 9px 12px;
  text-decoration: none;
}

.dev-controls {
  align-items: end;
  background: #fff;
  border: 1px solid #dce3ec;
  border-radius: 8px;
  padding: 12px;
}

.dev-controls label {
  color: #516175;
  display: grid;
  flex: 1 1 220px;
  font-size: .78rem;
  font-weight: 700;
  gap: 6px;
  text-transform: uppercase;
}

.dev-controls select {
  border: 1px solid #ccd6e0;
  border-radius: 7px;
  color: #1e2530;
  min-height: 38px;
  padding: 8px 10px;
  text-transform: none;
}

.dev-summary {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.dev-summary article {
  background: #fff;
  border: 1px solid #dce3ec;
  border-radius: 8px;
  display: grid;
  gap: 4px;
  padding: 10px 12px;
}

.dev-summary span {
  color: #667386;
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.dev-summary strong {
  font-size: 1rem;
}

.dev-summary .ok strong {
  color: #247a45;
}

.dev-summary .warn strong {
  color: #a24b2a;
}

.preview-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 480px) minmax(0, 1fr);
}

.preview-grid.mode-svg,
.preview-grid.mode-pdf {
  grid-template-columns: minmax(0, 760px);
}

.preview-pane,
.dev-diagnostics {
  background: #fff;
  border: 1px solid #dce3ec;
  border-radius: 8px;
  overflow: hidden;
}

.preview-pane header {
  align-items: center;
  border-bottom: 1px solid #e6ecf2;
  display: flex;
  justify-content: space-between;
  padding: 9px 12px;
}

.preview-pane header a {
  color: #1f6f9f;
  font-size: .82rem;
  font-weight: 700;
}

.preview-pane img,
.svg-frame {
  background: #fff;
  border: 0;
  display: block;
  min-height: min(78vh, 920px);
  width: 100%;
}

.pdf-pane iframe {
  border: 0;
  display: block;
  height: min(78vh, 920px);
  width: 100%;
}

.dev-diagnostics pre {
  margin: 0;
  overflow: auto;
  padding: 14px;
  white-space: pre-wrap;
}

.dev-alert,
.dev-loading {
  background: #fff;
  border: 1px solid #dce3ec;
  border-radius: 8px;
  margin: 0;
  padding: 12px;
}

@media (max-width: 980px) {
  .dev-pass-head,
  .preview-grid,
  .dev-summary {
    grid-template-columns: 1fr;
  }
}
</style>
