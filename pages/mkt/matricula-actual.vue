<template>
  <section class="mkt-page enrollment-page" data-product-area="mkt" data-product-screen="current-enrollment">
    <header v-if="enrollmentAvailable" class="enrollment-hero mkt-panel" :data-level="activeLevel">
      <div class="hero-copy">
        <p class="mkt-eyebrow">Marketing</p>
        <h1>Matrícula actual</h1>
        <div class="hero-context">
          <span><FamilyPersonasIcon name="school" /> {{ activePlantelCode }}</span>
          <span><FamilyPersonasIcon name="calendar" /> {{ activeCycleLabel }}</span>
          <span :data-state="freshnessState"><i />{{ freshnessLabel }}</span>
        </div>
      </div>
      <div class="hero-actions">
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

    <section v-if="optionsPending" class="mkt-panel page-state" data-state="loading">
      <HuskyPassLoader label="Matrícula actual" contained />
    </section>

    <section v-else-if="!enrollmentAvailable" class="mkt-panel page-state availability-state">
      <img src="/personas-autorizadas/ambassadors/primaria-brave.png" alt="" aria-hidden="true" />
      <div><h2>De momento la base actual solo se encuentra disponible para algunos usuarios</h2></div>
    </section>

    <template v-else>
      <nav class="plantel-switcher" aria-label="Planteles">
        <button
          v-for="plantel in availablePlanteles"
          :key="plantel.code"
          type="button"
          :class="{ active: selectedPlantel === plantel.code }"
          :data-level="plantel.level"
          @click="selectedPlantel = plantel.code"
        >
          <span>{{ plantel.code }}</span>
          <i />
        </button>
      </nav>

      <section v-if="overviewLoading && !overview" class="overview-loading mkt-panel">
        <HuskyPassLoader label="Resumen" contained />
      </section>

      <section v-else-if="overviewError && !overview" class="mkt-panel page-state" data-state="error">
        <FamilyPersonasIcon name="alert" />
        <div><h2>No pudimos abrir la matrícula</h2><p>{{ overviewError }}</p></div>
        <button class="mkt-btn" type="button" @click="loadOverview">Reintentar</button>
      </section>

      <template v-else>
        <section class="enrollment-kpis" aria-label="Resumen">
          <article class="enrollment-kpi total">
            <span><FamilyPersonasIcon name="people" /></span>
            <div><small>Inscritos</small><strong>{{ formatNumber(totals.inscritos) }}</strong></div>
            <em>{{ activePlantelCode }}</em>
          </article>
          <article class="enrollment-kpi internal">
            <span><FamilyPersonasIcon name="home" /></span>
            <div><small>Internos</small><strong>{{ formatNumber(totals.internos) }}</strong></div>
            <em>{{ internalPercent }}%</em>
          </article>
          <article class="enrollment-kpi external">
            <span><FamilyPersonasIcon name="arrow" /></span>
            <div><small>Externos</small><strong>{{ formatNumber(totals.externos) }}</strong></div>
            <em>{{ externalPercent }}%</em>
          </article>
          <article class="enrollment-kpi visible">
            <span><FamilyPersonasIcon name="document" /></span>
            <div><small>Registros</small><strong>{{ formatNumber(totals.totalVisible) }}</strong></div>
            <em>{{ formatNumber(totals.noInscritos + totals.bajas) }} otros</em>
          </article>
        </section>

        <section class="overview-layout">
          <article class="grade-matrix mkt-panel">
            <header class="matrix-head">
              <div><p class="mkt-eyebrow">Ciclo {{ activeCycleLabel }}</p><h2>Por grado</h2></div>
              <button type="button" :disabled="overviewLoading" aria-label="Actualizar resumen" @click="loadOverview">
                <FamilyPersonasIcon name="replace" />
              </button>
            </header>

            <div v-if="distribution.length" class="matrix-table" role="table" aria-label="Internos y externos por grado">
              <div class="matrix-row matrix-labels" role="row">
                <span role="columnheader">Grado</span>
                <span role="columnheader">Internos</span>
                <span role="columnheader">Externos</span>
                <span role="columnheader">Total</span>
                <span />
              </div>

              <div v-for="grade in distribution" :key="grade.key" class="grade-block" :data-open="isGradeOpen(grade.key)">
                <button class="matrix-row grade-row" type="button" role="row" @click="toggleGrade(grade.key)">
                  <span class="grade-name" role="cell"><strong>{{ grade.label }}</strong><small>{{ grade.groups.length }} grupo{{ grade.groups.length === 1 ? '' : 's' }}</small></span>
                  <span class="number-cell internal-number" role="cell">{{ formatNumber(grade.internos) }}</span>
                  <span class="number-cell external-number" role="cell">{{ formatNumber(grade.externos) }}</span>
                  <span class="number-cell total-number" role="cell">{{ formatNumber(grade.total) }}</span>
                  <FamilyPersonasIcon name="arrow" />
                </button>

                <div v-if="isGradeOpen(grade.key)" class="group-rows">
                  <button
                    v-for="group in grade.groups"
                    :key="group.key"
                    class="matrix-row group-row"
                    type="button"
                    @click="selectGroup(grade.rawLabel, group.label)"
                  >
                    <span class="grade-name"><i /> <strong>{{ group.label }}</strong></span>
                    <span class="number-cell">{{ formatNumber(group.internos) }}</span>
                    <span class="number-cell">{{ formatNumber(group.externos) }}</span>
                    <span class="number-cell">{{ formatNumber(group.total) }}</span>
                    <FamilyPersonasIcon name="search" />
                  </button>
                </div>
              </div>

              <button class="matrix-row matrix-total" type="button" @click="clearRoster()">
                <span><strong>Total</strong></span>
                <span>{{ formatNumber(totals.internos) }}</span>
                <span>{{ formatNumber(totals.externos) }}</span>
                <span>{{ formatNumber(totals.inscritos) }}</span>
                <span />
              </button>
            </div>

            <div v-else class="matrix-empty">
              <img :src="activeAmbassador" alt="" aria-hidden="true" />
              <h3>De momento la base actual solo se encuentra disponible para algunos usuarios</h3>
            </div>
          </article>

          <aside class="composition-card mkt-panel" :data-level="activeLevel">
            <div class="composition-ring" :style="{ '--internal-angle': `${internalPercent * 3.6}deg` }">
              <span><strong>{{ internalPercent }}%</strong><small>internos</small></span>
            </div>
            <div class="composition-copy">
              <p class="mkt-eyebrow">Composición</p>
              <h2>{{ activePlantelCode }}</h2>
              <div><span><i class="internal-dot" />Internos</span><strong>{{ formatNumber(totals.internos) }}</strong></div>
              <div><span><i class="external-dot" />Externos</span><strong>{{ formatNumber(totals.externos) }}</strong></div>
            </div>
            <img :src="activeMascot" alt="" aria-hidden="true" />
          </aside>
        </section>

        <section ref="rosterRef" class="roster-panel mkt-panel">
          <header class="roster-head">
            <div>
              <p class="mkt-eyebrow">Alumnos</p>
              <h2>{{ rosterTitle }}</h2>
            </div>
            <div class="roster-head-actions">
              <label class="roster-search">
                <FamilyPersonasIcon name="search" />
                <input v-model="filters.search" type="search" placeholder="Nombre o matrícula" autocomplete="off" />
                <button v-if="filters.search" type="button" aria-label="Limpiar búsqueda" @click="filters.search = ''">×</button>
              </label>
              <label class="status-filter">
                <span>Estado</span>
                <select v-model="filters.status">
                  <option value="">Todos</option>
                  <option value="inscrito">Inscritos</option>
                  <option value="no_inscrito">No inscritos</option>
                  <option value="bajas">Bajas</option>
                </select>
              </label>
              <button v-if="hasRosterFilters" class="clear-roster" type="button" @click="clearRoster()"><FamilyPersonasIcon name="close" /> Limpiar</button>
            </div>
          </header>

          <div v-if="!hasRosterQuery" class="roster-entry">
            <img :src="activeAmbassador" alt="" aria-hidden="true" />
            <div>
              <p class="mkt-eyebrow">Grados</p>
              <div class="grade-pills">
                <button v-for="grade in distribution" :key="grade.key" type="button" @click="selectGrade(grade.rawLabel)">
                  <strong>{{ grade.label }}</strong><span>{{ grade.total }}</span>
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="studentsLoading" class="roster-loading">
            <article v-for="index in 6" :key="index"><span /><div><i /><i /></div><b /></article>
          </div>

          <section v-else-if="listError" class="roster-state">
            <FamilyPersonasIcon name="alert" /><h3>No pudimos cargar alumnos</h3><p>{{ listError }}</p><button class="mkt-btn" type="button" @click="loadStudents">Reintentar</button>
          </section>

          <section v-else-if="!students.length" class="roster-state">
            <img :src="activeAmbassador" alt="" aria-hidden="true" /><h3>No hay alumnos en esta selección</h3>
          </section>

          <div v-else class="roster-hierarchy">
            <section v-for="grade in rosterHierarchy" :key="grade.key" class="roster-grade">
              <header>
                <span>{{ grade.label }}</span>
                <small>{{ grade.total }} alumno{{ grade.total === 1 ? '' : 's' }}</small>
              </header>

              <div class="roster-groups">
                <article v-for="group in grade.groups" :key="group.key" class="roster-group" :data-open="isRosterGroupOpen(group.key)">
                  <button class="roster-group-head" type="button" @click="toggleRosterGroup(group.key)">
                    <span><strong>Grupo {{ group.label }}</strong><small>{{ group.students.length }} alumno{{ group.students.length === 1 ? '' : 's' }}</small></span>
                    <span class="group-composition"><i>{{ group.internos }} internos</i><i>{{ group.externos }} externos</i></span>
                    <FamilyPersonasIcon name="arrow" />
                  </button>

                  <div v-if="isRosterGroupOpen(group.key)" class="student-cards">
                    <button v-for="student in group.students" :key="student.matricula" class="student-card" type="button" @click="openStudent(student)">
                      <span class="student-photo" :data-level="activeLevel">
                        <img v-if="student.photoUrl && !failedPhotos.has(student.matricula)" :src="student.photoUrl" :alt="`Foto de ${student.fullName}`" loading="lazy" @error="markPhotoFailed(student.matricula)" />
                        <b v-else>{{ initials(student.fullName) }}</b>
                      </span>
                      <span class="student-identity"><strong>{{ student.fullName || 'Alumno sin nombre' }}</strong><small>{{ student.matricula }}</small></span>
                      <span class="student-entry" :data-kind="entryKind(student)">{{ entryLabel(student) }}</span>
                      <span class="student-contact"><small>Familia</small><strong>{{ primaryContact(student) }}</strong></span>
                      <span class="student-record"><small>Ficha</small><strong>{{ studentCompletion(student) }}%</strong></span>
                      <FamilyPersonasIcon name="arrow" />
                    </button>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </section>
      </template>
    </template>

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

    <Transition name="status-toast">
      <div v-if="actionMessage" class="action-toast" :data-state="actionState"><span />{{ actionMessage }}</div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type {
  MktEnrollmentOverviewResponse,
  MktEnrollmentStudent,
  MktEnrollmentStudentsResponse
} from '~/types/mktEnrollment'
import { useMktEnrollmentOptions } from '~/composables/useMktEnrollmentOptions'

