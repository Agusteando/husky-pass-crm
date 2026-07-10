<template>
  <section class="family-module stack" data-product-area="daycare" data-product-screen="familias">
    <AdminModuleTabs :sala-id="salaId" :unidad="data?.sala?.unidad" :sala-name="data?.sala?.sala" />
    <AdminProcessingTray :items="syncEntries" />

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
        <button class="btn btn-secondary" type="button" data-diagnostic-action="registro-sala" @click="openRegistrationLink">Link de registro</button>
        <button class="btn btn-secondary" type="button" data-diagnostic-action="password-sala" :disabled="passwordSaving" @click="openSalaPassword">Contraseña de sala</button>
        <button class="btn btn-primary" type="button" data-diagnostic-action="crear-familia" :disabled="saving" @click="startCreate">Nueva familia</button>
      </div>
    </header>

    <section v-if="rosterAvailable" class="roster-strip" aria-label="Lista de sala">
      <article>
        <span class="roster-dot good">✓</span>
        <strong>{{ rosterSummary.linked }}</strong>
        <small>con ficha</small>
      </article>
      <article>
        <span class="roster-dot warm">+</span>
        <strong>{{ rosterSummary.pending }}</strong>
        <small>por activar</small>
      </article>
      <article>
        <span class="roster-dot move">↗</span>
        <strong>{{ rosterSummary.moved }}</strong>
        <small>cambio de sala</small>
      </article>
      <article>
        <span class="roster-dot neutral">{{ rosterSummary.inSala }}</span>
        <small>lista de sala</small>
      </article>
      <button class="roster-diagnostics-trigger" type="button" @click="rosterDiagnosticsDialog = true">Diagnóstico</button>
    </section>
    <section v-else-if="data?.roster" class="roster-strip muted-roster" aria-label="Lista de sala no disponible">
      <article>
        <span class="roster-dot warm">!</span>
        <strong>Lista externa sin conexión</strong>
        <small>{{ data.roster.sourceMessage || 'Las familias guardadas siguen disponibles.' }}</small>
      </article>
      <button class="roster-diagnostics-trigger" type="button" @click="rosterDiagnosticsDialog = true">Diagnóstico</button>
    </section>

    <AdminModal
      v-if="rosterDiagnosticsDialog"
      title="Diagnóstico de lista"
      eyebrow="Guardería"
      :description="data?.sala ? `${data.sala.unidad} · ${data.sala.sala}` : undefined"
      @close="rosterDiagnosticsDialog = false"
    >
      <section class="roster-diagnostics-modal">
        <div class="diagnostics-grid">
          <article>
            <span>Fuente</span>
            <strong>{{ rosterDiagnostics?.sourceUrl || 'Sin fuente' }}</strong>
          </article>
          <article>
            <span>Hojas</span>
            <strong>{{ rosterDiagnostics?.sheetCount ?? 0 }}</strong>
          </article>
          <article>
            <span>Filas externas</span>
            <strong>{{ rosterDiagnostics?.totalRows ?? 0 }}</strong>
          </article>
          <article>
            <span>Empates por correo</span>
            <strong>{{ rosterDiagnostics?.accounts?.matchedByEmail ?? 0 }}</strong>
          </article>
        </div>
        <div class="diagnostics-block">
          <span>Hojas usadas para esta unidad</span>
          <strong>{{ rosterDiagnostics?.unidad?.matchedSheets?.join(', ') || 'Ninguna' }}</strong>
        </div>
        <div class="diagnostics-block">
          <span>Salas externas sin empate local</span>
          <strong>{{ rosterDiagnostics?.sala?.unmatchedSourceSalas?.join(', ') || 'Ninguna' }}</strong>
        </div>
        <div class="diagnostics-block" v-if="rosterDiagnostics?.missingColumnsBySheet?.length">
          <span>Columnas faltantes</span>
          <strong>{{ rosterDiagnostics.missingColumnsBySheet.map((item) => `${item.sheet}: ${item.missing.join(', ')}`).join(' · ') }}</strong>
        </div>
        <div class="diagnostics-block">
          <span>Supuestos validados</span>
          <ul>
            <li v-for="item in rosterDiagnostics?.assumptions || []" :key="item">{{ item }}</li>
          </ul>
        </div>
        <footer class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="copyRosterDiagnostics">Copiar diagnóstico</button>
          <button class="btn btn-primary" type="button" @click="rosterDiagnosticsDialog = false">Listo</button>
        </footer>
      </section>
    </AdminModal>

    <AdminModal
      v-if="editing"
      :title="editing.id ? 'Editar familia' : 'Nueva familia'"
      eyebrow="Guardería"
      :description="data?.sala ? `${data.sala.unidad} · ${data.sala.sala}` : undefined"
      :close-disabled="saving"
      :dirty="familyDraftDirty"
      @close="closeFamilyEditor"
    >
      <template #default="{ requestClose }">
        <p v-if="actionError" class="alert compact-alert">{{ actionError }}</p>
        <FamilyAccountEditor
          :account="editing"
          :baseline-account="editingBaseline || undefined"
          :saving="saving"
          @save="save"
          @cancel="requestClose"
          @dirty-change="familyDraftDirty = $event"
        />
      </template>
    </AdminModal>

    <AdminModal
      v-if="passwordDialog"
      :title="passwordDialog.mode === 'sala' ? 'Contraseña de sala' : 'Contraseña familiar'"
      eyebrow="Acceso"
      :description="passwordDialog.mode === 'sala' ? 'Asignar la misma contraseña a todas las familias de esta sala.' : selectedPasswordDescription"
      :close-disabled="passwordSaving"
      :dirty="passwordDraftDirty || passwordSaveFailed"
      @close="closePasswordDialog"
    >
      <template #default="{ requestClose }">
      <form class="password-modal" @submit.prevent="savePasswordDialog">
        <div class="password-preview">
          <span>{{ passwordDialog.mode === 'sala' ? filteredAccounts.length : 1 }}</span>
          <strong>{{ passwordDialog.mode === 'sala' ? 'familias reciben esta contraseña' : 'contraseña visible para guardería' }}</strong>
        </div>
        <label class="label">
          Contraseña
          <div class="password-input-row">
            <input v-model="passwordForm.password" class="input mono-input" required autocomplete="new-password" />
            <button class="btn btn-secondary" type="button" @click="generatePassword">Generar</button>
          </div>
        </label>
        <label class="toggle-line">
          <input v-model="passwordForm.passwordCanChange" type="checkbox" />
          <span>La familia puede cambiar la contraseña</span>
        </label>
        <label class="toggle-line">
          <input v-model="passwordForm.sendEmail" type="checkbox" />
          <span>Enviar acceso por correo al guardar</span>
        </label>
        <footer class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="requestClose">Cancelar</button>
          <button class="btn btn-primary" type="submit" :disabled="passwordSaving">{{ passwordSaving ? 'Guardando…' : 'Guardar contraseña' }}</button>
        </footer>
      </form>
      </template>
    </AdminModal>

    <AdminModal
      v-if="rosterDialog"
      :title="rosterDialog.applySala ? 'Mover familia' : 'Actualizar nombre'"
      eyebrow="Lista de sala"
      :description="rosterDialog.account.email || rosterDialog.account.username"
      :close-disabled="rosterSaving"
      @close="rosterDialog = null"
    >
      <section class="roster-confirm-modal">
        <div class="roster-confirm-icon">{{ rosterDialog.applySala ? '↗' : '✓' }}</div>
        <div>
          <strong>{{ rosterDialog.applySala ? selectedRosterTitle : rosterDialog.account.roster?.childName }}</strong>
          <small>{{ rosterDialog.applySala ? selectedRosterDetail : 'Se guardará como nombre del niño o niña.' }}</small>
        </div>
        <footer class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="rosterDialog = null">Cancelar</button>
          <button class="btn btn-primary" type="button" :disabled="rosterSaving" @click="confirmRosterDialog">{{ rosterSaving ? 'Guardando…' : 'Aplicar' }}</button>
        </footer>
      </section>
    </AdminModal>

    <AdminModal
      v-if="registrationDialog"
      title="Registro familiar"
      eyebrow="Link de sala"
      :description="data?.sala ? `${data.sala.unidad} · ${data.sala.sala}` : undefined"
      :close-disabled="registrationLoading"
      :dirty="registrationDraftDirty"
      @close="closeRegistrationDialog"
    >
      <template #default="{ requestClose }">
      <section class="registration-link-modal">
        <div class="registration-qr-card">
          <img v-if="registrationLink?.qrUrl" :src="registrationLink.qrUrl" alt="QR de registro" />
          <span v-else>QR</span>
        </div>
        <div class="registration-link-copy">
          <p>Comparte este acceso con familias de la sala para que creen su cuenta.</p>
          <p v-if="actionError" class="alert compact-alert">{{ actionError }}</p>
          <div class="friendly-code">
            <span>Código</span>
            <strong>{{ registrationLink?.token || 'preparando' }}</strong>
          </div>
          <div class="link-box">
            <span>{{ registrationShortPath || registrationLink?.url || 'Generando enlace…' }}</span>
            <button class="btn btn-secondary" type="button" :disabled="!registrationLink?.url" @click="copyRegistrationLink">Copiar</button>
          </div>
          <label class="label">
            Enviar link a correo
            <div class="password-input-row">
              <input v-model="registrationEmail" class="input" type="email" placeholder="correo@familia.com" />
              <button class="btn btn-secondary" type="button" :disabled="registrationLoading || !registrationEmail" @click="sendRegistrationLink">Enviar</button>
            </div>
          </label>
          <footer class="modal-actions">
            <button class="btn btn-secondary" type="button" :disabled="registrationLoading" @click="regenerateRegistrationLink">Regenerar link</button>
            <button class="btn btn-primary" type="button" @click="requestClose">Listo</button>
          </footer>
        </div>
      </section>
      </template>
    </AdminModal>

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

        <div v-if="filteredAccounts.length || rosterSourceOnly.length" class="family-list">
          <button
            v-for="account in filteredAccounts"
            :key="account.id"
            class="family-row"
            :class="{ active: selected?.id === account.id, syncing: familyStatus(account.id)?.state === 'pending', failed: familyStatus(account.id)?.state === 'error' }"
            type="button"
            data-diagnostic-action="seleccionar-familia"
            :aria-pressed="selected?.id === account.id"
            @click="selectAccount(account)"
          >
            <span class="family-avatar">{{ initials(account.nombre_nino || accountLabel(account.username)) }}</span>
            <span class="family-copy">
              <strong>{{ account.nombre_nino || account.roster?.childName || 'Sin nombre de niño/a' }}</strong>
              <small>{{ [accountLabel(account.username) || 'Sin usuario', account.email || 'Sin correo'].join(' · ') }}</small>
            </span>
            <span class="family-row-tail">
              <AdminSyncCue v-if="familyStatus(account.id)" :status="familyStatus(account.id)" compact />
              <span class="source-pill" :data-state="accountRosterState(account)">{{ accountRosterMark(account) }}</span>
            </span>
          </button>
          <div v-if="rosterSourceOnly.length" class="source-only-list">
            <p>Por activar</p>
            <button v-for="entry in rosterSourceOnly" :key="[entry.sourceSheet, entry.normalizedEmail, entry.childName].join('-')" class="source-only-row" type="button" @click="startCreateFromRoster(entry)">
              <span class="family-avatar soft">{{ initials(entry.childName || entry.tutorEmail) }}</span>
              <span>
                <strong>{{ entry.childName || 'Familia sin nombre' }}</strong>
                <small>{{ [entry.tutorEmail, entry.targetSalaName || entry.salaName].filter(Boolean).join(' · ') }}</small>
              </span>
              <span class="btn-mini">Crear</span>
            </button>
          </div>
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
            <AdminSyncCue v-if="familyStatus(selected.id)" :status="familyStatus(selected.id)" />
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
          <section v-if="selectedRosterVisible" class="roster-sync-card" :data-state="selected?.roster?.state || 'not-found'">
            <span class="roster-sync-icon">{{ selectedRosterIcon }}</span>
            <div>
              <strong>{{ selectedRosterTitle }}</strong>
              <small>{{ selectedRosterDetail }}</small>
            </div>
            <div class="roster-sync-actions">
              <button v-if="selected?.roster?.childDifferent" class="btn btn-secondary" type="button" :disabled="rosterSaving || isFamilyPending(selected.id)" @click="openRosterDialog(selected, { applyChildName: true })">Aplicar nombre</button>
              <button v-if="selected?.roster?.state === 'room-changed' && selected?.roster?.targetSalaId" class="btn btn-primary" type="button" :disabled="rosterSaving || isFamilyPending(selected.id)" @click="openRosterDialog(selected, { applySala: true, applyChildName: true })">{{ selectedRosterMoveCta }}</button>
            </div>
          </section>
          <section class="access-panel" aria-label="Acceso familiar">
            <div>
              <small>Contraseña</small>
              <strong>{{ selected.plaintext || 'Sin contraseña visible' }}</strong>
            </div>
            <span :class="selected.passwordCanChange === false ? 'lock-pill locked' : 'lock-pill'">{{ selected.passwordCanChange === false ? 'Fijada por guardería' : 'Puede cambiarla' }}</span>
          </section>
          <div class="preview-actions">
            <button v-if="canImpersonateAccounts" class="btn btn-primary" type="button" data-diagnostic-action="vista-familiar" :disabled="impersonatingId === selected.id" :data-unavailable-reason="impersonatingId === selected.id ? 'Abriendo vista familiar' : undefined" @click="impersonate(selected.id)">{{ impersonationButtonLabel(selected.id) }}</button>
            <button v-if="confirmingImpersonationId === selected.id" class="btn btn-secondary" type="button" data-diagnostic-action="cancelar-impersonacion" @click="cancelImpersonation">Cancelar</button>
            <button class="btn btn-secondary" type="button" data-diagnostic-action="editar-familia" :disabled="isFamilyPending(selected.id)" @click="openFamilyEditor(selected)">Editar familia</button>
            <button class="btn btn-secondary" type="button" data-diagnostic-action="password-familia" :disabled="passwordSaving || isFamilyPending(selected.id)" @click="openFamilyPassword(selected)">Contraseña</button>
            <button class="btn btn-secondary" type="button" data-diagnostic-action="email-acceso" :disabled="emailingId === selected.id || isFamilyPending(selected.id) || !selected.plaintext || !selected.email" @click="sendAccessEmail(selected)">{{ emailingId === selected.id ? 'Enviando…' : 'Enviar acceso' }}</button>
          </div>
        </template>
        <EmptyState v-else title="Selecciona una familia" />
      </aside>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import { useAppSession } from '~/composables/useAppSession'
