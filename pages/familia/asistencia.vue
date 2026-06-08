<template>
  <FamilyPersonasAutorizadasShell title="Asistencia">
    <section class="attendance-page" :data-state="pageState" data-product-panel="family-attendance-bitacora">
      <header class="attendance-hero">
        <div class="hero-copy">
          <p class="eyebrow">Bitácora de asistencia y accesos</p>
          <h1>Asistencia</h1>
          <p class="cycle-line">{{ currentCycleLabel }}</p>
        </div>

        <div v-if="data" class="hero-context" aria-label="Contexto del alumno">
          <div class="student-chip">
            <span>{{ initials(data.selectedChild.name) }}</span>
            <div>
              <strong>{{ data.selectedChild.name }}</strong>
              <small>{{ selectedChildLine || displayMatricula(data.selectedChild.matricula) }}</small>
            </div>
          </div>

          <label v-if="children.length > 1" class="compact-select">
            <span>Alumno</span>
            <select v-model="selectedMatricula" class="select" data-testid="attendance-child-select" @change="syncRoute">
              <option v-for="child in children" :key="child.matricula" :value="child.matricula">
                {{ child.name }}
              </option>
            </select>
          </label>

          <button class="btn btn-secondary cycle-button" type="button" data-testid="attendance-open-cycles" @click="cycleDrawerOpen = true">
            <FamilyPersonasIcon name="calendar" />
            Ciclos anteriores
          </button>
        </div>
      </header>

      <p v-if="loadError" class="alert" data-state="error">No fue posible abrir la bitácora de asistencia.</p>

      <section v-else-if="pending && !data" class="loading-layout" data-state="loading">
        <span v-for="item in 6" :key="item" class="loading-card"></span>
      </section>

      <template v-else-if="data">
        <section v-if="sourceWarnings.length" class="source-strip" :data-state="data.status">
          <span v-for="warning in sourceWarnings" :key="warning">{{ warning }}</span>
        </section>

        <section v-if="emptyState" class="empty-expediente card" data-state="empty">
          <div class="empty-mark"><FamilyPersonasIcon name="calendar" /></div>
          <div>
            <p class="eyebrow">{{ selectedSchoolYearLabel }}</p>
            <h2>Sin registros para este ciclo escolar</h2>
            <p>Cuando haya asistencia, ausencias, retardos o entradas y salidas, aparecerán aquí.</p>
          </div>
        </section>

        <template v-else>
          <section class="attendance-first-view" aria-label="Resumen visual del expediente">
            <article class="attention-card card" :data-state="missingAbsences.length ? 'pending' : 'clear'">
              <header class="section-head compact">
                <div>
                  <p class="eyebrow">Requiere tu atención</p>
                  <h2>{{ missingAbsences.length ? 'Ausencias sin motivo' : 'Todo en orden' }}</h2>
                </div>
                <span v-if="missingAbsences.length" class="count-badge danger">{{ missingAbsences.length }}</span>
                <span v-else class="count-badge clear"><FamilyPersonasIcon name="check" /></span>
              </header>

              <div v-if="attentionAbsences.length" class="attention-list">
                <article v-for="absence in attentionAbsences" :key="absence.id" class="attention-row">
                  <div class="date-tile mini">
                    <strong>{{ dayNumber(absence.date) }}</strong>
                    <span>{{ monthShort(absence.date) }}</span>
                  </div>
                  <div class="attention-copy">
                    <strong>{{ dateLabel(absence.date) }}</strong>
                    <span>Ausencia sin motivo</span>
                  </div>
                  <button class="btn btn-secondary mini-action" type="button" @click="openMotivo(absence)">
                    {{ failedAbsenceId === absence.id ? 'Reintentar' : 'Agregar motivo' }}
                  </button>
                </article>
              </div>

              <p v-else class="quiet-copy">No hay motivos pendientes para este ciclo.</p>
            </article>

            <article class="context-strip card">
              <div>
                <p class="eyebrow">Alumno</p>
                <strong>{{ data.selectedChild.name }}</strong>
                <span>{{ displayMatricula(data.selectedChild.matricula) }}</span>
              </div>
              <div>
                <p class="eyebrow">Grupo</p>
                <strong>{{ [data.selectedChild.grado, data.selectedChild.grupo].filter(Boolean).join(' / ') || 'Sin grupo' }}</strong>
                <span>{{ data.selectedChild.nivelEdu || data.selectedChild.plantelCode || 'Husky Pass' }}</span>
              </div>
              <div>
                <p class="eyebrow">Registro</p>
                <strong>{{ accessSummary.days }} día{{ accessSummary.days === 1 ? '' : 's' }}</strong>
                <span>con entrada o salida</span>
              </div>
            </article>
          </section>

          <section class="bitacora-panel card" data-product-panel="attendance-day-records">
            <header class="section-head bitacora-head">
              <div>
                <p class="eyebrow">Bitácora reciente</p>
                <h2>Asistencia y accesos por día</h2>
              </div>
              <span class="records-range">{{ currentCycleLabel }}</span>
            </header>

            <div v-if="recentRecords.length" class="day-card-grid">
              <article v-for="record in recentRecords" :key="record.key" class="day-card" :data-state="record.tone">
                <header class="day-card-head">
                  <div class="date-stack">
                    <span>{{ weekDay(record.date) }}</span>
                    <strong>{{ dayNumber(record.date) }}</strong>
                    <small>{{ monthShort(record.date) }}</small>
                  </div>
                  <div class="day-status">
                    <span class="status-chip" :class="record.tone">{{ record.label }}</span>
                    <small>{{ dateLabel(record.date) }}</small>
                  </div>
                </header>

                <div class="day-events">
                  <div v-if="record.absence" class="event-line absence" :data-state="record.absence.motivoState">
                    <FamilyPersonasIcon name="alert" />
                    <div>
                      <strong>{{ record.absence.motivoState === 'provided' ? 'Motivo registrado' : 'Ausencia sin motivo' }}</strong>
                      <span>{{ record.absence.motivo || 'Pendiente de motivo' }}</span>
                    </div>
                    <button class="text-action" type="button" @click="openMotivo(record.absence)">
                      {{ record.absence.motivo ? 'Actualizar' : 'Agregar motivo' }}
                    </button>
                  </div>

                  <div v-for="tardy in record.tardies" :key="`${tardy.id}-${tardy.time}`" class="event-line tardy">
                    <FamilyPersonasIcon name="clock" />
                    <div>
                      <strong>Retardo · {{ tardy.minutesLate }} min</strong>
                      <span>Entrada {{ tardy.time }} / límite {{ tardy.thresholdTime }}</span>
                    </div>
                  </div>

                  <div v-if="record.accessDay" class="access-pair">
                    <AccessActionChip label="Entrada" :action="record.accessDay.entrada" compact :on-open="openAccessDetail" />
                    <AccessActionChip label="Salida" :action="record.accessDay.salida" compact :on-open="openAccessDetail" />
                  </div>

                  <p v-if="record.status === 'clear' && !record.accessDay" class="present-line">
                    <FamilyPersonasIcon name="check" />
                    Día presente sin incidencias registradas.
                  </p>
                </div>
              </article>
            </div>

            <p v-else class="quiet-empty">Sin registros recientes para este ciclo.</p>
          </section>

          <section class="history-panel card" data-product-panel="attendance-history">
            <header class="section-head history-head">
              <div>
                <p class="eyebrow">Historial</p>
                <h2>{{ filteredRecords.length }} registro{{ filteredRecords.length === 1 ? '' : 's' }}</h2>
              </div>
            </header>

            <section class="record-filters" aria-label="Buscar y filtrar bitácora">
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

            <div v-if="visibleRecords.length" class="history-list">
              <article v-for="record in visibleRecords" :key="`history-${record.key}`" class="history-row" :data-state="record.tone">
                <div class="date-tile mini">
                  <strong>{{ dayNumber(record.date) }}</strong>
                  <span>{{ monthShort(record.date) }}</span>
                </div>
                <div class="history-main">
                  <div class="history-title">
                    <strong>{{ dateLabel(record.date) }}</strong>
                    <span class="status-chip" :class="record.tone">{{ record.label }}</span>
                  </div>
                  <div class="history-events">
                    <span v-if="record.absence">{{ record.absence.motivo || 'Motivo pendiente' }}</span>
                    <span v-if="record.tardies.length">{{ record.tardies.length }} retardo{{ record.tardies.length === 1 ? '' : 's' }}</span>
                    <span v-if="record.accessDay">Entrada/salida registrada</span>
                    <span v-if="record.status === 'clear' && !record.accessDay">Presente</span>
                  </div>
                </div>
                <button v-if="record.absence" class="btn btn-secondary row-action" type="button" @click="openMotivo(record.absence)">
                  {{ record.absence.motivo ? 'Actualizar motivo' : 'Agregar motivo' }}
                </button>
              </article>
            </div>

            <p v-else class="quiet-empty">No encontramos registros con esos filtros.</p>

            <button v-if="canShowMoreRecords" class="btn btn-secondary show-more" type="button" data-testid="attendance-show-more" @click="recordLimit += 12">
              Ver más registros
            </button>
          </section>
        </template>

        <p v-if="notice" class="notice">{{ notice }}</p>
      </template>

      <FamilyPersonasModal
        v-if="editingAbsence"
        title="Agregar motivo de inasistencia"
        :eyebrow="dateLabel(editingAbsence.date)"
        @close="closeMotivo"
      >
        <form class="motivo-form" data-testid="motivo-form" @submit.prevent="saveMotivo">
          <div class="modal-record-summary">
            <div class="date-tile mini">
              <strong>{{ dayNumber(editingAbsence.date) }}</strong>
              <span>{{ monthShort(editingAbsence.date) }}</span>
            </div>
            <div>
              <strong>{{ dateLabel(editingAbsence.date) }}</strong>
              <span>Ausencia sin motivo</span>
            </div>
          </div>

          <label class="label">
            <span>Motivo de inasistencia</span>
            <textarea
              v-model="motivoDraft"
              class="textarea"
              maxlength="700"
              required
              data-testid="motivo-textarea"
              placeholder="Escribe el motivo de la ausencia..."
            ></textarea>
          </label>
          <p class="counter">{{ motivoDraft.length }}/700</p>
          <p v-if="motivoError" class="alert">{{ motivoError }}</p>
          <div class="form-actions">
            <button class="btn btn-secondary" type="button" :disabled="savingMotivo" @click="closeMotivo">Cancelar</button>
            <button class="btn btn-primary" type="submit" :disabled="savingMotivo || motivoDraft.trim().length < 3" data-testid="motivo-submit">
              {{ savingMotivo ? 'Guardando...' : 'Guardar motivo' }}
            </button>
          </div>
        </form>
      </FamilyPersonasModal>

      <FamilyPersonasModal
        v-if="selectedAccessAction"
        :title="`Registro de ${selectedAccessAction.label.toLowerCase()}`"
        :eyebrow="dateLabel(selectedAccessAction.action.date)"
        @close="selectedAccessAction = null"
      >
        <section class="access-detail-modal">
          <div class="access-detail-copy">
            <span class="status-chip access">{{ selectedAccessAction.label }}</span>
            <h3>{{ selectedAccessAction.action.time }}</h3>
            <p>{{ data?.selectedChild.name }} · {{ displayMatricula(data?.selectedChild.matricula || '') }}</p>
            <dl>
              <div>
                <dt>Persona autorizada</dt>
                <dd>{{ selectedAccessAction.action.person.name }}</dd>
              </div>
              <div>
                <dt>Relación</dt>
                <dd>{{ selectedAccessAction.action.person.parentesco || 'Persona autorizada' }}</dd>
              </div>
            </dl>
          </div>
          <div class="access-detail-photo">
            <FamilyPersonasProcessedPhoto
              v-if="selectedAccessAction.action.person.photoUrl"
              :src="selectedAccessAction.action.person.photoUrl"
              :auto-process="false"
              :namespace="`access-detail-${selectedAccessAction.action.id}`"
              :alt="selectedAccessAction.action.person.name"
            />
            <FamilyPersonasIcon v-else name="person" />
          </div>
        </section>
      </FamilyPersonasModal>

      <FamilyPersonasModal
        v-if="cycleDrawerOpen"
        title="Ciclos escolares"
        eyebrow="Historial"
        @close="cycleDrawerOpen = false"
      >
        <section class="cycle-list">
          <button
            v-for="year in schoolYears"
            :key="year.label"
            class="cycle-row"
            :class="{ active: year.label === selectedSchoolYearLabel }"
            type="button"
            @click="selectSchoolYear(year.label)"
          >
            <span>
              <strong>{{ year.label }}</strong>
              <small>{{ dateLabel(year.startDate) }} - {{ dateLabel(year.endDate) }}</small>
            </span>
            <FamilyPersonasIcon name="chevron" />
          </button>
        </section>
      </FamilyPersonasModal>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref, resolveComponent, watch } from 'vue'
