<template>
  <section class="pass-admin" data-product-area="superadmin" data-product-screen="husky-pass-desk">
    <header class="workspace-head compact-head pass-head">
      <div>
        <p class="eyebrow">Accesos</p>
        <h1>Pases</h1>
        <p>Credenciales de personas autorizadas.</p>
      </div>
      <span class="pass-count">{{ passRows.length }} registros</span>
    </header>

    <section class="pass-search-strip">
      <label class="search-box">
        <span>Buscar</span>
        <input v-model="search" class="input" type="search" placeholder="Alumno, persona, matrícula, correo o ID" data-diagnostic-filter="pass-search" />
      </label>
      <label>
        <span>Plantel</span>
        <select v-model="selectedPlantel" class="select" data-diagnostic-filter="pass-plantel">
          <option value="">Todos</option>
          <option v-for="plantel in passSearch?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
        </select>
      </label>
      <label>
        <span>Nivel</span>
        <select v-model="selectedNivel" class="select" data-diagnostic-filter="pass-nivel">
          <option value="">Todos</option>
          <option v-for="nivel in passSearch?.niveles || []" :key="nivel" :value="nivel">{{ nivel }}</option>
        </select>
      </label>
      <button class="btn btn-primary" type="button" :disabled="passPending" data-diagnostic-action="pass-refresh" @click="refreshPassSearch">
        {{ passPending ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </section>

    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <p v-if="actionNotice" class="notice">{{ actionNotice }}</p>

    <section class="pass-layout">
      <article class="pass-results" data-product-panel="pass-results" :data-state="passState">
        <header class="section-head">
          <div>
            <p class="eyebrow">Resultados</p>
            <h2>{{ passRows.length }} registros</h2>
          </div>
          <span class="muted">{{ passStatusLabel }}</span>
        </header>

        <div v-if="passPending && !passRows.length" class="loading-row" data-state="loading">Cargando pases...</div>
        <p v-else-if="passError" class="alert">No fue posible cargar los pases.</p>
        <EmptyState v-else-if="!passRows.length" title="Sin resultados" description="No hay coincidencias para los filtros actuales." />

        <div v-else class="result-list">
          <button
            v-for="row in passRows"
            :key="`${row.personId}-${row.userId}`"
            class="result-row"
            :class="{ selected: selectedPass?.personId === row.personId }"
            :style="{ '--row-color': row.theme.primary }"
            type="button"
            data-diagnostic-action="select-pass-candidate"
            @click="selectPass(row)"
          >
            <span class="row-status" :data-ready="row.readiness.ok"></span>
            <span class="row-main">
              <strong>{{ row.authorizedName }}</strong>
              <small>{{ row.studentName }} / {{ displayMatriculaCandidate(row.matricula) || 'sin matrícula' }}</small>
            </span>
            <span class="row-scope">
              <strong>{{ row.plantel || 'Plantel pendiente' }}</strong>
              <small>{{ [row.nivel, row.grado, row.grupo].filter(Boolean).join(' / ') || 'Datos pendientes' }}</small>
            </span>
            <span class="status-pill" :class="{ ok: row.readiness.ok }">{{ row.readiness.ok ? 'Listo' : 'Faltan datos' }}</span>
          </button>
        </div>
      </article>

      <aside class="pass-detail" data-product-panel="pass-detail" :data-state="selectedPass ? 'content' : 'empty'">
        <template v-if="selectedPass">
          <section class="detail-identity" :style="{ '--theme-color': selectedPass.theme.primary }">
            <span class="theme-mark">{{ selectedPass.theme.shortLabel?.slice(0, 2).toUpperCase() || selectedPass.theme.label.slice(0, 2).toUpperCase() }}</span>
            <div>
              <p class="eyebrow">{{ selectedPass.theme.label }}</p>
              <h2>{{ selectedPass.authorizedName }}</h2>
              <p>{{ selectedPass.parentesco || 'Persona autorizada' }}</p>
            </div>
          </section>

          <dl class="detail-facts">
            <div><dt>Alumno</dt><dd>{{ selectedPass.studentName }}</dd></div>
            <div><dt>Matrícula</dt><dd>{{ displayMatriculaCandidate(selectedPass.matricula) || 'Pendiente' }}</dd></div>
            <div><dt>Nivel / plantel</dt><dd>{{ selectedPass.nivel }} / {{ selectedPass.plantel }}</dd></div>
            <div><dt>Grupo</dt><dd>{{ [selectedPass.grado, selectedPass.grupo].filter(Boolean).join(' / ') || 'Pendiente' }}</dd></div>
            <div><dt>Plantilla</dt><dd><NuxtLink v-if="selectedPass.template" class="template-link" :to="{ path: '/admin/superadmin/marbetes', query: { plantilla: selectedPass.template.id } }">{{ selectedPass.template.name }}</NuxtLink><span v-else>No disponible</span></dd></div>
          </dl>

          <div class="issue-list">
            <span v-for="issue in selectedPass.readiness.issues" :key="issue" class="issue-pill">{{ issue }}</span>
            <span v-if="selectedPass.readiness.ok" class="issue-pill ok">Pase listo para generar</span>
          </div>

          <div class="pass-actions">
            <a
              class="btn btn-primary"
              :href="selectedPass.readiness.ok ? adminPdfUrl(selectedPass, false) : undefined"
              target="_blank"
              rel="noopener"
              :aria-disabled="!selectedPass.readiness.ok"
              :data-unavailable-reason="!selectedPass.readiness.ok ? selectedPass.readiness.issues[0] : undefined"
              data-diagnostic-action="preview-admin-husky-pass"
              @click="guardUnavailable($event, selectedPass)"
            >
              Previsualizar PDF
            </a>
            <a
              class="btn btn-secondary"
              :href="selectedPass.readiness.ok ? adminPdfUrl(selectedPass, true) : undefined"
              :aria-disabled="!selectedPass.readiness.ok"
              :data-unavailable-reason="!selectedPass.readiness.ok ? selectedPass.readiness.issues[0] : undefined"
              data-diagnostic-action="download-admin-husky-pass"
              @click="guardUnavailable($event, selectedPass)"
            >
              Descargar
            </a>
            <button class="btn btn-secondary" type="button" :disabled="diagnosticsPending" data-diagnostic-action="diagnose-admin-husky-pass" @click="loadDiagnostics(selectedPass)">
              {{ diagnosticsPending ? 'Diagnosticando...' : 'Diagnóstico' }}
            </button>
            <button class="btn btn-secondary" type="button" :disabled="accessPreparingId === selectedPass.userId" data-diagnostic-action="prepare-pass-access" @click="prepareAccess(selectedPass)">
              {{ accessPreparingId === selectedPass.userId ? 'Preparando...' : 'Preparar acceso' }}
            </button>
          </div>

          <section class="preview-pair" :data-state="selectedPass.readiness.ok ? 'ready' : 'blocked'">
            <iframe v-if="selectedPass.readiness.ok && selectedPass.personId" :key="previewKey" :src="adminSvgUrl(selectedPass)" title="Vista del pase"></iframe>
            <div v-if="selectedPass.readiness.ok" class="pdf-preview">
              <iframe :key="pdfPreviewKey" :src="adminPdfUrl(selectedPass, false)" title="PDF del pase"></iframe>
            </div>
            <div v-else class="blocked-preview">
              <strong>PDF no disponible</strong>
              <span>{{ selectedPass.readiness.issues[0] || 'Faltan datos para generar.' }}</span>
            </div>
          </section>

          <pre v-if="diagnostics" class="diagnostics">{{ diagnostics }}</pre>
        </template>
        <EmptyState v-else title="Selecciona un registro" description="No hay un pase seleccionado." />
      </aside>
    </section>

  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { SuperAdminPassCandidate, SuperAdminPassSearchResponse } from '~/types/superadmin'
import { displayMatriculaCandidate } from '~/utils/matricula'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const route = useRoute()
const router = useRouter()
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const selectedPlantel = ref(typeof route.query.plantel === 'string' ? route.query.plantel : '')
const selectedNivel = ref(typeof route.query.nivel === 'string' ? route.query.nivel : '')
const selectedPass = ref<SuperAdminPassCandidate | null>(null)
const clientReady = ref(false)
const actionError = ref('')
const actionNotice = ref('')
const diagnostics = ref('')
const diagnosticsPending = ref(false)
const accessPreparingId = ref<number | null>(null)
const previewBump = ref(0)

const passQuery = computed(() => ({
  search: search.value,
  plantel: selectedPlantel.value,
  nivel: selectedNivel.value,
  fixture: route.query.fixture === '1' ? '1' : '',
  limit: 120
}))
const { data: passSearch, pending: passPending, error: passError, refresh: refreshPass } = useFetch<SuperAdminPassSearchResponse>('/api/admin/personas-autorizadas/pass-search', {
  query: passQuery,
  watch: [passQuery],
  timeout: 20000,
  dedupe: 'cancel'
})
const passRows = computed(() => passSearch.value?.rows || [])
const passState = computed(() => passPending.value && !passRows.value.length ? 'loading' : passError.value ? 'error' : passRows.value.length ? 'content' : 'empty')
const passFixtureMode = computed(() => route.query.fixture === '1')
const passStatusLabel = computed(() => passPending.value ? 'Consultando...' : passFixtureMode.value ? 'Fixtures dev' : 'Datos reales')
const previewKey = computed(() => `svg-${selectedPass.value?.personId || 'none'}-${previewBump.value}`)
const pdfPreviewKey = computed(() => `pdf-${selectedPass.value?.personId || 'none'}-${previewBump.value}`)

function syncSelectedPass(rows: SuperAdminPassCandidate[]) {
  if (!rows.length) {
    selectedPass.value = null
    return
  }
  const routeId = Number(route.query.persona || 0)
  const fromRoute = rows.find((row) => Number(row.personId || 0) === routeId)
  if (fromRoute) {
    selectedPass.value = fromRoute
    return
  }
  if (!selectedPass.value || !rows.some((row) => row.personId === selectedPass.value?.personId)) {
    selectedPass.value = rows.find((row) => row.readiness.ok) || rows[0]
  }
}

onMounted(() => {
  clientReady.value = true
  syncSelectedPass(passRows.value)
})

watch(passRows, (rows) => {
  if (!clientReady.value) return
  syncSelectedPass(rows)
}, { immediate: true })

watch([search, selectedPlantel, selectedNivel, () => selectedPass.value?.personId], () => {
  if (!import.meta.client) return
  const query: Record<string, string> = {}
  if (search.value.trim()) query.buscar = search.value.trim()
  if (selectedPlantel.value) query.plantel = selectedPlantel.value
  if (selectedNivel.value) query.nivel = selectedNivel.value
  if (route.query.fixture === '1') query.fixture = '1'
  if (selectedPass.value?.personId) query.persona = String(selectedPass.value.personId)
  router.replace({ path: route.path, query })
})

function selectPass(row: SuperAdminPassCandidate) {
  selectedPass.value = row
  diagnostics.value = ''
  actionError.value = ''
  actionNotice.value = ''
  previewBump.value += 1
}

async function refreshPassSearch() {
  actionError.value = ''
  actionNotice.value = ''
  diagnostics.value = ''
  await refreshPass()
  actionNotice.value = passError.value ? '' : 'Resultados actualizados.'
}

function adminPdfUrl(row: SuperAdminPassCandidate, download: boolean) {
  if (!row.personId) return ''
  return `/api/admin/personas-autorizadas/marbete?id=${row.personId}&format=pdf${download ? '&download=1' : ''}&v=${previewBump.value}`
}

function adminSvgUrl(row: SuperAdminPassCandidate) {
  if (!row.personId) return ''
  return `/api/admin/personas-autorizadas/marbete?id=${row.personId}&format=svg-preview&v=${previewBump.value}`
}

function guardUnavailable(event: MouseEvent, row: SuperAdminPassCandidate) {
  if (row.readiness.ok) return
  event.preventDefault()
  actionError.value = row.readiness.issues[0] || 'Faltan datos para generar el pase.'
}

async function loadDiagnostics(row: SuperAdminPassCandidate) {
  if (!row.personId) return
  diagnosticsPending.value = true
  actionError.value = ''
  diagnostics.value = ''
  try {
    const result = await $fetch(`/api/admin/personas-autorizadas/marbete?id=${row.personId}&format=diagnostics`)
    diagnostics.value = JSON.stringify(result, null, 2)
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible diagnosticar el pase.'
  } finally {
    diagnosticsPending.value = false
  }
}

async function prepareAccess(row: SuperAdminPassCandidate) {
  accessPreparingId.value = row.userId
  actionError.value = ''
  actionNotice.value = ''
  try {
    await $fetch('/api/admin/personas-autorizadas/access-action', {
      method: 'POST',
      body: { userId: row.userId }
    })
    actionNotice.value = 'Acceso familiar preparado.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible preparar acceso.'
  } finally {
    accessPreparingId.value = null
  }
}
</script>

<style scoped>
.pass-admin {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.pass-head {
  align-items: center;
  grid-template-columns: minmax(0, 1fr) auto;
}

.pass-count {
  background: #eef7f4;
  border: 1px solid #d3e8e1;
  border-radius: 999px;
  color: #0b7067;
  font-size: 0.78rem;
  padding: 8px 11px;
}

.pass-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pass-search-strip {
  align-items: end;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(260px, 1fr) minmax(130px, .28fr) minmax(150px, .36fr) auto;
  padding: 12px;
}

.pass-search-strip label {
  color: var(--color-muted);
  display: grid;
  font-size: .74rem;
  font-weight: 700;
  gap: 6px;
  text-transform: uppercase;
}

.pass-layout {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 440px);
  min-width: 0;
}

.pass-results,
.pass-detail,
.config-panel {
  align-content: start;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 14px;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.section-head h2,
.section-head p,
.detail-identity h2,
.detail-identity p {
  margin-bottom: 0;
}

.result-list {
  display: grid;
  gap: 8px;
}

.result-row {
  --row-color: var(--color-brand-700);
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 12px minmax(210px, 1fr) minmax(150px, .55fr) auto;
  padding: 9px 10px;
  text-align: left;
}

.result-row:hover,
.result-row.selected {
  border-color: var(--row-color);
  box-shadow: 0 0 0 3px rgba(35, 97, 136, .08);
}

.row-status {
  background: #d9a126;
  border-radius: 999px;
  height: 12px;
  width: 12px;
}

.row-status[data-ready='true'] {
  background: #4f8f32;
}

.row-main,
.row-scope {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.row-main strong,
.row-main small,
.row-scope strong,
.row-scope small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-main small,
.row-scope small {
  color: var(--color-muted);
  font-size: .82rem;
}

.status-pill,
.issue-pill {
  background: #f8f4e8;
  border: 1px solid #ead9a8;
  border-radius: 999px;
  color: #7a590d;
  font-size: .76rem;
  font-weight: 700;
  padding: 5px 9px;
}

.status-pill.ok,
.issue-pill.ok {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-900);
}

.detail-identity {
  --theme-color: var(--color-brand-700);
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 48px minmax(0, 1fr);
}

.theme-mark {
  background: var(--theme-color);
  border-radius: 13px;
  color: #fff;
  display: grid;
  font-size: .82rem;
  height: 46px;
  place-items: center;
  width: 46px;
}

.detail-facts {
  display: grid;
  gap: 8px;
  margin: 0;
}

.detail-facts div {
  border-bottom: 1px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding-bottom: 7px;
}

dt {
  color: var(--color-muted);
  font-size: .72rem;
  letter-spacing: .08em;
  text-transform: uppercase;
}

dd {
  margin: 0;
  word-break: break-word;
}

.template-link {
  color: #0b7168;
  text-decoration: underline;
  text-decoration-color: rgba(11, 113, 104, 0.3);
  text-underline-offset: 3px;
}

.issue-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pass-actions .btn[aria-disabled='true'] {
  opacity: .55;
}

.preview-pair {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, .8fr) minmax(0, 1fr);
}

.preview-pair iframe {
  aspect-ratio: 612 / 792;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  width: 100%;
}

.pdf-preview iframe {
  height: min(60vh, 620px);
}

.blocked-preview,
.loading-row {
  align-content: center;
  background: var(--surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-muted);
  display: grid;
  gap: 4px;
  min-height: 190px;
  padding: 14px;
}

.diagnostics {
  background: #17202a;
  border-radius: 8px;
  color: #dce9f7;
  margin: 0;
  max-height: 320px;
  overflow: auto;
  padding: 12px;
  white-space: pre-wrap;
}

.notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 12px;
  color: var(--color-brand-900);
  font-weight: 700;
  margin: 0;
  padding: 10px 12px;
}







@media (max-width: 1180px) {
  .pass-head,
  .pass-search-strip,
  .pass-layout {
    grid-template-columns: 1fr;
  }

  .preview-pair {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .pass-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .result-row {
    grid-template-columns: 12px minmax(0, 1fr);
  }

  .row-scope,
  .status-pill {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
