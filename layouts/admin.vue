<template>
  <div class="admin-experience-root" :class="{ 'is-superadmin': session?.user?.isSuperAdmin }" :style="adminVars" data-experience="admin">
    <TopbarAdminExperienceTopbar :session="session" :persona="persona" :items="topbarItems" />
    <div class="page-shell workspace-shell" :class="isDaycareWorkspace ? 'with-rail' : 'full-width'">
      <AdminDaycareSidebar v-if="isDaycareWorkspace" :session="session" />
      <main class="layout-main" :class="{ 'layout-main-wide': !isDaycareWorkspace }">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import { computed } from 'vue'
import { useRoute } from 'nuxt/app'
import { experienceThemeVars, visualIdentityForContext } from '~/utils/experienceIdentity'
import { adminNavigationForUser, adminPersonaForUser } from '~/utils/adminExperience'

const route = useRoute()
const { data: session } = useAppSession()
const adminVars = experienceThemeVars(visualIdentityForContext({ experience: 'admin', institution: null, nivel: null, plantel: null, grupo: null }))

const persona = computed(() => adminPersonaForUser(session.value?.user))
const topbarItems = computed(() => adminNavigationForUser(session.value?.user))
const isDaycareWorkspace = computed(() => route.path.startsWith('/admin/daycare'))
</script>

<style scoped>
.admin-experience-root {
  background: var(--color-page);
  min-height: 100vh;
}

.admin-experience-root.is-superadmin {
  --topbar-height: 104px;
}

@media (max-width: 1180px) {
  .admin-experience-root.is-superadmin {
    --topbar-height: 146px;
  }
}

@media (max-width: 520px) {
  .admin-experience-root.is-superadmin {
    --topbar-height: 188px;
  }
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
