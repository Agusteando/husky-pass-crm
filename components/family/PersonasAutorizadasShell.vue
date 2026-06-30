<template>
  <main class="pa-shell-app" :style="themeVars" data-product-area="personas-autorizadas">
    <header ref="topbarRef" class="pa-product-topbar" :data-density="topbarDensity">
      <div class="pa-topbar-brand-zone">
        <NuxtLink class="pa-brand" to="/familia/personas-autorizadas" :aria-label="`${institution} Husky Pass Personas Autorizadas`">
          <span class="pa-product-lockup">
            <img class="pa-institution-logo" :src="institutionLogo" :alt="institution" />
            <span class="pa-lockup-divider" aria-hidden="true"></span>
            <img class="pa-husky-pass-logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
          </span>
        </NuxtLink>
      </div>

      <section class="pa-topbar-search" aria-label="Búsqueda de Husky Pass" @keydown="onSearchKeydown" @focusout="onSearchFocusout">
        <div class="pa-search-control" :class="{ 'is-open': searchOpen }">
          <FamilyPersonasIcon name="search" />
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="search"
            autocomplete="off"
            spellcheck="false"
            placeholder="Buscar"
            aria-label="Buscar estudiante, persona o sección"
            :aria-expanded="searchOpen"
            aria-controls="pa-topbar-search-panel"
            @focus="openSearch"
            @input="openSearch"
          />
          <button v-if="searchQuery" type="button" aria-label="Limpiar búsqueda" @click="clearSearch">
            ×
          </button>
        </div>

        <div v-if="searchOpen" id="pa-topbar-search-panel" class="pa-search-panel" role="listbox">
          <div v-if="searchResultGroups.length" class="pa-search-groups">
            <section v-for="group in searchResultGroups" :key="group.key" class="pa-search-group">
              <span class="pa-search-group-label">{{ group.label }}</span>
              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                class="pa-search-result"
                :class="{ active: activeSearchId === item.id }"
                role="option"
                :aria-selected="activeSearchId === item.id"
                @mousedown.prevent="runSearchResult(item)"
              >
                <span class="pa-search-result-icon" :data-result-kind="item.kind">
                  <img v-if="item.photo" :src="item.photo" alt="" />
                  <FamilyPersonasIcon v-else :name="item.icon" />
                </span>
                <span class="pa-search-result-copy">
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.detail }}</small>
                </span>
              </button>
            </section>
          </div>
          <p v-else class="pa-search-empty">Sin resultados</p>
        </div>
      </section>

      <nav class="pa-topbar-quick-nav" aria-label="Accesos principales Husky Pass">
        <NuxtLink
          v-for="item in topbarItems"
          :key="`topbar-${item.to}`"
          :to="item.to"
          :class="{ active: isActive(item) }"
          :data-product-nav="`topbar-${item.key}`"
          :aria-label="item.label"
          :title="item.label"
        >
          <span class="pa-quick-icon" aria-hidden="true"><FamilyPersonasIcon :name="item.icon" /></span>
          <span>{{ item.shortLabel || item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="pa-topbar-controls">
        <NuxtLink class="pa-topbar-icon-link pa-notification-link" to="/familia/comunicados" :aria-label="communicationNotificationLabel" title="Notificaciones">
          <FamilyPersonasIcon name="bell" />
          <span v-if="unreadCommunications">{{ communicationBadge }}</span>
        </NuxtLink>
        <div v-if="primaryChild" class="pa-student-account-menu">
          <button
            class="pa-student-account-trigger"
            type="button"
            :aria-expanded="studentMenuOpen"
            :aria-label="`Abrir menú familiar de ${studentName || 'alumno'}`"
            :style="studentAccountStyle"
            @click="studentMenuOpen = !studentMenuOpen"
          >
            <span v-if="hasGroupSigil" class="pa-student-watermark-mask" aria-hidden="true"></span>
            <span v-if="gradeNumber" class="pa-student-watermark-grade" aria-hidden="true">{{ gradeNumber }}</span>
            <span class="pa-student-avatar-wrap">
              <span class="pa-student-avatar">
                <FamilyPersonasProcessedPhoto v-if="studentPhoto" :src="studentPhoto" namespace="pa-active-student-account" />
                <b v-else>{{ studentInitials }}</b>
              </span>
              <span class="pa-presence-dot" aria-hidden="true"></span>
            </span>
            <span class="pa-student-copy">
              <strong>{{ studentName || 'Alumno' }}</strong>
            </span>
            <FamilyPersonasIcon name="chevron" />
          </button>

          <div v-if="studentMenuOpen" class="pa-student-account-popover" role="menu">
            <div class="pa-account-summary">
              <span class="pa-account-summary-photo">
                <FamilyPersonasProcessedPhoto v-if="studentPhoto" :src="studentPhoto" namespace="pa-active-student-menu" />
                <b v-else>{{ studentInitials }}</b>
              </span>
              <span>
                <strong>{{ studentName || 'Alumno' }}</strong>
                <small>{{ accountDetail }}</small>
              </span>
            </div>

            <section v-if="children.length > 1" class="pa-student-switcher" aria-label="Cambiar estudiante">
              <button
                v-for="child in children"
                :key="child.matricula || child.id || childName(child)"
                type="button"
                class="pa-student-switcher-row"
                :class="{ active: isSelectedChild(child) }"
                role="menuitem"
                @click="selectChild(child)"
              >
                <span>{{ childInitials(child) }}</span>
                <strong>{{ childName(child) }}</strong>
              </button>
            </section>

            <NuxtLink class="pa-account-menu-item" :to="paSecurityRoute" role="menuitem" @click="studentMenuOpen = false">
              <FamilyPersonasIcon name="security" />
              <span>Seguridad</span>
            </NuxtLink>

            <button v-if="session?.user?.impersonation" class="pa-account-menu-item" type="button" role="menuitem" data-diagnostic-action="terminar-impersonacion" @click="exitImpersonation">
              <FamilyPersonasIcon name="arrow" />
              <span>Volver a admin</span>
            </button>

            <button class="pa-account-menu-item danger" type="button" role="menuitem" data-diagnostic-action="logout" @click="logout">
              <FamilyPersonasIcon name="exit" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="pa-product-layout">
      <aside class="pa-product-nav" aria-label="Navegación Personas Autorizadas">
        <nav>
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="pa-nav-link"
            :class="{ active: isActive(item) }"
            :data-product-nav="item.key"
          >
            <span class="pa-nav-icon"><FamilyPersonasIcon :name="item.icon" /></span>
            <span class="pa-nav-label">{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <section class="pa-help-card" aria-label="Centro de ayuda">
          <div class="pa-help-ambassador" aria-hidden="true">
            <FamilyPersonasAmbassador :theme="theme" variant="help" compact contained decorative />
          </div>
          <div class="pa-help-copy">
            <strong>¿Necesitas ayuda?</strong>
            <span>Consulta la guía o contacta a tu colegio.</span>
          </div>
          <NuxtLink to="/familia/personas-autorizadas#ayuda">Centro de ayuda</NuxtLink>
        </section>
      </aside>

      <section class="pa-route-content">
        <nav class="pa-mobile-nav" aria-label="Secciones Personas Autorizadas">
          <NuxtLink
            v-for="item in navItems"
            :key="`mobile-${item.to}`"
            :to="item.to"
            :class="{ active: isActive(item) }"
            :data-product-mobile-nav="item.key"
          >
            <FamilyPersonasIcon :name="item.icon" />
            <span>{{ item.shortLabel || item.label }}</span>
          </NuxtLink>
        </nav>
        <slot />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute } from 'nuxt/app'
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import { normalizeVirtualAssetUrl } from '~/utils/daycare'
import { defaultLoginRouteForExperience } from '~/utils/experienceIdentity'
import { personasInstitutionLogo, personasInstitutionName } from '~/utils/personasTheme'
import { personasFamilyThemeContextKey, usePersonasFamilyTheme } from '~/composables/usePersonasTheme'
import { resolveGrupoIcon, type GrupoIconManifest } from '~/utils/grupoIcons'
import { normalizeMatricula } from '~/utils/matricula'
import { anonymousSession, setCachedRouteSession } from '~/utils/routeSession'

withDefaults(defineProps<{ title?: string }>(), { title: 'Personas Autorizadas' })

type TopbarSearchKind = 'student' | 'person' | 'action'
type TopbarSearchResult = {
  id: string
  kind: TopbarSearchKind
  label: string
  detail: string
  icon: string
  keywords: string
  to?: string
  matricula?: string
  photo?: string
}

const route = useRoute()
const selectedMatricula = ref<string | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const topbarRef = ref<HTMLElement | null>(null)
type TopbarDensity = 'comfortable' | 'compact' | 'condensed' | 'stacked'
const topbarDensity = ref<TopbarDensity>('comfortable')
let topbarResizeObserver: ResizeObserver | null = null
const searchOpen = ref(false)
const searchQuery = ref('')
const activeSearchId = ref('')
const studentMenuOpen = ref(false)
const { session, people, children, primaryChild, studentName, studentPhoto, theme, themeVars } = usePersonasFamilyTheme({ key: 'shell', selectedMatricula })
provide(personasFamilyThemeContextKey, { theme })

const studentInitials = computed(() => initialsFromName(studentName.value || 'A'))
const studentFirstName = computed(() => String(primaryChild.value?.nombreA || studentName.value || 'tu familia').split(/\s+/).filter(Boolean)[0] || 'tu familia')
const accountDetail = computed(() => primaryChild.value ? `${primaryChild.value.parentRole || 'Familia'} de ${studentFirstName.value}` : 'Cuenta familiar')
const institution = computed(() => personasInstitutionName(theme.value))
const institutionLogo = computed(() => personasInstitutionLogo(theme.value))
const rawStudentGroup = computed(() => String(primaryChild.value?.grupo || '').replace(/^grupo\s+/i, '').trim())
const gradeNumber = computed(() => formatGradeNumber(primaryChild.value?.grado))
const { data: grupoManifest } = useFetch<GrupoIconManifest>('/grupo-icons/manifest.json', {
  key: 'pa-shell-grupo-icons',
  lazy: true,
  server: false,
  default: () => ({ fallbackGrupo: '', entries: [] })
})
const groupIcon = computed(() => resolveGrupoIcon(grupoManifest.value, rawStudentGroup.value))
const hasGroupSigil = computed(() => Boolean(rawStudentGroup.value && groupIcon.value.maskImage && !groupIcon.value.fallback))
const studentAccountStyle = computed(() => ({
  '--pa-group-mask': hasGroupSigil.value ? `url("${groupIcon.value.maskImage}")` : 'none'
}))
const paSecurityRoute = '/familia/personas-autorizadas/seguridad'
const { data: communicationsSummary } = useFetch<{ unread: number; total: number }>('/api/family/comunicados/summary', {
  key: 'pa-shell-communications-summary',
  lazy: true,
  server: false,
  default: () => ({ unread: 0, total: 0 })
})
const unreadCommunications = computed(() => Math.max(0, Number(communicationsSummary.value?.unread || 0)))
const communicationBadge = computed(() => unreadCommunications.value > 9 ? '9+' : String(unreadCommunications.value))
const communicationNotificationLabel = computed(() => {
  if (!unreadCommunications.value) return 'Abrir comunicados recientes'
  return `Abrir comunicados recientes, ${unreadCommunications.value} sin leer`
})

const navItems = [
  { key: 'inicio', label: 'Inicio', shortLabel: 'Inicio', icon: 'home', to: '/familia' },
  { key: 'personas', label: 'Personas autorizadas', shortLabel: 'Personas', icon: 'people', to: '/familia/personas-autorizadas' },
  { key: 'comunicados', label: 'Comunicados', shortLabel: 'Comunicados', icon: 'announcement', to: '/familia/comunicados' },
  { key: 'pagos', label: 'Pagos', shortLabel: 'Pagos', icon: 'payments', to: '/familia/pagos' },
  { key: 'actualizar', label: 'Datos del alumno', shortLabel: 'Datos', icon: 'edit', to: '/familia/personas-autorizadas/actualizar-datos' },
  { key: 'credencializacion', label: 'Foto del alumno', shortLabel: 'Foto', icon: 'camera', to: '/familia/personas-autorizadas/credencializacion' },
  { key: 'hermanos', label: 'Hermanos', shortLabel: 'Hermanos', icon: 'siblings', to: '/familia/personas-autorizadas/hermanos' },
  { key: 'asistencia', label: 'Asistencia', shortLabel: 'Asistencia', icon: 'calendar', to: '/familia/asistencia' },
  { key: 'encuestas', label: 'Encuestas', shortLabel: 'Encuestas', icon: 'survey', to: '/familia/personas-autorizadas/encuestas' },
  { key: 'convenios', label: 'Convenios', shortLabel: 'Convenios', icon: 'handshake', to: '/familia/personas-autorizadas/convenios' },
  { key: 'seguridad', label: 'Seguridad', shortLabel: 'Seguridad', icon: 'security', to: paSecurityRoute }
]
const topbarItems = computed(() => navItems.filter((item) => ['asistencia', 'comunicados', 'pagos'].includes(item.key)))

const searchResults = computed<TopbarSearchResult[]>(() => {
  const candidates = [
    ...studentSearchResults.value,
    ...personSearchResults.value,
    ...actionSearchResults.value
  ]
  const query = normalizeSearch(searchQuery.value)
  if (!query) return candidates.slice(0, 9)
  return candidates
    .map((item) => ({ item, score: scoreSearchResult(item, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label, 'es'))
    .slice(0, 10)
    .map((entry) => entry.item)
})

const searchResultGroups = computed(() => {
  const labels: Record<TopbarSearchKind, string> = {
    student: 'Estudiantes',
    person: 'Personas',
    action: 'Secciones'
  }
  return (['student', 'person', 'action'] as TopbarSearchKind[])
    .map((key) => ({ key, label: labels[key], items: searchResults.value.filter((item) => item.kind === key) }))
    .filter((group) => group.items.length)
})

const studentSearchResults = computed<TopbarSearchResult[]>(() => children.value.map((child) => {
  const name = childName(child)
  const matricula = normalizeMatricula(child.matricula)
  return {
    id: `student-${matricula || child.id || name}`,
    kind: 'student' as const,
    label: name,
    detail: matricula || 'Estudiante',
    icon: 'person',
    keywords: [name, matricula, child.grado, child.grupo, child.plantel].filter(Boolean).join(' '),
    matricula,
    photo: normalizeVirtualAssetUrl(child.foto || '')
  }
}))

const personSearchResults = computed<TopbarSearchResult[]>(() => people.value
  .filter((person) => person.id)
  .map((person) => {
    const name = authorizedPersonName(person)
    return {
      id: `person-${person.id}`,
      kind: 'person' as const,
      label: name,
      detail: person.parenP || 'Persona autorizada',
      icon: 'authorized',
      keywords: [name, person.parenP, person.qr].filter(Boolean).join(' '),
      to: `/familia/personas-autorizadas/${person.id}`,
      photo: normalizeVirtualAssetUrl(person.compressed_foto || person.foto || '')
    }
  })
  .filter((person) => person.label !== 'Persona autorizada'))

const actionSearchResults = computed<TopbarSearchResult[]>(() => navItems.map((item) => ({
  id: `action-${item.key}`,
  kind: 'action' as const,
  label: item.label,
  detail: 'Sección',
  icon: item.icon,
  keywords: [item.label, item.shortLabel, item.key].join(' '),
  to: item.to
})))

watch(searchResults, (items) => {
  activeSearchId.value = items[0]?.id || ''
}, { immediate: true })

watch(() => route.fullPath, () => {
  closeSearch()
  studentMenuOpen.value = false
})

onMounted(() => {
  window.addEventListener('keydown', onGlobalSearchShortcut)
  updateTopbarDensity()
  topbarResizeObserver = new ResizeObserver(() => updateTopbarDensity())
  if (topbarRef.value) topbarResizeObserver.observe(topbarRef.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalSearchShortcut)
  topbarResizeObserver?.disconnect()
  topbarResizeObserver = null
})

function updateTopbarDensity() {
  const width = topbarRef.value?.clientWidth || (import.meta.client ? window.innerWidth : 1600)
  if (width < 1040) {
    topbarDensity.value = 'stacked'
  } else if (width < 1240) {
    topbarDensity.value = 'condensed'
  } else if (width < 1480) {
    topbarDensity.value = 'compact'
  } else {
    topbarDensity.value = 'comfortable'
  }
}

function normalizeSearch(value?: string | number | null) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function scoreSearchResult(item: TopbarSearchResult, query: string) {
  const label = normalizeSearch(item.label)
  const detail = normalizeSearch(item.detail)
  const keywords = normalizeSearch(item.keywords)
  if (label === query) return 100
  if (label.startsWith(query)) return 82
  if (label.includes(query)) return 64
  if (detail.includes(query)) return 42
  if (keywords.includes(query)) return 36
  const terms = query.split(/\s+/).filter(Boolean)
  if (terms.length && terms.every((term) => `${label} ${detail} ${keywords}`.includes(term))) return 30 + terms.length
  return 0
}

function openSearch() {
  searchOpen.value = true
}

function focusSearch() {
  openSearch()
  void nextTick(() => searchInput.value?.focus())
}

function onGlobalSearchShortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const isTyping = Boolean(target?.closest('input, textarea, select, [contenteditable="true"]'))
  const wantsCommand = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
  const wantsSlash = event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey
  if (!wantsCommand && !wantsSlash) return
  event.preventDefault()
  focusSearch()
}

function closeSearch() {
  searchOpen.value = false
}

function onSearchFocusout(event: FocusEvent) {
  const nextTarget = event.relatedTarget as Node | null
  const currentTarget = event.currentTarget as HTMLElement | null
  if (nextTarget && currentTarget?.contains(nextTarget)) return
  window.setTimeout(() => closeSearch(), 80)
}

function clearSearch() {
  searchQuery.value = ''
  focusSearch()
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeSearch()
    searchInput.value?.blur()
    return
  }
  if (!searchOpen.value && ['ArrowDown', 'Enter'].includes(event.key)) openSearch()
  const items = searchResults.value
  if (!items.length) return
  const currentIndex = Math.max(0, items.findIndex((item) => item.id === activeSearchId.value))
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeSearchId.value = items[(currentIndex + 1) % items.length]?.id || ''
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeSearchId.value = items[(currentIndex - 1 + items.length) % items.length]?.id || ''
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const target = items.find((item) => item.id === activeSearchId.value) || items[0]
    if (target) void runSearchResult(target)
  }
}

async function runSearchResult(item: TopbarSearchResult) {
  if (item.kind === 'student' && item.matricula) {
    selectedMatricula.value = item.matricula
    searchQuery.value = ''
    closeSearch()
    studentMenuOpen.value = false
    return
  }
  if (item.to) {
    searchQuery.value = ''
    closeSearch()
    studentMenuOpen.value = false
    await navigateTo(item.to)
  }
}

function selectChild(child: AuthorizedChild) {
  const matricula = normalizeMatricula(child.matricula)
  if (matricula) selectedMatricula.value = matricula
  studentMenuOpen.value = false
}

function isSelectedChild(child: AuthorizedChild) {
  return normalizeMatricula(child.matricula) === normalizeMatricula(primaryChild.value?.matricula)
}

function childName(child: AuthorizedChild) {
  return [child.nombreA, child.paternoA, child.maternoA].filter(Boolean).join(' ') || normalizeMatricula(child.matricula) || 'Estudiante'
}

function childInitials(child: AuthorizedChild) {
  return initialsFromName(childName(child))
}

function authorizedPersonName(person: AuthorizedPerson) {
  return [person.nombreP, person.paternoP, person.maternoP].filter(Boolean).join(' ') || 'Persona autorizada'
}

function initialsFromName(value: string) {
  return value.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
}

async function exitImpersonation() {
  studentMenuOpen.value = false
  const impersonation = session.value?.user?.impersonation
  const target = impersonation?.mode === 'daycarePreview'
    ? '/admin/daycare/salas'
    : impersonation?.admin?.isSuperAdmin ? '/admin/superadmin' : impersonation?.admin?.productScopes?.includes('gestionEscolarAdmin') ? '/admin/gestion-escolar/familias' : '/admin/daycare/salas'
  await $fetch('/api/auth/impersonation/exit', { method: 'POST' })
  setCachedRouteSession(null)
  await navigateTo(target)
}

async function logout() {
  studentMenuOpen.value = false
  await $fetch('/api/auth/logout', { method: 'POST' })
  setCachedRouteSession(anonymousSession)
  await navigateTo(defaultLoginRouteForExperience('escolar'))
}

function formatGradeNumber(value?: string | number | null) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const numeric = raw.match(/\d+/)?.[0]
  if (numeric) return numeric
  const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const map: Record<string, string> = {
    primero: '1',
    primer: '1',
    segundo: '2',
    tercero: '3',
    tercer: '3',
    cuarto: '4',
    quinto: '5',
    sexto: '6'
  }
  return map[normalized] || raw.slice(0, 2).toUpperCase()
}

