<template>
  <header class="admin-topbar" data-experience="admin">
    <div class="page-shell admin-topbar-primary">
      <NuxtLink class="admin-brand" :to="persona.homeTo" aria-label="Husky Pass Administración">
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <span>
          <strong>{{ persona.title }}</strong>
          <small>{{ persona.subtitle }}</small>
        </span>
      </NuxtLink>

      <nav class="admin-primary-nav" aria-label="Áreas de administración">
        <NuxtLink
          v-for="item in items"
          :key="item.key"
          :to="item.to"
          :class="{ active: isPrimaryActive(item.key), 'has-short-label': Boolean(item.shortLabel) }"
          :data-product-nav="item.key"
          :aria-label="item.label"
        >
          <FamilyPersonasIcon :name="item.icon" />
          <span class="full-label">{{ item.label }}</span>
          <span v-if="item.shortLabel" class="short-label" aria-hidden="true">{{ item.shortLabel }}</span>
        </NuxtLink>
      </nav>

      <div class="admin-account-slot">
        <TopbarAccountMenu :session="session" experience="admin" />
      </div>
    </div>

    <div class="admin-context-bar">
      <div class="page-shell admin-context-inner">
        <div class="admin-location" aria-label="Ubicación actual">
          <span class="location-icon"><FamilyPersonasIcon :name="currentArea.icon" /></span>
          <span>
            <small>{{ persona.context || 'Administración' }}</small>
            <strong>{{ currentArea.label }}</strong>
          </span>
        </div>

        <nav class="admin-secondary-nav" :aria-label="`Navegación de ${currentArea.label}`">
          <NuxtLink
            v-for="item in secondaryItems"
            :key="item.to"
            :to="item.to"
            :class="{ active: isSecondaryActive(item.to) }"
          >
            <FamilyPersonasIcon :name="item.icon" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useLazyFetch, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import type { GestionEscolarModuleKey, GestionEscolarOverviewResponse } from '~/types/gestionEscolar'
import type { MktEnrollmentOptionsResponse } from '~/types/mktEnrollment'
import type { AdminNavItem, AdminPersonaSummary } from '~/utils/adminExperience'
import { isEffectiveSuperAdmin } from '~/utils/sessionScopes'

const props = defineProps<{
  session?: PublicSession | null
  persona: AdminPersonaSummary
  items: AdminNavItem[]
}>()

interface ContextNavItem {
  label: string
  to: string
  icon: string
}

const route = useRoute()
const isSchoolRoute = computed(() => route.path.startsWith('/admin/gestion-escolar'))
const isMarketingRoute = computed(() => route.path.startsWith('/mkt'))
const isSuperAdmin = computed(() => isEffectiveSuperAdmin(props.session?.user))
const { data: schoolOverview, execute: loadSchoolOverview } = useLazyFetch<GestionEscolarOverviewResponse>('/api/admin/gestion-escolar/overview', {
  key: 'admin-shell-school-overview',
  immediate: false,
  timeout: 15000,
  dedupe: 'defer'
})

watch(isSchoolRoute, (active) => {
  if (active && !schoolOverview.value) void loadSchoolOverview()
}, { immediate: true })

const { data: enrollmentOptions, execute: loadEnrollmentOptions } = useLazyFetch<MktEnrollmentOptionsResponse>('/api/mkt/enrollment/options', {
  key: 'admin-shell-mkt-enrollment-options',
  immediate: false,
  server: false,
  timeout: 15000,
  dedupe: 'defer'
})

watch(isMarketingRoute, (active) => {
  if (active && !enrollmentOptions.value) void loadEnrollmentOptions()
}, { immediate: true })

const enrollmentAvailable = computed(() => Boolean(
  enrollmentOptions.value?.connected && enrollmentOptions.value.planteles.some((plantel) => plantel.available)
))

