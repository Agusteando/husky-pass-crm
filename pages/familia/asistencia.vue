<template>
  <FamilyPersonasAutorizadasShell title="Asistencia">
  <section class="attendance-page" :data-state="pageState" data-product-panel="family-attendance">
    <section class="attendance-hero card">
      <div class="hero-copy">
        <p class="eyebrow">Asistencia escolar</p>
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
            <span>Ciclo</span>
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

    <p v-if="loadError" class="alert" data-state="error">No fue posible abrir asistencia.</p>

    <section v-else-if="pending && !data" class="loading-grid" data-state="loading">
      <span v-for="item in 4" :key="item" class="loading-card"></span>
    </section>

    <template v-else-if="data">
      <section v-if="sourceWarnings.length" class="source-strip" :data-state="data.status">
        <span v-for="warning in sourceWarnings" :key="warning">{{ warning }}</span>
      </section>

      <section class="summary-grid" data-product-panel="attendance-summary">
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
        <article class="summary-card">
          <span>Retardos</span>
          <strong>{{ summary.tardies }}</strong>
          <small>{{ selectedSchoolYear }}</small>
        </article>
        <article class="summary-card">
          <span>Sin ausencia registrada</span>
          <strong>{{ summary.clearDays }}</strong>
          <small>{{ summary.schoolDaysWithAttendance }} días con pase</small>
        </article>
      </section>

      <section v-if="emptyState" class="empty-attendance card" data-state="empty">
        <img v-if="grupoImage" :src="grupoImage" alt="" />
        <div>
          <p class="eyebrow">{{ selectedSchoolYear }}</p>
          <h2>Sin registros para mostrar</h2>
          <p>No hay ausencias ni retardos visibles para este alumno en el ciclo seleccionado.</p>
        </div>
      </section>

      <template v-else>
        <section v-if="missingAbsences.length && nextMissingAbsence" class="attention-panel" data-product-panel="ausencias-sin-motivo">
          <header>
            <p class="eyebrow">Atención</p>
            <h2>{{ missingAbsences.length === 1 ? 'Ausencia sin motivo' : 'Siguiente ausencia sin motivo' }}</h2>
          </header>
          <div class="attention-list">
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
          </div>
        </section>

        <section class="insight-grid">
          <article class="year-pulse card" data-product-panel="attendance-calendar">
            <header class="section-head">
              <div>
                <p class="eyebrow">Ciclo {{ selectedSchoolYear }}</p>
                <h2>Patrón del año</h2>
              </div>
              <div class="legend">
                <span><i class="dot clear"></i>Sin ausencia</span>
                <span><i class="dot absence"></i>Ausencia</span>
                <span><i class="dot tardy"></i>Retardo</span>
              </div>
            </header>

            <div class="month-list">
              <section v-for="month in monthGroups" :key="month.key" class="month-row">
                <div class="month-name">
                  <strong>{{ month.label }}</strong>
                  <span>{{ month.events }} eventos</span>
                </div>
                <div class="day-dots" :aria-label="`Días de ${month.label}`">
                  <span
                    v-for="day in month.days"
                    :key="day.date"
                    class="day-dot"
                    :class="day.status"
                    :title="dayTitle(day)"
                  ></span>
                </div>
              </section>
            </div>
          </article>

          <aside class="timeline-panel" data-product-panel="attendance-timeline">
            <header class="section-head compact">
              <div>
                <p class="eyebrow">Cronologia</p>
                <h2>Lo reciente</h2>
              </div>
            </header>
            <div v-if="recentEvents.length" class="timeline-list">
              <article v-for="event in recentEvents" :key="event.key" class="timeline-item" :class="event.type">
                <time>{{ dateLabel(event.date) }}</time>
                <strong>{{ event.title }}</strong>
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
            <p v-else class="quiet-empty">Sin ausencias en este ciclo.</p>
          </article>

          <article class="record-column" data-product-panel="tardy-records">
            <header class="section-head">
              <div>
                <p class="eyebrow">Retardos</p>
                <h2>Entradas</h2>
              </div>
            </header>

            <div v-if="tardies.length" class="record-list">
              <article v-for="tardy in tardies" :key="`${tardy.id}-${tardy.date}-${tardy.time}`" class="tardy-card">
                <div class="record-date blue">
                  <strong>{{ dayNumber(tardy.date) }}</strong>
                  <span>{{ monthShort(tardy.date) }}</span>
                </div>
                <div class="record-copy">
                  <strong>{{ dateLabel(tardy.date) }}</strong>
                  <span>Entrada {{ tardy.time }}</span>
                  <small>{{ displayMatricula(tardy.matricula || data.selectedChild.matricula) }}</small>
                </div>
              </article>
            </div>
            <p v-else class="quiet-empty">Sin retardos en este ciclo.</p>
          </article>
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
          <span>Motivo</span>
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
import { computed, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type {
  AttendanceAbsenceRecord,
  AttendanceCalendarDay,
  ParentAttendanceResponse
} from '~/types/attendance'
import { formatAttendanceDate } from '~/utils/attendance'
import { displayMatricula } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

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
const absences = computed(() => [...(data.value?.absences || [])].sort((a, b) => b.date.localeCompare(a.date)))
const tardies = computed(() => [...(data.value?.tardies || [])].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)))
const missingAbsences = computed(() => absences.value.filter((absence) => absence.motivoState === 'missing'))
const nextMissingAbsence = computed(() => missingAbsences.value[0] || null)
const recentEvents = computed(() => data.value?.events.slice(0, 8) || [])
const selectedChildLine = computed(() => [data.value?.selectedChild.grado, data.value?.selectedChild.grupo].filter(Boolean).join(' / ') || data.value?.selectedChild.plantelCode || '')
const selectedSchoolYearLabel = computed(() => data.value?.selectedSchoolYear.label || selectedSchoolYear.value || '')
const heroTitle = computed(() => data.value?.selectedChild.name || 'Asistencia')
const heroSubtitle = computed(() => {
  if (!data.value) return 'Ausencias, retardos y motivos por ciclo escolar.'
  return [selectedSchoolYearLabel.value, selectedChildLine.value, data.value.selectedChild.plantelCode].filter(Boolean).join(' / ')
})
const grupoImage = computed(() => data.value?.grupoSigil.image || '')
const grupoLabel = computed(() => data.value?.grupoSigil.grupoValue || data.value?.selectedChild.grupo || 'Grupo')
const grupoAlt = computed(() => `Sigil de grupo ${grupoLabel.value}`)
const emptyState = computed(() => Boolean(data.value && !data.value.absences.length && !data.value.tardies.length && data.value.status !== 'unavailable'))
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

