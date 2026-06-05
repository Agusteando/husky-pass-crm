<template>
  <FamilyPersonasAutorizadasShell title="Asistencia">
    <section class="attendance-page" :data-state="pageState" data-product-panel="family-attendance-expediente">
      <section class="attendance-hero card">
        <div class="hero-copy">
          <p class="eyebrow">Expediente de asistencia</p>
          <h1>{{ heroTitle }}</h1>
          <p>{{ heroSubtitle }}</p>

          <div v-if="data" class="context-controls">
            <label v-if="children.length > 1" class="control-label">
              <span>Alumno</span>
              <select v-model="selectedMatricula" class="select" data-testid="attendance-child-select" @change="syncRoute">
                <option v-for="child in children" :key="child.matricula" :value="child.matricula">{{ child.name }}</option>
              </select>
            </label>

            <label class="control-label">
              <span>Ciclo escolar</span>
              <select v-model="selectedSchoolYear" class="select" data-testid="attendance-year-select" @change="syncRoute">
                <option v-for="year in schoolYears" :key="year.label" :value="year.label">{{ year.label }}</option>
              </select>
            </label>
          </div>
        </div>

        <aside class="hero-sigil" :class="{ empty: !grupoImage }" data-testid="grupo-sigil">
          <img v-if="grupoImage" :src="grupoImage" :alt="grupoAlt" />
          <FamilyPersonasIcon v-else name="calendar" />
          <span>{{ grupoLabel }}</span>
        </aside>
      </section>

      <p v-if="loadError" class="alert" data-state="error">No fue posible abrir el expediente de asistencia.</p>

      <section v-else-if="pending && !data" class="loading-grid" data-state="loading">
        <span v-for="item in 5" :key="item" class="loading-card"></span>
      </section>

      <template v-else-if="data">
        <section v-if="sourceWarnings.length" class="source-strip" :data-state="data.status">
          <span v-for="warning in sourceWarnings" :key="warning">{{ warning }}</span>
        </section>

        <section class="summary-grid" data-product-panel="attendance-summary">
          <article class="summary-card coverage-card">
            <span>Días con expediente</span>
            <strong>{{ summary.schoolDaysWithAttendance }}</strong>
            <small>{{ selectedRangeLabel }}</small>
          </article>
          <article class="summary-card primary">
            <span>Ausencias sin motivo</span>
            <strong>{{ summary.unresolvedAbsences }}</strong>
            <button
              v-if="nextMissingAbsence"
              class="btn btn-primary"
              type="button"
              data-testid="primary-motivo-cta"
              @click="openMotivo(nextMissingAbsence)"
            >
              Agregar motivo
            </button>
            <small v-else>Sin acciones pendientes</small>
          </article>
          <article class="summary-card">
            <span>Ausencias</span>
            <strong>{{ summary.absences }}</strong>
            <small>{{ summary.resolvedAbsences }} con motivo</small>
          </article>
          <article class="summary-card danger">
            <span>Retardos</span>
            <strong>{{ summary.tardies }}</strong>
            <small>{{ maxLateLabel }}</small>
          </article>
          <article class="summary-card">
            <span>Entradas / salidas</span>
            <strong>{{ accessSummary.entries }} / {{ accessSummary.exits }}</strong>
            <small>{{ accessSummary.days }} días con registro</small>
          </article>
        </section>

        <section v-if="emptyState" class="empty-attendance card" data-state="empty">
          <img v-if="grupoImage" :src="grupoImage" alt="" />
          <div>
            <p class="eyebrow">{{ selectedSchoolYearLabel }}</p>
            <h2>Sin registros para este ciclo escolar</h2>
            <p>Cuando haya expediente de asistencia, ausencias, retardos o entradas/salidas, aparecerán aquí.</p>
          </div>
        </section>

        <template v-else>
          <section v-if="missingAbsences.length && nextMissingAbsence" class="attention-panel" data-product-panel="ausencias-sin-motivo">
            <header>
              <p class="eyebrow">Atención</p>
              <h2>{{ missingAbsences.length === 1 ? 'Ausencia sin motivo' : 'Siguiente ausencia sin motivo' }}</h2>
            </header>
            <article class="absence-action" :data-update-state="failedAbsenceId === nextMissingAbsence.id ? 'failed' : 'ready'">
              <div>
                <strong>{{ dateLabel(nextMissingAbsence.date) }}</strong>
                <span>{{ [nextMissingAbsence.grado, nextMissingAbsence.grupo].filter(Boolean).join(' / ') || selectedChildLine }}</span>
                <small>{{ missingAbsences.length === 1 ? 'Motivo de inasistencia pendiente' : `1 de ${missingAbsences.length} ausencias sin motivo` }}</small>
              </div>
              <button class="btn btn-primary" type="button" data-testid="motivo-card-button" @click="openMotivo(nextMissingAbsence)">
                {{ failedAbsenceId === nextMissingAbsence.id ? 'Reintentar' : 'Agregar motivo' }}
              </button>
            </article>
          </section>

          <section class="insight-grid">
            <article class="coverage-panel card" data-product-panel="attendance-coverage">
              <header class="section-head">
                <div>
                  <p class="eyebrow">Ciclo escolar</p>
                  <h2>Expediente disponible</h2>
                </div>
                <div class="legend">
                  <span><i class="dot clear"></i>Presente</span>
                  <span><i class="dot absence"></i>Ausencia</span>
                  <span><i class="dot tardy"></i>Retardo</span>
                </div>
              </header>
              <div v-if="monthGroups.length" class="month-list">
                <article v-for="month in monthGroups" :key="month.key" class="month-row">
                  <div class="month-name">
                    <strong>{{ month.label }}</strong>
                    <span>{{ month.days.length }} días</span>
                  </div>
                  <div class="day-dots" :aria-label="`Registros de ${month.label}`">
                    <span
                      v-for="day in month.days"
                      :key="day.date"
                      class="day-dot"
                      :class="day.status"
                      :title="dayTitle(day)"
                    ></span>
                  </div>
                </article>
              </div>
              <p v-else class="quiet-empty">Sin días de expediente en el ciclo seleccionado.</p>
            </article>

            <aside class="timeline-panel" data-product-panel="attendance-timeline">
              <header class="section-head compact">
                <div>
                  <p class="eyebrow">Actividad reciente</p>
                  <h2>Expediente</h2>
                </div>
              </header>
              <div v-if="recentEvents.length" class="timeline-list">
                <article v-for="event in recentEvents" :key="event.key" class="timeline-item" :class="event.type">
                  <strong>{{ event.title }}</strong>
                  <time>{{ dateLabel(event.date) }}<span v-if="event.time"> · {{ event.time }}</span></time>
                  <span>{{ event.detail }}</span>
                </article>
              </div>
              <p v-else class="quiet-empty">Sin eventos recientes.</p>
            </aside>
          </section>

          <section class="records-grid">
            <article class="record-column" data-product-panel="absence-records">
              <header class="section-head">
                <div>
                  <p class="eyebrow">Ausencias</p>
                  <h2>Motivos de inasistencia</h2>
                </div>
              </header>

              <div v-if="absences.length" class="record-list">
                <article v-for="absence in absences" :key="absence.id" class="absence-card" :data-state="absence.motivoState">
                  <div class="record-date">
                    <strong>{{ dayNumber(absence.date) }}</strong>
                    <span>{{ monthShort(absence.date) }}</span>
                  </div>
                  <div class="record-copy">
                    <strong>{{ dateLabel(absence.date) }}</strong>
                    <span>{{ absence.motivo || 'Motivo de inasistencia pendiente' }}</span>
                    <small>{{ absence.motivoState === 'provided' ? 'Motivo registrado' : 'Sin motivo' }}</small>
                  </div>
                  <button class="btn btn-secondary" type="button" data-testid="motivo-update-button" @click="openMotivo(absence)">
                    {{ absence.motivo ? 'Actualizar' : 'Agregar motivo' }}
                  </button>
                </article>
              </div>
              <p v-else class="quiet-empty">Sin ausencias en este ciclo escolar.</p>
            </article>

            <article class="record-column" data-product-panel="tardy-records">
              <header class="section-head">
                <div>
                  <p class="eyebrow">Retardos</p>
                  <h2>Minutos tarde</h2>
                </div>
              </header>

              <div v-if="tardies.length" class="record-list">
                <article v-for="tardy in tardies" :key="`${tardy.id}-${tardy.date}-${tardy.time}`" class="tardy-card">
                  <div class="record-date red">
                    <strong>{{ dayNumber(tardy.date) }}</strong>
                    <span>{{ monthShort(tardy.date) }}</span>
                  </div>
                  <div class="record-copy">
                    <strong>{{ dateLabel(tardy.date) }}</strong>
                    <span>Entrada {{ tardy.time }} · límite {{ tardy.thresholdTime }}</span>
                    <small>{{ displayMatricula(tardy.matricula || data.selectedChild.matricula) }}</small>
                  </div>
                  <span class="late-badge" data-testid="late-minutes-badge">{{ tardy.minutesLate }} min</span>
                </article>
              </div>
              <p v-else class="quiet-empty">Sin retardos en este ciclo escolar.</p>
            </article>
          </section>

          <section class="access-panel card" data-product-panel="access-history-in-attendance">
            <header class="access-head">
              <div>
                <p class="eyebrow">Entradas y salidas</p>
                <h2>Registro complementario</h2>
              </div>
              <span class="access-range">{{ selectedSchoolYearLabel }}</span>
            </header>

            <section class="access-filters" aria-label="Filtros de entradas y salidas">
              <label class="control-label">
                <span>Buscar</span>
                <input v-model="accessFilters.search" class="input" type="search" placeholder="Persona, alumno o matrícula" data-testid="access-search" />
              </label>
              <label class="control-label">
                <span>Tipo</span>
                <select v-model="accessFilters.type" class="select" data-testid="access-type-filter">
                  <option value="all">Entrada y salida</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </label>
              <label class="control-label">
                <span>Persona</span>
                <select v-model="accessFilters.person" class="select" data-testid="access-person-filter">
                  <option value="all">Todas</option>
                  <option v-for="person in accessPeople" :key="person.id" :value="String(person.id)">{{ person.name }}</option>
                </select>
              </label>
              <label class="control-label">
                <span>Desde</span>
                <input v-model="accessFilters.startDate" class="input" type="date" :min="data.selectedSchoolYear.startDate" :max="data.selectedSchoolYear.endDate" />
              </label>
              <label class="control-label">
                <span>Hasta</span>
                <input v-model="accessFilters.endDate" class="input" type="date" :min="data.selectedSchoolYear.startDate" :max="data.selectedSchoolYear.endDate" />
              </label>
            </section>

            <div v-if="filteredAccessDays.length" class="access-list">
              <article v-for="day in filteredAccessDays" :key="day.key" class="access-day-card">
                <div class="access-date">
                  <strong>{{ dayNumber(day.date) }}</strong>
                  <span>{{ monthShort(day.date) }}</span>
                </div>
                <div class="access-main">
                  <div class="access-student">
                    <strong>{{ day.student.name }}</strong>
                    <span>{{ displayMatricula(day.student.matricula) }} · {{ [day.student.plantel, day.student.grado, day.student.grupo].filter(Boolean).join(' / ') }}</span>
                  </div>
                  <div class="access-pair">
                    <AccessActionChip label="Entrada" :action="day.entrada" />
                    <AccessActionChip label="Salida" :action="day.salida" />
                  </div>
                </div>
              </article>
            </div>
            <p v-else class="quiet-empty">Sin entradas o salidas para los filtros seleccionados.</p>
          </section>
        </template>

        <p v-if="notice" class="notice">{{ notice }}</p>
      </template>

      <FamilyPersonasModal
        v-if="editingAbsence"
        title="Motivo de inasistencia"
        :eyebrow="dateLabel(editingAbsence.date)"
        @close="closeMotivo"
      >
        <form class="motivo-form" data-testid="motivo-form" @submit.prevent="saveMotivo">
          <label class="label">
            <span>Motivo de inasistencia</span>
            <textarea
              v-model="motivoDraft"
              class="textarea"
              maxlength="700"
              required
              data-testid="motivo-textarea"
              placeholder="Escribe el motivo de la inasistencia"
            ></textarea>
          </label>
          <p v-if="motivoError" class="alert">{{ motivoError }}</p>
          <div class="form-actions">
            <button class="btn btn-secondary" type="button" :disabled="savingMotivo" @click="closeMotivo">Cancelar</button>
            <button class="btn btn-primary" type="submit" :disabled="savingMotivo || motivoDraft.trim().length < 3" data-testid="motivo-submit">
              {{ savingMotivo ? 'Guardando...' : 'Guardar motivo' }}
            </button>
          </div>
        </form>
      </FamilyPersonasModal>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref, resolveComponent, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type {
  AttendanceAbsenceRecord,
  AttendanceCalendarDay,
  ParentAttendanceResponse
} from '~/types/attendance'
import type { AccessHistoryAction } from '~/types/accessHistory'
import { formatAttendanceDate, normalizeAttendanceText } from '~/utils/attendance'
import { displayMatricula } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const AccessActionChip = defineComponent({
  props: {
    label: { type: String, required: true },
    action: { type: Object as () => AccessHistoryAction | null | undefined, default: null }
  },
  setup(props) {
    return () => h('div', { class: ['access-chip', props.action?.type || 'missing'] }, [
      h('span', { class: 'access-chip-label' }, props.label),
      props.action
        ? h('div', { class: 'access-chip-body' }, [
            h('div', { class: 'access-photo-shell' }, props.action.person.photoUrl
              ? h(resolveComponent('FamilyPersonasProcessedPhoto'), {
                  src: props.action.person.photoUrl,
                  autoProcess: false,
                  namespace: `access-${props.action.person.id}-${props.action.id}`,
                  alt: props.action.person.name
                })
              : h(resolveComponent('FamilyPersonasIcon'), { name: props.action.type === 'entrada' ? 'entry' : 'exit' })),
            h('div', { class: 'access-chip-copy' }, [
              h('strong', props.action.time),
              h('span', props.action.person.name),
              h('small', props.action.person.parentesco || 'Persona autorizada')
            ])
          ])
        : h('div', { class: 'access-chip-empty' }, 'Sin registro')
    ])
  }
})

