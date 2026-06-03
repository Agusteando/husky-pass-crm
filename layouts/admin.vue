<template>
  <div>
    <AppTopbar :session="session" home-to="/admin/daycare" :items="[]" />
    <div class="page-shell workspace-shell">
      <AdminDaycareSidebar :session="session" />
      <main class="layout-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'

const { data: session } = await useFetch<PublicSession>('/api/auth/me', { key: 'layout-admin-session' })
</script>

<style scoped>
.workspace-shell {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(260px, 306px) minmax(0, 1fr);
  padding: 14px 0 42px;
}

.layout-main {
  min-width: 0;
}

@media (max-width: 980px) {
  .workspace-shell {
    grid-template-columns: 1fr;
    padding-top: 12px;
  }
}
</style>