function isActive(item: { to: string }) {
  const target = item.to.split('?')[0] || item.to
  if (target === '/familia') return route.path === '/familia'
  return route.path === target || (target !== '/familia/personas-autorizadas' && route.path.startsWith(`${target}/`))
}
</script>

<style scoped>
.pa-shell-app {
  --pa-primary: #167b83;
  --pa-primary-rgb: 22, 123, 131;
  --pa-contrast: #fff;
  --pa-soft: rgba(var(--pa-primary-rgb), 0.09);
  --pa-border: rgba(var(--pa-primary-rgb), 0.2);
  --pa-gray: #1f2d46;
  --pa-muted: #6d7687;
  --pa-sidebar-width: clamp(252px, 18.6vw, 308px);
  --pa-topbar-height: 86px;
  --pa-content-gutter: clamp(16px, 1.9vw, 30px);
  background:
    radial-gradient(circle at 82% 5%, rgba(var(--pa-primary-rgb), 0.065), transparent 22rem),
    linear-gradient(180deg, #fcfdfd 0%, #f5f8f8 100%);
  color: var(--pa-gray);
  min-height: 100vh;
}

.pa-shell-app,
.pa-shell-app * {
  box-sizing: border-box;
}

.pa-product-topbar {
  align-items: center;
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e7ebee;
  display: grid;
  gap: clamp(9px, 0.82vw, 14px);
  grid-template-columns:
    minmax(210px, var(--pa-sidebar-width))
    minmax(260px, 1fr)
    max-content
    minmax(320px, clamp(340px, 23vw, 430px));
  height: var(--pa-topbar-height);
  max-width: 100vw;
  min-height: var(--pa-topbar-height);
  overflow: visible;
  padding: 0 clamp(14px, 1.7vw, 30px);
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 30;
}

.pa-product-topbar[data-density='compact'] {
  --pa-topbar-action-min-width: 116px;
  --pa-topbar-action-label-width: 104px;
  gap: 8px;
  grid-template-columns:
    minmax(188px, 252px)
    minmax(220px, 1fr)
    max-content
    minmax(282px, 318px);
  padding-inline: 14px;
}

.pa-product-topbar[data-density='condensed'] {
  --pa-topbar-action-min-width: 50px;
  --pa-topbar-action-label-width: 0px;
  gap: 7px;
  grid-template-columns:
    minmax(158px, 208px)
    minmax(210px, 1fr)
    max-content
    minmax(190px, 232px);
  padding-inline: 12px;
}

.pa-product-topbar[data-density='stacked'] {
  align-content: center;
  gap: 8px 10px;
  grid-template-areas:
    'brand controls'
    'search actions';
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: 50px 52px;
  height: var(--pa-topbar-height);
  padding: 8px 12px;
}

.pa-topbar-brand-zone {
  align-items: center;
  align-self: stretch;
  border-right: 1px solid #edf0f2;
  display: flex;
  grid-area: auto;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
  padding-inline: clamp(10px, 1.1vw, 18px);
}

.pa-brand,
.pa-product-lockup {
  align-items: center;
  display: inline-flex;
  min-width: 0;
}

.pa-product-lockup {
  gap: clamp(7px, .75vw, 10px);
  overflow: hidden;
}

.pa-brand img {
  display: block;
  object-fit: contain;
  object-position: center;
}

.pa-institution-logo {
  height: clamp(38px, 3.05vw, 48px);
  max-width: clamp(42px, 3.75vw, 58px);
  width: auto;
}

.pa-lockup-divider {
  background: rgba(var(--pa-primary-rgb), 0.22);
  height: 30px;
  width: 1px;
}

.pa-husky-pass-logo {
  height: clamp(36px, 3.05vw, 48px);
  max-width: clamp(78px, 7.4vw, 118px);
  width: auto;
}

.pa-topbar-search {
  min-width: 0;
  position: relative;
  width: 100%;
  z-index: 36;
}

.pa-search-control {
  align-items: center;
  background:
    linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid #e2eaf0;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(26, 48, 72, 0.06);
  color: #5c6780;
  display: grid;
  gap: 10px;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  min-height: clamp(50px, 3.8vw, 58px);
  padding: 0 clamp(10px, 1vw, 14px) 0 clamp(14px, 1.2vw, 18px);
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.pa-search-control.is-open,
.pa-search-control:focus-within {
  border-color: rgba(var(--pa-primary-rgb), 0.26);
  box-shadow: 0 16px 36px rgba(26, 48, 72, 0.1);
  transform: translateY(-1px);
}

.pa-search-control :deep(.pa-icon) {
  color: var(--pa-primary);
  height: 1.08rem;
  width: 1.08rem;
}

.pa-search-control input {
  appearance: none;
  background: transparent;
  border: 0;
  color: #172642;
  font: inherit;
  font-size: .86rem;
  font-weight: 750;
  min-width: 0;
  outline: 0;
  width: 100%;
}

.pa-search-control input::placeholder {
  color: #7b8493;
  font-weight: 700;
}

.pa-search-control input::-webkit-search-cancel-button {
  display: none;
}

.pa-search-control button {
  align-items: center;
  background: rgba(var(--pa-primary-rgb), 0.08);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.12);
  border-radius: 999px;
  color: var(--pa-primary);
  cursor: pointer;
  display: inline-flex;
  font-size: 1rem;
  font-weight: 800;
  height: 26px;
  justify-content: center;
  line-height: 1;
  width: 26px;
}

.pa-search-panel {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #e0e7ed;
  border-radius: 22px;
  box-shadow: 0 24px 58px rgba(15, 35, 58, 0.16);
  left: 0;
  overflow: hidden;
  padding: 10px;
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
}

.pa-search-groups {
  display: grid;
  gap: 8px;
}

.pa-search-group {
  display: grid;
  gap: 4px;
}

.pa-search-group-label {
  color: #8a94a4;
  font-size: .62rem;
  font-weight: 900;
  letter-spacing: .12em;
  padding: 5px 8px 3px;
  text-transform: uppercase;
}

.pa-search-result {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
  color: #26344e;
  cursor: pointer;
  display: grid;
  font: inherit;
  gap: 10px;
  grid-template-columns: 38px minmax(0, 1fr);
  min-height: 50px;
  padding: 6px 8px;
  text-align: left;
  transition: background .16s ease, border-color .16s ease, transform .16s ease;
  width: 100%;
}

.pa-search-result:hover,
.pa-search-result.active {
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), 0.11), rgba(var(--pa-primary-rgb), 0.05));
  border-color: rgba(var(--pa-primary-rgb), 0.14);
  transform: translateY(-1px);
}

