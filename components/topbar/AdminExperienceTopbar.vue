<template>
  <header class="admin-topbar" :class="{ 'is-daycare': isDaycareRoute }" data-experience="admin">
    <div class="page-shell admin-topbar-inner">
      <NuxtLink class="admin-brand" :to="persona.homeTo" aria-label="Husky Pass Administración">
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <span>
          <strong>{{ persona.title }}</strong>
          <small>{{ persona.subtitle }}</small>
        </span>
      </NuxtLink>

      <nav class="admin-nav" aria-label="Navegación administrativa">
        <NuxtLink v-for="item in displayedItems" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }" :data-product-nav="item.key">
          <FamilyPersonasIcon :name="item.icon" />
          <span>{{ item.shortLabel || item.label }}</span>
        </NuxtLink>
      </nav>

      <form v-if="persona.key === 'superAdmin'" class="admin-search" role="search" @submit.prevent="submitSearch">
        <FamilyPersonasIcon name="search" />
        <input v-model="search" type="search" placeholder="Buscar cuenta" aria-label="Buscar cuenta" />
      </form>

      <div v-if="persona.context || isDaycareRoute" class="admin-context" :data-persona="persona.key">
        <FamilyPersonasIcon v-if="isDaycareRoute" name="daycare" />
        <span>{{ persona.context || 'Guardería' }}</span>
      </div>

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
const isDaycareRoute = computed(() => route.path.startsWith('/admin/daycare'))
const displayedItems = computed<AdminNavItem[]>(() => isDaycareRoute.value
  ? [{ key: 'daycare-rooms', label: 'Salas', to: '/admin/daycare/salas', icon: 'daycare' }]
  : props.items)

function isActive(to: string) {
  const targetPath = to.split('?')[0] || to
  if (targetPath === '/admin/superadmin') return route.path === '/admin/superadmin'
  if (targetPath === '/mkt') return route.path.startsWith('/mkt')
  if (targetPath === '/admin/gestion-escolar') return route.path.startsWith('/admin/gestion-escolar')
  if (targetPath === '/admin/daycare/salas') return route.path.startsWith('/admin/daycare/salas')
  return route.path === targetPath || route.path.startsWith(`${targetPath}/`)
}

async function submitSearch() {
  const value = search.value.trim()
  if (!value || props.persona.key !== 'superAdmin') return
  await navigateTo({ path: '/admin/superadmin', query: { buscar: value } })
}
</script>

<style scoped>
.admin-topbar {
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(208, 218, 225, 0.86);
  position: sticky;
  top: 0;
  z-index: 24;
}

.admin-topbar-inner {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(190px, auto) minmax(0, 1fr) minmax(190px, 310px) auto auto;
  min-height: var(--topbar-height);
  padding-block: 8px;
}

.admin-brand {
  align-items: center;
  display: grid;
  gap: 10px;
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
  color: #152032;
  font-size: 0.92rem;
}

.admin-brand small {
  color: #64748b;
  font-size: 0.72rem;
}

.admin-nav {
  align-items: center;
  display: flex;
  gap: 4px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.admin-nav::-webkit-scrollbar {
  display: none;
}

.admin-nav a {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #526173;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.82rem;
  gap: 7px;
  min-height: 36px;
  padding: 0 11px;
}

.admin-nav a:hover,
.admin-nav a.active {
  background: #f4faf8;
  border-color: #cae2dc;
  color: #0d766d;
}

.admin-search {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #dce5eb;
  border-radius: 11px;
  display: grid;
  gap: 8px;
  grid-template-columns: 18px minmax(0, 1fr);
  min-height: 38px;
  min-width: 0;
  padding: 0 10px;
}

.admin-search input {
  background: transparent;
  border: 0;
  color: #152032;
  min-width: 0;
  outline: 0;
}

.admin-context {
  color: #64748b;
  font-size: 0.74rem;
  justify-self: end;
  max-width: 190px;
  min-width: 0;
}

.admin-account-slot {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}

@media (max-width: 1180px) {
  .admin-topbar-inner {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      "brand account"
      "nav nav"
      "search search"
      "context context";
  }

  .admin-brand {
    grid-area: brand;
  }

  .admin-nav {
    grid-area: nav;
  }

  .admin-search {
    grid-area: search;
  }

  .admin-context {
    grid-area: context;
    justify-self: start;
    max-width: 100%;
  }

  .admin-account-slot {
    grid-area: account;
  }
}

@media (max-width: 720px) {
  .admin-topbar-inner {
    gap: 8px;
  }

  .admin-brand {
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .admin-brand small,
  .admin-context {
    display: none;
  }

  .admin-nav a {
    flex: 1 0 max-content;
    justify-content: center;
    min-height: 40px;
  }
}

@media (max-width: 520px) {
  .admin-brand strong {
    font-size: 0.84rem;
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

.admin-topbar.is-daycare {
  background: rgba(252, 253, 248, 0.88);
  border-bottom-color: rgba(62, 103, 44, 0.12);
  backdrop-filter: blur(18px) saturate(1.25);
}

.admin-topbar.is-daycare .admin-topbar-inner {
  min-height: 70px;
}

.admin-topbar.is-daycare .admin-brand img {
  filter: drop-shadow(0 7px 12px rgba(49, 95, 36, 0.13));
}

.admin-topbar.is-daycare .admin-brand strong {
  color: #294e20;
}

.admin-topbar.is-daycare .admin-brand small {
  color: #73806b;
}

.admin-topbar.is-daycare .admin-nav a:hover,
.admin-topbar.is-daycare .admin-nav a.active {
  background: linear-gradient(135deg, rgba(221, 235, 202, 0.8), rgba(255, 243, 219, 0.78));
  border-color: rgba(82, 127, 54, 0.18);
  color: #355f24;
}

.admin-topbar.is-daycare .admin-context {
  align-items: center;
  background: rgba(242, 248, 234, 0.88);
  border: 1px solid rgba(82, 127, 54, 0.14);
  border-radius: 999px;
  color: #355f24;
  display: inline-flex;
  font-weight: 800;
  gap: 7px;
  max-width: 240px;
  padding: 8px 11px;
}

.admin-topbar.is-daycare .admin-context :deep(.pa-icon) {
  flex: 0 0 auto;
  height: 1rem;
  width: 1rem;
}

@media (max-width: 720px) {
  .admin-topbar.is-daycare .admin-topbar-inner {
    min-height: 62px;
  }
}

</style>
