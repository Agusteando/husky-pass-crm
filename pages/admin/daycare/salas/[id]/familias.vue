<template>
  <section class="family-module stack" data-product-area="daycare" data-product-screen="familias">
    <AdminModuleTabs :sala-id="salaId" />

    <header class="family-hero">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad || 'Guardería' }} · {{ data?.sala?.sala || 'Sala' }}</p>
        <h1>Familias</h1>
        <p>Administra cuentas familiares de guardería y revisa el acceso familiar de esta sala.</p>
      </div>
      <div class="family-actions">
        <label class="search-field">
          <span>Buscar</span>
          <input v-model="search" class="input" type="search" placeholder="Niño/a, usuario o correo" data-diagnostic-filter="buscar-familia" />
        </label>
        <button class="btn btn-primary" type="button" data-diagnostic-action="crear-familia" @click="startCreate">Nueva familia</button>
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
    <p v-if="actionNotice" class="notice">{{ actionNotice }}</p>
    <div v-if="pending" class="card loading-card" data-product-loading>Cargando familias…</div>

    <section v-else class="family-desk">
      <div class="card family-list-card" data-product-panel="familias-list" :data-state="filteredAccounts.length ? 'content' : 'empty'">
        <div class="section-head">
          <div>
            <p class="eyebrow">Cuentas</p>
            <h2>{{ filteredAccounts.length }} familias</h2>
          </div>
          <button v-if="canPreviewSala" class="btn btn-secondary" type="button" data-diagnostic-action="preview-sala" :disabled="previewing" :data-unavailable-reason="previewing ? 'Abriendo vista familiar' : undefined" @click="previewSala">{{ previewing ? 'Abriendo…' : 'Vista familiar de sala' }}</button>
        </div>

        <div v-if="filteredAccounts.length" class="family-list">
          <button
            v-for="account in filteredAccounts"
            :key="account.id"
            class="family-row"
            :class="{ active: selected?.id === account.id }"
            type="button"
            data-diagnostic-action="seleccionar-familia"
            :aria-pressed="selected?.id === account.id"
            @click="selectAccount(account)"
          >
            <span class="family-avatar">{{ initials(account.nombre_nino || accountLabel(account.username)) }}</span>
            <span class="family-copy">
              <strong>{{ account.nombre_nino || 'Sin nombre de niño/a' }}</strong>
              <small>{{ [accountLabel(account.username) || 'Sin usuario', account.email || 'Sin correo'].join(' · ') }}</small>
            </span>
            <span class="role-pill">{{ account.role || 'HUSKY' }}</span>
          </button>
        </div>
        <EmptyState v-else title="Sin familias" description="No hay cuentas familiares para esta búsqueda o sala." />
      </div>

      <aside class="card family-preview-card" data-product-panel="familia-preview" :data-state="selected ? 'content' : 'empty'">
        <template v-if="selected">
          <div class="section-head">
            <div>
              <p class="eyebrow">Detalle</p>
              <h2>{{ selected.nombre_nino || accountLabel(selected.username) }}</h2>
            </div>
          </div>
          <dl>
            <div><dt>Usuario</dt><dd>{{ accountLabel(selected.username) || 'Sin usuario' }}</dd></div>
            <div><dt>Correo</dt><dd>{{ selected.email || 'Sin correo' }}</dd></div>
            <div><dt>Rol</dt><dd>{{ selected.role || '—' }}</dd></div>
            <div><dt>Visible en</dt><dd>{{ data?.sala?.unidad }} · {{ data?.sala?.sala }}</dd></div>
          </dl>
          <div class="preview-actions">
            <button v-if="canImpersonateAccounts" class="btn btn-primary" type="button" data-diagnostic-action="impersonar-familia" :disabled="impersonatingId === selected.id" :data-unavailable-reason="impersonatingId === selected.id ? 'Abriendo impersonación' : undefined" @click="impersonate(selected.id)">{{ impersonationButtonLabel(selected.id) }}</button>
            <button v-if="confirmingImpersonationId === selected.id" class="btn btn-secondary" type="button" data-diagnostic-action="cancelar-impersonacion" @click="cancelImpersonation">Cancelar</button>
            <button class="btn btn-secondary" type="button" data-diagnostic-action="editar-familia" @click="editing = { ...selected }">Editar</button>
          </div>
        </template>
        <EmptyState v-else title="Selecciona una familia" description="El detalle y las acciones aparecerán aquí." />
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { FamilyAccount, Sala } from '~/types/daycare'
import type { AppSessionUser, PublicSession } from '~/types/session'
import { defaultFamilyRoute } from '~/utils/sessionScopes'
import { displayMatriculaCandidate } from '~/utils/matricula'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const salaId = Number(route.params.id)
const editing = ref<Partial<FamilyAccount> | null>(null)
const selected = ref<FamilyAccount | null>(null)
const saving = ref(false)
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const actionError = ref('')
const actionNotice = ref('')
const previewing = ref(false)
const impersonatingId = ref<number | null>(null)
const confirmingImpersonationId = ref<number | null>(null)
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'admin-family-module-session' })
const canPreviewSala = computed(() => Boolean(session.value?.user?.kind === 'admin'))
const canImpersonateAccounts = computed(() => Boolean(session.value?.user?.isSuperAdmin))
const { data, refresh, pending, error } = useFetch<{ sala: Sala; rows: FamilyAccount[] }>('/api/daycare/admin/family-accounts', {
  query: { sala: salaId },
  timeout: 15000
})

