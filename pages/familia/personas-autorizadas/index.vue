<template>
  <FamilyPersonasAutorizadasShell title="Personas Autorizadas">
    <section class="pa-hero card" data-product-panel="personas-home">
      <div>
        <p class="eyebrow">Registro familiar</p>
        <h1>Personas Autorizadas</h1>
        <p>Administra tres personas autorizadas y un Pase Express por cuenta familiar. Cada registro conserva su QR, credencial y marbete cuando tiene datos completos.</p>
      </div>
      <img :src="mascot" alt="" />
    </section>

    <p v-if="loadError" class="alert" data-state="error">No fue posible cargar Personas Autorizadas.</p>
    <div v-else-if="pending" class="card loading-row" data-product-loading data-state="loading">Cargando registros...</div>

    <template v-else>
      <section class="card pa-slots" data-product-panel="authorized-people" :data-state="completedCount ? 'content' : 'empty'">
        <header class="section-head">
          <div>
            <p class="eyebrow">Personas autorizadas</p>
            <h2>{{ completedRegularCount }}/3 registros activos</h2>
          </div>
          <NuxtLink class="btn btn-secondary" to="/familia/personas-autorizadas#ayuda">Cómo funciona</NuxtLink>
        </header>

        <div class="person-grid">
          <button
            v-for="person in people"
            :key="person.indice"
            class="person-card"
            :class="{ selected: selected?.indice === person.indice, empty: !person.id, express: person.indice === 4 }"
            type="button"
            :aria-pressed="selected?.indice === person.indice"
            data-diagnostic-action="seleccionar-persona-autorizada"
            @click="selectPerson(person)"
          >
            <span class="person-photo">
              <img v-if="photoUrl(person)" :src="photoUrl(person)" alt="" />
              <strong v-else-if="person.id">{{ initials(person) }}</strong>
              <strong v-else>+</strong>
            </span>
            <span class="person-meta">
              <b>{{ authorizedPersonLabel(person.indice) }}</b>
              <small>{{ person.id ? fullName(person) || 'Registro guardado' : person.indice === 4 ? 'Pase temporal disponible' : 'Registro disponible' }}</small>
            </span>
          </button>
        </div>

        <div v-if="selected" class="selected-row" data-product-panel="selected-authorized-person" :data-state="selected.id ? 'content' : 'empty'">
          <div>
            <p class="eyebrow">{{ authorizedPersonLabel(selected.indice) }}</p>
            <h3>{{ fullName(selected) || 'Registro disponible' }}</h3>
            <p>{{ selected.parenP || 'Captura nombre, parentesco y foto para activar credencial y marbete.' }}</p>
          </div>
          <div class="actions">
            <button class="btn btn-primary pa-primary" type="button" data-diagnostic-action="editar-persona-autorizada" @click="edit(selected)">
              {{ selected.id ? 'Editar' : selected.indice === 4 ? 'Generar Pase Express' : 'Capturar' }}
            </button>
            <NuxtLink v-if="selected.id" class="btn btn-secondary" :to="`/familia/personas-autorizadas/${selected.id}`">Detalle</NuxtLink>
            <NuxtLink v-if="selected.id" class="btn btn-secondary" :to="`/familia/personas-autorizadas/${selected.id}/marbete`">Marbete</NuxtLink>
            <a v-if="selected.id" class="btn btn-secondary" :href="`/api/personas-autorizadas/marbete?id=${selected.id}&download=1`">Descargar</a>
            <button v-if="selected.id" class="btn btn-danger" type="button" data-diagnostic-action="eliminar-persona-autorizada" @click="remove(selected.id)">Eliminar</button>
          </div>
        </div>
      </section>

      <FamilyPersonasModal
        v-if="editing"
        :title="authorizedPersonLabel(Number(editing.indice || 1))"
        eyebrow="Personas Autorizadas"
        description="Completa los datos visibles en credencial, QR y marbete."
        @close="editing = null"
      >
        <FamilyAuthorizedPersonEditor
          :person="editing"
          :label="authorizedPersonLabel(Number(editing.indice || 1))"
          :saving="saving"
          @save="save"
          @cancel="editing = null"
        />
      </FamilyPersonasModal>

      <section class="quick-links">
        <NuxtLink class="card quick-card" to="/familia/personas-autorizadas/actualizar-datos">
          <FamilyPersonasIcon name="edit" />
          <strong>Actualizar datos</strong>
          <span>Datos personales y familiares permitidos.</span>
        </NuxtLink>
        <NuxtLink class="card quick-card" to="/familia/personas-autorizadas/credencializacion">
          <FamilyPersonasIcon name="camera" />
          <strong>Credencialización</strong>
          <span>Actualiza la foto del alumno.</span>
        </NuxtLink>
        <NuxtLink class="card quick-card" to="/familia/personas-autorizadas/marbetes">
          <FamilyPersonasIcon name="download" />
          <strong>Marbetes</strong>
          <span>Previsualiza y descarga lo disponible.</span>
        </NuxtLink>
      </section>

      <section id="ayuda" class="help-grid" data-product-panel="personas-help-tutorial">
        <article class="card tutorial-card">
          <div class="section-head compact-head">
            <div>
              <p class="eyebrow">Tutorial</p>
              <h2>Uso rápido</h2>
            </div>
            <img :src="helpMascot" alt="" />
          </div>
          <div class="video-frame">
            <iframe src="https://www.youtube.com/embed/PMBQolTRysg" title="Tutorial Personas Autorizadas" allowfullscreen loading="lazy"></iframe>
          </div>
        </article>

        <article class="card faq-card" data-product-panel="faq" data-state="content">
          <header>
            <p class="eyebrow">FAQ</p>
            <h2>Preguntas frecuentes</h2>
          </header>
          <button v-for="(item, index) in faqItems" :key="item.question" class="faq-item" type="button" :aria-expanded="openFaq === index" @click="openFaq = openFaq === index ? null : index">
            <span>
              <strong>{{ item.question }}</strong>
              <em v-if="openFaq === index">{{ item.answer }}</em>
            </span>
            <b>{{ openFaq === index ? '−' : '+' }}</b>
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
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { authorizedPersonLabel, normalizeVirtualAssetUrl } from '~/utils/daycare'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const router = useRouter()
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-index-session' })
const { data, refresh, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-family-people', timeout: 15000 })

const editing = ref<Partial<AuthorizedPerson> | null>(null)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const selectedIndice = ref(normalizeIndice(route.query.persona))
const openFaq = ref<number | null>(0)

const people = computed(() => data.value || [])
const children = computed<AuthorizedChild[]>(() => people.value.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value.find((child) => child.isCurrent) || children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({
  plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0],
  nivelEdu: primaryChild.value?.nivelEdu,
  campus: primaryChild.value?.campus || session.value?.user?.campus
}))
const mascot = computed(() => personasMascot(theme.value, 'hero'))
const helpMascot = computed(() => personasMascot(theme.value, 'help'))
const completedCount = computed(() => people.value.filter((person) => person.id).length)
const completedRegularCount = computed(() => people.value.filter((person) => person.id && person.indice < 4).length)
const selected = computed(() => people.value.find((person) => person.indice === selectedIndice.value) || people.value.find((person) => person.id) || people.value[0] || null)

