<template>
  <div class="family-experience-root" :style="identityVars" :data-experience="identity.context.experience">
    <TopbarFamilyExperienceTopbar :session="session" :home-to="homeTo" :identity="identity" />
    <div class="page-shell workspace-shell">
      <FamilySidebar :session="session" />
      <main class="layout-main">
        <slot />
      </main>
    </div>
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
</script>

<style scoped>
.family-experience-root {
  background: var(--color-page);
  min-height: 100vh;
}

.workspace-shell {
  display: grid;
  gap: 12px;
  grid-template-columns: 244px minmax(0, 1fr);
  padding: 12px 0 32px;
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
</style>