const route = useRoute()
const router = useRouter()
const selectedMatricula = ref(queryValue(route.query.matricula))
const selectedSchoolYear = ref(queryValue(route.query.schoolYear))
const editingAbsence = ref<AttendanceAbsenceRecord | null>(null)
const motivoDraft = ref('')
const motivoError = ref('')
const notice = ref('')
const savingMotivo = ref(false)
const failedAbsenceId = ref<number | null>(null)
const accessFilters = reactive({
  search: '',
  type: 'all',
  person: 'all',
  startDate: '',
  endDate: ''
})

const requestQuery = computed(() => ({
  matricula: selectedMatricula.value || undefined,
  schoolYear: selectedSchoolYear.value || undefined
}))

const { data, pending, error: loadError, refresh } = useFetch<ParentAttendanceResponse>('/api/family/attendance', {
  query: requestQuery,
  timeout: 45000,
  watch: [requestQuery],
  key: 'family-attendance'
})

const children = computed(() => data.value?.children || [])
const schoolYears = computed(() => data.value?.schoolYears || [])
const summary = computed(() => data.value?.summary || {
  schoolDaysWithAttendance: 0,
  clearDays: 0,
  absences: 0,
  tardies: 0,
  unresolvedAbsences: 0,
  resolvedAbsences: 0
})
const accessSummary = computed(() => data.value?.accessHistory.summary || { days: 0, entries: 0, exits: 0, uniquePeople: 0, students: 0 })
const accessPeople = computed(() => data.value?.accessHistory.people || [])
const absences = computed(() => [...(data.value?.absences || [])].sort((a, b) => b.date.localeCompare(a.date)))
const tardies = computed(() => [...(data.value?.tardies || [])].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)))
const missingAbsences = computed(() => absences.value.filter((absence) => absence.motivoState === 'missing'))
const nextMissingAbsence = computed(() => missingAbsences.value[0] || null)
const recentEvents = computed(() => data.value?.events.slice(0, 8) || [])
const selectedChildLine = computed(() => [data.value?.selectedChild.grado, data.value?.selectedChild.grupo].filter(Boolean).join(' / ') || data.value?.selectedChild.plantelCode || '')
const selectedSchoolYearLabel = computed(() => data.value?.selectedSchoolYear.label || selectedSchoolYear.value || '')
const selectedRangeLabel = computed(() => {
  const year = data.value?.selectedSchoolYear
  return year ? `${dateLabel(year.startDate)} - ${dateLabel(year.endDate)}` : selectedSchoolYearLabel.value
})
const heroTitle = computed(() => data.value?.selectedChild.name || 'Asistencia')
const heroSubtitle = computed(() => {
  if (!data.value) return 'Expediente de asistencia por ciclo escolar.'
  return [selectedSchoolYearLabel.value, selectedChildLine.value, data.value.selectedChild.plantelCode].filter(Boolean).join(' / ')
})
const grupoImage = computed(() => data.value?.grupoSigil.image || '')
const grupoLabel = computed(() => data.value?.grupoSigil.grupoValue || data.value?.selectedChild.grupo || 'Grupo')
const grupoAlt = computed(() => `Imagen de grupo ${grupoLabel.value}`)
const emptyState = computed(() => Boolean(data.value && !data.value.calendarDays.length && !data.value.accessHistory.days.length && data.value.status !== 'unavailable'))
const pageState = computed(() => {
  if (loadError.value) return 'error'
  if (pending.value && !data.value) return 'loading'
  if (!data.value) return 'empty'
  if (data.value.status === 'unavailable') return 'unavailable'
  if (emptyState.value) return 'empty'
  return 'content'
})
const sourceWarnings = computed(() => {
  const source = data.value?.source
  if (!source) return []
  const warnings: string[] = []
  if (source.attendance !== 'ready') warnings.push(source.attendanceMessage || 'Asistencia no disponible.')
  if (source.tardiness !== 'ready') warnings.push(source.tardinessMessage || 'Retardos no disponibles.')
  return warnings
})
const maxLateLabel = computed(() => {
  const max = Math.max(0, ...tardies.value.map((tardy) => tardy.minutesLate || 0))
  return max ? `Máximo ${max} min` : selectedSchoolYearLabel.value
})