import { useDraftState } from '~/composables/useDraftState'
import { useOptimisticStatus } from '~/composables/useOptimisticStatus'
import type { DaycareRosterEntry, DaycareRosterOverlay, FamilyAccount, Sala } from '~/types/daycare'
import type { AppSessionUser, PublicSession } from '~/types/session'
import { setCachedRouteSession } from '~/utils/routeSession'
import { DAYCARE_FAMILY_ROLE, defaultFamilyRoute, hasDaycareAdminScope } from '~/utils/sessionScopes'
import { displayMatriculaCandidate } from '~/utils/matricula'
import AdminModuleTabs from '~/components/admin/AdminModuleTabs.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminProcessingTray from '~/components/admin/AdminProcessingTray.vue'
import AdminSyncCue from '~/components/admin/AdminSyncCue.vue'
import EmptyState from '~/components/EmptyState.vue'
import FamilyAccountEditor from '~/components/admin/FamilyAccountEditor.vue'
import FamilyPersonasIcon from '~/components/family/PersonasIcon.vue'

definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })

const route = useRoute()
const router = useRouter()
const salaId = Number(route.params.id)
const editing = ref<Partial<FamilyAccount> | null>(null)
const editingBaseline = ref<Partial<FamilyAccount> | null>(null)
const familyDraftDirty = ref(false)
const selected = ref<FamilyAccount | null>(null)
const saving = ref(false)
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const actionError = ref('')
const actionNotice = ref('')
const previewing = ref(false)
const impersonatingId = ref<number | null>(null)
const confirmingImpersonationId = ref<number | null>(null)
const emailingId = ref<number | null>(null)
const passwordSaving = ref(false)
const passwordSaveFailed = ref(false)
const passwordDialog = ref<{ mode: 'family' | 'sala'; account?: FamilyAccount | null } | null>(null)
const passwordForm = ref({ password: '', passwordCanChange: true, sendEmail: false })
const registrationDialog = ref(false)
const registrationLoading = ref(false)
const registrationEmail = ref('')
const registrationLink = ref<{ token: string; url: string; qrUrl: string; sala: string; unidad: string } | null>(null)
const rosterDiagnosticsDialog = ref(false)
const rosterSaving = ref(false)
const rosterDialog = ref<{ account: FamilyAccount; applyChildName?: boolean; applySala?: boolean } | null>(null)
const bulkStatusKeyByFamily = ref<Record<number, string>>({})
let optimisticFamilyId = -1
let familyRevision = 0

