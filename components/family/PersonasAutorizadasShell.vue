<template>
  <main class="pa-shell-app" :style="themeVars" data-product-area="personas-autorizadas">
    <header class="pa-product-topbar">
      <div class="pa-topbar-brand-zone">
        <NuxtLink class="pa-brand" to="/familia/personas-autorizadas" :aria-label="`${institution} Husky Pass Personas Autorizadas`">
          <span class="pa-product-lockup">
            <img class="pa-institution-logo" :src="institutionLogo" :alt="institution" />
            <span class="pa-lockup-divider" aria-hidden="true"></span>
            <img class="pa-husky-pass-logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
          </span>
        </NuxtLink>
      </div>

      <section v-if="primaryChild" class="pa-student-context" data-product-panel="active-student" aria-label="Contexto familiar">
        <span class="pa-student-avatar-wrap">
          <span class="pa-student-avatar">
            <FamilyPersonasProcessedPhoto v-if="studentPhoto" :src="studentPhoto" namespace="pa-active-student" />
            <b v-else>{{ studentInitials }}</b>
          </span>
          <span class="pa-presence-dot" aria-hidden="true"></span>
        </span>
        <span class="pa-student-copy">
          <strong>{{ studentName || 'Alumno' }}</strong>
          <span v-if="hasAcademicMarkers" class="pa-student-marker-row" aria-label="Grado y grupo">
            <span v-if="gradeNumber" class="pa-grade-badge" :aria-label="`Grado ${gradeNumber}`">{{ gradeNumber }}</span>
            <span v-if="hasGroupSigil" class="pa-group-badge" :aria-label="groupSigilLabel">
              <span class="pa-group-sigil" :style="groupSigilStyle" aria-hidden="true"></span>
            </span>
          </span>
        </span>
        <FamilyPersonasIcon name="chevron" />
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
        <TopbarAccountMenu
          :session="session"
          experience="escolar"
          :security-to="paSecurityRoute"
          :profile-name="accountName"
          :profile-detail="accountDetail"
        />
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
import { computed, provide } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import { personasInstitutionLogo, personasInstitutionName } from '~/utils/personasTheme'
import { personasFamilyThemeContextKey, usePersonasFamilyTheme } from '~/composables/usePersonasTheme'
import { resolveGrupoIcon, type GrupoIconManifest } from '~/utils/grupoIcons'

withDefaults(defineProps<{ title?: string }>(), { title: 'Personas Autorizadas' })
const route = useRoute()
const { session, primaryChild, studentName, studentPhoto, theme, themeVars } = usePersonasFamilyTheme({ key: 'shell' })
provide(personasFamilyThemeContextKey, { theme })
const studentInitials = computed(() => (studentName.value || 'A').split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''))
const studentFirstName = computed(() => String(primaryChild.value?.nombreA || studentName.value || 'tu familia').split(/\s+/).filter(Boolean)[0] || 'tu familia')
const accountName = computed(() => primaryChild.value?.parentName || session.value?.user?.displayName || session.value?.user?.email || 'Familia')
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
const hasAcademicMarkers = computed(() => Boolean(gradeNumber.value || hasGroupSigil.value))
const groupSigilLabel = computed(() => `Grupo ${rawStudentGroup.value || groupIcon.value.grupoValue}`)
const groupSigilStyle = computed(() => ({ '--pa-group-mask': `url("${groupIcon.value.maskImage}")` }))
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
  --pa-sidebar-width: 308px;
  --pa-topbar-height: 86px;
  --pa-content-gutter: clamp(16px, 1.9vw, 30px);
  background:
    radial-gradient(circle at 82% 5%, rgba(var(--pa-primary-rgb), 0.065), transparent 22rem),
    linear-gradient(180deg, #fcfdfd 0%, #f5f8f8 100%);
  color: var(--pa-gray);
  min-height: 100vh;
}

.pa-product-topbar {
  align-items: center;
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e7ebee;
  display: grid;
  gap: clamp(10px, 1vw, 16px);
  grid-template-columns: var(--pa-sidebar-width) minmax(340px, 430px) minmax(390px, 1fr) auto;
  height: var(--pa-topbar-height);
  min-height: var(--pa-topbar-height);
  overflow: visible;
  padding: 0 clamp(22px, 2.4vw, 42px) 0 clamp(22px, 2.3vw, 44px);
  position: sticky;
  top: 0;
  z-index: 30;
}

.pa-topbar-brand-zone {
  align-items: center;
  align-self: stretch;
  border-right: 1px solid #edf0f2;
  display: flex;
  min-width: 0;
  padding-right: 18px;
}

.pa-brand,
.pa-product-lockup {
  align-items: center;
  display: inline-flex;
  min-width: 0;
}

.pa-product-lockup {
  gap: 10px;
}

.pa-brand img {
  display: block;
  object-fit: contain;
  object-position: center;
}