const monthGroups = computed(() => {
  const formatter = new Intl.DateTimeFormat('es-MX', { month: 'short', year: 'numeric' })
  const map = new Map<string, { key: string; label: string; days: AttendanceCalendarDay[]; events: number }>()
  for (const day of data.value?.calendarDays || []) {
    const key = day.date.slice(0, 7)
    const parsed = new Date(`${day.date}T12:00:00`)
    const current = map.get(key) || { key, label: formatter.format(parsed), days: [], events: 0 }
    current.days.push(day)
    if (day.status !== 'clear') current.events += 1
    map.set(key, current)
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key))
})

const filteredAccessDays = computed(() => {
  const search = normalizeAttendanceText(accessFilters.search)
  const start = accessFilters.startDate
  const end = accessFilters.endDate
  return (data.value?.accessHistory.days || []).filter((day) => {
    if (start && day.date < start) return false
    if (end && day.date > end) return false
    if (accessFilters.type === 'entrada' && !day.entrada) return false
    if (accessFilters.type === 'salida' && !day.salida) return false
    if (accessFilters.person !== 'all' && !day.actions.some((action) => String(action.person.id) === accessFilters.person)) return false
    if (!search) return true
    const haystack = normalizeAttendanceText([
      day.student.name,
      day.student.matricula,
      day.student.plantel,
      day.actions.map((action) => `${action.person.name} ${action.person.parentesco}`).join(' ')
    ].filter(Boolean).join(' '))
    return haystack.includes(search)
  })
})

