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

      <section v-if="primaryChild" class="pa-student-context" data-product-panel="active-student" aria-label="Contexto del alumno">
        <span class="pa-student-avatar-wrap">
          <span class="pa-student-avatar">
            <FamilyPersonasProcessedPhoto v-if="studentPhoto" :src="studentPhoto" namespace="pa-active-student" />
            <b v-else>{{ studentInitials }}</b>
          </span>
          <span class="pa-presence-dot" aria-hidden="true"></span>
        </span>
        <span class="pa-student-copy">
          <small>Estás consultando a</small>
          <strong>{{ studentName || 'Alumno' }}</strong>
          <span>{{ contextLine }}</span>
        </span>
      </section>

      <div class="pa-topbar-controls">
        <NuxtLink class="pa-topbar-icon-link" :to="paSecurityRoute" aria-label="Abrir seguridad">
          <FamilyPersonasIcon name="security" />
        </NuxtLink>
        <TopbarAccountMenu :session="session" experience="escolar" :security-to="paSecurityRoute" />
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
import { useRoute } from 'nuxt/app'
import { personasInstitutionLogo, personasInstitutionName } from '~/utils/personasTheme'
import { personasFamilyThemeContextKey, usePersonasFamilyTheme } from '~/composables/usePersonasTheme'
import { displayMatricula } from '~/utils/matricula'

withDefaults(defineProps<{ title?: string }>(), { title: 'Personas Autorizadas' })
const route = useRoute()
const { session, primaryChild, studentName, studentPhoto, theme, themeVars } = usePersonasFamilyTheme({ key: 'shell' })
provide(personasFamilyThemeContextKey, { theme })
const studentInitials = computed(() => (studentName.value || 'A').split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''))
const institution = computed(() => personasInstitutionName(theme.value))
const institutionLogo = computed(() => personasInstitutionLogo(theme.value))
const contextLine = computed(() => [displayMatricula(primaryChild.value?.matricula), primaryChild.value?.nivelEdu, primaryChild.value?.grado, primaryChild.value?.grupo].filter(Boolean).join(' · ') || 'Cuenta familiar')
const paSecurityRoute = '/familia/personas-autorizadas/seguridad'

const navItems = [
  { key: 'personas', label: 'Personas autorizadas', shortLabel: 'Personas', icon: 'people', to: '/familia/personas-autorizadas' },
  { key: 'actualizar', label: 'Datos del alumno', shortLabel: 'Datos', icon: 'edit', to: '/familia/personas-autorizadas/actualizar-datos' },
  { key: 'credencializacion', label: 'Foto del alumno', shortLabel: 'Foto', icon: 'camera', to: '/familia/personas-autorizadas/credencializacion' },
  { key: 'hermanos', label: 'Hermanos', shortLabel: 'Hermanos', icon: 'siblings', to: '/familia/personas-autorizadas/hermanos' },
  { key: 'asistencia', label: 'Asistencia', shortLabel: 'Asistencia', icon: 'calendar', to: '/familia/asistencia' },
  { key: 'encuestas', label: 'Encuestas', shortLabel: 'Encuestas', icon: 'survey', to: '/familia/personas-autorizadas/encuestas' },
  { key: 'convenios', label: 'Convenios', shortLabel: 'Convenios', icon: 'handshake', to: '/familia/personas-autorizadas/convenios' },
  { key: 'seguridad', label: 'Seguridad', shortLabel: 'Seguridad', icon: 'security', to: paSecurityRoute }
]

function isActive(item: { to: string }) {
  const target = item.to.split('?')[0] || item.to
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
  --pa-sidebar-width: 260px;
  --pa-topbar-height: 96px;
  --pa-content-gutter: clamp(18px, 2.1vw, 34px);
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
  gap: clamp(16px, 1.5vw, 24px);
  grid-template-columns: var(--pa-sidebar-width) minmax(360px, 520px) minmax(280px, 1fr);
  height: var(--pa-topbar-height);
  min-height: var(--pa-topbar-height);
  padding: 0 var(--pa-content-gutter) 0 28px;
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
  padding-right: 22px;
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
  height: 40px;
  max-width: 48px;
  width: auto;
}

.pa-lockup-divider {
  background: rgba(var(--pa-primary-rgb), 0.22);
  height: 26px;
  width: 1px;
}

.pa-husky-pass-logo {
  height: 36px;
  max-width: 88px;
  width: auto;
}

.pa-student-context {
  align-items: center;
  background: linear-gradient(135deg, #ffffff, rgba(var(--pa-primary-rgb), 0.035));
  border: 1px solid rgba(var(--pa-primary-rgb), 0.18);
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(26, 48, 72, 0.07);
  display: grid;
  gap: 13px;
  grid-template-columns: 54px minmax(0, 1fr);
  justify-self: start;
  max-width: min(520px, 100%);
  min-height: 64px;
  min-width: 0;
  padding: 8px 18px 8px 10px;
}

.pa-student-avatar-wrap {
  display: grid;
  position: relative;
}

.pa-student-avatar {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 16px;
  color: var(--pa-primary);
  display: grid;
  font-size: 0.76rem;
  font-weight: 800;
  height: 54px;
  overflow: hidden;
  place-items: center;
  width: 54px;
}

.pa-presence-dot {
  background: #48b946;
  border: 3px solid #fff;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(47, 139, 42, 0.25);
  height: 14px;
  position: absolute;
  right: -2px;
  top: -2px;
  width: 14px;
}

.pa-student-avatar img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.pa-student-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.pa-student-copy small {
  color: #44b23f;
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.pa-student-copy strong,
.pa-student-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-student-copy strong {
  color: var(--pa-gray);
  font-size: 1.02rem;
  line-height: 1.2;
}

.pa-student-copy span {
  color: var(--pa-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.pa-topbar-controls {
  align-items: center;
  display: flex;
  gap: 14px;
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
  height: 48px;
  justify-content: center;
  transition: border-color .18s ease, color .18s ease, transform .18s ease;
  width: 48px;
}

.pa-topbar-icon-link:hover {
  border-color: rgba(var(--pa-primary-rgb), 0.28);
  color: var(--pa-primary);
  transform: translateY(-1px);
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
    --pa-sidebar-width: 242px;
    --pa-content-gutter: clamp(16px, 1.8vw, 26px);
  }

  .pa-product-topbar {
    gap: 16px;
    grid-template-columns: var(--pa-sidebar-width) minmax(320px, 480px) minmax(240px, 1fr);
    padding-left: 18px;
  }

  .pa-topbar-brand-zone {
    padding-right: 16px;
  }

  .pa-husky-pass-logo {
    max-width: 76px;
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

@media (max-width: 1099px) {
  .pa-shell-app {
    --pa-sidebar-width: 204px;
  }

  .pa-husky-pass-logo {
    display: none;
  }

  .pa-lockup-divider {
    display: none;
  }

  .pa-student-context {
    max-width: 390px;
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
    grid-template-columns: 40px minmax(0, 1fr);
    padding-block: 5px;
  }

  .pa-student-avatar {
    height: 44px;
    width: 44px;
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
