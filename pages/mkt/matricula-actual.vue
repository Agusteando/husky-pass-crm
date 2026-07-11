<template>
  <section class="mkt-page enrollment-page" data-product-area="mkt" data-product-screen="current-enrollment">
    <header class="enrollment-hero mkt-panel" :data-level="activeLevel">
      <div class="hero-copy">
        <p class="mkt-eyebrow">Marketing · Aurora</p>
        <h1>Matrícula actual</h1>
        <div class="hero-meta">
          <span>{{ activePlantelCode }}</span>
          <span>{{ activeCycleLabel }}</span>
          <span :data-state="freshnessState"><i />{{ freshnessLabel }}</span>
        </div>
      </div>

      <div class="hero-controls">
        <div v-if="options?.planteles.length" class="plantel-tabs" aria-label="Planteles">
          <button
            v-for="plantel in options.planteles"
            :key="plantel.code"
            type="button"
            :class="{ active: selectedPlantel === plantel.code }"
            @click="selectedPlantel = plantel.code"
          >
            {{ plantel.code }}
          </button>
        </div>
        <label class="cycle-picker">
          <span>Ciclo</span>
          <select v-model="selectedCiclo" :disabled="!options?.schoolYears.length">
            <option v-for="cycle in options?.schoolYears || []" :key="cycle.value" :value="cycle.value">{{ cycle.label }}</option>
          </select>
        </label>
        <button class="mkt-btn export-btn" type="button" :disabled="!canQuery || exporting" @click="downloadExcel">
          <FamilyPersonasIcon name="download" />
          {{ exporting ? 'Preparando…' : 'Excel' }}
        </button>
      </div>

      <img class="hero-ambassador" :src="activeAmbassador" alt="" aria-hidden="true" />
    </header>

    <section v-if="optionsPending" class="mkt-panel mkt-empty" data-state="loading">
      <HuskyPassLoader label="Conectando con Aurora" contained />
    </section>

    <section v-else-if="optionsError" class="mkt-panel connection-error" data-state="error">
      <span><FamilyPersonasIcon name="alert" /></span>
      <div><p class="mkt-eyebrow">Aurora</p><h2>No respondió</h2><p>{{ optionErrorMessage }}</p></div>
      <button class="mkt-btn" type="button" @click="refreshOptions">Reintentar</button>
    </section>

    <section v-else-if="!options?.planteles.length" class="mkt-panel access-state">
      <img src="/personas-autorizadas/ambassadors/primaria-brave.png" alt="" aria-hidden="true" />
      <div><p class="mkt-eyebrow">Matrícula actual</p><h2>Sin planteles asignados</h2></div>
    </section>

    <template v-else>
      <section class="enrollment-totals" aria-label="Totales de matrícula">
        <article class="total-card internal">
          <span><FamilyPersonasIcon name="school" /></span>
          <div><small>Internos</small><strong>{{ formatNumber(kpis?.internos ?? 0) }}</strong></div>
          <em>{{ percent(kpis?.internos, kpis?.inscritos) }}%</em>
        </article>
        <article class="total-card external">
          <span><FamilyPersonasIcon name="entry" /></span>
          <div><small>Externos</small><strong>{{ formatNumber(kpis?.externos ?? 0) }}</strong></div>
          <em>{{ percent(kpis?.externos, kpis?.inscritos) }}%</em>
        </article>
        <article class="total-card enrolled">
          <span><FamilyPersonasIcon name="people" /></span>
          <div><small>Inscritos</small><strong>{{ formatNumber(kpis?.inscritos ?? 0) }}</strong></div>
          <em>{{ activePlantelCode }}</em>
        </article>
        <article class="total-card visible">
          <span><FamilyPersonasIcon name="clipboard" /></span>
          <div><small>Alumnos</small><strong>{{ formatNumber(kpis?.totalVisible ?? total) }}</strong></div>
          <em>{{ activeCycleLabel }}</em>
        </article>
      </section>

      <section class="grade-board mkt-panel">
        <header class="section-head">
          <div>
            <p class="mkt-eyebrow">Distribución</p>
            <h2>Matrícula por grado</h2>
          </div>
          <div class="legend" aria-hidden="true">
            <span class="internal"><i />Internos</span>
            <span class="external"><i />Externos</span>
          </div>
        </header>

        <div v-if="loading && !gradeRows.length" class="matrix-loading">
          <span v-for="index in 6" :key="index" />
        </div>

        <div v-else-if="gradeRows.length" class="grade-matrix">
          <div class="matrix-header" aria-hidden="true">
            <span>Grado</span><span>Internos</span><span>Externos</span><span>Total</span><span />
          </div>

          <article v-for="grade in gradeRows" :key="grade.grado" class="grade-entry" :class="{ open: isGradeOpen(grade.grado) }">
            <button class="grade-row" type="button" @click="toggleGrade(grade.grado)">
              <span class="grade-name"><b>{{ gradeLabel(grade.grado) }}</b><small>{{ grade.grupos.length }} grupo{{ grade.grupos.length === 1 ? '' : 's' }}</small></span>
              <strong class="number internal">{{ formatNumber(grade.interno) }}</strong>
              <strong class="number external">{{ formatNumber(grade.externo) }}</strong>
              <strong class="number total">{{ formatNumber(grade.total) }}</strong>
              <span class="chevron"><FamilyPersonasIcon name="chevron" /></span>
            </button>

            <div v-show="isGradeOpen(grade.grado)" class="group-rows">
              <button
                v-for="group in grade.grupos"
                :key="`${grade.grado}-${group.grupo}`"
                type="button"
                :class="{ selected: filters.grado === grade.grado && filters.grupo === group.grupo }"
                @click="selectGroup(grade.grado, group.grupo)"
              >
                <span class="group-name"><i />Grupo {{ group.grupo }}</span>
                <strong class="number internal">{{ formatNumber(group.interno) }}</strong>
                <strong class="number external">{{ formatNumber(group.externo) }}</strong>
                <strong class="number total">{{ formatNumber(group.total) }}</strong>
                <span class="group-action">Ver <FamilyPersonasIcon name="arrow" /></span>
              </button>
              <button v-if="!grade.grupos.length" class="empty-grade" type="button" @click="selectGrade(grade.grado)">
                <span>Sin grupo</span><span /><span /><strong>{{ grade.total }}</strong><span class="group-action">Ver <FamilyPersonasIcon name="arrow" /></span>
              </button>
            </div>
          </article>

          <footer class="matrix-total">
            <span>Total</span>
            <strong class="internal">{{ formatNumber(matrixTotals.interno) }}</strong>
            <strong class="external">{{ formatNumber(matrixTotals.externo) }}</strong>
            <strong>{{ formatNumber(matrixTotals.total) }}</strong>
            <span />
          </footer>
        </div>

        <div v-else class="matrix-empty">
          <span><FamilyPersonasIcon name="clipboard" /></span>
          <strong>Sin matrícula en este ciclo</strong>
        </div>
      </section>

      <section class="directory-panel mkt-panel">
        <header class="directory-head">
          <div>
            <p class="mkt-eyebrow">Alumnos</p>
            <h2>{{ directoryTitle }}</h2>
            <p v-if="directoryActive">{{ total }} resultado{{ total === 1 ? '' : 's' }}</p>
          </div>
          <button v-if="!directoryActive" class="mkt-btn soft" type="button" @click="showAllStudents">
            <FamilyPersonasIcon name="people" /> Ver todos
          </button>
          <button v-else class="refresh-button" type="button" aria-label="Actualizar alumnos" :disabled="loading" @click="loadStudents(true)">
            <FamilyPersonasIcon name="replace" />
          </button>
        </header>

        <div class="directory-tools">
          <label class="search-field">
            <FamilyPersonasIcon name="search" />
            <input v-model="filters.search" type="search" placeholder="Nombre, matrícula, CURP o familia" autocomplete="off" />
            <button v-if="filters.search" type="button" aria-label="Limpiar búsqueda" @click="filters.search = ''">×</button>
          </label>
          <div class="status-tabs" aria-label="Tipo de alumno">
            <button v-for="item in statusOptions" :key="item.value" type="button" :class="{ active: filters.status === item.value }" @click="setStatus(item.value)">
              {{ item.label }}
            </button>
          </div>
        </div>

        <div v-if="filters.grado || filters.grupo" class="active-selection">
          <span>{{ [gradeLabel(filters.grado), filters.grupo ? `Grupo ${filters.grupo}` : ''].filter(Boolean).join(' · ') }}</span>
          <button type="button" @click="clearGroupSelection">×</button>
        </div>

        <div v-if="!directoryActive" class="directory-idle">
          <div class="idle-mark"><FamilyPersonasIcon name="search" /></div>
          <span>Directorio</span>
        </div>

        <div v-else-if="loading && !students.length" class="students-loading">
          <article v-for="index in 6" :key="index"><span /><div><i /><i /></div><b /></article>
        </div>

        <section v-else-if="listError && !students.length" class="students-state error-state">
          <FamilyPersonasIcon name="alert" /><h3>No fue posible consultar</h3><p>{{ listError }}</p><button class="mkt-btn" type="button" @click="loadStudents(true)">Reintentar</button>
        </section>

        <section v-else-if="!students.length" class="students-state">
          <img :src="activeAmbassador" alt="" aria-hidden="true" /><h3>Sin resultados</h3>
          <button v-if="hasFilters" class="mkt-btn soft" type="button" @click="clearDirectoryFilters">Mostrar todos</button>
        </section>

        <div v-else class="students-grid">
          <button v-for="student in students" :key="student.matricula" class="student-card" type="button" @click="openStudent(student)">
            <span class="student-photo" :data-level="activeLevel">
              <img v-if="student.photoUrl && !failedPhotos.has(student.matricula)" :src="student.photoUrl" :alt="`Foto de ${student.fullName}`" loading="lazy" @error="markPhotoFailed(student.matricula)" />
              <b v-else>{{ initials(student.fullName) }}</b>
            </span>
            <span class="student-main">
              <span class="student-badges">
                <i :data-kind="tipoIngresoValue(student)">{{ tipoIngresoLabel(student) }}</i>
                <i :data-state="rowState(student)">{{ rowStatusLabel(student) }}</i>
              </span>
              <strong>{{ student.fullName || 'Alumno sin nombre' }}</strong>
              <small>{{ student.matricula }} · {{ gradeGroup(student) }}</small>
            </span>
            <span class="student-contact" :data-ready="familyReady(student)">
              <FamilyPersonasIcon :name="familyReady(student) ? 'check' : 'alert'" />
              <span><small>Familia</small><strong>{{ familyReady(student) ? primaryContact(student) : 'Pendiente' }}</strong></span>
            </span>
            <span class="student-completion">
              <span><i :style="{ width: `${studentCompletion(student)}%` }" /></span>
              <small>{{ studentCompletion(student) }}%</small>
            </span>
            <FamilyPersonasIcon class="student-arrow" name="arrow" />
          </button>
        </div>

        <footer v-if="directoryActive && students.length" class="students-footer">
          <span>{{ students.length }} de {{ total }}</span>
          <button v-if="nextCursor" class="mkt-btn soft" type="button" :disabled="loadingMore" @click="loadMore">
            {{ loadingMore ? 'Cargando…' : 'Cargar más' }}
          </button>
        </footer>
      </section>
    </template>

    <Transition name="status-toast">
      <div v-if="actionMessage" class="action-toast" :data-state="actionState"><span />{{ actionMessage }}</div>
    </Transition>

    <MktEnrollmentStudentModal
      v-if="selectedStudent"
      :student="selectedStudent"
      :plantel="selectedPlantel"
      :plantel-label="activePlantelCode"
      :ciclo="selectedCiclo"
      @close="selectedStudent = null"
      @optimistic="applyOptimisticStudent"
      @saved="applySavedStudent"
      @rollback="applyRollbackStudent"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import type {
  MktEnrollmentCatalogs,
  MktEnrollmentGradeSummary,
  MktEnrollmentKpis,
  MktEnrollmentOptionsResponse,
  MktEnrollmentStudent,
  MktEnrollmentStudentsResponse
} from '~/types/mktEnrollment'

