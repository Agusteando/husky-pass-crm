<template>
  <main class="pa-shell-app" :style="themeVars" data-product-area="personas-autorizadas" :aria-label="title">
    <section class="pa-product-frame">
      <header class="pa-product-topbar">
        <NuxtLink class="pa-brand" to="/familia/personas-autorizadas" :aria-label="`${institution} Husky Pass Personas Autorizadas`">
          <span class="pa-product-lockup">
            <span class="pa-institution-lockup">
              <img class="pa-institution-logo" :src="institutionLogo" :alt="institution" />
              <span class="pa-institution-copy">
                <strong>{{ institution }}</strong>
                <small>{{ levelName.spanish }}</small>
              </span>
            </span>
            <span class="pa-lockup-divider" aria-hidden="true"></span>
            <img class="pa-husky-pass-logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
          </span>
        </NuxtLink>

        <div class="pa-topbar-spacer" aria-hidden="true"></div>

        <section v-if="primaryChild" class="pa-student-chip" data-product-panel="active-student" aria-label="Alumno activo">
          <span class="pa-student-avatar">
            <FamilyPersonasProcessedPhoto v-if="studentPhoto" :src="studentPhoto" namespace="pa-active-student" />
            <b v-else>{{ studentInitials }}</b>
          </span>
          <span class="pa-student-copy">
            <strong>{{ studentName || 'Alumno' }}</strong>
            <small>{{ contextLine }}</small>
          </span>
          <span class="pa-chip-caret" aria-hidden="true">⌄</span>
        </section>

        <button class="pa-logout" type="button" aria-label="Cerrar sesión" data-diagnostic-action="logout-personas-autorizadas" @click="logout">
          <FamilyPersonasIcon name="exit" />
        </button>
      </header>

      <div class="pa-product-layout">
        <aside class="pa-product-nav" aria-label="Navegación Personas Autorizadas">
          <div class="pa-nav-mark">
            <img class="pa-nav-mascot" :src="navMascot" alt="" loading="lazy" decoding="async" />
            <span>{{ levelName.spanish }}</span>
            <small>Husky Pass</small>
          </div>
          <nav>
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="pa-nav-link"
              :class="{ active: isActive(item) }"
              :data-product-nav="item.key"
            >
              <FamilyPersonasIcon :name="item.icon" />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
          <div class="pa-nav-scene" aria-hidden="true">
            <span class="pa-cloud one"></span>
            <span class="pa-cloud two"></span>
            <span class="pa-school-house"></span>
          </div>
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
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import { personasInstitutionLogo, personasInstitutionName, personasLevelName, personasMascot } from '~/utils/personasTheme'
import { usePersonasFamilyTheme } from '~/composables/usePersonasTheme'

const props = withDefaults(defineProps<{ title?: string }>(), { title: 'Personas Autorizadas' })
const route = useRoute()
const { primaryChild, studentName, studentPhoto, theme, themeVars } = usePersonasFamilyTheme({ key: 'shell' })
const studentInitials = computed(() => (studentName.value || 'A').split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''))
const navMascot = computed(() => personasMascot(theme.value, 'transition'))
const levelName = computed(() => personasLevelName(theme.value))
const institution = computed(() => personasInstitutionName(theme.value))
const institutionLogo = computed(() => personasInstitutionLogo(theme.value))
const title = computed(() => props.title)
const contextLine = computed(() => [primaryChild.value?.nivelEdu, primaryChild.value?.grado, primaryChild.value?.grupo].filter(Boolean).join(' / ') || 'Cuenta familiar')