const currentArea = computed(() => {
  if (route.path.startsWith('/admin/superadmin')) return { key: 'platform', label: 'Plataforma', icon: 'people' }
  if (route.path.startsWith('/admin/gestion-escolar')) return { key: 'school', label: 'Escolar', icon: 'school' }
  if (route.path.startsWith('/admin/daycare')) return { key: 'daycare', label: 'Guardería', icon: 'daycare' }
  if (route.path.startsWith('/mkt')) return { key: 'marketing', label: 'Mercadotecnia', icon: 'announcement' }
  return { key: 'admin', label: 'Administración', icon: 'home' }
})

const schoolModuleMap: Record<GestionEscolarModuleKey, ContextNavItem> = {
  familias: { label: 'Familias', to: '/admin/gestion-escolar/familias', icon: 'people' },
  comunicados: { label: 'Comunicados', to: '/admin/gestion-escolar/comunicados', icon: 'announcement' },
  encuestas: { label: 'Encuestas', to: '/admin/gestion-escolar/encuestas', icon: 'survey' },
  convenios: { label: 'Convenios', to: '/admin/gestion-escolar/convenios', icon: 'handshake' }
}

const secondaryItems = computed<ContextNavItem[]>(() => {
  if (currentArea.value.key === 'platform') {
    return [
      { label: 'Usuarios', to: '/admin/superadmin', icon: 'people' },
      { label: 'Sistema', to: '/admin/superadmin/entorno', icon: 'security' },
      { label: 'Marbetes', to: '/admin/superadmin/marbetes', icon: 'marbete' }
    ]
  }

  if (currentArea.value.key === 'school') {
    const enabled = isSuperAdmin.value
      ? new Set<GestionEscolarModuleKey>(['familias', 'comunicados', 'encuestas', 'convenios'])
      : new Set((schoolOverview.value?.modules || []).filter((module) => module.enabled).map((module) => module.key))
    return [
      { label: 'Inicio', to: '/admin/gestion-escolar', icon: 'home' },
      ...(['familias', 'comunicados', 'encuestas', 'convenios'] as GestionEscolarModuleKey[])
        .filter((key) => enabled.has(key))
        .map((key) => schoolModuleMap[key])
    ]
  }

  if (currentArea.value.key === 'daycare') {
    return [{ label: 'Salas', to: '/admin/daycare/salas', icon: 'daycare' }]
  }

  if (currentArea.value.key === 'marketing') {
    return [
      { label: 'Hoy', to: '/mkt', icon: 'home' },
      { label: 'Informes', to: '/mkt/informes', icon: 'people' },
      ...(enrollmentAvailable.value ? [{ label: 'Matrícula', to: '/mkt/matricula-actual', icon: 'school' }] : []),
      { label: 'Bitácora', to: '/mkt/bitacora', icon: 'clipboard' }
    ]
  }

  return []
})

function isPrimaryActive(key: string) {
  return currentArea.value.key === key
}

function isSecondaryActive(to: string) {
  const target = to.split('?')[0] || to
  if (target === '/admin/superadmin') return route.path === target
  if (target === '/admin/gestion-escolar') return route.path === target
  if (target === '/admin/daycare/salas') return route.path.startsWith(target)
  if (target === '/mkt') return route.path === target
  return route.path === target || route.path.startsWith(`${target}/`)
}
</script>

<style scoped>
.admin-topbar {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid rgba(207, 219, 225, 0.82);
  position: sticky;
  top: 0;
  z-index: 30;
}

.admin-topbar-primary {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(180px, auto) minmax(0, 1fr) auto;
  min-height: 62px;
  padding-block: 7px;
}

.admin-brand {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: 38px minmax(0, 1fr);
  min-width: 0;
}

.admin-brand img {
  display: block;
  max-height: 35px;
  object-fit: contain;
}

.admin-brand span,
.admin-location > span:last-child {
  display: grid;
  min-width: 0;
}

.admin-brand strong,
.admin-brand small,
.admin-location strong,
.admin-location small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-brand strong {
  color: #172437;
  font-size: 0.9rem;
}

