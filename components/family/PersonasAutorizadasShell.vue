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

      <section v-if="primaryChild" class="pa-student-switcher" data-product-panel="active-student" aria-label="Alumno activo">
        <span class="pa-student-avatar">
          <FamilyPersonasProcessedPhoto v-if="studentPhoto" :src="studentPhoto" namespace="pa-active-student" />
          <b v-else>{{ studentInitials }}</b>
        </span>
        <span class="pa-student-copy">
          <small>Alumno activo</small>
          <strong>{{ studentName || 'Alumno' }}</strong>
          <span>{{ contextLine }}</span>
        </span>
        <FamilyPersonasIcon class="pa-student-chevron" name="chevron" aria-hidden="true" />
      </section>

      <span class="pa-topbar-spacer" aria-hidden="true"></span>
      <TopbarAccountMenu :session="session" experience="escolar" security-to="/familia/cuenta/seguridad?experiencia=escolar" />
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
          <FamilyPersonasAmbassador :theme="theme" variant="help" compact decorative />
          <strong>¿Necesitas ayuda?</strong>
          <span>Consulta la guía o contacta a tu colegio.</span>
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
import { computed } from 'vue'
import { useRoute } from 'nuxt/app'
import { personasInstitutionLogo, personasInstitutionName } from '~/utils/personasTheme'
import { usePersonasFamilyTheme } from '~/composables/usePersonasTheme'
import { displayMatricula } from '~/utils/matricula'

withDefaults(defineProps<{ title?: string }>(), { title: 'Personas Autorizadas' })
const route = useRoute()
const { session, primaryChild, studentName, studentPhoto, theme, themeVars } = usePersonasFamilyTheme({ key: 'shell' })
const studentInitials = computed(() => (studentName.value || 'A').split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''))
const institution = computed(() => personasInstitutionName(theme.value))
const institutionLogo = computed(() => personasInstitutionLogo(theme.value))
const contextLine = computed(() => [displayMatricula(primaryChild.value?.matricula), primaryChild.value?.nivelEdu, primaryChild.value?.grado, primaryChild.value?.grupo].filter(Boolean).join(' · ') || 'Cuenta familiar')

