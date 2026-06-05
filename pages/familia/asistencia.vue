<template>
  <FamilyPersonasAutorizadasShell title="Asistencia">
    <section class="attendance-page" :data-state="pageState" data-product-panel="family-attendance-expediente">
      <header class="expediente-header card">
        <div class="student-context">
          <p class="eyebrow">Expediente de asistencia</p>
          <h1>{{ heroTitle }}</h1>
          <div v-if="data" class="identity-row" aria-label="Contexto del alumno">
            <span>{{ displayMatricula(data.selectedChild.matricula) }}</span>
            <span v-if="data.selectedChild.plantelCode">{{ data.selectedChild.plantelCode }}</span>
            <span v-if="data.selectedChild.nivelEdu">{{ data.selectedChild.nivelEdu }}</span>
            <span v-if="data.selectedChild.grado">{{ data.selectedChild.grado }}</span>
            <span v-if="data.selectedChild.grupo">{{ data.selectedChild.grupo }}</span>
          </div>
          <p v-else>Consulta el expediente por alumno y ciclo escolar.</p>

          <div v-if="data" class="context-controls">
            <label v-if="children.length > 1" class="control-label">
              <span>Alumno</span>
              <select v-model="selectedMatricula" class="select" data-testid="attendance-child-select" @change="syncRoute">
                <option v-for="child in children" :key="child.matricula" :value="child.matricula">
                  {{ child.name }}
                </option>
              </select>
            </label>

            <label class="control-label">
              <span>Ciclo escolar</span>
              <select v-model="selectedSchoolYear" class="select" data-testid="attendance-year-select" @change="syncRoute">
                <option v-for="year in schoolYears" :key="year.label" :value="year.label">
                  {{ year.label }}
                </option>
              </select>
            </label>
          </div>
        </div>

        <aside class="context-card" :class="{ empty: !grupoImage }" data-testid="grupo-sigil">
          <img v-if="grupoImage" :src="grupoImage" :alt="grupoAlt" />
          <FamilyPersonasIcon v-else name="calendar" />
          <div>
            <span>Grupo</span>
            <strong>{{ grupoLabel }}</strong>
          </div>
        </aside>
      </header>

      <p v-if="loadError" class="alert" data-state="error">No fue posible abrir el expediente de asistencia.</p>

      <section v-else-if="pending && !data" class="loading-layout" data-state="loading">
        <span v-for="item in 6" :key="item" class="loading-card"></span>
      </section>

      <template v-else-if="data">
        <section v-if="sourceWarnings.length" class="source-strip" :data-state="data.status">
          <span v-for="warning in sourceWarnings" :key="warning">{{ warning }}</span>
        </section>

        <section v-if="emptyState" class="empty-expediente card" data-state="empty">
          <img v-if="grupoImage" :src="grupoImage" alt="" />
          <div>
            <p class="eyebrow">{{ selectedSchoolYearLabel }}</p>
            <h2>Sin registros para este ciclo escolar</h2>
            <p>Cuando haya asistencia, ausencias, retardos o entradas y salidas, aparecerán aquí.</p>
          </div>
        </section>

        <template v-else>
          <section class="dashboard-grid" data-product-panel="attendance-overview">
            <article class="coverage-board card">
              <header class="panel-head">
                <div>
                  <p class="eyebrow">Cobertura del ciclo escolar</p>
                  <h2>{{ summary.schoolDaysWithAttendance }} días con expediente</h2>
                  <p>{{ selectedRangeLabel }}</p>
                </div>
                <div class="coverage-total">
                  <strong>{{ summary.clearDays }}</strong>
                  <span>sin ausencia</span>
                </div>
              </header>

              <div class="coverage-legend" aria-label="Estados de asistencia">
                <span><i class="dot clear"></i>Presente</span>
                <span><i class="dot absence"></i>Ausencia</span>
                <span><i class="dot tardy"></i>Retardo</span>
                <span><i class="dot absence-tardy"></i>Ausencia y retardo</span>
              </div>

              <div v-if="monthGroups.length" class="month-coverage">
                <article v-for="month in monthGroups" :key="month.key" class="month-row">
                  <div class="month-label">
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
                  <small>{{ month.events }} evento{{ month.events === 1 ? '' : 's' }}</small>
                </article>
              </div>
              <p v-else class="quiet-empty">Sin días de expediente en el ciclo seleccionado.</p>
            </article>

            <aside class="action-column">
              <article class="pending-card card" :data-state="nextMissingAbsence ? 'pending' : 'clear'">
                <p class="eyebrow">Motivos de inasistencia</p>
                <template v-if="nextMissingAbsence">
                  <h2>{{ missingAbsences.length }} ausencia{{ missingAbsences.length === 1 ? '' : 's' }} sin motivo</h2>
                  <div class="pending-date">
                    <strong>{{ dateLabel(nextMissingAbsence.date) }}</strong>
                    <span>{{ [nextMissingAbsence.grado, nextMissingAbsence.grupo].filter(Boolean).join(' / ') || selectedChildLine }}</span>
                  </div>
                  <button class="btn btn-primary" type="button" data-testid="primary-motivo-cta" @click="openMotivo(nextMissingAbsence)">
                    {{ failedAbsenceId === nextMissingAbsence.id ? 'Reintentar motivo' : 'Agregar motivo' }}
                  </button>
                </template>
                <template v-else>
                  <h2>Sin ausencias pendientes</h2>
                  <p>Los motivos de inasistencia visibles para este ciclo están registrados.</p>
                </template>
              </article>

              <section class="summary-stack" aria-label="Resumen del ciclo">
                <article class="summary-pill">
                  <span>Ausencias</span>
                  <strong>{{ summary.absences }}</strong>
                  <small>{{ summary.resolvedAbsences }} con motivo</small>
                </article>
                <article class="summary-pill danger">
                  <span>Retardos</span>
                  <strong>{{ summary.tardies }}</strong>
                  <small>{{ maxLateLabel }}</small>
                </article>
                <article class="summary-pill">
                  <span>Entradas / salidas</span>
                  <strong>{{ accessSummary.entries }} / {{ accessSummary.exits }}</strong>
                  <small>{{ accessSummary.days }} días</small>
                </article>
              </section>
            </aside>
          </section>

          <section class="records-hub card" data-product-panel="attendance-full-record">
            <header class="panel-head records-head">
              <div>
                <p class="eyebrow">Expediente del ciclo</p>
                <h2>{{ filteredRecords.length }} registro{{ filteredRecords.length === 1 ? '' : 's' }}</h2>
              </div>
              <span class="records-range">{{ selectedSchoolYearLabel }}</span>
            </header>

            <section class="record-filters" aria-label="Buscar y filtrar expediente">
              <label class="control-label search-control">
                <span>Buscar</span>
                <input
                  v-model="recordFilters.search"
                  class="input"
                  type="search"
                  placeholder="Fecha, persona, ausencia, retardo o matrícula"
                  data-testid="attendance-record-search"
                />
              </label>
              <label class="control-label">
                <span>Mes</span>
                <select v-model="recordFilters.month" class="select" data-testid="attendance-month-filter">
                  <option value="all">Todo el ciclo</option>
                  <option v-for="month in recordMonths" :key="month.key" :value="month.key">{{ month.label }}</option>
                </select>
              </label>
            </section>

            <div class="filter-chips" aria-label="Tipo de registro">
              <button
                v-for="option in filterOptions"
                :key="option.value"
                class="filter-chip"
                :class="{ active: recordFilters.type === option.value }"
                type="button"
                :data-testid="`attendance-filter-${option.value}`"
                @click="recordFilters.type = option.value"
              >
                <span>{{ option.label }}</span>
                <strong>{{ option.count }}</strong>
              </button>
            </div>

            <div v-if="visibleRecords.length" class="expediente-list">
              <article v-for="record in visibleRecords" :key="record.key" class="expediente-row" :data-state="record.tone">
                <div class="date-tile">
                  <strong>{{ dayNumber(record.date) }}</strong>
                  <span>{{ monthShort(record.date) }}</span>
                </div>

                <div class="record-main">
                  <div class="record-title-line">
                    <strong>{{ dateLabel(record.date) }}</strong>
                    <span class="status-chip" :class="record.tone">{{ record.label }}</span>
                  </div>

                  <div class="record-details">
                    <p v-if="record.status === 'clear'">Día con expediente de asistencia sin ausencia registrada.</p>

                    <div v-if="record.absence" class="detail-note" :data-state="record.absence.motivoState">
                      <span>{{ record.absence.motivo || 'Motivo de inasistencia pendiente' }}</span>
                      <button class="text-action" type="button" data-testid="motivo-update-button" @click="openMotivo(record.absence)">
                        {{ record.absence.motivo ? 'Actualizar motivo' : 'Agregar motivo' }}
                      </button>
                    </div>

                    <div v-if="record.tardies.length" class="late-chip-row">
                      <span v-for="tardy in record.tardies" :key="`${tardy.id}-${tardy.time}`" class="late-chip" data-testid="late-minutes-badge">
                        <FamilyPersonasIcon name="entry" />
                        {{ tardy.minutesLate }} min tarde
                        <small>{{ tardy.time }} / límite {{ tardy.thresholdTime }}</small>
                      </span>
                    </div>

                    <div v-if="record.accessDay" class="access-inline">
                      <AccessActionChip label="Entrada" :action="record.accessDay.entrada" compact />
                      <AccessActionChip label="Salida" :action="record.accessDay.salida" compact />
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <p v-else class="quiet-empty">No encontramos registros con esos filtros.</p>

            <button v-if="canShowMoreRecords" class="btn btn-secondary show-more" type="button" data-testid="attendance-show-more" @click="recordLimit += 18">
              Ver más registros
            </button>
          </section>

          <section class="detail-grid">
            <article class="detail-card card" data-product-panel="absence-motivos">
              <header class="panel-head compact">
                <div>
                  <p class="eyebrow">Motivos de inasistencia</p>
                  <h2>{{ absences.length ? `${absences.length} ausencia${absences.length === 1 ? '' : 's'}` : 'Sin ausencias' }}</h2>
                </div>
                <span v-if="missingAbsences.length" class="mini-alert">{{ missingAbsences.length }} sin motivo</span>
              </header>

              <div v-if="visibleAbsences.length" class="compact-list">
                <article v-for="absence in visibleAbsences" :key="absence.id" class="compact-record" :data-state="absence.motivoState">
                  <div>
                    <strong>{{ dateLabel(absence.date) }}</strong>
                    <span>{{ absence.motivo || 'Motivo pendiente' }}</span>
                  </div>
                  <button class="btn btn-secondary" type="button" @click="openMotivo(absence)">
                    {{ absence.motivo ? 'Actualizar' : 'Agregar' }}
                  </button>
                </article>
              </div>
              <p v-else class="quiet-empty">Sin ausencias en este ciclo escolar.</p>

              <button v-if="absences.length > visibleAbsences.length" class="text-action standalone" type="button" @click="absenceLimit += 4">
                Ver más ausencias
              </button>
            </article>

            <article class="detail-card card" data-product-panel="tardy-records">
              <header class="panel-head compact">
                <div>
                  <p class="eyebrow">Retardos</p>
                  <h2>{{ tardies.length ? 'Minutos tarde' : 'Sin retardos' }}</h2>
                </div>
                <span v-if="tardies.length" class="mini-alert danger">{{ maxLateLabel }}</span>
              </header>

              <div v-if="visibleTardies.length" class="compact-list">
                <article v-for="tardy in visibleTardies" :key="`${tardy.id}-${tardy.date}-${tardy.time}`" class="compact-record tardy">
                  <div>
                    <strong>{{ dateLabel(tardy.date) }}</strong>
                    <span>Entrada {{ tardy.time }} / límite {{ tardy.thresholdTime }}</span>
                  </div>
                  <b>{{ tardy.minutesLate }} min</b>
                </article>
              </div>
              <p v-else class="quiet-empty">Sin retardos en este ciclo escolar.</p>

              <button v-if="tardies.length > visibleTardies.length" class="text-action standalone" type="button" @click="tardyLimit += 4">
                Ver más retardos
              </button>
            </article>
          </section>

          <section class="access-panel card" data-product-panel="access-history-in-attendance">
            <header class="panel-head records-head">
              <div>
                <p class="eyebrow">Entradas y salidas</p>
                <h2>{{ accessSummary.days }} día{{ accessSummary.days === 1 ? '' : 's' }} con registro</h2>
              </div>
              <span class="records-range">{{ accessSummary.uniquePeople }} persona{{ accessSummary.uniquePeople === 1 ? '' : 's' }}</span>
            </header>

            <div v-if="visibleAccessDays.length" class="access-list">
              <article v-for="day in visibleAccessDays" :key="day.key" class="access-day-card">
                <div class="date-tile">
                  <strong>{{ dayNumber(day.date) }}</strong>
                  <span>{{ monthShort(day.date) }}</span>
                </div>
                <div class="access-day-main">
                  <div class="access-student">
                    <strong>{{ dateLabel(day.date) }}</strong>
                    <span>{{ day.student.name }} · {{ displayMatricula(day.student.matricula) }}</span>
                  </div>
                  <div class="access-pair">
                    <AccessActionChip label="Entrada" :action="day.entrada" />
                    <AccessActionChip label="Salida" :action="day.salida" />
                  </div>
                </div>
              </article>
            </div>
            <p v-else class="quiet-empty">Sin entradas o salidas para este ciclo escolar.</p>

            <button v-if="data.accessHistory.days.length > visibleAccessDays.length" class="btn btn-secondary show-more" type="button" @click="accessLimit += 6">
              Ver más entradas y salidas
            </button>
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
  AttendanceTardyRecord,
  ParentAttendanceResponse
} from '~/types/attendance'
import type { AccessHistoryAction, AccessHistoryDay } from '~/types/accessHistory'
import { formatAttendanceDate, normalizeAttendanceText } from '~/utils/attendance'
import { displayMatricula, normalizeMatricula } from '~/utils/matricula'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

