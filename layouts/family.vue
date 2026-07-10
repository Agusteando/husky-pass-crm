<template>
  <div
    class="family-experience-root"
    :class="{ 'is-daycare-experience': isDaycareExperience }"
    :style="identityVars"
    :data-experience="identity.context.experience"
  >
    <TopbarFamilyExperienceTopbar :session="session" :home-to="homeTo" :identity="identity" />
    <div class="page-shell workspace-shell" :class="{ 'daycare-workspace': isDaycareExperience }">
      <FamilySidebar v-if="!isDaycareExperience" :session="session" />
      <main class="layout-main">
        <slot />
      </main>
    </div>
    <FamilyDaycareBottomNav v-if="isDaycareExperience" />
  </div>
</template>

<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import { computed } from 'vue'
import { useRoute } from 'nuxt/app'
import { defaultFamilyRoute } from '~/utils/sessionScopes'
import { resolveVisualIdentity } from '~/utils/experienceIdentity'

const route = useRoute()
const { data: session } = useAppSession()
const homeTo = computed(() => defaultFamilyRoute(session.value?.user))
const requestedExperience = computed(() => typeof route.query.experiencia === 'string' ? route.query.experiencia : undefined)
const resolvedIdentity = computed(() => resolveVisualIdentity({ routePath: route.path, requestedExperience: requestedExperience.value, user: session.value?.user }))
const identity = computed(() => resolvedIdentity.value.identity)
const identityVars = computed(() => resolvedIdentity.value.vars)
const isDaycareExperience = computed(() => identity.value.context.experience === 'guarderia')
</script>

<style scoped>
.family-experience-root {
  background: var(--color-page);
  min-height: 100vh;
}

.family-experience-root.is-daycare-experience {
  background:
    radial-gradient(circle at 8% 5%, rgba(255, 190, 71, 0.14), transparent 25rem),
    radial-gradient(circle at 92% 18%, rgba(86, 195, 178, 0.11), transparent 27rem),
    linear-gradient(180deg, #fbfdf8 0%, #f3f7ee 55%, #f7f9f3 100%);
}

.workspace-shell {
  display: grid;
  gap: 12px;
  grid-template-columns: 244px minmax(0, 1fr);
  padding: 12px 0 32px;
}

.workspace-shell.daycare-workspace {
  display: block;
  max-width: 1240px;
  padding: clamp(18px, 2.5vw, 30px) 0 48px;
}

.layout-main {
  min-width: 0;
}

@media (max-width: 980px) {
  .workspace-shell {
    grid-template-columns: 1fr;
    padding-top: 10px;
  }
}

@media (max-width: 760px) {
  .workspace-shell.daycare-workspace {
    padding: 14px 0 92px;
  }
}
</style>