import type { PropType } from 'vue'
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

interface SelectedAccessAction {
  action: AccessHistoryAction
  label: string
}

const AccessActionChip = defineComponent({
  props: {
    label: { type: String, required: true },
    action: { type: Object as () => AccessHistoryAction | null | undefined, default: null },
    compact: { type: Boolean, default: false },
    onOpen: { type: Function as PropType<(action: AccessHistoryAction, label: string) => void>, default: undefined }
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
            ]),
            props.onOpen
              ? h('button', {
                  class: 'access-chip-detail',
                  type: 'button',
                  onClick: () => props.action && props.onOpen?.(props.action, props.label)
                }, 'Ver registro')
              : null
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
const selectedAccessAction = ref<SelectedAccessAction | null>(null)
const cycleDrawerOpen = ref(false)
const motivoDraft = ref('')
const motivoError = ref('')
const notice = ref('')
const savingMotivo = ref(false)
const failedAbsenceId = ref<number | null>(null)
const recordLimit = ref(12)
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
const accessSummary = computed(() => data.value?.accessHistory.summary || { days: 0, entries: 0, exits: 0, uniquePeople: 0, students: 0 })
const absences = computed(() => [...(data.value?.absences || [])].sort((a, b) => b.date.localeCompare(a.date)))
const missingAbsences = computed(() => absences.value.filter((absence) => absence.motivoState === 'missing'))
const attentionAbsences = computed(() => missingAbsences.value.slice(0, 2))
const selectedChildLine = computed(() => [data.value?.selectedChild.nivelEdu, data.value?.selectedChild.grado, data.value?.selectedChild.grupo].filter(Boolean).join(' / ') || data.value?.selectedChild.plantelCode || '')
const selectedSchoolYearLabel = computed(() => data.value?.selectedSchoolYear.label || selectedSchoolYear.value || '')
const currentCycleLabel = computed(() => selectedSchoolYearLabel.value ? `Este ciclo escolar · ${selectedSchoolYearLabel.value}` : 'Este ciclo escolar')
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

const recentRecords = computed(() => expedienteRecords.value.slice(0, 6))

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

const filterOptions = computed(() => {
  const all = expedienteRecords.value
  const count = (predicate: (record: ExpRecord) => boolean) => all.filter(predicate).length
  return [
    { value: 'all' as const, label: 'Todo', count: all.length },
    { value: 'missing' as const, label: 'Sin motivo', count: count((record) => record.absence?.motivoState === 'missing') },
    { value: 'absence' as const, label: 'Ausencias', count: count((record) => Boolean(record.absence)) },
    { value: 'tardy' as const, label: 'Retardos', count: count((record) => record.tardies.length > 0) },
    { value: 'access' as const, label: 'Entradas y salidas', count: count((record) => Boolean(record.accessDay)) },
    { value: 'provided' as const, label: 'Con motivo', count: count((record) => record.absence?.motivoState === 'provided') }
  ]
})

watch(data, (value) => {
  if (!value) return
  if (!selectedMatricula.value) selectedMatricula.value = normalizeMatricula(value.selectedChild.matricula)
  if (!selectedSchoolYear.value) selectedSchoolYear.value = value.selectedSchoolYear.label
  recordLimit.value = 12
}, { immediate: true })

watch(() => [recordFilters.search, recordFilters.type, recordFilters.month], () => {
  recordLimit.value = 12
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

function selectSchoolYear(year: string) {
  selectedSchoolYear.value = year
  cycleDrawerOpen.value = false
  syncRoute()
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

function weekDay(date: string) {
  return new Intl.DateTimeFormat('es-MX', { weekday: 'short' }).format(new Date(`${date}T12:00:00`))
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'A'
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

function openAccessDetail(action: AccessHistoryAction, label: string) {
  selectedAccessAction.value = { action, label }
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

.attendance-hero {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 4px 2px 8px;
}

.hero-copy {
  min-width: 0;
}

.hero-copy h1 {
  color: #15233d;
  font-size: clamp(1.8rem, 3vw, 2.55rem);
  line-height: 1;
  margin-bottom: 4px;
}

.cycle-line {
  color: #7d8797;
  font-weight: 800;
}

.hero-context {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.student-chip {
  align-items: center;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(198, 215, 235, 0.78);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(33, 72, 122, 0.08);
  display: grid;
  gap: 10px;
  grid-template-columns: 38px minmax(0, 1fr);
  min-width: min(280px, 100%);
  padding: 7px 12px 7px 7px;
}

.student-chip > span {
  align-items: center;
  aspect-ratio: 1;
  background: #eef6ff;
  border: 1px solid #cfe3ff;
  border-radius: 999px;
  color: var(--pa-primary);
  display: inline-flex;
  font-weight: 900;
  justify-content: center;
}

.student-chip div {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.student-chip strong,
.student-chip small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-chip small,
.compact-select span,
.context-strip span,
.records-range,
.quiet-copy,
.quiet-empty,
.access-chip-copy small,
.access-chip-copy span,
.history-events,
.counter {
  color: #6f7b8f;
  font-size: 0.78rem;
  font-weight: 750;
}

.compact-select {
  display: grid;
  gap: 4px;
  min-width: 190px;
}

.compact-select span,
.control-label span {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cycle-button {
  white-space: nowrap;
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
  border-radius: 18px;
  min-height: 132px;
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
  font-weight: 800;
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
  gap: 14px;
  grid-template-columns: 68px minmax(0, 1fr);
}

.empty-mark {
  align-items: center;
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 22px;
  color: var(--pa-primary);
  display: flex;
  justify-content: center;
}

.empty-mark :deep(.pa-icon) {
  height: 1.8rem;
  width: 1.8rem;
}

.attendance-first-view {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1.22fr) minmax(360px, 0.78fr);
}

.attention-card,
.context-strip,
.bitacora-panel,
.history-panel {
  border-color: rgba(206, 219, 236, 0.82);
  box-shadow: 0 16px 42px rgba(27, 55, 96, 0.08);
}

.attention-card {
  background: linear-gradient(135deg, #fff, #fffafa);
  display: grid;
  gap: 12px;
}

.attention-card[data-state='pending'] {
  border-color: #f3c9c1;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-width: 0;
}

.section-head.compact h2,
.section-head h2,
.section-head p {
  margin-bottom: 0;
}

.section-head h2 {
  color: #172542;
  font-size: clamp(1.1rem, 1.7vw, 1.45rem);
}

.count-badge,
.status-chip,
.filter-chip,
.records-range {
  border-radius: 999px;
  font-weight: 900;
}

.count-badge {
  align-items: center;
  background: #fff1ef;
  border: 1px solid #ffcfc6;
  color: #c84134;
  display: inline-flex;
  justify-content: center;
  min-height: 28px;
  min-width: 28px;
  padding: 4px 8px;
}

.count-badge.clear {
  background: #edf8ee;
  border-color: #c8e8cc;
  color: #4c9a45;
}

.attention-list {
  display: grid;
  gap: 8px;
}

.attention-row {
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #f1d6cf;
  border-radius: 16px;
  display: grid;
  gap: 10px;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  padding: 8px;
}

.attention-copy,
.context-strip > div,
.history-main,
.access-chip-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.attention-copy span {
  color: #c84134;
  font-size: 0.76rem;
  font-weight: 900;
}

.mini-action {
  min-height: 32px;
  padding: 0 11px;
}

.context-strip {
  align-content: center;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.context-strip > div {
  background: linear-gradient(180deg, #fff, #f8fbff);
  border: 1px solid #d9e5f5;
  border-radius: 16px;
  padding: 12px;
}

.context-strip strong {
  color: #172542;
  font-family: var(--font-title);
  font-size: 1.05rem;
}

.bitacora-panel,
.history-panel {
  display: grid;
  gap: 12px;
  padding: clamp(13px, 2vw, 18px);
}

.bitacora-head,
.history-head {
  align-items: end;
}

.day-card-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.day-card {
  background: linear-gradient(180deg, #fff, #fbfdff);
  border: 1px solid #dfe7f2;
  border-radius: 20px;
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 12px;
}

.day-card[data-state='missing'],
.day-card[data-state='combined'] {
  background: linear-gradient(180deg, #fff, #fff9f7);
  border-color: #f0cdc6;
}

.day-card[data-state='tardy'] {
  background: linear-gradient(180deg, #fff, #fffaf4);
  border-color: #f3d7b5;
}

.day-card-head {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 56px minmax(0, 1fr);
}

.date-stack,
.date-tile {
  align-content: center;
  background: #eef6ff;
  border: 1px solid #cfe3ff;
  border-radius: 16px;
  color: var(--pa-primary);
  display: grid;
  justify-items: center;
  min-height: 62px;
  text-transform: uppercase;
}

.date-stack strong,
.date-tile strong {
  font-family: var(--font-title);
  font-size: 1.45rem;
  line-height: 0.9;
}

.date-stack span,
.date-stack small,
.date-tile span {
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.date-tile.mini {
  border-radius: 14px;
  min-height: 46px;
}

.date-tile.mini strong {
  font-size: 1.15rem;
}

.day-status {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.day-status small {
  color: #7d8797;
  font-size: 0.76rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-chip {
  align-items: center;
  background: var(--pa-soft);
  color: var(--pa-primary);
  display: inline-flex;
  font-size: 0.72rem;
  justify-self: start;
  padding: 5px 8px;
}

.status-chip.missing,
.status-chip.absence,
.status-chip.provided {
  background: #fff1ef;
  color: #c84134;
}

.status-chip.tardy,
.status-chip.combined {
  background: #fff3e2;
  color: #c2690d;
}

.status-chip.access {
  background: #edf6ff;
  color: #2066aa;
}

.day-events {
  display: grid;
  gap: 8px;
}

.event-line {
  align-items: center;
  border-radius: 15px;
  display: grid;
  gap: 8px;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  padding: 9px 10px;
}

.event-line.absence {
  background: #fff6f4;
  border: 1px solid #f2d8d1;
  color: #bf3d31;
}

.event-line.tardy {
  background: #fff8ed;
  border: 1px solid #f2d9b7;
  color: #bf6a10;
  grid-template-columns: 28px minmax(0, 1fr);
}

.event-line strong,
.event-line span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-line span {
  color: #7d695f;
  font-size: 0.78rem;
  font-weight: 750;
}

.text-action {
  background: transparent;
  border: 0;
  color: var(--pa-primary);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 900;
  padding: 0;
  white-space: nowrap;
}

.access-pair {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.access-chip {
  --access-photo-size: 42px;
  background: #fff;
  border: 1px solid #dfe7f2;
  border-radius: 16px;
  display: grid;
  gap: 7px;
  min-width: 0;
  padding: 10px;
}

.access-chip.compact {
  --access-photo-size: 34px;
  padding: 8px;
}

.access-chip.entrada {
  border-color: rgba(61, 145, 102, 0.28);
}

.access-chip.salida {
  border-color: rgba(64, 105, 172, 0.28);
}

.access-chip-label {
  color: #718093;
  font-size: 0.68rem;
  font-weight: 900;
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

.access-chip-copy strong,
.access-chip-copy span,
.access-chip-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.access-chip-copy strong {
  color: #172542;
}

.access-chip-detail {
  background: transparent;
  border: 0;
  color: var(--pa-primary);
  cursor: pointer;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 900;
  grid-column: 2;
  justify-self: start;
  padding: 0;
}

.access-chip-empty,
.present-line {
  align-items: center;
  background: #f7faff;
  border: 1px solid #dfe7f2;
  border-radius: 14px;
  color: #718093;
  display: flex;
  font-size: 0.78rem;
  font-weight: 800;
  gap: 7px;
  padding: 9px 10px;
}

.record-filters {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 0.28fr);
}

.control-label {
  color: #6f7b8f;
  display: grid;
  font-size: 0.76rem;
  gap: 6px;
  font-weight: 800;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  align-items: center;
  background: #fff;
  border: 1px solid #dfe7f2;
  color: #6f7b8f;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  min-height: 34px;
  padding: 7px 10px;
}

.filter-chip.active {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}

.history-list {
  display: grid;
  gap: 8px;
}

.history-row {
  align-items: center;
  background: #fff;
  border: 1px solid #dfe7f2;
  border-radius: 18px;
  display: grid;
  gap: 10px;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  padding: 9px;
}

.history-row[data-state='missing'],
.history-row[data-state='combined'] {
  border-color: #f0cdc6;
}

.history-title {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.history-events {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.history-events span:not(:last-child)::after {
  content: '·';
  margin-left: 7px;
}

.row-action {
  min-height: 34px;
  white-space: nowrap;
}

.show-more {
  justify-self: center;
}

.motivo-form {
  display: grid;
  gap: 10px;
}

.modal-record-summary {
  align-items: center;
  background: #fff8f6;
  border: 1px solid #f2d8d1;
  border-radius: 16px;
  display: grid;
  gap: 10px;
  grid-template-columns: 48px minmax(0, 1fr);
  padding: 10px;
}

.modal-record-summary div:last-child {
  display: grid;
  gap: 2px;
}

.modal-record-summary span {
  color: #bf3d31;
  font-size: 0.78rem;
  font-weight: 850;
}

.motivo-form textarea {
  min-height: 108px;
}

.counter {
  justify-self: end;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.access-detail-modal {
  align-items: stretch;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) minmax(170px, 240px);
}

.access-detail-copy {
  display: grid;
  gap: 10px;
}

.access-detail-copy h3 {
  color: #172542;
  font-family: var(--font-title);
  font-size: clamp(2rem, 6vw, 3rem);
  line-height: 0.9;
  margin: 0;
}

.access-detail-copy dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.access-detail-copy dl div {
  background: #f7faff;
  border: 1px solid #dfe7f2;
  border-radius: 14px;
  padding: 9px 10px;
}

.access-detail-copy dt {
  color: #6f7b8f;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.access-detail-copy dd {
  color: #172542;
  font-weight: 850;
  margin: 2px 0 0;
}

.access-detail-photo {
  background: #f7faff;
  border: 1px solid #dfe7f2;
  border-radius: 20px;
  display: grid;
  min-height: 230px;
  overflow: hidden;
  place-items: center;
}

.access-detail-photo :deep(.processed-photo),
.access-detail-photo :deep(img) {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.cycle-list {
  display: grid;
  gap: 8px;
}

.cycle-row {
  align-items: center;
  background: #fff;
  border: 1px solid #dfe7f2;
  border-radius: 16px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px;
  text-align: left;
}

.cycle-row.active {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}

.cycle-row span {
  display: grid;
  gap: 3px;
}

.cycle-row small {
  color: #6f7b8f;
  font-weight: 750;
}

@media (max-width: 1180px) {
  .day-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .attendance-first-view,
  .record-filters {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .attendance-page {
    gap: 10px;
  }

  .attendance-hero,
  .history-row,
  .access-detail-modal {
    grid-template-columns: 1fr;
  }

  .hero-context {
    justify-content: stretch;
  }

  .student-chip,
  .compact-select,
  .cycle-button {
    width: 100%;
  }

  .context-strip {
    grid-template-columns: 1fr;
  }

  .day-card-grid {
    grid-template-columns: 1fr;
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

  .row-action {
    justify-self: stretch;
  }

  .access-detail-photo {
    min-height: 260px;
  }
}

@media (max-width: 560px) {
  .attendance-hero {
    padding-top: 0;
  }

  .hero-copy h1 {
    font-size: clamp(1.65rem, 9vw, 2.1rem);
  }

  .attention-row {
    grid-template-columns: 44px minmax(0, 1fr);
  }

  .attention-row .mini-action {
    grid-column: 1 / -1;
    justify-self: stretch;
  }

  .bitacora-panel,
  .history-panel,
  .attention-card,
  .context-strip {
    border-radius: 18px;
  }

  .day-card {
    border-radius: 18px;
    padding: 10px;
  }

  .access-pair,
  .event-line {
    grid-template-columns: 1fr;
  }

  .event-line {
    align-items: start;
  }

  .event-line .text-action {
    justify-self: start;
  }

  .history-events span:not(:last-child)::after {
    display: none;
  }

  .form-actions {
    display: grid;
  }
}
</style>