const navItems = [
  { key: 'personas', label: 'Personas autorizadas', shortLabel: 'Personas', icon: 'people', to: '/familia/personas-autorizadas' },
  { key: 'actualizar', label: 'Datos del alumno', shortLabel: 'Datos', icon: 'edit', to: '/familia/personas-autorizadas/actualizar-datos' },
  { key: 'credencializacion', label: 'Foto del alumno', shortLabel: 'Foto', icon: 'camera', to: '/familia/personas-autorizadas/credencializacion' },
  { key: 'hermanos', label: 'Hermanos', shortLabel: 'Hermanos', icon: 'siblings', to: '/familia/personas-autorizadas/hermanos' },
  { key: 'asistencia', label: 'Asistencia', shortLabel: 'Asistencia', icon: 'calendar', to: '/familia/asistencia' },
  { key: 'encuestas', label: 'Encuestas', shortLabel: 'Encuestas', icon: 'survey', to: '/familia/personas-autorizadas/encuestas' },
  { key: 'convenios', label: 'Convenios', shortLabel: 'Convenios', icon: 'handshake', to: '/familia/personas-autorizadas/convenios' }
]

function isActive(item: { to: string }) {
  return route.path === item.to || (item.to !== '/familia/personas-autorizadas' && route.path.startsWith(`${item.to}/`))
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<style scoped>
.pa-shell-app {
  --pa-primary: #618b2f;
  --pa-primary-rgb: 97, 139, 47;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  --pa-gray: #26324a;
  --pa-muted: #6d7280;
  background:
    radial-gradient(circle at 15% 0%, rgba(101, 170, 221, 0.2), transparent 32%),
    radial-gradient(circle at 88% 0%, rgba(97, 139, 47, 0.12), transparent 34%),
    linear-gradient(180deg, #f4f9fb 0%, #edf5f7 100%);
  color: var(--pa-gray);
  min-height: 100vh;
  padding: clamp(10px, 1.7vw, 22px);
}

.pa-product-frame {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(218, 231, 239, 0.86);
  border-radius: 18px;
  box-shadow: 0 22px 60px rgba(42, 73, 98, 0.14);
  margin: 0 auto;
  max-width: 1380px;
  min-height: calc(100vh - clamp(20px, 3.4vw, 44px));
  overflow: clip;
}

.pa-product-topbar {
  align-items: center;
  background: rgba(255, 255, 255, 0.98);
  border-bottom: 1px solid rgba(214, 226, 236, 0.9);
  display: grid;
  gap: 12px;
  grid-template-columns: 190px minmax(0, 1fr) minmax(250px, max-content) 38px;
  min-height: 76px;
  padding: 10px 18px 10px 22px;
  position: sticky;
  top: clamp(10px, 1.7vw, 22px);
  z-index: 20;
}

.pa-product-topbar::after {
  background: linear-gradient(to right, #0a7291 0%, #69b642 16%, #f0ca45 49%, #ef4b4b 72%, #55a4d6 100%);
  bottom: 0;
  content: '';
  height: 4px;
  left: 0;
  position: absolute;
  width: 100%;
}

.pa-brand {
  align-items: center;
  display: inline-flex;
  min-width: 0;
  width: max-content;
}

.pa-product-lockup {
  align-items: center;
  display: inline-flex;
  gap: 12px;
  min-width: 0;
  white-space: nowrap;
}

.pa-institution-lockup {
  align-items: center;
  display: inline-grid;
  gap: 8px;
  grid-template-columns: 42px max-content;
  min-width: 0;
}

.pa-brand img {
  display: block;
  object-fit: contain;
  object-position: center;
}

.pa-institution-logo {
  height: 42px;
  width: 42px;
}

.pa-institution-copy {
  display: grid;
  gap: 1px;
  line-height: 1;
}

.pa-institution-copy strong {
  color: #216aa0;
  font-family: var(--font-title);
  font-size: 1rem;
  letter-spacing: 0.03em;
  line-height: 1;
  text-transform: uppercase;
}

.pa-institution-copy small {
  color: var(--pa-muted);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: lowercase;
}

.pa-lockup-divider {
  background: rgba(130, 178, 216, 0.34);
  height: 34px;
  width: 1px;
}

.pa-husky-pass-logo {
  height: 40px;
  max-width: 88px;
  width: auto;
}

.pa-topbar-spacer {
  min-width: 0;
}

.pa-student-chip {
  align-items: center;
  background: #ffffff;
  border: 1px solid #dce8f5;
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(44, 79, 120, 0.08);
  display: grid;
  gap: 10px;
  grid-template-columns: 38px minmax(0, 1fr) 14px;
  justify-self: end;
  min-width: min(290px, 100%);
  padding: 5px 10px 5px 5px;
}

.pa-student-avatar {
  aspect-ratio: 1;
  background: #eaf4ff;
  border: 1px solid #cfe2f5;
  border-radius: 999px;
  color: #1b70b9;
  display: grid;
  font-size: 0.82rem;
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

.pa-student-copy strong,
.pa-student-copy small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-student-copy strong {
  color: #22304a;
  font-size: 0.82rem;
  line-height: 1.15;
}

.pa-student-copy small {
  color: var(--pa-muted);
  font-size: 0.68rem;
  font-weight: 700;
}

.pa-chip-caret {
  color: #173a62;
  font-size: 1rem;
  line-height: 1;
}

.pa-logout {
  align-items: center;
  background: #ffffff;
  border: 1px solid #dce8f5;
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(44, 79, 120, 0.08);
  color: #617086;
  cursor: pointer;
  display: inline-grid;
  height: 34px;
  justify-content: center;
  padding: 0;
  width: 34px;
}

.pa-logout:hover {
  background: var(--pa-soft);
  color: var(--pa-primary);
}

.pa-product-layout {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
}

.pa-product-nav {
  background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(242, 249, 253, .96));
  border-right: 1px solid rgba(214, 226, 236, 0.9);
  display: grid;
  grid-template-rows: auto auto minmax(120px, 1fr);
  min-height: calc(100vh - 98px);
  padding: 18px 0 16px;
  position: sticky;
  top: calc(clamp(10px, 1.7vw, 22px) + 76px);
}

.pa-nav-mark {
  align-items: center;
  display: grid;
  gap: 4px;
  justify-items: center;
  margin: 0 12px 16px;
  padding: 8px 8px 12px;
  text-align: center;
}

.pa-nav-mascot {
  display: block;
  filter: drop-shadow(0 10px 16px rgba(36, 61, 92, 0.14));
  height: 62px;
  object-fit: contain;
  width: 70px;
}

.pa-nav-mark span {
  color: var(--pa-primary);
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: .06em;
  line-height: 1.1;
  text-transform: uppercase;
}

.pa-nav-mark small {
  color: var(--pa-muted);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.pa-product-nav nav {
  display: grid;
  gap: 7px;
  padding-right: 8px;
}

.pa-nav-link {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 0 10px 10px 0;
  color: #44546f;
  display: grid;
  font-size: 0.78rem;
  font-weight: 800;
  gap: 9px;
  grid-template-columns: 22px minmax(0, 1fr);
  min-height: 40px;
  padding: 0 10px 0 18px;
}

.pa-nav-link:hover,
.pa-nav-link.active {
  background: #eaf4ff;
  border-color: #c9dff4;
  color: #1e6fae;
}

.pa-nav-link.active {
  box-shadow: inset 4px 0 0 #1e6fae;
}

.pa-nav-scene {
  align-self: end;
  height: 160px;
  margin: 14px 14px 0;
  overflow: hidden;
  position: relative;
}

.pa-cloud {
  background: #c7e4f7;
  border-radius: 999px;
  display: block;
  height: 12px;
  opacity: .72;
  position: absolute;
  width: 52px;
}

.pa-cloud::before,
.pa-cloud::after {
  background: inherit;
  border-radius: inherit;
  content: '';
  position: absolute;
}

.pa-cloud::before { height: 20px; left: 10px; top: -8px; width: 24px; }
.pa-cloud::after { height: 16px; right: 8px; top: -5px; width: 20px; }
.pa-cloud.one { bottom: 104px; left: 10px; transform: scale(.78); }
.pa-cloud.two { bottom: 78px; right: 8px; transform: scale(.68); }

.pa-school-house {
  background: linear-gradient(180deg, #ffe2b8, #ffd08c);
  border: 2px solid #9ec8df;
  border-radius: 10px 10px 6px 6px;
  bottom: 24px;
  display: block;
  height: 56px;
  left: 26px;
  position: absolute;
  width: 82px;
}

.pa-school-house::before {
  border-left: 47px solid transparent;
  border-right: 47px solid transparent;
  border-bottom: 34px solid #8fc6e7;
  content: '';
  left: -8px;
  position: absolute;
  top: -31px;
}

.pa-school-house::after {
  background: #7ab661;
  border-radius: 999px 999px 0 0;
  bottom: -4px;
  content: '';
  height: 44px;
  position: absolute;
  right: -34px;
  width: 22px;
}

.pa-route-content {
  align-content: start;
  display: grid;
  gap: 16px;
  min-width: 0;
  padding: clamp(16px, 2.2vw, 28px);
}

.pa-mobile-nav {
  display: none;
}

@media (max-width: 1080px) {
  .pa-product-topbar {
    grid-template-columns: max-content minmax(0, 1fr) minmax(210px, 290px) 36px;
    padding-inline: 14px;
  }
  .pa-product-layout {
    grid-template-columns: 174px minmax(0, 1fr);
  }
  .pa-product-nav {
    min-height: calc(100vh - 94px);
  }
  .pa-institution-lockup {
    grid-template-columns: 38px max-content;
  }
  .pa-institution-logo {
    height: 38px;
    width: 38px;
  }
  .pa-husky-pass-logo {
    height: 34px;
    max-width: 74px;
  }
  .pa-institution-copy strong {
    font-size: 0.9rem;
  }
}

@media (max-width: 920px) {
  .pa-shell-app {
    padding: 0;
  }
  .pa-product-frame {
    border: 0;
    border-radius: 0;
    min-height: 100vh;
  }
  .pa-product-topbar {
    grid-template-columns: max-content minmax(0, 1fr) 36px;
    min-height: 64px;
    padding: 8px 12px;
    top: 0;
  }
  .pa-student-chip {
    display: none;
  }
  .pa-product-layout {
    grid-template-columns: 1fr;
  }
  .pa-product-nav {
    display: none;
  }
  .pa-route-content {
    gap: 12px;
    padding: 12px;
  }
  .pa-mobile-nav {
    background: rgba(255,255,255,.98);
    border: 1px solid #dce8f5;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(44, 79, 120, 0.08);
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 6px;
    position: sticky;
    top: 68px;
    z-index: 10;
  }
  .pa-mobile-nav a {
    align-items: center;
    border: 1px solid transparent;
    border-radius: 12px;
    color: var(--pa-muted);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: .76rem;
    font-weight: 800;
    gap: 6px;
    min-height: 34px;
    padding: 7px 9px;
  }
  .pa-mobile-nav a.active {
    background: #eaf4ff;
    border-color: #c9dff4;
    color: #1e6fae;
  }
}

@media (max-width: 640px) {
  .pa-product-topbar {
    gap: 8px;
  }
  .pa-product-lockup {
    gap: 8px;
  }
  .pa-institution-copy {
    display: none;
  }
  .pa-institution-lockup {
    grid-template-columns: 34px;
  }
  .pa-institution-logo {
    height: 34px;
    width: 34px;
  }
  .pa-lockup-divider {
    height: 24px;
  }
  .pa-husky-pass-logo {
    height: 30px;
    max-width: 64px;
  }
  .pa-logout {
    height: 32px;
    width: 32px;
  }
}
</style>