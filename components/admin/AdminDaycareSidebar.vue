<template>
  <aside v-if="session?.user?.kind === 'admin'" class="workspace-rail" aria-label="Workspace de guardería" data-product-panel="daycare-sidebar" data-state="content">
    <div class="rail-header">
      <div>
        <p class="eyebrow">Daycare Admin</p>
        <strong>Unidad y sala</strong>
      </div>
      <span v-if="session.user.isSuperAdmin" class="status-pill">Super admin</span>
    </div>

    <section class="rail-context">
      <label class="label compact-label">
        Unidad
        <select v-model="selectedUnidad" class="select" :disabled="!unidades.length" data-diagnostic-filter="unidad" @change="goToUnidad">
          <option v-if="!unidades.length" value="">Sin unidades</option>
          <option v-for="unidad in unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
        </select>
      </label>
      <label class="label compact-label">
        Sala
        <select v-model="selectedSala" class="select" :disabled="!salas?.length" data-diagnostic="sala-select" data-diagnostic-filter="sala" @change="goToSala">
          <option value="">Selecciona sala</option>
          <option v-for="sala in salas || []" :key="sala.id" :value="String(sala.id)">{{ sala.sala }}</option>
        </select>
      </label>
      <button v-if="canPreviewAsFamily" class="btn btn-primary preview-btn" type="button" data-diagnostic-action="preview-sala" :disabled="!selectedSala || previewing" :data-unavailable-reason="!selectedSala ? 'Selecciona una sala' : previewing ? 'Abriendo vista familiar' : undefined" @click="previewSala">{{ previewing ? 'Abriendo…' : 'Vista familiar' }}</button>
      <p v-if="actionError" class="rail-alert">{{ actionError }}</p>
      <p v-if="actionNotice" class="rail-notice">{{ actionNotice }}</p>
    </section>

    <nav class="primary-nav" aria-label="Navegación Daycare Admin">
      <NuxtLink v-if="session.user.isSuperAdmin" to="/admin/superadmin" active-class="active" data-diagnostic-link="superadmin">Superadmin</NuxtLink>
      <NuxtLink v-if="session.user.isSuperAdmin" to="/admin/superadmin/marbetes" active-class="active" data-diagnostic-link="marbetes">Marbetes</NuxtLink>
      <NuxtLink :to="{ path: '/admin/daycare/salas', query: selectedUnidad ? { unidad: selectedUnidad } : {} }" active-class="active" data-diagnostic-link="salas">Salas</NuxtLink>
      <NuxtLink v-if="selectedSala" :to="salaRoute(selectedSala, 'familias')" active-class="active" data-diagnostic-link="familias">Familias</NuxtLink>
      <NuxtLink v-if="selectedSala" :to="salaRoute(selectedSala, 'tareas')" active-class="active" data-diagnostic-link="tareas">Tareas</NuxtLink>
      <NuxtLink v-if="selectedSala" :to="salaRoute(selectedSala, 'avisos')" active-class="active" data-diagnostic-link="avisos">Avisos</NuxtLink>
      <NuxtLink v-if="selectedSala" :to="salaRoute(selectedSala, 'calendario')" active-class="active" data-diagnostic-link="calendario">Calendario</NuxtLink>
    </nav>

    <section class="rail-section">
      <div class="rail-title">
        <span>Salas activas</span>
        <small>{{ salas?.length || 0 }}</small>
      </div>
      <input v-model="search" class="input compact-search" type="search" placeholder="Buscar sala" data-diagnostic-filter="buscar-sala" />
      <div v-if="filteredSalas.length" class="rail-salas" role="list">
        <NuxtLink
          v-for="sala in filteredSalas"
          :key="sala.id"
          :to="salaRoute(sala.id)"
          :class="{ active: String(sala.id) === selectedSala }" data-diagnostic-link="sala-sidebar"
        >
          <span class="room-dot">{{ roomInitials(sala.sala) }}</span>
          <span class="sala-copy">
            <strong>{{ sala.sala }}</strong>
            <small>{{ sala.metrics.familias }} familias · {{ sala.metrics.totalRecursos }} publicaciones</small>
          </span>
        </NuxtLink>
      </div>
      <div v-else data-diagnostic="sala-unavailable" data-product-panel="sidebar-salas" data-state="empty"><EmptyState title="Sin salas" description="Cambia de unidad o ajusta la búsqueda." /></div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo, useFetch, useRequestFetch, useRoute } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import type { Sala, SalaSummary } from '~/types/daycare'

const props = defineProps<{ session?: PublicSession | null }>()
const route = useRoute()
const requestFetch = useRequestFetch()

const unidades = computed(() => props.session?.user?.unidades || [])
const routeSalaId = computed(() => {
  const raw = route.params.id
  return typeof raw === 'string' && /^\d+$/.test(raw) ? raw : ''
})

const selectedUnidad = ref(typeof route.query.unidad === 'string' ? route.query.unidad : unidades.value[0] || '')
const selectedSala = ref(routeSalaId.value)
const search = ref('')
const actionError = ref('')
const actionNotice = ref('')
const previewing = ref(false)
const canPreviewAsFamily = computed(() => Boolean(props.session?.user?.kind === 'admin'))