const passwordDraftSource = computed(() => ({ ...passwordForm.value }))
const registrationDraftSource = computed(() => ({ email: registrationEmail.value.trim() }))
const { isDirty: passwordDraftDirty, resetDraft: resetPasswordDraft } = useDraftState(passwordDraftSource)
const { isDirty: registrationDraftDirty, resetDraft: resetRegistrationDraft } = useDraftState(registrationDraftSource)
const {
  entries: syncEntries,
  getStatus,
  markPending,
  markDone,
  markError,
  moveStatus
} = useOptimisticStatus()

const { data: session } = useAppSession()
const canPreviewSala = computed(() => hasDaycareAdminScope(session.value?.user))
const canImpersonateAccounts = computed(() => hasDaycareAdminScope(session.value?.user))
const { data, pending, error } = useFetch<{ sala: Sala; rows: FamilyAccount[]; roster?: DaycareRosterOverlay }>('/api/daycare/admin/family-accounts', {
  query: { sala: salaId },
  timeout: 15000
})

const rosterAvailable = computed(() => Boolean(data.value?.roster?.available))
const rosterSummary = computed(() => data.value?.roster?.summary || { inSala: 0, linked: 0, pending: 0, moved: 0 })
const rosterSourceOnly = computed(() => data.value?.roster?.sourceOnly || [])
const rosterDiagnostics = computed(() => data.value?.roster?.diagnostics || null)
const registrationShortPath = computed(() => registrationLink.value?.token ? `/r/${registrationLink.value.token}` : '')
const selectedAccountId = computed(() => Number(route.query.familia || 0))
const selectedPasswordDescription = computed(() => passwordDialog.value?.account?.nombre_nino || passwordDialog.value?.account?.email || 'Cuenta familiar')
const selectedRosterVisible = computed(() => Boolean(selected.value?.roster && selected.value.roster.state !== 'not-found'))
const selectedRosterIcon = computed(() => selected.value?.roster?.state === 'room-changed' ? '↗' : '✓')
const selectedRosterTitle = computed(() => {
  const roster = selected.value?.roster
  if (!roster) return ''
  if (roster.state === 'room-changed') return roster.movement === 'forward' ? 'Subió de sala' : 'Cambió de sala'
  if (roster.childDifferent) return 'Nombre sugerido'
  return 'En lista de sala'
})
const selectedRosterDetail = computed(() => {
  const roster = selected.value?.roster
  if (!roster) return ''
  if (roster.state === 'room-changed') return [roster.targetSalaName, roster.childName].filter(Boolean).join(' · ')
  return [roster.childName, roster.targetSalaName || roster.salaName].filter(Boolean).join(' · ')
})
const selectedRosterMoveCta = computed(() => selected.value?.roster?.movement === 'forward' ? 'Promover a sala' : 'Mover a sala')

