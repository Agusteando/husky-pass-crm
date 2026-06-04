<template>
  <div>
    <AppTopbar :session="session" :home-to="homeTo" :items="topbarItems" />
    <div class="page-shell workspace-shell" :class="isDaycareWorkspace ? 'with-rail' : 'full-width'">
      <AdminDaycareSidebar v-if="isDaycareWorkspace" :session="session" />
      <main class="layout-main" :class="{ 'layout-main-wide': !isDaycareWorkspace }">
        <slot />
      </main>
    </div>
    <ClientOnly>
      <AdminProductDiagnosticsModal v-if="diagnosticsActive" :session="session" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'

const route = useRoute()
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'layout-admin-session' })

const homeTo = computed(() => session.value?.user?.isSuperAdmin ? '/admin/superadmin' : '/admin/daycare/salas')
const topbarItems = computed(() => {
  const items = [{ label: 'Daycare', to: '/admin/daycare/salas' }]
  if (session.value?.user?.isSuperAdmin) items.unshift({ label: 'Superadmin', to: '/admin/superadmin' })
  return items
})
const isDaycareWorkspace = computed(() => route.path.startsWith('/admin/daycare'))
const diagnosticsActive = computed(() => session.value?.user?.kind === 'admin')
</script>

<style scoped>
.workspace-shell {
  display: grid;
  gap: 14px;
  padding: 14px 0 42px;
}

.workspace-shell.with-rail {
  grid-template-columns: minmax(260px, 306px) minmax(0, 1fr);
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
    padding-top: 12px;
  }
}
</style>
