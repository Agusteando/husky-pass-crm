<template>
  <header class="admin-topbar" data-experience="admin">
    <div class="page-shell admin-topbar-inner" :class="{ 'is-superadmin': isSuperAdmin }">
      <NuxtLink class="admin-brand" :to="persona.homeTo" aria-label="Husky Pass Administracion">
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <span>
          <strong>{{ persona.title }}</strong>
          <small>{{ persona.subtitle }}</small>
        </span>
      </NuxtLink>

      <form v-if="session?.user?.isSuperAdmin" class="admin-search" role="search" @submit.prevent="submitSearch">
        <FamilyPersonasIcon name="person" />
        <input v-model="search" type="search" placeholder="Buscar persona, familia o admin" aria-label="Buscar en administracion" />
      </form>

      <div class="admin-context" :data-persona="persona.key">
        <span>{{ persona.context }}</span>
      </div>

      <nav class="admin-nav" aria-label="Navegacion administrativa">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }" :data-product-nav="item.key">
          <FamilyPersonasIcon :name="item.icon" />
          <span>{{ item.shortLabel || item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="admin-account-slot">
        <TopbarAccountMenu :session="session" experience="admin" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import type { AdminNavItem, AdminPersonaSummary } from '~/utils/adminExperience'

const props = defineProps<{
  session?: PublicSession | null
  persona: AdminPersonaSummary
  items: AdminNavItem[]
}>()

const route = useRoute()
const search = ref('')
const isSuperAdmin = computed(() => Boolean(props.session?.user?.isSuperAdmin))

function isActive(to: string) {
  const targetPath = to.split('?')[0] || to
  if (targetPath === '/admin/superadmin') return route.path === '/admin/superadmin'
  if (targetPath === '/admin/superadmin/gestion-escolar') return route.path.startsWith('/admin/superadmin/gestion-escolar')
  if (targetPath === '/admin/gestion-escolar') return route.path.startsWith('/admin/gestion-escolar')
  if (targetPath === '/admin/daycare/salas') return route.path.startsWith('/admin/daycare')
  return route.path === targetPath || route.path.startsWith(`${targetPath}/`)
}

async function submitSearch() {
  const value = search.value.trim()
  if (!value) return
  const target = route.path.startsWith('/admin/superadmin/personas-autorizadas')
    ? '/admin/superadmin/personas-autorizadas'
    : '/admin/superadmin'
  await navigateTo({ path: target, query: { buscar: value } })
}
</script>

<style scoped>
.admin-topbar {
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(203, 213, 225, 0.9);
  position: sticky;
  top: 0;
  z-index: 24;
}

.admin-topbar-inner {
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-areas: "brand context nav account";
  grid-template-columns: minmax(176px, max-content) minmax(160px, 280px) minmax(0, 1fr) minmax(0, auto);
  min-height: var(--topbar-height);
  padding-block: 6px;
}

.admin-topbar-inner.is-superadmin {
  grid-template-areas:
    "brand search context account"
    "nav nav nav nav";
  grid-template-columns: minmax(190px, max-content) minmax(240px, 420px) minmax(160px, 1fr) minmax(0, auto);
  min-height: auto;
  padding-block: 7px 8px;
  row-gap: 6px;
}

.admin-brand {
  align-items: center;
  display: inline-grid;
  gap: 10px;
  grid-area: brand;
  grid-template-columns: 38px minmax(0, 1fr);
  min-width: 0;
}

.admin-brand img {
  display: block;
  max-height: 34px;
  object-fit: contain;
}

.admin-brand span {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.admin-brand strong,
.admin-brand small,
.admin-context span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-brand strong {
  color: var(--color-ink);
  font-size: 0.9rem;
}

.admin-brand small {
  color: var(--color-muted);
  font-size: 0.72rem;
}

.admin-context {
  align-items: center;
  background: #eef7fb;
  border: 1px solid #cfe7fb;
  border-radius: 999px;
  color: var(--color-blue);
  display: inline-flex;
  font-size: .74rem;
  font-weight: 800;
  grid-area: context;
  justify-self: end;
  max-width: 100%;
  min-height: 32px;
  min-width: 0;
  padding: 0 11px;
}

.admin-context[data-persona='superAdmin'] {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-900);
}

.admin-search {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 13px;
  display: grid;
  gap: 8px;
  grid-area: search;
  grid-template-columns: 18px minmax(0, 1fr);
  min-height: 34px;
  min-width: 0;
  padding: 0 10px;
}

.admin-search input {
  background: transparent;
  border: 0;
  color: var(--color-ink);
  min-width: 0;
  outline: 0;
}

.admin-nav {
  align-items: center;
  display: flex;
  gap: 5px;
  grid-area: nav;
  inline-size: 100%;
  justify-self: stretch;
  max-inline-size: 100%;
  min-width: 0;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
}

.admin-topbar-inner.is-superadmin .admin-nav {
  flex-wrap: wrap;
  overflow: visible;
  padding: 0;
}

.admin-nav::-webkit-scrollbar {
  display: none;
}

.admin-nav a {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--color-muted);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.8rem;
  gap: 7px;
  min-height: 34px;
  padding: 0 10px;
}

.admin-nav a:hover,
.admin-nav a.active {
  background: #fff;
  border-color: var(--color-border);
  color: var(--color-brand-800);
}

.admin-account-slot {
  display: flex;
  grid-area: account;
  justify-content: flex-end;
  min-width: 0;
}

@media (max-width: 1180px) {
  .admin-topbar-inner,
  .admin-topbar-inner.is-superadmin {
    grid-template-areas:
      "brand account"
      "context context"
      "search search"
      "nav nav";
    grid-template-columns: minmax(0, 1fr) auto;
    min-height: auto;
  }

  .admin-topbar-inner:not(.is-superadmin) {
    grid-template-areas:
      "brand account"
      "context context"
      "nav nav";
  }

  .admin-context {
    justify-self: stretch;
  }
}

@media (max-width: 980px) {
  .admin-nav a {
    flex: 1 0 max-content;
    justify-content: center;
  }

  .admin-topbar-inner.is-superadmin .admin-nav a {
    flex: 0 0 auto;
  }
}

@media (max-width: 720px) {
  .admin-topbar-inner {
    padding-block: 5px;
  }

  .admin-brand {
    gap: 8px;
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .admin-brand small {
    display: none;
  }

  .admin-context {
    font-size: .7rem;
    min-height: 30px;
  }

  .admin-nav a {
    border-radius: 13px;
    min-height: 40px;
    padding-inline: 11px;
  }
}

@media (max-width: 520px) {
  .admin-brand strong {
    font-size: .82rem;
  }

  .admin-nav a span {
    display: none;
  }

  .admin-nav a {
    flex-basis: 44px;
    min-width: 44px;
    padding-inline: 0;
  }
}
</style>