definePageMeta({ layout: 'mkt', middleware: 'mkt' })

const { data: options, pending: optionsPending, error: optionsFetchError, refresh: refreshOptionsRaw } = await useFetch<MktEnrollmentOptionsResponse>('/api/mkt/enrollment/options', {
  key: 'mkt-enrollment-options',
  server: false,
  lazy: true
})
const selectedPlantel = ref('')
const selectedCiclo = ref('')
const students = ref<MktEnrollmentStudent[]>([])
const catalogs = reactive<MktEnrollmentCatalogs>({ niveles: [], grados: [], grupos: [], gruposPorGrado: {} })
const kpis = ref<MktEnrollmentKpis | null>(null)
const meta = ref<Record<string, any>>({})
const total = ref(0)
const nextCursor = ref<string | null>(null)
const loading = ref(false)
const loadingMore = ref(false)
const exporting = ref(false)
const listError = ref('')
const selectedStudent = ref<MktEnrollmentStudent | null>(null)
const failedPhotos = reactive(new Set<string>())
const expandedGrades = ref(new Set<string>())
const directoryActive = ref(false)
const actionMessage = ref('')
const actionState = ref<'saving' | 'saved' | 'failed'>('saved')
let searchTimer: ReturnType<typeof setTimeout> | null = null
let requestSequence = 0
let toastTimer: ReturnType<typeof setTimeout> | null = null
const filters = reactive({ search: '', grado: '', grupo: '', status: '' })

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'internos', label: 'Internos' },
  { value: 'externos', label: 'Externos' },
  { value: 'bajas', label: 'Bajas' }
]

