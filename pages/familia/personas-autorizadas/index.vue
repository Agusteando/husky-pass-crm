<template>
  <main class="pa-app" :style="themeVars" data-product-area="personas-autorizadas" data-product-screen="home">
    <header class="pa-topbar">
      <div class="pa-topbar-inner">
        <NuxtLink class="hp-brand" to="/familia/personas-autorizadas" aria-label="Husky Pass">
          <span class="brand-accent"></span>
          <img class="brand-logo" :class="`brand-logo-${theme.key}`" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        </NuxtLink>

        <label class="search-pill" aria-label="Buscar en Personas Autorizadas">
          <span class="search-icon" aria-hidden="true"></span>
          <input v-model="search" type="search" placeholder="Buscar" />
        </label>

        <div class="account-chip">
          <img class="account-mascot" :src="mascot" alt="" />
          <div>
            <strong>{{ accountTitle }}</strong>
            <small>{{ session?.user?.email || session?.user?.username || 'Familia' }}</small>
          </div>
          <button type="button" class="logout-link" data-diagnostic-action="logout" @click="logout">Cerrar sesion</button>
        </div>
      </div>
      <div class="colores-identidad"></div>
    </header>

    <div class="pa-shell">
      <aside class="pa-sidebar" aria-label="Navegacion Personas Autorizadas">
        <div class="institution-mark">
          <span>{{ institution }}</span>
        </div>
        <nav>
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            :class="{ active: activeSection === item.id }"
            :data-product-nav="item.id"
            @click="goToSection(item.id)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </aside>

      <section class="pa-content">
        <nav class="mobile-nav" aria-label="Secciones Personas Autorizadas">
          <button
            v-for="item in navItems"
            :key="`mobile-${item.id}`"
            type="button"
            :class="{ active: activeSection === item.id }"
            @click="goToSection(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>

        <p v-if="loadError" class="alert" data-state="error">No fue posible cargar Personas Autorizadas.</p>
        <div v-else-if="pending" class="loading-state" data-product-loading data-state="loading">
          <span></span>
          <strong>Cargando Personas Autorizadas...</strong>
        </div>

        <template v-else>
          <section class="banner-row" id="personas">
            <article class="level-banner">
              <div class="level-pattern"></div>
              <img :src="mascot" alt="" />
              <div>
                <strong>{{ institution }}</strong>
                <span>{{ levelName.spanish }}</span>
                <small>{{ levelName.english }}</small>
              </div>
            </article>
            <article class="action-banner">
              <div>
                <span>{{ contextLine }}</span>
                <strong>{{ mainReadinessLabel }}</strong>
                <small>{{ completedRegularCount }}/3 personas registradas - {{ expressReady ? 'Pase Express listo' : 'Pase Express disponible' }}</small>
              </div>
            </article>
          </section>

          <section class="pa-panel" data-product-panel="authorized-people" :data-state="completedCount ? 'content' : 'empty'">
            <div class="panel-copy">
              <h1>Personas Autorizadas</h1>
              <p>Administra 3 personas autorizadas y un Pase Express para tus hijos.</p>
              <button class="how-link" type="button" @click="goToSection('ayuda')">Como funciona?</button>
            </div>

            <div class="person-slots">
              <button
                v-for="person in filteredPeople"
                :key="person.indice"
                class="person-slot"
                :class="{ selected: selected?.indice === person.indice, empty: !person.id, express: person.indice === 4 }"
                type="button"
                :aria-pressed="selected?.indice === person.indice"
                data-diagnostic-action="seleccionar-persona-autorizada"
                @click="selectPerson(person)"
              >
                <span class="slot-photo">
                  <img v-if="photoUrl(person)" :src="photoUrl(person)" alt="" />
                  <span v-else-if="person.id">{{ initials(person) }}</span>
                  <span v-else class="slot-symbol">{{ person.indice === 4 ? 'EX' : '+' }}</span>
                </span>
                <span class="slot-footer">
                  <strong>{{ authorizedPersonLabel(person.indice) }}</strong>
                  <small>{{ person.id ? fullName(person) || 'Registro guardado' : person.indice === 4 ? 'Generar Pase Express' : 'Anadir persona autorizada' }}</small>
                </span>
              </button>
            </div>

            <div v-if="selected" class="selected-actions" data-product-panel="selected-authorized-person" :data-state="selected.id ? 'content' : 'empty'">
              <div>
                <span>{{ authorizedPersonLabel(selected.indice) }}</span>
                <strong>{{ fullName(selected) || 'Registro disponible' }}</strong>
                <small>{{ selected.parenP || 'Captura nombre, parentesco y foto para activar credencial.' }}</small>
              </div>
              <button class="btn btn-primary pa-primary" type="button" data-diagnostic-action="editar-persona-autorizada" @click="edit(selected)">
                {{ selected.id ? 'Editar' : selected.indice === 4 ? 'Generar' : 'Capturar' }}
              </button>
              <NuxtLink v-if="selected.id" class="btn btn-secondary" :to="`/familia/personas-autorizadas/${selected.id}/credencial`">Credencial</NuxtLink>
              <NuxtLink v-if="selected.id" class="btn btn-secondary" :to="`/familia/personas-autorizadas/${selected.id}/marbete`">Marbete</NuxtLink>
              <a v-if="selected.id" class="btn btn-secondary" :href="`/api/personas-autorizadas/marbete?id=${selected.id}&download=1`">Descargar</a>
              <button v-if="selected.id" class="btn btn-danger" type="button" data-diagnostic-action="eliminar-persona-autorizada" @click="remove(selected.id)">Eliminar</button>
            </div>
          </section>

          <FamilyAuthorizedPersonEditor
            v-if="editing"
            :person="editing"
            :label="authorizedPersonLabel(Number(editing.indice || 1))"
            :saving="saving"
            @save="save"
            @cancel="editing = null"
          />

          <p v-if="error" class="alert">{{ error }}</p>
          <p v-if="notice" class="notice">{{ notice }}</p>

          <section id="actualizar" class="section-surface student-surface" data-product-panel="student-data" :data-state="studentRows.length ? 'content' : 'empty'">
            <div class="section-title">
              <div>
                <span>Actualizar datos</span>
                <h2>Alumno y hermanos</h2>
              </div>
              <button class="btn btn-secondary compact" type="button" data-diagnostic-action="agregar-hermano" @click="addSibling">Vincular hermano</button>
            </div>

            <div class="student-list">
              <article v-for="(child, index) in studentRows" :key="child.id || `child-${index}`" class="student-form">
                <div class="student-index">{{ index + 1 }}</div>
                <div class="student-fields">
                  <label class="label">
                    Nombre(s)
                    <input v-model="child.nombreA" class="input" />
                  </label>
                  <label class="label">
                    Apellido paterno
                    <input v-model="child.paternoA" class="input" />
                  </label>
                  <label class="label">
                    Apellido materno
                    <input v-model="child.maternoA" class="input" />
                  </label>
                  <label class="label">
                    Nivel
                    <input v-model="child.nivelEdu" class="input" />
                  </label>
                  <label class="label">
                    Grado
                    <input v-model="child.grado" class="input" />
                  </label>
                  <label class="label">
                    Grupo
                    <input v-model="child.grupo" class="input" />
                  </label>
                  <label class="label">
                    Campus
                    <input v-model="child.campus" class="input" />
                  </label>
                  <label class="label">
                    Fecha
                    <input v-model="child.fechaA" class="input" type="date" />
                  </label>
                </div>
              </article>
            </div>

            <div class="section-actions">
              <button class="btn btn-primary pa-primary" type="button" :disabled="savingStudents" data-diagnostic-action="guardar-datos-alumno" @click="saveStudents">
                {{ savingStudents ? 'Guardando...' : 'Guardar datos' }}
              </button>
              <span>{{ derivedPlantelLabel }}</span>
            </div>
          </section>

          <section id="credencial" class="section-surface credential-surface" data-product-panel="credential-actions" :data-state="credentialPerson?.id ? 'content' : 'empty'">
            <div class="credential-copy">
              <span>Credencial</span>
              <h2>{{ credentialPerson?.id ? 'Lista para validar' : 'Pendiente de registro' }}</h2>
              <p>{{ credentialSummary }}</p>
            </div>
            <div class="credential-actions">
              <NuxtLink v-if="credentialPerson?.id" class="btn btn-primary pa-primary" :to="`/familia/personas-autorizadas/${credentialPerson.id}/credencial`">Abrir credencial</NuxtLink>
              <NuxtLink v-if="credentialPerson?.id" class="btn btn-secondary" :to="`/familia/personas-autorizadas/${credentialPerson.id}/marbete`">Previsualizar marbete</NuxtLink>
              <a v-if="credentialPerson?.id" class="btn btn-secondary" :href="`/api/personas-autorizadas/marbete?id=${credentialPerson.id}&download=1`">Descargar marbete</a>
              <button v-else class="btn btn-secondary" type="button" disabled data-unavailable-reason="Registra una persona autorizada primero">Registrar primero</button>
            </div>
          </section>

          <section id="hermanos" class="section-surface siblings-surface" data-product-panel="siblings" :data-state="children.length > 1 ? 'content' : 'empty'">
            <div class="section-title">
              <div>
                <span>Hermanos</span>
                <h2>{{ children.length > 1 ? `${children.length} alumnos vinculados` : 'Sin hermanos vinculados' }}</h2>
              </div>
              <button class="btn btn-secondary compact" type="button" @click="goToSection('actualizar')">Actualizar</button>
            </div>
            <div class="sibling-list">
              <article v-for="child in children" :key="child.id || childName(child)">
                <strong>{{ childName(child) || 'Alumno' }}</strong>
                <span>{{ [child.plantel, child.nivelEdu, child.grado, child.grupo].filter(Boolean).join(' / ') || 'Datos pendientes' }}</span>
              </article>
              <div v-if="!children.length" class="empty-inline">
                <img :src="mascot" alt="" />
                <p>Agrega datos de alumno para habilitar credenciales y marbetes.</p>
              </div>
            </div>
          </section>

          <section id="encuestas" class="section-surface survey-surface" :class="{ unavailable: !surveyAvailable }" data-product-panel="surveys" :data-state="surveyAvailable ? 'content' : 'unavailable'">
            <div class="section-title">
              <div>
                <span>Encuestas</span>
                <h2>{{ config?.survey.title || 'Encuesta Personas Autorizadas' }}</h2>
              </div>
              <span class="status-pill">{{ surveyAvailable ? 'Disponible' : 'No disponible' }}</span>
            </div>
            <iframe v-if="surveyAvailable" :src="config?.survey.embedUrl" title="Encuesta Personas Autorizadas" loading="lazy"></iframe>
            <p v-else>No hay encuesta activa en este momento. La seccion permanecera disponible cuando el colegio publique un formulario.</p>
          </section>

          <section id="ayuda" class="help-grid">
            <article class="section-surface tutorial-surface" data-product-panel="tutorial" data-state="content">
              <div class="section-title">
                <div>
                  <span>Tutorial</span>
                  <h2>Como funciona</h2>
                </div>
              </div>
              <div class="video-frame">
                <iframe src="https://www.youtube.com/embed/PMBQolTRysg" title="Tutorial Personas Autorizadas" allowfullscreen loading="lazy"></iframe>
              </div>
            </article>

            <article id="faq" class="section-surface faq-surface" data-product-panel="faq" data-state="content">
              <div class="section-title">
                <div>
                  <span>FAQ</span>
                  <h2>Preguntas frecuentes</h2>
                </div>
                <img :src="mascot" alt="" />
              </div>
              <div class="faq-list">
                <button
                  v-for="(item, index) in filteredFaq"
                  :key="item.question"
                  type="button"
                  :aria-expanded="openFaq === index"
                  @click="openFaq = openFaq === index ? null : index"
                >
                  <strong>{{ item.question }}</strong>
                  <span>{{ openFaq === index ? '-' : '+' }}</span>
                  <em v-if="openFaq === index">{{ item.answer }}</em>
                </button>
              </div>
            </article>
          </section>

          <section id="convenios" class="section-surface convenios-surface" :class="{ unavailable: !config?.conveniosUrl }" data-product-panel="convenios" :data-state="config?.conveniosUrl ? 'content' : 'unavailable'">
            <div>
              <span>Convenios IECS-IEDIS</span>
              <h2>Beneficios institucionales</h2>
              <p>{{ config?.conveniosUrl ? 'Consulta los convenios disponibles para familias.' : 'El colegio aun no ha publicado una liga de convenios en Husky Pass.' }}</p>
            </div>
            <a v-if="config?.conveniosUrl" class="btn btn-primary pa-primary" :href="config.conveniosUrl" target="_blank" rel="noopener noreferrer">Abrir convenios</a>
            <button v-else class="btn btn-secondary" type="button" disabled data-unavailable-reason="Sin liga configurada">Pendiente</button>
          </section>

          <footer class="pa-footer">
            <strong>IECS - IEDIS</strong>
            <span>Husky Pass</span>
          </footer>
        </template>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson, PersonasAutorizadasConfig } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { authorizedPersonLabel, normalizeVirtualAssetUrl } from '~/utils/daycare'