const filteredAccounts = computed(() => {
  const rows = data.value?.rows || []
  const needle = search.value.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter((account) => `${account.nombre_nino || ''} ${account.username || ''} ${accountLabel(account.username) || ''} ${account.email || ''}`.toLowerCase().includes(needle))
})

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

function accountLabel(value?: string | null) {
  return displayMatriculaCandidate(value)
}

function accountStatusLabel(account: Pick<FamilyAccount, 'username' | 'email' | 'role'>) {
  if (!account.username && !account.email) return 'Incompleta'
  if (!account.role) return 'Pendiente'
  return 'Activa'
}

function startCreate() {
  if (saving.value) return
  const draft: Partial<FamilyAccount> = {
    sala: String(salaId),
    unidad: data.value?.sala.unidad,
    role: DAYCARE_FAMILY_ROLE,
    username: '',
    email: ''
  }
  openFamilyDraft(draft, draft)
}

function startCreateFromRoster(entry: DaycareRosterEntry) {
  if (saving.value) return
  const draft: Partial<FamilyAccount> = {
    sala: String(entry.targetSalaId || salaId),
    unidad: data.value?.sala.unidad,
    role: DAYCARE_FAMILY_ROLE,
    username: entry.tutorEmail || '',
    email: entry.tutorEmail || '',
    nombre_nino: entry.childName || ''
  }
  openFamilyDraft(draft, draft)
}

function openFamilyEditor(account: FamilyAccount | null) {
  if (!account || isFamilyPending(account.id) || saving.value) return
  const draft: Partial<FamilyAccount> = {
    ...account,
    sala: String(salaId),
    unidad: data.value?.sala?.unidad || account.unidad,
    role: account.role || DAYCARE_FAMILY_ROLE,
    username: account.username || '',
    email: account.email || ''
  }
  openFamilyDraft(draft, draft)
}

function openFamilyDraft(draft: Partial<FamilyAccount>, baseline: Partial<FamilyAccount>) {
  actionError.value = ''
  actionNotice.value = ''
  editing.value = { ...draft }
  editingBaseline.value = { ...baseline }
  familyDraftDirty.value = false
}

function closeFamilyEditor() {
  if (saving.value) return
  editing.value = null
  editingBaseline.value = null
  familyDraftDirty.value = false
  actionError.value = ''
}

function dismissFamilyEditorForSave() {
  editing.value = null
  familyDraftDirty.value = false
}

function accountRosterState(account: FamilyAccount) {
  if (account.roster?.state === 'room-changed') return 'move'
  if (account.roster?.state === 'matched') return 'ok'
  return 'review'
}

function accountRosterMark(account: FamilyAccount) {
  if (account.roster?.state === 'room-changed') return '↗'
  if (account.roster?.state === 'matched') return '✓'
  return '!'
}

function openRosterDialog(account: FamilyAccount | null, options: { applyChildName?: boolean; applySala?: boolean }) {
  if (!account || isFamilyPending(account.id)) return
  rosterDialog.value = { account, ...options }
}

function confirmRosterDialog() {
  if (!rosterDialog.value) return
  void applyRoster(rosterDialog.value.account, {
    applyChildName: rosterDialog.value.applyChildName,
    applySala: rosterDialog.value.applySala
  })
}

