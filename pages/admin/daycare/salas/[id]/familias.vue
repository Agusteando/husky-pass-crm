<template>
  <section class="family-module stack" data-product-area="daycare" data-product-screen="familias">
    <AdminModuleTabs :sala-id="salaId" />

    <header class="family-hero">
      <div>
        <p class="eyebrow">{{ data?.sala?.unidad || 'Guardería' }} · {{ data?.sala?.sala || 'Sala' }}</p>
        <h1>Familias</h1>
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
            <span class="role-pill">{{ accountStatusLabel(account) }}</span>
          </button>
        </div>
        <EmptyState v-else title="Sin familias" />
      </div>

      <aside class="card family-preview-card" data-product-panel="familia-preview" :data-state="selected ? 'content' : 'empty'">
        <template v-if="selected">
          <div class="section-head">
            <div>
              <p class="eyebrow">Detalle</p>
              <h2>{{ selected.nombre_nino || accountLabel(selected.username) }}</h2>
            </div>
          </div>
          <section class="family-profile-lines" aria-label="Resumen familiar">
            <article>
              <FamilyPersonasIcon name="person" />
              <span><small>Usuario</small><strong>{{ accountLabel(selected.username) || 'Pendiente' }}</strong></span>
            </article>
            <article>
              <FamilyPersonasIcon name="announcement" />
              <span><small>Correo</small><strong>{{ selected.email || 'Pendiente' }}</strong></span>
            </article>
            <article>
              <FamilyPersonasIcon name="security" />
              <span><small>Acceso</small><strong>{{ accountStatusLabel(selected) }}</strong></span>
            </article>
            <article>
              <FamilyPersonasIcon name="daycare" />
              <span><small>Sala</small><strong>{{ data?.sala?.unidad }} · {{ data?.sala?.sala }}</strong></span>
            </article>
          </section>
          <div class="preview-actions">
            <button v-if="canImpersonateAccounts" class="btn btn-primary" type="button" data-diagnostic-action="vista-familiar" :disabled="impersonatingId === selected.id" :data-unavailable-reason="impersonatingId === selected.id ? 'Abriendo vista familiar' : undefined" @click="impersonate(selected.id)">{{ impersonationButtonLabel(selected.id) }}</button>
            <button v-if="confirmingImpersonationId === selected.id" class="btn btn-secondary" type="button" data-diagnostic-action="cancelar-impersonacion" @click="cancelImpersonation">Cancelar</button>
            <button class="btn btn-secondary" type="button" data-diagnostic-action="editar-familia" @click="editing = { ...selected }">Editar</button>
          </div>
        </template>
        <EmptyState v-else title="Selecciona una familia" />
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import { computed, ref, watch } from 'vue'
import { navigateTo, useRoute, useRouter, useFetch } from 'nuxt/app'
import type { FamilyAccount, Sala } from '~/types/daycare'
import type { AppSessionUser, PublicSession } from '~/types/session'
import { setCachedRouteSession } from '~/utils/routeSession'
import { DAYCARE_FAMILY_ROLE, defaultFamilyRoute, hasDaycareAdminScope } from '~/utils/sessionScopes'
import { displayMatriculaCandidate } from '~/utils/matricula'

definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })

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
const { data: session } = useAppSession()
const canPreviewSala = computed(() => hasDaycareAdminScope(session.value?.user))
const canImpersonateAccounts = computed(() => hasDaycareAdminScope(session.value?.user))
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

function accountStatusLabel(account: Pick<FamilyAccount, 'username' | 'email' | 'role'>) {
  if (!account.username && !account.email) return 'Incompleta'
  if (!account.role) return 'Pendiente'
  return 'Activa'
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
  editing.value = { sala: String(salaId), unidad: data.value?.sala.unidad, role: DAYCARE_FAMILY_ROLE, username: '', email: '' }
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
  if (!userId) return 'Vista familiar'
  if (impersonatingId.value === userId) return 'Abriendo...'
  if (confirmingImpersonationId.value === userId) return 'Confirmar vista'
  return 'Vista familiar'
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
    actionNotice.value = 'Confirma para abrir la vista familiar de esta cuenta.'
    return
  }

  actionError.value = ''
  actionNotice.value = ''
  impersonatingId.value = userId
  try {
    const response = await $fetch<{ user: AppSessionUser } & PublicSession>('/api/auth/admin/impersonate', {
      method: 'POST',
      body: { userId }
    })
    actionNotice.value = 'Abriendo vista familiar.'
    setCachedRouteSession(response)
    await navigateTo(defaultFamilyRoute(response.user))
  } catch (err: any) {
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.message || err?.statusMessage || 'No fue posible abrir la vista familiar.'
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
    const response = await $fetch<PublicSession>('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: salaId } })
    actionNotice.value = 'Abriendo vista familiar de sala.'
    setCachedRouteSession(response)
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.message || err?.statusMessage || 'No fue posible abrir la vista familiar.'
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
  --ink: #102235;
  --muted: #607086;
  --line: rgba(18, 95, 89, 0.16);
  --line-soft: rgba(18, 95, 89, 0.10);
  --accent: #07877d;
  --accent-dark: #075f58;
  --sun: #f6b94f;
  gap: 16px;
}

.family-hero,
.family-list-card,
.family-preview-card,
.loading-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 22px 58px rgba(14, 40, 55, 0.08);
}