const faqItems = [
  { question: '¿Qué es Personas Autorizadas?', answer: 'Es el módulo para registrar quiénes pueden entregar o recoger al alumno con validación QR.' },
  { question: '¿Cuántas personas puedo registrar?', answer: 'Puedes mantener tres personas autorizadas y un Pase Express para situaciones temporales.' },
  { question: '¿Qué foto debo usar?', answer: 'Usa una fotografía clara de frente. El sistema prepara el recorte automáticamente.' },
  { question: '¿Para qué sirve el Pase Express?', answer: 'Permite generar un registro temporal cuando las personas autorizadas habituales no están disponibles.' },
  { question: '¿Cómo descargo el marbete?', answer: 'Abre Marbetes / descarga, elige una persona registrada y descarga el formato disponible.' },
  { question: '¿Puedo cambiar grado, grupo o nivel?', answer: 'No. Esos campos son escolares y se mantienen como solo lectura para familias.' }
]

watch(() => route.query.persona, (value) => {
  const next = normalizeIndice(value)
  if (next !== selectedIndice.value) selectedIndice.value = next
})

watch(people, (value) => {
  if (!value.length) return
  if (!value.some((person) => person.indice === selectedIndice.value)) selectedIndice.value = value[0]?.indice || 1
}, { immediate: true })

function dateOnly(value?: string | null) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value || ''))
  return match?.[1] || ''
}

function fullName(person: AuthorizedPerson | Partial<AuthorizedPerson>) {
  return [person.nombreP, person.paternoP, person.maternoP].filter(Boolean).join(' ')
}