type RecordFilter = 'all' | 'absence' | 'missing' | 'provided' | 'tardy' | 'access'
type RecordTone = 'clear' | 'absence' | 'missing' | 'provided' | 'tardy' | 'combined' | 'access'

interface ExpRecord {
  key: string
  date: string
  status: AttendanceCalendarDay['status'] | 'access-only'
  tone: RecordTone
  label: string
  absence?: AttendanceAbsenceRecord
  tardies: AttendanceTardyRecord[]
  accessDay?: AccessHistoryDay
  searchText: string
}

const AccessActionChip = defineComponent({
  props: {
    label: { type: String, required: true },
    action: { type: Object as () => AccessHistoryAction | null | undefined, default: null },
    compact: { type: Boolean, default: false }
  },
  setup(props) {
    return () => h('div', { class: ['access-chip', props.action?.type || 'missing', props.compact ? 'compact' : ''] }, [
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
const selectedMatricula = ref(normalizeMatricula(queryValue(route.query.matricula)))
const selectedSchoolYear = ref(queryValue(route.query.schoolYear))
const editingAbsence = ref<AttendanceAbsenceRecord | null>(null)
const motivoDraft = ref('')
const motivoError = ref('')
const notice = ref('')
const savingMotivo = ref(false)
const failedAbsenceId = ref<number | null>(null)
const recordLimit = ref(18)
const absenceLimit = ref(4)
const tardyLimit = ref(4)
const accessLimit = ref(6)
const recordFilters = reactive({
  search: '',
  type: 'all' as RecordFilter,
  month: 'all'
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
const absences = computed(() => [...(data.value?.absences || [])].sort((a, b) => b.date.localeCompare(a.date)))
const tardies = computed(() => [...(data.value?.tardies || [])].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)))
const missingAbsences = computed(() => absences.value.filter((absence) => absence.motivoState === 'missing'))
const nextMissingAbsence = computed(() => missingAbsences.value[0] || null)
const selectedChildLine = computed(() => [data.value?.selectedChild.grado, data.value?.selectedChild.grupo].filter(Boolean).join(' / ') || data.value?.selectedChild.plantelCode || '')
const selectedSchoolYearLabel = computed(() => data.value?.selectedSchoolYear.label || selectedSchoolYear.value || '')
const selectedRangeLabel = computed(() => {
  const year = data.value?.selectedSchoolYear
  return year ? `${dateLabel(year.startDate)} - ${dateLabel(year.endDate)}` : selectedSchoolYearLabel.value
})
const heroTitle = computed(() => data.value?.selectedChild.name || 'Asistencia')
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

const attendanceByDate = computed(() => new Map((data.value?.calendarDays || []).map((day) => [day.date, day])))
const absenceByDate = computed(() => new Map((data.value?.absences || []).map((absence) => [absence.date, absence])))
const tardiesByDate = computed(() => {
  const map = new Map<string, AttendanceTardyRecord[]>()
  for (const tardy of data.value?.tardies || []) {
    const current = map.get(tardy.date) || []
    current.push(tardy)
    map.set(tardy.date, current)
  }
  return map
})
const accessByDate = computed(() => new Map((data.value?.accessHistory.days || []).map((day) => [day.date, day])))

const expedienteRecords = computed<ExpRecord[]>(() => {
  const dates = new Set([
    ...attendanceByDate.value.keys(),
    ...absenceByDate.value.keys(),
    ...tardiesByDate.value.keys(),
    ...accessByDate.value.keys()
  ])
  return Array.from(dates).sort((a, b) => b.localeCompare(a)).map((date) => buildRecord(date))
})

const recordMonths = computed(() => {
  const formatter = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' })
  const seen = new Set<string>()
  return expedienteRecords.value
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((record) => record.date.slice(0, 7))
    .filter((key) => {
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((key) => ({ key, label: formatter.format(new Date(`${key}-15T12:00:00`)) }))
})

const filteredRecords = computed(() => {
  const search = normalizeAttendanceText(recordFilters.search)
  return expedienteRecords.value.filter((record) => {
    if (recordFilters.month !== 'all' && record.date.slice(0, 7) !== recordFilters.month) return false
    if (recordFilters.type === 'absence' && !record.absence) return false
    if (recordFilters.type === 'missing' && record.absence?.motivoState !== 'missing') return false
    if (recordFilters.type === 'provided' && record.absence?.motivoState !== 'provided') return false
    if (recordFilters.type === 'tardy' && !record.tardies.length) return false
    if (recordFilters.type === 'access' && !record.accessDay) return false
    if (!search) return true
    return record.searchText.includes(search)
  })
})
const visibleRecords = computed(() => filteredRecords.value.slice(0, recordLimit.value))
const canShowMoreRecords = computed(() => filteredRecords.value.length > visibleRecords.value.length)
const visibleAbsences = computed(() => absences.value.slice(0, absenceLimit.value))
const visibleTardies = computed(() => tardies.value.slice(0, tardyLimit.value))
const visibleAccessDays = computed(() => (data.value?.accessHistory.days || []).slice(0, accessLimit.value))

const filterOptions = computed(() => {
  const all = expedienteRecords.value
  const count = (predicate: (record: ExpRecord) => boolean) => all.filter(predicate).length
  return [
    { value: 'all' as const, label: 'Todo', count: all.length },
    { value: 'absence' as const, label: 'Ausencias', count: count((record) => Boolean(record.absence)) },
    { value: 'missing' as const, label: 'Sin motivo', count: count((record) => record.absence?.motivoState === 'missing') },
    { value: 'provided' as const, label: 'Con motivo', count: count((record) => record.absence?.motivoState === 'provided') },
    { value: 'tardy' as const, label: 'Retardos', count: count((record) => record.tardies.length > 0) },
    { value: 'access' as const, label: 'Entradas y salidas', count: count((record) => Boolean(record.accessDay)) }
  ]
})

watch(data, (value) => {
  if (!value) return
  if (!selectedMatricula.value) selectedMatricula.value = normalizeMatricula(value.selectedChild.matricula)
  if (!selectedSchoolYear.value) selectedSchoolYear.value = value.selectedSchoolYear.label
  recordLimit.value = 18
  absenceLimit.value = 4
  tardyLimit.value = 4
  accessLimit.value = 6
}, { immediate: true })

watch(() => [recordFilters.search, recordFilters.type, recordFilters.month], () => {
  recordLimit.value = 18
})

function buildRecord(date: string): ExpRecord {
  const day = attendanceByDate.value.get(date)
  const absence = absenceByDate.value.get(date)
  const recordTardies = (tardiesByDate.value.get(date) || []).slice().sort((a, b) => a.time.localeCompare(b.time))
  const accessDay = accessByDate.value.get(date)
  const status = day?.status || (accessDay ? 'access-only' : 'clear')
  const tone = recordTone(status, absence)
  const label = recordLabel(status, absence)
  const accessText = accessDay?.actions.map((action) => `${action.type} ${action.time} ${action.person.name} ${action.person.parentesco || ''}`).join(' ') || ''
  const tardyText = recordTardies.map((tardy) => `${tardy.time} ${tardy.minutesLate} minutos tarde limite ${tardy.thresholdTime}`).join(' ')
  const searchText = normalizeAttendanceText([
    date,
    dateLabel(date),
    label,
    absence?.motivo,
    absence?.studentName,
    tardyText,
    accessText,
    data.value?.selectedChild.matricula,
    data.value?.selectedChild.name
  ].filter(Boolean).join(' '))

  return {
    key: `record-${date}`,
    date,
    status,
    tone,
    label,
    absence,
    tardies: recordTardies,
    accessDay,
    searchText
  }
}

function recordTone(status: ExpRecord['status'], absence?: AttendanceAbsenceRecord): RecordTone {
  if (status === 'absence-tardy') return 'combined'
  if (status === 'absence') return absence?.motivoState === 'provided' ? 'provided' : 'missing'
  if (status === 'tardy') return 'tardy'
  if (status === 'access-only') return 'access'
  return 'clear'
}

function recordLabel(status: ExpRecord['status'], absence?: AttendanceAbsenceRecord) {
  if (status === 'absence-tardy') return 'Ausencia y retardo'
  if (status === 'absence') return absence?.motivoState === 'provided' ? 'Ausencia con motivo' : 'Ausencia sin motivo'
  if (status === 'tardy') return 'Retardo'
  if (status === 'access-only') return 'Entrada/salida'
  return 'Presente'
}

function queryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '').trim()
  return String(value || '').trim()
}

function syncRoute() {
  notice.value = ''
  motivoError.value = ''
  failedAbsenceId.value = null
  recordFilters.search = ''
  recordFilters.type = 'all'
  recordFilters.month = 'all'
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      matricula: normalizeMatricula(selectedMatricula.value) || undefined,
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
    clear: 'Presente',
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
  gap: 12px;
  margin: 0 auto;
  max-width: 1320px;
  width: 100%;
}

.attendance-page .btn-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
}

.expediente-header {
  align-items: stretch;
  background:
    radial-gradient(circle at 86% 18%, rgba(var(--pa-primary-rgb), 0.16), transparent 30%),
    linear-gradient(135deg, #ffffff, rgba(var(--pa-primary-rgb), 0.08));
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(168px, 220px);
  overflow: hidden;
  padding: clamp(12px, 2vw, 18px);
}

.student-context,
.context-card,
.record-main,
.access-chip-copy,
.access-day-main {
  min-width: 0;
}

.student-context {
  align-content: center;
  display: grid;
  gap: 8px;
}

.student-context h1 {
  font-size: clamp(1.55rem, 3vw, 2.5rem);
  line-height: 1.02;
  margin-bottom: 0;
}

.identity-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.identity-row span,
.records-range,
.mini-alert,
.status-chip,
.late-chip,
.filter-chip {
  border-radius: 999px;
  font-weight: 700;
}

.identity-row span {
  background: #fff;
  border: 1px solid var(--pa-border);
  color: var(--pa-primary);
  font-size: 0.78rem;
  padding: 5px 8px;
}

.context-controls {
  align-items: end;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(210px, 1fr) minmax(160px, 0.42fr);
  max-width: 760px;
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

.context-card {
  align-items: center;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid var(--pa-border);
  border-radius: 16px;
  display: grid;
  gap: 8px;
  justify-items: center;
  min-height: 100px;
  padding: 10px;
  text-align: center;
}

.context-card img {
  max-height: 78px;
  max-width: 100%;
  object-fit: contain;
}

.context-card span {
  color: var(--color-muted);
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.context-card strong {
  color: var(--pa-primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loading-layout {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.loading-card {
  animation: pulse 1.1s ease-in-out infinite alternate;
  background: linear-gradient(90deg, rgba(255,255,255,.7), rgba(var(--pa-primary-rgb), .14), rgba(255,255,255,.7));
  border: 1px solid var(--pa-border);
  border-radius: 16px;
  min-height: 92px;
}

@keyframes pulse {
  from { opacity: .55; }
  to { opacity: 1; }
}

.source-strip,
.notice {
  background: #fff8ea;
  border: 1px solid #f0d9a5;
  border-radius: 16px;
  color: #795b1c;
  display: flex;
  flex-wrap: wrap;
  font-size: 0.84rem;
  font-weight: 700;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
}

.notice {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}

.empty-expediente {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 112px minmax(0, 1fr);
}

.empty-expediente img {
  max-height: 78px;
  object-fit: contain;
}

.dashboard-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.82fr);
}

.coverage-board,
.pending-card,
.detail-card,
.records-hub,
.access-panel {
  display: grid;
  gap: 10px;
}

.panel-head {
  align-items: start;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.panel-head.compact {
  align-items: center;
}

.panel-head h2,
.panel-head p,
.student-context p,
.pending-card p,
.compact-record span,
.record-details p,
.access-student span {
  margin-bottom: 0;
}

.coverage-total {
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  display: grid;
  gap: 2px;
  min-width: 92px;
  padding: 9px;
  text-align: center;
}

.coverage-total strong {
  color: var(--pa-primary);
  font-family: var(--font-title);
  font-size: 1.5rem;
  line-height: 0.9;
}

.coverage-total span,
.coverage-legend span,
.month-row small,
.summary-pill small,
.quiet-empty,
.records-range {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.coverage-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.coverage-legend span {
  align-items: center;
  display: inline-flex;
  gap: 6px;
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
.day-dot.absence,
.day-dot.provided {
  background: #d46355;
}

.dot.tardy,
.day-dot.tardy {
  background: #c9352b;
}

.dot.absence-tardy,
.day-dot.absence-tardy {
  background: linear-gradient(135deg, #d46355 0 50%, #c9352b 50% 100%);
}

.month-coverage {
  display: grid;
  gap: 8px;
}

.month-row {
  align-items: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 12px;
  grid-template-columns: 102px minmax(0, 1fr) 68px;
  padding-top: 8px;
}

.month-label strong,
.month-label span {
  display: block;
}

.month-label span {
  color: var(--color-muted);
  font-size: 0.74rem;
  font-weight: 700;
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

.action-column {
  display: grid;
  gap: 10px;
}

.pending-card {
  background: #2f3338;
  border-color: #2f3338;
  color: #fff;
}

.pending-card[data-state='clear'] {
  background: #fff;
  border-color: var(--color-border);
  color: var(--color-ink);
}

.pending-card .eyebrow,
.pending-card h2 {
  color: inherit;
}

.pending-card p {
  color: inherit;
  opacity: 0.78;
}

.pending-date {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  display: grid;
  gap: 3px;
  padding: 10px;
}

.pending-date span {
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.82rem;
  font-weight: 700;
}

.summary-stack {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;
}

.summary-pill {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 5px;
  padding: 10px 12px;
}

.summary-pill span {
  color: var(--color-muted);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-pill strong {
  color: var(--color-ink);
  font-family: var(--font-title);
  font-size: 1.5rem;
  line-height: 0.9;
}

.summary-pill.danger {
  border-color: #ffd5cf;
}

.summary-pill.danger strong,
.mini-alert.danger,
.compact-record.tardy b,
.late-chip {
  color: #a53227;
}

.records-hub {
  padding: clamp(12px, 2vw, 18px);
}

.records-range,
.mini-alert {
  align-self: start;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  color: var(--pa-primary);
  padding: 7px 10px;
}

.mini-alert.danger {
  background: #fff3f1;
  border-color: #ffd5cf;
}

.record-filters {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 0.26fr);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  color: var(--color-muted);
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  min-height: 36px;
  padding: 8px 11px;
}

.filter-chip.active {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}

.filter-chip strong {
  color: inherit;
}

.expediente-list {
  display: grid;
  gap: 8px;
}

.expediente-row,
.access-day-card,
.compact-record {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
}

.expediente-row {
  display: grid;
  gap: 12px;
  grid-template-columns: 62px minmax(0, 1fr);
  padding: 10px;
}

.expediente-row[data-state='missing'],
.compact-record[data-state='missing'] {
  border-color: #ffd0c8;
}

.expediente-row[data-state='tardy'],
.expediente-row[data-state='combined'],
.compact-record.tardy {
  border-color: #ffd5cf;
}

.date-tile {
  align-content: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 16px;
  color: var(--pa-primary);
  display: grid;
  justify-items: center;
  min-height: 54px;
  text-transform: uppercase;
}

.date-tile strong {
  font-family: var(--font-title);
  font-size: 1.35rem;
  line-height: 0.9;
}

.date-tile span {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.record-main,
.record-details {
  display: grid;
  gap: 8px;
}

.record-title-line {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-chip {
  background: var(--pa-soft);
  color: var(--pa-primary);
  font-size: 0.72rem;
  padding: 5px 8px;
}

.status-chip.missing,
.status-chip.absence,
.status-chip.provided {
  background: #fff3f1;
  color: #a53227;
}

.status-chip.tardy,
.status-chip.combined {
  background: #ffe9e5;
  color: #9f2f25;
}

.status-chip.access {
  background: #eef7fb;
  color: #24718d;
}

.detail-note {
  align-items: center;
  background: #fff9f7;
  border: 1px solid #ffe2dc;
  border-radius: 14px;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 9px 10px;
}

.detail-note[data-state='provided'] {
  background: #fff;
  border-color: var(--color-border);
}

.detail-note span {
  color: var(--color-ink);
  font-size: 0.88rem;
  font-weight: 700;
}

.text-action {
  background: transparent;
  border: 0;
  color: var(--pa-primary);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 0;
}

.text-action.standalone {
  justify-self: start;
}

.late-chip-row,
.access-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.late-chip {
  align-items: center;
  background: #fff3f1;
  border: 1px solid #ffd5cf;
  display: inline-flex;
  font-size: 0.84rem;
  gap: 6px;
  padding: 7px 9px;
}

.late-chip small {
  color: #7c514d;
  font-weight: 700;
}

.access-chip {
  --access-photo-size: 42px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: grid;
  gap: 7px;
  min-width: 0;
  padding: 10px;
}

.access-chip.compact {
  --access-photo-size: 34px;
  min-width: min(220px, 100%);
  padding: 8px;
}

.access-chip.entrada {
  border-color: rgba(61, 145, 102, 0.28);
}

.access-chip.salida {
  border-color: rgba(91, 125, 174, 0.3);
}

.access-chip-label {
  color: var(--color-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.access-chip-body {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: var(--access-photo-size) minmax(0, 1fr);
}

.access-photo-shell {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 999px;
  display: grid;
  height: var(--access-photo-size);
  max-height: var(--access-photo-size);
  max-width: var(--access-photo-size);
  overflow: hidden;
  place-items: center;
  width: var(--access-photo-size);
}

.access-photo-shell :deep(.processed-photo),
.access-photo-shell :deep(img) {
  display: block;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  object-fit: cover;
  width: 100%;
}

.access-chip-copy {
  display: grid;
  gap: 1px;
}

.access-chip-copy strong,
.access-chip-copy span,
.access-chip-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.access-chip-copy span,
.access-chip-copy small,
.access-chip-empty {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.detail-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.compact-list,
.access-list {
  display: grid;
  gap: 8px;
}

.compact-record {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 10px 12px;
}

.compact-record div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.compact-record span {
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-record b {
  background: #fff3f1;
  border-radius: 999px;
  padding: 6px 9px;
}

.access-panel {
  padding: clamp(12px, 2vw, 18px);
}

.access-day-card {
  display: grid;
  gap: 12px;
  grid-template-columns: 62px minmax(0, 1fr);
  padding: 10px;
}

.access-student {
  display: grid;
  gap: 2px;
}

.access-pair {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 10px;
}

.show-more {
  justify-self: center;
}

.motivo-form {
  display: grid;
  gap: 10px;
}

.motivo-form textarea {
  min-height: 92px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 1180px) {
  .dashboard-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .summary-stack {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .attendance-page {
    gap: 10px;
  }

  .expediente-header,
  .context-controls,
  .record-filters,
  .panel-head,
  .month-row,
  .access-pair {
    grid-template-columns: 1fr;
  }

  .expediente-header {
    gap: 12px;
    padding: 14px;
  }

  .student-context {
    gap: 8px;
  }

  .student-context h1 {
    font-size: clamp(1.55rem, 8.2vw, 2.15rem);
    line-height: 1;
  }

  .context-controls {
    gap: 8px;
  }

  .context-card {
    border-radius: 18px;
    grid-template-columns: 64px minmax(0, 1fr);
    justify-items: start;
    min-height: 0;
    padding: 10px 12px;
    text-align: left;
  }

  .context-card img {
    max-height: 58px;
  }

  .action-column {
    order: -1;
  }

  .pending-card {
    gap: 8px;
  }

  .pending-card h2 {
    font-size: 1.45rem;
  }

  .pending-date {
    padding: 10px;
  }

  .summary-stack {
    grid-template-columns: 1fr;
  }

  .coverage-total {
    justify-self: stretch;
  }

  .month-row small {
    display: none;
  }

  .filter-chips {
    flex-wrap: nowrap;
    margin: 0 -2px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .filter-chip {
    flex: 0 0 auto;
  }

  .expediente-row,
  .access-day-card {
    grid-template-columns: 54px minmax(0, 1fr);
  }

  .date-tile {
    min-height: 54px;
  }

  .date-tile strong {
    font-size: 1.4rem;
  }

  .detail-note,
  .compact-record {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .expediente-header,
  .coverage-board,
  .pending-card,
  .records-hub,
  .detail-card,
  .access-panel {
    border-radius: 18px;
  }

  .identity-row {
    gap: 6px;
  }

  .identity-row span {
    font-size: 0.72rem;
    padding: 5px 8px;
  }

  .context-card {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .context-card img {
    max-height: 48px;
  }

  .late-chip {
    align-items: flex-start;
    display: grid;
    gap: 2px;
  }

  .access-inline {
    display: grid;
  }
}
</style>
