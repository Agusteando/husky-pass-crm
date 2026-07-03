<template>
  <div class="admin-experience-root" :style="adminVars" data-experience="admin">
    <TopbarAdminExperienceTopbar :session="session" :persona="persona" :items="topbarItems" />
    <div class="page-shell workspace-shell full-width">
      <main class="layout-main layout-main-wide">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import { computed } from 'vue'
import { experienceThemeVars, visualIdentityForContext } from '~/utils/experienceIdentity'
import { adminNavigationForUser, adminPersonaForUser } from '~/utils/adminExperience'

const { data: session } = useAppSession()
const adminVars = experienceThemeVars(visualIdentityForContext({ experience: 'admin', institution: null, nivel: null, plantel: null, grupo: null }))

const persona = computed(() => adminPersonaForUser(session.value?.user))
const topbarItems = computed(() => adminNavigationForUser(session.value?.user))
</script>

<style scoped>
.admin-experience-root {
  background: var(--color-page);
  min-height: 100vh;
  --topbar-height: 64px;
}

.workspace-shell {
  display: grid;
  gap: 16px;
  padding: 16px 0 36px;
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
  .workspace-shell.full-width {
    grid-template-columns: 1fr;
    padding-top: 10px;
  }
}
</style>