const selectedAccountId = computed(() => Number(route.query.familia || 0))

watch(search, () => syncQuery())

watch(() => route.query.buscar, (value) => {
  const next = typeof value === 'string' ? value : ''
  if (next !== search.value) search.value = next
})

watch(() => route.query.familia, (value) => {
  const id = Number(value || 0)
  if (!id) return
  const row = filteredAccounts.value.find((account) => account.id === id)
  if (row) selected.value = row
})

function accountLabel(value?: string | null) {
  return displayMatriculaCandidate(value)
}

const filteredAccounts = computed(() => {
  const rows = data.value?.rows || []
  const needle = search.value.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter((account) => `${account.nombre_nino || ''} ${account.username || ''} ${accountLabel(account.username) || ''} ${account.email || ''}`.toLowerCase().includes(needle))
})

watch(filteredAccounts, (rows) => {
  if (!rows.length) {
    selected.value = null
    return
  }
  const routeSelected = rows.find((row) => row.id === selectedAccountId.value)
  if (routeSelected) {
    selected.value = routeSelected
    return
  }
  if (!selected.value || !rows.some((row) => row.id === selected.value?.id)) {
    selected.value = rows[0] || null
    syncQuery(selected.value?.id)
  }
}, { immediate: true })

function startCreate() {
  actionError.value = ''
  actionNotice.value = ''
  editing.value = { sala: String(salaId), unidad: data.value?.sala.unidad, role: 'ROLE_HUSKY_USER', username: '', email: '' }
}

function selectAccount(account: FamilyAccount) {
  selected.value = account
  confirmingImpersonationId.value = null
  actionError.value = ''
  actionNotice.value = ''
  syncQuery(account.id)
}

function syncQuery(selectedId = selected.value?.id) {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.buscar = search.value.trim()
  if (selectedId) query.familia = String(selectedId)
  replaceQueryIfChanged(query)
}

function replaceQueryIfChanged(query: Record<string, string>) {
  if (!import.meta.client) return
  const keys = new Set([...Object.keys(route.query), ...Object.keys(query)])
  const changed = Array.from(keys).some((key) => {
    const current = Array.isArray(route.query[key]) ? route.query[key]?.[0] : route.query[key]
    return String(current || '') !== String(query[key] || '')
  })
  if (changed) router.replace({ path: route.path, query })
}

async function save(payload: Partial<FamilyAccount>) {
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const saved = await $fetch<FamilyAccount>('/api/daycare/admin/family-accounts', { method: 'POST', body: { ...payload, sala: String(salaId) } })
    editing.value = null
    await refresh()
    selected.value = (data.value?.rows || []).find((account) => account.id === saved.id) || selected.value
    syncQuery(saved.id)
    actionNotice.value = saved.id === payload.id ? 'Cuenta familiar actualizada.' : 'Cuenta familiar creada.'
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible guardar la cuenta familiar.'
  } finally {
    saving.value = false
  }
}

function impersonationButtonLabel(userId?: number) {
  if (!userId) return 'Impersonar'
  if (impersonatingId.value === userId) return 'Abriendo…'
  if (confirmingImpersonationId.value === userId) return 'Confirmar impersonación'
  return 'Impersonar'
}

function cancelImpersonation() {
  confirmingImpersonationId.value = null
  actionNotice.value = ''
}

async function impersonate(userId?: number) {
  if (!userId) return
  if (confirmingImpersonationId.value !== userId) {
    confirmingImpersonationId.value = userId
    actionError.value = ''
    actionNotice.value = 'Confirma para entrar como esta familia. La sesión quedará marcada como impersonación y podrás volver desde la barra superior.'
    return
  }

  actionError.value = ''
  actionNotice.value = ''
  impersonatingId.value = userId
  try {
    const response = await $fetch<{ user: AppSessionUser }>('/api/auth/admin/impersonate', {
      method: 'POST',
      body: { userId }
    })
    actionNotice.value = 'Abriendo impersonación familiar.'
    await navigateTo(defaultFamilyRoute(response.user))
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  } finally {
    impersonatingId.value = null
    confirmingImpersonationId.value = null
  }
}

async function previewSala() {
  actionError.value = ''
  actionNotice.value = ''
  previewing.value = true
  try {
    await $fetch('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: salaId } })
    actionNotice.value = 'Abriendo vista familiar de sala.'
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  } finally {
    previewing.value = false
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
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.64fr);
  padding: clamp(12px, 1.8vw, 18px);
}

.family-hero h1 {
  font-size: clamp(1.4rem, 2.2vw, 2rem);
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
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.family-desk {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
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
  font-weight: 600;
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
  font-weight: 600;
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
  font-weight: 600;
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

.notice {
  background: #f0f8e7;
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-900);
  font-weight: 600;
  margin: 0;
  padding: 10px 12px;
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
