<template>
  <FamilyPersonasAutorizadasShell title="Personas autorizadas">
    <p v-if="downloadError" class="alert pa-download-alert" data-state="error">{{ downloadError }}</p>
    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar Personas Autorizadas.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading data-state="loading">Cargando...</div>

    <template v-else>
      <section class="pa-home-screen" data-product-panel="personas-home">
        <header class="pa-page-hero">
          <div class="pa-title-block">
            <span class="hero-shield" aria-hidden="true">
              <FamilyPersonasIcon name="authorized" />
            </span>
            <div>
              <p class="eyebrow">{{ levelLabel }}</p>
              <h1>Personas autorizadas</h1>
              <p>Administra las personas que pueden recoger a {{ studentFirstName }}.</p>
            </div>
          </div>

          <NuxtLink v-if="!studentPhoto" class="student-photo-callout" to="/familia/personas-autorizadas/credencializacion">
            <span class="callout-icon" aria-hidden="true">i</span>
            <span class="callout-copy">
              <strong>Foto del alumno pendiente</strong>
              <small>Sube la foto de {{ studentFirstName }} para generar los Husky Pass.</small>
            </span>
            <span class="callout-action">Subir foto</span>
          </NuxtLink>
        </header>

        <section class="authorized-section" data-product-panel="authorized-people" :data-state="completedCount ? 'content' : 'empty'">
          <header class="section-label-row">
            <span class="section-icon" aria-hidden="true">
              <FamilyPersonasIcon name="people" />
            </span>
            <h2>Personas autorizadas</h2>
            <small>{{ registeredPeopleLabel }}</small>
          </header>

          <div v-if="!completedCount" class="empty-guidance" data-state="empty">
            <FamilyPersonasAmbassador :theme="theme" variant="empty" compact decorative />
            <div>
              <strong>Empieza con una persona autorizada</strong>
              <span>Captura sus datos y foto para habilitar su Husky Pass.</span>
            </div>
          </div>

          <div class="person-slots" aria-label="Espacios de personas autorizadas">
            <article
              v-for="person in people"
              :key="person.indice"
              class="person-slot-card"
              :class="{ selected: selected?.indice === person.indice, empty: !person.id, express: person.indice === 4 }"
              :data-state="person.id ? 'registered' : 'available'"
              :data-slot="person.indice"
              @click="selectPerson(person)"
            >
              <span v-if="person.id && marbeteReady(person)" class="slot-check" aria-label="Husky Pass listo"><FamilyPersonasIcon name="check" /></span>

              <span class="person-photo" :data-empty="!person.id">
                <FamilyPersonasProcessedPhoto
                  v-if="photoUrl(person)"
                  :src="person.foto"
                  :processed-src="person.compressed_foto"
                  :auto-process="false"
                  :namespace="`pa-person-${person.id || person.indice}`"
                  :alt="fullName(person)"
                />
                <strong v-else-if="person.id">{{ initials(person) }}</strong>
                <FamilyPersonasIcon v-else :name="person.indice === 4 ? 'marbete' : 'authorized'" />
              </span>

              <div class="person-meta">
                <h3>{{ slotTitle(person) }}</h3>
                <p>{{ slotSubtitle(person) }}</p>
              </div>

              <div class="slot-actions" @click.stop>
                <button
                  v-if="person.id && marbeteReady(person)"
                  class="slot-btn slot-btn-primary"
                  type="button"
                  :disabled="downloadingId === person.id"
                  data-diagnostic-action="descargar-husky-pass-persona"
                  @click="downloadHuskyPass(person)"
                >
                  <FamilyPersonasIcon name="download" />
                  {{ downloadingId === person.id ? 'Preparando...' : 'Descargar Husky Pass' }}
                </button>
                <button v-else-if="person.id" class="slot-btn slot-btn-muted" type="button" disabled>{{ marbeteState(person) }}</button>
                <button
                  v-else
                  class="slot-btn slot-btn-outline"
                  type="button"
                  :data-diagnostic-action="person.indice === 4 ? 'agregar-pase-express' : 'capturar-persona-autorizada'"
                  @click="edit(person)"
                >
                  <FamilyPersonasIcon name="plus" />
                  {{ person.indice === 4 ? 'Agregar pase' : 'Capturar' }}
                </button>

                <button
                  v-if="person.id"
                  class="slot-btn slot-btn-outline"
                  type="button"
                  data-diagnostic-action="editar-persona-autorizada"
                  @click="edit(person)"
                >
                  <FamilyPersonasIcon name="edit" />
                  Editar
                </button>
              </div>

              <button
                v-if="person.id"
                class="slot-menu"
                type="button"
                aria-label="Eliminar registro"
                data-diagnostic-action="confirmar-eliminar-persona-autorizada"
                @click.stop="deleteTarget = person"
              >
                <FamilyPersonasIcon name="more" />
              </button>
            </article>
          </div>
        </section>

        <section id="ayuda" class="support-panel" data-product-panel="personas-help-tutorial">
          <article class="card tutorial-card">
            <header class="section-head branded-head">
              <div class="section-title-inline">
                <FamilyPersonasIcon name="document" />
                <h2>Tutorial</h2>
              </div>
              <FamilyPersonasAmbassador :theme="theme" variant="help" compact decorative />
            </header>
            <div class="video-frame">
              <iframe src="https://www.youtube.com/embed/PMBQolTRysg" title="Tutorial Personas Autorizadas" allowfullscreen loading="lazy"></iframe>
            </div>
          </article>

          <article class="card faq-card" data-product-panel="faq" data-state="content">
            <header class="section-title-inline">
              <FamilyPersonasIcon name="help" />
              <h2>Preguntas frecuentes</h2>
            </header>
            <button v-for="(item, index) in faqItems" :key="item.question" class="faq-item" type="button" :aria-expanded="openFaq === index" @click="openFaq = openFaq === index ? null : index">
              <span>
                <strong>{{ item.question }}</strong>
                <em v-if="openFaq === index">{{ item.answer }}</em>
              </span>
              <span class="faq-chevron" aria-hidden="true"><FamilyPersonasIcon name="chevron" /></span>
            </button>
          </article>
        </section>
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
          <small>También dejará de estar disponible para el Husky Pass.</small>
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
import { personasLevelName, resolvePersonasTheme } from '~/utils/personasTheme'