.family-hero {
  align-items: center;
  background:
    radial-gradient(circle at 10% 20%, rgba(8, 135, 125, 0.13), transparent 34%),
    radial-gradient(circle at 86% 0%, rgba(246, 185, 79, 0.20), transparent 30%),
    linear-gradient(135deg, #ffffff, #fbfdf6);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.72fr);
  overflow: hidden;
  padding: clamp(18px, 2.4vw, 28px);
  position: relative;
}

.family-hero::after {
  background: linear-gradient(180deg, var(--accent), #8bbf48);
  border-radius: 999px;
  content: '';
  height: 82px;
  opacity: 0.14;
  position: absolute;
  right: 28px;
  top: -40px;
  transform: rotate(34deg);
  width: 14px;
}

.family-hero h1,
.section-head h2,
.family-preview-card h2 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  margin: 0;
}

.family-hero h1 {
  font-size: clamp(2rem, 3.2vw, 3rem);
  letter-spacing: -0.035em;
  line-height: 0.98;
}

.eyebrow,
.search-field span {
  color: var(--accent-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.family-actions {
  align-items: end;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  position: relative;
  z-index: 1;
}

.search-field {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 17px;
  box-shadow: 0 14px 30px rgba(14, 40, 55, 0.06);
  display: grid;
  gap: 4px;
  padding: 8px 12px;
}

.search-field .input {
  background: transparent;
  border: 0;
  box-shadow: none;
  padding: 0;
}

.family-actions .btn-primary,
.preview-actions .btn-primary {
  background: #21324a;
  border-radius: 15px;
  box-shadow: 0 16px 30px rgba(33, 50, 74, 0.18);
}

.family-desk {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 390px);
}

.family-list-card,
.family-preview-card {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.section-head {
  align-items: center;
  border-bottom: 1px solid var(--line-soft);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 0;
  padding-bottom: 12px;
}

.section-head h2 {
  font-size: clamp(1.25rem, 2vw, 1.65rem);
}

.family-list {
  display: grid;
  gap: 8px;
}

.family-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 18px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  padding: 10px;
  text-align: left;
  transition: background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}

.family-row:hover,
.family-row.active {
  background: linear-gradient(135deg, #f0fbf7, #fffaf0);
  border-color: rgba(8, 135, 125, 0.22);
  transform: translateY(-1px);
}

.family-row.active {
  box-shadow: inset 3px 0 0 var(--accent);
}

.family-avatar {
  align-items: center;
  background: linear-gradient(135deg, #eefaf7, #fff6df);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 15px;
  color: var(--accent-dark);
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 950;
  height: 44px;
  justify-content: center;
  width: 44px;
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

.family-copy strong {
  color: var(--ink);
}

.family-copy small {
  color: var(--muted);
  font-size: 0.82rem;
}

.role-pill {
  background: #e5f8ee;
  border: 1px solid rgba(8, 135, 125, 0.12);
  border-radius: 999px;
  color: #148044;
  font-size: 0.72rem;
  font-weight: 900;
  padding: 6px 9px;
}

.family-preview-card {
  align-self: start;
  background:
    radial-gradient(circle at 100% 0%, rgba(8, 135, 125, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(249, 253, 250, 0.93));
  position: sticky;
  top: calc(var(--topbar-height) + 14px);
}

.family-preview-card h2 {
  font-size: clamp(1.35rem, 2.2vw, 2rem);
  line-height: 1;
}

.family-profile-lines {
  display: grid;
  gap: 8px;
}

.family-profile-lines article {
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  display: grid;
  gap: 9px;
  grid-template-columns: 32px minmax(0, 1fr);
  min-height: 56px;
  padding: 9px 10px;
}

.family-profile-lines small,
.family-profile-lines strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-profile-lines small {
  color: var(--muted);
  font-size: 0.7rem;
}

.family-profile-lines strong {
  color: var(--ink);
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.notice {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 14px;
  color: #047857;
  font-weight: 700;
  margin: 0;
  padding: 10px 12px;
}

.loading-card {
  color: var(--muted);
  padding: 20px;
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
