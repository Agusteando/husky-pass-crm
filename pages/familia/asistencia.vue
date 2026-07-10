<template>
  <FamilyPersonasAutorizadasShell title="Asistencia y accesos">
    <section class="attendance-page" :data-state="pageState" data-product-panel="family-attendance-bitacora">
      <FamilyAttendanceHeader
        v-if="data"
        :student-name="data.selectedChild.name"
        :student-details="selectedChildLine || displayMatricula(data.selectedChild.matricula)"
        :student-photo="selectedChildPhoto"
        :student-initials="initials(data.selectedChild.name)"
        :school-year="selectedSchoolYearLabel"
        :children="children"
        :selected-matricula="selectedMatricula"
        @open-cycles="cycleDrawerOpen = true"
        @select-student="selectStudent"
      />

      <FamilyAttendanceHeader
        v-else
        student-name="Asistencia y accesos"
        student-details="Preparando el expediente del alumno"
        school-year="Ciclo actual"
      />

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
          <section class="priority-grid" aria-label="Estado principal de asistencia">
            <article class="attention-card card" :data-state="missingAbsences.length ? 'pending' : 'clear'">
              <div class="attention-icon"><FamilyPersonasIcon :name="missingAbsences.length ? 'alert' : 'check'" /></div>
              <div class="attention-copy-main">
                <p class="eyebrow">{{ missingAbsences.length ? 'Por atender' : 'Todo en orden' }}</p>
                <h2>{{ missingAbsences.length ? `${missingAbsences.length} ausencia${missingAbsences.length === 1 ? '' : 's'} por justificar` : 'Sin ausencias pendientes' }}</h2>
                <p>{{ firstPendingAbsence ? `Próxima: ${dateLabel(firstPendingAbsence.date)}` : 'No hay motivos pendientes para este ciclo.' }}</p>
                <button v-if="firstPendingAbsence" class="btn btn-primary attention-primary" type="button" @click="openMotivo(firstPendingAbsence)">
                  <FamilyPersonasIcon name="edit" />
                  Agregar motivo
                </button>
              </div>

              <div v-if="attentionAbsences.length" class="attention-preview-list">
                <button
                  v-for="absence in attentionAbsences"
                  :key="absence.id"
                  class="attention-preview-row"
                  type="button"
                  @click="openMotivo(absence)"
                >
                  <span class="date-tile soft-danger">
                    <strong>{{ dayNumber(absence.date) }}</strong>
                    <small>{{ monthShort(absence.date) }}</small>
                  </span>
                  <span>
                    <strong>Ausencia</strong>
                    <small>{{ absence.motivo || 'sin motivo' }}</small>
                  </span>
                  <FamilyPersonasIcon name="chevron" />
                </button>
              </div>
            </article>

            <article class="latest-access-card card" :data-state="latestAccessAction ? 'ready' : 'empty'">
              <div class="latest-copy">
                <div class="latest-title-row">
                  <span class="latest-icon"><FamilyPersonasIcon name="check" /></span>
                  <div>
                    <p class="eyebrow">Último acceso registrado</p>
                    <h2 v-if="latestAccessAction">{{ latestAccessAction.label }} · {{ dateLabel(latestAccessAction.action.date) }}</h2>
                    <h2 v-else>Sin accesos recientes</h2>
                  </div>
                </div>

                <template v-if="latestAccessAction">
                  <strong class="latest-time">{{ latestAccessAction.action.time }}</strong>
                  <div class="latest-person">
                    <span class="person-thumb">
                      <FamilyPersonasProcessedPhoto
                        v-if="latestAccessAction.action.person.photoUrl"
                        :src="latestAccessAction.action.person.photoUrl"
                        :auto-process="false"
                        :namespace="`latest-access-${latestAccessAction.action.id}`"
                        :alt="latestAccessAction.action.person.name"
                      />
                      <FamilyPersonasIcon v-else name="person" />
                    </span>
                    <span>
                      <strong>{{ latestAccessAction.action.person.name }}</strong>
                      <small>{{ latestAccessAction.action.person.parentesco || 'Persona autorizada' }}</small>
                    </span>
                  </div>
                </template>

                <p v-else class="quiet-copy">Cuando haya entrada o salida registrada, aparecerá aquí.</p>
              </div>

              <button
                v-if="latestAccessAction"
                class="btn btn-secondary latest-action"
                type="button"
                @click="openAccessDetail(latestAccessAction.action, latestAccessAction.label)"
              >
                Ver registro
              </button>
            </article>
          </section>

          <section class="bitacora-panel card" data-product-panel="attendance-day-records">
            <header class="bitacora-header">
              <div>
                <p class="eyebrow">Bitácora reciente</p>
                <h2>Asistencia y accesos</h2>
              </div>
              <div class="legend-row" aria-label="Estados de asistencia">
                <span><i class="legend-dot clear"><FamilyPersonasIcon name="check" /></i>Presente</span>
                <span><i class="legend-dot tardy"><FamilyPersonasIcon name="clock" /></i>Retardo</span>
                <span><i class="legend-dot missing"><FamilyPersonasIcon name="alert" /></i>Ausencia</span>
                <span><i class="legend-dot entry"><FamilyPersonasIcon name="entry" /></i>Entrada</span>
                <span><i class="legend-dot exit"><FamilyPersonasIcon name="exit" /></i>Salida</span>
              </div>
              <button class="btn btn-secondary full-history-button" type="button" @click="historyExpanded = !historyExpanded">
                {{ historyExpanded ? 'Ocultar historial' : 'Ver historial completo' }}
                <FamilyPersonasIcon name="arrow" />
              </button>
            </header>

            <div v-if="recentRecords.length" class="bitacora-list">
              <article v-for="record in recentRecords" :key="record.key" class="bitacora-row" :data-state="record.tone">
                <div class="date-tile" :class="record.tone">
                  <span>{{ weekDay(record.date) }}</span>
                  <strong>{{ dayNumber(record.date) }}</strong>
                  <small>{{ monthShort(record.date) }}</small>
                </div>

                <div class="status-cell">
                  <span class="status-symbol" :class="record.tone">
                    <FamilyPersonasIcon :name="record.tone === 'tardy' || record.tone === 'combined' ? 'clock' : record.tone === 'missing' || record.tone === 'provided' ? 'alert' : 'check'" />
                  </span>
                  <span class="status-copy">
                    <strong>{{ record.label }}</strong>
                    <small>{{ recordStatusDetail(record) }}</small>
                  </span>
                </div>

                <div class="access-cell" :data-state="record.accessDay?.entrada ? 'ready' : 'missing'">
                  <span class="access-symbol entry"><FamilyPersonasIcon name="entry" /></span>
                  <span class="access-copy">
                    <strong>Entrada</strong>
                    <small>{{ record.accessDay?.entrada?.time || 'Sin registro' }}</small>
                    <span v-if="record.accessDay?.entrada" class="access-person-inline">
                      <span class="person-thumb mini">
                        <FamilyPersonasProcessedPhoto
                          v-if="record.accessDay.entrada.person.photoUrl"
                          :src="record.accessDay.entrada.person.photoUrl"
                          :auto-process="false"
                          :namespace="`record-entry-${record.accessDay.entrada.id}`"
                          :alt="record.accessDay.entrada.person.name"
                        />
                        <FamilyPersonasIcon v-else name="person" />
                      </span>
                      <span>
                        <b>{{ record.accessDay.entrada.person.name }}</b>
                        <em>{{ record.accessDay.entrada.person.parentesco || 'Persona autorizada' }}</em>
                      </span>
                    </span>
                  </span>
                </div>

                <div class="access-cell" :data-state="record.accessDay?.salida ? 'ready' : 'missing'">
                  <span class="access-symbol exit"><FamilyPersonasIcon name="exit" /></span>
                  <span class="access-copy">
                    <strong>Salida</strong>
                    <small>{{ record.accessDay?.salida?.time || 'Sin registro' }}</small>
                    <span v-if="record.accessDay?.salida" class="access-person-inline">
                      <span class="person-thumb mini">
                        <FamilyPersonasProcessedPhoto
                          v-if="record.accessDay.salida.person.photoUrl"
                          :src="record.accessDay.salida.person.photoUrl"
                          :auto-process="false"
                          :namespace="`record-exit-${record.accessDay.salida.id}`"
                          :alt="record.accessDay.salida.person.name"
                        />
                        <FamilyPersonasIcon v-else name="person" />
                      </span>
                      <span>
                        <b>{{ record.accessDay.salida.person.name }}</b>
                        <em>{{ record.accessDay.salida.person.parentesco || 'Persona autorizada' }}</em>
                      </span>
                    </span>
                  </span>
                </div>

                <div class="row-actions">
                  <button v-if="record.absence" class="btn btn-secondary row-action danger" type="button" @click="openMotivo(record.absence)">
                    <FamilyPersonasIcon name="edit" />
                    {{ record.absence.motivo ? 'Actualizar motivo' : 'Agregar motivo' }}
                  </button>
                  <button v-else-if="primaryAccessAction(record)" class="btn btn-secondary row-action" type="button" @click="openPrimaryAccessDetail(record)">
                    Ver registro
                  </button>
                </div>
              </article>
            </div>

            <p v-else class="quiet-empty">Sin registros recientes para este ciclo.</p>
          </section>

          <section v-if="historyExpanded" class="history-panel card" data-product-panel="attendance-history">
            <header class="section-head history-head">
              <div>
                <p class="eyebrow">Historial completo</p>
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
                <div class="date-tile mini" :class="record.tone">
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
        :theme="theme"
        @close="closeMotivo"
      >
        <form class="motivo-form" data-testid="motivo-form" @submit.prevent="saveMotivo">
          <div class="modal-record-summary">
            <div class="date-tile mini soft-danger">
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
        :theme="theme"
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
        :theme="theme"
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
import { computed, reactive, ref, watch } from 'vue'
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
import { resolvePersonasTheme } from '~/utils/personasTheme'

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

