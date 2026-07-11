<template>
  <div
    class="admin-experience-root"
    :class="{ 'daycare-admin-root': isDaycareAdmin, 'school-admin-root': isSchoolAdmin }"
    :style="adminVars"
    data-experience="admin"
  >
    <TopbarAdminExperienceTopbar :session="session" :persona="persona" :items="topbarItems" />
    <div class="page-shell workspace-shell full-width">
      <main class="layout-main layout-main-wide" :class="{ 'daycare-admin-main': isDaycareAdmin, 'school-admin-main': isSchoolAdmin }">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'nuxt/app'
import { useAppSession } from '~/composables/useAppSession'
import { experienceThemeVars, visualIdentityForContext } from '~/utils/experienceIdentity'
import { adminNavigationForUser, adminPersonaForUser } from '~/utils/adminExperience'

const route = useRoute()
const { data: session } = useAppSession()
const adminVars = experienceThemeVars(visualIdentityForContext({ experience: 'admin', institution: null, nivel: null, plantel: null, grupo: null }))

const persona = computed(() => adminPersonaForUser(session.value?.user))
const topbarItems = computed(() => adminNavigationForUser(session.value?.user))
const isDaycareAdmin = computed(() => route.path.startsWith('/admin/daycare'))
const isSchoolAdmin = computed(() => route.path.startsWith('/admin/gestion-escolar'))
</script>

<style scoped>
.admin-experience-root {
  background:
    radial-gradient(circle at 8% 0%, rgba(8, 135, 125, 0.08), transparent 30%),
    radial-gradient(circle at 92% 4%, rgba(246, 185, 79, 0.10), transparent 28%),
    linear-gradient(180deg, #fbfdf9 0%, var(--color-page) 64%, #eef5f6 100%);
  min-height: 100vh;
  --topbar-height: 64px;
}

.admin-experience-root.daycare-admin-root {
  --daycare-admin-ink: #1f2c19;
  --daycare-admin-muted: #687160;
  --daycare-admin-green: #3f722d;
  --daycare-admin-green-deep: #294e20;
  --daycare-admin-lime: #9fbe4b;
  --daycare-admin-amber: #ffba47;
  --daycare-admin-blue: #4e91b6;
  --daycare-admin-coral: #dc7565;
  --daycare-admin-line: rgba(66, 104, 49, 0.14);
  --daycare-admin-surface: rgba(255, 255, 255, 0.92);
  --daycare-admin-shadow: 0 24px 70px rgba(51, 82, 37, 0.12);
  background:
    radial-gradient(circle at 4% 8%, rgba(255, 186, 71, 0.18), transparent 26rem),
    radial-gradient(circle at 94% 17%, rgba(132, 184, 86, 0.17), transparent 28rem),
    radial-gradient(circle at 58% 100%, rgba(78, 145, 182, 0.08), transparent 32rem),
    linear-gradient(180deg, #fbfdf7 0%, #f2f7ec 54%, #f7f9f3 100%);
  color: var(--daycare-admin-ink);
}

.workspace-shell {
  display: grid;
  gap: 16px;
  padding: 18px 0 40px;
}

.workspace-shell.full-width {
  grid-template-columns: minmax(0, 1fr);
}

.daycare-admin-root .workspace-shell {
  padding: clamp(16px, 2.2vw, 28px) 0 54px;
}

.layout-main {
  min-width: 0;
}

.layout-main-wide {
  width: 100%;
}

.daycare-admin-main {
  margin-inline: auto;
  max-width: 1440px;
}


.admin-experience-root.school-admin-root {
  --school-admin-ink: #14253a;
  --school-admin-muted: #647488;
  --school-admin-teal: #0a8178;
  --school-admin-blue: #2d759e;
  --school-admin-amber: #f2b64c;
  --school-admin-coral: #c9685d;
  --school-admin-line: rgba(25, 92, 105, 0.14);
  background:
    radial-gradient(circle at 5% 8%, rgba(24, 132, 123, 0.13), transparent 28rem),
    radial-gradient(circle at 94% 11%, rgba(245, 185, 77, 0.16), transparent 28rem),
    radial-gradient(circle at 50% 100%, rgba(61, 130, 165, 0.08), transparent 34rem),
    linear-gradient(180deg, #fbfdfb 0%, #f2f7f5 54%, #f8faf7 100%);
}

.school-admin-root .workspace-shell {
  padding: clamp(16px, 2.2vw, 28px) 0 56px;
}

.school-admin-main {
  margin-inline: auto;
  max-width: 1480px;
}

@media (max-width: 980px) {
  .workspace-shell,
  .workspace-shell.full-width {
    grid-template-columns: 1fr;
    padding-top: 10px;
  }
}

@media (max-width: 720px) {
  .daycare-admin-root .workspace-shell {
    padding: 12px 0 calc(112px + env(safe-area-inset-bottom));
  }
}
</style>
