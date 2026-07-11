<template>
  <section class="mkt-page enrollment-page" data-product-area="mkt" data-product-screen="current-enrollment">
    <header class="enrollment-hero mkt-panel" :data-level="activeLevel">
      <div class="hero-copy">
        <p class="mkt-eyebrow">Marketing · Aurora</p>
        <h1>Matrícula actual</h1>
        <p>Consulta institucional de alumnos, grupos y contacto familiar.</p>
        <div class="hero-context">
          <span><FamilyPersonasIcon name="school" /> {{ activePlantelLabel }}</span>
          <span><FamilyPersonasIcon name="calendar" /> {{ activeCycleLabel }}</span>
          <span :data-state="freshnessState"><i />{{ freshnessLabel }}</span>
        </div>
      </div>
      <div class="hero-actions">
        <label class="cycle-picker">
          <span>Ciclo escolar</span>
          <select v-model="selectedCiclo" :disabled="!options?.schoolYears.length">
            <option v-for="cycle in options?.schoolYears || []" :key="cycle.value" :value="cycle.value">{{ cycle.label }}</option>
          </select>
        </label>
        <button class="mkt-btn export-btn" type="button" :disabled="!canQuery || exporting" @click="downloadExcel">
          <FamilyPersonasIcon name="download" />
          {{ exporting ? 'Preparando…' : 'Descargar Excel' }}
        </button>
      </div>
      <img class="hero-ambassador" :src="activeAmbassador" alt="" aria-hidden="true" />
    </header>

    <section v-if="optionsPending" class="mkt-panel mkt-empty" data-state="loading">
      <HuskyPassLoader label="Conectando con Aurora" contained />
    </section>

    <section v-else-if="optionsError" class="mkt-panel connection-error" data-state="error">
      <span><FamilyPersonasIcon name="alert" /></span>
      <div><p class="mkt-eyebrow">Conexión institucional</p><h2>Aurora no respondió</h2><p>{{ optionErrorMessage }}</p></div>
      <button class="mkt-btn" type="button" @click="refreshOptions">Reintentar</button>
    </section>

    <section v-else-if="!options?.planteles.length" class="mkt-panel access-state">
      <img src="/personas-autorizadas/ambassadors/primaria-brave.png" alt="" aria-hidden="true" />
      <div><p class="mkt-eyebrow">Alcance de matrícula</p><h2>No hay planteles escolares asignados</h2><p>La cuenta de Marketing necesita al menos un plantel compatible con Aurora.</p></div>
    </section>

    <template v-else>
      <section class="plantel-switcher" aria-label="Planteles disponibles">
        <button
          v-for="plantel in options.planteles"
          :key="plantel.code"
          type="button"
          :class="{ active: selectedPlantel === plantel.code }"
          :data-level="plantel.level"
          @click="selectedPlantel = plantel.code"
        >
          <span class="plantel-code">{{ plantel.code }}</span>
          <span><strong>{{ plantel.label }}</strong><small>{{ plantel.hasData ? 'Matrícula disponible' : 'Preparar consulta' }}</small></span>
          <i />
        </button>
      </section>

      <section class="enrollment-kpis" aria-label="Resumen de matrícula">
        <article class="enrollment-kpi primary">
          <span><FamilyPersonasIcon name="people" /></span>
          <div><small>Alumnos visibles</small><strong>{{ formatNumber(kpis?.totalVisible ?? total) }}</strong></div>
          <em>{{ activePlantelCode }}</em>
        </article>
        <article class="enrollment-kpi lime">
          <span><FamilyPersonasIcon name="check" /></span>
          <div><small>Inscritos</small><strong>{{ formatNumber(kpis?.inscritos ?? 0) }}</strong></div>
          <em>{{ enrollmentPercent }}%</em>
        </article>
        <article class="enrollment-kpi blue">
          <span><FamilyPersonasIcon name="document" /></span>
          <div><small>Expedientes completos</small><strong>{{ formatNumber(kpis?.expedientesCompletos ?? 0) }}</strong></div>
          <em>{{ completionPercent }}%</em>
        </article>
        <article class="enrollment-kpi coral" :data-attention="Number(kpis?.sinContacto || 0) > 0">
          <span><FamilyPersonasIcon name="phone" /></span>
          <div><small>Sin contacto familiar</small><strong>{{ formatNumber(kpis?.sinContacto ?? 0) }}</strong></div>
          <em>{{ Number(kpis?.sinContacto || 0) ? 'Requiere atención' : 'Al día' }}</em>
        </article>
      </section>

      <section class="enrollment-workspace">
        <aside class="filters-panel mkt-panel">
          <div class="filter-title">
            <span><FamilyPersonasIcon name="filter" /></span>
            <div><p class="mkt-eyebrow">Vista actual</p><h2>Explorar matrícula</h2></div>
          </div>
          <label class="search-field">
            <FamilyPersonasIcon name="search" />
            <input v-model="filters.search" type="search" placeholder="Nombre, matrícula, CURP o familia" autocomplete="off" />
            <button v-if="filters.search" type="button" aria-label="Limpiar búsqueda" @click="filters.search = ''">×</button>
          </label>
          <div class="filter-grid">
            <label><span>Nivel</span><select v-model="filters.nivel"><option value="">Todos</option><option v-for="level in catalogs.niveles" :key="level" :value="level">{{ titleCase(level) }}</option></select></label>
            <label><span>Grado</span><select v-model="filters.grado"><option value="">Todos</option><option v-for="grade in catalogs.grados" :key="grade" :value="grade">{{ titleCase(grade) }}</option></select></label>
            <label><span>Grupo</span><select v-model="filters.grupo"><option value="">Todos</option><option v-for="group in availableGroups" :key="group" :value="group">{{ group }}</option></select></label>
            <label><span>Estado</span><select v-model="filters.status"><option value="">Todos</option><option value="inscrito">Inscritos</option><option value="no_inscrito">No inscritos</option><option value="bajas">Bajas</option><option value="activos">Activos</option></select></label>
          </div>
          <button v-if="hasFilters" class="clear-filters" type="button" @click="clearFilters"><FamilyPersonasIcon name="close" /> Limpiar filtros</button>

          <div v-if="groupDistribution.length" class="group-distribution">
            <div class="distribution-head"><span>Grado y grupo</span><small>{{ groupDistribution.length }} grupos</small></div>
            <button v-for="group in groupDistribution" :key="group.label" type="button" @click="applyGroupLabel(group.label)">
              <span>{{ group.label }}</span><strong>{{ group.total }}</strong>
            </button>
          </div>
        </aside>

        <main class="students-panel mkt-panel">
          <header class="students-head">
            <div>
              <p class="mkt-eyebrow">{{ activePlantelLabel }}</p>
              <h2>{{ listTitle }}</h2>
              <p>{{ total }} resultado{{ total === 1 ? '' : 's' }} · {{ students.length }} cargados</p>
            </div>
            <div class="view-status">
              <span v-if="loading"><i />Actualizando</span>
              <span v-else><i />Lista al día</span>
              <button type="button" aria-label="Actualizar matrícula" :disabled="loading" @click="loadStudents(true)"><FamilyPersonasIcon name="replace" /></button>
            </div>
          </header>

          <div v-if="loading && !students.length" class="students-loading">
            <article v-for="index in 7" :key="index"><span /><div><i /><i /></div><b /></article>
          </div>
          <section v-else-if="listError && !students.length" class="students-state error-state">
            <FamilyPersonasIcon name="alert" /><h3>No pudimos consultar este plantel</h3><p>{{ listError }}</p><button class="mkt-btn" type="button" @click="loadStudents(true)">Reintentar</button>
          </section>
          <section v-else-if="!students.length" class="students-state">
            <img :src="activeAmbassador" alt="" aria-hidden="true" /><h3>No hay alumnos en esta vista</h3><p>Cambia los filtros o selecciona otro ciclo escolar.</p><button v-if="hasFilters" class="mkt-btn soft" type="button" @click="clearFilters">Mostrar todos</button>
          </section>

          <div v-else class="students-list">
            <button v-for="student in students" :key="student.matricula" class="student-row" type="button" @click="openStudent(student)">
              <span class="row-photo" :data-level="activeLevel">
                <img v-if="student.photoUrl && !failedPhotos.has(student.matricula)" :src="student.photoUrl" :alt="`Foto de ${student.fullName}`" loading="lazy" @error="markPhotoFailed(student.matricula)" />
                <b v-else>{{ initials(student.fullName) }}</b>
              </span>
              <span class="row-identity">
                <strong>{{ student.fullName || 'Alumno sin nombre' }}</strong>
                <small>{{ student.matricula }} · {{ titleCase(student.nivel || '') }}</small>
              </span>
              <span class="row-group"><small>Grado · grupo</small><strong>{{ gradeGroup(student) }}</strong></span>
              <span class="row-family" :data-ready="familyReady(student)">
                <i><FamilyPersonasIcon :name="familyReady(student) ? 'check' : 'alert'" /></i>
                <span><small>Contacto familiar</small><strong>{{ familyReady(student) ? primaryContact(student) : 'Por completar' }}</strong></span>
              </span>
              <span class="row-progress">
                <span><i :style="{ width: `${studentCompletion(student)}%` }" /></span>
                <small>{{ studentCompletion(student) }}%</small>
              </span>
              <span class="row-status" :data-state="rowState(student)">{{ rowStatusLabel(student) }}</span>
              <FamilyPersonasIcon class="row-arrow" name="arrow" />
            </button>
          </div>

          <footer v-if="students.length" class="students-footer">
            <span>Mostrando {{ students.length }} de {{ total }}</span>
            <button v-if="nextCursor" class="mkt-btn soft" type="button" :disabled="loadingMore" @click="loadMore">
              <FamilyPersonasIcon name="plus" />{{ loadingMore ? 'Cargando…' : 'Cargar más' }}
            </button>
          </footer>
        </main>
      </section>
    </template>

    <Transition name="status-toast">
      <div v-if="actionMessage" class="action-toast" :data-state="actionState"><span />{{ actionMessage }}</div>
    </Transition>

    <MktEnrollmentStudentModal
      v-if="selectedStudent"
      :student="selectedStudent"
      :plantel="selectedPlantel"
      :plantel-label="activePlantelLabel"
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
const actionMessage = ref('')
const actionState = ref<'saving' | 'saved' | 'failed'>('saved')
let searchTimer: ReturnType<typeof setTimeout> | null = null
let requestSequence = 0
let toastTimer: ReturnType<typeof setTimeout> | null = null
const filters = reactive({ search: '', nivel: '', grado: '', grupo: '', status: '' })

