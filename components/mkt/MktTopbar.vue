<template>
  <header class="mkt-topbar">
    <div class="mkt-topbar__inner">
      <NuxtLink class="mkt-topbar__brand" to="/mkt" aria-label="Mercadotecnia y Relaciones Públicas">
        <img src="/brand/mkt-identity.png" alt="Mercadotecnia y Relaciones Públicas IECS · IEDIS" />
      </NuxtLink>

      <nav class="mkt-topbar__nav" aria-label="Navegación de Mercadotecnia">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to" :class="{ active: isActive(item) }"><FamilyPersonasIcon :name="item.icon" /><span>{{ item.label }}</span></NuxtLink>
      </nav>

      <div class="mkt-topbar__actions">
        <NuxtLink v-if="adminSwitchPath" class="mkt-context-link" :to="adminSwitchPath"><FamilyPersonasIcon name="security" />Administración</NuxtLink>
        <NuxtLink class="mkt-quick-action" to="/mkt/informes?new=1"><FamilyPersonasIcon name="plus" /><span>Nuevo informe</span></NuxtLink>
        <TopbarAccountMenu :session="session" experience="admin" presentation="compact" profile-detail="Mercadotecnia" />
      </div>
    </div>
  </header>

  <nav class="mkt-mobile-dock" aria-label="Navegación móvil de Mercadotecnia">
    <NuxtLink v-for="item in mobileItems" :key="item.to" :to="item.to" :class="[{ active: isActive(item) }, { create: item.create }]">
      <span><FamilyPersonasIcon :name="item.icon" /></span><small>{{ item.label }}</small>
    </NuxtLink>
  </nav>
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
  { label: 'Rendimiento', to: '/mkt/analitica', icon: 'chart' },
  { label: 'Bitácora', to: '/mkt/bitacora', icon: 'clipboard' }
]
const mobileItems = [
  { label: 'Hoy', to: '/mkt', icon: 'home' },
  { label: 'Informes', to: '/mkt/informes', icon: 'people' },
  { label: 'Nuevo', to: '/mkt/informes?new=1', icon: 'plus', create: true },
  { label: 'Datos', to: '/mkt/analitica', icon: 'chart' },
  { label: 'Bitácora', to: '/mkt/bitacora', icon: 'clipboard' }
]
const adminSwitchPath = computed(() => {
  const user = props.session?.user
  if (!user) return ''
  if (isEffectiveSuperAdmin(user)) return '/admin/superadmin'
  if (hasSchoolAdminScope(user)) return '/admin/gestion-escolar'
  if (hasDaycareAdminScope(user)) return '/admin/daycare/salas'
  return ''
})
function isActive(item: { to: string; create?: boolean }) {
  const path = item.to.split('?')[0]
  if (item.create) return route.path === path && route.query.new === '1'
  if (path === '/mkt') return route.path === '/mkt'
  if (path === '/mkt/informes' && route.query.new === '1') return false
  return route.path.startsWith(path)
}
</script>

<style scoped>
.mkt-topbar{backdrop-filter:blur(20px);background:rgba(255,255,255,.92);border-bottom:1px solid rgba(16,49,57,.09);position:sticky;top:0;z-index:40}.mkt-topbar:after{background:linear-gradient(90deg,#79c950 0 24%,#ffcb39 24% 48%,#ef5c4c 48% 69%,#498bcf 69% 100%);bottom:-3px;content:'';height:3px;left:0;opacity:.86;position:absolute;right:0}.mkt-topbar__inner{align-items:center;display:grid;gap:18px;grid-template-columns:minmax(210px,260px) minmax(0,1fr) auto;margin:0 auto;min-height:76px;padding:9px clamp(14px,2.4vw,34px);width:min(100%,1600px)}.mkt-topbar__brand img{display:block;max-height:48px;max-width:245px;object-fit:contain;object-position:left center;width:100%}.mkt-topbar__nav,.mkt-topbar__actions{align-items:center;display:flex;gap:6px}.mkt-topbar__nav a{align-items:center;border:1px solid transparent;border-radius:14px;color:#64727a;display:inline-flex;font-size:.74rem;font-weight:800;gap:7px;min-height:42px;padding:0 12px;transition:.18s}.mkt-topbar__nav a:hover,.mkt-topbar__nav a.active{background:#eff8f4;border-color:#d6ebe2;color:#0c685d}.mkt-topbar__actions{justify-content:flex-end}.mkt-quick-action,.mkt-context-link{align-items:center;border-radius:14px;display:inline-flex;font-size:.72rem;font-weight:800;gap:7px;justify-content:center;min-height:42px;padding:0 13px}.mkt-quick-action{background:linear-gradient(135deg,#0d7568,#07554f);box-shadow:0 10px 24px rgba(11,107,97,.18);color:#fff}.mkt-context-link{color:#6a7478}.mkt-mobile-dock{display:none}
@media(max-width:1120px){.mkt-topbar__inner{gap:10px;grid-template-areas:'brand actions' 'nav nav';grid-template-columns:minmax(190px,1fr) auto}.mkt-topbar__brand{grid-area:brand}.mkt-topbar__nav{grid-area:nav;overflow-x:auto;scrollbar-width:none}.mkt-topbar__actions{grid-area:actions}.mkt-context-link{display:none}}
@media(max-width:720px){.mkt-topbar__inner{grid-template-areas:'brand actions';grid-template-columns:minmax(0,1fr) auto;min-height:66px;padding-inline:12px}.mkt-topbar__brand img{max-height:40px;max-width:190px}.mkt-topbar__nav,.mkt-quick-action{display:none}.mkt-mobile-dock{align-items:end;background:rgba(255,255,255,.96);border:1px solid rgba(18,73,76,.12);border-bottom:0;border-radius:23px 23px 0 0;bottom:0;box-shadow:0 -14px 36px rgba(14,55,61,.12);display:grid;grid-template-columns:repeat(5,1fr);left:0;padding:7px 8px calc(7px + env(safe-area-inset-bottom));position:fixed;right:0;z-index:50}.mkt-mobile-dock a{align-items:center;color:#748386;display:flex;flex-direction:column;font-size:.58rem;font-weight:800;gap:4px;justify-content:end;min-height:48px}.mkt-mobile-dock a>span{align-items:center;border-radius:13px;display:flex;height:30px;justify-content:center;width:38px}.mkt-mobile-dock a.active{color:var(--mkt-teal)}.mkt-mobile-dock a.active>span{background:#eaf6f0}.mkt-mobile-dock a.create{color:#fff;transform:translateY(-11px)}.mkt-mobile-dock a.create>span{background:linear-gradient(135deg,#8fc849,#0b6b61);border:4px solid #fff;border-radius:19px;box-shadow:0 10px 22px rgba(11,107,97,.24);height:48px;width:48px}.mkt-mobile-dock a.create small{color:#4b6668;margin-top:-1px}}
</style>
