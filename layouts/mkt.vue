<template>
  <div class="admin-experience-root marketing-admin-root mkt-app" :style="adminVars" data-experience="admin">
    <TopbarAdminExperienceTopbar :session="session" :persona="persona" :items="topbarItems" />
    <div class="page-shell marketing-workspace-shell">
      <main class="mkt-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppSession } from '~/composables/useAppSession'
import { experienceThemeVars, visualIdentityForContext } from '~/utils/experienceIdentity'
import { adminNavigationForUser, adminPersonaForUser } from '~/utils/adminExperience'

const { data: session } = useAppSession()
const adminVars = experienceThemeVars(visualIdentityForContext({ experience: 'admin', institution: null, nivel: null, plantel: null, grupo: null }))
const persona = computed(() => adminPersonaForUser(session.value?.user))
const topbarItems = computed(() => adminNavigationForUser(session.value?.user))
</script>

<style scoped>
.admin-experience-root {
  min-height: 100vh;
  --topbar-height: 112px;
}

.marketing-admin-root {
  background:
    radial-gradient(circle at 6% 4%, rgba(39, 145, 124, 0.11), transparent 28rem),
    radial-gradient(circle at 94% 8%, rgba(246, 185, 79, 0.13), transparent 28rem),
    linear-gradient(180deg, #fbfdfb 0%, #f3f7f5 58%, #f7faf8 100%);
}

.marketing-workspace-shell {
  padding-block: clamp(16px, 2.2vw, 30px) 56px;
}

.mkt-main {
  margin: 0;
  min-width: 0;
  padding: 0;
  width: 100%;
}

@media (max-width: 980px) {
  .admin-experience-root { --topbar-height: 154px; }
}

@media (max-width: 720px) {
  .admin-experience-root { --topbar-height: 146px; }
}
</style>
