<template>
  <main class="pa-shell-app" :style="themeVars" data-product-area="personas-autorizadas">
    <header class="pa-product-topbar">
      <NuxtLink class="pa-brand" to="/familia/personas-autorizadas" :aria-label="`${institution} Husky Pass Personas Autorizadas`">
        <span class="pa-product-lockup">
          <img class="pa-institution-logo" :src="institutionLogo" :alt="institution" />
          <span class="pa-lockup-divider" aria-hidden="true"></span>
          <img class="pa-husky-pass-logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        </span>
      </NuxtLink>

      <div class="pa-top-copy">
        <span>{{ institution }}</span>
        <strong>{{ title }}</strong>
        <small>{{ activeStudentLine }}</small>
      </div>

      <section v-if="primaryChild" class="pa-student-chip" data-product-panel="active-student" aria-label="Alumno activo">
        <span class="pa-student-avatar">
          <FamilyPersonasProcessedPhoto v-if="studentPhoto" :src="studentPhoto" namespace="pa-active-student" />
          <b v-else>{{ studentInitials }}</b>
        </span>
        <span>
          <strong>{{ studentName || 'Alumno' }}</strong>
          <small>{{ contextLine }}</small>
        </span>
      </section>

      <button class="pa-logout" type="button" data-diagnostic-action="logout-personas-autorizadas" @click="logout">Salir</button>
      <img v-if="headerMascot" class="pa-top-ambassador" :src="headerMascot" :alt="`${levelName.spanish} ambassador`" />
    </header>

    <div class="pa-product-layout">
      <aside class="pa-product-nav" aria-label="Navegación Personas Autorizadas">
        <div class="pa-nav-mark">
          <img v-if="navMascot" class="pa-nav-mascot" :src="navMascot" alt="" loading="lazy" decoding="async" />
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
import { navigateTo, useRoute } from 'nuxt/app'
import { personasInstitutionLogo, personasInstitutionName, personasLevelName, personasMascot } from '~/utils/personasTheme'
import { usePersonasFamilyTheme } from '~/composables/usePersonasTheme'
import { defaultLoginRouteForExperience } from '~/utils/experienceIdentity'

const props = withDefaults(defineProps<{ title?: string }>(), { title: 'Personas Autorizadas' })
const route = useRoute()
const { primaryChild, studentName, studentPhoto, theme, themeVars } = usePersonasFamilyTheme({ key: 'shell' })
const studentInitials = computed(() => (studentName.value || 'A').split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''))
const headerMascot = computed(() => personasMascot(theme.value, 'header'))
const navMascot = computed(() => personasMascot(theme.value, 'transition'))
const levelName = computed(() => personasLevelName(theme.value))
const institution = computed(() => personasInstitutionName(theme.value))
const institutionLogo = computed(() => personasInstitutionLogo(theme.value))
const title = computed(() => props.title)
const contextLine = computed(() => [primaryChild.value?.nivelEdu, primaryChild.value?.grado, primaryChild.value?.grupo].filter(Boolean).join(' / ') || 'Cuenta familiar')
const activeStudentLine = computed(() => studentName.value ? `Alumno activo: ${studentName.value}` : 'Cuenta familiar')

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

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo(defaultLoginRouteForExperience(theme.value.key === 'daycare' ? 'guarderia' : 'escolar'))
}
</script>