watch(data, (value) => {
  if (!value) return
  if (!selectedMatricula.value) selectedMatricula.value = value.selectedChild.matricula
  if (!selectedSchoolYear.value) selectedSchoolYear.value = value.selectedSchoolYear.label
  accessFilters.startDate = value.selectedSchoolYear.startDate
  accessFilters.endDate = value.selectedSchoolYear.endDate
}, { immediate: true })

function queryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '').trim()
  return String(value || '').trim()
}

function syncRoute() {
  notice.value = ''
  motivoError.value = ''
  failedAbsenceId.value = null
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      matricula: selectedMatricula.value || undefined,
      schoolYear: selectedSchoolYear.value || undefined
    }
  })
}

function dateLabel(date: string) {
  return formatAttendanceDate(date)
}

function dayNumber(date: string) {
  return String(Number(date.slice(8, 10)) || '')
}

function monthShort(date: string) {
  return new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(new Date(`${date}T12:00:00`))
}

function dayTitle(day: AttendanceCalendarDay) {
  const labels: Record<AttendanceCalendarDay['status'], string> = {
    clear: 'Sin ausencia registrada',
    absence: day.motivoState === 'provided' ? 'Ausencia con motivo' : 'Ausencia sin motivo',
    tardy: 'Retardo',
    'absence-tardy': 'Ausencia y retardo'
  }
  return `${formatAttendanceDate(day.date, 'short')} / ${labels[day.status]}`
}

