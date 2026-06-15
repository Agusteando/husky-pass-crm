<template>
  <div class="admin-experience-root" :style="adminVars" data-experience="admin">
    <AppTopbar :session="session" :home-to="homeTo" :items="topbarItems" />
    <div class="page-shell workspace-shell" :class="isDaycareWorkspace ? 'with-rail' : 'full-width'">
      <AdminDaycareSidebar v-if="isDaycareWorkspace" :session="session" />
      <main class="layout-main" :class="{ 'layout-main-wide': !isDaycareWorkspace }">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { experienceThemeVars, visualIdentityForContext } from '~/utils/experienceIdentity'

const route = useRoute()
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'layout-admin-session' })
const adminVars = experienceThemeVars(visualIdentityForContext({ experience: 'admin', institution: null, nivel: null, plantel: null, grupo: null }))

const homeTo = computed(() => session.value?.user?.isSuperAdmin ? '/admin/superadmin' : '/admin/daycare/salas')
const canAccessHistory = computed(() => {
  const user = session.value?.user
  if (!user || user.kind !== 'admin') return false
  if (user.isSuperAdmin) return true
  const routeText = user.routes.map((item) => item.route).join(' ')
  const roleText = user.roles.join(' ')
  return /personas[_/-]?autorizadas|persona[-_]?autorizada|credencial|marbete|validar|historial|acceso|husky/i.test(`${routeText} ${roleText}`)
})
const topbarItems = computed(() => {
  const firstUnidad = session.value?.user?.unidades?.[0] || ''
  const daycareTo = firstUnidad ? `/admin/daycare/salas?unidad=${encodeURIComponent(firstUnidad)}` : '/admin/daycare/salas'
  const items = [{ label: 'Guardería', to: daycareTo }]
  if (session.value?.user?.isSuperAdmin) {
    items.unshift(
      { label: 'Superadmin', to: '/admin/superadmin' },
      { label: 'Personas Autorizadas', to: '/admin/superadmin/personas-autorizadas' },
      { label: 'Historial de accesos', to: '/admin/historial-accesos' },
      { label: 'Marbetes', to: '/admin/superadmin/marbetes' }
    )
  } else if (canAccessHistory.value) {
    items.unshift({ label: 'Historial de accesos', to: '/admin/historial-accesos' })
  }
  return items
})
const isDaycareWorkspace = computed(() => route.path.startsWith('/admin/daycare'))
</script>

<style scoped>
.admin-experience-root {
  background: var(--color-page);
  min-height: 100vh;
}

.workspace-shell {
  display: grid;
  gap: 12px;
  padding: 12px 0 32px;
}

.workspace-shell.with-rail {
  grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
}

.workspace-shell.full-width {
  grid-template-columns: minmax(0, 1fr);
}

.layout-main {
  min-width: 0;
}

.layout-main-wide {
  width: 100%;
}

@media (max-width: 980px) {
  .workspace-shell,
  .workspace-shell.with-rail,
  .workspace-shell.full-width {
    grid-template-columns: 1fr;
    padding-top: 10px;
  }
}
</style>