definePageMeta({ layout: 'mkt', middleware: 'mkt' })

interface RosterGroup {
  key: string
  label: string
  internos: number
  externos: number
  students: MktEnrollmentStudent[]
}

interface RosterGrade {
  key: string
  label: string
  total: number
  groups: RosterGroup[]
}

const {
  data: options,
  pending: optionsPending,
  available: enrollmentAvailable,
  availablePlanteles
} = useMktEnrollmentOptions()

const selectedPlantel = ref('')
const selectedCiclo = ref('')
const overview = ref<MktEnrollmentOverviewResponse | null>(null)
const overviewLoading = ref(false)
const overviewError = ref('')
const students = ref<MktEnrollmentStudent[]>([])
const studentsLoading = ref(false)
const listError = ref('')
const selectedStudent = ref<MktEnrollmentStudent | null>(null)
const failedPhotos = reactive(new Set<string>())
const expandedGrades = ref<string[]>([])
const expandedRosterGroups = ref<string[]>([])
const rosterRef = ref<HTMLElement | null>(null)
const exporting = ref(false)
const actionMessage = ref('')
const actionState = ref<'saving' | 'saved' | 'failed'>('saved')
const filters = reactive({ search: '', grado: '', grupo: '', status: '' })
let searchTimer: ReturnType<typeof setTimeout> | null = null
let overviewRequestSequence = 0
let studentRequestSequence = 0
let toastTimer: ReturnType<typeof setTimeout> | null = null