function initials(person: AuthorizedPerson | Partial<AuthorizedPerson>) {
  const name = fullName(person) || 'PA'
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

function photoUrl(person: AuthorizedPerson | Partial<AuthorizedPerson>) {
  return normalizeVirtualAssetUrl(person.compressed_foto || person.foto || '')
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
  editing.value = {
    ...person,
    fechaP: dateOnly(person.fechaP) || new Date().toISOString().slice(0, 10)
  }
}

async function save(payload: Partial<AuthorizedPerson>) {
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    await $fetch('/api/personas-autorizadas/family', { method: 'POST', body: payload })
    editing.value = null
    await refresh()
    notice.value = payload.id ? 'Registro actualizado.' : 'Registro creado.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar el registro.'
  } finally {
    saving.value = false
  }
}

async function remove(id: number | null | undefined) {
  if (!id || !confirm('Eliminar este registro de Personas Autorizadas?')) return
  error.value = ''
  notice.value = ''
  try {
    await $fetch(`/api/personas-autorizadas/family/${id}`, { method: 'DELETE' })
    await refresh()
    notice.value = 'Registro eliminado.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible eliminar el registro.'
  }
}

function normalizeIndice(value: unknown) {
  const parsed = Number(Array.isArray(value) ? value[0] : value || 1)
  return parsed >= 1 && parsed <= 4 ? parsed : 1
}
</script>

<style scoped>
.pa-hero,
.section-head,
.selected-row,
.quick-card {
  align-items: center;
  display: grid;
  gap: 14px;
}

.pa-hero {
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), 0.12), #fff);
  grid-template-columns: minmax(0, 1fr) 150px;
  overflow: hidden;
}

.pa-hero img {
  align-self: end;
  max-height: 150px;
  object-fit: contain;
}

.pa-primary { background: var(--pa-primary); color: var(--pa-contrast); }

.loading-row,
.notice {
  border: 1px solid var(--pa-border);
  color: var(--pa-gray);
  font-weight: 850;
}

.notice {
  background: var(--pa-soft);
  border-radius: 14px;
  margin: 0;
  padding: 10px 12px;
}

.pa-slots {
  display: grid;
  gap: 18px;
}

.section-head {
  grid-template-columns: minmax(0, 1fr) auto;
}

.compact-head {
  align-items: center;
  grid-template-columns: minmax(0, 1fr) 70px;
}

.compact-head img {
  max-height: 70px;
  object-fit: contain;
}

.section-head h2,
.selected-row h3 {
  margin-bottom: 0;
}

.person-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(130px, 1fr));
}

.person-card {
  background: transparent;
  border: 0;
  cursor: pointer;
  display: grid;
  padding: 0;
  text-align: left;
}

.person-photo {
  aspect-ratio: 1;
  background: #d9d9d9;
  border: 2px solid transparent;
  border-radius: 18px 18px 0 0;
  color: #50535a;
  display: grid;
  font-size: 2.2rem;
  overflow: hidden;
  place-items: center;
}

.person-photo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.person-card.selected .person-photo,
.person-card:hover .person-photo {
  border-color: var(--pa-primary);
}

.person-meta {
  background: var(--pa-primary);
  border-radius: 0 0 18px 18px;
  color: var(--pa-contrast);
  display: grid;
  gap: 2px;
  min-height: 56px;
  padding: 9px 10px;
}

.person-card.empty .person-meta {
  background: #ececec;
  color: #50535a;
}

.person-meta b {
  font-size: 0.8rem;
  text-transform: uppercase;
}

.person-meta small {
  font-size: 0.76rem;
  font-weight: 780;
}

.selected-row {
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 14px;
}

.actions,
.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.quick-card {
  grid-template-columns: 28px minmax(0, 1fr);
}

.quick-card svg {
  color: var(--pa-primary);
}

.quick-card span {
  color: var(--color-muted);
  font-size: 0.88rem;
  grid-column: 2;
}

.help-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
}

.tutorial-card,
.faq-card {
  display: grid;
  gap: 14px;
}

.video-frame {
  aspect-ratio: 16 / 9;
  background: #111;
  border-radius: 18px;
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
  border-radius: 16px;
  cursor: pointer;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 14px;
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
  font-weight: 760;
  margin-top: 8px;
}

.faq-item b {
  color: var(--pa-primary);
  font-size: 1.4rem;
  line-height: 1;
}

@media (max-width: 900px) {
  .pa-hero,
  .selected-row,
  .section-head,
  .quick-links,
  .help-grid {
    grid-template-columns: 1fr;
  }

  .pa-hero img {
    justify-self: start;
  }

  .person-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
