<template>
  <header class="role-topbar family-topbar" :data-experience="identity.context.experience">
    <div class="page-shell role-topbar-inner">
      <NuxtLink class="brand-lockup" :to="homeTo" :aria-label="brandLabel">
        <img class="brand-logo" :src="brandLogo" :alt="brandLabel" />
        <span class="brand-copy">
          <strong>{{ brandTitle }}</strong>
          <small>{{ contextLine }}</small>
        </span>
      </NuxtLink>

      <nav class="role-nav" aria-label="Navegacion familiar">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }" :data-product-nav="item.key">
          <FamilyPersonasIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <section v-if="activeStudent" class="student-chip" aria-label="Alumno activo">
        <span>{{ activeStudent.label }}</span>
        <strong>{{ activeStudent.value }}</strong>
      </section>

      <TopbarAccountMenu :session="session" :experience="identity.context.experience" :security-to="securityTo" />
    </div>

    <div v-if="session?.user?.impersonation" class="impersonation-strip">
      <div class="page-shell">
        <strong>Vista administrativa activa</strong>
        <span>Estas operando como familia.</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import type { ExperienceVisualIdentity } from '~/types/identity'
import { displayMatriculaCandidate } from '~/utils/matricula'
import { hasFamilyScope } from '~/utils/sessionScopes'

const props = defineProps<{
  session?: PublicSession | null
  homeTo: string
  identity: ExperienceVisualIdentity
}>()

const route = useRoute()
const isGuarderia = computed(() => props.identity.context.experience === 'guarderia')
const brandLogo = computed(() => props.identity.assets.wordmark || props.identity.assets.logo || '/brand/husky-pass-logo.png')
const brandLabel = computed(() => isGuarderia.value ? 'Husky Pass Guarderia' : props.identity.label || 'Husky Pass')
const brandTitle = computed(() => isGuarderia.value ? 'Guarderia' : props.identity.shortLabel || 'Escolar')
const contextLine = computed(() => {
  const user = props.session?.user
  if (!user) return props.identity.officialName
  if (isGuarderia.value) return [user.scopes.daycare?.unidad, user.scopes.daycare?.sala ? `Sala ${user.scopes.daycare.sala}` : null].filter(Boolean).join(' / ') || 'Familia guarderia'
  return [props.identity.levelLabel, props.identity.context.plantel].filter(Boolean).join(' / ') || props.identity.officialName
})
const activeStudent = computed(() => {
  const user = props.session?.user
  if (!user || user.kind !== 'family') return null
  if (isGuarderia.value) {
    return { label: 'Sala', value: [user.scopes.daycare?.unidad, user.scopes.daycare?.sala].filter(Boolean).join(' / ') || 'Guarderia' }
  }
  const matricula = displayMatriculaCandidate(user.username)
  return matricula ? { label: 'Matricula', value: matricula } : null
})
const securityTo = computed(() => `/familia/cuenta/seguridad?experiencia=${isGuarderia.value ? 'guarderia' : 'escolar'}`)
const navItems = computed(() => {
  const user = props.session?.user
  const items: Array<{ key: string; label: string; to: string; icon: string }> = []
  if (isGuarderia.value && hasFamilyScope(user, 'daycare')) {
    items.push(
      { key: 'daycare-home', label: 'Inicio', to: '/familia/daycare', icon: 'home' },
      { key: 'daycare-tareas', label: 'Tareas', to: '/familia/daycare/tareas', icon: 'edit' },
      { key: 'daycare-avisos', label: 'Avisos', to: '/familia/daycare/avisos', icon: 'survey' },
      { key: 'daycare-calendario', label: 'Calendario', to: '/familia/daycare/calendario', icon: 'calendar' }
    )
  }
  if (!isGuarderia.value && hasFamilyScope(user, 'personasAutorizadas')) {
    items.push({ key: 'personas-autorizadas', label: 'Personas', to: '/familia/personas-autorizadas', icon: 'people' })
  }
  items.push({ key: 'seguridad', label: 'Seguridad', to: securityTo.value, icon: 'security' })
  return items
})

function isActive(to: string) {
  const target = to.split('?')[0] || to
  return route.path === target || (target !== '/familia/daycare' && route.path.startsWith(`${target}/`))
}
</script>

<style scoped>
.role-topbar {
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 24;
}

.role-topbar-inner {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(190px, auto) minmax(0, 1fr) auto auto;
  min-height: var(--topbar-height);
}

.brand-lockup {
  align-items: center;
  display: inline-grid;
  gap: 10px;
  grid-template-columns: auto minmax(0, 1fr);
  min-width: 0;
}

.brand-logo {
  display: block;
  max-height: 38px;
  max-width: 112px;
  object-fit: contain;
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
  font-size: 0.9rem;
}

.brand-copy small,
.student-chip span {
  color: var(--color-muted);
  font-size: 0.72rem;
}

.role-nav {
  align-items: center;
  display: flex;
  gap: 5px;
  min-width: 0;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
}

.role-nav::-webkit-scrollbar {
  display: none;
}

.role-nav a {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--color-muted);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.82rem;
  gap: 7px;
  min-height: 36px;
  padding: 0 10px;
}

.role-nav a:hover,
.role-nav a.active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-800);
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

.impersonation-strip {
  background: var(--color-brand-800);
  color: #fff;
  font-size: 0.82rem;
}

.impersonation-strip .page-shell {
  align-items: center;
  display: flex;
  gap: 8px;
  min-height: 28px;
}

@media (max-width: 1060px) {
  .role-topbar-inner {
    grid-template-columns: minmax(150px, auto) minmax(0, 1fr) auto;
  }

  .student-chip {
    display: none;
  }
}

@media (max-width: 760px) {
  .role-topbar-inner {
    gap: 7px;
    grid-template-columns: minmax(0, 1fr) auto;
    padding-block: 6px;
  }

  .brand-logo {
    max-height: 32px;
    max-width: 88px;
  }

  .brand-copy small {
    display: none;
  }

  .role-nav {
    grid-column: 1 / -1;
    order: 3;
  }

  .role-nav a {
    min-height: 34px;
    padding-inline: 9px;
  }
}
</style>
