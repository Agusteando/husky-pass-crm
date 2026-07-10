<template>
  <header class="role-topbar family-topbar" :data-experience="identity.context.experience">
    <div class="page-shell role-topbar-inner">
      <NuxtLink class="brand-lockup" :to="homeTo" :aria-label="brandLabel">
        <span class="brand-logo-wrap">
          <img class="brand-logo" :src="brandLogo" :alt="brandLabel" />
        </span>
        <span class="brand-copy">
          <strong>{{ brandTitle }}</strong>
          <small>{{ contextLine }}</small>
        </span>
      </NuxtLink>

      <nav class="role-nav" aria-label="Navegación familiar">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="{ active: isActive(item.to) }"
          :data-product-nav="item.key"
        >
          <FamilyPersonasIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <section v-if="activeStudent && !isGuarderia" class="student-chip" aria-label="Alumno activo">
        <span>{{ activeStudent.label }}</span>
        <strong>{{ activeStudent.value }}</strong>
      </section>

      <TopbarAccountMenu
        :session="session"
        :experience="identity.context.experience"
        :security-to="securityTo"
        :presentation="isGuarderia ? 'compact' : 'standard'"
      />
    </div>

    <div v-if="session?.user?.impersonation" class="impersonation-strip">
      <div class="page-shell">
        <span><strong>Vista familiar</strong></span>
        <button type="button" data-diagnostic-action="terminar-impersonacion" @click="exitImpersonation">
          <FamilyPersonasIcon name="arrow" />
          {{ adminReturnLabel }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import type { ExperienceVisualIdentity } from '~/types/identity'
import { displayMatriculaCandidate } from '~/utils/matricula'
import { defaultAdminRoute, hasFamilyScope } from '~/utils/sessionScopes'
import { setCachedRouteSession } from '~/utils/routeSession'

const props = defineProps<{
  session?: PublicSession | null
  homeTo: string
  identity: ExperienceVisualIdentity
}>()

const route = useRoute()
const isGuarderia = computed(() => props.identity.context.experience === 'guarderia')
const brandLogo = computed(() => props.identity.assets.logo || props.identity.assets.wordmark || '/brand/husky-pass-logo.png')
const brandLabel = computed(() => isGuarderia.value ? 'Husky Pass Guardería' : props.identity.label || 'Husky Pass')
const brandTitle = computed(() => isGuarderia.value ? 'Husky Pass' : props.identity.shortLabel || 'Escolar')
const contextLine = computed(() => {
  const user = props.session?.user
  if (!user) return isGuarderia.value ? 'Guardería' : props.identity.officialName
  if (isGuarderia.value) {
    return ['Guardería', user.scopes.daycare?.unidad, user.scopes.daycare?.sala ? `Sala ${user.scopes.daycare.sala}` : null]
      .filter(Boolean)
      .join(' · ')
  }
  return [props.identity.levelLabel, props.identity.context.plantel].filter(Boolean).join(' / ') || props.identity.officialName
})
const activeStudent = computed(() => {
  const user = props.session?.user
  if (!user || user.kind !== 'family') return null
  const matricula = displayMatriculaCandidate(user.username)
  return matricula ? { label: 'Matrícula', value: matricula } : null
})
const securityTo = computed(() => `/familia/cuenta/seguridad?experiencia=${isGuarderia.value ? 'guarderia' : 'escolar'}`)
const adminReturnLabel = computed(() => props.session?.user?.impersonation?.admin?.isSuperAdmin ? 'Volver a Super Admin' : 'Volver a admin')
const navItems = computed(() => {
  const user = props.session?.user
  const items: Array<{ key: string; label: string; to: string; icon: string }> = []
  if (isGuarderia.value && hasFamilyScope(user, 'daycare')) {
    items.push(
      { key: 'daycare-home', label: 'Inicio', to: '/familia/daycare', icon: 'home' },
      { key: 'daycare-tareas', label: 'Tareas', to: '/familia/daycare/tareas', icon: 'edit' },
      { key: 'daycare-avisos', label: 'Avisos', to: '/familia/daycare/avisos', icon: 'announcement' },
      { key: 'daycare-calendario', label: 'Agenda', to: '/familia/daycare/calendario', icon: 'calendar' }
    )
  }
  if (!isGuarderia.value && hasFamilyScope(user, 'personasAutorizadas')) {
    items.push({ key: 'personas-autorizadas', label: 'Personas', to: '/familia/personas-autorizadas', icon: 'people' })
    items.push({ key: 'seguridad', label: 'Seguridad', to: securityTo.value, icon: 'security' })
  }
  return items
})

function isActive(to: string) {
  const target = to.split('?')[0] || to
  return route.path === target || (target !== '/familia/daycare' && route.path.startsWith(`${target}/`))
}

async function exitImpersonation() {
  const impersonation = props.session?.user?.impersonation
  const target = impersonation?.admin ? defaultAdminRoute(impersonation.admin) : '/admin/daycare/salas'
  await $fetch('/api/auth/impersonation/exit', { method: 'POST' })
  setCachedRouteSession(null)
  await navigateTo(target)
}
</script>

<style scoped>
.role-topbar {
  background: rgba(255, 255, 255, 0.91);
  border-bottom: 1px solid rgba(45, 95, 36, 0.1);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 24;
}

.role-topbar-inner {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(210px, auto) minmax(0, 1fr) auto auto;
  min-height: 68px;
}

.brand-lockup {
  align-items: center;
  display: inline-grid;
  gap: 10px;
  grid-template-columns: auto minmax(0, 1fr);
  min-width: 0;
}

.brand-logo-wrap {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(53, 95, 36, 0.12);
  border-radius: 15px;
  box-shadow: 0 7px 18px rgba(45, 73, 31, 0.08);
  display: inline-flex;
  height: 46px;
  justify-content: center;
  overflow: hidden;
  width: 46px;
}

.brand-logo {
  display: block;
  height: 38px;
  object-fit: contain;
  width: 38px;
}

.brand-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.brand-copy strong,
.brand-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-copy strong {
  color: var(--color-ink);
  font-family: var(--font-title);
  font-size: 1rem;
}

.brand-copy small,
.student-chip span {
  color: var(--color-muted);
  font-size: 0.69rem;
}

.role-nav {
  align-items: center;
  display: flex;
  gap: 4px;
  justify-self: center;
  min-width: 0;
  padding: 4px;
}

.role-nav a {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 14px;
  color: #6f7a69;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.78rem;
  gap: 7px;
  min-height: 40px;
  padding: 0 12px;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.role-nav a:hover {
  color: var(--color-brand-800);
  transform: translateY(-1px);
}

.role-nav a.active {
  background: #eff7e7;
  border-color: #d9eac9;
  color: var(--color-brand-800);
}

.role-nav a :deep(.pa-icon) {
  height: 1rem;
  width: 1rem;
}

.student-chip {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 12px;
  display: grid;
  gap: 1px;
  max-width: 170px;
  min-width: 110px;
  padding: 6px 10px;
}

.student-chip strong {
  color: var(--color-brand-800);
  font-size: 0.82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-topbar[data-experience='guarderia'] .role-topbar-inner {
  grid-template-columns: minmax(210px, auto) minmax(0, 1fr) auto;
  max-width: 1240px;
}

.impersonation-strip {
  background: var(--color-brand-800);
  color: #fff;
  font-size: 0.78rem;
}

.impersonation-strip .page-shell {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  min-height: 30px;
}

.impersonation-strip button {
  align-items: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-weight: 800;
  gap: 6px;
  min-height: 25px;
  padding: 0 10px;
}

@media (max-width: 980px) {
  .role-topbar-inner,
  .family-topbar[data-experience='guarderia'] .role-topbar-inner {
    grid-template-columns: minmax(180px, auto) minmax(0, 1fr) auto;
  }

  .role-nav {
    justify-self: end;
  }

  .role-nav a span {
    display: none;
  }

  .role-nav a {
    justify-content: center;
    padding: 0;
    width: 40px;
  }
}

@media (max-width: 760px) {
  .role-topbar-inner,
  .family-topbar[data-experience='guarderia'] .role-topbar-inner {
    gap: 8px;
    grid-template-columns: minmax(0, 1fr) auto;
    min-height: 62px;
    padding-block: 6px;
  }

  .role-nav {
    display: none;
  }

  .brand-logo-wrap {
    border-radius: 13px;
    height: 42px;
    width: 42px;
  }

  .brand-logo {
    height: 34px;
    width: 34px;
  }

  .brand-copy strong {
    font-size: 0.92rem;
  }

  .brand-copy small {
    font-size: 0.64rem;
  }
}

@media (max-width: 380px) {
  .brand-copy small {
    display: none;
  }
}
</style>
