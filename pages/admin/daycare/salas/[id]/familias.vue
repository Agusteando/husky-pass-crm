<template>
  <section class="family-module stack">
    <AdminModuleTabs :sala-id="salaId" />

    <header class="family-hero">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad || 'Guardería' }} · {{ data?.sala?.sala || 'Sala' }}</p>
        <h1>Familias</h1>
        <p>Administra cuentas daycare, revisa acceso familiar e impersona para soporte.</p>
      </div>
      <div class="family-actions">
        <label class="search-field">
          <span>Buscar</span>
          <input v-model="search" class="input" type="search" placeholder="Niño/a, usuario o correo" />
        </label>
        <button class="btn btn-primary" type="button" @click="startCreate">Nueva familia</button>
      </div>
    </header>

    <FamilyAccountEditor
      v-if="editing"
      :account="editing"
      :saving="saving"
      @save="save"
      @cancel="editing = null"
    />

    <p v-if="error" class="alert">No fue posible cargar las cuentas familiares.</p>
    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <div v-else-if="pending" class="card loading-card">Cargando familias…</div>

    <section v-else class="family-desk">
      <div class="card family-list-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Cuentas</p>
            <h2>{{ filteredAccounts.length }} familias</h2>
          </div>
          <button class="btn btn-secondary" type="button" @click="previewSala">Vista familiar de sala</button>
        </div>

        <div v-if="filteredAccounts.length" class="family-list">
          <button
            v-for="account in filteredAccounts"
            :key="account.id"
            class="family-row"
            :class="{ active: selected?.id === account.id }"
            type="button"
            @click="selected = account"
          >
            <span class="family-avatar">{{ initials(account.nombre_nino || account.username) }}</span>
            <span class="family-copy">
              <strong>{{ account.nombre_nino || 'Sin nombre de niño/a' }}</strong>
              <small>{{ account.username }} · {{ account.email }}</small>
            </span>
            <span class="role-pill">{{ account.role || 'HUSKY' }}</span>
          </button>
        </div>
        <EmptyState v-else title="Sin familias" description="No hay cuentas familiares para esta búsqueda o sala." />
      </div>

      <aside class="card family-preview-card">
        <template v-if="selected">
          <div class="section-head">
            <div>
              <p class="eyebrow">Detalle</p>
              <h2>{{ selected.nombre_nino || selected.username }}</h2>
            </div>
          </div>
          <dl>
            <div><dt>Usuario</dt><dd>{{ selected.username }}</dd></div>
            <div><dt>Correo</dt><dd>{{ selected.email }}</dd></div>
            <div><dt>Rol</dt><dd>{{ selected.role || '—' }}</dd></div>
            <div><dt>Visible en</dt><dd>{{ data?.sala?.unidad }} · {{ data?.sala?.sala }}</dd></div>
          </dl>
          <div class="preview-actions">
            <button class="btn btn-primary" type="button" @click="impersonate(selected.id)">Impersonar</button>
            <button class="btn btn-secondary" type="button" @click="editing = { ...selected }">Editar</button>
          </div>
        </template>
        <EmptyState v-else title="Selecciona una familia" description="El detalle y las acciones aparecerán aquí." />
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { definePageMeta, navigateTo, useFetch, useRoute } from '#imports'
import type { FamilyAccount, Sala } from '~/types/daycare'
import type { AppSessionUser } from '~/types/session'
import { defaultFamilyRoute } from '~/utils/sessionScopes'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const salaId = Number(route.params.id)
const editing = ref<Partial<FamilyAccount> | null>(null)
const selected = ref<FamilyAccount | null>(null)
const saving = ref(false)
const search = ref('')
const actionError = ref('')
const { data, refresh, pending, error } = await useFetch<{ sala: Sala; rows: FamilyAccount[] }>('/api/daycare/admin/family-accounts', {
  query: { sala: salaId }
})

const filteredAccounts = computed(() => {
  const rows = data.value?.rows || []
  const needle = search.value.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter((account) => `${account.nombre_nino || ''} ${account.username || ''} ${account.email || ''}`.toLowerCase().includes(needle))
})

watch(filteredAccounts, (rows) => {
  if (!rows.length) {
    selected.value = null
    return
  }
  if (!selected.value || !rows.some((row) => row.id === selected.value?.id)) selected.value = rows[0] || null
}, { immediate: true })

function startCreate() {
  actionError.value = ''
  editing.value = { sala: String(salaId), unidad: data.value?.sala.unidad, role: 'ROLE_HUSKY_USER', username: '', email: '' }
}

async function save(payload: Partial<FamilyAccount>) {
  saving.value = true
  actionError.value = ''
  try {
    await $fetch('/api/daycare/admin/family-accounts', { method: 'POST', body: { ...payload, sala: String(salaId) } })
    editing.value = null
    await refresh()
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible guardar la cuenta familiar.'
  } finally {
    saving.value = false
  }
}

async function impersonate(userId?: number) {
  if (!userId) return
  actionError.value = ''
  try {
    const response = await $fetch<{ user: AppSessionUser }>('/api/auth/admin/impersonate', {
      method: 'POST',
      body: { userId }
    })
    await navigateTo(defaultFamilyRoute(response.user))
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  }
}

async function previewSala() {
  actionError.value = ''
  try {
    await $fetch('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: salaId } })
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  }
}

function initials(value?: string | null) {
  return String(value || 'HP').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}
</script>

<style scoped>
.family-module {
  gap: 12px;
}

.family-hero {
  align-items: end;
  background:
    radial-gradient(circle at top right, rgba(255, 181, 69, 0.13), transparent 44%),
    linear-gradient(135deg, #fff, #f6faef);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.7fr);
  padding: clamp(15px, 2vw, 22px);
}

.family-hero h1 {
  font-size: clamp(1.65rem, 2.8vw, 2.45rem);
  margin-bottom: 6px;
}

.family-actions {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.search-field {
  display: grid;
  gap: 5px;
}

.search-field span {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.family-desk {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h2 {
  font-size: 1.2rem;
  margin-bottom: 0;
}

.family-list {
  display: grid;
  gap: 8px;
}

.family-row {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 10px 12px;
  text-align: left;
}

.family-row:hover,
.family-row.active {
  background: var(--color-brand-100);
  border-color: var(--color-brand-300);
}

.family-avatar {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 950;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.family-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.family-copy strong,
.family-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-copy small {
  color: var(--color-muted);
  font-size: 0.82rem;
}

.role-pill {
  background: var(--color-brand-100);
  border-radius: 999px;
  color: var(--color-brand-800);
  font-size: 0.72rem;
  font-weight: 900;
  padding: 6px 9px;
}

.family-preview-card {
  align-self: start;
  display: grid;
  gap: 12px;
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.family-preview-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

dl div {
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding-top: 8px;
}

dt {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

dd {
  margin: 0;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1080px) {
  .family-hero,
  .family-desk {
    grid-template-columns: 1fr;
  }

  .family-preview-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .family-actions,
  .family-row {
    grid-template-columns: 1fr;
  }

  .family-row {
    align-items: start;
  }

  .family-copy strong,
  .family-copy small {
    white-space: normal;
  }

  .section-head {
    align-items: start;
    flex-direction: column;
  }

  .preview-actions {
    display: grid;
  }
}
</style>
