<template>
  <main class="pa-shell-app" :style="themeVars" data-product-area="personas-autorizadas">
    <header class="pa-product-topbar">
      <NuxtLink class="pa-brand" to="/familia/personas-autorizadas" :aria-label="`${institution} Personas Autorizadas`">
        <img :src="institutionLogo" :alt="institution" />
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
      <img class="pa-top-ambassador" :src="headerMascot" :alt="`${levelName.spanish} ambassador`" />
    </header>

    <div class="pa-product-layout">
      <aside class="pa-product-nav" aria-label="Navegación Personas Autorizadas">
        <div class="pa-nav-mark">
          <img :src="navMascot" alt="" />
          <span>{{ levelName.spanish }}</span>
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
  --pa-gray: #50535a;
  --pa-muted: #86888c;
  background: #f4f4f4;
  color: var(--pa-gray);
  min-height: 100vh;
}

.pa-product-topbar {
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e7e7e7;
  display: grid;
  gap: 10px;
  grid-template-columns: 206px minmax(0, 1fr) minmax(190px, 270px) auto;
  min-height: 64px;
  padding: 6px clamp(12px, 2.2vw, 24px);
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

.pa-brand img { display: block; max-height: 48px; object-fit: contain; object-position: left center; width: 82px; }
.pa-top-copy { display: grid; gap: 2px; min-width: 0; }
.pa-top-copy span { color: var(--pa-primary); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
.pa-top-copy strong { color: #50535a; font-size: clamp(1.05rem, 1.6vw, 1.36rem); letter-spacing: -0.02em; line-height: 1.02; }
.pa-top-copy small, .pa-student-chip strong, .pa-student-chip small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pa-top-copy small { color: var(--pa-muted); font-weight: 600; }

.pa-student-chip {
  align-items: center;
  background: #f8f8f6;
  border: 1px solid #ecece7;
  border-radius: 999px;
  display: grid;
  gap: 10px;
  grid-template-columns: 34px minmax(0, 1fr);
  min-width: 0;
  padding: 5px 10px 5px 5px;
}
.pa-student-avatar { aspect-ratio: 1; background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 999px; color: var(--pa-primary); display: grid; font-weight: 600; overflow: hidden; place-items: center; }
.pa-student-avatar img { height: 100%; object-fit: cover; width: 100%; }
.pa-student-chip strong, .pa-student-chip small { display: block; }
.pa-student-chip strong { color: var(--pa-gray); font-size: 0.86rem; line-height: 1.1; }
.pa-student-chip small { color: var(--pa-muted); font-size: 0.72rem; font-weight: 600; }
.pa-logout { background: #fff; border: 1px solid var(--pa-border); border-radius: 999px; color: var(--pa-primary); cursor: pointer; font: inherit; font-size: 0.82rem; font-weight: 600; min-height: 34px; padding: 0 12px; }
.pa-logout:hover { background: var(--pa-soft); }
.pa-top-ambassador { display: none; }

.pa-product-layout { display: grid; grid-template-columns: 206px minmax(0, 1fr); }
.pa-product-nav { background: #fff; border-right: 1px solid #e0e0e0; min-height: calc(100vh - 64px); padding: 10px 0 18px; position: sticky; top: 64px; }
.pa-nav-mark { align-items: center; background: var(--pa-soft); border: 1px solid var(--pa-border); border-radius: 16px; display: grid; gap: 6px; justify-items: center; margin: 0 12px 10px; padding: 8px; text-align: center; }
.pa-nav-mark img { height: 44px; object-fit: contain; }
.pa-nav-mark span { color: var(--pa-primary); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }
.pa-product-nav nav { display: grid; gap: 4px; }
.pa-nav-link { align-items: center; border: 1px solid transparent; border-radius: 0 14px 14px 0; color: #73757a; display: grid; font-size: 0.84rem; font-weight: 600; gap: 8px; grid-template-columns: 22px minmax(0, 1fr); margin-right: 10px; min-height: 36px; padding: 0 12px 0 18px; }
.pa-nav-link:hover, .pa-nav-link.active { background: var(--pa-soft); border-color: var(--pa-border); color: var(--pa-primary); }
.pa-nav-link.active { box-shadow: inset 5px 0 0 var(--pa-primary); }
.pa-route-content { display: grid; gap: 12px; padding: clamp(10px, 2.2vw, 20px); }
.pa-mobile-nav { display: none; }

@media (max-width: 1060px) {
  .pa-product-topbar { grid-template-columns: 82px minmax(0, 1fr) auto; }
  .pa-student-chip { display: none; }
}
@media (max-width: 920px) {
  .pa-product-layout { grid-template-columns: 1fr; }
  .pa-product-nav { display: none; }
  .pa-route-content { padding-top: 10px; }
  .pa-mobile-nav { background: rgba(255,255,255,.94); border: 1px solid #e7e7e7; border-radius: 16px; display: flex; gap: 6px; overflow-x: auto; padding: 6px; position: sticky; top: 64px; z-index: 10; }
  .pa-mobile-nav a { align-items: center; border-radius: 999px; color: var(--pa-muted); display: inline-flex; flex: 0 0 auto; gap: 6px; font-size: .8rem; font-weight: 600; min-height: 34px; padding: 7px 9px; }
  .pa-mobile-nav a.active { background: var(--pa-soft); color: var(--pa-primary); }
}
@media (max-width: 640px) {
  .pa-product-topbar { gap: 8px; grid-template-columns: 64px minmax(0, 1fr) auto; }
  .pa-brand img { width: 58px; }
  .pa-logout { min-height: 32px; padding: 0 9px; }
  .pa-top-copy small { display: none; }
}
@media (prefers-reduced-motion: no-preference) {
  .pa-top-ambassador, .pa-nav-mark img { animation: pa-ambassador-float 5s ease-in-out infinite; }
  @keyframes pa-ambassador-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
}
</style>