const route = useRoute()
const router = useRouter()
const selectedMatricula = ref(normalizeMatricula(queryValue(route.query.matricula)))
const selectedSchoolYear = ref(queryValue(route.query.schoolYear))
const editingAbsence = ref<AttendanceAbsenceRecord | null>(null)
const selectedAccessAction = ref<SelectedAccessAction | null>(null)
const cycleDrawerOpen = ref(false)
const historyExpanded = ref(false)
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
const absences = computed(() => [...(data.value?.absences || [])].sort((a, b) => b.date.localeCompare(a.date)))
const missingAbsences = computed(() => absences.value.filter((absence) => absence.motivoState === 'missing'))
const attentionAbsences = computed(() => missingAbsences.value.slice(0, 2))
const selectedChildLine = computed(() => [data.value?.selectedChild.nivelEdu, data.value?.selectedChild.grado, data.value?.selectedChild.grupo].filter(Boolean).join(' / ') || data.value?.selectedChild.plantelCode || '')
const selectedSchoolYearLabel = computed(() => data.value?.selectedSchoolYear.label || selectedSchoolYear.value || '')
const theme = computed(() => resolvePersonasTheme({
  matricula: data.value?.selectedChild.matricula || selectedMatricula.value,
  plantel: data.value?.selectedChild.plantel || data.value?.selectedChild.plantelCode,
  nivelEdu: data.value?.selectedChild.nivelEdu,
  campus: data.value?.selectedChild.campus
}))