import { personasInstitutionName, personasLevelName, personasMascot, personasThemeStyle, resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const router = useRouter()
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'pa-session' })
const { data, refresh, pending, error: loadError } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family', { key: 'pa-family-people', timeout: 15000 })
const { data: config } = useFetch<PersonasAutorizadasConfig>('/api/personas-autorizadas/config', { key: 'pa-family-config', timeout: 15000 })

const editing = ref<Partial<AuthorizedPerson> | null>(null)
const saving = ref(false)
const savingStudents = ref(false)
const error = ref('')
const notice = ref('')
const search = ref('')
const selectedIndice = ref(normalizeIndice(route.query.persona))
const activeSection = ref('personas')
const studentRows = ref<AuthorizedChild[]>([])
const openFaq = ref<number | null>(0)

const navItems = [
  { id: 'personas', label: 'Personas Autorizadas', icon: 'PA' },
  { id: 'actualizar', label: 'Actualizar datos', icon: 'ED' },
  { id: 'credencial', label: 'Credencial', icon: 'ID' },
  { id: 'hermanos', label: 'Hermanos', icon: 'HM' },
  { id: 'encuestas', label: 'Encuestas', icon: 'SV' },
  { id: 'ayuda', label: 'Tutorial', icon: '?' },
  { id: 'convenios', label: 'Convenios IECS-IEDIS', icon: 'CV' },
  { id: 'faq', label: 'FAQ', icon: '!' }
]