async function applyRoster(account: FamilyAccount | null, options: { applyChildName?: boolean; applySala?: boolean }) {
  if (!account?.id || rosterSaving.value || isFamilyPending(account.id)) return
  rosterSaving.value = true
  actionError.value = ''
  actionNotice.value = ''
  const previousRows = cloneFamilyRows()
  const originalIndex = previousRows.findIndex((row) => row.id === account.id)
  const previousSelectedId = selected.value?.id
  const previousDialog = rosterDialog.value ? { ...rosterDialog.value } : null
  const key = familyKey(account.id)
  const label = familyDisplayName(account)
  familyRevision += 1

  rosterDialog.value = null
  if (options.applySala) {
    setFamilyRows((data.value?.rows || []).filter((row) => row.id !== account.id))
    if (previousSelectedId === account.id) selected.value = filteredAccounts.value[0] || null
  } else {
    const optimistic = {
      ...account,
      nombre_nino: options.applyChildName ? account.roster?.childName || account.nombre_nino : account.nombre_nino,
      roster: account.roster ? { ...account.roster, childDifferent: false } : account.roster
    }
    replaceLocalFamily(account.id, optimistic)
    if (previousSelectedId === account.id) selected.value = optimistic
  }
  syncQuery(selected.value?.id)
  markPending(key, label, {
    detail: options.applySala ? 'Moviendo la familia a la sala sugerida.' : 'Aplicando la información de la lista.'
  })

  try {
    await $fetch('/api/daycare/admin/roster-apply', { method: 'POST', body: { sala: salaId, userId: account.id, ...options } })
    markDone(key, label, { detail: options.applySala ? 'La familia quedó movida.' : 'Los datos quedaron actualizados.' })
    actionNotice.value = options.applySala ? 'Familia movida a su sala.' : 'Datos familiares actualizados.'
    refreshFamiliesInBackground(options.applySala ? undefined : account.id)
  } catch (err: any) {
    const previousAccount = previousRows.find((row) => row.id === account.id) || account
    if (options.applySala) restoreLocalFamily(previousAccount, originalIndex)
    else replaceLocalFamily(Number(account.id), previousAccount)
    if (!selected.value || selected.value.id === account.id) selected.value = previousAccount
    rosterDialog.value = previousDialog
    syncQuery(selected.value?.id)
    markError(key, label, { detail: 'No se aplicó el cambio; restauramos la cuenta.' })
    actionError.value = err?.data?.statusMessage || err?.message || 'No fue posible aplicar la sugerencia.'
  } finally {
    rosterSaving.value = false
  }
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
  const unidadQuery = typeof route.query.unidad === 'string' ? route.query.unidad : data.value?.sala?.unidad
  if (unidadQuery) query.unidad = unidadQuery
  if (search.value.trim()) query.buscar = search.value.trim()
  if (selectedId && selectedId > 0) query.familia = String(selectedId)
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
  if (saving.value) return
  saving.value = true
  actionError.value = ''
  actionNotice.value = ''
  const previousRows = cloneFamilyRows()
  const previousSelectedId = selected.value?.id
  const baselineBeforeSave = editingBaseline.value ? { ...editingBaseline.value } : null
  const isUpdate = Boolean(payload.id && Number(payload.id) > 0)
  const localId = isUpdate ? Number(payload.id) : optimisticFamilyId--
  const requestPayload = { ...payload, sala: String(salaId) }
  const optimistic = buildOptimisticFamily(requestPayload, localId)
  const key = familyKey(localId)
  familyRevision += 1

  upsertLocalFamily(optimistic, !isUpdate)
  selected.value = optimistic
  dismissFamilyEditorForSave()
  markPending(key, familyDisplayName(optimistic), {
    detail: isUpdate ? 'Guardando los cambios de la cuenta.' : 'Creando la cuenta familiar.'
  })

  try {
    const saved = await $fetch<FamilyAccount>('/api/daycare/admin/family-accounts', {
      method: 'POST',
      body: requestPayload
    })
    const savedId = Number(saved.id)
    if (!Number.isInteger(savedId) || savedId <= 0) throw new Error('El servidor no devolvió el identificador de la cuenta.')
    const savedKey = familyKey(savedId)
    const savedAccountStillSelected = selected.value?.id === localId
    moveStatus(key, savedKey)
    const existing = previousRows.find((row) => row.id === payload.id)
    const confirmed = { ...optimistic, ...saved, id: savedId, roster: existing?.roster || optimistic.roster } as FamilyAccount
    replaceLocalFamily(localId, confirmed)
    if (savedAccountStillSelected) {
      selected.value = confirmed
      syncQuery(savedId)
    }
    editingBaseline.value = null
    markDone(savedKey, familyDisplayName(confirmed), { detail: 'El servidor confirmó la cuenta.' })
    actionNotice.value = isUpdate ? 'Cuenta familiar actualizada.' : 'Cuenta familiar creada.'
    refreshFamiliesInBackground(savedId)
  } catch (err: any) {
    const previousAccount = previousRows.find((row) => row.id === localId)
    if (previousAccount) replaceLocalFamily(localId, previousAccount)
    else removeLocalFamily(localId)
    if (selected.value?.id === localId) {
      selected.value = previousSelectedId
        ? (data.value?.rows || []).find((row) => row.id === previousSelectedId) || previousAccount || null
        : previousAccount || null
      syncQuery(selected.value?.id)
    }
    editing.value = { ...payload }
    editingBaseline.value = baselineBeforeSave
    familyDraftDirty.value = true
    markError(key, familyDisplayName(optimistic), { detail: 'No se guardó; restauramos la cuenta anterior.' })
    actionError.value = err?.data?.statusMessage || err?.statusMessage || err?.message || 'No fue posible guardar la cuenta familiar.'
  } finally {
    saving.value = false
  }
}

async function copyRosterDiagnostics() {
  if (!rosterDiagnostics.value) return
  try {
    await navigator.clipboard?.writeText(JSON.stringify(rosterDiagnostics.value, null, 2))
    actionNotice.value = 'Diagnóstico copiado.'
  } catch {
    actionError.value = 'No fue posible copiar el diagnóstico automáticamente.'
  }
}

async function openRegistrationLink() {
  if (registrationLoading.value) return
  registrationDialog.value = true
  actionError.value = ''
  actionNotice.value = ''
  resetRegistrationDraft()
  if (!registrationLink.value) await loadRegistrationLink(false)
}

function closeRegistrationDialog() {
  if (registrationLoading.value) return
  registrationDialog.value = false
  registrationEmail.value = ''
  resetRegistrationDraft()
}

async function loadRegistrationLink(regenerate = false) {
  registrationLoading.value = true
  actionError.value = ''
  try {
    const endpoint = '/api/daycare/admin/registration-link'
    const response = regenerate
      ? await $fetch<{ link: { token: string; url: string; qrUrl: string; sala: string; unidad: string } }>(endpoint, { method: 'POST', body: { sala: salaId, regenerate: true } })
      : await $fetch<{ link: { token: string; url: string; qrUrl: string; sala: string; unidad: string } }>(endpoint, { query: { sala: salaId } })
    registrationLink.value = response.link
    return true
  } catch (err: any) {
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.message || 'No fue posible preparar el link de registro.'
    return false
  } finally {
    registrationLoading.value = false
  }
}

async function copyRegistrationLink() {
  if (!registrationLink.value?.url) return
  try {
    await navigator.clipboard?.writeText(registrationLink.value.url)
    actionNotice.value = 'Link de registro copiado.'
  } catch {
    actionError.value = 'No fue posible copiar el link automáticamente.'
  }
}

async function regenerateRegistrationLink() {
  const key = `registration:${salaId}`
  markPending(key, 'Link de registro', { detail: 'Regenerando el acceso de la sala.' })
  const ok = await loadRegistrationLink(true)
  if (ok) {
    markDone(key, 'Link de registro', { detail: 'El nuevo link quedó listo.' })
    actionNotice.value = 'Link de registro regenerado.'
  } else {
    markError(key, 'Link de registro', { detail: 'No fue posible regenerar el link.' })
  }
}