const selectedChildPhoto = computed(() => String(data.value?.selectedChild.foto || '').trim())
const latestAccessAction = computed<SelectedAccessAction | null>(() => {
  const actions = (data.value?.accessHistory.days || [])
    .flatMap((day) => day.actions || [])
    .slice()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const action = actions[0]
  if (!action) return null
  return { action, label: accessLabel(action) }
})
const firstPendingAbsence = computed(() => missingAbsences.value[0] || null)
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

function selectStudent(matricula: string) {
  selectedMatricula.value = normalizeMatricula(matricula)
  syncRoute()
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

function accessLabel(action: AccessHistoryAction) {
  return action.type === 'salida' ? 'Salida' : 'Entrada'
}

function primaryAccessAction(record: ExpRecord) {
  return record.accessDay?.salida || record.accessDay?.entrada || null
}

function openPrimaryAccessDetail(record: ExpRecord) {
  const action = primaryAccessAction(record)
  if (!action) return
  openAccessDetail(action, accessLabel(action))
}

function recordStatusDetail(record: ExpRecord) {
  if (record.absence) return record.absence.motivo || 'Sin motivo'
  if (record.tardies.length) {
    const tardy = record.tardies[0]
    return `${tardy.minutesLate} min tarde${tardy.time ? ` · Entrada ${tardy.time}` : ''}`
  }
  if (record.accessDay && record.status === 'access-only') return 'Acceso registrado'
  return 'Sin incidencias'
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
  gap: 13px;
  margin: 0 auto;
  max-width: 1240px;
  width: 100%;
}

.attendance-page .btn-primary {
  background: #dc2626;
  border-color: #dc2626;
  box-shadow: 0 10px 24px rgba(220, 38, 38, 0.18);
  color: #fff;
}

.attendance-page .btn-secondary {
  background: #fff;
  border-color: #cfdce9;
  color: #0f6b52;
}


.person-thumb,
.access-detail-photo {
  overflow: hidden;
  position: relative;
}

.eyebrow,
.control-label span {
  color: #6f7b8f;
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.045em;
  text-transform: uppercase;
}

.loading-layout {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.loading-card {
  animation: pulse 1.1s ease-in-out infinite alternate;
  background: linear-gradient(90deg, rgba(255,255,255,.7), rgba(var(--pa-primary-rgb), .14), rgba(255,255,255,.7));
  border: 1px solid var(--pa-border);
  border-radius: 20px;
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

.priority-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.88fr);
}

.attention-card,
.latest-access-card,
.bitacora-panel,
.history-panel {
  border: 1px solid rgba(204, 217, 230, 0.92);
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(27, 55, 96, 0.07);
}

.attention-card {
  align-items: center;
  background: linear-gradient(135deg, #fff, #fff7f6);
  border-color: #efb9b4;
  display: grid;
  gap: 14px;
  grid-template-columns: 48px minmax(0, 0.82fr) minmax(260px, 1fr);
}

.attention-card[data-state='clear'] {
  background: linear-gradient(135deg, #fff, #f8fff9);
  border-color: #c9e5d0;
  grid-template-columns: 48px minmax(0, 1fr);
}

.attention-icon,
.latest-icon,
.status-symbol,
.legend-dot,
.access-symbol {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  justify-content: center;
}

.attention-icon {
  background: #fff0ee;
  color: #dc2626;
  height: 44px;
  width: 44px;
}

.attention-card[data-state='clear'] .attention-icon {
  background: #ecf8ef;
  color: #168048;
}

.attention-copy-main {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.attention-copy-main h2,
.latest-copy h2,
.bitacora-header h2,
.history-head h2 {
  color: #151d31;
  font-family: var(--font-title);
  letter-spacing: -0.025em;
  margin: 0;
}

.attention-copy-main h2 {
  font-size: clamp(1.18rem, 2vw, 1.55rem);
}

.attention-copy-main p:not(.eyebrow),
.quiet-copy,
.quiet-empty {
  color: #687386;
  font-weight: 750;
  margin: 0;
}

.attention-primary {
  justify-self: start;
  min-height: 42px;
}

.attention-preview-list {
  display: grid;
  gap: 10px;
}

.attention-preview-row {
  align-items: center;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #eed7d4;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.06);
  color: #161f33;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  min-height: 58px;
  padding: 6px 9px;
  text-align: left;
}

.attention-preview-row span:nth-child(2) {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.attention-preview-row small {
  color: #6f7b8f;
  font-weight: 800;
}

.latest-access-card {
  align-items: center;
  background: linear-gradient(135deg, #fff, #f4fff9);
  border-color: #bdded1;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.latest-copy {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.latest-title-row {
  align-items: center;
  display: flex;
  gap: 12px;
}

.latest-icon {
  background: #e6f6ec;
  color: #198754;
  flex: 0 0 auto;
  height: 44px;
  width: 44px;
}

.latest-copy h2 {
  color: #0f6b52;
  font-size: .92rem;
}

.latest-time {
  color: #151d31;
  font-family: var(--font-title);
  font-size: 1.65rem;
  line-height: .95;
}

.latest-person,
.pickup-cell {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 44px minmax(0, 1fr);
  min-width: 0;
}

.person-thumb {
  aspect-ratio: 1;
  background: #eef6ff;
  border: 1px solid #cfe0f0;
  border-radius: 999px;
  color: var(--pa-primary);
  display: grid;
  height: 44px;
  place-items: center;
  width: 44px;
}

.latest-person span:last-child,
.pickup-cell span:last-child {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.latest-person strong,
.pickup-cell strong,
.status-cell strong,
.access-cell strong {
  color: #151d31;
  display: block;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.latest-person small,
.pickup-cell small,
.status-cell small,
.access-cell small,
.history-events,
.counter {
  color: #687386;
  display: block;
  font-size: 0.78rem;
  font-weight: 750;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-cell small {
  line-height: 1.15;
  white-space: normal;
}

.access-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.access-person-inline {
  align-items: center;
  display: grid;
  gap: 7px;
  grid-template-columns: 28px minmax(0, 1fr);
  margin-top: 3px;
  min-width: 0;
}

.person-thumb.mini {
  height: 28px;
  width: 28px;
}

.access-person-inline span:last-child {
  display: grid;
  min-width: 0;
}

.access-person-inline b,
.access-person-inline em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.access-person-inline b {
  color: #172542;
  font-size: 0.78rem;
  font-style: normal;
  font-weight: 900;
}

.access-person-inline em {
  color: #687386;
  font-size: 0.72rem;
  font-style: normal;
  font-weight: 750;
}

.latest-action {
  align-self: end;
  min-height: 36px;
  white-space: nowrap;
}

.bitacora-panel,
.history-panel {
  background: rgba(255, 255, 255, 0.94);
  display: grid;
  gap: 12px;
  padding: clamp(14px, 2vw, 18px);
}

.bitacora-header {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(170px, auto) minmax(0, 1fr) auto;
}

.bitacora-header h2 {
  font-size: clamp(1.12rem, 1.7vw, 1.42rem);
}

.legend-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 9px 13px;
  justify-content: center;
}

.legend-row span {
  align-items: center;
  color: #2f3c52;
  display: inline-flex;
  font-size: 0.88rem;
  font-weight: 800;
  gap: 6px;
  white-space: nowrap;
}

.legend-dot {
  height: 24px;
  width: 24px;
}

.legend-dot.clear,
.status-symbol.clear,
.status-symbol.access {
  background: #e8f7ed;
  color: #15814b;
}

.legend-dot.tardy,
.status-symbol.tardy,
.status-symbol.combined {
  background: #fff1df;
  color: #f08a00;
}

.legend-dot.missing,
.status-symbol.missing,
.status-symbol.provided {
  background: #ffe9e9;
  color: #dc2626;
}

.legend-dot.entry,
.access-symbol.entry {
  background: #eaf1ff;
  color: #1d5dcc;
}

.legend-dot.exit,
.access-symbol.exit {
  background: #f2eaff;
  color: #7a3ee6;
}

.full-history-button {
  min-height: 42px;
  white-space: nowrap;
}

.bitacora-list {
  display: grid;
  gap: 0;
}

.bitacora-row {
  align-items: center;
  background: #fff;
  border: 1px solid #dce5ee;
  border-radius: 14px;
  display: grid;
  gap: 10px;
  grid-template-columns: 62px minmax(150px, .68fr) minmax(180px, 1fr) minmax(180px, 1fr) minmax(110px, auto);
  min-height: 72px;
  padding: 6px 12px 6px 7px;
}

.bitacora-row + .bitacora-row {
  margin-top: -1px;
}

.bitacora-row[data-state='missing'],
.bitacora-row[data-state='provided'],
.bitacora-row[data-state='combined'] {
  border-color: #f1cac6;
}

.date-tile {
  align-content: center;
  background: #eef8f2;
  border: 1px solid #cce7d6;
  border-radius: 12px;
  color: #168048;
  display: grid;
  justify-items: center;
  min-height: 54px;
  text-transform: uppercase;
}

.date-tile.missing,
.date-tile.provided,
.date-tile.combined,
.date-tile.soft-danger {
  background: #fff0f0;
  border-color: #ffd4d4;
  color: #dc2626;
}

.date-tile.tardy {
  background: #fff4e6;
  border-color: #ffd9a1;
  color: #f08a00;
}

.date-tile.access {
  background: #eef5ff;
  border-color: #d4e3ff;
  color: #1d5dcc;
}

.date-tile strong {
  font-family: var(--font-title);
  font-size: 1.34rem;
  line-height: .9;
}

.date-tile span,
.date-tile small {
  font-size: .68rem;
  font-weight: 950;
  letter-spacing: .06em;
}

.date-tile.mini {
  border-radius: 12px;
  min-height: 46px;
}

.date-tile.mini strong {
  font-size: 1.15rem;
}

.status-cell,
.access-cell {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 30px minmax(0, 1fr);
  min-width: 0;
}

.status-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.status-symbol,
.access-symbol {
  height: 30px;
  width: 30px;
}

.access-cell {
  border-left: 1px solid #dce5ee;
  padding-left: 12px;
}

.access-cell[data-state='missing'] {
  opacity: .82;
}

.access-cell[data-state='missing'] strong,
.access-cell[data-state='missing'] small {
  color: #7e8796;
}

.pickup-cell {
  border-left: 1px solid #dce5ee;
  padding-left: 12px;
}

.pickup-cell.empty {
  opacity: .72;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}

.row-action {
  min-height: 36px;
  white-space: nowrap;
}

.row-action.danger {
  border-color: #efb9b4;
  color: #dc2626;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-width: 0;
}

.status-chip,
.filter-chip,
.records-range {
  border-radius: 999px;
  font-weight: 900;
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
  padding: 8px;
}

.history-row[data-state='missing'],
.history-row[data-state='combined'] {
  border-color: #f0cdc6;
}

.history-main {
  display: grid;
  gap: 2px;
  min-width: 0;
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

  .priority-grid,
  .record-filters {
    grid-template-columns: 1fr;
  }

  .bitacora-header {
    grid-template-columns: 1fr;
  }

  .legend-row {
    justify-content: flex-start;
  }

  .bitacora-row {
    grid-template-columns: 62px minmax(145px, .72fr) minmax(150px, 1fr) minmax(150px, 1fr) minmax(104px, auto);
  }

  .row-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .attendance-page {
    gap: 12px;
  }

  .attention-card,
  .latest-access-card {
    grid-template-columns: 1fr;
  }

  .attention-card {
    align-items: start;
  }

  .attention-icon,
  .latest-icon {
    height: 44px;
    width: 44px;
  }

  .attention-preview-row {
    grid-template-columns: 54px minmax(0, 1fr) auto;
  }

  .bitacora-row {
    gap: 9px;
    grid-template-columns: 50px minmax(0, 1fr);
    padding: 8px;
  }

  .access-cell,
  .row-actions {
    grid-column: 1 / -1;
  }

  .access-cell {
    border-left: 0;
    border-top: 1px solid #e3ebf2;
    padding-left: 0;
    padding-top: 8px;
  }

  .access-cell {
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .row-action {
    width: 100%;
  }

  .legend-row {
    flex-wrap: nowrap;
    justify-content: flex-start;
    margin-right: -4px;
    overflow-x: auto;
    padding-bottom: 2px;
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

  .history-row,
  .access-detail-modal {
    grid-template-columns: 1fr;
  }

  .access-detail-photo {
    min-height: 260px;
  }
}

@media (max-width: 480px) {
  .attendance-page .card,
  .bitacora-panel,
  .history-panel {
    border-radius: 16px;
  }

  .attention-preview-row {
    grid-template-columns: 50px minmax(0, 1fr);
  }

  .attention-preview-row > .pa-icon {
    display: none;
  }

  .form-actions {
    display: grid;
  }
}
</style>