const faqItems = [
  {
    question: 'Que es Personas Autorizadas?',
    answer: 'Es el modulo para registrar quienes pueden entregar o recoger al alumno con validacion QR.'
  },
  {
    question: 'Cuantas personas puedo registrar?',
    answer: 'Puedes mantener tres personas autorizadas y un Pase Express para situaciones temporales.'
  },
  {
    question: 'Que foto debo usar?',
    answer: 'Usa una fotografia clara de frente. El procesamiento Vision ayuda a recortar rostro y preparar la imagen para marbete.'
  },
  {
    question: 'Para que sirve el Pase Express?',
    answer: 'Permite generar un registro temporal cuando las personas autorizadas habituales no estan disponibles.'
  },
  {
    question: 'Como descargo el marbete?',
    answer: 'Selecciona una persona registrada y usa Marbete o Descargar. El formato usa el plantel y nivel del alumno.'
  },
  {
    question: 'Que hago si faltan datos del alumno?',
    answer: 'Abre Actualizar datos, completa nivel, grado, grupo y campus, y guarda antes de generar credenciales.'
  }
]

const people = computed(() => data.value || [])
const children = computed<AuthorizedChild[]>(() => people.value.find((person) => person.children?.length)?.children || [])
const primaryChild = computed(() => children.value[0] || null)
const theme = computed(() => resolvePersonasTheme({
  plantel: primaryChild.value?.plantel || session.value?.user?.plantel?.[0],
  nivelEdu: primaryChild.value?.nivelEdu,
  campus: primaryChild.value?.campus || session.value?.user?.campus
}))
const themeVars = computed(() => personasThemeStyle(theme.value))
const mascot = computed(() => personasMascot(theme.value))
const levelName = computed(() => personasLevelName(theme.value))
const institution = computed(() => personasInstitutionName(theme.value))
const completedCount = computed(() => people.value.filter((person) => person.id).length)
const completedRegularCount = computed(() => people.value.filter((person) => person.id && person.indice < 4).length)
const expressReady = computed(() => people.value.some((person) => person.id && person.indice === 4))
const selected = computed(() => people.value.find((person) => person.indice === selectedIndice.value) || people.value.find((person) => person.id) || people.value[0] || null)
const credentialPerson = computed(() => selected.value?.id ? selected.value : people.value.find((person) => person.id) || null)
const filteredPeople = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return people.value
  return people.value.filter((person) => [authorizedPersonLabel(person.indice), fullName(person), person.parenP].join(' ').toLowerCase().includes(term))
})
const filteredFaq = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return faqItems
  return faqItems.filter((item) => `${item.question} ${item.answer}`.toLowerCase().includes(term))
})
const accountTitle = computed(() => `${institution.value} - Padre de Familia`)
const contextLine = computed(() => {
  const child = primaryChild.value
  const parts = [child?.plantel, child?.nivelEdu, child?.grado, child?.grupo].filter(Boolean)
  return parts.length ? parts.join(' / ') : 'Datos de alumno pendientes'
})
const mainReadinessLabel = computed(() => {
  if (!children.value.length) return 'Completa datos del alumno'
  if (!completedRegularCount.value) return 'Registra personas autorizadas'
  if (!credentialPerson.value?.compressed_foto && !credentialPerson.value?.foto) return 'Agrega foto para credencial'
  return 'Credenciales listas'
})
const derivedPlantelLabel = computed(() => `Plantel detectado: ${primaryChild.value?.plantel || session.value?.user?.plantel?.[0] || 'pendiente'}`)
const surveyAvailable = computed(() => Boolean(config.value?.survey.enabled && config.value?.survey.embedUrl))
const credentialSummary = computed(() => {
  if (!credentialPerson.value?.id) return 'Registra al menos una persona autorizada para habilitar QR, credencial y marbete.'
  return `${authorizedPersonLabel(credentialPerson.value.indice)} - ${contextLine.value}`
})