.pa-institution-logo {
  height: 48px;
  max-width: 58px;
  width: auto;
}

.pa-lockup-divider {
  background: rgba(var(--pa-primary-rgb), 0.22);
  height: 30px;
  width: 1px;
}

.pa-husky-pass-logo {
  height: 48px;
  max-width: 118px;
  width: auto;
}

.pa-student-context {
  align-items: center;
  background:
    radial-gradient(circle at 92% 18%, rgba(var(--pa-primary-rgb), 0.16), transparent 7rem),
    linear-gradient(135deg, #ffffff, rgba(var(--pa-primary-rgb), 0.075));
  border: 1px solid rgba(var(--pa-primary-rgb), 0.16);
  border-radius: 999px;
  box-shadow: 0 14px 34px rgba(26, 48, 72, 0.075);
  display: grid;
  gap: 13px;
  grid-template-columns: 64px minmax(0, 1fr) 16px;
  justify-self: stretch;
  max-width: min(430px, 100%);
  min-height: 74px;
  min-width: 0;
  padding: 6px 18px 6px 7px;
}

.pa-student-avatar-wrap {
  display: grid;
  position: relative;
}

.pa-student-avatar {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.2);
  border-radius: 999px;
  box-shadow: 0 9px 20px rgba(var(--pa-primary-rgb), 0.12);
  color: var(--pa-primary);
  display: grid;
  font-size: 0.82rem;
  font-weight: 850;
  height: 64px;
  overflow: hidden;
  place-items: center;
  width: 64px;
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
  gap: 7px;
  min-width: 0;
}

.pa-student-copy strong,
.pa-student-copy > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-student-copy strong {
  color: #172642;
  font-size: 1rem;
  font-weight: 850;
  line-height: 1.12;
}

.pa-student-marker-row {
  align-items: center;
  display: flex;
  gap: 7px;
  min-height: 24px;
  min-width: 0;
}

.pa-grade-badge,
.pa-group-badge {
  align-items: center;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.2);
  border-radius: 999px;
  box-shadow: 0 6px 14px rgba(var(--pa-primary-rgb), 0.08);
  color: var(--pa-primary);
  display: inline-grid;
  flex: 0 0 auto;
  height: 24px;
  justify-content: center;
}

.pa-grade-badge {
  font-size: 0.72rem;
  font-weight: 900;
  min-width: 32px;
  padding: 0 9px;
}

.pa-group-badge {
  background:
    radial-gradient(circle at 28% 22%, rgba(255, 255, 255, 0.92), transparent 42%),
    linear-gradient(135deg, rgba(var(--pa-primary-rgb), 0.13), rgba(var(--pa-primary-rgb), 0.05));
  width: 34px;
}

.pa-group-sigil {
  background: linear-gradient(135deg, var(--pa-primary), rgba(var(--pa-primary-rgb), 0.62));
  display: block;
  height: 17px;
  mask: var(--pa-group-mask) center / contain no-repeat;
  -webkit-mask: var(--pa-group-mask) center / contain no-repeat;
  width: 17px;
}

.pa-student-context > .pa-icon {
  color: #6d7687;
  height: 0.96rem;
  width: 0.96rem;
}

.pa-topbar-quick-nav {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: end;
  min-width: 0;
}

.pa-topbar-quick-nav a {
  align-items: center;
  background: #fff;
  border: 1px solid #e6ebef;
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(26, 48, 72, 0.055);
  color: #24324b;
  display: inline-flex;
  flex: 0 1 auto;
  font-size: 0.78rem;
  font-weight: 850;
  gap: 10px;
  justify-content: center;
  min-height: 58px;
  min-width: 128px;
  padding: 0 18px 0 15px;
  transition: border-color .18s ease, box-shadow .18s ease, color .18s ease, transform .18s ease;
}

.pa-topbar-quick-nav a[data-product-nav='topbar-asistencia'] {
  min-width: 142px;
}

.pa-topbar-quick-nav a[data-product-nav='topbar-comunicados'] {
  min-width: 166px;
}

.pa-topbar-quick-nav a[data-product-nav='topbar-pagos'] {
  min-width: 124px;
}

.pa-topbar-quick-nav a:hover,
.pa-topbar-quick-nav a.active {
  border-color: rgba(var(--pa-primary-rgb), 0.26);
  box-shadow: 0 14px 30px rgba(26, 48, 72, 0.08);
  color: var(--pa-primary);
  transform: translateY(-1px);
}

.pa-topbar-quick-nav span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-quick-icon {
  align-items: center;
  background: rgba(var(--pa-primary-rgb), 0.085);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.13);
  border-radius: 11px;
  color: var(--pa-primary);
  display: inline-flex;
  height: 32px;
  justify-content: center;
  width: 32px;
}

.pa-quick-icon :deep(.pa-icon) {
  height: 1.04rem;
  width: 1.04rem;
}