function openMotivo(absence: AttendanceAbsenceRecord) {
  editingAbsence.value = absence
  motivoDraft.value = absence.motivo || ''
  motivoError.value = ''
  notice.value = ''
}

function closeMotivo() {
  editingAbsence.value = null
  motivoDraft.value = ''
  motivoError.value = ''
}

async function saveMotivo() {
  if (!editingAbsence.value || !data.value) return
  savingMotivo.value = true
  motivoError.value = ''
  notice.value = ''
  failedAbsenceId.value = null

  try {
    await $fetch('/api/family/attendance/motivo', {
      method: 'POST',
      body: {
        matricula: data.value.selectedChild.matricula,
        schoolYear: data.value.selectedSchoolYear.label,
        absenceId: editingAbsence.value.id,
        motivo: motivoDraft.value
      }
    })
    closeMotivo()
    await refresh()
    notice.value = 'Motivo guardado.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    failedAbsenceId.value = editingAbsence.value.id
    motivoError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar el motivo.'
  } finally {
    savingMotivo.value = false
  }
}
</script>

<style scoped>
.attendance-page {
  display: grid;
  gap: 16px;
}

.attendance-page .btn-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
}

.attendance-hero {
  align-items: stretch;
  background:
    radial-gradient(circle at 86% 18%, rgba(var(--pa-primary-rgb), 0.18), transparent 30%),
    linear-gradient(135deg, #ffffff, rgba(var(--pa-primary-rgb), 0.08));
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 240px);
  overflow: hidden;
}