<style scoped>
.pa-shell-app {
  --pa-primary: #618b2f;
  --pa-primary-rgb: 97, 139, 47;
  --pa-contrast: #fff;
  --pa-soft: rgba(97, 139, 47, 0.12);
  --pa-border: rgba(97, 139, 47, 0.28);
  --pa-gray: #50535a;
  --pa-muted: #86888c;
  background: linear-gradient(180deg, #fbfcf8 0%, #f3f5ee 100%);
  color: var(--pa-gray);
  min-height: 100vh;
}

.pa-product-topbar {
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid rgba(222, 226, 216, 0.9);
  display: grid;
  gap: 12px;
  grid-template-columns: max-content minmax(0, 1fr) minmax(220px, 300px) auto;
  min-height: 62px;
  padding: 6px clamp(12px, 2.2vw, 24px) 6px clamp(10px, 1.4vw, 16px);
  position: sticky;
  top: 0;
  z-index: 20;
}

.pa-product-topbar::after {
  background: linear-gradient(to right, #a1ce58, #ef4b4b, #fec63e, #5aa6db);
  bottom: 0;
  content: '';
  height: 4px;
  left: 0;
  position: absolute;
  width: 100%;
}

.pa-brand {
  align-items: center;
  align-self: stretch;
  display: flex;
  justify-self: start;
  min-width: 0;
  width: max-content;
}
.pa-product-lockup {
  align-items: center;
  display: inline-grid;
  gap: 10px;
  grid-template-columns: max-content 1px max-content;
  justify-content: start;
  min-width: 0;
  width: max-content;
}
.pa-brand img { display: block; object-fit: contain; object-position: center; }
.pa-institution-logo { height: 44px; max-width: 52px; width: auto; }
.pa-lockup-divider { background: rgba(var(--pa-primary-rgb), .28); height: 30px; width: 1px; }
.pa-husky-pass-logo { height: 38px; max-width: 82px; width: auto; }
.pa-top-copy { display: grid; gap: 2px; min-width: 0; }
.pa-top-copy span { color: var(--pa-primary); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
.pa-top-copy strong { color: #50535a; font-size: clamp(1.05rem, 1.6vw, 1.36rem); letter-spacing: -0.02em; line-height: 1.02; }
.pa-top-copy small, .pa-student-chip strong, .pa-student-chip small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pa-top-copy small { color: var(--pa-muted); font-weight: 600; }

.pa-student-chip {
  align-items: center;
  background: #f8f8f6;
  border: 1px solid #ecece7;
  border-radius: 12px;
  display: grid;
  gap: 10px;
  grid-template-columns: 34px minmax(0, 1fr);
  min-width: 0;
  padding: 5px 10px 5px 5px;
}
.pa-student-avatar { aspect-ratio: 1; background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 10px; color: var(--pa-primary); display: grid; font-weight: 600; overflow: hidden; place-items: center; }
.pa-student-avatar img { height: 100%; object-fit: cover; width: 100%; }
.pa-student-chip strong, .pa-student-chip small { display: block; }
.pa-student-chip strong { color: var(--pa-gray); font-size: 0.86rem; line-height: 1.1; }
.pa-student-chip small { color: var(--pa-muted); font-size: 0.72rem; font-weight: 600; }
.pa-logout { background: #fff; border: 1px solid var(--pa-border); border-radius: 10px; color: var(--pa-primary); cursor: pointer; font: inherit; font-size: 0.82rem; font-weight: 600; min-height: 34px; padding: 0 12px; }
.pa-logout:hover { background: var(--pa-soft); }
.pa-top-ambassador { display: none; } 

.pa-product-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); }
.pa-product-nav { background: rgba(255, 255, 255, 0.96); border-right: 1px solid rgba(222, 226, 216, 0.9); min-height: calc(100vh - 62px); padding: 12px 0 18px; position: sticky; top: 62px; }
.pa-nav-mark { align-items: center; background: linear-gradient(180deg, #fff, rgba(var(--pa-primary-rgb), .07)); border: 1px solid var(--pa-border); border-radius: 14px; display: grid; gap: 4px; margin: 0 12px 12px; padding: 12px; }
.pa-nav-mascot { display: block; filter: drop-shadow(0 10px 16px rgba(0,0,0,.12)); height: 56px; justify-self: center; object-fit: contain; width: 72px; }
.pa-nav-mark span { color: var(--pa-primary); font-size: 0.82rem; font-weight: 800; letter-spacing: .08em; line-height: 1.1; text-align: center; text-transform: uppercase; }
.pa-nav-mark small { color: var(--pa-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.pa-product-nav nav { display: grid; gap: 4px; }
.pa-nav-link { align-items: center; border: 1px solid transparent; border-radius: 0 12px 12px 0; color: #73757a; display: grid; font-size: 0.84rem; font-weight: 700; gap: 8px; grid-template-columns: 22px minmax(0, 1fr); margin-right: 10px; min-height: 38px; padding: 0 12px 0 18px; }
.pa-nav-link:hover, .pa-nav-link.active { background: var(--pa-soft); border-color: var(--pa-border); color: var(--pa-primary); }
.pa-nav-link.active { box-shadow: inset 4px 0 0 var(--pa-primary); }
.pa-route-content { align-content: start; display: grid; gap: 12px; padding: clamp(10px, 2.2vw, 20px); }
.pa-mobile-nav { display: none; }


@media (min-width: 1280px) {
  .pa-top-ambassador {
    bottom: 2px;
    display: block;
    filter: drop-shadow(0 10px 16px rgba(0,0,0,.12));
    height: 58px;
    object-fit: contain;
    pointer-events: none;
    position: absolute;
    right: clamp(86px, 8vw, 124px);
    width: 76px;
    z-index: 1;
  }
}

@media (max-width: 1060px) {
  .pa-product-topbar { grid-template-columns: max-content minmax(0, 1fr) auto; }
  .pa-student-chip { display: none; }
  .pa-institution-logo { height: 40px; max-width: 48px; }
  .pa-husky-pass-logo { height: 34px; max-width: 74px; }
}
@media (max-width: 920px) {
  .pa-product-layout { grid-template-columns: 1fr; }
  .pa-product-nav { display: none; }
  .pa-route-content { padding-top: 10px; }
  .pa-mobile-nav { background: rgba(255,255,255,.96); border: 1px solid #e7e7e7; border-radius: 14px; display: flex; gap: 6px; overflow-x: auto; padding: 6px; position: sticky; top: 62px; z-index: 10; }
  .pa-mobile-nav a { align-items: center; border: 1px solid transparent; border-radius: 10px; color: var(--pa-muted); display: inline-flex; flex: 0 0 auto; gap: 6px; font-size: .8rem; font-weight: 700; min-height: 34px; padding: 7px 9px; }
  .pa-mobile-nav a.active { background: var(--pa-soft); border-color: var(--pa-border); color: var(--pa-primary); }
}
@media (max-width: 640px) {
  .pa-product-topbar { gap: 8px; grid-template-columns: max-content minmax(0, 1fr) auto; padding-left: 10px; }
  .pa-product-lockup { gap: 6px; }
  .pa-institution-logo { height: 32px; max-width: 38px; }
  .pa-husky-pass-logo { height: 28px; max-width: 58px; }
  .pa-lockup-divider { height: 20px; }
  .pa-logout { min-height: 32px; padding: 0 9px; }
  .pa-top-copy span, .pa-top-copy small { display: none; }
  .pa-top-copy strong { font-size: 0.94rem; line-height: 1.05; }
}
</style>