const optionsError = computed(() => Boolean(optionsFetchError.value))
const optionErrorMessage = computed(() => optionsFetchError.value?.data?.message || optionsFetchError.value?.message || 'No fue posible abrir la conexión con Aurora.')
const activePlantel = computed(() => options.value?.planteles.find((item) => item.code === selectedPlantel.value) || null)
const activePlantelCode = computed(() => activePlantel.value?.code || '—')
const activeLevel = computed(() => activePlantel.value?.level || 'preescolar')
const activeAmbassador = computed(() => ({
  daycare: '/personas-autorizadas/ambassadors/daycare-sunny.png',
  preescolar: '/personas-autorizadas/ambassadors/preescolar-joy.png',
  primaria: '/personas-autorizadas/ambassadors/primaria-brave.png',
  secundaria: '/personas-autorizadas/ambassadors/secundaria-hope.png'
}[activeLevel.value]))
const activeCycleLabel = computed(() => options.value?.schoolYears.find((item) => item.value === selectedCiclo.value)?.label || selectedCiclo.value || '—')
const canQuery = computed(() => Boolean(selectedPlantel.value && selectedCiclo.value))
const hasFilters = computed(() => Boolean(filters.search || filters.grado || filters.grupo || filters.status))
const gradeRows = computed<MktEnrollmentGradeSummary[]>(() => Array.isArray(kpis.value?.porGrado) ? kpis.value!.porGrado : [])
const matrixTotals = computed(() => gradeRows.value.reduce((result, grade) => ({
  interno: result.interno + Number(grade.interno || 0),
  externo: result.externo + Number(grade.externo || 0),
  total: result.total + Number(grade.total || 0)
}), { interno: 0, externo: 0, total: 0 }))
const directoryTitle = computed(() => {
  if (filters.search) return 'Resultados'
  if (filters.grado || filters.grupo) return [gradeLabel(filters.grado), filters.grupo ? `Grupo ${filters.grupo}` : ''].filter(Boolean).join(' · ')
  return 'Directorio'
})
const freshnessState = computed(() => {
  if (loading.value) return 'loading'
  const resolved = String(meta.value?.freshness || '').toLowerCase()
  if (resolved) return resolved
  return options.value?.connected ? 'fresh' : 'stale'
})
const freshnessLabel = computed(() => {
  if (loading.value) return 'Actualizando'
  if (freshnessState.value === 'stale') return 'Consulta directa'
  if (freshnessState.value === 'expired') return 'Actualizando'
  return 'Aurora'
})