const optionsError = computed(() => Boolean(optionsFetchError.value))
const optionErrorMessage = computed(() => optionsFetchError.value?.data?.message || optionsFetchError.value?.message || 'No fue posible abrir la conexión con Aurora.')
const activePlantel = computed(() => options.value?.planteles.find((item) => item.code === selectedPlantel.value) || null)
const activePlantelCode = computed(() => activePlantel.value?.code || '—')
const activePlantelLabel = computed(() => activePlantel.value?.label || 'Selecciona un plantel')
const activeLevel = computed(() => activePlantel.value?.level || 'preescolar')
const activeAmbassador = computed(() => ({
  preescolar: '/personas-autorizadas/ambassadors/preescolar-joy.png',
  primaria: '/personas-autorizadas/ambassadors/primaria-brave.png',
  secundaria: '/personas-autorizadas/ambassadors/secundaria-hope.png'
}[activeLevel.value]))
const activeCycleLabel = computed(() => options.value?.schoolYears.find((item) => item.value === selectedCiclo.value)?.label || selectedCiclo.value || 'Ciclo escolar')
const canQuery = computed(() => Boolean(selectedPlantel.value && selectedCiclo.value))
const hasFilters = computed(() => Boolean(filters.search || filters.nivel || filters.grado || filters.grupo || filters.status))
const availableGroups = computed(() => {
  const byGrade = filters.grado ? catalogs.gruposPorGrado[filters.grado] : null
  return Array.isArray(byGrade) && byGrade.length ? byGrade : catalogs.grupos
})
const groupDistribution = computed(() => (kpis.value?.porGrupo || []).slice(0, 12))
const listTitle = computed(() => filters.grado || filters.grupo ? [titleCase(filters.grado), filters.grupo].filter(Boolean).join(' · ') : 'Alumnos del ciclo')
const enrollmentPercent = computed(() => percent(kpis.value?.inscritos, kpis.value?.totalVisible))
const completionPercent = computed(() => percent(kpis.value?.expedientesCompletos, Number(kpis.value?.expedientesCompletos || 0) + Number(kpis.value?.expedientesIncompletos || 0)))
const freshnessState = computed(() => String(meta.value?.freshness || '').toLowerCase() || 'fresh')
const freshnessLabel = computed(() => {
  if (freshnessState.value === 'stale') return 'Sincronización reciente'
  if (freshnessState.value === 'expired') return 'Actualizando origen'
  if (loading.value) return 'Consultando Aurora'
  return 'Aurora conectada'
})