.hero-copy,
.record-copy,
.access-chip-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.context-controls {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(220px, 0.8fr) minmax(170px, 0.44fr);
  margin-top: 10px;
  max-width: 720px;
}

.control-label {
  color: var(--color-muted);
  display: grid;
  font-size: 0.78rem;
  gap: 6px;
}

.control-label span {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-sigil {
  align-items: center;
  align-self: stretch;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--pa-border);
  border-radius: 22px;
  display: grid;
  justify-items: center;
  min-height: 180px;
  padding: 18px;
  text-align: center;
}

.hero-sigil img {
  max-height: 130px;
  object-fit: contain;
}

.hero-sigil span {
  color: var(--pa-primary);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loading-grid,
.summary-grid,
.insight-grid,
.records-grid {
  display: grid;
  gap: 14px;
}

.loading-grid,
.summary-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.loading-card,
.summary-card {
  border-radius: 22px;
  min-height: 124px;
}

.loading-card {
  animation: pulse 1.1s ease-in-out infinite alternate;
  background: linear-gradient(90deg, rgba(255,255,255,.6), rgba(var(--pa-primary-rgb), .16), rgba(255,255,255,.6));
  border: 1px solid var(--pa-border);
}

@keyframes pulse {
  from { opacity: .55; }
  to { opacity: 1; }
}

.summary-card {
  background: #fff;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 8px;
  padding: 16px;
}

.summary-card.primary,
.summary-card.coverage-card {
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .12), #ffffff);
  border-color: var(--pa-border);
}