watch(data, (value) => {
  if (!value) return
  if (!selectedMatricula.value) selectedMatricula.value = value.selectedChild.matricula
  if (!selectedSchoolYear.value) selectedSchoolYear.value = value.selectedSchoolYear.label
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

.hero-copy {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.hero-copy h1 {
  margin-bottom: 0;
}

.context-controls {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(220px, 0.8fr) minmax(160px, 0.42fr);
  margin-top: 4px;
  max-width: 700px;
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

.hero-sigil.empty {
  color: var(--pa-primary);
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.summary-card.primary {
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .12), #ffffff);
  border-color: var(--pa-border);
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
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 0.95;
}

.summary-card .btn {
  justify-self: start;
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

.empty-attendance h2,
.section-head h2 {
  margin-bottom: 0;
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

.attention-list {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr);
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

.absence-action span {
  color: rgba(255, 255, 255, 0.76);
  display: block;
  font-size: 0.82rem;
}

.absence-action small {
  color: rgba(255, 255, 255, 0.66);
  display: block;
  font-size: 0.76rem;
  font-weight: 700;
}

.absence-action[data-update-state='failed'] {
  border-color: #ffd2ca;
}

.insight-grid {
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
}

.section-head {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-bottom: 14px;
}

.section-head.compact {
  grid-template-columns: 1fr;
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
  background: #2f7fac;
}

.day-dot.absence-tardy {
  background: linear-gradient(135deg, #cf5c4c 0 50%, #2f7fac 50% 100%);
}

.month-list {
  display: grid;
  gap: 12px;
}

.month-row {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 120px minmax(0, 1fr);
}

.month-name strong,
.month-name span {
  display: block;
}

.month-name strong {
  color: var(--color-ink);
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

.timeline-panel {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  padding: clamp(16px, 2.4vw, 22px);
}

.timeline-list {
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
  border-color: #2f7fac;
}

.timeline-item time,
.timeline-item span {
  color: var(--color-muted);
  font-size: 0.78rem;
}

.records-grid {
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.82fr);
}

.record-column {
  display: grid;
  gap: 12px;
}

.record-list {
  display: grid;
  gap: 10px;
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

.tardy-card {
  grid-template-columns: 58px minmax(0, 1fr);
}

.absence-card[data-state='missing'] {
  border-color: #f1d79e;
}

.record-date {
  aspect-ratio: 1;
  background: #fff7e8;
  border: 1px solid #f1d79e;
  border-radius: 16px;
  color: #8a5a12;
  display: grid;
  place-items: center;
  text-align: center;
}

.record-date.blue {
  background: #eaf4fb;
  border-color: #d2e7f5;
  color: #236188;
}

.record-date strong,
.record-date span {
  line-height: 1;
}

.record-date strong {
  font-family: var(--font-title);
  font-size: 1.35rem;
}

.record-date span {
  font-size: 0.68rem;
  text-transform: uppercase;
}

.record-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
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
  .loading-grid,
  .attention-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .context-controls,
  .summary-grid,
  .loading-grid,
  .attention-list,
  .section-head,
  .absence-action,
  .month-row,
  .empty-attendance {
    grid-template-columns: 1fr;
  }

  .absence-card,
  .tardy-card {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .absence-card .btn {
    grid-column: 1 / -1;
  }

  .legend {
    justify-content: flex-start;
  }
}
</style>