watch(() => route.query.persona, (value) => {
  const next = normalizeIndice(value)
  if (next !== selectedIndice.value) selectedIndice.value = next
})

watch(people, (value) => {
  if (!value.length) return
  if (!value.some((person) => person.indice === selectedIndice.value)) selectedIndice.value = value[0]?.indice || 1
}, { immediate: true })

watch(children, (value) => {
  studentRows.value = value.length ? value.map((child) => ({ ...child, fechaA: dateOnly(child.fechaA) })) : [emptyStudent()]
}, { immediate: true, deep: true })

function emptyStudent(): AuthorizedChild {
  return {
    nombreA: '',
    paternoA: '',
    maternoA: '',
    nivelEdu: '',
    grado: '',
    grupo: '',
    campus: session.value?.user?.campus || '',
    fechaA: new Date().toISOString().slice(0, 10)
  }
}

function dateOnly(value?: string | null) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value || ''))
  return match?.[1] || ''
}

function fullName(person: AuthorizedPerson | Partial<AuthorizedPerson>) {
  return [person.nombreP, person.paternoP, person.maternoP].filter(Boolean).join(' ')
}

function childName(child: AuthorizedChild) {
  return [child.nombreA, child.paternoA, child.maternoA].filter(Boolean).join(' ')
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
    fechaP: dateOnly(person.fechaP) || new Date().toISOString().slice(0, 10),
    children: children.value.length ? children.value.map((child) => ({ ...child, fechaA: dateOnly(child.fechaA) })) : [emptyStudent()]
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

function addSibling() {
  studentRows.value.push(emptyStudent())
  activeSection.value = 'actualizar'
}

async function saveStudents() {
  savingStudents.value = true
  error.value = ''
  notice.value = ''
  try {
    const children = studentRows.value.filter((child) => [child.nombreA, child.paternoA, child.maternoA, child.nivelEdu, child.grado, child.grupo, child.campus].some(Boolean))
    await $fetch('/api/personas-autorizadas/student', { method: 'POST', body: { children } })
    await refresh()
    notice.value = 'Datos de alumno actualizados.'
  } catch (err: unknown) {
    const failure = err as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value = failure?.data?.statusMessage || failure?.statusMessage || failure?.message || 'No fue posible guardar datos de alumno.'
  } finally {
    savingStudents.value = false
  }
}

function goToSection(id: string) {
  activeSection.value = id
  if (!import.meta.client) return
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}

function normalizeIndice(value: unknown) {
  const parsed = Number(Array.isArray(value) ? value[0] : value || 1)
  return parsed >= 1 && parsed <= 4 ? parsed : 1
}
</script>

<style scoped>
.pa-app {
  --pa-primary: #618b2f;
  --pa-primary-rgb: 97, 139, 47;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  --pa-gray: #50535a;
  --pa-muted: #86888c;
  background: #f4f4f4;
  color: var(--pa-gray);
  min-height: 100vh;
}

.pa-topbar {
  background: #fff;
  border-bottom: 1px solid #ececec;
}

.pa-topbar-inner {
  align-items: center;
  display: grid;
  gap: 20px;
  grid-template-columns: 210px minmax(180px, 520px) minmax(220px, 1fr);
  min-height: 104px;
  padding: 0 42px;
}

.hp-brand {
  align-items: center;
  display: inline-grid;
  justify-self: center;
  position: relative;
}

.brand-accent {
  background: var(--pa-primary);
  border-radius: 999px;
  height: 38px;
  opacity: 0.2;
  position: absolute;
  right: -14px;
  top: 14px;
  width: 38px;
}

.brand-logo {
  display: block;
  position: relative;
  width: 118px;
  z-index: 1;
}

.brand-logo-daycare { filter: hue-rotate(46deg) saturate(1.15); }
.brand-logo-preescolar { filter: hue-rotate(142deg) saturate(1.35); }
.brand-logo-primaria { filter: hue-rotate(210deg) saturate(1.45); }
.brand-logo-secundaria,
.brand-logo-iedis { filter: saturate(1.12); }

.search-pill {
  align-items: center;
  background: #f4f4f4;
  border-radius: 999px;
  color: #858585;
  display: grid;
  gap: 14px;
  grid-template-columns: auto minmax(0, 1fr);
  min-height: 54px;
  padding: 0 26px;
}

.search-icon {
  border: 4px solid #858585;
  border-radius: 50%;
  display: inline-block;
  height: 20px;
  position: relative;
  width: 20px;
}

.search-icon::after {
  background: #858585;
  border-radius: 999px;
  content: "";
  height: 4px;
  position: absolute;
  right: -11px;
  top: 13px;
  transform: rotate(45deg);
  width: 13px;
}

.search-pill input {
  background: transparent;
  border: 0;
  color: #50535a;
  font-size: 1.05rem;
  outline: 0;
  width: 100%;
}

.account-chip {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, auto) auto;
  justify-content: end;
  min-width: 0;
}