async function sendRegistrationLink() {
  if (!registrationEmail.value || registrationLoading.value) return
  registrationLoading.value = true
  actionError.value = ''
  actionNotice.value = ''
  const key = `registration-email:${salaId}`
  markPending(key, 'Link de registro', { detail: 'Enviando el acceso por correo.' })
  try {
    const response = await $fetch<{ emailed: number; link: { token: string; url: string; qrUrl: string; sala: string; unidad: string } }>('/api/daycare/admin/registration-link-email', {
      method: 'POST',
      body: { sala: salaId, to: registrationEmail.value }
    })
    registrationLink.value = response.link
    actionNotice.value = response.emailed ? 'Link de registro enviado.' : 'No se envió ningún correo.'
    registrationEmail.value = ''
    resetRegistrationDraft()
    markDone(key, 'Link de registro', { detail: response.emailed ? 'El correo fue enviado.' : 'El servidor terminó sin enviar correos.' })
  } catch (err: any) {
    markError(key, 'Link de registro', { detail: 'No se pudo enviar el correo.' })
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.message || 'No fue posible enviar el link.'
  } finally {
    registrationLoading.value = false
  }
}

function openSalaPassword() {
  if (passwordSaving.value) return
  actionError.value = ''
  actionNotice.value = ''
  passwordSaveFailed.value = false
  passwordDialog.value = { mode: 'sala' }
  passwordForm.value = { password: '', passwordCanChange: true, sendEmail: false }
  generatePassword()
  resetPasswordDraft()
}

function openFamilyPassword(account: FamilyAccount) {
  if (passwordSaving.value || isFamilyPending(account.id)) return
  actionError.value = ''
  actionNotice.value = ''
  passwordSaveFailed.value = false
  passwordDialog.value = { mode: 'family', account }
  passwordForm.value = {
    password: account.plaintext || '',
    passwordCanChange: account.passwordCanChange !== false,
    sendEmail: false
  }
  if (!passwordForm.value.password) generatePassword()
  resetPasswordDraft()
}

function closePasswordDialog() {
  if (passwordSaving.value) return
  passwordDialog.value = null
  passwordSaveFailed.value = false
  resetPasswordDraft()
}

function generatePassword() {
  const words = ['Husky', 'Sala', 'Familia', 'IEDIS', 'Casa']
  const word = words[Math.floor(Math.random() * words.length)]
  passwordForm.value.password = `${word}${Math.floor(1000 + Math.random() * 9000)}`
}

async function savePasswordDialog() {
  if (!passwordDialog.value || passwordSaving.value) return
  passwordSaving.value = true
  actionError.value = ''
  actionNotice.value = ''
  const dialog = { ...passwordDialog.value }
  const previousRows = cloneFamilyRows()
  const previousSelectedId = selected.value?.id
  const targetIds = dialog.mode === 'family' && dialog.account?.id
    ? [Number(dialog.account.id)]
    : previousRows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id) && id > 0)
  const key = dialog.mode === 'family' && dialog.account?.id ? familyKey(dialog.account.id) : `family-passwords:${Date.now()}`
  const label = dialog.mode === 'family' && dialog.account ? familyDisplayName(dialog.account) : `${targetIds.length} familias`
  const body: Record<string, unknown> = {
    sala: salaId,
    password: passwordForm.value.password,
    passwordCanChange: passwordForm.value.passwordCanChange,
    sendEmail: passwordForm.value.sendEmail
  }
  if (dialog.mode === 'family' && dialog.account?.id) body.userId = dialog.account.id

  familyRevision += 1
  if (dialog.mode === 'sala') {
    bulkStatusKeyByFamily.value = {
      ...bulkStatusKeyByFamily.value,
      ...Object.fromEntries(targetIds.map((id) => [id, key]))
    }
  }
  setFamilyRows((data.value?.rows || []).map((row) => targetIds.includes(Number(row.id))
    ? { ...row, plaintext: passwordForm.value.password, passwordCanChange: passwordForm.value.passwordCanChange }
    : row))
  if (selected.value?.id && targetIds.includes(Number(selected.value.id))) {
    selected.value = (data.value?.rows || []).find((row) => row.id === selected.value?.id) || selected.value
  }
  passwordDialog.value = null
  markPending(key, label, {
    detail: dialog.mode === 'sala' ? 'Actualizando las contraseñas de la sala.' : 'Actualizando la contraseña familiar.'
  })

  try {
    const result = await $fetch<{ updated: number; emailed: number; skipped: number; rows?: FamilyAccount[] }>('/api/daycare/admin/family-passwords', { method: 'POST', body })
    if (result.rows?.length) {
      const resultById = new Map(result.rows.map((row) => [Number(row.id), row]))
      setFamilyRows((data.value?.rows || []).map((row) => resultById.has(Number(row.id)) ? { ...row, ...resultById.get(Number(row.id)) } : row))
    }
    if (selected.value?.id) selected.value = (data.value?.rows || []).find((row) => row.id === selected.value?.id) || selected.value
    markDone(key, label, {
      detail: result.emailed ? `Cambio confirmado y ${result.emailed} correo${result.emailed === 1 ? '' : 's'} enviado${result.emailed === 1 ? '' : 's'}.` : 'El servidor confirmó el cambio.'
    })
    actionNotice.value = dialog.mode === 'sala'
      ? `Contraseña actualizada para ${result.updated} familias${result.emailed ? ` · ${result.emailed} correos enviados` : ''}.`
      : `Contraseña familiar actualizada${result.emailed ? ' y enviada.' : '.'}`
    passwordSaveFailed.value = false
    resetPasswordDraft()
    refreshFamiliesInBackground(previousSelectedId)
  } catch (err: any) {
    restorePasswordFields(previousRows, targetIds)
    if (selected.value?.id) selected.value = (data.value?.rows || []).find((row) => row.id === selected.value?.id) || selected.value
    passwordDialog.value = dialog
    passwordSaveFailed.value = true
    markError(key, label, { detail: 'No se actualizó; restauramos las contraseñas anteriores.' })
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.message || err?.statusMessage || 'No fue posible guardar la contraseña.'
  } finally {
    passwordSaving.value = false
  }
}