watch(options, (value) => {
  if (!value) return
  if (!selectedPlantel.value || !value.planteles.some((item) => item.code === selectedPlantel.value)) selectedPlantel.value = value.defaultPlantel || value.planteles[0]?.code || ''
  if (!selectedCiclo.value || !value.schoolYears.some((item) => item.value === selectedCiclo.value)) selectedCiclo.value = value.defaultCiclo || value.schoolYears[0]?.value || ''
}, { immediate: true })

watch([selectedPlantel, selectedCiclo], () => {
  filters.search = ''
  filters.grado = ''
  filters.grupo = ''
  filters.status = ''
  directoryActive.value = false
  expandedGrades.value = new Set()
  selectedStudent.value = null
  kpis.value = null
  if (canQuery.value) loadStudents(true)
})
watch(() => [filters.grado, filters.grupo, filters.status], () => {
  if (canQuery.value && directoryActive.value) loadStudents(true)
})
watch(() => filters.search, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (value.trim()) directoryActive.value = true
  searchTimer = setTimeout(() => { if (canQuery.value && directoryActive.value) loadStudents(true) }, 320)
})

async function refreshOptions() {
  await refreshOptionsRaw()
}

function queryParams(cursor = '') {
  return {
    plantel: selectedPlantel.value,
    ciclo: selectedCiclo.value,
    search: filters.search,
    grado: filters.grado,
    grupo: filters.grupo,
    nivel: '',
    status: filters.status,
    cursor,
    limit: 100
  }
}