.pa-search-result-icon {
  align-items: center;
  background: #f4f8fa;
  border: 1px solid #e4ebef;
  border-radius: 13px;
  color: var(--pa-primary);
  display: inline-flex;
  height: 38px;
  justify-content: center;
  overflow: hidden;
  width: 38px;
}

.pa-search-result-icon img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.pa-search-result-icon[data-result-kind='student'] {
  background: rgba(var(--pa-primary-rgb), 0.08);
  border-color: rgba(var(--pa-primary-rgb), 0.16);
}

.pa-search-result-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.pa-search-result-copy strong,
.pa-search-result-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-search-result-copy strong {
  color: #172642;
  font-size: .82rem;
  font-weight: 850;
}

.pa-search-result-copy small,
.pa-search-empty {
  color: #747f91;
  font-size: clamp(.66rem, .6vw, .72rem);
  font-weight: 700;
}

.pa-search-empty {
  margin: 0;
  padding: 18px 12px;
  text-align: center;
}

.pa-student-account-menu {
  flex: 1 1 auto;
  min-width: 0;
  position: relative;
}

.pa-student-account-trigger {
  align-items: center;
  background:
    radial-gradient(circle at 90% 18%, rgba(var(--pa-primary-rgb), 0.16), transparent 7.5rem),
    linear-gradient(135deg, #ffffff 0%, rgba(var(--pa-primary-rgb), 0.07) 100%);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.17);
  border-radius: 23px;
  box-shadow: 0 14px 34px rgba(26, 48, 72, 0.075);
  color: var(--pa-gray);
  cursor: pointer;
  display: grid;
  font: inherit;
  gap: clamp(8px, .86vw, 12px);
  grid-template-columns: clamp(44px, 3.4vw, 54px) minmax(0, 1fr) 16px;
  min-height: clamp(52px, 4vw, 62px);
  min-width: 0;
  overflow: hidden;
  padding: 6px clamp(10px, .95vw, 15px) 6px 7px;
  width: 100%;
  position: relative;
  text-align: left;
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.pa-student-account-trigger:hover,
.pa-student-account-trigger[aria-expanded='true'] {
  border-color: rgba(var(--pa-primary-rgb), 0.29);
  box-shadow: 0 18px 38px rgba(26, 48, 72, 0.11);
  transform: translateY(-1px);
}

.pa-student-watermark-mask {
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), .2), rgba(var(--pa-primary-rgb), .04));
  bottom: -22px;
  display: block;
  height: 112px;
  mask: var(--pa-group-mask) center / contain no-repeat;
  opacity: .72;
  pointer-events: none;
  position: absolute;
  right: 34px;
  -webkit-mask: var(--pa-group-mask) center / contain no-repeat;
  width: 112px;
}

