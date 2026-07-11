<template>
  <header class="mkt-topbar">
    <div class="mkt-topbar__inner">
      <NuxtLink class="mkt-topbar__brand" to="/mkt" aria-label="Mercadotecnia y Relaciones Públicas">
        <img src="/brand/mkt-identity.png" alt="Mercadotecnia y Relaciones Públicas IECS · IEDIS" />
      </NuxtLink>

      <nav class="mkt-topbar__nav" aria-label="Navegación de Mercadotecnia">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }">
          <FamilyPersonasIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="mkt-topbar__actions">
        <NuxtLink v-if="showAdminSwitch" class="mkt-context-link" to="/admin/superadmin">Administración</NuxtLink>
        <NuxtLink class="mkt-quick-action secondary" to="/mkt/bitacora">
          <FamilyPersonasIcon name="clipboard" />
          <span>Bitácora</span>
        </NuxtLink>
        <NuxtLink class="mkt-quick-action" to="/mkt/informes?new=1">
          <FamilyPersonasIcon name="plus" />
          <span>Nuevo informe</span>
        </NuxtLink>
        <TopbarAccountMenu
          :session="session"
          experience="admin"
          presentation="compact"
          profile-detail="Mercadotecnia"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { hasDaycareAdminScope, hasSchoolAdminScope, isEffectiveSuperAdmin } from '~/utils/sessionScopes'

const props = defineProps<{ session?: PublicSession | null }>()
const route = useRoute()
const items = [
  { label: 'Hoy', to: '/mkt', icon: 'home' },
  { label: 'Informes', to: '/mkt/informes', icon: 'people' },
  { label: 'Matrícula actual', to: '/mkt/matricula-actual', icon: 'school' },
  { label: 'Bitácora', to: '/mkt/bitacora', icon: 'clipboard' }
]
const showAdminSwitch = computed(() => {
  const user = props.session?.user
  return Boolean(user && (isEffectiveSuperAdmin(user) || hasSchoolAdminScope(user) || hasDaycareAdminScope(user)))
})

function isActive(to: string) {
  if (to === '/mkt') return route.path === '/mkt'
  return route.path.startsWith(to)
}
</script>

<style scoped>
.mkt-topbar {
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid rgba(16, 49, 57, 0.09);
  position: sticky;
  top: 0;
  z-index: 30;
}

.mkt-topbar::after {
  background: linear-gradient(90deg, #79c950 0 24%, #ffcb39 24% 48%, #ef5c4c 48% 69%, #498bcf 69% 100%);
  bottom: -3px;
  content: '';
  height: 3px;
  left: 0;
  opacity: 0.82;
  position: absolute;
  right: 0;
}

.mkt-topbar__inner {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(210px, 270px) minmax(0, 1fr) auto;
  margin: 0 auto;
  min-height: 76px;
  padding: 9px clamp(14px, 2.4vw, 34px);
  width: min(100%, 1560px);
}

.mkt-topbar__brand img {
  display: block;
  height: auto;
  max-height: 50px;
  object-fit: contain;
  object-position: left center;
  width: auto;
}

.mkt-topbar__nav,
.mkt-topbar__actions {
  align-items: center;
  display: flex;
  gap: 6px;
}

.mkt-topbar__nav a {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 14px;
  color: #64727a;
  display: inline-flex;
  font-size: 0.8rem;
  gap: 7px;
  min-height: 42px;
  padding: 0 13px;
  transition: 0.18s ease;
}

.mkt-topbar__nav a:hover,
.mkt-topbar__nav a.active {
  background: #eff8f4;
  border-color: #d6ebe2;
  color: #0c685d;
}

.mkt-topbar__actions {
  justify-content: flex-end;
}

.mkt-quick-action,
.mkt-context-link {
  align-items: center;
  border-radius: 14px;
  display: inline-flex;
  font-size: 0.76rem;
  gap: 7px;
  justify-content: center;
  min-height: 42px;
  padding: 0 13px;
}

.mkt-quick-action {
  background: #0b6b61;
  box-shadow: 0 10px 24px rgba(11, 107, 97, 0.17);
  color: white;
}

.mkt-quick-action.secondary {
  background: #eef8f3;
  box-shadow: none;
  color: #0c685d;
}

.mkt-context-link {
  color: #6a7478;
}

@media (max-width: 1080px) {
  .mkt-topbar__inner {
    gap: 10px;
    grid-template-columns: minmax(190px, 1fr) auto;
    grid-template-areas: 'brand actions' 'nav nav';
  }
  .mkt-topbar__brand { grid-area: brand; }
  .mkt-topbar__nav { grid-area: nav; overflow-x: auto; scrollbar-width: none; }
  .mkt-topbar__actions { grid-area: actions; }
  .mkt-context-link { display: none; }
}

@media (max-width: 680px) {
  .mkt-topbar__inner {
    min-height: 66px;
    padding-inline: 12px;
  }
  .mkt-topbar__brand img { max-height: 42px; max-width: 188px; }
  .mkt-quick-action { display: none; }
  .mkt-topbar__nav a { flex: 1; justify-content: center; min-width: max-content; }
}
</style>
