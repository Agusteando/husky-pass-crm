<template>
  <div>
    <AppTopbar :session="session" :home-to="homeTo" :items="[]" />
    <div class="page-shell legacy-shell">
      <FamilySidebar :session="session" />
      <main class="layout-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute } from '~/utils/sessionScopes'

const { data: session } = await useFetch<PublicSession>('/api/auth/me', { key: 'layout-family-session' })
const homeTo = computed(() => defaultFamilyRoute(session.value?.user))
</script>

<style scoped>
.legacy-shell {
  display: grid;
  gap: 24px;
  grid-template-columns: 280px minmax(0, 1fr);
  padding: 28px 0 64px;
}

.layout-main {
  min-width: 0;
}

@media (max-width: 980px) {
  .legacy-shell {
    grid-template-columns: 1fr;
    padding-top: 18px;
  }
}
</style>
