<template>
  <header class="topbar">
    <div class="page-shell topbar-inner">
      <BrandMark :to="homeTo" />
      <nav v-if="items.length" class="topbar-nav" aria-label="Navegación principal">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to" active-class="active">
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="profile" v-if="session?.user">
        <img v-if="session.user.picture" :src="session.user.picture" alt="" />
        <span v-else class="avatar">{{ initials }}</span>
        <div class="profile-copy">
          <strong>{{ session.user.displayName || session.user.email }}</strong>
          <small>{{ session.user.email }}</small>
        </div>
        <button v-if="session.user.impersonation" class="btn btn-primary compact-action" type="button" @click="exitImpersonation">Volver</button>
        <button class="btn btn-secondary compact-action" type="button" @click="logout">Salir</button>
      </div>
    </div>
    <div v-if="session?.user?.impersonation" class="impersonation-bar">
      <div class="page-shell impersonation-inner">
        <strong>Vista familiar activa</strong>
        <span>{{ session.user.displayName || session.user.email }}</span>
        <button class="link-button" type="button" @click="exitImpersonation">Terminar vista</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'

const props = defineProps<{
  session?: PublicSession | null
  homeTo: string
  items: Array<{ label: string; to: string }>
}>()

const initials = computed(() => {
  const source = props.session?.user?.displayName || props.session?.user?.email || 'HP'
  return source.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
})

async function exitImpersonation() {
  await $fetch('/api/auth/impersonation/exit', { method: 'POST' })
  await navigateTo('/admin/daycare')
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo(props.session?.user?.kind === 'admin' ? '/admin/login' : '/login')
}
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(18px);
  background: rgba(247, 249, 243, 0.88);
  border-bottom: 1px solid rgba(223, 232, 215, 0.78);
}

.topbar-inner {
  min-height: var(--topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.topbar-nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.topbar-nav a {
  border-radius: 999px;
  color: var(--color-muted);
  font-weight: 850;
  padding: 8px 12px;
}

.topbar-nav a.active,
.topbar-nav a:hover {
  background: var(--color-brand-100);
  color: var(--color-brand-800);
}

.profile {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.profile img,
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.avatar {
  display: grid;
  place-items: center;
  background: var(--color-brand-200);
  color: var(--color-brand-900);
  font-weight: 900;
  font-size: 0.82rem;
}

.profile-copy {
  min-width: 0;
}

.profile strong,
.profile small {
  display: block;
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile strong {
  font-size: 0.9rem;
}

.profile small {
  color: var(--color-muted);
  font-size: 0.78rem;
}

.compact-action {
  min-height: 34px;
  padding-inline: 12px;
}

.impersonation-bar {
  background: var(--color-brand-800);
  color: #fff;
}

.impersonation-inner {
  align-items: center;
  display: flex;
  gap: 10px;
  min-height: 36px;
  font-size: 0.9rem;
}

.impersonation-inner span {
  opacity: 0.86;
}

.link-button {
  background: transparent;
  border: 0;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-weight: 850;
  margin-left: auto;
  padding: 0;
  text-decoration: underline;
}

@media (max-width: 760px) {
  .topbar-inner {
    min-height: var(--topbar-height);
  }

  .profile {
    margin-left: auto;
  }

  .profile-copy {
    display: none;
  }

  .topbar-nav {
    order: 3;
    overflow-x: auto;
    width: 100%;
    padding-bottom: 4px;
  }

  .compact-action {
    min-height: 32px;
    width: auto;
  }

  .impersonation-inner {
    flex-wrap: wrap;
    padding: 8px 0;
  }

  .link-button {
    margin-left: 0;
  }
}
</style>