.pa-student-watermark-grade {
  color: rgba(var(--pa-primary-rgb), .13);
  font-size: 4rem;
  font-weight: 950;
  letter-spacing: -.08em;
  line-height: 1;
  pointer-events: none;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.pa-student-avatar-wrap {
  display: grid;
  position: relative;
  z-index: 1;
}

.pa-student-avatar {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.2);
  border-radius: 17px;
  box-shadow: 0 9px 20px rgba(var(--pa-primary-rgb), 0.12);
  color: var(--pa-primary);
  display: grid;
  font-size: 0.82rem;
  font-weight: 850;
  height: clamp(42px, 3.3vw, 52px);
  overflow: hidden;
  place-items: center;
  width: clamp(42px, 3.3vw, 52px);
}

.pa-presence-dot {
  background: #48b946;
  border: 3px solid #fff;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(47, 139, 42, 0.25);
  height: 13px;
  position: absolute;
  right: -2px;
  top: -2px;
  width: 13px;
}

.pa-student-avatar img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.pa-student-copy {
  align-content: center;
  display: grid;
  gap: 3px;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.pa-student-copy strong {
  color: #172642;
  font-size: clamp(.74rem, .68vw, .88rem);
  font-weight: 900;
  letter-spacing: -0.018em;
  line-height: 1.08;
  overflow-wrap: anywhere;
  position: relative;
  text-wrap: balance;
  white-space: normal;
}

.pa-student-account-trigger > .pa-icon {
  color: #6d7687;
  height: 0.96rem;
  position: relative;
  width: 0.96rem;
  z-index: 1;
}

.pa-student-account-popover {
  background: #fff;
  border: 1px solid #e0e7ed;
  border-radius: 22px;
  box-shadow: 0 24px 58px rgba(15, 35, 58, 0.16);
  display: grid;
  gap: 6px;
  min-width: min(300px, calc(100vw - 24px));
  padding: 10px;
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  z-index: 42;
}

.pa-account-summary {
  align-items: center;
  border-bottom: 1px solid #edf0f2;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr);
  padding: 6px 7px 12px;
}

.pa-account-summary-photo {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid rgba(var(--pa-primary-rgb), .16);
  border-radius: 14px;
  color: var(--pa-primary);
  display: inline-grid;
  font-size: .74rem;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  overflow: hidden;
  width: 42px;
}

.pa-account-summary-photo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.pa-account-summary span:last-child {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.pa-account-summary strong,
.pa-account-summary small {
  overflow-wrap: anywhere;
}

.pa-account-summary strong {
  color: #26334b;
  font-size: clamp(.78rem, .72vw, .9rem);
  font-weight: 900;
}

.pa-account-summary small {
  color: #717b8c;
  font-size: .74rem;
  font-weight: 750;
}

.pa-student-switcher {
  border-bottom: 1px solid #edf0f2;
  display: grid;
  gap: 4px;
  padding-bottom: 6px;
}

.pa-student-switcher-row,
.pa-account-menu-item {
  align-items: center;
  background: #fff;
  border: 1px solid transparent;
  border-radius: 13px;
  color: #4e596d;
  cursor: pointer;
  display: grid;
  font: inherit;
  font-size: .82rem;
  font-weight: 800;
  gap: 10px;
  min-height: 40px;
  padding: 0 10px;
  text-align: left;
  width: 100%;
}

.pa-student-switcher-row {
  grid-template-columns: 30px minmax(0, 1fr);
}

.pa-student-switcher-row span {
  align-items: center;
  background: rgba(var(--pa-primary-rgb), .08);
  border: 1px solid rgba(var(--pa-primary-rgb), .12);
  border-radius: 10px;
  color: var(--pa-primary);
  display: inline-flex;
  font-size: .64rem;
  height: 30px;
  justify-content: center;
  width: 30px;
}

.pa-student-switcher-row strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-student-switcher-row:hover,
.pa-student-switcher-row.active,
.pa-account-menu-item:hover {
  background: rgba(var(--pa-primary-rgb), .08);
  border-color: rgba(var(--pa-primary-rgb), .12);
  color: var(--pa-primary);
}

.pa-account-menu-item {
  grid-template-columns: 22px minmax(0, 1fr);
  text-decoration: none;
}

.pa-account-menu-item.danger:hover {
  background: #fff3f0;
  border-color: #f2d8d3;
  color: #9a3c35;
}

.pa-topbar-quick-nav {
  --pa-topbar-action-min-width: 126px;
  --pa-topbar-action-label-width: 116px;
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: clamp(8px, .72vw, 12px);
  justify-content: flex-start;
  min-width: 0;
  width: max-content;
}

.pa-topbar-quick-nav a {
  align-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid #e3eaf1;
  border-radius: 17px;
  box-shadow: 0 10px 24px rgba(26, 48, 72, 0.045);
  color: #26344e;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: clamp(0.72rem, .66vw, 0.8rem);
  font-weight: 850;
  gap: clamp(7px, .66vw, 9px);
  justify-content: center;
  letter-spacing: -0.005em;
  min-height: clamp(50px, 3.8vw, 58px);
  min-width: var(--pa-topbar-action-min-width);
  overflow: hidden;
  padding: 0 clamp(12px, .85vw, 16px);
  transition: border-color .18s ease, box-shadow .18s ease, color .18s ease, transform .18s ease, background .18s ease;
  width: auto;
}

.pa-topbar-quick-nav a:hover,
.pa-topbar-quick-nav a.active {
  background: #fff;
  border-color: rgba(var(--pa-primary-rgb), 0.24);
  box-shadow: 0 14px 28px rgba(26, 48, 72, 0.075);
  color: #1f2d46;
  transform: translateY(-1px);
}

.pa-topbar-quick-nav a > span:not(.pa-quick-icon) {
  max-width: var(--pa-topbar-action-label-width);
  min-width: 0;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
}

.pa-quick-icon {
  align-items: center;
  color: var(--pa-primary);
  display: inline-flex;
  height: 22px;
  justify-content: center;
  width: 22px;
}

.pa-quick-icon :deep(.pa-icon) {
  height: 1.08rem;
  stroke-width: 2.2;
  width: 1.08rem;
}

.pa-topbar-controls {
  align-items: center;
  display: flex;
  gap: clamp(7px, .75vw, 12px);
  justify-content: flex-end;
  min-width: 0;
  width: 100%;
}

.pa-topbar-icon-link {
  align-items: center;
  background: #fff;
  border: 1px solid #e6ebef;
  border-radius: 999px;
  box-shadow: 0 8px 22px rgba(26, 48, 72, 0.06);
  color: #536178;
  display: inline-flex;
  height: clamp(48px, 3.55vw, 54px);
  justify-content: center;
  position: relative;
  transition: border-color .18s ease, color .18s ease, transform .18s ease;
  flex: 0 0 clamp(48px, 3.55vw, 54px);
  width: clamp(48px, 3.55vw, 54px);
}

.pa-notification-link span {
  align-items: center;
  background: var(--pa-primary);
  border: 2px solid #fff;
  border-radius: 999px;
  color: #fff;
  display: inline-flex;
  font-size: 0.62rem;
  font-weight: 900;
  height: 19px;
  justify-content: center;
  position: absolute;
  right: -2px;
  top: -3px;
  width: 19px;
}

.pa-topbar-icon-link:hover {
  border-color: rgba(var(--pa-primary-rgb), 0.28);
  color: var(--pa-primary);
  transform: translateY(-1px);
}


.pa-product-topbar[data-density='compact'] .pa-search-control,
.pa-product-topbar[data-density='condensed'] .pa-search-control {
  border-radius: 18px;
}

.pa-product-topbar[data-density='compact'] .pa-topbar-brand-zone,
.pa-product-topbar[data-density='condensed'] .pa-topbar-brand-zone {
  padding-inline: 8px;
}

.pa-product-topbar[data-density='compact'] .pa-institution-logo,
.pa-product-topbar[data-density='compact'] .pa-husky-pass-logo {
  height: 40px;
}

.pa-product-topbar[data-density='compact'] .pa-husky-pass-logo {
  max-width: 92px;
}

.pa-product-topbar[data-density='condensed'] .pa-institution-logo {
  height: 35px;
  max-width: 39px;
}

.pa-product-topbar[data-density='condensed'] .pa-husky-pass-logo {
  height: 33px;
  max-width: 70px;
}

.pa-product-topbar[data-density='condensed'] .pa-lockup-divider {
  height: 25px;
}

.pa-product-topbar[data-density='condensed'] .pa-student-account-trigger {
  border-radius: 18px;
  grid-template-columns: 42px minmax(0, 1fr) 14px;
  padding-left: 6px;
}

.pa-product-topbar[data-density='condensed'] .pa-student-watermark-mask {
  height: 86px;
  right: 16px;
  width: 86px;
}

.pa-product-topbar[data-density='condensed'] .pa-student-watermark-grade {
  font-size: 3.1rem;
  right: 6px;
}

.pa-product-topbar[data-density='condensed'] .pa-topbar-icon-link {
  flex-basis: 46px;
  height: 46px;
  width: 46px;
}

.pa-product-topbar[data-density='condensed'] .pa-topbar-quick-nav a {
  border-radius: 16px;
  min-width: 50px;
  padding-inline: 0;
  width: 50px;
}

.pa-product-topbar[data-density='condensed'] .pa-topbar-quick-nav a > span:not(.pa-quick-icon) {
  display: none;
}


.pa-product-topbar[data-density='stacked'] .pa-topbar-brand-zone {
  border-right: 0;
  grid-area: brand;
  padding-inline: 0;
}

.pa-product-topbar[data-density='stacked'] .pa-topbar-search {
  grid-area: search;
}

.pa-product-topbar[data-density='stacked'] .pa-topbar-quick-nav {
  --pa-topbar-action-min-width: 112px;
  --pa-topbar-action-label-width: 98px;
  grid-area: actions;
  justify-self: end;
  width: max-content;
}

.pa-product-topbar[data-density='stacked'] .pa-topbar-controls {
  grid-area: controls;
  width: auto;
}

.pa-product-topbar[data-density='stacked'] .pa-search-control,
.pa-product-topbar[data-density='stacked'] .pa-topbar-quick-nav a,
.pa-product-topbar[data-density='stacked'] .pa-student-account-trigger {
  min-height: 48px;
}

.pa-product-topbar[data-density='stacked'] .pa-student-account-trigger {
  border-radius: 17px;
  grid-template-columns: 40px;
  padding: 4px;
  width: 48px;
}

.pa-product-topbar[data-density='stacked'] .pa-student-account-trigger .pa-student-copy,
.pa-product-topbar[data-density='stacked'] .pa-student-account-trigger > .pa-icon,
.pa-product-topbar[data-density='stacked'] .pa-student-watermark-mask,
.pa-product-topbar[data-density='stacked'] .pa-student-watermark-grade {
  display: none;
}

.pa-product-topbar[data-density='stacked'] .pa-student-avatar {
  border-radius: 13px;
  height: 40px;
  width: 40px;
}

.pa-product-layout {
  display: grid;
  grid-template-columns: var(--pa-sidebar-width) minmax(0, 1fr);
  min-height: calc(100dvh - var(--pa-topbar-height));
}

.pa-product-nav {
  background: rgba(255, 255, 255, 0.95);
  border-right: 1px solid #e7ebee;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: calc(100dvh - var(--pa-topbar-height));
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 16px 12px 14px;
  position: sticky;
  scrollbar-color: rgba(var(--pa-primary-rgb), 0.22) transparent;
  scrollbar-width: thin;
  top: var(--pa-topbar-height);
}

.pa-product-nav nav {
  display: grid;
  flex: 0 0 auto;
  gap: 4px;
}

.pa-product-nav::-webkit-scrollbar {
  width: 6px;
}

.pa-product-nav::-webkit-scrollbar-track {
  background: transparent;
}

.pa-product-nav::-webkit-scrollbar-thumb {
  background: rgba(var(--pa-primary-rgb), 0.2);
  border-radius: 999px;
}

.pa-nav-link {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 14px;
  color: #596477;
  display: grid;
  font-size: 0.79rem;
  font-weight: 700;
  gap: 11px;
  grid-template-columns: 36px minmax(0, 1fr);
  min-height: 44px;
  padding: 6px 10px 6px 7px;
  position: relative;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.pa-nav-link:hover {
  background: #f7fafb;
  border-color: #e7ecef;
  color: var(--pa-gray);
  transform: translateX(2px);
}

.pa-nav-link.active {
  background: linear-gradient(135deg, rgba(var(--pa-primary-rgb), 0.12), rgba(var(--pa-primary-rgb), 0.06));
  border-color: rgba(var(--pa-primary-rgb), 0.16);
  color: var(--pa-primary);
}

.pa-nav-link.active::after {
  background: var(--pa-primary);
  border-radius: 999px;
  content: '';
  height: 26px;
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
}

.pa-nav-icon {
  align-items: center;
  background: #f5f8f9;
  border: 1px solid #e6ecef;
  border-radius: 11px;
  display: inline-flex;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.pa-nav-link.active .pa-nav-icon {
  background: #fff;
  border-color: rgba(var(--pa-primary-rgb), 0.18);
  box-shadow: 0 6px 14px rgba(var(--pa-primary-rgb), 0.1);
}

.pa-nav-label {
  line-height: 1.18;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-help-card {
  align-items: center;
  background:
    radial-gradient(circle at 10% 15%, rgba(var(--pa-primary-rgb), 0.1), transparent 5rem),
    linear-gradient(145deg, #fbfdfd, #f3f8f8);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.15);
  border-radius: 18px;
  display: grid;
  gap: 7px 9px;
  grid-template-columns: 52px minmax(0, 1fr);
  margin-top: auto;
  overflow: hidden;
  padding: 10px;
}

.pa-help-ambassador {
  align-self: end;
  display: grid;
  height: 56px;
  overflow: hidden;
  place-items: end center;
  width: clamp(42px, 3.3vw, 52px);
}

.pa-help-ambassador :deep(.pa-ambassador-card),
.pa-help-ambassador :deep(.pa-ambassador-visual) {
  height: 56px;
  width: clamp(42px, 3.3vw, 52px);
}

.pa-help-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.pa-help-copy strong {
  color: var(--pa-gray);
  font-size: 0.74rem;
}

.pa-help-copy span {
  color: var(--pa-muted);
  font-size: 0.64rem;
  line-height: 1.4;
}

.pa-help-card a {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(var(--pa-primary-rgb), 0.28);
  border-radius: 10px;
  color: var(--pa-primary);
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 850;
  grid-column: 1 / -1;
  justify-content: center;
  min-height: 32px;
  padding: 0 10px;
}

.pa-route-content {
  align-content: start;
  display: grid;
  gap: clamp(14px, 1.4vw, 20px);
  margin: 0 auto;
  max-width: 1520px;
  min-width: 0;
  padding: clamp(18px, 2.2vh, 30px) var(--pa-content-gutter) 48px;
  width: 100%;
}

.pa-mobile-nav {
  display: none;
}

@media (max-width: 1399px) {
  .pa-shell-app {
    --pa-sidebar-width: 268px;
    --pa-topbar-height: 82px;
    --pa-content-gutter: clamp(14px, 1.7vw, 24px);
  }

  .pa-product-nav {
    padding-inline: 10px;
  }

  .pa-nav-link {
    font-size: 0.75rem;
    gap: 8px;
    grid-template-columns: 32px minmax(0, 1fr);
    min-height: 42px;
    padding-inline: 6px 8px;
  }

  .pa-nav-icon {
    border-radius: 10px;
    height: 30px;
    width: 30px;
  }
}

@media (max-width: 1280px) {
  .pa-shell-app {
    --pa-sidebar-width: 248px;
  }

  .pa-help-card {
    grid-template-columns: 44px minmax(0, 1fr);
  }

  .pa-help-ambassador,
  .pa-help-ambassador :deep(.pa-ambassador-card),
  .pa-help-ambassador :deep(.pa-ambassador-visual) {
    height: 48px;
    width: 44px;
  }
}

@media (max-width: 1180px) {
  .pa-shell-app {
    --pa-sidebar-width: 212px;
  }
}

@media (max-width: 1040px) and (min-width: 901px) {
  .pa-shell-app {
    --pa-topbar-height: 118px;
  }
}

@media (max-width: 900px) {
  .pa-shell-app {
    --pa-topbar-height: 126px;
  }

  .pa-product-topbar,
  .pa-product-topbar[data-density='stacked'] {
    align-content: center;
    gap: 8px 10px;
    grid-template-areas:
      'brand controls'
      'search search';
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: 52px 48px;
    padding: 9px 12px 11px;
  }

  .pa-topbar-brand-zone {
    border-right: 0;
    grid-area: brand;
    justify-content: flex-start;
    padding-inline: 0;
  }

  .pa-topbar-search,
  .pa-product-topbar[data-density='stacked'] .pa-topbar-search {
    display: block;
    grid-area: search;
    min-width: 0;
  }

  .pa-search-control {
    border-radius: 17px;
    min-height: 48px;
  }

  .pa-search-panel {
    border-radius: 18px;
    left: 0;
    right: 0;
    top: calc(100% + 8px);
  }

  .pa-topbar-controls,
  .pa-product-topbar[data-density='stacked'] .pa-topbar-controls {
    display: flex;
    grid-area: controls;
    width: auto;
  }

  .pa-lockup-divider,
  .pa-husky-pass-logo {
    display: block;
  }

  .pa-institution-logo {
    height: 36px;
    max-width: 42px;
  }

  .pa-husky-pass-logo {
    height: 31px;
    max-width: 74px;
  }

  .pa-topbar-quick-nav,
  .pa-product-nav {
    display: none;
  }

  .pa-topbar-icon-link {
    display: inline-flex;
    flex: 0 0 48px;
    height: 48px;
    width: 48px;
  }

  .pa-student-account-trigger {
    border-radius: 17px;
    gap: 0;
    grid-template-columns: 42px;
    min-height: 52px;
    min-width: 0;
    padding: 5px;
    width: 52px;
  }

  .pa-student-account-trigger .pa-student-copy,
  .pa-student-account-trigger > .pa-icon,
  .pa-student-watermark-mask,
  .pa-student-watermark-grade {
    display: none;
  }

  .pa-student-avatar {
    border-radius: 13px;
    height: 42px;
    width: 42px;
  }

  .pa-student-account-popover {
    right: 0;
    top: calc(100% + 8px);
  }

  .pa-product-layout {
    grid-template-columns: 1fr;
  }

  .pa-route-content {
    padding: 12px 12px 32px;
  }

  .pa-mobile-nav {
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid #e3e8ec;
    border-radius: 15px;
    box-shadow: 0 10px 24px rgba(26, 48, 72, 0.07);
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 6px;
    position: sticky;
    scrollbar-width: none;
    top: calc(var(--pa-topbar-height) + 8px);
    z-index: 20;
  }

  .pa-mobile-nav::-webkit-scrollbar {
    display: none;
  }

  .pa-mobile-nav a {
    align-items: center;
    border: 1px solid transparent;
    border-radius: 11px;
    color: var(--pa-muted);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.76rem;
    font-weight: 800;
    gap: 7px;
    min-height: 38px;
    padding: 0 11px;
  }

  .pa-mobile-nav a.active {
    background: var(--pa-soft);
    border-color: var(--pa-border);
    color: var(--pa-primary);
  }
}

@media (max-height: 820px) and (min-width: 1041px) {
  .pa-shell-app {
    --pa-topbar-height: 72px;
  }

  .pa-search-control {
    min-height: 52px;
  }

  .pa-student-account-trigger {
    min-height: 52px;
  }

  .pa-student-avatar {
    border-radius: 14px;
    height: 42px;
    width: 42px;
  }

  .pa-topbar-icon-link {
    height: 48px;
    width: 48px;
  }

  .pa-product-nav {
    gap: 9px;
    padding-block: 10px;
  }

  .pa-product-nav nav {
    gap: 2px;
  }

  .pa-nav-link {
    min-height: 39px;
  }

  .pa-help-card {
    gap: 5px 8px;
    padding: 8px;
  }

  .pa-help-copy span {
    line-height: 1.25;
  }

  .pa-help-card a {
    min-height: 29px;
  }

  .pa-route-content {
    padding-top: 16px;
  }
}

@media (max-width: 480px) {
  .pa-shell-app {
    --pa-topbar-height: 120px;
  }

  .pa-product-topbar,
  .pa-product-topbar[data-density='stacked'] {
    gap: 7px 8px;
    grid-template-rows: 50px 46px;
    padding: 8px 10px 10px;
  }

  .pa-product-lockup {
    gap: 7px;
  }

  .pa-husky-pass-logo {
    max-width: 64px;
  }

  .pa-topbar-icon-link {
    flex-basis: 44px;
    height: 44px;
    width: 44px;
  }

  .pa-student-account-trigger {
    min-height: 48px;
    width: 48px;
  }

  .pa-student-avatar {
    height: 38px;
    width: 38px;
  }

  .pa-route-content {
    padding-inline: 10px;
  }
}

@media (max-width: 360px) {
  .pa-institution-logo {
    height: 32px;
    max-width: 36px;
  }

  .pa-husky-pass-logo {
    height: 28px;
    max-width: 58px;
  }

  .pa-lockup-divider {
    height: 24px;
  }

  .pa-topbar-controls {
    gap: 6px;
  }

  .pa-search-control {
    padding-inline: 12px 10px;
  }
}
</style>