.account-mascot {
  background: rgba(var(--pa-primary-rgb), 0.9);
  border-radius: 50%;
  height: 42px;
  object-fit: cover;
  object-position: top center;
  width: 42px;
}

.account-chip strong,
.account-chip small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-chip strong {
  color: #50535a;
  font-size: 1rem;
}

.account-chip small {
  color: #86888c;
  font-size: 0.82rem;
}

.logout-link {
  background: transparent;
  border: 0;
  color: #50535a;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 850;
  text-decoration: underline;
}

.colores-identidad {
  height: 20px;
  margin-top: 20px;
  left: 0px;
  width: 100%;
  background: linear-gradient(to right, rgb(161, 206, 88), rgb(239, 75, 75), rgb(254, 198, 62), rgb(90, 166, 219));
  transition: background 0.5s;
}

.pa-shell {
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
}

.pa-sidebar {
  background: #fff;
  border-right: 1px solid #e0e0e0;
  min-height: calc(100vh - 144px);
  padding: 54px 0 28px;
}

.institution-mark {
  display: grid;
  justify-items: center;
  margin-bottom: 36px;
}

.institution-mark span {
  border: 3px solid var(--pa-primary);
  border-radius: 22px;
  color: var(--pa-primary);
  display: grid;
  font-size: 2rem;
  font-weight: 950;
  height: 112px;
  letter-spacing: 0.03em;
  place-items: center;
  width: 112px;
}