.summary-card.danger {
  border-color: #ffd2ca;
}

.summary-card span,
.summary-card small,
.record-copy small,
.quiet-empty,
.source-strip {
  color: var(--color-muted);
  font-size: 0.8rem;
  font-weight: 600;
}

.summary-card > span {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-card strong {
  color: var(--color-ink);
  font-family: var(--font-title);
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  line-height: 0.95;
}

.summary-card.danger strong,
.late-badge {
  color: #9f2f25;
}

.source-strip,
.notice {
  background: #fff7e8;
  border: 1px solid #f1d79e;
  border-radius: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
}

.notice {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}

.empty-attendance {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: 96px minmax(0, 1fr);
}

.empty-attendance img {
  max-height: 96px;
  object-fit: contain;
}

.attention-panel {
  background: #2f3338;
  border-radius: 24px;
  color: #fff;
  display: grid;
  gap: 14px;
  padding: clamp(16px, 2.4vw, 22px);
}

.attention-panel .eyebrow,
.attention-panel h2 {
  color: #fff;
}

.absence-action {
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px;
}

.absence-action span,
.absence-action small {
  color: rgba(255, 255, 255, 0.72);
  display: block;
}

.absence-action[data-update-state='failed'] {
  border-color: #ffd2ca;
}

.insight-grid {
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
}

.section-head,
.access-head {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-bottom: 14px;
}

.section-head h2,
.access-head h2,
.hero-copy h1 {
  margin-bottom: 0;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legend span {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  font-size: 0.76rem;
  gap: 5px;
}

.dot,
.day-dot {
  border-radius: 999px;
  display: inline-block;
}

.dot {
  height: 9px;
  width: 9px;
}

.dot.clear,
.day-dot.clear {
  background: var(--pa-soft);
}

.dot.absence,
.day-dot.absence {
  background: #cf5c4c;
}

.dot.tardy,
.day-dot.tardy {
  background: #c9352b;
}

.day-dot.absence-tardy {
  background: linear-gradient(135deg, #cf5c4c 0 50%, #c9352b 50% 100%);
}

.month-list {
  display: grid;
  gap: 12px;
}

.month-row {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 126px minmax(0, 1fr);
}

.month-name strong,
.month-name span {
  display: block;
}

.month-name span {
  color: var(--color-muted);
  font-size: 0.74rem;
}

.day-dots {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-height: 24px;
}

.day-dot {
  height: 10px;
  width: 10px;
}

.timeline-panel,
.coverage-panel {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  padding: clamp(16px, 2.4vw, 22px);
}

.timeline-list,
.record-list,
.access-list {
  display: grid;
  gap: 10px;
}

.timeline-item {
  border-left: 3px solid var(--pa-border);
  display: grid;
  gap: 2px;
  padding: 2px 0 2px 12px;
}

.timeline-item.absence {
  border-color: #cf5c4c;
}

.timeline-item.tardy {
  border-color: #c9352b;
}

.timeline-item time,
.timeline-item span {
  color: var(--color-muted);
  font-size: 0.78rem;
}

.records-grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.86fr);
}

.record-column {
  display: grid;
  gap: 12px;
}

.absence-card,
.tardy-card {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 12px;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  padding: 12px;
}

.absence-card[data-state='missing'] {
  border-color: #f1d79e;
}

.tardy-card {
  border-color: #ffd2ca;
}

.record-date,
.access-date {
  aspect-ratio: 1;
  background: #fff7e8;
  border: 1px solid #f1d79e;
  border-radius: 16px;
  color: #8a5a12;
  display: grid;
  place-items: center;
  text-align: center;
}

.record-date.red {
  background: #fff3f0;
  border-color: #ffd2ca;
  color: #9f2f25;
}

.record-date strong,
.record-date span,
.access-date strong,
.access-date span {
  line-height: 1;
}

.record-date strong,
.access-date strong {
  font-family: var(--font-title);
  font-size: 1.35rem;
}

.record-date span,
.access-date span {
  font-size: 0.68rem;
  text-transform: uppercase;
}

.record-copy strong,
.record-copy span,
.record-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-copy span {
  color: var(--color-muted);
  font-size: 0.86rem;
}

.late-badge {
  align-items: center;
  background: #fff3f0;
  border: 1px solid #ffd2ca;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.8rem;
  font-weight: 800;
  min-height: 34px;
  padding: 0 11px;
}

.access-panel {
  display: grid;
  gap: 14px;
}

.access-range {
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 999px;
  color: var(--pa-primary);
  font-size: 0.78rem;
  padding: 7px 10px;
}

.access-filters {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(220px, 1fr) minmax(140px, .38fr) minmax(180px, .56fr) minmax(140px, .38fr) minmax(140px, .38fr);
}

.access-day-card {
  align-items: stretch;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 12px;
  grid-template-columns: 62px minmax(0, 1fr);
  padding: 12px;
}

.access-main {
  display: grid;
  gap: 10px;
}

.access-student {
  display: grid;
  gap: 2px;
}

.access-student span {
  color: var(--color-muted);
  font-size: 0.82rem;
}

.access-pair {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

:deep(.access-chip) {
  background: #fbfdf8;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: grid;
  gap: 8px;
  padding: 10px;
}

:deep(.access-chip.entrada) {
  border-color: var(--pa-border);
}

:deep(.access-chip.salida) {
  border-color: #d2e7f5;
}

:deep(.access-chip-label) {
  color: var(--color-muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:deep(.access-chip-body) {
  align-items: center;
  display: grid;
  gap: 9px;
  grid-template-columns: 42px minmax(0, 1fr);
}

:deep(.access-photo-shell) {
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, .88), transparent 42%),
    linear-gradient(135deg, rgba(var(--pa-primary-rgb), .18), rgba(255, 255, 255, .92));
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  height: 42px;
  overflow: hidden;
  width: 42px;
}

:deep(.access-photo-shell .processed-photo) {
  background: transparent;
}

:deep(.access-chip-copy strong),
:deep(.access-chip-copy span),
:deep(.access-chip-copy small) {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.access-chip-copy span),
:deep(.access-chip-copy small),
:deep(.access-chip-empty) {
  color: var(--color-muted);
  font-size: 0.78rem;
}

.motivo-form {
  display: grid;
  gap: 14px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 1180px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .access-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .attendance-hero,
  .insight-grid,
  .records-grid {
    grid-template-columns: 1fr;
  }

  .hero-sigil {
    grid-template-columns: 88px minmax(0, 1fr);
    justify-items: start;
    min-height: 0;
    text-align: left;
  }

  .hero-sigil img {
    max-height: 88px;
  }

  .summary-grid,
  .loading-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .context-controls,
  .summary-grid,
  .loading-grid,
  .section-head,
  .access-head,
  .absence-action,
  .month-row,
  .empty-attendance,
  .access-filters,
  .access-day-card,
  .access-pair {
    grid-template-columns: 1fr;
  }

  .absence-card,
  .tardy-card {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .absence-card .btn,
  .late-badge {
    grid-column: 1 / -1;
  }

  .legend {
    justify-content: flex-start;
  }
}
</style>
