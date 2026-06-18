<template>
  <FamilyPersonasAutorizadasShell title="Personas autorizadas">
    <p v-if="downloadError" class="alert pa-download-alert" data-state="error">{{ downloadError }}</p>
    <div v-if="loadError" class="alert retry-alert" data-state="error">
      <span>No fue posible cargar Personas Autorizadas.</span>
      <button class="btn btn-secondary" type="button" data-diagnostic-action="reintentar-personas-autorizadas" @click="retryLoad">Reintentar</button>
    </div>
    <div v-else-if="pending" class="card loading-row" data-product-loading data-state="loading">Cargando...</div>

    <template v-else>
      <section class="pa-home-screen" data-product-panel="personas-home">
        <FamilyPersonasPageHeader
          :eyebrow="levelLabel"
          title="Personas autorizadas"
          :description="`Gestiona de forma segura quién puede recoger a ${studentFirstName}.`"
          :theme="theme"
          ambassador-variant="hero"
        >
          <template #actions>
            <button
              v-if="expressSlot && !expressSlot.id"
              class="hero-express-action"
              type="button"
              data-diagnostic-action="agregar-pase-express-hero"
              @click="edit(expressSlot)"
            >
              <FamilyPersonasIcon name="plus" />
              Agregar pase express
            </button>

            <NuxtLink v-if="!studentPhoto" class="student-photo-callout" to="/familia/personas-autorizadas/credencializacion">
              <span class="callout-icon" aria-hidden="true">i</span>
              <span class="callout-copy">
                <strong>Foto del alumno pendiente</strong>
                <small>Sube la foto de {{ studentFirstName }} para generar los Husky Pass.</small>
              </span>
              <span class="callout-action">Subir foto</span>
            </NuxtLink>
          </template>
        </FamilyPersonasPageHeader>

        <section class="authorized-section" data-product-panel="authorized-people" :data-state="completedCount ? 'content' : 'empty'">
          <FamilyPersonasSectionHeading
            title="Personas autorizadas"
            description="Registros permanentes y pase temporal."
            :meta="registeredPeopleLabel"
          />

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
              :class="{ empty: !person.id, express: person.indice === 4 }"
              :data-state="person.id ? 'registered' : 'available'"
              :data-slot="person.indice"
            >
              <span v-if="person.id && marbeteReady(person)" class="slot-check" aria-label="Husky Pass listo"><FamilyPersonasIcon name="check" /></span>
              <span v-if="!person.id && person.indice === 4" class="slot-badge">Nuevo</span>
              <span v-if="!person.id && person.indice === 4" class="express-preview" aria-hidden="true">
                <span class="express-preview-screen"><FamilyPersonasIcon name="check" /></span>
              </span>

              <span class="person-photo" :data-empty="!person.id">
                <FamilyPersonasProcessedPhoto
                  v-if="photoUrl(person)"
                  :src="person.foto"
                  :processed-src="person.compressed_foto"
                  :auto-process="true"
                  :trust-stored-processed="true"
                  :namespace="`pa-person-${person.id || person.indice}`"
                  :alt="fullName(person)"
                />
                <strong v-else-if="person.id">{{ initials(person) }}</strong>
                <FamilyPersonasIcon v-else :name="person.indice === 4 ? 'marbete' : 'authorized'" />
              </span>

              <div class="person-meta">
                <h3>{{ slotTitle(person) }}</h3>
                <p>{{ slotSubtitle(person) }}</p>
                <span v-if="!person.id && person.indice === 4" class="express-description">Crea un pase temporal para una persona que recogerá a {{ studentFirstName }} una sola vez.</span>
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
                  class="slot-btn slot-btn-danger-outline"
                  type="button"
                  data-diagnostic-action="abrir-anular-persona-autorizada"
                  @click="annulTarget = person"
                >
                  <FamilyPersonasIcon name="trash" />
                  Anular o reemplazar
                </button>
              </div>
            </article>
          </div>
        </section>

        <section id="ayuda" class="support-panel" data-product-panel="personas-help-tutorial">
          <article class="card tutorial-card">
            <header class="section-head branded-head">
              <FamilyPersonasSectionHeading
                title="Tutorial"
                description="Aprende a crear, descargar y usar los Husky Pass."
              />
              <div class="section-ambassador" aria-hidden="true">
                <FamilyPersonasAmbassador :theme="theme" variant="help" compact contained decorative />
              </div>
            </header>
            <FamilyPersonasTutorialVideo :theme="theme" video-id="PMBQolTRysg" title="Tutorial Personas Autorizadas" />
          </article>

          <article class="card faq-card" data-product-panel="faq" data-state="content">
            <FamilyPersonasSectionHeading
              title="Preguntas frecuentes"
              :description="faqIntro"
            />
            <button
              v-for="(item, index) in faqItems"
              :key="item.question"
              class="faq-item"
              type="button"
              :aria-expanded="openFaq === index"
              @click="openFaq = openFaq === index ? null : index"
            >
              <span>
                <strong>{{ item.question }}</strong>
                <em v-if="openFaq === index">{{ item.answer }}</em>
              </span>
              <span class="faq-chevron" aria-hidden="true"><FamilyPersonasIcon name="chevron" /></span>
            </button>
            <NuxtLink class="faq-support-link" to="/familia/personas-autorizadas/tutorial">¿Tienes otra pregunta? Consulta el centro de ayuda <FamilyPersonasIcon name="arrow" /></NuxtLink>
          </article>
        </section>
      </section>

      <FamilyPersonasModal
        v-if="editing"
        :title="authorizedPersonLabel(Number(editing.indice || 1))"
        eyebrow="Persona autorizada"
        :theme="theme"
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
        v-if="annulTarget"
        title="Anular persona autorizada"
        :eyebrow="authorizedPersonLabel(Number(annulTarget.indice || 1))"
        :theme="theme"
        @close="annulTarget = null"
      >
        <section class="delete-confirm">
          <p>{{ fullName(annulTarget) || 'Este registro' }}</p>
          <small>Al anularlo, la persona ya no podrá entregar o recoger al alumno. Para corregir datos o foto, anula el registro y captura uno nuevo.</small>
          <div class="actions form-actions">
            <button
              class="btn btn-danger"
              type="button"
              :disabled="deleting"
              data-diagnostic-action="anular-y-recapturar-persona-autorizada"
              @click="remove(annulTarget.id, { recapture: true, indice: annulTarget.indice })"
            >
              {{ deleting ? 'Anulando...' : 'Anular y capturar de nuevo' }}
            </button>
            <button
              class="btn btn-secondary"
              type="button"
              :disabled="deleting"
              data-diagnostic-action="anular-persona-autorizada"
              @click="remove(annulTarget.id)"
            >
              Solo anular
            </button>
            <button class="btn btn-secondary" type="button" :disabled="deleting" @click="annulTarget = null">Cancelar</button>
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
import { useFetch } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson, MarbeteReadinessResponse } from '~/types/daycare'
import { authorizedPersonLabel, normalizeVirtualAssetUrl } from '~/utils/daycare'
import { createAuthorizedPersonForm, toAuthorizedPersonSavePayload } from '~/utils/authorizedPersonForm'
import { isValidatedVisionPhotoUrl } from '~/utils/visionFace'
import { personasLevelName, resolvePersonasTheme } from '~/utils/personasTheme'