watch(unidades, (value) => {
  if (!selectedUnidad.value && value.length) selectedUnidad.value = value[0]
}, { immediate: true })

watch(() => route.query.unidad, (unidad) => {
  if (typeof unidad === 'string' && unidad && unidad !== selectedUnidad.value) selectedUnidad.value = unidad
})

watch(routeSalaId, async (id) => {
  selectedSala.value = id
  if (!id) return

  try {
    const sala = await requestFetch<Sala>(`/api/daycare/admin/salas/${id}`)
    if (sala?.unidad && sala.unidad !== selectedUnidad.value) selectedUnidad.value = sala.unidad
  } catch {
    selectedSala.value = ''
  }
}, { immediate: true })

const { data: salas } = useFetch<SalaSummary[]>('/api/daycare/admin/salas/overview', {
  query: computed(() => ({ unidad: selectedUnidad.value })),
  watch: [selectedUnidad],
  timeout: 15000,
  dedupe: 'cancel'
})

const filteredSalas = computed(() => {
  const rows = salas.value || []
  const needle = search.value.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter((sala) => `${sala.sala} ${sala.unidad}`.toLowerCase().includes(needle))
})

watch(salas, (value) => {
  if (!value?.length) {
    if (!routeSalaId.value) selectedSala.value = ''
    return
  }
  if (routeSalaId.value && value.some((sala) => String(sala.id) === routeSalaId.value)) {
    selectedSala.value = routeSalaId.value
    return
  }
  if (selectedSala.value && !value.some((sala) => String(sala.id) === selectedSala.value)) {
    selectedSala.value = ''
  }
}, { immediate: true })

function goToUnidad() {
  actionError.value = ''
  actionNotice.value = ''
  selectedSala.value = ''
  navigateTo({ path: '/admin/daycare/salas', query: selectedUnidad.value ? { unidad: selectedUnidad.value } : {} })
}

function goToSala() {
  actionError.value = ''
  actionNotice.value = ''
  if (!selectedSala.value) return
  navigateTo(salaRoute(selectedSala.value))
}

function salaRoute(id?: string | number | null, section?: 'familias' | 'tareas' | 'avisos' | 'calendario') {
  const path = section ? `/admin/daycare/salas/${id}/${section}` : `/admin/daycare/salas/${id}`
  return { path, query: selectedUnidad.value ? { unidad: selectedUnidad.value } : {} }
}

async function previewSala() {
  if (!selectedSala.value) return
  actionError.value = ''
  actionNotice.value = ''
  previewing.value = true
  try {
    await $fetch('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: selectedSala.value } })
    actionNotice.value = 'Abriendo vista familiar de sala.'
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  } finally {
    previewing.value = false
  }
}

function roomInitials(value?: string | null) {
  return String(value || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}
</script>

<style scoped>
.workspace-rail {
  align-self: start;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 10px;
  padding: 10px;
  position: sticky;
  top: calc(var(--topbar-height) + 12px);
}

.rail-header,
.rail-title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.rail-header strong {
  color: var(--color-ink);
  font-size: 1.15rem;
}

.status-pill {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-800);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 5px 9px;
}

.rail-context {
  background: linear-gradient(180deg, #fbfdf8, #f1f7e8);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  display: grid;
  gap: 9px;
  padding: 10px;
}

.compact-label {
  gap: 5px;
}

.preview-btn {
  width: 100%;
}

.rail-alert,
.rail-notice {
  border-radius: 12px;
  font-size: 0.8rem;
  line-height: 1.35;
  margin: 0;
  padding: 8px 10px;
}

.rail-alert {
  background: #fff3f0;
  border: 1px solid #ffd2ca;
  color: #8d2d25;
}

.rail-notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  color: var(--color-brand-900);
}

.primary-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.primary-nav a {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 7px 10px;
}

.primary-nav a:hover,
.primary-nav a.active,
.primary-nav a.router-link-active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
  color: var(--color-brand-900);
}

.rail-section {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.rail-title span,
.rail-title small {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.compact-search {
  min-height: 34px;
  padding-block: 8px;
}

.rail-salas {
  display: grid;
  gap: 7px;
  max-height: calc(100vh - 470px);
  overflow: auto;
  padding-right: 2px;
}

.rail-salas a {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 15px;
  display: grid;
  gap: 9px;
  grid-template-columns: 34px minmax(0, 1fr);
  padding: 8px;
}

.rail-salas a:hover,
.rail-salas a.active,
.rail-salas a.router-link-active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-200);
}

.room-dot {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-brand-200);
  border-radius: 13px;
  color: var(--color-brand-900);
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 600;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.sala-copy {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.sala-copy strong,
.sala-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sala-copy strong {
  color: var(--color-ink);
  font-size: 0.9rem;
}

.sala-copy small {
  color: var(--color-muted);
  font-size: 0.76rem;
}

@media (max-width: 980px) {
  .workspace-rail {
    gap: 10px;
    position: static;
  }

  .rail-header {
    display: none;
  }

  .rail-context {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .preview-btn {
    grid-column: 1 / -1;
  }

  .rail-section {
    display: none;
  }

  .primary-nav {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .primary-nav a {
    flex: 0 0 auto;
  }
}

@media (max-width: 560px) {
  .rail-context {
    grid-template-columns: 1fr;
  }
}
</style>
