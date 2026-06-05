<template>
  <FamilyPersonasAutorizadasShell title="Personas autorizadas">
    <section class="pa-home-head" data-product-panel="personas-home">
      <div>
        <p class="eyebrow">Registro familiar</p>
        <h1>Personas autorizadas</h1>
        <p>{{ nextAction }}</p>
      </div>
      <div class="head-action-card" :data-state="primaryPassPerson ? 'ready' : expedienteState">
        <span>{{ primaryPassPerson ? 'Husky Pass listo' : expedienteStatus }}</span>
        <strong>{{ primaryPassPerson ? fullName(primaryPassPerson) : nextAction }}</strong>
        <a
          v-if="primaryPassPerson"
          class="btn btn-primary pa-primary"
          :href="`/api/personas-autorizadas/marbete?id=${primaryPassPerson.id}&download=1`"
          data-diagnostic-link="descargar-husky-pass-principal"
        >
          Descargar Husky Pass
        </a>
        <button v-else class="btn btn-secondary" type="button" disabled>{{ nextAction }}</button>
      </div>
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar Personas Autorizadas.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading data-state="loading">Cargando...</div>

    <template v-else>
      <section class="pa-status-strip" data-product-panel="personas-status">
        <article class="status-card" :data-state="expedienteState">
          <FamilyPersonasIcon name="people" />
          <span>
            <b>{{ expedienteStatus }}</b>
            <small>{{ nextAction }}</small>
          </span>
        </article>
        <article class="status-card">
          <FamilyPersonasIcon name="people" />
          <span>
            <b>{{ completedRegularCount }}</b>
            <small>{{ completedRegularCount === 1 ? 'Persona registrada' : 'Personas registradas' }}</small>
          </span>
        </article>
        <article class="status-card">
          <FamilyPersonasIcon name="download" />
          <span>
            <b>{{ downloadableCount }}</b>
            <small>Husky Pass listos</small>
          </span>
        </article>
        <NuxtLink class="status-card actionable student-photo-status" to="/familia/personas-autorizadas/credencializacion">
          <span class="student-photo-mini">
            <FamilyPersonasProcessedPhoto v-if="studentPhoto" :src="studentPhoto" alt="Foto del alumno" namespace="pa-home-student-photo" />
            <FamilyPersonasIcon v-else name="camera" />
          </span>
          <span>
            <b>{{ studentPhoto ? 'Lista' : 'Pendiente' }}</b>
            <small>Foto alumno</small>
          </span>
        </NuxtLink>
      </section>

      <section id="marbetes" class="pa-workspace" data-product-panel="authorized-people" :data-state="completedCount ? 'content' : 'empty'">
        <article class="card people-panel">
          <header class="section-head">
            <div>
              <p class="eyebrow">Personas</p>
              <h2>{{ completedRegularCount }} registradas</h2>
            </div>
            <button
              v-if="firstAvailablePerson"
              class="btn btn-secondary"
              type="button"
              data-diagnostic-action="capturar-persona-disponible"
              @click="edit(firstAvailablePerson)"
            >
              Capturar
            </button>
          </header>

          <div class="person-list">
            <button
              v-for="person in people"
              :key="person.indice"
              class="person-row"
              :class="{ selected: selected?.indice === person.indice, empty: !person.id, express: person.indice === 4 }"
              type="button"
              :aria-pressed="selected?.indice === person.indice"
              data-diagnostic-action="seleccionar-persona-autorizada"
              @click="selectPerson(person)"
            >
              <span class="person-photo">
                <FamilyPersonasProcessedPhoto
                  v-if="photoUrl(person)"
                  :src="person.foto"
                  :processed-src="person.compressed_foto"
                  :auto-process="false"
                  :namespace="`pa-person-${person.id || person.indice}`"
                />
                <strong v-else-if="person.id">{{ initials(person) }}</strong>
                <FamilyPersonasIcon v-else name="people" />
              </span>
              <span class="person-meta">
                <b>{{ person.id ? fullName(person) || authorizedPersonLabel(person.indice) : authorizedPersonLabel(person.indice) }}</b>
                <small>{{ personState(person) }}</small>
              </span>
              <span class="pass-state" :data-state="marbeteReady(person) ? 'ready' : person.id ? 'pending' : 'available'">
                {{ marbeteState(person) }}
              </span>
            </button>
          </div>
        </article>

        <aside v-if="selected" class="card selected-panel" data-product-panel="selected-authorized-person" :data-state="selected.id ? 'content' : 'empty'">
          <div class="selected-identity">
            <span class="selected-photo">
              <FamilyPersonasProcessedPhoto
                v-if="photoUrl(selected)"
                :src="selected.foto"
                :processed-src="selected.compressed_foto"
                :auto-process="false"
                :namespace="`pa-selected-${selected.id || selected.indice}`"
              />
              <strong v-else-if="selected.id">{{ initials(selected) }}</strong>
              <FamilyPersonasIcon v-else name="people" />
            </span>
            <div>
              <p class="eyebrow">{{ authorizedPersonLabel(selected.indice) }}</p>
              <h3>{{ fullName(selected) || (selected.indice === 4 ? 'Pase Express opcional' : 'Espacio disponible') }}</h3>
              <p>{{ selected.id ? selected.parenP || 'Sin parentesco' : 'Listo para capturar cuando lo necesites.' }}</p>
            </div>
          </div>

          <div class="selected-readiness">
            <span :data-state="selected.id ? 'ok' : 'idle'">Registro</span>
            <span :data-state="photoUrl(selected) ? 'ok' : selected.id ? 'pending' : 'idle'">Foto</span>
            <span :data-state="marbeteReady(selected) ? 'ok' : selected.id ? 'pending' : 'idle'">Husky Pass</span>
          </div>

          <div class="actions selected-actions">
            <button class="btn btn-primary pa-primary" type="button" data-diagnostic-action="editar-persona-autorizada" @click="edit(selected)">
              {{ selected.id ? 'Editar' : selected.indice === 4 ? 'Capturar Pase Express' : 'Capturar' }}
            </button>
            <a
              v-if="marbeteReady(selected)"
              class="btn btn-primary pa-primary"
              :href="`/api/personas-autorizadas/marbete?id=${selected.id}&download=1`"
              data-diagnostic-link="descargar-husky-pass-seleccionado"
            >
              Descargar Husky Pass
            </a>
            <button v-else-if="selected.id" class="btn btn-secondary" type="button" disabled>{{ marbeteState(selected) }}</button>
            <button v-if="selected.id" class="btn btn-danger" type="button" data-diagnostic-action="confirmar-eliminar-persona-autorizada" @click="deleteTarget = selected">
              Eliminar
            </button>
          </div>
        </aside>
      </section>

      <FamilyPersonasModal
        v-if="editing"
        :title="authorizedPersonLabel(Number(editing.indice || 1))"
        eyebrow="Persona autorizada"
        :close-disabled="saving || editorBusy"
        @close="closeEditor"
      >
        <FamilyAuthorizedPersonEditor
          :key="editingKey"
          :person="editing"
          :label="authorizedPersonLabel(Number(editing.indice || 1))"
          :saving="saving"
          :server-error="editorError"
          @busy="editorBusy = $event"
          @save="save"
          @cancel="closeEditor"
        />
      </FamilyPersonasModal>

      <FamilyPersonasModal
        v-if="deleteTarget"
        title="Eliminar registro"
        :eyebrow="authorizedPersonLabel(Number(deleteTarget.indice || 1))"
        @close="deleteTarget = null"
      >
        <section class="delete-confirm">
          <p>{{ fullName(deleteTarget) || 'Este registro' }}</p>
          <small>Tambien dejara de estar disponible para el Husky Pass.</small>
          <div class="actions form-actions">
            <button
              class="btn btn-danger"
              type="button"
              :disabled="deleting"
              data-diagnostic-action="eliminar-persona-autorizada"
              @click="remove(deleteTarget.id)"
            >
              {{ deleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
            <button class="btn btn-secondary" type="button" :disabled="deleting" @click="deleteTarget = null">Cancelar</button>
          </div>
        </section>
      </FamilyPersonasModal>

      <section id="ayuda" class="support-panel" data-product-panel="personas-help-tutorial">
        <article class="card tutorial-card">
          <header class="section-head">
            <div>
              <p class="eyebrow">Tutorial</p>
              <h2>Uso rapido</h2>
            </div>
          </header>
          <div class="video-frame">
            <iframe src="https://www.youtube.com/embed/PMBQolTRysg" title="Tutorial Personas Autorizadas" allowfullscreen loading="lazy"></iframe>
          </div>
        </article>

        <article class="card faq-card" data-product-panel="faq" data-state="content">
          <header>
            <p class="eyebrow">FAQ</p>
            <h2>Dudas frecuentes</h2>
          </header>
          <button v-for="(item, index) in faqItems" :key="item.question" class="faq-item" type="button" :aria-expanded="openFaq === index" @click="openFaq = openFaq === index ? null : index">
            <span>
              <strong>{{ item.question }}</strong>
              <em v-if="openFaq === index">{{ item.answer }}</em>
            </span>
            <b>{{ openFaq === index ? '-' : '+' }}</b>
          </button>
        </article>
      </section>
    </template>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="notice" class="notice">{{ notice }}</p>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson, MarbeteReadinessResponse } from '~/types/daycare'
import { authorizedPersonLabel, normalizeVirtualAssetUrl } from '~/utils/daycare'
import { createAuthorizedPersonForm, toAuthorizedPersonSavePayload } from '~/utils/authorizedPersonForm'
import { isValidatedVisionPhotoUrl } from '~/utils/visionFace'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const router = useRouter()
const { data, refresh, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-family-people', timeout: 15000 })

const editing = ref<Partial<AuthorizedPerson> | null>(null)
const editorError = ref('')
const editorBusy = ref(false)
const deleteTarget = ref<AuthorizedPerson | null>(null)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const notice = ref('')
const selectedIndice = ref(normalizeIndice(route.query.persona))
const openFaq = ref<number | null>(0)
const marbeteReadiness = ref<Record<number, MarbeteReadinessResponse & { pending?: boolean }>>({})
const editingKey = computed(() => editing.value ? `edit-${editing.value.id || 'slot'}-${editing.value.indice}` : 'edit-none')

const people = computed(() => data.value || [])
const children = computed<AuthorizedChild[]>(() => people.value.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null)
const studentPhoto = computed(() => normalizeVirtualAssetUrl(primaryChild.value?.foto || ''))
const completedCount = computed(() => people.value.filter((person) => person.id).length)
const completedRegularCount = computed(() => people.value.filter((person) => person.id && person.indice < 4).length)
const downloadableCount = computed(() => people.value.filter((person) => marbeteReady(person)).length)
const missingPhotoCount = computed(() => people.value.filter((person) => person.id && !photoUrl(person)).length)
const selected = computed(() => people.value.find((person) => person.indice === selectedIndice.value) || people.value.find((person) => person.id) || people.value[0] || null)
const registeredPeople = computed(() => people.value.filter((person) => person.id))
const primaryPassPerson = computed(() => {
  if (selected.value && marbeteReady(selected.value)) return selected.value
  return people.value.find((person) => marbeteReady(person)) || null
})
const firstAvailablePerson = computed(() => people.value.find((person) => !person.id && person.indice < 4) || null)
const actionableIssues = computed(() => {
  const issues: string[] = []
  if (!registeredPeople.value.length) issues.push('Agrega tu primera persona autorizada')
  const missingRequired = registeredPeople.value.filter((person) => !fullName(person) || !person.parenP)
  if (missingRequired.length) issues.push(`${missingRequired.length} ${missingRequired.length === 1 ? 'registro necesita datos' : 'registros necesitan datos'}`)
  if (missingPhotoCount.value) issues.push(`${missingPhotoCount.value} ${missingPhotoCount.value === 1 ? 'foto pendiente' : 'fotos pendientes'}`)
  if (!studentPhoto.value) issues.push('Foto del alumno pendiente')
  if (registeredPeople.value.length && !downloadableCount.value) issues.push('Husky Pass sin datos suficientes')
  return issues
})
const expedienteState = computed(() => actionableIssues.value.length ? 'action' : 'complete')
const expedienteStatus = computed(() => expedienteState.value === 'complete' ? 'Listo' : 'Requiere accion')
const nextAction = computed(() => actionableIssues.value[0] || 'Husky Pass listo para descargar')

const faqItems = [
  { question: 'Cuantas personas puedo registrar?', answer: 'Tres personas y un Pase Express opcional.' },
  { question: 'Que foto debo usar?', answer: 'Una foto frontal, clara y reciente.' },
  { question: 'Donde descargo el Husky Pass?', answer: 'Selecciona una persona lista y usa Descargar Husky Pass.' },
  { question: 'Puedo cambiar grado o grupo?', answer: 'No. La escuela administra esos datos.' }
]

watch(() => route.query.persona, (value) => {
  const next = normalizeIndice(value)
  if (next !== selectedIndice.value) selectedIndice.value = next
})
watch(people, (value) => {
  if (!value.length) return
  if (!value.some((person) => person.indice === selectedIndice.value)) selectedIndice.value = value[0]?.indice || 1
}, { immediate: true })
watch(() => people.value.map((person) => `${person.id || 'empty'}:${person.foto || ''}:${person.compressed_foto || ''}:${person.nombreP || ''}:${person.paternoP || ''}:${person.maternoP || ''}:${person.parenP || ''}`).join('|'), () => {
  void refreshMarbeteReadiness()
}, { immediate: true })

function fullName(person: AuthorizedPerson | Partial<AuthorizedPerson>) {
  return [person.nombreP, person.paternoP, person.maternoP].filter(Boolean).join(' ')
}
function initials(person: AuthorizedPerson | Partial<AuthorizedPerson>) {
  const name = fullName(person) || 'PA'
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}
function photoUrl(person: AuthorizedPerson | Partial<AuthorizedPerson>) {
  const original = normalizeVirtualAssetUrl(person.foto || '')
  const processed = normalizeVirtualAssetUrl(person.compressed_foto || '')
  return original || (isValidatedVisionPhotoUrl(processed) ? processed : '')
}
function personState(person: AuthorizedPerson) {
  if (!person.id) return person.indice === 4 ? 'Pase Express opcional' : 'Espacio disponible'
  if (!photoUrl(person)) return 'Falta foto'
  if (!person.parenP) return 'Falta parentesco'
  return 'Listo'
}
function localMarbeteReady(person: AuthorizedPerson) {
  return Boolean(person.id && photoUrl(person) && fullName(person) && person.parenP)
}
function marbeteStatus(person: AuthorizedPerson) {
  const id = Number(person.id || 0)
  return id ? marbeteReadiness.value[id] : null
}
function marbeteReady(person: AuthorizedPerson) {
  return Boolean(localMarbeteReady(person) && marbeteStatus(person)?.ok)
}
function marbeteState(person: AuthorizedPerson) {
  if (!person.id) return person.indice === 4 ? 'Opcional' : 'Disponible'
  if (!photoUrl(person)) return 'Falta foto'
  if (!fullName(person)) return 'Falta nombre'
  if (!person.parenP) return 'Falta parentesco'
  const status = marbeteStatus(person)
  if (!status || status.pending) return 'Validando Husky Pass'
  if (!status.ok) return status.issues[0] || 'Husky Pass no disponible'
  return 'Listo'
}
async function refreshMarbeteReadiness() {
  const candidates = people.value.filter((person) => localMarbeteReady(person))
  const candidateIds = new Set(candidates.map((person) => Number(person.id)))
  for (const id of Object.keys(marbeteReadiness.value)) {
    if (!candidateIds.has(Number(id))) delete marbeteReadiness.value[Number(id)]
  }
  await Promise.all(candidates.map(async (person) => {
    const id = Number(person.id)
    marbeteReadiness.value[id] = { ...(marbeteReadiness.value[id] || { ok: false, issues: [] }), pending: true }
    try {
      const result = await $fetch<MarbeteReadinessResponse>('/api/personas-autorizadas/marbete', { query: { id, format: 'readiness' } })
      marbeteReadiness.value[id] = { ...result, pending: false }
    } catch (err: unknown) {
      const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
      marbeteReadiness.value[id] = { ok: false, issues: [failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible validar el Husky Pass.'], pending: false }
    }
  }))
}
function selectPerson(person: AuthorizedPerson) {
  selectedIndice.value = person.indice
  error.value = ''
  notice.value = ''
  router.replace({ path: route.path, query: { ...route.query, persona: String(person.indice) } })
}
function edit(person: AuthorizedPerson) {
  error.value = ''
  notice.value = ''
  editorError.value = ''
  editorBusy.value = false
  selectedIndice.value = person.indice
  editing.value = toAuthorizedPersonSavePayload(createAuthorizedPersonForm(person))
}
function closeEditor() {
  if (saving.value || editorBusy.value) return
  editing.value = null
  editorError.value = ''
  editorBusy.value = false
}
function applySavedPerson(saved: AuthorizedPerson) {
  const current = data.value || []
  const next = current.map((person) => {
    const sameRecord = saved.id && person.id && Number(person.id) === Number(saved.id)
    const sameSlot = Number(person.indice) === Number(saved.indice)
    if (!sameRecord && !sameSlot) return person
    return {
      ...person,
      ...saved,
      id: saved.id ? Number(saved.id) : person.id || null,
      indice: Number(saved.indice || person.indice),
      children: person.children
    }
  })
  data.value = next.length ? next : current
}
async function save(payload: Partial<AuthorizedPerson>) {
  if (saving.value || editorBusy.value) return
  saving.value = true
  error.value = ''
  editorError.value = ''
  notice.value = ''
  try {
    const saved = await $fetch<AuthorizedPerson>('/api/personas-autorizadas/family', { method: 'POST', body: payload })
    applySavedPerson(saved)
    editing.value = null
    notice.value = 'Registro guardado.'
    await refresh()
    await refreshMarbeteReadiness()
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    editorError.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar el registro.'
  } finally {
    saving.value = false
  }
}
async function remove(id: number | null | undefined) {
  if (!id) return
  deleting.value = true
  error.value = ''
  notice.value = ''
  try {
    await $fetch(`/api/personas-autorizadas/family/${id}`, { method: 'DELETE' })
    deleteTarget.value = null
    await refresh()
    notice.value = 'Registro eliminado.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible eliminar el registro.'
  } finally {
    deleting.value = false
  }
}
function normalizeIndice(value: unknown) {
  const parsed = Number(Array.isArray(value) ? value[0] : value || 1)
  return parsed >= 1 && parsed <= 4 ? parsed : 1
}
</script>

<style scoped>
.pa-home-head {
  align-items: stretch;
  background: linear-gradient(135deg, #fff, rgba(var(--pa-primary-rgb), .08));
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  padding: clamp(14px, 2vw, 18px);
}
.pa-home-head h1,
.pa-home-head p,
.section-head h2,
.selected-panel h3 {
  margin-bottom: 0;
}
.pa-home-head h1 {
  color: var(--pa-gray);
  font-size: clamp(1.55rem, 2.6vw, 2.25rem);
}
.head-action-card {
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 12px;
  display: grid;
  gap: 7px;
  padding: 12px;
}
.head-action-card span,
.pass-state,
.selected-readiness span {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.head-action-card span {
  color: var(--pa-primary);
}
.head-action-card strong {
  color: var(--pa-gray);
  line-height: 1.18;
}
.pa-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
}
.loading-row,
.notice {
  border: 1px solid var(--pa-border);
  color: var(--pa-gray);
  font-weight: 600;
}
.notice {
  background: var(--pa-soft);
  border-radius: 12px;
  margin: 0;
  padding: 10px 12px;
}
.pa-status-strip {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.status-card {
  align-items: center;
  background: #fff;
  border: 1px solid var(--pa-border);
  border-radius: 12px;
  display: grid;
  gap: 10px;
  grid-template-columns: 30px minmax(0, 1fr);
  min-height: 58px;
  padding: 10px;
}
.status-card :deep(.pa-icon) {
  color: var(--pa-primary);
}
.status-card b,
.status-card small {
  display: block;
}
.status-card b {
  color: var(--pa-gray);
}
.status-card small {
  color: var(--pa-muted);
  font-size: .78rem;
  font-weight: 700;
}
.status-card[data-state='complete'],
.status-card[data-state='action'] {
  background: var(--pa-soft);
}
.status-card.actionable:hover {
  transform: translateY(-1px);
}
.student-photo-mini {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 10px;
  display: grid;
  overflow: hidden;
  place-items: center;
}
.pa-workspace {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
}
.people-panel,
.selected-panel,
.tutorial-card,
.faq-card {
  display: grid;
  gap: 10px;
}
.section-head {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}
.person-list {
  display: grid;
  gap: 8px;
}
.person-row {
  align-items: center;
  background: #fff;
  border: 1px solid #ecece7;
  border-radius: 12px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 54px minmax(0, 1fr) minmax(110px, auto);
  padding: 8px;
  text-align: left;
  width: 100%;
}
.person-row:hover,
.person-row.selected {
  background: var(--pa-soft);
  border-color: var(--pa-border);
}
.person-row.empty {
  background: #fbfbf9;
}
.person-photo,
.selected-photo {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  color: var(--pa-primary);
  display: grid;
  font-weight: 800;
  overflow: hidden;
  place-items: center;
}
.person-photo {
  border-radius: 10px;
  width: 54px;
}
.selected-photo {
  border-radius: 12px;
  width: 78px;
}
.person-photo img,
.selected-photo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}
.person-meta {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.person-meta b,
.person-meta small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.person-meta b {
  color: var(--pa-gray);
  font-size: .92rem;
}
.person-meta small {
  color: var(--pa-muted);
  font-size: .78rem;
  font-weight: 700;
}
.pass-state {
  background: #f7f7f5;
  border: 1px solid #e9e9e3;
  border-radius: 10px;
  color: var(--pa-muted);
  justify-self: end;
  padding: 6px 8px;
  text-align: center;
}
.pass-state[data-state='ready'] {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}
.pass-state[data-state='available'] {
  background: #fff;
}
.selected-panel {
  align-self: start;
  position: sticky;
  top: 82px;
}
.selected-identity {
  display: grid;
  gap: 12px;
  grid-template-columns: 78px minmax(0, 1fr);
}
.selected-identity p {
  margin-bottom: 0;
}
.selected-readiness {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.selected-readiness span {
  background: #f7f7f5;
  border: 1px solid #e9e9e3;
  border-radius: 10px;
  color: var(--pa-muted);
  padding: 6px 8px;
}
.selected-readiness span[data-state='ok'] {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}
.selected-readiness span[data-state='pending'] {
  background: #fff8ea;
  border-color: #f0d9a5;
  color: #795b1c;
}
.actions,
.form-actions,
.selected-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.selected-actions .btn {
  flex: 1 1 auto;
}
.form-actions {
  justify-content: flex-end;
}
.delete-confirm {
  display: grid;
  gap: 12px;
}
.delete-confirm small {
  color: var(--pa-muted);
  font-weight: 700;
}
.support-panel {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, .9fr) minmax(300px, 1fr);
}
.video-frame {
  aspect-ratio: 16 / 9;
  background: #111;
  border-radius: 12px;
  overflow: hidden;
}
.video-frame iframe {
  border: 0;
  height: 100%;
  width: 100%;
}
.faq-card header h2 {
  margin-bottom: 0;
}
.faq-item {
  align-items: start;
  background: #f8f8f6;
  border: 1px solid #ecece7;
  border-radius: 10px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 10px;
  text-align: left;
  width: 100%;
}
.faq-item strong,
.faq-item em {
  display: block;
}
.faq-item em {
  color: var(--pa-muted);
  font-style: normal;
  font-weight: 700;
  margin-top: 8px;
}
.faq-item b {
  color: var(--pa-primary);
  font-size: 1.2rem;
  line-height: 1;
}
@media (max-width: 1080px) {
  .pa-status-strip,
  .support-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .pa-workspace {
    grid-template-columns: 1fr;
  }
  .selected-panel {
    position: static;
  }
}
@media (max-width: 720px) {
  .pa-home-head,
  .pa-status-strip,
  .support-panel {
    grid-template-columns: 1fr;
  }
  .person-row {
    grid-template-columns: 48px minmax(0, 1fr);
  }
  .person-photo {
    width: 48px;
  }
  .pass-state {
    grid-column: 2;
    justify-self: start;
  }
  .section-head,
  .selected-identity {
    align-items: start;
    grid-template-columns: 1fr;
  }
  .selected-photo {
    width: 72px;
  }
}
</style>
