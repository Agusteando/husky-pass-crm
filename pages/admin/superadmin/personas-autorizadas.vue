<template>
  <section class="pa-admin stack" data-product-area="superadmin" data-product-screen="personas-readiness">
    <header class="workspace-head compact-head pa-admin-head">
      <div>
        <p class="eyebrow">Superadmin</p>
        <h1>Personas Autorizadas</h1>
        <p>Revisa familias listas, registros con acción pendiente, marbetes PDF y encuestas por nivel.</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin">Directorio</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin/marbetes">Plantillas</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/admin/historial-accesos">Historial de accesos</NuxtLink>
        <button class="btn btn-primary" type="button" :disabled="pending" data-diagnostic-action="actualizar-readiness" @click="refreshReadiness">
          {{ isInitialReadinessLoad ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </header>

    <section v-if="readiness" class="metric-grid">
      <article><span>Total</span><strong>{{ readiness.metrics.total }}</strong></article>
      <article class="ok"><span>Listas</span><strong>{{ readiness.metrics.complete }}</strong></article>
      <article class="warn"><span>Requieren acción</span><strong>{{ readiness.metrics.incomplete }}</strong></article>
      <article><span>Sin personas</span><strong>{{ readiness.metrics.missingAuthorizedPeople }}</strong></article>
      <article><span>Datos alumno</span><strong>{{ readiness.metrics.missingRequiredStudentData }}</strong></article>
      <article><span>Marbete/foto</span><strong>{{ readiness.metrics.missingPrintableReadiness }}</strong></article>
    </section>

    <section class="filters-card card">
      <label class="label">
        Plantel
        <select v-model="selectedPlantel" class="select" data-diagnostic-filter="pa-plantel">
          <option value="">Todos</option>
          <option v-for="plantel in readiness?.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option>
        </select>
      </label>
      <label class="label">
        Nivel
        <select v-model="selectedNivel" class="select" data-diagnostic-filter="pa-nivel">
          <option value="">Todos</option>
          <option v-for="nivel in readiness?.niveles || []" :key="nivel" :value="nivel">{{ nivel }}</option>
        </select>
      </label>
      <label class="label">
        Estado
        <select v-model="selectedStatus" class="select" data-diagnostic-filter="pa-status">
          <option value="all">Todos</option>
          <option value="complete">Listas</option>
          <option value="incomplete">Requieren acción</option>
          <option value="missingAuthorizedPeople">Sin personas</option>
          <option value="missingRequiredStudentData">Datos alumno</option>
          <option value="missingPrintableReadiness">Marbete</option>
        </select>
      </label>
      <label class="label search-label">
        Buscar
        <input v-model="search" class="input" type="search" placeholder="Nombre, matrícula, correo, grupo" data-diagnostic-filter="pa-search" />
      </label>
    </section>

    <p v-if="loadError && !readiness" class="alert" data-state="error">No fue posible cargar Personas Autorizadas.</p>
    <div v-else-if="isInitialReadinessLoad" class="card loading-card" data-product-loading data-state="loading">Cargando estado...</div>

    <section v-else-if="readiness" class="readiness-layout">
      <article class="card readiness-card" data-product-panel="pa-readiness-table" :data-state="rows.length ? 'content' : 'empty'">
        <div class="section-head">
          <div>
            <p class="eyebrow">Familias y alumnos</p>
            <h2>{{ rows.length }} familias</h2>
          </div>
          <span class="muted">Datos reales de users, alumno_pa, personas_autorizadas y plantillas</span>
        </div>

        <div v-if="rows.length" class="readiness-list">
          <article
            v-for="row in rows"
            :key="row.userId"
            class="readiness-row"
            :class="row.status"
            :style="{ '--row-color': row.theme.primary }"
          >
            <button type="button" data-diagnostic-action="seleccionar-readiness" @click="selectRow(row)">
              <span class="status-dot"></span>
              <span class="family-copy">
                <strong>{{ row.studentName }}</strong>
                <small>{{ row.familyLabel }} / {{ displayMatricula(row.username, 'sin matrícula') }}</small>
              </span>
              <span class="scope-copy">
                <strong>{{ row.plantel || 'Plantel pendiente' }}</strong>
                <small>{{ [row.nivel, row.grado, row.grupo].filter(Boolean).join(' / ') || 'Datos pendientes' }}</small>
              </span>
              <span class="count-pill">{{ row.authorizedCount }} registradas</span>
              <span class="status-pill">{{ statusLabel(row.status) }}</span>
            </button>
          </article>
        </div>
        <EmptyState v-else title="Sin registros" description="Ajusta filtros para ver familias de Personas Autorizadas." />
      </article>

      <aside class="side-column">
        <section class="card detail-card" data-product-panel="pa-readiness-detail" :data-state="selectedRow ? 'content' : 'empty'">
          <template v-if="selectedRow">
            <div class="detail-top" :style="{ '--detail-color': selectedRow.theme.primary }">
              <span class="detail-avatar">{{ selectedRow.theme.label.slice(0, 2).toUpperCase() }}</span>
              <div>
                <p class="eyebrow">Detalle</p>
                <h2>{{ selectedRow.studentName }}</h2>
                <p>{{ selectedRow.familyLabel }}</p>
              </div>
            </div>

            <dl>
              <div><dt>Plantel / nivel</dt><dd>{{ selectedRow.plantel }} / {{ selectedRow.nivel }}</dd></div>
              <div><dt>Grupo</dt><dd>{{ [selectedRow.grado, selectedRow.grupo].filter(Boolean).join(' / ') || 'Pendiente' }}</dd></div>
              <div><dt>Contacto</dt><dd>{{ selectedRow.contact || 'Sin contacto' }}</dd></div>
              <div><dt>Personas autorizadas</dt><dd>{{ selectedRow.authorizedCount }}</dd></div>
              <div><dt>Plantilla</dt><dd>{{ selectedRow.templateName || 'Sin plantilla' }}</dd></div>
              <div><dt>Último acceso preparado</dt><dd>{{ formatDate(selectedRow.lastAccessActionAt) }}</dd></div>
            </dl>

            <div class="issue-list">
              <span v-for="issue in selectedRow.issues" :key="issue.key" class="issue-pill">{{ issue.label }}</span>
              <span v-if="!selectedRow.issues.length" class="issue-pill ok">Completo</span>
            </div>

            <button class="btn btn-primary" type="button" :disabled="accessPreparingId === selectedRow.userId" data-diagnostic-action="preparar-acceso-husky" @click="prepareAccess(selectedRow)">
              {{ accessPreparingId === selectedRow.userId ? 'Preparando...' : 'Preparar acceso familiar' }}
            </button>
          </template>
          <EmptyState v-else title="Selecciona una familia" description="Verás faltantes accionables y el acceso preparado." />
        </section>

        <section v-if="preparedAccess" class="card access-card" data-product-panel="pa-access-prepared" data-state="prepared">
          <p class="eyebrow">Acceso preparado</p>
          <h2>{{ preparedAccess.displayName }}</h2>
          <dl>
            <div><dt>Login</dt><dd>{{ displayMatriculaCandidate(preparedAccess.login) }}</dd></div>
            <div><dt>Contraseña</dt><dd>{{ preparedAccess.passwordAvailable ? preparedAccess.password : 'No visible' }}</dd></div>
            <div><dt>Estado</dt><dd>{{ preparedAccess.message }}</dd></div>
          </dl>
        </section>

        <form class="card config-card" data-product-panel="pa-config" @submit.prevent="saveConfig">
          <div class="section-head">
            <div>
              <p class="eyebrow">Configuración</p>
              <h2>Encuestas por nivel</h2>
            </div>
          </div>
          <div class="survey-level-list">
            <article v-for="option in surveyLevelOptions" :key="option.key" class="survey-level-row">
              <label class="switch-line">
                <input v-model="configForm.surveysByNivel[option.key].enabled" type="checkbox" />
                <span>{{ option.label }}</span>
              </label>
              <label class="label compact-label">
                Título
                <input v-model="configForm.surveysByNivel[option.key].title" class="input" />
              </label>
              <label class="label compact-label">
                Google Form
                <input v-model="configForm.surveysByNivel[option.key].embedUrl" class="input" placeholder="https://docs.google.com/forms/..." :data-diagnostic-field="`survey-url-${option.key}`" />
              </label>
            </article>
          </div>
          <section class="config-upload" data-product-panel="pa-convenios-upload" :data-state="conveniosUploadState">
            <div>
              <p class="eyebrow">Convenios</p>
              <h3>Archivo para familias</h3>
              <p>{{ configForm.conveniosUrl ? 'Archivo configurado.' : 'PDF, imagen o documento hasta 10 MB.' }}</p>
            </div>
            <input type="file" accept="image/*,application/pdf,.doc,.docx,.txt" data-diagnostic-field="convenios-file" @change="selectConveniosFile" />
            <button class="btn btn-secondary" type="button" :disabled="!conveniosFile || conveniosUploading" data-diagnostic-action="subir-convenios" @click="uploadConveniosFile">
              {{ conveniosUploading ? 'Subiendo...' : configForm.conveniosUrl && !conveniosFile ? 'Archivo listo' : 'Subir archivo' }}
            </button>
            <a v-if="configForm.conveniosUrl" class="btn btn-secondary" :href="configForm.conveniosUrl" target="_blank" rel="noopener">Abrir convenios</a>
          </section>
          <button class="btn btn-primary" type="submit" :disabled="configSaving" data-diagnostic-action="guardar-config-pa">{{ configSaving ? 'Guardando...' : 'Guardar configuración' }}</button>
          <p v-if="actionError" class="alert compact-alert">{{ actionError }}</p>
          <p v-if="actionNotice" class="notice">{{ actionNotice }}</p>
        </form>
      </aside>
    </section>
    <EmptyState v-else title="Sin estado disponible" description="Vuelve a actualizar para consultar familias de Personas Autorizadas." />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { PersonasAutorizadasConfig, PersonasReadinessResponse, PersonasReadinessRow, PersonasSurveyNivelKey } from '~/types/daycare'
import { formatDate } from '~/utils/daycare'
import { displayMatricula, displayMatriculaCandidate } from '~/utils/matricula'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const route = useRoute()
const router = useRouter()

const selectedPlantel = ref(typeof route.query.plantel === 'string' ? route.query.plantel : '')
const selectedNivel = ref(typeof route.query.nivel === 'string' ? route.query.nivel : '')
const selectedStatus = ref(typeof route.query.estado === 'string' ? route.query.estado : 'all')
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const selectedRow = ref<PersonasReadinessRow | null>(null)
const accessPreparingId = ref<number | null>(null)
const preparedAccess = ref<{
  displayName: string
  login: string
  password: string | null
  passwordAvailable: boolean
  message: string
} | null>(null)
const actionError = ref('')
const actionNotice = ref('')
const configSaving = ref(false)
const conveniosUploading = ref(false)
const conveniosFile = ref<File | null>(null)
const accessActionUrl = '/api/admin/personas-autorizadas/access-action' as string
const configPostUrl = '/api/admin/personas-autorizadas/config' as string
const surveyLevelOptions: Array<{ key: PersonasSurveyNivelKey; label: string; defaultTitle: string }> = [
  { key: 'preescolar', label: 'Preescolar', defaultTitle: 'Encuesta Preescolar' },
  { key: 'primaria', label: 'Primaria', defaultTitle: 'Encuesta Primaria' },
  { key: 'secundaria', label: 'Secundaria', defaultTitle: 'Encuesta Secundaria' },
  { key: 'daycare', label: 'IECS / fallback', defaultTitle: 'Encuesta IECS' }
]
const configForm = reactive({
  surveyEnabled: false,
  surveyTitle: 'Encuesta Personas Autorizadas',
  surveyEmbedUrl: '',
  surveysByNivel: surveyLevelOptions.reduce((acc, option) => {
    acc[option.key] = { enabled: false, title: option.defaultTitle, embedUrl: '' }
    return acc
  }, {} as Record<PersonasSurveyNivelKey, { enabled: boolean; title: string; embedUrl: string }>),
  conveniosUrl: '',
  helpUrl: ''
})

const query = computed(() => ({
  plantel: selectedPlantel.value,
  nivel: selectedNivel.value,
  status: selectedStatus.value,
  search: search.value,
  limit: 180
}))

const { data: readiness, pending, error: loadError, refresh } = useFetch<PersonasReadinessResponse>('/api/admin/personas-autorizadas/readiness', {
  query,
  watch: [query],
  timeout: 15000,
  dedupe: 'cancel'
})
const { data: config, refresh: refreshConfig } = useFetch<PersonasAutorizadasConfig>('/api/admin/personas-autorizadas/config', { timeout: 15000 })
const rows = computed(() => readiness.value?.rows || [])
const isInitialReadinessLoad = computed(() => Boolean(pending.value && !readiness.value))
const conveniosUploadState = computed(() => {
  if (conveniosUploading.value) return 'loading'
  if (configForm.conveniosUrl) return 'ready'
  return conveniosFile.value ? 'selected' : 'empty'
})

watch(config, (value) => {
  if (!value) return
  configForm.surveyEnabled = Boolean(value.survey.enabled)
  configForm.surveyTitle = value.survey.title || 'Encuesta Personas Autorizadas'
  configForm.surveyEmbedUrl = value.survey.embedUrl || ''
  for (const option of surveyLevelOptions) {
    const survey = value.surveysByNivel?.[option.key]
    configForm.surveysByNivel[option.key].enabled = Boolean(survey?.enabled)
    configForm.surveysByNivel[option.key].title = survey?.title || option.defaultTitle
    configForm.surveysByNivel[option.key].embedUrl = survey?.embedUrl || ''
  }
  configForm.conveniosUrl = value.conveniosUrl || ''
  configForm.helpUrl = value.helpUrl || ''
}, { immediate: true })

watch(rows, (value) => {
  if (!value.length) {
    selectedRow.value = null
    return
  }
  if (!selectedRow.value || !value.some((row) => row.userId === selectedRow.value?.userId)) selectedRow.value = value[0]
}, { immediate: true })

watch([selectedPlantel, selectedNivel, selectedStatus, search], syncQuery)

function syncQuery() {
  if (!import.meta.client) return
  const next: Record<string, string> = {}
  if (selectedPlantel.value) next.plantel = selectedPlantel.value
  if (selectedNivel.value) next.nivel = selectedNivel.value
  if (selectedStatus.value && selectedStatus.value !== 'all') next.estado = selectedStatus.value
  if (search.value.trim()) next.buscar = search.value.trim()
  const changed = Object.keys({ ...route.query, ...next }).some((key) => String(route.query[key] || '') !== String(next[key] || ''))
  if (changed) router.replace({ path: route.path, query: next })
}

function selectRow(row: PersonasReadinessRow) {
  selectedRow.value = row
  preparedAccess.value = null
  actionError.value = ''
  actionNotice.value = ''
}

function statusLabel(status: PersonasReadinessRow['status']) {
  if (status === 'complete') return 'Lista'
  if (status === 'blocked') return 'Revisión'
  return 'Requiere acción'
}

async function refreshReadiness() {
  actionError.value = ''
  actionNotice.value = ''
  await refresh()
  actionNotice.value = 'Estado actualizado.'
}

async function prepareAccess(row: PersonasReadinessRow) {
  accessPreparingId.value = row.userId
  actionError.value = ''
  actionNotice.value = ''
  preparedAccess.value = null
  try {
    preparedAccess.value = await $fetch<NonNullable<typeof preparedAccess.value>>(accessActionUrl, {
      method: 'POST',
      body: { userId: row.userId }
    })
    actionNotice.value = 'Acceso preparado. No se marcó como enviado.'
    await refresh()
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible preparar acceso.'
  } finally {
    accessPreparingId.value = null
  }
}


function selectConveniosFile(event: Event) {
  const input = event.target as HTMLInputElement
  conveniosFile.value = input.files?.[0] || null
  actionError.value = ''
  actionNotice.value = ''
}

async function uploadConveniosFile() {
  if (!conveniosFile.value) return
  conveniosUploading.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const body = new FormData()
    body.append('file', conveniosFile.value)
    const response = await $fetch<{ url: string }>('/api/admin/personas-autorizadas/uploads', { method: 'POST', body })
    configForm.conveniosUrl = response.url
    conveniosFile.value = null
    actionNotice.value = 'Archivo de convenios cargado. Guarda la configuración para publicarlo.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible subir convenios.'
  } finally {
    conveniosUploading.value = false
  }
}

async function saveConfig() {
  configSaving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    await $fetch(configPostUrl, {
      method: 'POST',
      body: { ...configForm }
    })
    await refreshConfig()
    actionNotice.value = 'Configuración PA guardada.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar configuración.'
  } finally {
    configSaving.value = false
  }
}
</script>