async function loadStudents(reset = false) {
  if (!canQuery.value) return
  const sequence = ++requestSequence
  loading.value = true
  listError.value = ''
  if (reset) {
    students.value = []
    nextCursor.value = null
  }
  try {
    const response = await $fetch<MktEnrollmentStudentsResponse>('/api/mkt/enrollment/students', { query: queryParams() })
    if (sequence !== requestSequence) return
    students.value = response.data
    total.value = response.pagination.total
    nextCursor.value = response.pagination.nextCursor
    Object.assign(catalogs, response.catalogs)
    if (response.kpis) kpis.value = response.kpis
    meta.value = response.meta || {}
  } catch (caught: any) {
    if (sequence !== requestSequence) return
    listError.value = caught?.data?.message || caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible consultar la matrícula actual.'
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

async function loadMore() {
  if (!nextCursor.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const response = await $fetch<MktEnrollmentStudentsResponse>('/api/mkt/enrollment/students', { query: queryParams(nextCursor.value) })
    const seen = new Set(students.value.map((student) => student.matricula))
    students.value.push(...response.data.filter((student) => !seen.has(student.matricula)))
    total.value = response.pagination.total
    nextCursor.value = response.pagination.nextCursor
  } catch (caught: any) {
    showAction(caught?.data?.message || 'No se pudieron cargar más alumnos.', 'failed')
  } finally {
    loadingMore.value = false
  }
}

function toggleGrade(grado: string) {
  const next = new Set(expandedGrades.value)
  if (next.has(grado)) next.delete(grado)
  else next.add(grado)
  expandedGrades.value = next
}
function isGradeOpen(grado: string) { return expandedGrades.value.has(grado) }
function selectGroup(grado: string, grupo: string) {
  directoryActive.value = true
  filters.search = ''
  filters.grado = grado
  filters.grupo = grupo
  window.setTimeout(() => document.querySelector('.directory-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
}
function selectGrade(grado: string) {
  directoryActive.value = true
  filters.search = ''
  filters.grado = grado
  filters.grupo = ''
}
function showAllStudents() {
  directoryActive.value = true
  filters.search = ''
  filters.grado = ''
  filters.grupo = ''
  filters.status = ''
  loadStudents(true)
}
function setStatus(value: string) {
  directoryActive.value = true
  filters.status = value
}
function clearGroupSelection() {
  filters.grado = ''
  filters.grupo = ''
}
function clearDirectoryFilters() {
  filters.search = ''
  filters.grado = ''
  filters.grupo = ''
  filters.status = ''
  directoryActive.value = true
  loadStudents(true)
}

async function openStudent(student: MktEnrollmentStudent) {
  selectedStudent.value = { ...student }
  try {
    const response = await $fetch<{ data: MktEnrollmentStudent }>(`/api/mkt/enrollment/students/${encodeURIComponent(student.matricula)}`, {
      query: { plantel: selectedPlantel.value, ciclo: selectedCiclo.value }
    })
    if (selectedStudent.value?.matricula === student.matricula) selectedStudent.value = response.data
  } catch (caught: any) {
    showAction(caught?.data?.message || 'La ficha no pudo actualizarse.', 'failed')
  }
}

function replaceListStudent(student: MktEnrollmentStudent) {
  const index = students.value.findIndex((item) => item.matricula === student.matricula)
  if (index >= 0) students.value.splice(index, 1, student)
}
function applyOptimisticStudent(student: MktEnrollmentStudent) {
  replaceListStudent(student)
  showAction('Guardando en Aurora…', 'saving')
}
function applySavedStudent(student: MktEnrollmentStudent) {
  replaceListStudent(student)
  selectedStudent.value = student
  showAction('Ficha actualizada.', 'saved')
  window.setTimeout(() => { if (canQuery.value) loadStudents(false) }, 180)
}
function applyRollbackStudent(student: MktEnrollmentStudent, message: string) {
  replaceListStudent(student)
  showAction(message, 'failed')
}

function showAction(message: string, state: 'saving' | 'saved' | 'failed') {
  actionMessage.value = message
  actionState.value = state
  if (toastTimer) clearTimeout(toastTimer)
  if (state !== 'saving') toastTimer = setTimeout(() => { actionMessage.value = '' }, 3600)
}

async function downloadExcel() {
  if (!canQuery.value || exporting.value) return
  exporting.value = true
  try {
    const params = new URLSearchParams()
    Object.entries(queryParams()).forEach(([key, value]) => {
      if (key !== 'cursor' && key !== 'limit' && String(value || '').trim()) params.set(key, String(value))
    })
    const link = document.createElement('a')
    link.href = `/api/mkt/enrollment/export?${params.toString()}`
    link.download = ''
    document.body.appendChild(link)
    link.click()
    link.remove()
    showAction('Excel en preparación.', 'saved')
  } finally {
    window.setTimeout(() => { exporting.value = false }, 900)
  }
}

function markPhotoFailed(matricula: string) { failedPhotos.add(matricula) }
function formatNumber(value: unknown) { return new Intl.NumberFormat('es-MX').format(Number(value || 0)) }
function percent(value: unknown, base: unknown) {
  const denominator = Number(base || 0)
  return denominator > 0 ? Math.round((Number(value || 0) / denominator) * 100) : 0
}
function gradeLabel(value: unknown) {
  const text = String(value || '').trim()
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
function initials(name: string) { return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'HP' }
function gradeGroup(student: MktEnrollmentStudent) { return [gradeLabel(student.grado), student.group || student.grupo].filter(Boolean).join(' · ') || 'Sin grupo' }
function familyReady(student: MktEnrollmentStudent) { return Boolean(student.telefonoPadre || student.telefonoMadre || student.emailPadre || student.emailMadre || student.phone || student.email) }
function primaryContact(student: MktEnrollmentStudent) { return String(student.contactoPrincipal?.nombre || student.fatherName || student.motherName || student.telefonoPadre || student.telefonoMadre || 'Familia') }
function studentCompletion(student: MktEnrollmentStudent) { return Math.max(0, Math.min(100, Number(student.completenessTiers?.basic?.progress ?? (student.missingFields?.length ? 50 : 100)) || 0)) }
function tipoIngresoValue(student: MktEnrollmentStudent) { return String(student.tipoIngresoValue || student.tipoIngreso || '').toLowerCase() === 'interno' ? 'internal' : 'external' }
function tipoIngresoLabel(student: MktEnrollmentStudent) { return tipoIngresoValue(student) === 'internal' ? 'Interno' : 'Externo' }
function rowState(student: MktEnrollmentStudent) {
  const state = String(student.enrollmentState || student.status || '').toLowerCase()
  if (state.includes('baja') || state.includes('inactiv')) return 'inactive'
  if (state.includes('no_inscrito') || state.includes('pend')) return 'pending'
  return 'active'
}
function rowStatusLabel(student: MktEnrollmentStudent) {
  if (rowState(student) === 'inactive') return 'Baja'
  if (String(student.enrollmentState || '').toLowerCase() === 'inscrito') return 'Inscrito'
  return student.status || 'Activo'
}
</script>

<style scoped>
.enrollment-page{--internal:#0b7168;--external:#4f86c6;--warm:#f4bb45}.enrollment-hero{background:radial-gradient(circle at 78% 10%,rgba(246,199,69,.26),transparent 28%),radial-gradient(circle at 4% 90%,rgba(143,200,73,.18),transparent 34%),linear-gradient(135deg,#073f3d,#0a685e 58%,#10786c);color:#fff;display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.72fr) 190px;min-height:230px;overflow:hidden;padding:30px 30px 24px;position:relative}.hero-copy{align-self:center;position:relative;z-index:2}.hero-copy .mkt-eyebrow{color:#bdebd9}.hero-copy h1{color:#fff;font-size:clamp(2.45rem,4.6vw,4.4rem);letter-spacing:-.045em;line-height:.9}.hero-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.hero-meta span{align-items:center;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.16);border-radius:999px;color:#e9fbf5;display:inline-flex;font-size:.69rem;font-weight:850;gap:7px;min-height:31px;padding:0 11px}.hero-meta i{background:#a8d95a;border-radius:50%;height:7px;width:7px}.hero-meta [data-state='loading'] i{animation:pulse 1s infinite;background:#f6c745}.hero-controls{align-content:center;align-self:center;display:grid;gap:10px;grid-template-columns:minmax(0,1fr) auto;position:relative;z-index:3}.plantel-tabs{background:rgba(1,35,34,.28);border:1px solid rgba(255,255,255,.17);border-radius:16px;display:flex;gap:5px;grid-column:1/-1;padding:5px}.plantel-tabs button{background:transparent;border:0;border-radius:11px;color:rgba(255,255,255,.7);cursor:pointer;flex:1;font:inherit;font-size:.72rem;font-weight:950;min-height:40px;padding:0 12px}.plantel-tabs button.active{background:#fff;box-shadow:0 8px 22px rgba(1,30,29,.2);color:#075d56}.cycle-picker{background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.16);border-radius:14px;display:grid;gap:2px;padding:6px 10px}.cycle-picker span{color:#bdebd9;font-size:.55rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.cycle-picker select{appearance:none;background:transparent;border:0;color:#fff;font:inherit;font-size:.75rem;font-weight:850;min-height:25px;outline:0}.cycle-picker option{color:#17383b}.export-btn{background:#f6c745;border-color:transparent;color:#473600;min-width:100px}.hero-ambassador{align-self:end;filter:drop-shadow(0 20px 20px rgba(0,0,0,.18));height:214px;justify-self:center;object-fit:contain;position:relative;width:184px;z-index:2}.connection-error,.access-state{align-items:center;display:grid;gap:16px;grid-template-columns:auto minmax(0,1fr) auto;padding:22px}.connection-error>span{align-items:center;background:#fff0ed;border-radius:16px;color:#b34c40;display:flex;height:50px;justify-content:center;width:50px}.connection-error h2,.access-state h2{font-size:1.15rem}.connection-error p:last-child{font-size:.73rem;margin:4px 0 0}.access-state{grid-template-columns:100px minmax(0,1fr)}.access-state img{height:96px;object-fit:contain;width:96px}
.enrollment-totals{display:grid;gap:12px;grid-template-columns:repeat(4,minmax(0,1fr))}.total-card{align-items:center;background:#fff;border:1px solid var(--mkt-line);border-radius:20px;box-shadow:0 14px 34px rgba(14,55,61,.06);display:grid;gap:12px;grid-template-columns:46px minmax(0,1fr) auto;min-height:88px;padding:14px}.total-card>span{align-items:center;border-radius:15px;display:flex;height:46px;justify-content:center;width:46px}.total-card small,.total-card strong{display:block}.total-card small{color:#738386;font-size:.65rem;font-weight:800}.total-card strong{font-family:var(--font-title);font-size:1.7rem;line-height:1;margin-top:4px}.total-card em{background:#f2f7f4;border-radius:999px;color:#64777a;font-size:.6rem;font-style:normal;font-weight:900;padding:6px 8px}.total-card.internal>span{background:#e7f6f1;color:var(--internal)}.total-card.external>span{background:#eaf2fb;color:var(--external)}.total-card.enrolled>span{background:#fff5d8;color:#9a6c00}.total-card.visible>span{background:#fff0ed;color:#a74e43}
.grade-board{overflow:hidden}.section-head{align-items:center;border-bottom:1px solid #e5ece8;display:flex;justify-content:space-between;padding:20px 22px}.section-head h2{font-size:1.28rem}.legend{display:flex;gap:14px}.legend span{align-items:center;color:#6b7b7d;display:flex;font-size:.64rem;font-weight:850;gap:6px}.legend i{border-radius:50%;height:8px;width:8px}.legend .internal i{background:var(--internal)}.legend .external i{background:var(--external)}.grade-matrix{padding:0 18px 18px}.matrix-header,.grade-row,.group-rows button,.matrix-total{align-items:center;display:grid;grid-template-columns:minmax(170px,1.5fr) repeat(3,minmax(75px,.55fr)) 70px}.matrix-header{color:#849194;font-size:.59rem;font-weight:900;letter-spacing:.07em;padding:13px 13px 8px;text-align:center;text-transform:uppercase}.matrix-header span:first-child{text-align:left}.grade-entry{border:1px solid #e2ebe6;border-radius:16px;margin-top:8px;overflow:hidden;transition:.18s ease}.grade-entry.open{border-color:rgba(11,113,104,.25);box-shadow:0 10px 28px rgba(16,76,72,.07)}.grade-row{background:#fff;border:0;color:inherit;cursor:pointer;font:inherit;min-height:66px;padding:9px 13px;text-align:center;width:100%}.grade-row:hover{background:#f8fbf9}.grade-name{text-align:left}.grade-name b,.grade-name small{display:block}.grade-name b{font-family:var(--font-title);font-size:1rem}.grade-name small{color:#879396;font-size:.58rem;margin-top:3px}.number{font-family:var(--font-title);font-size:1.03rem;text-align:center}.number.internal{color:var(--internal)}.number.external{color:var(--external)}.number.total{color:#193b40}.chevron{align-items:center;color:#879a98;display:flex;justify-content:center;transition:.18s ease}.grade-entry.open .chevron{transform:rotate(180deg)}.group-rows{background:#f6faf8;border-top:1px solid #e4ece8;padding:6px 8px 8px}.group-rows button{background:transparent;border:0;border-radius:11px;color:#3c565b;cursor:pointer;font:inherit;min-height:47px;padding:5px 10px;text-align:center;width:100%}.group-rows button:hover,.group-rows button.selected{background:#fff;box-shadow:0 6px 18px rgba(15,65,64,.07)}.group-name{align-items:center;display:flex;font-size:.7rem;font-weight:850;gap:9px;text-align:left}.group-name i{background:#9ecac0;border-radius:999px;height:6px;width:6px}.group-action{align-items:center;color:#0b6b61;display:flex;font-size:.62rem;font-weight:900;gap:4px;justify-content:flex-end}.group-action svg{height:13px;width:13px}.matrix-total{background:#0b4f4a;border-radius:14px;color:#fff;margin-top:10px;min-height:56px;padding:8px 13px;text-align:center}.matrix-total span:first-child{font-family:var(--font-title);font-size:1rem;text-align:left}.matrix-total strong{font-family:var(--font-title);font-size:1.08rem}.matrix-total .internal{color:#a8e4d4}.matrix-total .external{color:#bcd8f6}.matrix-loading{display:grid;gap:8px;padding:18px}.matrix-loading span{animation:shimmer 1.2s infinite;background:#edf2ef;border-radius:14px;height:62px}.matrix-empty{align-items:center;color:#758587;display:flex;gap:10px;justify-content:center;min-height:180px}.matrix-empty>span{align-items:center;background:#edf6f2;border-radius:14px;color:#0b6b61;display:flex;height:44px;justify-content:center;width:44px}
.directory-panel{overflow:hidden}.directory-head{align-items:center;border-bottom:1px solid #e5ece8;display:flex;justify-content:space-between;padding:19px 22px}.directory-head h2{font-size:1.22rem}.directory-head p:last-child{font-size:.65rem;margin:3px 0 0}.refresh-button{align-items:center;background:#eef7f3;border:0;border-radius:12px;color:#0b6b61;cursor:pointer;display:flex;height:42px;justify-content:center;width:42px}.refresh-button:disabled svg{animation:spin 1s linear infinite}.directory-tools{align-items:center;display:grid;gap:12px;grid-template-columns:minmax(240px,1fr) auto;padding:15px 18px}.search-field{align-items:center;background:#f7faf8;border:1px solid #dce8e3;border-radius:14px;display:grid;gap:8px;grid-template-columns:18px minmax(0,1fr) 24px;padding:0 11px}.search-field svg{color:#6f8584}.search-field input{background:transparent;border:0;font:inherit;font-size:.73rem;min-height:44px;outline:0;width:100%}.search-field button{background:transparent;border:0;color:#7c8c8e;cursor:pointer;font-size:1.1rem}.status-tabs{background:#f1f6f3;border-radius:13px;display:flex;gap:3px;padding:4px}.status-tabs button{background:transparent;border:0;border-radius:10px;color:#687b7d;cursor:pointer;font:inherit;font-size:.62rem;font-weight:850;min-height:36px;padding:0 11px}.status-tabs button.active{background:#fff;box-shadow:0 4px 12px rgba(14,55,61,.08);color:#075f58}.active-selection{align-items:center;background:#edf8f3;border-top:1px solid #dfece6;color:#0b655c;display:flex;font-size:.67rem;font-weight:900;justify-content:space-between;padding:9px 18px}.active-selection button{background:transparent;border:0;color:inherit;cursor:pointer;font-size:1rem}.directory-idle{align-items:center;color:#7d8d8e;display:flex;flex-direction:column;gap:8px;justify-content:center;min-height:150px}.idle-mark{align-items:center;background:#edf7f3;border-radius:18px;color:#0b6b61;display:flex;height:52px;justify-content:center;width:52px}.directory-idle>span{font-family:var(--font-title);font-size:.9rem}.students-grid{border-top:1px solid #edf1ef;display:grid;grid-template-columns:1fr 1fr}.student-card{align-items:center;background:#fff;border:0;border-bottom:1px solid #edf1ef;color:inherit;cursor:pointer;display:grid;font:inherit;gap:11px;grid-template-columns:54px minmax(0,1fr) minmax(105px,.75fr) 72px 18px;padding:13px 16px;text-align:left;transition:.15s ease;width:100%}.student-card:nth-child(odd){border-right:1px solid #edf1ef}.student-card:hover{background:#f8fbf9}.student-photo{align-items:center;background:#e9f7f0;border-radius:17px;display:flex;height:52px;justify-content:center;overflow:hidden;width:52px}.student-photo[data-level='daycare']{background:#fff7d9}.student-photo[data-level='primaria']{background:#eaf3ff}.student-photo[data-level='secundaria']{background:#fff0ed}.student-photo img{height:100%;object-fit:cover;width:100%}.student-photo b{color:#0b6b61;font-size:.72rem}.student-main{min-width:0}.student-main>strong,.student-main>small{display:block}.student-main>strong{font-size:.75rem;line-height:1.22;margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.student-main>small{color:#7d8b8e;font-size:.58rem;margin-top:4px}.student-badges{display:flex;gap:5px}.student-badges i{border-radius:999px;font-size:.5rem;font-style:normal;font-weight:950;padding:4px 6px}.student-badges i[data-kind='internal']{background:#e7f6f1;color:#087268}.student-badges i[data-kind='external']{background:#eaf2fb;color:#3976b3}.student-badges i[data-state='active']{background:#edf8e6;color:#557f2a}.student-badges i[data-state='pending']{background:#fff7df;color:#85610f}.student-badges i[data-state='inactive']{background:#fff0ed;color:#a34e43}.student-contact{align-items:center;display:flex;gap:8px;min-width:0}.student-contact>svg{background:#fff0ed;border-radius:9px;color:#b05246;flex:0 0 auto;height:31px;padding:8px;width:31px}.student-contact[data-ready='true']>svg{background:#edf8e6;color:#5c872e}.student-contact span{min-width:0}.student-contact small,.student-contact strong{display:block}.student-contact small{color:#879396;font-size:.54rem}.student-contact strong{font-size:.61rem;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.student-completion>span{background:#edf2ef;border-radius:999px;display:block;height:6px;overflow:hidden}.student-completion>span i{background:linear-gradient(90deg,#8fc849,#0b6b61);display:block;height:100%}.student-completion small{color:#687a7d;display:block;font-size:.54rem;margin-top:4px;text-align:right}.student-arrow{color:#9bacaa;height:15px;width:15px}.students-footer{align-items:center;display:flex;justify-content:space-between;padding:14px 18px}.students-footer>span{color:#7b898c;font-size:.62rem}.students-loading{border-top:1px solid #edf1ef;display:grid;grid-template-columns:1fr 1fr}.students-loading article{align-items:center;border-bottom:1px solid #edf1ef;display:grid;gap:12px;grid-template-columns:52px minmax(0,1fr) 70px;padding:13px 16px}.students-loading article:nth-child(odd){border-right:1px solid #edf1ef}.students-loading article>span{animation:shimmer 1.2s infinite;background:#eaf0ed;border-radius:16px;height:52px;width:52px}.students-loading article div{display:grid;gap:7px}.students-loading article i,.students-loading article b{animation:shimmer 1.2s infinite;background:#eaf0ed;border-radius:999px;height:8px}.students-loading article i:first-child{width:58%}.students-loading article i:last-child{width:34%}.students-loading article b{height:22px;width:64px}.students-state{align-items:center;display:flex;flex-direction:column;min-height:280px;justify-content:center;padding:28px;text-align:center}.students-state img{height:112px;object-fit:contain;width:112px}.students-state>svg{color:#b05246;height:30px;width:30px}.students-state h3{font-size:1rem;margin-top:8px}.students-state p{font-size:.7rem;margin:5px 0 14px}.error-state{background:linear-gradient(180deg,#fff,#fff8f6)}.action-toast{align-items:center;background:#123f42;border:1px solid rgba(255,255,255,.16);border-radius:999px;bottom:24px;box-shadow:0 18px 48px rgba(5,35,40,.28);color:#fff;display:flex;font-size:.7rem;font-weight:850;gap:8px;left:50%;padding:11px 16px;position:fixed;transform:translateX(-50%);z-index:1300}.action-toast span{background:#8fc849;border-radius:999px;height:8px;width:8px}.action-toast[data-state='saving'] span{animation:pulse 1s infinite;background:#f6c745}.action-toast[data-state='failed']{background:#913f37}.action-toast[data-state='failed'] span{background:#ffd2ca}.status-toast-enter-active,.status-toast-leave-active{transition:.18s ease}.status-toast-enter-from,.status-toast-leave-to{opacity:0;transform:translate(-50%,10px)}
@keyframes shimmer{0%,100%{opacity:.55}50%{opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{50%{opacity:.35}}
@media(max-width:1180px){.enrollment-hero{grid-template-columns:minmax(0,1fr) minmax(300px,.8fr) 150px}.hero-ambassador{height:190px;width:150px}.enrollment-totals{grid-template-columns:1fr 1fr}.students-grid{grid-template-columns:1fr}.student-card:nth-child(odd){border-right:0}.students-loading{grid-template-columns:1fr}.students-loading article:nth-child(odd){border-right:0}}
@media(max-width:820px){.enrollment-hero{grid-template-columns:minmax(0,1fr) 130px;padding:23px}.hero-controls{grid-column:1;grid-row:2;margin-top:18px}.hero-ambassador{grid-column:2;grid-row:1/3;height:170px;width:130px}.enrollment-totals{gap:9px}.matrix-header,.grade-row,.group-rows button,.matrix-total{grid-template-columns:minmax(130px,1.35fr) repeat(3,70px) 45px}.directory-tools{grid-template-columns:1fr}.status-tabs{overflow-x:auto}.status-tabs button{flex:1;white-space:nowrap}}
@media(max-width:620px){.enrollment-hero{border-radius:23px;grid-template-columns:minmax(0,1fr) 86px;min-height:250px;padding:20px}.hero-copy h1{font-size:2.35rem}.hero-controls{grid-template-columns:1fr auto}.plantel-tabs{overflow-x:auto}.plantel-tabs button{flex:0 0 58px}.hero-ambassador{height:126px;width:92px}.enrollment-totals{grid-template-columns:1fr 1fr}.total-card{gap:8px;grid-template-columns:39px minmax(0,1fr);min-height:78px;padding:10px}.total-card>span{height:39px;width:39px}.total-card strong{font-size:1.35rem}.total-card em{display:none}.section-head{padding:17px}.legend{gap:8px}.legend span{font-size:.57rem}.grade-matrix{padding:0 9px 10px}.matrix-header{display:none}.grade-row,.group-rows button,.matrix-total{grid-template-columns:minmax(105px,1.25fr) repeat(3,48px) 30px;padding-inline:8px}.grade-name b{font-size:.86rem}.number,.matrix-total strong{font-size:.83rem}.grade-name small{font-size:.52rem}.group-name{font-size:.62rem}.group-action{font-size:0}.group-action svg{height:14px;width:14px}.directory-head,.directory-tools{padding-inline:14px}.students-grid{grid-template-columns:1fr}.student-card{grid-template-columns:48px minmax(0,1fr) 18px;padding:12px 13px}.student-photo{height:46px;width:46px}.student-contact,.student-completion{display:none}.student-arrow{grid-column:3;grid-row:1}.action-toast{bottom:78px;max-width:calc(100vw - 24px);text-align:center;white-space:normal}.connection-error{grid-template-columns:auto minmax(0,1fr)}.connection-error .mkt-btn{grid-column:1/-1}.access-state{grid-template-columns:76px minmax(0,1fr)}.access-state img{height:74px;width:74px}}
@media(max-width:400px){.hero-controls{grid-template-columns:1fr}.export-btn{min-width:0}.enrollment-totals{grid-template-columns:1fr 1fr}.total-card small{font-size:.58rem}.grade-row,.group-rows button,.matrix-total{grid-template-columns:minmax(85px,1.2fr) repeat(3,42px) 24px}.number,.matrix-total strong{font-size:.76rem}.group-name i{display:none}}
</style>
