<template>
  <aside v-if="session?.user" class="family-panel" aria-label="Husky Pass familiar">
    <div class="family-brand mobile-hidden">
      <BrandMark :to="homeTo" />
    </div>

    <section class="family-context">
      <span>{{ contextLabel }}</span>
      <strong>{{ primaryName }}</strong>
      <small>{{ secondaryName }}</small>
    </section>

    <nav class="family-nav" aria-label="Navegación familiar">
      <NuxtLink v-for="item in items" :key="item.to" :to="item.to">{{ item.label }}</NuxtLink>
    </nav>

    <button v-if="session.user.impersonation" class="btn btn-primary exit-preview" type="button" @click="exitPreview">Volver a admin</button>
  </aside>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, familyNavItems, hasFamilyScope } from '~/utils/sessionScopes'

const props = defineProps<{ session?: PublicSession | null }>()
const items = computed(() => familyNavItems(props.session?.user))
const homeTo = computed(() => defaultFamilyRoute(props.session?.user))
const contextLabel = computed(() => hasFamilyScope(props.session?.user, 'daycare') ? 'Guardería' : 'Familia')
const primaryName = computed(() => props.session?.user?.displayName || props.session?.user?.username || props.session?.user?.email || 'Husky Pass')
const secondaryName = computed(() => props.session?.user?.scopes.daycare?.sala ? `Sala ${props.session.user.scopes.daycare.sala}` : props.session?.user?.email || '')

async function exitPreview() {
  await $fetch('/api/auth/impersonation/exit', { method: 'POST' })
  await navigateTo('/admin/daycare')
}
</script>

<style scoped>
.family-panel {
  align-self: start;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 14px;
  padding: 14px;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.family-context {
  background: linear-gradient(180deg, #fbfdf8, #f2f8ea);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  display: grid;
  gap: 3px;
  padding: 12px;
}

.family-context span {
  color: var(--color-brand-700);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.family-context strong {
  color: var(--color-ink);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.family-context small {
  color: var(--color-muted);
  font-weight: 760;
}

.family-nav {
  display: grid;
  gap: 7px;
}

.family-nav a {
  border: 1px solid transparent;
  border-radius: 14px;
  color: var(--color-muted);
  font-weight: 850;
  padding: 9px 11px;
}

.family-nav a:hover,
.family-nav a.router-link-active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-800);
}

.exit-preview {
  width: 100%;
}

@media (max-width: 980px) {
  .family-panel {
    gap: 12px;
    position: static;
  }

  .mobile-hidden {
    display: none;
  }

  .family-nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .family-nav a {
    flex: 0 0 auto;
    white-space: nowrap;
  }
}
</style>