.admin-brand small,
.admin-location small {
  color: #6b7888;
  font-size: 0.68rem;
}

.admin-primary-nav,
.admin-secondary-nav {
  align-items: center;
  display: flex;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.admin-primary-nav::-webkit-scrollbar,
.admin-secondary-nav::-webkit-scrollbar {
  display: none;
}

.admin-primary-nav {
  gap: 4px;
}

.short-label {
  display: none;
}

.admin-primary-nav a,
.admin-secondary-nav a {
  align-items: center;
  border: 1px solid transparent;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 7px;
  white-space: nowrap;
}

.admin-primary-nav a {
  border-radius: 11px;
  color: #596879;
  font-size: 0.79rem;
  min-height: 38px;
  padding: 0 11px;
}

.admin-primary-nav a:hover,
.admin-primary-nav a.active {
  background: #edf7f4;
  border-color: #cde5de;
  color: #0b7269;
}

.admin-account-slot {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}

.admin-context-bar {
  background: rgba(247, 250, 249, 0.94);
  border-top: 1px solid rgba(219, 228, 231, 0.72);
}

.admin-context-inner {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(170px, auto) minmax(0, 1fr);
  min-height: 48px;
}

.admin-location {
  align-items: center;
  display: grid;
  gap: 9px;
  grid-template-columns: 30px minmax(0, 1fr);
  min-width: 0;
}

.location-icon {
  align-items: center;
  background: #e4f1ed;
  border-radius: 9px;
  color: #0b7269;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  width: 30px;
}

.admin-location strong {
  color: #253447;
  font-size: 0.81rem;
}

.admin-secondary-nav {
  gap: 3px;
}

.admin-secondary-nav a {
  border-radius: 9px;
  color: #647284;
  font-size: 0.75rem;
  min-height: 34px;
  padding: 0 10px;
}

.admin-secondary-nav a:hover,
.admin-secondary-nav a.active {
  background: #ffffff;
  border-color: #d7e4e2;
  box-shadow: 0 4px 12px rgba(31, 65, 72, 0.06);
  color: #0b6c64;
}

.admin-primary-nav :deep(.pa-icon),
.admin-secondary-nav :deep(.pa-icon),
.location-icon :deep(.pa-icon) {
  height: 17px;
  width: 17px;
}

@media (max-width: 980px) {
  .admin-topbar-primary {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas: 'brand account' 'nav nav';
  }
  .admin-brand { grid-area: brand; }
  .admin-primary-nav { grid-area: nav; }
  .admin-account-slot { grid-area: account; }
}

@media (max-width: 720px) {
  .admin-topbar-primary {
    gap: 7px;
    padding-bottom: 8px;
  }
  .admin-brand {
    grid-template-columns: 33px minmax(0, 1fr);
  }
  .admin-brand img { max-height: 31px; }
  .admin-brand small { display: none; }
  .admin-primary-nav a {
    justify-content: center;
    min-height: 39px;
    padding-inline: 10px;
  }
  .admin-context-inner {
    gap: 8px;
    grid-template-columns: 1fr;
    padding-block: 7px;
  }
  .admin-location { display: none; }
  .admin-secondary-nav a {
    flex: 1 0 max-content;
    justify-content: center;
    min-height: 37px;
  }
}

@media (max-width: 460px) {
  .admin-primary-nav {
    gap: 0;
    justify-content: space-between;
    overflow-x: visible;
  }
  .admin-primary-nav a {
    gap: 4px;
    min-width: 0;
    padding-inline: 6px;
  }
  .admin-primary-nav a span,
  .admin-secondary-nav a span {
    font-size: 0.66rem;
  }
  .admin-primary-nav :deep(.pa-icon) {
    height: 15px;
    width: 15px;
  }
  .admin-primary-nav a.has-short-label .full-label {
    display: none;
  }
  .admin-primary-nav a .short-label {
    display: inline;
  }
}
</style>