const activePlantel = computed(() => availablePlanteles.value.find((item) => item.code === selectedPlantel.value) || null)
const activePlantelCode = computed(() => activePlantel.value?.code || '—')
const activeLevel = computed(() => activePlantel.value?.level || 'preescolar')
const activeAmbassador = computed(() => ({
  daycare: '/personas-autorizadas/ambassadors/daycare-sunny.png',
  preescolar: '/personas-autorizadas/ambassadors/preescolar-joy.png',
  primaria: '/personas-autorizadas/ambassadors/primaria-brave.png',
  secundaria: '/personas-autorizadas/ambassadors/secundaria-hope.png'
}[activeLevel.value]))
const activeMascot = computed(() => ({
  daycare: '/personas-autorizadas/mascots/sunny-guarderia/1-SUNNY-GUARDERIA/SUNNY-4.png',
  preescolar: '/personas-autorizadas/mascots/joy-preescolar/2-JOY-PREESCOLAR/JOY-4.png',
  primaria: '/personas-autorizadas/mascots/brave-primaria/3-BRAVE-PRIMARIA/BRAVE-4.png',
  secundaria: '/personas-autorizadas/mascots/hope-secundaria/4-HOPE-SECUNDARIA/HOPE-4.png'
}[activeLevel.value]))
const activeCycleLabel = computed(() => options.value?.schoolYears.find((item) => item.value === selectedCiclo.value)?.label || selectedCiclo.value || '—')
const canQuery = computed(() => Boolean(enrollmentAvailable.value && selectedPlantel.value && selectedCiclo.value))
const distribution = computed(() => overview.value?.distribution || [])
const totals = computed(() => overview.value?.totals || { internos: 0, externos: 0, inscritos: 0, totalVisible: 0, noInscritos: 0, bajas: 0 })
const internalPercent = computed(() => percent(totals.value.internos, totals.value.inscritos))
const externalPercent = computed(() => Math.max(0, 100 - internalPercent.value))
const hasRosterQuery = computed(() => Boolean(filters.search || filters.grado || filters.grupo || filters.status))
const hasRosterFilters = computed(() => hasRosterQuery.value)
const rosterTitle = computed(() => {
  if (filters.search) return `Resultados para “${filters.search}”`
  if (filters.grado && filters.grupo) return `${gradeDisplay(filters.grado)} · Grupo ${filters.grupo}`
  if (filters.grado) return gradeDisplay(filters.grado)
  if (filters.status) return 'Alumnos por estado'
  return 'Alumnos'
})
const freshnessState = computed(() => {
  if (overviewLoading.value) return 'loading'
  return String(overview.value?.meta?.freshness || (options.value?.connected ? 'fresh' : 'stale')).toLowerCase()
})
const freshnessLabel = computed(() => {
  if (overviewLoading.value) return 'Actualizando'
  if (freshnessState.value === 'stale') return 'Sincronización reciente'
  if (freshnessState.value === 'expired') return 'Actualizando origen'
  return 'Actualizado'
})

const rosterHierarchy = computed<RosterGrade[]>(() => {
  const grades = new Map<string, { label: string; raw: string; groups: Map<string, MktEnrollmentStudent[]> }>()
  for (const student of students.value) {
    const rawGrade = String(student.grado || 'Sin grado')
    const gradeKey = gradeCanonicalKey(rawGrade)
    const grade = grades.get(gradeKey) || { label: gradeDisplay(rawGrade), raw: rawGrade, groups: new Map<string, MktEnrollmentStudent[]>() }
    const groupLabel = String(student.group || student.grupo || 'Sin grupo')
    const groupKey = groupLabel.toLocaleLowerCase('es-MX')
    const rows = grade.groups.get(groupKey) || []
    rows.push(student)
    grade.groups.set(groupKey, rows)
    grades.set(gradeKey, grade)
  }
  return [...grades.entries()]
    .map(([key, grade]) => ({
      key,
      label: grade.label,
      total: [...grade.groups.values()].reduce((sum, rows) => sum + rows.length, 0),
      groups: [...grade.groups.entries()]
        .map(([groupKey, rows]) => ({
          key: `${key}:${groupKey}`,
          label: String(rows[0]?.group || rows[0]?.grupo || 'Sin grupo'),
          internos: rows.filter((student) => entryKind(student) === 'interno').length,
          externos: rows.filter((student) => entryKind(student) === 'externo').length,
          students: [...rows].sort((left, right) => String(left.fullName).localeCompare(String(right.fullName), 'es-MX'))
        }))
        .sort((left, right) => left.label.localeCompare(right.label, 'es-MX', { numeric: true }))
    }))
    .sort((left, right) => gradeOrder(left.label) - gradeOrder(right.label) || left.label.localeCompare(right.label, 'es-MX'))
})

watch(options, (value) => {
  if (!value) return
  if (!selectedPlantel.value || !availablePlanteles.value.some((item) => item.code === selectedPlantel.value)) selectedPlantel.value = value.defaultPlantel || availablePlanteles.value[0]?.code || ''
  if (!selectedCiclo.value || !value.schoolYears.some((item) => item.value === selectedCiclo.value)) selectedCiclo.value = value.defaultCiclo || value.schoolYears[0]?.value || ''
}, { immediate: true })