async function sendAccessEmail(account: FamilyAccount) {
  if (!account.id || isFamilyPending(account.id)) return
  emailingId.value = Number(account.id)
  actionError.value = ''
  actionNotice.value = ''
  const key = familyKey(account.id)
  const label = familyDisplayName(account)
  markPending(key, label, { detail: 'Enviando el acceso familiar por correo.' })
  try {
    const result = await $fetch<{ emailed: number }>('/api/daycare/admin/family-access-email', {
      method: 'POST',
      body: { sala: salaId, userIds: [account.id] }
    })
    markDone(key, label, { detail: result.emailed ? 'El correo de acceso fue enviado.' : 'El servidor terminó sin enviar correos.' })
    actionNotice.value = result.emailed ? 'Acceso enviado por correo.' : 'No se envió ningún correo.'
  } catch (err: any) {
    markError(key, label, { detail: 'No fue posible enviar el acceso.' })
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.message || err?.statusMessage || 'No fue posible enviar el acceso.'
  } finally {
    emailingId.value = null
  }
}

function cloneFamilyRows() {
  return (data.value?.rows || []).map((row) => ({ ...row, roster: row.roster ? { ...row.roster } : row.roster }))
}

function setFamilyRows(rows: FamilyAccount[]) {
  if (data.value) data.value.rows = rows
}

function buildOptimisticFamily(payload: Partial<FamilyAccount>, id: number): FamilyAccount {
  const existing = (data.value?.rows || []).find((row) => row.id === id)
  return {
    ...existing,
    ...payload,
    id,
    nombre_nino: payload.nombre_nino ?? existing?.nombre_nino ?? '',
    username: String(payload.username || existing?.username || ''),
    email: String(payload.email || existing?.email || ''),
    plaintext: payload.plaintext ?? existing?.plaintext ?? null,
    passwordCanChange: payload.passwordCanChange ?? existing?.passwordCanChange ?? true,
    role: payload.role || existing?.role || DAYCARE_FAMILY_ROLE,
    unidad: String(payload.unidad || existing?.unidad || data.value?.sala?.unidad || 'Guardería'),
    sala: String(salaId),
    roster: existing?.roster || null
  }
}

function upsertLocalFamily(account: FamilyAccount, append = false) {
  const rows = data.value?.rows || []
  if (rows.some((row) => row.id === account.id)) {
    setFamilyRows(rows.map((row) => row.id === account.id ? account : row))
    return
  }
  setFamilyRows(append ? [...rows, account] : [account, ...rows])
}

function replaceLocalFamily(id: number, account: FamilyAccount) {
  setFamilyRows((data.value?.rows || []).map((row) => row.id === id ? account : row))
}

function removeLocalFamily(id: number) {
  setFamilyRows((data.value?.rows || []).filter((row) => row.id !== id))
}

function restoreLocalFamily(account: FamilyAccount, index: number) {
  const rows = (data.value?.rows || []).filter((row) => row.id !== account.id)
  const targetIndex = Math.max(0, Math.min(index, rows.length))
  setFamilyRows([...rows.slice(0, targetIndex), account, ...rows.slice(targetIndex)])
}

function restorePasswordFields(previousRows: FamilyAccount[], targetIds: number[]) {
  const previousById = new Map(previousRows.map((row) => [Number(row.id), row]))
  setFamilyRows((data.value?.rows || []).map((row) => {
    const id = Number(row.id)
    const previous = previousById.get(id)
    if (!targetIds.includes(id) || !previous) return row
    return { ...row, plaintext: previous.plaintext, passwordCanChange: previous.passwordCanChange }
  }))
}

function refreshFamiliesInBackground(selectedId?: number) {
  const revision = familyRevision
  void $fetch<{ sala: Sala; rows: FamilyAccount[]; roster?: DaycareRosterOverlay }>('/api/daycare/admin/family-accounts', {
    query: { sala: salaId },
    timeout: 15000
  }).then((response) => {
    if (revision !== familyRevision) return
    const currentSelectedId = selected.value?.id
    data.value = response
    const nextSelectedId = currentSelectedId && currentSelectedId > 0 ? currentSelectedId : selectedId
    selected.value = nextSelectedId
      ? response.rows.find((row) => row.id === nextSelectedId) || response.rows[0] || null
      : response.rows[0] || null
  }).catch(() => undefined)
}

function familyDisplayName(account: Partial<FamilyAccount>) {
  return account.nombre_nino || accountLabel(account.username) || account.email || 'Cuenta familiar'
}

function familyKey(id?: number) {
  return `family:${id || 'unknown'}`
}

function familyStatus(id?: number) {
  if (!id) return undefined
  const bulkKey = bulkStatusKeyByFamily.value[id]
  return getStatus(familyKey(id)) || (bulkKey ? getStatus(bulkKey) : undefined)
}