const navItems = [
  { key: 'personas', label: 'Personas autorizadas', shortLabel: 'Personas', icon: 'people', to: '/familia/personas-autorizadas' },
  { key: 'actualizar', label: 'Datos del alumno', shortLabel: 'Datos', icon: 'edit', to: '/familia/personas-autorizadas/actualizar-datos' },
  { key: 'credencializacion', label: 'Foto del alumno', shortLabel: 'Foto', icon: 'camera', to: '/familia/personas-autorizadas/credencializacion' },
  { key: 'hermanos', label: 'Hermanos', shortLabel: 'Hermanos', icon: 'siblings', to: '/familia/personas-autorizadas/hermanos' },
  { key: 'asistencia', label: 'Asistencia', shortLabel: 'Asistencia', icon: 'calendar', to: '/familia/asistencia' },
  { key: 'encuestas', label: 'Encuestas', shortLabel: 'Encuestas', icon: 'survey', to: '/familia/personas-autorizadas/encuestas' },
  { key: 'convenios', label: 'Convenios', shortLabel: 'Convenios', icon: 'handshake', to: '/familia/personas-autorizadas/convenios' },
  { key: 'seguridad', label: 'Seguridad', shortLabel: 'Seguridad', icon: 'security', to: '/familia/cuenta/seguridad?experiencia=escolar' }
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
  --pa-sidebar-width: 236px;
  --pa-topbar-height: 78px;
  background:
    radial-gradient(circle at 82% 5%, rgba(var(--pa-primary-rgb), 0.08), transparent 20rem),
    linear-gradient(180deg, #fcfdfd 0%, #f5f8f8 100%);
  color: var(--pa-gray);
  min-height: 100vh;
}

.pa-product-topbar {
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid #e7ebee;
  backdrop-filter: blur(18px);
  display: grid;
  gap: 24px;
  grid-template-columns: var(--pa-sidebar-width) minmax(280px, 390px) minmax(0, 1fr) auto;
  min-height: var(--pa-topbar-height);
  padding: 0 28px 0 20px;
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
  height: 42px;
  max-width: 50px;
  width: auto;
}

.pa-lockup-divider {
  background: rgba(var(--pa-primary-rgb), 0.22);
  height: 28px;
  width: 1px;
}

.pa-husky-pass-logo {
  height: 38px;
  max-width: 92px;
  width: auto;
}

.pa-student-switcher {
  align-items: center;
  background: #fff;
  border: 1px solid #e3e8ec;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(26, 48, 72, 0.06);
  display: grid;
  gap: 11px;
  grid-template-columns: 42px minmax(0, 1fr) 18px;
  min-width: 0;
  padding: 7px 12px 7px 7px;
}

.pa-student-avatar {
  aspect-ratio: 1;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 13px;
  color: var(--pa-primary);
  display: grid;
  font-size: 0.8rem;
  font-weight: 800;
  overflow: hidden;
  place-items: center;
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
  color: var(--pa-muted);
  font-size: 0.68rem;
  font-weight: 700;
}

.pa-student-copy strong,
.pa-student-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-student-copy strong {
  color: var(--pa-gray);
  font-size: 0.84rem;
  line-height: 1.2;
}

.pa-student-copy span {
  color: var(--pa-muted);
  font-size: 0.68rem;
}

.pa-student-chevron {
  color: var(--pa-muted);
  height: 1rem;
  width: 1rem;
}

.pa-topbar-spacer {
  min-width: 0;
}

.pa-product-layout {
  display: grid;
  grid-template-columns: var(--pa-sidebar-width) minmax(0, 1fr);
}

.pa-product-nav {
  background: rgba(255, 255, 255, 0.94);
  border-right: 1px solid #e7ebee;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: calc(100vh - var(--pa-topbar-height));
  padding: 24px 14px 18px;
  position: sticky;
  top: var(--pa-topbar-height);
}

.pa-product-nav nav {
  display: grid;
  gap: 7px;
}

.pa-nav-link {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 14px;
  color: #596477;
  display: grid;
  font-size: 0.84rem;
  font-weight: 700;
  gap: 11px;
  grid-template-columns: 36px minmax(0, 1fr);
  min-height: 50px;
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
}

.pa-help-card {
  align-items: start;
  background:
    radial-gradient(circle at 90% 10%, rgba(250, 186, 64, 0.18), transparent 5rem),
    linear-gradient(145deg, #f7fbfc, #eef7f7);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.15);
  border-radius: 18px;
  display: grid;
  gap: 7px;
  margin-top: auto;
  overflow: hidden;
  padding: 14px;
}

.pa-help-card :deep(.pa-ambassador-card) {
  height: 72px;
  justify-self: start;
  width: 92px;
}

.pa-help-card strong {
  color: var(--pa-gray);
  font-size: 0.82rem;
}

.pa-help-card span {
  color: var(--pa-muted);
  font-size: 0.72rem;
  line-height: 1.45;
}

.pa-help-card a {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(var(--pa-primary-rgb), 0.28);
  border-radius: 10px;
  color: var(--pa-primary);
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 800;
  justify-content: center;
  min-height: 34px;
  padding: 0 10px;
}

.pa-route-content {
  align-content: start;
  display: grid;
  gap: 18px;
  margin: 0 auto;
  max-width: 1640px;
  min-width: 0;
  padding: clamp(24px, 2.8vw, 44px) clamp(20px, 3.2vw, 52px) 52px;
  width: 100%;
}

.pa-mobile-nav {
  display: none;
}

@media (max-width: 1180px) {
  .pa-shell-app {
    --pa-sidebar-width: 88px;
  }

  .pa-product-topbar {
    gap: 18px;
    grid-template-columns: var(--pa-sidebar-width) minmax(260px, 360px) minmax(0, 1fr) auto;
    padding-left: 14px;
  }

  .pa-topbar-brand-zone {
    justify-content: center;
    padding-right: 14px;
  }

  .pa-lockup-divider,
  .pa-husky-pass-logo {
    display: none;
  }

  .pa-product-nav {
    padding-inline: 10px;
  }

  .pa-nav-link {
    grid-template-columns: 1fr;
    justify-items: center;
    min-height: 48px;
    padding: 6px;
  }

  .pa-nav-label,
  .pa-help-card {
    display: none;
  }

  .pa-nav-link.active::after {
    right: -11px;
  }
}

@media (max-width: 860px) {
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

  .pa-student-switcher,
  .pa-topbar-spacer,
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
