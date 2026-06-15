<template>
  <header class="topbar">
    <div class="page-shell topbar-inner">
      <BrandMark :to="homeTo" />
      <nav v-if="items.length" class="topbar-nav" aria-label="Navegación principal">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :class="{ active: isActive(item.to) }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :data-product-nav="navKey(item.label)"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="profile" v-if="session?.user">
        <img v-if="session.user.picture" :src="session.user.picture" alt="" />
        <span v-else class="avatar">{{ initials }}</span>
        <div class="profile-copy">
          <strong>{{ profileName }}</strong>
          <small>{{ profileDetail }}</small>
        </div>
        <div class="scope-badges" data-diagnostic="session-role">
          <span>{{ sessionRoleLabel }}</span>
          <small v-if="sessionScopeLabel">{{ sessionScopeLabel }}</small>
        </div>
        <button v-if="session.user.impersonation" class="btn btn-primary compact-action" type="button" data-diagnostic-action="salir-impersonacion" @click="exitImpersonation">Volver</button>
        <button class="btn btn-secondary compact-action" type="button" data-diagnostic-action="logout" @click="logout">Salir</button>
      </div>
    </div>
    <div v-if="session?.user?.impersonation" class="impersonation-bar">
      <div class="page-shell impersonation-inner">
        <strong>{{ impersonationLabel }}</strong>
        <span>{{ session.user.displayName || displayMatriculaCandidate(session.user.username) || session.user.email }}</span>
        <button class="link-button" type="button" data-diagnostic-action="terminar-impersonacion" @click="exitImpersonation">Terminar vista</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { displayMatriculaCandidate } from '~/utils/matricula'
import { navigateTo, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { defaultLoginRouteForExperience } from '~/utils/experienceIdentity'

const props = defineProps<{
  session?: PublicSession | null
  homeTo: string
  items: Array<{ label: string; to: string }>
}>()

const route = useRoute()

const profileName = computed(() => props.session?.user?.displayName || displayMatriculaCandidate(props.session?.user?.username) || props.session?.user?.email || 'Usuario')
const profileDetail = computed(() => props.session?.user?.email || displayMatriculaCandidate(props.session?.user?.username) || sessionRoleLabel.value)

const sessionRoleLabel = computed(() => {
  const user = props.session?.user
  if (!user) return ''
  if (user.kind === 'admin') return user.isSuperAdmin ? 'Superadmin' : 'Admin guardería'
  if (user.productScopes.includes('daycare') && user.productScopes.includes('personasAutorizadas')) return 'Familia multiproducto'
  if (user.productScopes.includes('daycare')) return 'Familia guardería'
  if (user.productScopes.includes('personasAutorizadas')) return 'Personas Autorizadas'
  return 'Sesión familiar'
})

const sessionScopeLabel = computed(() => {
  const user = props.session?.user
  if (!user) return ''
  if (user.kind === 'admin') return user.unidades.length ? user.unidades.join(' · ') : 'Sin unidad asignada'
  const daycare = user.scopes.daycare
  if (daycare) return `${daycare.unidad} · Sala ${daycare.sala}`
  return user.campus || user.empresa || ''
})

const initials = computed(() => {
  const source = props.session?.user?.displayName || displayMatriculaCandidate(props.session?.user?.username) || props.session?.user?.email || 'HP'
  return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
})

const impersonationLabel = computed(() => {
  return props.session?.user?.impersonation?.mode === 'account' ? 'Impersonación activa' : 'Vista familiar de sala activa'
})

function isActive(to: string) {
  const targetPath = to.split('?')[0] || to
  if (targetPath === '/admin/superadmin') return route.path === '/admin/superadmin'
  if (targetPath === '/admin/daycare/salas') return route.path.startsWith('/admin/daycare')
  return route.path === targetPath || route.path.startsWith(`${targetPath}/`)
}

function navKey(label: string) {
  return label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
}

async function exitImpersonation() {
  const impersonation = props.session?.user?.impersonation
  const target = impersonation?.mode === 'daycarePreview'
    ? '/admin/daycare/salas'
    : impersonation?.admin?.isSuperAdmin ? '/admin/superadmin' : '/admin/daycare/salas'
  await $fetch('/api/auth/impersonation/exit', { method: 'POST' })
  await navigateTo(target)
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  const target = props.session?.user?.kind === 'admin'
    ? defaultLoginRouteForExperience('admin')
    : route.path.startsWith('/familia/daycare')
      ? defaultLoginRouteForExperience('guarderia')
      : route.path.startsWith('/familia/personas-autorizadas') || route.path.startsWith('/familia/asistencia')
        ? defaultLoginRouteForExperience('escolar')
        : '/login'
  await navigateTo(target)
}
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(18px);
  background: rgba(251, 252, 248, 0.92);
  border-bottom: 1px solid rgba(223, 232, 215, 0.78);
}

.topbar-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: var(--topbar-height);
}

.topbar-nav {
  display: flex;
  gap: 6px;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  padding: 4px;
  scrollbar-width: none;
}

.topbar-nav::-webkit-scrollbar {
  display: none;
}

.topbar-nav a {
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-muted);
  flex: 0 0 auto;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 7px 10px;
  white-space: nowrap;
}

.topbar-nav a.active,
.topbar-nav a:hover {
  background: #fff;
  border-color: var(--color-border);
  color: var(--color-brand-800);
}

.profile {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  min-width: 0;
}

.profile img,
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.avatar {
  display: grid;
  place-items: center;
  background: var(--color-brand-200);
  color: var(--color-brand-900);
  font-weight: 600;
  font-size: 0.82rem;
}

.profile-copy {
  min-width: 0;
}

.profile strong,
.profile small {
  display: block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile strong {
  font-size: 0.84rem;
}

.profile small {
  color: var(--color-muted);
  font-size: 0.74rem;
}

.scope-badges {
  display: grid;
  gap: 1px;
  justify-items: start;
  max-width: 170px;
}

.scope-badges span {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: var(--radius-md);
  color: var(--color-brand-800);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 7px;
}

.scope-badges small {
  color: var(--color-muted);
  font-size: 0.72rem;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-action {
  min-height: 32px;
  padding-inline: 10px;
}

.impersonation-bar {
  background: var(--color-brand-800);
  color: #fff;
}

.impersonation-inner {
  align-items: center;
  display: flex;
  gap: 8px;
  min-height: 30px;
  font-size: 0.84rem;
}

.impersonation-inner span {
  opacity: 0.86;
}

.link-button {
  background: transparent;
  border: 0;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  margin-left: auto;
  padding: 0;
  text-decoration: underline;
}

@media (max-width: 760px) {
  .topbar-inner {
    min-height: var(--topbar-height);
    flex-wrap: wrap;
    gap: 6px 10px;
    padding-block: 4px;
  }

  .profile {
    margin-left: auto;
    gap: 6px;
  }

  .profile-copy,
  .scope-badges {
    display: none;
  }

  .topbar-nav {
    order: 3;
    width: 100%;
    padding-bottom: 4px;
  }

  .topbar-nav a {
    flex: 0 0 auto;
    padding: 6px 9px;
    white-space: nowrap;
  }

  .compact-action {
    min-height: 30px;
    width: auto;
  }

  .impersonation-inner {
    flex-wrap: wrap;
    padding: 6px 0;
  }

  .link-button {
    margin-left: 0;
  }
}
</style>