function isFamilyPending(id?: number) {
  const status = familyStatus(id)
  return status?.state === 'pending'
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
  grid-template-columns: minmax(0, 1fr) auto auto auto;
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

.access-panel {
  align-items: center;
  background: linear-gradient(135deg, #fffaf0, #f0fbf7);
  border: 1px solid rgba(8, 135, 125, 0.16);
  border-radius: 18px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 12px;
}

.access-panel small,
.access-panel strong {
  display: block;
}

.access-panel small {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.access-panel strong {
  color: var(--ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 1rem;
  letter-spacing: 0.02em;
}

.lock-pill {
  background: #e8f8ef;
  border: 1px solid rgba(8, 135, 125, 0.12);
  border-radius: 999px;
  color: #138048;
  font-size: 0.72rem;
  font-weight: 900;
  padding: 7px 10px;
  white-space: nowrap;
}

.lock-pill.locked {
  background: #fff6df;
  border-color: rgba(246, 185, 79, 0.32);
  color: #8a650c;
}

.password-modal {
  display: grid;
  gap: 14px;
}

.password-preview {
  align-items: center;
  background: linear-gradient(135deg, #f0fbf7, #fffaf0);
  border: 1px solid rgba(8, 135, 125, 0.16);
  border-radius: 20px;
  display: grid;
  gap: 8px;
  grid-template-columns: 54px minmax(0, 1fr);
  padding: 14px;
}

.password-preview span {
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 16px;
  color: var(--accent-dark);
  display: inline-flex;
  font-size: 1.2rem;
  font-weight: 950;
  height: 54px;
  justify-content: center;
  width: 54px;
}

.password-preview strong {
  color: var(--ink);
}

.password-input-row {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.mono-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 900;
  letter-spacing: 0.03em;
}

.toggle-line {
  align-items: center;
  color: #385069;
  display: flex;
  font-weight: 800;
  gap: 10px;
}

.toggle-line input {
  accent-color: var(--accent);
  height: 18px;
  width: 18px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
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
.registration-link-modal {
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: 180px minmax(0, 1fr);
}

.registration-qr-card {
  align-items: center;
  background: linear-gradient(135deg, #f0fbf7, #fff6df);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 24px;
  display: grid;
  justify-items: center;
  min-height: 180px;
  padding: 14px;
}

.registration-qr-card img {
  background: #fff;
  border-radius: 18px;
  display: block;
  height: 150px;
  width: 150px;
}

.registration-qr-card span {
  color: var(--accent-dark);
  font-weight: 950;
  letter-spacing: .12em;
}

.registration-link-copy {
  display: grid;
  gap: 14px;
}

.registration-link-copy p {
  color: var(--muted);
  font-weight: 700;
  margin: 0;
}

.registration-link-copy .compact-alert {
  background: #fff5ed;
  border-color: #ffd7bd;
  color: #8a3b1e;
}

.link-box {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 10px;
}

.link-box span {
  color: var(--ink);
  font-size: .84rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .registration-link-modal {
    grid-template-columns: 1fr;
  }
}


.roster-strip {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
}

.muted-roster {
  background: rgba(255, 247, 237, 0.82);
  border: 1px solid rgba(249, 115, 22, 0.22);
  border-radius: 24px;
  grid-template-columns: 1fr;
  padding: 0;
}

.muted-roster article {
  background: transparent;
  border: 0;
}

.roster-strip article {
  align-items: center;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--line-soft);
  border-radius: 22px;
  display: flex;
  gap: 10px;
  padding: 12px 14px;
}

.roster-strip strong {
  color: var(--ink);
  font-size: 1.1rem;
}

.roster-strip small {
  color: var(--muted);
}

.roster-dot,
.roster-sync-icon {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-weight: 900;
  justify-content: center;
}

.roster-dot {
  height: 28px;
  min-width: 28px;
  padding: 0 7px;
}

.roster-dot.good,
.source-pill[data-state='ok'],
.roster-sync-card[data-state='matched'] .roster-sync-icon {
  background: #0f8b7d;
  color: white;
}

.roster-dot.warm,
.source-pill[data-state='review'] {
  background: #fff0cc;
  color: #9a5e05;
}

.roster-dot.move,
.source-pill[data-state='move'],
.roster-sync-card[data-state='room-changed'] .roster-sync-icon {
  background: #f4b64a;
  color: #372505;
}

.roster-dot.neutral {
  background: #eef7f4;
  color: var(--accent-dark);
}

.source-pill {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-weight: 900;
  height: 30px;
  justify-content: center;
  min-width: 30px;
}

.source-only-list {
  border-top: 1px solid var(--line-soft);
  display: grid;
  gap: 8px;
  margin-top: 8px;
  padding-top: 12px;
}

.source-only-list p {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
}

.source-only-row {
  align-items: center;
  background: #fffdf7;
  border: 1px solid rgba(244, 182, 74, 0.24);
  border-radius: 20px;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: auto 1fr auto;
  padding: 10px;
  text-align: left;
}

.family-avatar.soft {
  background: #fff0cc;
  color: #79520a;
}

.btn-mini {
  background: white;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--accent-dark);
  font-size: 0.78rem;
  font-weight: 900;
  padding: 7px 10px;
}

.roster-sync-card {
  align-items: center;
  background: #f5fbf9;
  border: 1px solid rgba(7, 135, 125, 0.14);
  border-radius: 24px;
  display: grid;
  gap: 12px;
  grid-template-columns: auto 1fr auto;
  padding: 14px;
}

.roster-sync-card[data-state='room-changed'] {
  background: #fff8e9;
  border-color: rgba(244, 182, 74, 0.34);
}

.roster-sync-icon {
  height: 34px;
  width: 34px;
}

.roster-sync-card strong,
.roster-sync-card small {
  display: block;
}

.roster-sync-card small {
  color: var(--muted);
}

.roster-sync-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 760px) {
  .roster-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .roster-sync-card {
    grid-template-columns: auto 1fr;
  }

  .roster-sync-actions {
    grid-column: 1 / -1;
    justify-content: stretch;
  }
}


.roster-confirm-modal {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: auto 1fr;
}

.roster-confirm-icon {
  align-items: center;
  background: #0f8b7d;
  border-radius: 999px;
  color: white;
  display: inline-flex;
  font-size: 1.1rem;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.roster-confirm-modal strong,
.roster-confirm-modal small {
  display: block;
}

.roster-confirm-modal small {
  color: var(--muted);
}

.roster-confirm-modal .modal-actions {
  grid-column: 1 / -1;
}

.friendly-code {
  background: linear-gradient(135deg, #fff8e8, #effbf7);
  border: 1px solid rgba(244, 182, 74, 0.3);
  border-radius: 18px;
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.friendly-code span {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.friendly-code strong {
  color: var(--ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 1.28rem;
  letter-spacing: 0.02em;
}

.roster-diagnostics-trigger {
  align-self: stretch;
  background: rgba(255, 255, 255, 0.78);
  border: 1px dashed rgba(8, 135, 125, 0.32);
  border-radius: 18px;
  color: var(--accent-dark);
  cursor: pointer;
  font-weight: 900;
  padding: 10px 14px;
}

.roster-diagnostics-trigger:hover {
  background: #fff;
}

.roster-diagnostics-modal {
  display: grid;
  gap: 14px;
}

.diagnostics-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.diagnostics-grid article,
.diagnostics-block {
  background: #fbf8ef;
  border: 1px solid rgba(8, 135, 125, 0.12);
  border-radius: 18px;
  display: grid;
  gap: 6px;
  padding: 12px;
}

.diagnostics-grid span,
.diagnostics-block span {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.diagnostics-grid strong,
.diagnostics-block strong,
.diagnostics-block li {
  color: var(--ink);
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.45;
  word-break: break-word;
}

.diagnostics-block ul {
  margin: 0;
  padding-left: 18px;
}

@media (max-width: 720px) {
  .diagnostics-grid {
    grid-template-columns: 1fr;
  }
}



.compact-alert { margin: 0 0 12px; }

.family-row-tail {
  align-items: flex-end;
  display: grid;
  gap: 5px;
  justify-items: end;
}

.family-row.syncing {
  background: #f5faff;
  border-color: rgba(23, 93, 135, 0.2);
}

.family-row.failed {
  background: #fff7f8;
  border-color: rgba(167, 25, 53, 0.2);
}
</style>