.pa-sidebar nav {
  display: grid;
  gap: 12px;
}

.pa-sidebar button {
  align-items: center;
  background: transparent;
  border: 0;
  color: #86888c;
  cursor: pointer;
  display: grid;
  font-size: 1rem;
  font-weight: 750;
  gap: 10px;
  grid-template-columns: 28px minmax(0, 1fr);
  min-height: 42px;
  padding: 0 20px 0 34px;
  position: relative;
  text-align: left;
}

.pa-sidebar button.active,
.pa-sidebar button:hover {
  color: var(--pa-primary);
}

.pa-sidebar button.active::after {
  background: var(--pa-primary);
  border-radius: 12px 0 0 12px;
  content: "";
  height: 54px;
  position: absolute;
  right: 0;
  width: 10px;
}

.nav-icon {
  font-size: 1.25rem;
  line-height: 1;
  text-align: center;
}

.pa-content {
  display: grid;
  gap: 18px;
  padding: 42px 42px 26px;
}

.mobile-nav {
  display: none;
}

.loading-state {
  align-items: center;
  background: #fff;
  border: 1px solid #d9e5ee;
  border-radius: 20px;
  display: flex;
  gap: 12px;
  padding: 18px;
}

.loading-state span {
  animation: pulse 0.9s ease-in-out infinite alternate;
  background: var(--pa-primary);
  border-radius: 999px;
  height: 14px;
  width: 14px;
}

.banner-row {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(320px, 0.92fr) minmax(320px, 0.92fr);
}

.level-banner,
.action-banner {
  border-radius: 28px;
  box-shadow: 0 12px 22px rgba(80, 83, 90, 0.12);
  min-height: 140px;
  overflow: hidden;
}

.level-banner {
  align-items: center;
  background:
    linear-gradient(90deg, rgba(var(--pa-primary-rgb), 0.86), rgba(var(--pa-primary-rgb), 0.75)),
    #66a8d8;
  color: var(--pa-contrast);
  display: grid;
  gap: 22px;
  grid-template-columns: 170px minmax(0, 1fr);
  padding: 0 34px;
  position: relative;
}

.level-pattern {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.24) 1px, transparent 2px);
  background-size: 16px 16px;
  inset: 0;
  opacity: 0.5;
  position: absolute;
}

.level-banner img {
  align-self: end;
  height: 142px;
  object-fit: contain;
  position: relative;
  z-index: 1;
}

.level-banner div:last-child {
  display: grid;
  gap: 2px;
  position: relative;
  z-index: 1;
}

.level-banner strong {
  font-size: 2.15rem;
  line-height: 1;
}

.level-banner span {
  font-size: 1.15rem;
  font-weight: 950;
  text-transform: uppercase;
}

.level-banner small {
  font-size: 1rem;
}