const route = useRoute()
const router = useRouter()
const { data, refresh, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-family-people', timeout: 15000 })

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const editing = ref<Partial<AuthorizedPerson> | null>(null)
const editorError = ref('')
const editorBusy = ref(false)
const deleteTarget = ref<AuthorizedPerson | null>(null)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const notice = ref('')
const selectedIndice = ref(normalizeIndice(route.query.persona))
const openFaq = ref<number | null>(null)
const marbeteReadiness = ref<Record<number, MarbeteReadinessResponse & { pending?: boolean }>>({})
const downloadingId = ref<number | null>(null)
const downloadError = ref('')
const editingKey = computed(() => editing.value ? `edit-${editing.value.id || 'slot'}-${editing.value.indice}` : 'edit-none')

const people = computed(() => data.value || [])
const children = computed<AuthorizedChild[]>(() => people.value.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({
  matricula: primaryChild.value?.matricula,
  plantel: primaryChild.value?.plantel,
  nivelEdu: primaryChild.value?.nivelEdu,
  campus: primaryChild.value?.campus
}))
const levelLabel = computed(() => personasLevelName(theme.value).spanish)
const studentPhoto = computed(() => normalizeVirtualAssetUrl(primaryChild.value?.foto || ''))
const studentName = computed(() => [primaryChild.value?.nombreA, primaryChild.value?.paternoA, primaryChild.value?.maternoA].filter(Boolean).join(' ') || 'tu alumno')
const studentFirstName = computed(() => String(primaryChild.value?.nombreA || studentName.value || 'tu alumno').split(/\s+/)[0] || 'tu alumno')
const completedCount = computed(() => people.value.filter((person) => person.id).length)
const completedRegularCount = computed(() => people.value.filter((person) => person.id && person.indice < 4).length)
const registeredPeopleLabel = computed(() => completedRegularCount.value === 1 ? '1 persona registrada' : `${completedRegularCount.value} personas registradas`)
const selected = computed(() => people.value.find((person) => person.indice === selectedIndice.value) || people.value.find((person) => person.id) || people.value[0] || null)

const faqItems = [
  { question: '¿Cuántas personas puedo registrar?', answer: 'Tres personas y un Pase Express opcional.' },
  { question: '¿Qué foto debo usar?', answer: 'Una foto frontal, clara y reciente.' },
  { question: '¿Dónde descargo el Husky Pass?', answer: 'Cada persona lista muestra su botón Descargar Husky Pass.' },
  { question: '¿Puedo cambiar grado o grupo?', answer: 'No. La escuela administra esos datos.' }
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
function slotTitle(person: AuthorizedPerson) {
  if (person.id) return fullName(person) || authorizedPersonLabel(person.indice)
  return person.indice === 4 ? 'Pase Express' : 'Registrar persona'
}
function slotSubtitle(person: AuthorizedPerson) {
  if (!person.id) return person.indice === 4 ? 'Opcional' : 'Disponible'
  return person.parenP || 'Datos pendientes'
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
function friendlyReadinessMessage(message?: string | null) {
  const value = String(message || '').toLowerCase()
  if (value.includes('imagen') || value.includes('foto') || value.includes('image')) return 'Actualiza la foto'
  if (value.includes('dato') || value.includes('text') || value.includes('required')) return 'Completa los datos'
  return 'No disponible'
}
function friendlyDownloadMessage(message?: string | null) {
  const value = String(message || '').toLowerCase()
  if (value.includes('foto') || value.includes('imagen') || value.includes('image')) return 'Actualiza la foto para descargar el Husky Pass o solicita apoyo a la escuela.'
  if (value.includes('dato') || value.includes('nombre') || value.includes('parentesco') || value.includes('matr')) return 'Completa los datos solicitados para descargar el Husky Pass.'
  return 'No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.'
}
async function downloadHuskyPass(person: AuthorizedPerson | null) {
  if (!person?.id || downloadingId.value) return
  downloadError.value = ''
  downloadingId.value = person.id
  try {
    const response = await fetch(`/api/personas-autorizadas/marbete?id=${person.id}&download=1`, { credentials: 'include' })
    if (!response.ok) {
      const message = await response.text().catch(() => '')
      throw new Error(friendlyDownloadMessage(message))
    }
    const blob = await response.blob()
    if (!blob.size || !response.headers.get('content-type')?.toLowerCase().includes('pdf')) {
      throw new Error('No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.')
    }
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `husky-pass-${String(person.indice || person.id).padStart(2, '0')}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } catch (err: unknown) {
    downloadError.value = err instanceof Error ? err.message : 'No pudimos preparar el Husky Pass en este momento. Intenta nuevamente o solicita apoyo a la escuela.'
  } finally {
    downloadingId.value = null
  }
}
function marbeteState(person: AuthorizedPerson) {
  if (!person.id) return person.indice === 4 ? 'Opcional' : 'Disponible'
  if (!photoUrl(person)) return 'Actualiza la foto'
  if (!fullName(person)) return 'Completa el nombre'
  if (!person.parenP) return 'Completa parentesco'
  const status = marbeteStatus(person)
  if (!status || status.pending) return 'Validando Husky Pass'
  if (!status.ok) return friendlyReadinessMessage(status.issues[0])
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
      marbeteReadiness.value[id] = { ok: false, issues: [friendlyReadinessMessage(failure?.data?.statusMessage || failure?.statusMessage || failure?.message)], pending: false }
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
    await refreshMarbeteReadiness()
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
.pa-home-screen {
  display: grid;
  gap: 16px;
}

.pa-page-hero {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 410px);
}

.pa-title-block {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: 58px minmax(0, 1fr);
  min-width: 0;
}

.hero-shield {
  align-items: center;
  background: linear-gradient(145deg, #5da2dc, #2d67a8);
  border-radius: 18px;
  box-shadow: 0 14px 30px rgba(42, 101, 166, 0.22);
  color: #fff;
  display: inline-grid;
  height: 58px;
  justify-content: center;
  position: relative;
  width: 58px;
}

.hero-shield::after {
  border: 1px solid rgba(255,255,255,.4);
  border-radius: 15px;
  content: '';
  inset: 7px;
  position: absolute;
}

.pa-title-block h1,
.pa-title-block p,
.section-label-row h2,
.section-title-inline h2 {
  margin-bottom: 0;
}

.pa-title-block h1 {
  color: #26324a;
  font-size: clamp(1.8rem, 3vw, 2.32rem);
  letter-spacing: -0.02em;
  line-height: 1;
}

.pa-title-block p:not(.eyebrow) {
  color: #727987;
  font-size: 0.9rem;
  font-weight: 700;
  margin-top: 6px;
}

.student-photo-callout {
  align-items: center;
  background: linear-gradient(135deg, #fffaf2, #fffdf8);
  border: 1px solid #f0bf86;
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(196, 128, 56, 0.09);
  color: #844f12;
  display: grid;
  gap: 12px;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  min-height: 78px;
  padding: 14px;
}

.callout-icon {
  align-items: center;
  border: 2px solid #ff7a25;
  border-radius: 999px;
  color: #ff7a25;
  display: inline-grid;
  font-size: 0.78rem;
  font-weight: 900;
  height: 18px;
  justify-content: center;
  width: 18px;
}

.callout-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.callout-copy strong,
.callout-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.callout-copy strong {
  color: #b35c16;
  font-size: 0.92rem;
}

.callout-copy small {
  color: #7a634c;
  font-size: 0.78rem;
  font-weight: 700;
}

.callout-action {
  background: #2f78bd;
  border-radius: 9px;
  box-shadow: 0 8px 18px rgba(47, 120, 189, 0.22);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 10px 14px;
  white-space: nowrap;
}

.authorized-section {
  display: grid;
  gap: 14px;
}

.section-label-row,
.section-title-inline {
  align-items: center;
  display: flex;
  gap: 10px;
  min-width: 0;
}

.section-label-row h2,
.section-title-inline h2 {
  color: #28324a;
  font-family: var(--font-body);
  font-size: 1.06rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.section-label-row small {
  color: #7a8190;
  font-size: 0.78rem;
  font-weight: 800;
  margin-left: auto;
}

.section-icon,
.section-title-inline :deep(.pa-icon) {
  color: var(--pa-primary);
}

.section-icon {
  align-items: center;
  display: inline-grid;
  justify-content: center;
}

.empty-guidance {
  align-items: center;
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .08), #fff);
  border: 1px dashed var(--pa-border);
  border-radius: 18px;
  display: grid;
  gap: 12px;
  grid-template-columns: 82px minmax(0, 1fr);
  padding: 12px 14px;
}

.empty-guidance strong,
.empty-guidance span {
  display: block;
}

.empty-guidance strong {
  color: #28324a;
}

.empty-guidance span {
  color: #6f7785;
  font-size: .84rem;
  font-weight: 700;
}

.person-slots {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(4, minmax(168px, 1fr));
}

.person-slot-card {
  align-content: center;
  background: linear-gradient(180deg, #ffffff, #fbfcff);
  border: 1px solid #dfe8f2;
  border-radius: 18px;
  box-shadow: 0 16px 36px rgba(40, 65, 100, 0.09);
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-rows: auto minmax(58px, auto) auto;
  justify-items: center;
  min-height: 292px;
  padding: 22px 14px 18px;
  position: relative;
  text-align: center;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}

.person-slot-card:hover,
.person-slot-card.selected {
  border-color: #b6d6f3;
  box-shadow: 0 20px 42px rgba(40, 93, 151, 0.15);
  transform: translateY(-2px);
}

.person-slot-card.empty {
  align-content: center;
  background: linear-gradient(180deg, #fbfdff, #f7fbff);
  border: 1px dashed #b9d8f1;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.8), 0 12px 28px rgba(40, 65, 100, 0.06);
}

.person-slot-card.express {
  background: linear-gradient(180deg, #fbfff8, #f4fbef);
  border-color: #c5dfb8;
}

.person-slot-card.express.empty {
  border-style: solid;
}

.slot-check {
  align-items: center;
  background: #61a734;
  border: 3px solid #fff;
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(61, 126, 42, 0.24);
  color: #fff;
  display: inline-grid;
  height: 28px;
  justify-content: center;
  position: absolute;
  right: 14px;
  top: 14px;
  width: 28px;
  z-index: 2;
}

.slot-check :deep(.pa-icon) {
  height: .9rem;
  stroke-width: 3;
  width: .9rem;
}

.person-photo {
  align-items: center;
  aspect-ratio: 1;
  background: linear-gradient(145deg, rgba(var(--pa-primary-rgb), .12), #fff);
  border: 1px solid var(--pa-border);
  border-radius: 999px;
  color: var(--pa-primary);
  display: inline-grid;
  font-size: 1.3rem;
  font-weight: 900;
  justify-self: center;
  overflow: hidden;
  place-items: center;
  width: 96px;
}

.person-photo[data-empty='true'] {
  border-color: #b7d8f3;
  color: #1f7cc2;
  width: 76px;
}

.person-slot-card.express .person-photo[data-empty='true'] {
  border-color: #c5dfb8;
  color: #4d8c33;
}

.person-photo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.person-meta {
  align-self: center;
  display: grid;
  gap: 5px;
  min-width: 0;
  place-items: center;
}

.person-meta h3,
.person-meta p {
  margin-bottom: 0;
}

.person-meta h3 {
  color: #29334d;
  font-family: var(--font-title);
  font-size: 1.08rem;
  line-height: 1.08;
  min-height: 2.2em;
}

.person-slot-card.empty .person-meta h3 {
  color: #0b68ad;
  min-height: auto;
}

.person-slot-card.express.empty .person-meta h3 {
  color: #315d24;
}

.person-meta p {
  color: #6f7785;
  font-size: 0.86rem;
  font-weight: 700;
}

.slot-actions {
  align-self: center;
  display: grid;
  gap: 8px;
  width: min(100%, 178px);
}

.person-slot-card[data-state='registered'] .slot-actions {
  padding-bottom: 0;
}

.slot-btn {
  align-items: center;
  border-radius: 9px;
  cursor: pointer;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 900;
  gap: 7px;
  justify-content: center;
  min-height: 38px;
  padding: 0 10px;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
  width: 100%;
}

.slot-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.slot-btn:disabled {
  cursor: not-allowed;
  opacity: .72;
}

.slot-btn-primary {
  background: #1877bf;
  border: 1px solid #1877bf;
  box-shadow: 0 8px 18px rgba(24, 119, 191, 0.22);
  color: #fff;
}

.slot-btn-outline {
  background: #fff;
  border: 1px solid #b8d4ee;
  color: #0b68ad;
}

.person-slot-card.express .slot-btn-outline {
  border-color: #a9cf99;
  color: #3f7c2e;
}

.slot-btn-muted {
  background: #f5f8fb;
  border: 1px solid #dfe8f2;
  color: #6f7785;
}

.slot-menu {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 999px;
  bottom: 12px;
  color: #50627a;
  cursor: pointer;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  padding: 0;
  position: absolute;
  right: 12px;
  width: 30px;
}

.slot-menu:hover {
  background: rgba(23, 58, 98, .07);
  color: #142b45;
}

.loading-row,
.notice,
.pa-download-alert {
  border: 1px solid var(--pa-border);
  color: var(--pa-gray);
  font-weight: 700;
}

.notice {
  background: var(--pa-soft);
  border-radius: 12px;
  margin: 0;
  padding: 10px 12px;
}

.support-panel {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.03fr) minmax(300px, .97fr);
}

.tutorial-card,
.faq-card {
  align-content: start;
  border-color: #e2ebf4;
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(40, 65, 100, 0.08);
  display: grid;
  gap: 12px;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.branded-head :deep(.pa-ambassador-card) {
  flex: 0 0 auto;
}

.video-frame {
  aspect-ratio: 16 / 9;
  background: #111;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
}

.video-frame::after {
  background: linear-gradient(to right, #65b640 0 18%, #ef4b4b 18% 36%, #f0ca45 36% 55%, #55a4d6 55% 74%, #4d4597 74% 100%);
  bottom: 0;
  content: '';
  height: 5px;
  left: 0;
  position: absolute;
  width: 100%;
}

.video-frame iframe {
  border: 0;
  height: 100%;
  width: 100%;
}

.faq-item {
  align-items: center;
  background: #fff;
  border: 1px solid #e2ebf4;
  border-radius: 13px;
  box-shadow: 0 6px 16px rgba(40, 65, 100, 0.04);
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) 32px;
  min-height: 48px;
  padding: 12px 10px 12px 14px;
  text-align: left;
  transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
  width: 100%;
}

.faq-item:hover,
.faq-item[aria-expanded='true'] {
  background: linear-gradient(180deg, #fff, #fbfdff);
  border-color: #cbddec;
  box-shadow: 0 10px 22px rgba(40, 65, 100, 0.08);
}

.faq-item strong,
.faq-item em {
  display: block;
}

.faq-item strong {
  color: #313b52;
  font-size: 0.88rem;
}

.faq-item em {
  color: #6f7785;
  font-size: 0.82rem;
  font-style: normal;
  font-weight: 700;
  margin-top: 8px;
}

.faq-chevron {
  align-items: center;
  background: #f4f8fc;
  border: 1px solid #dfe8f2;
  border-radius: 999px;
  color: #173a62;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  transition: transform .18s ease, background .18s ease;
  width: 30px;
}

.faq-item[aria-expanded='true'] .faq-chevron {
  background: var(--pa-soft);
  color: var(--pa-primary);
  transform: rotate(180deg);
}

.actions,
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

@media (max-width: 1180px) {
  .person-slots {
    grid-template-columns: repeat(2, minmax(190px, 1fr));
  }
}

@media (max-width: 920px) {
  .pa-page-hero,
  .support-panel {
    grid-template-columns: 1fr;
  }
  .person-slot-card {
    min-height: 240px;
  }
}

@media (max-width: 640px) {
  .pa-home-screen {
    gap: 14px;
  }
  .pa-page-hero {
    gap: 12px;
  }
  .pa-title-block {
    gap: 12px;
    grid-template-columns: 46px minmax(0, 1fr);
  }
  .hero-shield {
    border-radius: 15px;
    height: 46px;
    width: 46px;
  }
  .pa-title-block h1 {
    font-size: clamp(1.38rem, 8vw, 1.72rem);
  }
  .pa-title-block p:not(.eyebrow) {
    font-size: 0.8rem;
  }
  .student-photo-callout {
    align-items: start;
    grid-template-columns: 22px minmax(0, 1fr);
    min-height: 0;
  }
  .callout-action {
    grid-column: 2;
    justify-self: start;
    padding: 9px 12px;
  }
  .section-label-row {
    align-items: flex-start;
    display: grid;
    gap: 4px 8px;
    grid-template-columns: 22px minmax(0, 1fr);
  }
  .section-label-row small {
    grid-column: 2;
    margin-left: 0;
  }
  .person-slots {
    gap: 12px;
    grid-template-columns: 1fr;
  }
  .person-slot-card {
    align-items: center;
    gap: 12px;
    grid-template-columns: 68px minmax(0, 1fr);
    grid-template-rows: auto auto;
    justify-items: stretch;
    min-height: 0;
    padding: 14px;
    text-align: left;
  }
  .person-slot-card.empty {
    grid-template-columns: 58px minmax(0, 1fr);
  }
  .person-photo,
  .person-photo[data-empty='true'] {
    width: 64px;
  }
  .person-meta h3 {
    font-size: 0.98rem;
    min-height: 0;
  }
  .slot-actions {
    grid-column: 1 / -1;
    justify-self: stretch;
    width: 100%;
  }
  .slot-menu {
    bottom: auto;
    top: 14px;
  }
  .empty-guidance {
    grid-template-columns: 62px minmax(0, 1fr);
  }
}
</style>