<style scoped>
.pa-admin {
  gap: 10px;
  min-width: 0;
}

.pa-admin > * {
  min-width: 0;
}

.pa-admin-head {
  grid-template-columns: minmax(0, 1fr) auto;
  padding-block: 12px;
}

.pa-admin-head > div {
  min-width: 0;
}

.pa-admin-head p {
  overflow-wrap: anywhere;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metric-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.metric-grid article {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 5px;
  padding: 8px 10px;
}

.metric-grid span {
  color: var(--color-muted);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-grid strong {
  color: var(--color-ink);
  font-size: 1.25rem;
  line-height: 1;
}

.metric-grid .ok strong {
  color: #618b2f;
}

.metric-grid .warn strong {
  color: #9f7410;
}

.metric-grid .danger strong {
  color: #b4473f;
}

.filters-card {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(140px, 0.4fr) minmax(160px, 0.5fr) minmax(190px, 0.55fr) minmax(240px, 1fr);
}

.readiness-layout {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  min-width: 0;
}

.readiness-layout > * {
  min-width: 0;
}

.readiness-card,
.detail-card,
.access-card,
.config-card {
  display: grid;
  gap: 10px;
  min-width: 0;
}


.config-upload {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 12px;
}

.survey-level-list {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.survey-level-row {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(150px, 0.55fr) minmax(160px, 0.7fr) minmax(220px, 1fr);
  min-width: 0;
  padding: 10px;
}

.survey-level-row > *,
.config-card > *,
.config-upload > * {
  min-width: 0;
}

.compact-label {
  gap: 5px;
}

.config-upload h3,
.config-upload p {
  margin-bottom: 0;
}

.config-upload p:not(.eyebrow) {
  color: var(--color-muted);
  font-weight: 600;
}

.config-upload[data-state='ready'] {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
}

.section-head {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  min-width: 0;
}

.section-head > * {
  min-width: 0;
}

.section-head h2,
.detail-card h2,
.access-card h2,
.config-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.readiness-list {
  display: grid;
  gap: 8px;
}

.readiness-row {
  --row-color: var(--color-brand-700);
}

.readiness-row button {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-line);
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 12px minmax(180px, 1fr) minmax(170px, 0.72fr) auto auto;
  padding: 8px 10px;
  text-align: left;
  width: 100%;
}

.readiness-row button:hover {
  border-color: var(--row-color);
}

.status-dot {
  background: var(--row-color);
  border-radius: 999px;
  height: 12px;
  width: 12px;
}

.readiness-row.blocked .status-dot {
  background: #b4473f;
}

.readiness-row.incomplete .status-dot {
  background: #fcbf2c;
}

.family-copy,
.scope-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.family-copy strong,
.family-copy small,
.scope-copy strong,
.scope-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-copy small,
.scope-copy small {
  color: var(--color-muted);
  font-size: 0.82rem;
}

.count-pill,
.status-pill,
.issue-pill {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-800);
  font-size: 0.76rem;
  font-weight: 600;
  padding: 5px 9px;
}

.side-column {
  align-content: start;
  display: grid;
  gap: 10px;
}

.detail-top {
  --detail-color: var(--color-brand-700);
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 44px minmax(0, 1fr);
}

.detail-avatar {
  background: var(--detail-color);
  border-radius: 18px;
  color: #fff;
  display: grid;
  font-weight: 600;
  height: 44px;
  place-items: center;
  width: 44px;
}

.detail-card dl,
.access-card dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.detail-card dl div,
.access-card dl div {
  border-bottom: 1px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding-bottom: 7px;
}

dt {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

dd {
  margin: 0;
  word-break: break-word;
}

.issue-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.issue-pill {
  background: #f5f5f4;
  border-color: #e3e3df;
  color: var(--color-muted);
}

.issue-pill.ok {
  background: #f0f8e7;
  border-color: var(--color-brand-200);
  color: var(--color-brand-900);
}

.switch-line {
  align-items: center;
  display: flex;
  gap: 10px;
  font-weight: 600;
}

.switch-line input {
  accent-color: var(--color-brand-700);
  height: 18px;
  width: 18px;
}

.notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  font-weight: 600;
  margin: 0;
  padding: 8px 10px;
}

.compact-alert {
  margin: 0;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1180px) {
  .metric-grid,
  .filters-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .readiness-layout,
  .pa-admin-head {
    grid-template-columns: 1fr;
  }

  .survey-level-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .filters-card {
    grid-template-columns: 1fr;
  }

  .metric-grid {
    gap: 8px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-grid article {
    min-height: 58px;
    padding: 9px 10px;
  }

  .metric-grid strong {
    font-size: 1.25rem;
  }

  .pa-admin-head {
    gap: 10px;
    padding: 10px;
  }

  .pa-admin-head h1 {
    font-size: 1.6rem;
  }

  .pa-admin-head p {
    font-size: 0.92rem;
    line-height: 1.42;
  }

  .section-head,
  .head-actions {
    align-items: stretch;
  }

  .section-head {
    grid-template-columns: 1fr;
  }

  .head-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .head-actions .btn {
    min-height: 38px;
    padding-inline: 10px;
  }

  .readiness-row button {
    grid-template-columns: 14px minmax(0, 1fr);
    min-width: 0;
    width: 100%;
  }

  .scope-copy,
  .count-pill,
  .status-pill {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