watch([selectedPlantel, selectedCiclo], () => {
  clearRoster(false)
  expandedGrades.value = []
  selectedStudent.value = null
  if (canQuery.value) loadOverview()
})

watch(() => [filters.grado, filters.grupo, filters.status], () => {
  if (canQuery.value && hasRosterQuery.value) loadStudents()
  else if (!hasRosterQuery.value) students.value = []
})

watch(() => filters.search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (canQuery.value && hasRosterQuery.value) loadStudents()
    else students.value = []
  }, 320)
})

async function loadOverview() {
  if (!canQuery.value) return
  const sequence = ++overviewRequestSequence
  overviewLoading.value = true
  overviewError.value = ''
  try {
    const response = await $fetch<MktEnrollmentOverviewResponse>('/api/mkt/enrollment/overview', {
      query: { plantel: selectedPlantel.value, ciclo: selectedCiclo.value }
    })
    if (sequence !== overviewRequestSequence) return
    overview.value = response
  } catch (caught: any) {
    if (sequence !== overviewRequestSequence) return
    overviewError.value = caught?.data?.message || caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible consultar la matrícula.'
  } finally {
    if (sequence === overviewRequestSequence) overviewLoading.value = false
  }
}

function studentQuery(cursor = '') {
  return {
    plantel: selectedPlantel.value,
    ciclo: selectedCiclo.value,
    search: filters.search,
    grado: filters.grado,
    grupo: filters.grupo,
    status: filters.status,
    cursor,
    limit: 500
  }
}

async function loadStudents() {
  if (!canQuery.value || !hasRosterQuery.value) return
  const sequence = ++studentRequestSequence
  studentsLoading.value = true
  listError.value = ''
  students.value = []
  try {
    const collected: MktEnrollmentStudent[] = []
    const seen = new Set<string>()
    const seenCursors = new Set<string>()
    let cursor = ''
    for (let page = 0; page < 60; page += 1) {
      const response = await $fetch<MktEnrollmentStudentsResponse>('/api/mkt/enrollment/students', { query: studentQuery(cursor) })
      if (sequence !== studentRequestSequence) return
      for (const student of response.data) {
        if (seen.has(student.matricula)) continue
        seen.add(student.matricula)
        collected.push(student)
      }
      const next = response.pagination.nextCursor || ''
      if (!next || seenCursors.has(next)) break
      seenCursors.add(next)
      cursor = next
    }
    if (sequence !== studentRequestSequence) return
    students.value = collected
    syncRosterExpansion()
  } catch (caught: any) {
    if (sequence !== studentRequestSequence) return
    listError.value = caught?.data?.message || caught?.data?.statusMessage || caught?.statusMessage || 'No fue posible consultar alumnos.'
  } finally {
    if (sequence === studentRequestSequence) studentsLoading.value = false
  }
}

function toggleGrade(key: string) {
  expandedGrades.value = isGradeOpen(key)
    ? expandedGrades.value.filter((item) => item !== key)
    : [...expandedGrades.value, key]
}

function isGradeOpen(key: string) {
  return expandedGrades.value.includes(key)
}

function selectGrade(rawGrade: string) {
  filters.grado = rawGrade
  filters.grupo = ''
  filters.search = ''
  expandedGrades.value = Array.from(new Set([...expandedGrades.value, gradeCanonicalKey(rawGrade)]))
  expandedRosterGroups.value = []
  scrollToRoster()
}

function selectGroup(rawGrade: string, group: string) {
  filters.grado = rawGrade
  filters.grupo = group
  filters.search = ''
  expandedRosterGroups.value = [`${gradeCanonicalKey(rawGrade)}:${group.toLocaleLowerCase('es-MX')}`]
  scrollToRoster()
}

function clearRoster(scroll = true) {
  filters.search = ''
  filters.grado = ''
  filters.grupo = ''
  filters.status = ''
  students.value = []
  listError.value = ''
  expandedRosterGroups.value = []
  if (scroll) scrollToRoster()
}

function scrollToRoster() {
  window.setTimeout(() => rosterRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
}

function toggleRosterGroup(key: string) {
  expandedRosterGroups.value = isRosterGroupOpen(key)
    ? expandedRosterGroups.value.filter((item) => item !== key)
    : [...expandedRosterGroups.value, key]
}

function isRosterGroupOpen(key: string) {
  if (filters.search || filters.grupo) return true
  return expandedRosterGroups.value.includes(key)
}

function syncRosterExpansion() {
  if (filters.search || filters.grupo) {
    expandedRosterGroups.value = rosterHierarchy.value.flatMap((grade) => grade.groups.map((group) => group.key))
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
    showAction(caught?.data?.message || 'No se pudo actualizar la ficha.', 'failed')
  }
}

function replaceListStudent(student: MktEnrollmentStudent) {
  const index = students.value.findIndex((item) => item.matricula === student.matricula)
  if (index >= 0) students.value.splice(index, 1, student)
}

function applyOptimisticStudent(student: MktEnrollmentStudent) {
  replaceListStudent(student)
  showAction('Guardando cambios…', 'saving')
}

function applySavedStudent(student: MktEnrollmentStudent) {
  replaceListStudent(student)
  selectedStudent.value = student
  showAction('Información actualizada.', 'saved')
  window.setTimeout(() => { if (canQuery.value) loadOverview() }, 180)
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
    const params = new URLSearchParams({ plantel: selectedPlantel.value, ciclo: selectedCiclo.value })
    if (filters.search) params.set('search', filters.search)
    if (filters.grado) params.set('grado', filters.grado)
    if (filters.grupo) params.set('grupo', filters.grupo)
    if (filters.status) params.set('status', filters.status)
    const link = document.createElement('a')
    link.href = `/api/mkt/enrollment/export?${params.toString()}`
    link.download = ''
    document.body.appendChild(link)
    link.click()
    link.remove()
    showAction('Excel preparado.', 'saved')
  } finally {
    window.setTimeout(() => { exporting.value = false }, 900)
  }
}