const { data, refresh, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-family-people', timeout: 15000, dedupe: 'defer' })

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const editing = ref<Partial<AuthorizedPerson> | null>(null)
const editorError = ref('')
const editorBusy = ref(false)
const annulTarget = ref<AuthorizedPerson | null>(null)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const notice = ref('')
const selectedIndice = ref(1)
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
const expressSlot = computed(() => people.value.find((person) => person.indice === 4) || null)

function retryLoad() {
  return refresh()
}

const faqIntro = 'Sabemos que tendrás muchas preguntas, por eso reunimos aquí las respuestas más comunes. Si tienes una duda particular, contáctanos y con gusto te brindaremos atención personalizada.'
const faqItems = [
  {
    question: "¿Qué es el módulo 'Personas Autorizadas' y para qué se utiliza?",
    answer: "El módulo 'Personas Autorizadas' en Husky Pass es una herramienta que permite a los padres de familia gestionar los registros de las personas autorizadas para entregar y recoger a los alumnos en los colegios."
  },
  {
    question: '¿Cuántas personas autorizadas puedo registrar por cada alumno matriculado?',
    answer: 'Puedes registrar un máximo de tres personas autorizadas por cada alumno matriculado.'
  },
  {
    question: '¿Qué información se requiere para registrar a una persona autorizada?',
    answer: 'Para registrar a una persona autorizada, se deben completar los siguientes campos en el formulario: nombre completo de la persona, parentesco con el alumno y cargar una fotografía que cumpla con las especificaciones de estilo de pasaporte.'
  },
  {
    question: '¿Qué debo hacer si ninguna de las tres personas autorizadas está disponible ante una eventualidad emergente?',
    answer: "En caso de una eventualidad donde ninguna de las tres personas autorizadas esté disponible, se puede generar un 'pase express' de manera rápida y segura. El pase express permite registrar temporalmente los datos de un familiar, conocido, tutor o persona encargada para que pueda entregar o recoger al alumno. El registro express será válido durante 24 horas a partir de su generación."
  },
  {
    question: '¿Cómo genero un pase express?',
    answer: 'Para generar un pase express, sigue las instrucciones en la plataforma Husky Pass para completar los datos del familiar, conocido, tutor o persona encargada en el formulario correspondiente.'
  },
  {
    question: '¿Qué hago si el pase express expiró?',
    answer: 'Si el pase express ha expirado y aún necesitas que alguien recoja o entregue al alumno, te recomendamos comunicarte directamente con la recepción / Control escolar del colegio. El personal estará encantado de ayudarte a encontrar una solución adecuada y asegurarse de que el alumno esté en buenas manos.'
  },
  {
    question: '¿Qué debo hacer después de guardar el registro normal o el pase express?',
    answer: 'Después de generar y guardar el registro normal o el pase express, deberás realizar la impresión del PDF que contiene el formato para recortar, ya sea el hanger o el gafete.'
  },
  {
    question: '¿Cómo elimino o anulo una persona autorizada?',
    answer: "Si necesitas eliminar a una persona autorizada de la lista, simplemente accede al módulo 'Personas Autorizadas' en Husky Pass, selecciona la persona que deseas eliminar y busca la opción de eliminar o anular el registro. Ten en cuenta que al eliminar a una persona autorizada, ya no podrá entregar o recoger al alumno a menos que se registre nuevamente."
  },
  {
    question: '¿Puedo editar la información después de guardar un registro?',
    answer: 'No, la información de cada registro no se puede editar una vez guardada. En caso de algún error de captura de datos o de la foto, se deberá eliminar o anular el registro existente y crear uno nuevo desde cero con la información correcta.'
  }
]

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
function edit(person: AuthorizedPerson) {
  error.value = ''
  notice.value = ''
  editorError.value = ''
  editorBusy.value = false
  selectedIndice.value = person.indice
  if (person.id) {
    annulTarget.value = person
    return
  }
  editing.value = toAuthorizedPersonSavePayload(createAuthorizedPersonForm(person))
}
function openFreshCapture(indice: number) {
  editorError.value = ''
  editorBusy.value = false
  selectedIndice.value = normalizeIndice(indice)
  editing.value = toAuthorizedPersonSavePayload(createAuthorizedPersonForm({ indice: selectedIndice.value }))
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
async function remove(id: number | null | undefined, options: { recapture?: boolean; indice?: number } = {}) {
  if (!id) return
  deleting.value = true
  error.value = ''
  notice.value = ''
  try {
    await $fetch(`/api/personas-autorizadas/family/${id}`, { method: 'DELETE' })
    const nextIndice = normalizeIndice(options.indice)
    annulTarget.value = null
    await refresh()
    await refreshMarbeteReadiness()
    if (options.recapture) {
      openFreshCapture(nextIndice)
      notice.value = 'Registro anulado. Captura la información correcta.'
    } else {
      notice.value = 'Registro anulado.'
    }
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible anular el registro.'
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
  gap: 22px;
}

.hero-express-action {
  align-items: center;
  background: rgba(255, 255, 255, .92);
  border: 1px solid rgba(var(--pa-primary-rgb), .55);
  border-radius: 13px;
  color: var(--pa-primary);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: .8rem;
  font-weight: 800;
  gap: 8px;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  transition: background .18s ease, box-shadow .18s ease, transform .18s ease;
}

.hero-express-action:hover {
  background: #fff;
  box-shadow: 0 10px 22px rgba(var(--pa-primary-rgb), .13);
  transform: translateY(-1px);
}

.student-photo-callout {
  align-items: center;
  background: linear-gradient(135deg, #fffaf2, #fffdf8);
  border: 1px solid #efc18d;
  border-radius: 15px;
  box-shadow: 0 10px 24px rgba(196, 128, 56, .08);
  color: #844f12;
  display: grid;
  gap: 10px;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  max-width: 440px;
  min-height: 68px;
  padding: 11px 12px;
}

.callout-icon {
  align-items: center;
  border: 2px solid #ea7b28;
  border-radius: 999px;
  color: #ea7b28;
  display: inline-grid;
  font-size: .72rem;
  font-weight: 900;
  height: 18px;
  justify-content: center;
  width: 18px;
}

.callout-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.callout-copy strong,
.callout-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.callout-copy strong {
  color: #a85a1b;
  font-size: .82rem;
}

.callout-copy small {
  color: #786653;
  font-size: .7rem;
  font-weight: 650;
}

.callout-action {
  background: #fff;
  border: 1px solid #e7b77e;
  border-radius: 9px;
  color: #a85a1b;
  font-size: .72rem;
  font-weight: 800;
  padding: 8px 10px;
  white-space: nowrap;
}

.authorized-section {
  background: rgba(255, 255, 255, .94);
  border: 1px solid #e2e8ec;
  border-radius: 24px;
  box-shadow: 0 18px 48px rgba(30, 53, 78, .07);
  display: grid;
  gap: 18px;
  padding: 20px;
}


.empty-guidance {
  align-items: center;
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .07), #fff);
  border: 1px dashed rgba(var(--pa-primary-rgb), .27);
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
  color: #26334b;
}

.empty-guidance span {
  color: #707a8c;
  font-size: .82rem;
  font-weight: 650;
}

.person-slots {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.person-slot-card {
  align-content: start;
  background: #fff;
  border: 1px solid #e3e9ed;
  border-radius: 20px;
  box-shadow: 0 10px 28px rgba(31, 52, 76, .055);
  display: grid;
  gap: 12px;
  grid-template-rows: auto minmax(66px, auto) auto;
  justify-items: center;
  min-height: 326px;
  overflow: hidden;
  padding: 18px 16px 16px;
  position: relative;
  text-align: center;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.person-slot-card.empty:not(.express) {
  align-content: center;
  background: linear-gradient(180deg, #fbfdfd, #f5fafb);
  border-style: dashed;
}

.person-slot-card.express {
  background:
    radial-gradient(circle at 96% 12%, rgba(99, 183, 85, .2), transparent 9rem),
    radial-gradient(circle at 82% 90%, rgba(99, 183, 85, .16), transparent 10rem),
    linear-gradient(145deg, #fbfff8, #edf8e8);
  border-color: #cfe4c5;
}

.person-slot-card.express.empty {
  align-content: stretch;
  justify-items: start;
  padding: 22px 18px 16px;
  text-align: left;
}

.slot-check {
  align-items: center;
  background: #5caf3f;
  border: 3px solid #fff;
  border-radius: 999px;
  box-shadow: 0 7px 16px rgba(72, 142, 48, .24);
  color: #fff;
  display: inline-grid;
  height: 29px;
  justify-content: center;
  position: absolute;
  right: 13px;
  top: 13px;
  width: 29px;
  z-index: 3;
}

.slot-check :deep(.pa-icon) {
  height: .86rem;
  stroke-width: 3;
  width: .86rem;
}

.slot-badge {
  background: rgba(255, 255, 255, .82);
  border: 1px solid #bcd9ae;
  border-radius: 999px;
  color: #4f9335;
  font-size: .68rem;
  font-weight: 850;
  left: 18px;
  padding: 5px 9px;
  position: absolute;
  top: 16px;
  z-index: 2;
}

.express-preview {
  background: rgba(255, 255, 255, .7);
  border: 5px solid rgba(37, 107, 103, .34);
  border-radius: 20px;
  box-shadow: 0 18px 28px rgba(45, 100, 78, .13);
  display: grid;
  height: 132px;
  place-items: center;
  position: absolute;
  right: 17px;
  top: 68px;
  transform: rotate(6deg);
  width: 78px;
  z-index: 1;
}

.express-preview::before,
.express-preview::after {
  background: #dceecf;
  border-radius: 999px;
  content: '';
  height: 6px;
  left: 14px;
  position: absolute;
  width: 34px;
}

.express-preview::before {
  bottom: 24px;
}

.express-preview::after {
  bottom: 12px;
  width: 24px;
}

.express-preview-screen {
  align-items: center;
  background: #5caf3f;
  border: 5px solid #fff;
  border-radius: 999px;
  box-shadow: 0 7px 16px rgba(72, 142, 48, .24);
  color: #fff;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  margin-top: -22px;
  width: 44px;
}

.person-photo {
  align-items: center;
  aspect-ratio: 1;
  background:
    radial-gradient(circle at 50% 24%, rgba(255, 255, 255, .92), transparent 36%),
    linear-gradient(145deg, rgba(var(--pa-primary-rgb), .1), #fff);
  border: 1px solid #e3e9ed;
  border-radius: 999px;
  color: var(--pa-primary);
  display: inline-grid;
  font-size: 1.25rem;
  font-weight: 900;
  justify-self: center;
  margin-top: 2px;
  overflow: hidden;
  place-items: center;
  width: 124px;
}

.person-photo[data-empty='true'] {
  border-color: rgba(var(--pa-primary-rgb), .25);
  color: var(--pa-primary);
  width: 82px;
}

.person-slot-card.express.empty .person-photo {
  display: none;
}

.person-photo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.person-meta {
  align-self: center;
  display: grid;
  gap: 8px;
  min-width: 0;
  place-items: center;
}

.person-meta h3,
.person-meta p {
  margin-bottom: 0;
}

.person-meta h3 {
  color: #26334b;
  font-family: var(--font-title);
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.18;
  max-width: 20ch;
  min-height: 2.36em;
}

.person-slot-card.empty:not(.express) .person-meta h3 {
  color: var(--pa-primary);
  min-height: auto;
}

.person-meta p {
  background: #edf6ff;
  border-radius: 999px;
  color: #39709e;
  font-size: .72rem;
  font-weight: 800;
  min-width: 76px;
  padding: 5px 12px;
}

.person-slot-card.express .person-meta p {
  background: rgba(255, 255, 255, .72);
  color: #4d8c33;
}

.person-slot-card.express.empty .person-meta {
  align-content: start;
  align-self: start;
  gap: 9px;
  justify-items: start;
  margin-top: 48px;
  max-width: 61%;
  place-items: start;
  position: relative;
  z-index: 2;
}

.person-slot-card.express.empty .person-meta h3 {
  color: #2e6b2b;
  font-size: 1.14rem;
  min-height: 0;
}

.person-slot-card.express.empty .person-meta p {
  min-width: 0;
}

.express-description {
  color: #647568;
  font-size: .75rem;
  font-weight: 650;
  line-height: 1.5;
}

.slot-actions {
  align-self: end;
  display: grid;
  gap: 7px;
  width: min(100%, 188px);
}

.person-slot-card.express.empty .slot-actions {
  justify-self: stretch;
  position: relative;
  width: 100%;
  z-index: 2;
}

.slot-btn {
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: .74rem;
  font-weight: 850;
  gap: 7px;
  justify-content: center;
  min-height: 39px;
  padding: 0 10px;
  transition: background .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease;
  width: 100%;
}

.slot-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.slot-btn:disabled {
  cursor: not-allowed;
  opacity: .7;
}

.slot-btn-primary {
  background: linear-gradient(135deg, #12858d, #0a6c76);
  border: 1px solid #0a737d;
  box-shadow: 0 8px 17px rgba(12, 112, 122, .2);
  color: #fff;
}

.slot-btn-outline {
  background: #fff;
  border: 1px solid rgba(var(--pa-primary-rgb), .32);
  color: var(--pa-primary);
}

.slot-btn-danger-outline {
  background: transparent;
  border: 1px solid transparent;
  color: #b04e4e;
  min-height: 34px;
}

.slot-btn-danger-outline:hover:not(:disabled) {
  background: #fff4f3;
  border-color: #f2c4c0;
  box-shadow: none;
}

.person-slot-card.express .slot-btn-outline {
  background: linear-gradient(135deg, #64b645, #4a9a36);
  border-color: #4c9b38;
  box-shadow: 0 8px 18px rgba(70, 145, 50, .18);
  color: #fff;
}

.slot-btn-muted {
  background: #f5f8fa;
  border: 1px solid #dfe7ec;
  color: #6f7888;
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
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.04fr) minmax(360px, .96fr);
  scroll-margin-top: 112px;
}

.tutorial-card,
.faq-card {
  align-content: start;
  background: rgba(255, 255, 255, .94);
  border: 1px solid #e2e8ec;
  border-radius: 24px;
  box-shadow: 0 18px 48px rgba(30, 53, 78, .07);
  display: grid;
  gap: 12px;
  padding: 18px;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-height: 52px;
}

.section-ambassador {
  flex: 0 0 auto;
  height: 62px;
  overflow: hidden;
  width: 68px;
}

.section-ambassador :deep(.pa-ambassador-card),
.section-ambassador :deep(.pa-ambassador-visual) {
  height: 62px;
  width: 68px;
}

.tutorial-card :deep(.tutorial-video) {
  border-radius: 17px;
  box-shadow: none;
  padding: 0;
}

.tutorial-card :deep(.tutorial-video::after) {
  display: none;
}


.faq-item {
  align-items: center;
  background: #fff;
  border: 1px solid #e4e9ed;
  border-radius: 11px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) 28px;
  min-height: 43px;
  padding: 9px 8px 9px 12px;
  text-align: left;
  transition: background .18s ease, border-color .18s ease, box-shadow .18s ease;
  width: 100%;
}

.faq-item:hover,
.faq-item[aria-expanded='true'] {
  background: #fbfdfd;
  border-color: rgba(var(--pa-primary-rgb), .24);
  box-shadow: 0 7px 17px rgba(31, 52, 76, .06);
}

.faq-item strong,
.faq-item em {
  display: block;
}

.faq-item strong {
  color: #354158;
  font-size: .76rem;
  line-height: 1.4;
}

.faq-item em {
  color: #6f798a;
  font-size: .74rem;
  font-style: normal;
  font-weight: 650;
  line-height: 1.5;
  margin-top: 7px;
}

.faq-chevron {
  align-items: center;
  background: #f4f8f9;
  border: 1px solid #e0e8eb;
  border-radius: 999px;
  color: #536376;
  display: inline-flex;
  height: 26px;
  justify-content: center;
  transition: background .18s ease, transform .18s ease;
  width: 26px;
}

.faq-item[aria-expanded='true'] .faq-chevron {
  background: var(--pa-soft);
  color: var(--pa-primary);
  transform: rotate(180deg);
}

.faq-support-link {
  align-items: center;
  background: #f5f9f9;
  border-radius: 11px;
  color: var(--pa-primary);
  display: flex;
  font-size: .72rem;
  font-weight: 800;
  gap: 7px;
  justify-content: space-between;
  min-height: 38px;
  padding: 0 12px;
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

@media (max-width: 1120px) {
  .person-slots {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }

  .support-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .pa-home-screen {
    gap: 16px;
  }

  .student-photo-callout {
    max-width: none;
  }

  .authorized-section,
  .tutorial-card,
  .faq-card {
    border-radius: 20px;
    padding: 16px;
  }
}

@media (max-width: 700px) {

  .hero-express-action {
    justify-self: stretch;
  }

  .student-photo-callout {
    align-items: start;
    grid-template-columns: 20px minmax(0, 1fr);
  }

  .callout-action {
    grid-column: 2;
    justify-self: start;
  }


  .person-slots {
    grid-template-columns: 1fr;
  }

  .person-slot-card {
    min-height: 308px;
  }

  .person-slot-card.express.empty .person-meta {
    max-width: 64%;
  }
}

@media (max-width: 430px) {
  .authorized-section,
  .tutorial-card,
  .faq-card {
    padding: 13px;
  }

  .person-slot-card.express.empty .person-meta {
    max-width: 58%;
  }

  .express-preview {
    opacity: .72;
    right: 8px;
  }
}
</style>