watch(options, (value) => {
  if (!value) return
  if (!selectedPlantel.value || !value.planteles.some((item) => item.code === selectedPlantel.value)) selectedPlantel.value = value.defaultPlantel || value.planteles[0]?.code || ''
  if (!selectedCiclo.value || !value.schoolYears.some((item) => item.value === selectedCiclo.value)) selectedCiclo.value = value.defaultCiclo || value.schoolYears[0]?.value || ''
}, { immediate: true })

watch([selectedPlantel, selectedCiclo], () => {
  filters.search = ''
  filters.nivel = ''
  filters.grado = ''
  filters.grupo = ''
  filters.status = ''
  selectedStudent.value = null
  if (canQuery.value) loadStudents(true)
})
watch(() => [filters.nivel, filters.grado, filters.grupo, filters.status], () => {
  if (filters.grado && filters.grupo && !availableGroups.value.includes(filters.grupo)) filters.grupo = ''
  if (canQuery.value) loadStudents(true)
})
watch(() => filters.search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { if (canQuery.value) loadStudents(true) }, 320)
})

async function refreshOptions() {
  await refreshOptionsRaw()
}

function queryParams(cursor = '') {
  return {
    plantel: selectedPlantel.value,
    ciclo: selectedCiclo.value,
    search: filters.search,
    nivel: filters.nivel,
    grado: filters.grado,
    grupo: filters.grupo,
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
    kpis.value = response.kpis
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

async function openStudent(student: MktEnrollmentStudent) {
  selectedStudent.value = { ...student }
  try {
    const response = await $fetch<{ data: MktEnrollmentStudent }>(`/api/mkt/enrollment/students/${encodeURIComponent(student.matricula)}`, {
      query: { plantel: selectedPlantel.value, ciclo: selectedCiclo.value }
    })
    if (selectedStudent.value?.matricula === student.matricula) selectedStudent.value = response.data
  } catch (caught: any) {
    showAction(caught?.data?.message || 'La consulta detallada no pudo actualizarse.', 'failed')
  }
}

function replaceListStudent(student: MktEnrollmentStudent) {
  const index = students.value.findIndex((item) => item.matricula === student.matricula)
  if (index >= 0) students.value.splice(index, 1, student)
}
function applyOptimisticStudent(student: MktEnrollmentStudent) {
  replaceListStudent(student)
  showAction('Guardando información familiar en Aurora…', 'saving')
}
function applySavedStudent(student: MktEnrollmentStudent) {
  replaceListStudent(student)
  selectedStudent.value = student
  showAction('Información familiar actualizada.', 'saved')
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

function clearFilters() {
  filters.search = ''
  filters.nivel = ''
  filters.grado = ''
  filters.grupo = ''
  filters.status = ''
}

function applyGroupLabel(label: string) {
  const parts = String(label).trim().split(/\s+/)
  filters.grupo = parts.pop() || ''
  filters.grado = parts.join(' ')
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
    showAction('Aurora está preparando el Excel con la vista actual.', 'saved')
  } finally {
    window.setTimeout(() => { exporting.value = false }, 900)
  }
}

function markPhotoFailed(matricula: string) { failedPhotos.add(matricula) }
function initials(name: string) { return String(name || 'HP').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
function gradeGroup(student: MktEnrollmentStudent) { return [titleCase(student.grado || ''), student.group || student.grupo].filter(Boolean).join(' · ') || 'Sin grupo' }
function studentCompletion(student: MktEnrollmentStudent) { return Math.max(0, Math.min(100, Number(student.completenessTiers?.basic?.progress ?? (student.missingFields?.length ? 50 : 100)) || 0)) }
function familyReady(student: MktEnrollmentStudent) {
  const validPhone = [student.telefonoPadre, student.telefonoMadre].some((value) => String(value || '').replace(/\D/g, '').length >= 10)
  const validEmail = [student.emailPadre, student.emailMadre].some((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '')) && !String(value).includes('@casita'))
  return validPhone && validEmail
}
function primaryContact(student: MktEnrollmentStudent) { return String(student.fatherName || student.motherName || student.guardianName || 'Contacto registrado') }
function rowState(student: MktEnrollmentStudent) {
  if (student.status === 'Baja' || ['baja', 'baja_inscrita'].includes(String(student.enrollmentState || '').toLowerCase())) return 'inactive'
  if (student.enrollmentState === 'no_inscrito') return 'pending'
  return 'active'
}
function rowStatusLabel(student: MktEnrollmentStudent) { const state = rowState(student); return state === 'inactive' ? 'Baja' : state === 'pending' ? 'No inscrito' : 'Inscrito' }
function titleCase(value: string) { return String(value || '').replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-MX')) }
function formatNumber(value: unknown) { return Number(value || 0).toLocaleString('es-MX') }
function percent(value: unknown, totalValue: unknown) { const totalNumber = Number(totalValue || 0); return totalNumber ? Math.round((Number(value || 0) / totalNumber) * 100) : 0 }
</script>

<style scoped>
.enrollment-page { gap:16px; }
.enrollment-hero { background:linear-gradient(128deg,#075950 0%,#0b6b61 50%,#166f78 100%); display:grid; grid-template-columns:minmax(0,1fr) auto 150px; min-height:218px; overflow:hidden; padding:30px 32px; position:relative; }
.enrollment-hero::before { background:radial-gradient(circle,rgba(246,199,69,.3),transparent 68%); content:''; height:330px; position:absolute; right:20px; top:-180px; width:330px; }.enrollment-hero[data-level='primaria']{background:linear-gradient(128deg,#175d86,#347eb6 53%,#0b6b61)}.enrollment-hero[data-level='secundaria']{background:linear-gradient(128deg,#7d3f52,#b55252 52%,#315f87)}
.hero-copy{align-self:center;position:relative;z-index:2}.hero-copy .mkt-eyebrow{color:#cceee0}.hero-copy h1{color:white;font-size:clamp(2rem,4vw,3.35rem);letter-spacing:-.045em}.hero-copy>p:not(.mkt-eyebrow){color:#d9eeea;font-size:.86rem;margin:8px 0 0;max-width:610px}.hero-context{display:flex;flex-wrap:wrap;gap:7px;margin-top:20px}.hero-context>span{align-items:center;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.14);border-radius:999px;color:#ecf8f5;display:flex;font-size:.66rem;font-weight:800;gap:6px;min-height:31px;padding:0 10px}.hero-context>span i{background:#8fc849;border-radius:999px;height:7px;width:7px}.hero-context>span[data-state='stale'] i{background:#f6c745}.hero-context>span[data-state='expired'] i{background:#ec6b5d}.hero-actions{align-content:center;display:grid;gap:10px;min-width:190px;position:relative;z-index:2}.cycle-picker{display:grid;gap:5px}.cycle-picker span{color:#c8e5df;font-size:.61rem;font-weight:900;text-transform:uppercase}.cycle-picker select{appearance:none;background:rgba(255,255,255,.96);border:0;border-radius:13px;color:#17434a;font:inherit;font-size:.75rem;font-weight:850;min-height:43px;padding:0 12px}.export-btn{background:white!important;border:0!important;color:#0b6b61!important;box-shadow:0 13px 30px rgba(2,35,38,.2)!important}.hero-ambassador{align-self:end;height:184px;justify-self:end;object-fit:contain;position:relative;width:145px;z-index:1}
.connection-error,.access-state{align-items:center;display:grid;gap:18px;grid-template-columns:auto minmax(0,1fr) auto;padding:22px}.connection-error>span{align-items:center;background:#fff2ef;border-radius:18px;color:#b14f43;display:flex;height:56px;justify-content:center;width:56px}.connection-error h2,.access-state h2{font-size:1.3rem}.connection-error p:last-child,.access-state p:last-child{font-size:.76rem;margin:5px 0 0}.access-state{grid-template-columns:100px minmax(0,1fr)}.access-state img{height:100px;object-fit:contain;width:100px}
.plantel-switcher{display:flex;gap:9px;overflow-x:auto;padding:2px 1px 5px;scrollbar-width:none}.plantel-switcher button{align-items:center;background:rgba(255,255,255,.82);border:1px solid var(--mkt-line);border-radius:17px;color:#5f7174;cursor:pointer;display:grid;flex:0 0 min(250px,72vw);gap:10px;grid-template-columns:46px minmax(0,1fr) 8px;min-height:68px;padding:10px;text-align:left;transition:.18s ease}.plantel-switcher button:hover{transform:translateY(-1px)}.plantel-switcher button.active{background:#fff;border-color:rgba(11,107,97,.36);box-shadow:0 13px 30px rgba(14,55,61,.09);color:#123038}.plantel-code{align-items:center;background:#e9f7f0;border-radius:13px;color:#0b6b61;display:flex;font-size:.7rem;font-weight:950;height:46px;justify-content:center}.plantel-switcher button[data-level='primaria'] .plantel-code{background:#eaf3ff;color:#3979b1}.plantel-switcher button[data-level='secundaria'] .plantel-code{background:#fff0ed;color:#b05246}.plantel-switcher strong,.plantel-switcher small{display:block}.plantel-switcher strong{font-size:.72rem}.plantel-switcher small{color:#859294;font-size:.61rem;margin-top:3px}.plantel-switcher button>i{background:#dfe9e4;border-radius:999px;height:8px;width:8px}.plantel-switcher button.active>i{background:#8fc849;box-shadow:0 0 0 4px rgba(143,200,73,.16)}
.enrollment-kpis{display:grid;gap:10px;grid-template-columns:repeat(4,minmax(0,1fr))}.enrollment-kpi{align-items:center;background:#fff;border:1px solid var(--mkt-line);border-radius:19px;box-shadow:0 14px 34px rgba(14,55,61,.055);display:grid;gap:11px;grid-template-columns:44px minmax(0,1fr) auto;min-height:84px;padding:13px}.enrollment-kpi>span{align-items:center;background:#e9f7f0;border-radius:13px;color:#0b6b61;display:flex;height:44px;justify-content:center;width:44px}.enrollment-kpi.lime>span{background:#edf8e6;color:#5a882c}.enrollment-kpi.blue>span{background:#eaf3ff;color:#3979b1}.enrollment-kpi.coral>span{background:#fff0ed;color:#b05246}.enrollment-kpi small,.enrollment-kpi strong{display:block}.enrollment-kpi small{color:#77878a;font-size:.61rem}.enrollment-kpi strong{font-family:var(--font-title);font-size:1.38rem;margin-top:2px}.enrollment-kpi em,.enrollment-kpi button{background:#f2f7f4;border:0;border-radius:999px;color:#587075;font-size:.59rem;font-style:normal;font-weight:850;padding:6px 8px}.enrollment-kpi button{color:#a34e43;cursor:pointer}.enrollment-kpi[data-attention='true']{border-color:rgba(236,107,93,.3)}
.enrollment-workspace{align-items:start;display:grid;gap:14px;grid-template-columns:286px minmax(0,1fr)}.filters-panel{padding:17px;position:sticky;top:94px}.filter-title{align-items:center;display:flex;gap:10px}.filter-title>span{align-items:center;background:#edf8f3;border-radius:13px;color:#0b6b61;display:flex;height:42px;justify-content:center;width:42px}.filter-title h2{font-size:1rem}.filter-title .mkt-eyebrow{font-size:.57rem;margin-bottom:2px}.search-field{align-items:center;background:#f7faf8;border:1px solid #dce8e3;border-radius:14px;display:grid;gap:7px;grid-template-columns:18px minmax(0,1fr) 24px;margin-top:15px;padding:0 10px}.search-field svg{color:#6f8584}.search-field input{background:transparent;border:0;font:inherit;font-size:.69rem;min-height:43px;outline:0;width:100%}.search-field button{background:transparent;border:0;color:#7c8c8e;cursor:pointer;font-size:1.1rem}.filter-grid{display:grid;gap:9px;grid-template-columns:1fr 1fr;margin-top:12px}.filter-grid label{display:grid;gap:5px}.filter-grid label>span{color:#64777a;font-size:.58rem;font-weight:900;text-transform:uppercase}.filter-grid select{background:#fff;border:1px solid #dce7e2;border-radius:11px;color:#29494e;font:inherit;font-size:.66rem;min-height:39px;padding:0 8px}.clear-filters{align-items:center;background:transparent;border:0;color:#a45246;cursor:pointer;display:flex;font:inherit;font-size:.63rem;font-weight:800;gap:6px;margin-top:11px}.group-distribution{border-top:1px solid #e5ece8;margin-top:15px;padding-top:14px}.distribution-head{align-items:center;display:flex;justify-content:space-between;margin-bottom:8px}.distribution-head span{font-size:.68rem;font-weight:900}.distribution-head small{color:#899698;font-size:.57rem}.group-distribution button{align-items:center;background:transparent;border:0;border-radius:9px;color:#52676b;cursor:pointer;display:flex;font:inherit;font-size:.63rem;justify-content:space-between;padding:7px 6px;width:100%}.group-distribution button:hover{background:#f0f7f3;color:#0b6b61}.group-distribution button strong{background:#eaf4ef;border-radius:999px;font-size:.56rem;padding:4px 6px}
.students-panel{min-width:0;overflow:hidden}.students-head{align-items:center;border-bottom:1px solid #e4ece8;display:flex;justify-content:space-between;padding:18px 20px}.students-head h2{font-size:1.15rem}.students-head p:last-child{font-size:.65rem;margin:4px 0 0}.view-status{align-items:center;display:flex;gap:8px}.view-status>span{align-items:center;color:#638078;display:flex;font-size:.61rem;font-weight:800;gap:6px}.view-status>span i{background:#8fc849;border-radius:999px;height:7px;width:7px}.view-status button{align-items:center;background:#eef7f3;border:0;border-radius:11px;color:#0b6b61;cursor:pointer;display:flex;height:38px;justify-content:center;width:38px}.view-status button:disabled svg{animation:spin 1s linear infinite}.students-list{display:grid}.student-row{align-items:center;background:#fff;border:0;border-bottom:1px solid #edf1ef;color:inherit;cursor:pointer;display:grid;font:inherit;gap:12px;grid-template-columns:52px minmax(160px,1.6fr) minmax(100px,.75fr) minmax(150px,1.05fr) 100px 80px 18px;padding:11px 18px;text-align:left;transition:.15s ease;width:100%}.student-row:hover{background:#f8fbf9}.row-photo{align-items:center;background:#e9f7f0;border-radius:15px;display:flex;height:48px;justify-content:center;overflow:hidden;width:48px}.row-photo[data-level='primaria']{background:#eaf3ff}.row-photo[data-level='secundaria']{background:#fff0ed}.row-photo img{height:100%;object-fit:cover;width:100%}.row-photo b{color:#0b6b61;font-size:.7rem}.row-identity strong,.row-identity small,.row-group strong,.row-group small,.row-family strong,.row-family small{display:block}.row-identity strong{font-size:.72rem;line-height:1.2}.row-identity small,.row-group small,.row-family small{color:#829092;font-size:.56rem;margin-top:3px}.row-group strong,.row-family strong{font-size:.64rem;margin-top:3px}.row-family{align-items:center;display:flex;gap:8px;min-width:0}.row-family>i{align-items:center;background:#fff0ed;border-radius:10px;color:#b05246;display:flex;flex:0 0 auto;height:32px;justify-content:center;width:32px}.row-family[data-ready='true']>i{background:#edf8e6;color:#5c872e}.row-family span{min-width:0}.row-family strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.row-progress>span{background:#edf2ef;border-radius:999px;display:block;height:6px;overflow:hidden}.row-progress>span i{background:linear-gradient(90deg,#8fc849,#0b6b61);display:block;height:100%}.row-progress small{color:#687a7d;display:block;font-size:.56rem;margin-top:4px;text-align:right}.row-status{border-radius:999px;font-size:.55rem;font-weight:900;justify-self:start;padding:6px 8px}.row-status[data-state='active']{background:#edf8e6;color:#557f2a}.row-status[data-state='pending']{background:#fff7df;color:#85610f}.row-status[data-state='inactive']{background:#fff0ed;color:#a34e43}.row-arrow{color:#9bacaa;height:15px;width:15px}.students-footer{align-items:center;display:flex;justify-content:space-between;padding:14px 18px}.students-footer>span{color:#7b898c;font-size:.62rem}.students-loading{display:grid}.students-loading article{align-items:center;border-bottom:1px solid #edf1ef;display:grid;gap:12px;grid-template-columns:52px minmax(0,1fr) 90px;padding:11px 18px}.students-loading article>span{animation:shimmer 1.2s infinite;background:#eaf0ed;border-radius:15px;height:48px;width:48px}.students-loading article div{display:grid;gap:7px}.students-loading article i,.students-loading article b{animation:shimmer 1.2s infinite;background:#eaf0ed;border-radius:999px;height:8px}.students-loading article i:first-child{width:48%}.students-loading article i:last-child{width:28%}.students-loading article b{height:22px;width:80px}.students-state{align-items:center;display:flex;flex-direction:column;min-height:360px;justify-content:center;padding:28px;text-align:center}.students-state img{height:130px;object-fit:contain;width:130px}.students-state>svg{color:#b05246;height:32px;width:32px}.students-state h3{font-size:1.05rem;margin-top:8px}.students-state p{font-size:.72rem;margin:5px 0 15px}.error-state{background:linear-gradient(180deg,#fff,#fff8f6)}
.action-toast{align-items:center;background:#123f42;border:1px solid rgba(255,255,255,.16);border-radius:999px;bottom:24px;box-shadow:0 18px 48px rgba(5,35,40,.28);color:#fff;display:flex;font-size:.7rem;font-weight:850;gap:8px;left:50%;padding:11px 16px;position:fixed;transform:translateX(-50%);z-index:1300}.action-toast span{background:#8fc849;border-radius:999px;height:8px;width:8px}.action-toast[data-state='saving'] span{animation:pulse 1s infinite;background:#f6c745}.action-toast[data-state='failed']{background:#913f37}.action-toast[data-state='failed'] span{background:#ffd2ca}.status-toast-enter-active,.status-toast-leave-active{transition:.18s ease}.status-toast-enter-from,.status-toast-leave-to{opacity:0;transform:translate(-50%,10px)}
@keyframes shimmer{0%,100%{opacity:.55}50%{opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{50%{opacity:.35}}
@media(max-width:1180px){.enrollment-kpis{grid-template-columns:1fr 1fr}.student-row{grid-template-columns:48px minmax(150px,1.5fr) minmax(90px,.7fr) minmax(140px,1fr) 80px 18px}.row-progress{display:none}.enrollment-workspace{grid-template-columns:250px minmax(0,1fr)}}
@media(max-width:900px){.enrollment-hero{grid-template-columns:minmax(0,1fr) 160px;padding:24px}.hero-actions{grid-column:1/2;grid-row:2;margin-top:16px;grid-template-columns:1fr 1fr}.hero-ambassador{grid-column:2;grid-row:1/3}.enrollment-workspace{grid-template-columns:1fr}.filters-panel{position:static}.filter-grid{grid-template-columns:repeat(4,1fr)}.group-distribution{display:none}.student-row{grid-template-columns:48px minmax(130px,1.4fr) 100px minmax(130px,1fr) 72px 18px}.filters-panel{padding:14px}}
@media(max-width:720px){.enrollment-hero{border-radius:24px;grid-template-columns:minmax(0,1fr) 100px;min-height:240px;padding:20px}.hero-copy h1{font-size:2.15rem}.hero-copy>p:not(.mkt-eyebrow){font-size:.75rem}.hero-context span:nth-child(3){display:none}.hero-actions{grid-template-columns:1fr}.hero-ambassador{height:142px;width:105px}.plantel-switcher button{flex-basis:220px}.enrollment-kpis{grid-template-columns:1fr 1fr}.enrollment-kpi{grid-template-columns:39px minmax(0,1fr);min-height:76px;padding:10px}.enrollment-kpi>span{height:39px;width:39px}.enrollment-kpi em,.enrollment-kpi button{display:none}.enrollment-kpi strong{font-size:1.15rem}.filter-grid{grid-template-columns:1fr 1fr}.students-head{padding:15px}.students-head .view-status>span{display:none}.student-row{gap:10px;grid-template-columns:46px minmax(0,1fr) auto;padding:11px 13px}.row-photo{height:44px;width:44px}.row-group,.row-family,.row-progress,.row-arrow{display:none}.row-status{grid-column:3;grid-row:1}.row-identity{grid-column:2;grid-row:1}.students-footer{padding:12px 14px}.action-toast{bottom:78px;max-width:calc(100vw - 24px);text-align:center;white-space:normal}.connection-error{grid-template-columns:auto minmax(0,1fr)}.connection-error .mkt-btn{grid-column:1/-1}.access-state{grid-template-columns:78px minmax(0,1fr)}.access-state img{height:78px;width:78px}}
@media(max-width:430px){.enrollment-kpis{gap:8px}.enrollment-kpi small{font-size:.56rem}.hero-context>span{font-size:.59rem}.students-head h2{font-size:1rem}.filter-title h2{font-size:.9rem}}
</style>