.pa-topbar-controls {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  min-width: 0;
}

.pa-topbar-icon-link {
  align-items: center;
  background: #fff;
  border: 1px solid #e6ebef;
  border-radius: 999px;
  box-shadow: 0 8px 22px rgba(26, 48, 72, 0.06);
  color: #536178;
  display: inline-flex;
  height: 54px;
  justify-content: center;
  position: relative;
  transition: border-color .18s ease, color .18s ease, transform .18s ease;
  width: 54px;
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

.pa-topbar-controls :deep(.account-trigger) {
  border-radius: 20px;
  min-height: 58px;
  min-width: clamp(212px, 16vw, 260px);
  padding: 5px 13px 5px 6px;
}

.pa-topbar-controls :deep(.account-trigger img),
.pa-topbar-controls :deep(.account-trigger .avatar) {
  border-radius: 15px;
  height: 48px;
  width: 48px;
}

.pa-topbar-controls :deep(.account-copy strong) {
  font-size: .82rem;
  max-width: 150px;
}

.pa-topbar-controls :deep(.account-copy small) {
  max-width: 150px;
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
  width: 52px;
}

.pa-help-ambassador :deep(.pa-ambassador-card),
.pa-help-ambassador :deep(.pa-ambassador-visual) {
  height: 56px;
  width: 52px;
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
    --pa-sidebar-width: 282px;
    --pa-topbar-height: 82px;
    --pa-content-gutter: clamp(14px, 1.7vw, 24px);
  }

  .pa-product-topbar {
    gap: 10px;
    grid-template-columns: var(--pa-sidebar-width) minmax(310px, 400px) minmax(372px, 1fr) auto;
    padding-left: 24px;
  }

  .pa-topbar-brand-zone {
    padding-right: 14px;
  }

  .pa-husky-pass-logo {
    max-width: 108px;
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
  .pa-student-context > .pa-icon {
    display: none;
  }

  .pa-student-context {
    grid-template-columns: 56px minmax(0, 1fr);
    padding-right: 14px;
  }

  .pa-student-avatar {
    height: 56px;
    width: 56px;
  }

  .pa-topbar-quick-nav {
    gap: 8px;
  }

  .pa-topbar-quick-nav a,
  .pa-topbar-quick-nav a[data-product-nav='topbar-asistencia'],
  .pa-topbar-quick-nav a[data-product-nav='topbar-comunicados'],
  .pa-topbar-quick-nav a[data-product-nav='topbar-pagos'] {
    min-width: 0;
    padding-inline: 12px 14px;
  }
}

@media (max-width: 1240px) and (min-width: 1181px) {
  .pa-product-topbar {
    grid-template-columns: 222px minmax(300px, 1fr) auto auto;
  }

  .pa-topbar-brand-zone {
    padding-right: 10px;
  }

  .pa-institution-logo {
    max-width: 46px;
  }

  .pa-husky-pass-logo {
    max-width: 94px;
  }

  .pa-topbar-controls :deep(.account-trigger) {
    min-width: 184px;
  }
}

@media (max-width: 1180px) {
  .pa-shell-app {
    --pa-sidebar-width: 212px;
  }

  .pa-student-context {
    max-width: 370px;
  }

  .pa-student-marker-row {
    display: none;
  }

  .pa-product-topbar {
    grid-template-columns: var(--pa-sidebar-width) minmax(280px, 1fr) auto;
  }

  .pa-topbar-quick-nav {
    display: none;
  }

  .pa-topbar-controls :deep(.account-trigger) {
    min-width: 190px;
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

@media (max-width: 900px) {
  .pa-shell-app {
    --pa-topbar-height: 66px;
  }

  .pa-product-topbar {
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 0 12px;
  }

  .pa-topbar-brand-zone {
    border-right: 0;
    justify-content: flex-start;
    padding-right: 0;
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

  .pa-student-context,
  .pa-topbar-quick-nav,
  .pa-topbar-icon-link,
  .pa-product-nav {
    display: none;
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

@media (max-height: 820px) and (min-width: 901px) {
  .pa-shell-app {
    --pa-topbar-height: 72px;
  }

  .pa-student-context {
    grid-template-columns: 42px minmax(0, 1fr) 14px;
    padding-block: 5px;
  }

  .pa-student-avatar {
    height: 42px;
    width: 42px;
  }

  .pa-topbar-icon-link {
    height: 48px;
    width: 48px;
  }

  .pa-topbar-controls :deep(.account-trigger) {
    min-height: 52px;
  }

  .pa-topbar-controls :deep(.account-trigger img),
  .pa-topbar-controls :deep(.account-trigger .avatar) {
    height: 42px;
    width: 42px;
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
  .pa-product-lockup {
    gap: 7px;
  }

  .pa-husky-pass-logo {
    max-width: 64px;
  }

  .pa-route-content {
    padding-inline: 10px;
  }
}
</style>