function gradeCanonicalKey(value: unknown) {
  const order = gradeOrder(value)
  if (Number.isFinite(order)) return `grade-${order}`
  return `grade-${String(value || 'sin-grado').toLocaleLowerCase('es-MX').replace(/[^a-z0-9áéíóúñ]+/giu, '-')}`
}

function gradeOrder(value: unknown) {
  const raw = String(value || '').toLocaleLowerCase('es-MX').replace(/[º°]/g, '')
  const number = raw.match(/\d{1,2}/)?.[0]
  if (number) return Number(number)
  const words: Record<string, number> = { primero: 1, primer: 1, segundo: 2, tercero: 3, tercer: 3, cuarto: 4, quinto: 5, sexto: 6 }
  for (const [word, order] of Object.entries(words)) if (raw.includes(word)) return order
  return Number.POSITIVE_INFINITY
}

function gradeDisplay(value: unknown) {
  const order = gradeOrder(value)
  return Number.isFinite(order) ? `${order}°` : titleCase(String(value || 'Sin grado'))
}

function markPhotoFailed(matricula: string) { failedPhotos.add(matricula) }
function initials(name: string) { return String(name || 'HP').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() }
function studentCompletion(student: MktEnrollmentStudent) { return Math.max(0, Math.min(100, Number(student.completenessTiers?.basic?.progress ?? (student.missingFields?.length ? 50 : 100)) || 0)) }
function primaryContact(student: MktEnrollmentStudent) { return String(student.fatherName || student.motherName || student.guardianName || 'Sin registro') }
function entryKind(student: MktEnrollmentStudent) { return String(student.tipoIngresoValue || student.tipoIngreso || '').toLocaleLowerCase('es-MX') === 'interno' ? 'interno' : 'externo' }
function entryLabel(student: MktEnrollmentStudent) { return entryKind(student) === 'interno' ? 'Interno' : 'Externo' }
function titleCase(value: string) { return String(value || '').replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-MX')) }
function formatNumber(value: unknown) { return Number(value || 0).toLocaleString('es-MX') }
function percent(value: unknown, totalValue: unknown) { const total = Number(totalValue || 0); return total ? Math.round((Number(value || 0) / total) * 100) : 0 }
</script>

<style scoped>
.enrollment-page{gap:16px}.enrollment-hero{background:linear-gradient(128deg,#075950 0%,#0b6b61 52%,#166f78 100%);display:grid;grid-template-columns:minmax(0,1fr) auto 158px;min-height:202px;overflow:hidden;padding:28px 31px;position:relative}.enrollment-hero::before{background:radial-gradient(circle,rgba(246,199,69,.3),transparent 68%);content:'';height:330px;position:absolute;right:18px;top:-190px;width:330px}.enrollment-hero[data-level='primaria']{background:linear-gradient(128deg,#175d86,#347eb6 53%,#0b6b61)}.enrollment-hero[data-level='secundaria']{background:linear-gradient(128deg,#7d3f52,#b55252 52%,#315f87)}.hero-copy{align-self:center;position:relative;z-index:1}.hero-copy .mkt-eyebrow{color:#bde7d7}.hero-copy h1{color:#fff;font-size:2.55rem;line-height:1;margin-top:5px}.hero-context{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px}.hero-context>span{align-items:center;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.14);border-radius:999px;color:#e7f5f0;display:flex;font-size:.64rem;font-weight:850;gap:6px;padding:7px 9px}.hero-context svg{height:14px;width:14px}.hero-context i{background:#8fc849;border-radius:999px;height:7px;width:7px}.hero-context [data-state='loading'] i{animation:pulse 1s infinite;background:#f6c745}.hero-context [data-state='stale'] i,.hero-context [data-state='expired'] i{background:#f6c745}.hero-actions{align-content:center;display:grid;gap:9px;position:relative;z-index:1}.cycle-picker{display:grid;gap:5px}.cycle-picker>span{color:#cce5df;font-size:.59rem;font-weight:900;text-transform:uppercase}.cycle-picker select{background:rgba(255,255,255,.96);border:0;border-radius:12px;color:#23484c;font:inherit;font-size:.7rem;font-weight:850;min-height:42px;padding:0 11px}.export-btn{background:#f6c745!important;border-color:#f6c745!important;color:#26474c!important;justify-content:center}.hero-ambassador{align-self:end;height:174px;justify-self:end;object-fit:contain;position:relative;width:145px;z-index:1}.page-state{align-items:center;display:grid;gap:14px;grid-template-columns:auto minmax(0,1fr) auto;min-height:128px;padding:22px}.page-state>svg{color:#b14f43;height:28px;width:28px}.page-state h2{font-size:1.04rem}.page-state p{font-size:.7rem;margin:4px 0 0}.availability-state{grid-template-columns:112px minmax(0,1fr);min-height:220px}.availability-state img{height:108px;object-fit:contain;width:108px}.availability-state h2{font-size:clamp(1.05rem,2vw,1.35rem);line-height:1.35;max-width:620px}.no-planteles{grid-template-columns:100px minmax(0,1fr)}.no-planteles img{height:94px;object-fit:contain;width:94px}.plantel-switcher{display:flex;gap:8px;overflow-x:auto;padding:2px 1px 4px;scrollbar-width:none}.plantel-switcher button{align-items:center;background:rgba(255,255,255,.9);border:1px solid var(--mkt-line);border-radius:15px;color:#637477;cursor:pointer;display:flex;flex:0 0 auto;font:inherit;font-size:.75rem;font-weight:950;gap:9px;min-height:48px;padding:8px 13px;transition:.16s ease}.plantel-switcher button>span{align-items:center;background:#e9f7f0;border-radius:10px;color:#0b6b61;display:flex;height:31px;justify-content:center;min-width:39px;padding-inline:7px}.plantel-switcher button[data-level='primaria']>span{background:#eaf3ff;color:#3979b1}.plantel-switcher button[data-level='secundaria']>span{background:#fff0ed;color:#b05246}.plantel-switcher button>i{background:#d8e4df;border-radius:999px;height:7px;width:7px}.plantel-switcher button.active{background:#fff;border-color:rgba(11,107,97,.4);box-shadow:0 12px 26px rgba(14,55,61,.09);color:#123038}.plantel-switcher button.active>i{background:#8fc849;box-shadow:0 0 0 4px rgba(143,200,73,.15)}.overview-loading{min-height:260px}.enrollment-kpis{display:grid;gap:10px;grid-template-columns:repeat(4,minmax(0,1fr))}.enrollment-kpi{align-items:center;background:#fff;border:1px solid var(--mkt-line);border-radius:19px;box-shadow:0 14px 34px rgba(14,55,61,.055);display:grid;gap:11px;grid-template-columns:44px minmax(0,1fr) auto;min-height:84px;padding:13px}.enrollment-kpi>span{align-items:center;background:#e9f7f0;border-radius:13px;color:#0b6b61;display:flex;height:44px;justify-content:center;width:44px}.enrollment-kpi.internal>span{background:#e6f5ff;color:#347eb6}.enrollment-kpi.external>span{background:#fff0ed;color:#b05246}.enrollment-kpi.visible>span{background:#fff8df;color:#8a690c}.enrollment-kpi small,.enrollment-kpi strong{display:block}.enrollment-kpi small{color:#77878a;font-size:.61rem}.enrollment-kpi strong{font-family:var(--font-title);font-size:1.45rem;margin-top:2px}.enrollment-kpi em{background:#f2f7f4;border-radius:999px;color:#587075;font-size:.59rem;font-style:normal;font-weight:850;padding:6px 8px}.overview-layout{align-items:stretch;display:grid;gap:14px;grid-template-columns:minmax(0,1.8fr) minmax(270px,.7fr)}.grade-matrix{overflow:hidden}.matrix-head{align-items:center;border-bottom:1px solid #e4ece8;display:flex;justify-content:space-between;padding:18px 20px}.matrix-head h2{font-size:1.2rem}.matrix-head button{align-items:center;background:#eef7f3;border:0;border-radius:11px;color:#0b6b61;cursor:pointer;display:flex;height:38px;justify-content:center;width:38px}.matrix-head button:disabled svg{animation:spin 1s linear infinite}.matrix-table{min-width:560px}.matrix-row{align-items:center;display:grid;gap:10px;grid-template-columns:minmax(150px,1.4fr) repeat(3,minmax(82px,.55fr)) 28px;min-height:54px;padding:0 20px}.matrix-labels{background:#f6f9f7;border-bottom:1px solid #e7eeeb;color:#7b898b;font-size:.58rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase}.matrix-labels span:not(:first-child){text-align:center}.grade-block{border-bottom:1px solid #edf1ef}.grade-block:last-of-type{border-bottom:0}.grade-row,.group-row,.matrix-total{background:#fff;border:0;color:inherit;cursor:pointer;font:inherit;text-align:left;width:100%}.grade-row:hover,.group-row:hover{background:#f8fbf9}.grade-name strong,.grade-name small{display:block}.grade-name strong{font-family:var(--font-title);font-size:.9rem}.grade-name small{color:#839092;font-size:.58rem;margin-top:2px}.number-cell{text-align:center}.grade-row .number-cell{font-family:var(--font-title);font-size:.9rem}.internal-number{color:#347eb6}.external-number{color:#b05246}.total-number{color:#0b6b61}.grade-row>svg,.group-row>svg{color:#9aabaa;height:16px;justify-self:center;transition:.18s ease;width:16px}.grade-block[data-open='true'] .grade-row>svg{transform:rotate(90deg)}.group-rows{background:#f8fbf9;border-top:1px solid #edf1ef;padding:4px 0 7px}.group-row{background:transparent;min-height:42px}.group-row .grade-name{align-items:center;display:flex;gap:10px;padding-left:14px}.group-row .grade-name i{background:#8fc849;border-radius:999px;height:6px;width:6px}.group-row .grade-name strong{font-family:inherit;font-size:.68rem}.group-row .number-cell{color:#617578;font-size:.66rem;font-weight:800}.group-row>svg{height:14px;width:14px}.matrix-total{background:#0b5f57;color:#fff;font-size:.78rem;font-weight:900;min-height:58px}.matrix-total span:not(:first-child){text-align:center}.matrix-empty{align-items:center;display:flex;flex-direction:column;justify-content:center;min-height:340px;padding:30px}.matrix-empty img{height:130px;object-fit:contain;width:130px}.matrix-empty h3{font-size:1rem;margin-top:8px}.composition-card{background:linear-gradient(155deg,#0a5c55,#123f49);color:#fff;display:grid;grid-template-rows:auto auto 1fr;overflow:hidden;padding:22px;position:relative}.composition-card[data-level='primaria']{background:linear-gradient(155deg,#2f75ad,#155d83)}.composition-card[data-level='secundaria']{background:linear-gradient(155deg,#a3484f,#70425b)}.composition-ring{align-items:center;background:conic-gradient(#f6c745 var(--internal-angle),rgba(255,255,255,.13) 0);border-radius:999px;display:flex;height:142px;justify-content:center;justify-self:center;position:relative;width:142px}.composition-ring::after{background:#0b554f;border-radius:999px;content:'';inset:11px;position:absolute}.composition-card[data-level='primaria'] .composition-ring::after{background:#246a9a}.composition-card[data-level='secundaria'] .composition-ring::after{background:#89464e}.composition-ring span{position:relative;text-align:center;z-index:1}.composition-ring strong,.composition-ring small{display:block}.composition-ring strong{font-family:var(--font-title);font-size:1.65rem}.composition-ring small{color:#d7ebe5;font-size:.61rem}.composition-copy{margin-top:18px;position:relative;z-index:1}.composition-copy .mkt-eyebrow{color:#c7e3dc}.composition-copy h2{color:#fff;font-size:1.3rem;margin:2px 0 12px}.composition-copy>div{align-items:center;border-top:1px solid rgba(255,255,255,.12);display:flex;font-size:.68rem;justify-content:space-between;padding:9px 0}.composition-copy>div span{align-items:center;display:flex;gap:7px}.composition-copy i{border-radius:999px;height:7px;width:7px}.internal-dot{background:#7fc5f2}.external-dot{background:#ff9d8f}.composition-card>img{align-self:end;filter:drop-shadow(0 14px 22px rgba(0,0,0,.15));height:142px;justify-self:end;margin-bottom:-28px;margin-right:-18px;object-fit:contain;opacity:.92;width:142px}.roster-panel{overflow:hidden;scroll-margin-top:90px}.roster-head{align-items:end;border-bottom:1px solid #e4ece8;display:flex;gap:18px;justify-content:space-between;padding:18px 20px}.roster-head h2{font-size:1.2rem}.roster-head-actions{align-items:end;display:flex;gap:8px}.roster-search{align-items:center;background:#f7faf8;border:1px solid #dce8e3;border-radius:13px;display:grid;gap:7px;grid-template-columns:18px minmax(130px,230px) 22px;padding:0 9px}.roster-search svg{color:#6f8584;height:16px;width:16px}.roster-search input{background:transparent;border:0;font:inherit;font-size:.68rem;min-height:40px;outline:0;width:100%}.roster-search button{background:transparent;border:0;color:#7c8c8e;cursor:pointer;font-size:1.05rem}.status-filter{display:grid;gap:4px}.status-filter>span{color:#718184;font-size:.55rem;font-weight:900;text-transform:uppercase}.status-filter select{background:#fff;border:1px solid #dce7e2;border-radius:11px;color:#29494e;font:inherit;font-size:.65rem;min-height:40px;padding:0 9px}.clear-roster{align-items:center;background:transparent;border:0;color:#a45246;cursor:pointer;display:flex;font:inherit;font-size:.61rem;font-weight:850;gap:5px;min-height:40px}.roster-entry{align-items:center;background:linear-gradient(135deg,#f5fbf8,#fffaf0);display:grid;gap:20px;grid-template-columns:150px minmax(0,1fr);min-height:230px;padding:24px 32px}.roster-entry>img{height:155px;object-fit:contain;width:145px}.grade-pills{display:flex;flex-wrap:wrap;gap:9px;margin-top:10px}.grade-pills button{align-items:center;background:#fff;border:1px solid #dce8e3;border-radius:14px;color:#2a4d51;cursor:pointer;display:flex;font:inherit;gap:13px;min-height:49px;padding:8px 12px}.grade-pills button:hover{border-color:#8fc849;box-shadow:0 8px 18px rgba(14,55,61,.07)}.grade-pills strong{font-family:var(--font-title);font-size:.82rem}.grade-pills span{align-items:center;background:#e9f7f0;border-radius:999px;color:#0b6b61;display:flex;font-size:.59rem;font-weight:900;height:25px;justify-content:center;min-width:25px}.roster-loading{display:grid}.roster-loading article{align-items:center;border-bottom:1px solid #edf1ef;display:grid;gap:12px;grid-template-columns:50px minmax(0,1fr) 90px;padding:12px 20px}.roster-loading article>span{animation:shimmer 1.2s infinite;background:#eaf0ed;border-radius:15px;height:48px;width:48px}.roster-loading article div{display:grid;gap:7px}.roster-loading article i,.roster-loading article b{animation:shimmer 1.2s infinite;background:#eaf0ed;border-radius:999px;height:8px}.roster-loading article i:first-child{width:48%}.roster-loading article i:last-child{width:28%}.roster-loading article b{height:22px;width:80px}.roster-state{align-items:center;display:flex;flex-direction:column;justify-content:center;min-height:290px;padding:30px;text-align:center}.roster-state img{height:120px;object-fit:contain;width:120px}.roster-state>svg{color:#b05246;height:30px;width:30px}.roster-state h3{font-size:1rem;margin-top:8px}.roster-state p{font-size:.7rem;margin:5px 0 14px}.roster-hierarchy{background:#f7faf8;padding:12px}.roster-grade{background:#fff;border:1px solid #e0eae6;border-radius:19px;margin-bottom:11px;overflow:hidden}.roster-grade:last-child{margin-bottom:0}.roster-grade>header{align-items:center;background:linear-gradient(90deg,#eef8f3,#fff);border-bottom:1px solid #e7eeeb;display:flex;justify-content:space-between;padding:13px 16px}.roster-grade>header span{font-family:var(--font-title);font-size:.95rem}.roster-grade>header small{color:#778789;font-size:.61rem}.roster-groups{display:grid}.roster-group{border-bottom:1px solid #edf1ef}.roster-group:last-child{border-bottom:0}.roster-group-head{align-items:center;background:#fff;border:0;color:inherit;cursor:pointer;display:grid;font:inherit;gap:12px;grid-template-columns:minmax(140px,1fr) auto 18px;min-height:61px;padding:10px 16px;text-align:left;width:100%}.roster-group-head:hover{background:#f9fbfa}.roster-group-head strong,.roster-group-head small{display:block}.roster-group-head strong{font-size:.72rem}.roster-group-head small{color:#829092;font-size:.57rem;margin-top:3px}.group-composition{display:flex;gap:6px}.group-composition i{background:#eaf3ff;border-radius:999px;color:#3476aa;font-size:.57rem;font-style:normal;font-weight:850;padding:5px 7px}.group-composition i+ i{background:#fff0ed;color:#a64e45}.roster-group-head>svg{color:#9aabaa;height:15px;transition:.18s ease;width:15px}.roster-group[data-open='true'] .roster-group-head>svg{transform:rotate(90deg)}.student-cards{background:#f8fbf9;display:grid;gap:7px;padding:9px}.student-card{align-items:center;background:#fff;border:1px solid #e3ebe8;border-radius:14px;color:inherit;cursor:pointer;display:grid;font:inherit;gap:11px;grid-template-columns:46px minmax(160px,1.25fr) 72px minmax(130px,1fr) 55px 17px;min-height:66px;padding:8px 11px;text-align:left;width:100%}.student-card:hover{border-color:#bcd9ce;box-shadow:0 8px 18px rgba(14,55,61,.07)}.student-photo{align-items:center;background:#e9f7f0;border-radius:13px;display:flex;height:44px;justify-content:center;overflow:hidden;width:44px}.student-photo[data-level='primaria']{background:#eaf3ff}.student-photo[data-level='secundaria']{background:#fff0ed}.student-photo img{height:100%;object-fit:cover;width:100%}.student-photo b{color:#0b6b61;font-size:.66rem}.student-identity strong,.student-identity small,.student-contact strong,.student-contact small,.student-record strong,.student-record small{display:block}.student-identity strong{font-size:.69rem;line-height:1.2}.student-identity small,.student-contact small,.student-record small{color:#829092;font-size:.55rem;margin-top:3px}.student-entry{border-radius:999px;font-size:.56rem;font-weight:900;justify-self:start;padding:6px 8px}.student-entry[data-kind='interno']{background:#eaf3ff;color:#3476aa}.student-entry[data-kind='externo']{background:#fff0ed;color:#a64e45}.student-contact strong{font-size:.62rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.student-record strong{font-size:.66rem}.student-card>svg{color:#9aabaa;height:15px;width:15px}.action-toast{align-items:center;background:#123f42;border:1px solid rgba(255,255,255,.16);border-radius:999px;bottom:24px;box-shadow:0 18px 48px rgba(5,35,40,.28);color:#fff;display:flex;font-size:.7rem;font-weight:850;gap:8px;left:50%;padding:11px 16px;position:fixed;transform:translateX(-50%);z-index:1300}.action-toast span{background:#8fc849;border-radius:999px;height:8px;width:8px}.action-toast[data-state='saving'] span{animation:pulse 1s infinite;background:#f6c745}.action-toast[data-state='failed']{background:#913f37}.action-toast[data-state='failed'] span{background:#ffd2ca}.status-toast-enter-active,.status-toast-leave-active{transition:.18s ease}.status-toast-enter-from,.status-toast-leave-to{opacity:0;transform:translate(-50%,10px)}@keyframes shimmer{0%,100%{opacity:.55}50%{opacity:1}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{50%{opacity:.35}}
@media(max-width:1080px){.overview-layout{grid-template-columns:1fr}.composition-card{align-items:center;grid-template-columns:150px minmax(0,1fr) 150px;grid-template-rows:1fr;min-height:190px}.composition-copy{margin-top:0}.composition-card>img{height:150px;margin-bottom:-24px}.enrollment-kpis{grid-template-columns:1fr 1fr}.student-card{grid-template-columns:44px minmax(150px,1.2fr) 70px minmax(120px,1fr) 17px}.student-record{display:none}}
@media(max-width:820px){.enrollment-hero{grid-template-columns:minmax(0,1fr) 135px;padding:24px}.hero-actions{grid-column:1;grid-row:2;margin-top:16px;grid-template-columns:150px 120px}.hero-ambassador{grid-column:2;grid-row:1/3;height:160px;width:130px}.roster-head{align-items:stretch;flex-direction:column}.roster-head-actions{align-items:stretch}.roster-search{flex:1;grid-template-columns:18px minmax(100px,1fr) 22px}.matrix-table{overflow-x:auto}.composition-card{grid-template-columns:130px minmax(0,1fr) 120px}.composition-ring{height:122px;width:122px}.student-card{grid-template-columns:44px minmax(140px,1fr) 70px auto 17px}.student-contact{display:none}}
@media(max-width:640px){.enrollment-hero{border-radius:24px;grid-template-columns:minmax(0,1fr) 92px;min-height:226px;padding:20px}.hero-copy h1{font-size:2.05rem}.hero-context span:nth-child(3){display:none}.hero-actions{grid-template-columns:1fr;max-width:180px}.hero-ambassador{height:132px;width:92px}.enrollment-kpis{gap:8px}.enrollment-kpi{grid-template-columns:39px minmax(0,1fr);min-height:75px;padding:10px}.enrollment-kpi>span{height:39px;width:39px}.enrollment-kpi em{display:none}.enrollment-kpi strong{font-size:1.15rem}.matrix-head{padding:15px}.matrix-table{min-width:510px}.matrix-row{grid-template-columns:minmax(130px,1.2fr) repeat(3,72px) 24px;padding:0 14px}.composition-card{grid-template-columns:105px minmax(0,1fr);padding:17px}.composition-card>img{display:none}.composition-ring{height:100px;width:100px}.composition-ring strong{font-size:1.3rem}.roster-head{padding:15px}.roster-head-actions{display:grid;grid-template-columns:1fr 105px}.clear-roster{grid-column:1/-1;justify-content:flex-start;min-height:28px}.roster-entry{grid-template-columns:90px minmax(0,1fr);padding:20px}.roster-entry>img{height:100px;width:90px}.grade-pills{gap:6px}.grade-pills button{min-height:43px;padding:6px 9px}.group-composition{display:none}.roster-group-head{grid-template-columns:minmax(0,1fr) 17px}.student-card{grid-template-columns:42px minmax(0,1fr) auto;padding:8px}.student-entry{grid-column:3;grid-row:1}.student-card>svg,.student-contact,.student-record{display:none}.student-identity{grid-column:2;grid-row:1}.action-toast{bottom:78px;max-width:calc(100vw - 24px);text-align:center;white-space:normal}.page-state{grid-template-columns:auto minmax(0,1fr)}.page-state .mkt-btn{grid-column:1/-1}.availability-state{grid-template-columns:78px minmax(0,1fr);min-height:180px}.availability-state img{height:72px;width:72px}.availability-state h2{font-size:.98rem}.no-planteles{grid-template-columns:80px minmax(0,1fr)}.no-planteles img{height:75px;width:75px}}
@media(max-width:430px){.enrollment-kpis{grid-template-columns:1fr 1fr}.enrollment-kpi small{font-size:.55rem}.plantel-switcher button{padding:7px 10px}.roster-entry{grid-template-columns:1fr}.roster-entry>img{display:none}.status-filter{display:none}.roster-head-actions{grid-template-columns:1fr}.clear-roster{grid-column:auto}}
</style>