.action-banner {
  align-items: end;
  background:
    linear-gradient(90deg, rgba(0, 127, 146, 0.68), rgba(var(--pa-primary-rgb), 0.72)),
    linear-gradient(135deg, #394c59, #90cdd6);
  color: #fff;
  display: grid;
  padding: 26px 34px;
}

.action-banner div {
  display: grid;
  gap: 4px;
}

.action-banner span,
.action-banner small {
  font-weight: 850;
  opacity: 0.9;
}

.action-banner strong {
  font-size: 1.7rem;
  line-height: 1.05;
}

.pa-panel,
.section-surface {
  background: #fff;
  border: 4px solid #dbe8f0;
  border-radius: 26px;
}

.pa-panel {
  display: grid;
  gap: 24px;
  justify-items: center;
  padding: 36px 28px 26px;
}

.panel-copy {
  display: grid;
  gap: 8px;
  justify-items: center;
  text-align: center;
}

.panel-copy h1 {
  color: #50535a;
  font-family: Fredoka, Inter, sans-serif;
  font-size: 1.8rem;
  line-height: 1;
  margin-bottom: 0;
}

.panel-copy p {
  color: #76787d;
  font-size: 1rem;
}

.how-link {
  background: transparent;
  border: 0;
  color: var(--pa-primary);
  cursor: pointer;
  font-weight: 950;
  text-decoration: underline;
}

.person-slots {
  display: grid;
  gap: 28px;
  grid-template-columns: repeat(4, 150px);
  justify-content: center;
}

.person-slot {
  background: transparent;
  border: 0;
  cursor: pointer;
  display: grid;
  gap: 0;
  padding: 0;
  text-align: center;
}

.slot-photo {
  align-items: center;
  aspect-ratio: 1;
  background: #c9c9c9;
  border: 2px solid transparent;
  border-radius: 18px 18px 0 0;
  color: #626262;
  display: grid;
  font-size: 2.2rem;
  font-weight: 950;
  justify-items: center;
  overflow: hidden;
}

.person-slot.selected .slot-photo,
.person-slot:hover .slot-photo {
  border-color: var(--pa-primary);
}

.slot-photo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.slot-symbol {
  font-size: 3.2rem;
  line-height: 1;
}

.slot-footer {
  background: var(--pa-primary);
  border-radius: 0 0 18px 18px;
  color: var(--pa-contrast);
  display: grid;
  gap: 1px;
  min-height: 38px;
  padding: 6px 8px;
}

.person-slot.empty .slot-footer,
.person-slot.express.empty .slot-footer {
  background: #bdbdbd;
  color: #50535a;
}

.slot-footer strong {
  font-size: 0.78rem;
  text-transform: uppercase;
}

.slot-footer small {
  font-size: 0.7rem;
  font-weight: 800;
}

.selected-actions {
  align-items: center;
  background: rgba(var(--pa-primary-rgb), 0.07);
  border: 1px solid var(--pa-border);
  border-radius: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  width: min(100%, 860px);
}

.selected-actions div {
  display: grid;
  flex: 1 1 220px;
  gap: 2px;
}

.selected-actions span {
  color: var(--pa-primary);
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.selected-actions small {
  color: var(--pa-muted);
}

.pa-primary {
  background: var(--pa-primary);
  color: var(--pa-contrast);
  box-shadow: 0 10px 20px rgba(var(--pa-primary-rgb), 0.2);
}

.notice {
  background: rgba(var(--pa-primary-rgb), 0.08);
  border: 1px solid var(--pa-border);
  border-radius: 14px;
  color: var(--pa-gray);
  font-weight: 850;
  margin: 0;
  padding: 10px 12px;
}

.section-surface {
  border-width: 1px;
  box-shadow: 0 8px 18px rgba(80, 83, 90, 0.08);
  display: grid;
  gap: 18px;
  padding: 20px;
  scroll-margin-top: 24px;
}

.section-title {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.section-title span,
.credential-copy span,
.convenios-surface span {
  color: var(--pa-primary);
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.section-title h2,
.credential-copy h2,
.convenios-surface h2 {
  color: #50535a;
  font-size: 1.25rem;
  line-height: 1.1;
  margin-bottom: 0;
}

.compact {
  min-height: 34px;
  padding-inline: 12px;
}

.student-list {
  display: grid;
  gap: 12px;
}

.student-form {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr);
}

.student-index {
  background: var(--pa-primary);
  border-radius: 14px;
  color: var(--pa-contrast);
  display: grid;
  font-weight: 950;
  height: 42px;
  place-items: center;
  width: 42px;
}

.student-fields {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.section-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
}

.section-actions span {
  color: var(--pa-muted);
  font-weight: 850;
}

.credential-surface,
.convenios-surface {
  align-items: center;
  grid-template-columns: minmax(0, 1fr) auto;
}

.credential-copy,
.convenios-surface div {
  display: grid;
  gap: 5px;
}

.credential-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: end;
}

.sibling-list {
  display: grid;
  gap: 8px;
}

.sibling-list article {
  background: rgba(var(--pa-primary-rgb), 0.06);
  border: 1px solid var(--pa-border);
  border-radius: 16px;
  display: grid;
  gap: 2px;
  padding: 12px;
}

.sibling-list span,
.empty-inline p,
.credential-copy p,
.convenios-surface p,
.survey-surface p {
  color: #76787d;
}

.empty-inline {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: 76px minmax(0, 1fr);
}

.empty-inline img {
  height: 76px;
  object-fit: contain;
}

.status-pill {
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 999px;
  color: var(--pa-gray);
  font-size: 0.76rem;
  font-weight: 950;
  padding: 6px 10px;
}

.survey-surface iframe {
  border: 0;
  border-radius: 16px;
  height: 520px;
  width: 100%;
}

.unavailable {
  background: #f3f3f3;
  border-color: #dddddd;
  color: #86888c;
}

.help-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.8fr);
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

.faq-surface .section-title img {
  height: 74px;
  object-fit: contain;
}

.faq-list {
  display: grid;
  gap: 8px;
}

.faq-list button {
  background: #fff;
  border: 1px solid #e3e3e3;
  border-radius: 14px;
  color: #50535a;
  cursor: pointer;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px;
  text-align: left;
}

.faq-list button:hover {
  border-color: var(--pa-primary);
}

.faq-list em {
  color: #76787d;
  font-style: normal;
  grid-column: 1 / -1;
  line-height: 1.45;
}

.pa-footer {
  align-items: center;
  color: #747474;
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 8px 0 4px;
}

@keyframes pulse {
  from { opacity: 0.35; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 1180px) {
  .pa-topbar-inner {
    grid-template-columns: 160px minmax(180px, 1fr) auto;
    padding-inline: 22px;
  }

  .banner-row,
  .help-grid,
  .credential-surface,
  .convenios-surface {
    grid-template-columns: 1fr;
  }

  .person-slots {
    grid-template-columns: repeat(2, 150px);
  }

  .credential-actions {
    justify-content: start;
  }

  .student-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .pa-topbar-inner {
    grid-template-columns: auto 1fr;
    min-height: 88px;
  }

  .search-pill {
    grid-column: 1 / -1;
    min-height: 44px;
    order: 3;
  }

  .account-chip {
    grid-template-columns: 34px auto;
  }

  .account-chip .logout-link {
    grid-column: 2;
    justify-self: start;
  }

  .account-chip small {
    display: none;
  }

  .account-mascot {
    height: 34px;
    width: 34px;
  }

  .pa-shell {
    grid-template-columns: 1fr;
  }

  .pa-sidebar {
    display: none;
  }

  .pa-content {
    padding: 18px 12px 24px;
  }

  .mobile-nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .mobile-nav button {
    background: #fff;
    border: 1px solid #e3e3e3;
    border-radius: 999px;
    color: #86888c;
    cursor: pointer;
    flex: 0 0 auto;
    font-weight: 850;
    min-height: 36px;
    padding: 0 12px;
  }

  .mobile-nav button.active {
    background: var(--pa-primary);
    border-color: var(--pa-primary);
    color: var(--pa-contrast);
  }

  .level-banner {
    grid-template-columns: 96px minmax(0, 1fr);
    min-height: 116px;
    padding: 0 18px;
  }

  .level-banner img {
    height: 104px;
  }

  .level-banner strong {
    font-size: 1.55rem;
  }

  .action-banner {
    min-height: 116px;
    padding: 20px;
  }

  .pa-panel {
    padding: 24px 14px 18px;
  }
}

@media (max-width: 560px) {
  .pa-topbar-inner {
    gap: 10px;
    padding-inline: 12px;
  }

  .brand-logo {
    width: 94px;
  }

  .account-chip strong {
    font-size: 0.82rem;
    max-width: 160px;
  }

  .colores-identidad {
    margin-top: 12px;
  }

  .banner-row {
    gap: 12px;
  }

  .person-slots {
    gap: 14px;
    grid-template-columns: repeat(2, minmax(118px, 1fr));
    width: 100%;
  }

  .student-form,
  .student-fields,
  .selected-actions {
    grid-template-columns: 1fr;
  }

  .student-index {
    height: 34px;
    width: 34px;
  }

  .section-title,
  .section-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
