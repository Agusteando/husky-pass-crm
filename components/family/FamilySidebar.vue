<template>
  <aside v-if="session?.user" class="family-panel" aria-label="Husky Pass familiar">
    <section class="family-context">
      <span>{{ contextLabel }}</span>
      <strong>{{ primaryName }}</strong>
      <small>{{ secondaryName }}</small>
    </section>

    <nav class="family-nav" aria-label="Navegación familiar">
      <NuxtLink v-for="item in items" :key="item.to" :to="item.to"><FamilyPersonasIcon :name="item.icon" /><span>{{ item.label }}</span></NuxtLink>
    </nav>

    <button v-if="session.user.impersonation" class="btn btn-primary exit-preview" type="button" @click="exitPreview">Volver a admin</button>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { displayMatriculaCandidate } from '~/utils/matricula'
import { navigateTo, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { familyNavItems, hasFamilyScope } from '~/utils/sessionScopes'

const props = defineProps<{ session?: PublicSession | null }>()
const route = useRoute()
const activeProduct = computed(() => {
  if (route.path.startsWith('/familia/personas-autorizadas')) return 'personasAutorizadas'
  if (route.path.startsWith('/familia/comunicados')) return 'personasAutorizadas'
  if (route.path.startsWith('/familia/pagos')) return 'personasAutorizadas'
  if (route.path.startsWith('/familia/asistencia')) return 'attendance'
  if (route.path.startsWith('/familia/daycare')) return 'daycare'
  if (hasFamilyScope(props.session?.user, 'daycare') && !hasFamilyScope(props.session?.user, 'personasAutorizadas')) return 'daycare'
  if (hasFamilyScope(props.session?.user, 'personasAutorizadas') && !hasFamilyScope(props.session?.user, 'daycare')) return 'personasAutorizadas'
  return 'chooser'
})
const items = computed(() => familyNavItems(props.session?.user, activeProduct.value).map((item) => {
  if (item.icon !== 'security') return item
  const experience = activeProduct.value === 'daycare' ? 'guarderia' : 'escolar'
  return { ...item, to: `${item.to}?experiencia=${experience}` }
}))
const contextLabel = computed(() => {
  if (activeProduct.value === 'daycare') return 'Guardería'
  if (activeProduct.value === 'personasAutorizadas') return 'Personas Autorizadas'
  if (activeProduct.value === 'attendance') return 'Asistencia'
  return 'Familia'
})
const primaryName = computed(() => props.session?.user?.displayName || displayMatriculaCandidate(props.session?.user?.username) || props.session?.user?.email || 'Husky Pass')
const secondaryName = computed(() => {
  const user = props.session?.user
  if (!user) return ''
  if (activeProduct.value === 'daycare') return [user.scopes.daycare?.unidad, user.scopes.daycare?.sala ? `Sala ${user.scopes.daycare.sala}` : null].filter(Boolean).join(' · ')
  return user.email || ''
})

async function exitPreview() {
  const impersonation = props.session?.user?.impersonation
  const target = impersonation?.mode === 'daycarePreview'
    ? '/admin/daycare/salas'
    : impersonation?.admin?.isSuperAdmin ? '/admin/superadmin' : impersonation?.admin?.productScopes?.includes('gestionEscolarAdmin') ? '/admin/gestion-escolar/familias' : '/admin/daycare/salas'
  await $fetch('/api/auth/impersonation/exit', { method: 'POST' })
  await navigateTo(target)
}
</script>

<style scoped>
.family-panel {
  align-self: start;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 10px;
  padding: 10px;
  position: sticky;
  top: calc(var(--topbar-height) + 10px);
}

.family-context {
  background: linear-gradient(180deg, #fbfdf8, #f6f8f1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: grid;
  gap: 2px;
  padding: 10px;
}

.family-context span {
  color: var(--color-brand-700);
  font-size: 0.72rem;
  font-weight: 600;
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
  font-weight: 600;
}

.family-nav {
  display: grid;
  gap: 5px;
}

.family-nav a {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-muted);
  display: flex;
  gap: 8px;
  font-weight: 600;
  padding: 8px 10px;
}

.family-nav a :deep(.pa-icon) {
  height: 1rem;
  width: 1rem;
}

.family-nav a:hover,
.family-nav a.router-link-active {
  background: #fff;
  border-color: var(--color-brand-200);
  color: var(--color-brand-800);
  box-shadow: var(--shadow-line);
}

.exit-preview {
  width: 100%;
}

@media (max-width: 980px) {
  .family-panel {
    gap: 6px;
    position: static;
  }

  .mobile-hidden {
    display: none;
  }

  .family-nav {
    display: none;
  }
}
</style>
