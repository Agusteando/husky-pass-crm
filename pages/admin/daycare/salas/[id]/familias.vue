<template>
  <section class="family-module stack" data-product-area="daycare" data-product-screen="familias">
    <AdminModuleTabs :sala-id="salaId" :unidad="data?.sala?.unidad" :sala-name="data?.sala?.sala" />
    <AdminProcessingTray :items="syncEntries" />

    <header class="family-hero">
      <div class="hero-copy">
        <p class="hero-kicker">{{ data?.sala?.unidad || 'Guardería' }} · {{ data?.sala?.sala || 'Sala' }}</p>
        <h1>Familias</h1>
        <div class="hero-stats">
          <span><strong>{{ familyStats.total }}</strong> cuentas</span>
          <span><strong>{{ familyStats.active }}</strong> activas</span>
          <span v-if="currentRoomConfirmation?.total"><strong>{{ currentRoomConfirmation.confirmed }}/{{ currentRoomConfirmation.total }}</strong> Usuarios confirmados</span>
        </div>
        <button class="hero-action" type="button" data-diagnostic-action="crear-familia" :disabled="saving" @click="startCreate">
          <FamilyPersonasIcon name="plus" />Nueva familia
        </button>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="hero-disc"><FamilyPersonasIcon name="people" /></span>
        <img :src="sunnyMascot" alt="" />
      </div>
    </header>

    <section class="family-toolbar" aria-label="Herramientas de familias">
      <label class="search-field">
        <FamilyPersonasIcon name="search" />
        <input v-model="search" class="input" type="search" placeholder="Niño/a, usuario o correo" data-diagnostic-filter="buscar-familia" />
      </label>
      <button class="toolbar-action" type="button" data-diagnostic-action="registro-sala" @click="openRegistrationLink"><span><FamilyPersonasIcon name="send" /></span><strong>Registro</strong><small>Link de sala</small></button>
      <button class="toolbar-action" type="button" data-diagnostic-action="password-sala" :disabled="passwordSaving" @click="openSalaPassword"><span><FamilyPersonasIcon name="security" /></span><strong>Contraseña</strong><small>Toda la sala</small></button>
      <button v-if="canPreviewSala" class="toolbar-action" type="button" data-diagnostic-action="preview-sala" :disabled="previewing" @click="previewSala"><span><FamilyPersonasIcon name="sparkles" /></span><strong>Vista familiar</strong><small>{{ previewing ? 'Abriendo…' : 'Previsualizar' }}</small></button>
    </section>

    <section v-if="roomNavigation.length" class="family-room-switcher" aria-label="Salas de la unidad">
      <button
        v-for="(room, index) in roomNavigation"
        :key="room.id"
        type="button"
        :class="{ active: room.id === salaId }"
        :aria-current="room.id === salaId ? 'page' : undefined"
        @click="openRoom(room.id)"
      >
        <span class="room-switch-mark" :data-index="index % 4">{{ initials(room.sala) }}</span>
        <span class="room-switch-copy">
          <strong>{{ room.sala }}</strong>
          <small>{{ room.local }} familias</small>
        </span>
        <span v-if="room.confirmationAvailable && room.total" class="room-switch-count">{{ room.confirmed }}/{{ room.total }}</span>
      </button>
    </section>

    <section class="family-viewbar" aria-label="Vista de familias">
      <div class="family-view-filters">
        <button type="button" :class="{ active: rosterView === 'all' }" @click="setRosterView('all')">Todas</button>
        <button v-if="rosterAvailable" type="button" :class="{ active: rosterView === 'confirmed' }" @click="setRosterView('confirmed')">Confirmadas</button>
        <button v-if="rosterAvailable" type="button" :class="{ active: rosterView === 'review' }" @click="setRosterView('review')">Revisar</button>
      </div>
      <span v-if="currentRoomConfirmation?.total" class="family-confirmation-kpi">
        <FamilyPersonasIcon name="check" />
        <small>Usuarios confirmados</small>
        <strong>{{ currentRoomConfirmation.confirmed }}/{{ currentRoomConfirmation.total }}</strong>
      </span>
    </section>

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
      title="Actualizar nombre"
      eyebrow="Familia"
      :description="rosterDialog.account.email || rosterDialog.account.username"
      :close-disabled="rosterSaving"
      @close="rosterDialog = null"
    >
      <section class="roster-confirm-modal">
        <div class="roster-confirm-icon">✓</div>
        <div>
          <strong>{{ rosterDialog.account.roster?.childName }}</strong>
          <small>{{ data?.sala?.sala }}</small>
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
          <span class="list-scope">{{ data?.sala?.sala }}</span>
        </div>

        <section v-if="selectedFamilyIds.length" class="family-bulk-bar">
          <span>{{ selectedFamilyIds.length }}</span>
          <strong>{{ selectedFamilyIds.length === 1 ? 'familia' : 'familias' }}</strong>
          <select v-model.number="bulkTargetSalaId" aria-label="Sala destino">
            <option :value="0" disabled>Sala destino</option>
            <option v-for="room in roomNavigation" :key="room.id" :value="room.id">{{ room.sala }}</option>
          </select>
          <button type="button" :disabled="!bulkTargetSalaId || roomActionBusy" @click="moveSelectedFamilies"><FamilyPersonasIcon name="arrow" /></button>
          <button type="button" class="bulk-clear" aria-label="Limpiar selección" @click="clearFamilySelection"><FamilyPersonasIcon name="close" /></button>
        </section>

        <div v-if="filteredAccounts.length || visibleRosterSourceOnly.length" class="family-list">
          <article
            v-for="account in filteredAccounts"
            :key="account.id"
            class="family-row-shell"
            :class="{ active: selected?.id === account.id, syncing: familyStatus(account.id)?.state === 'pending', failed: familyStatus(account.id)?.state === 'error' }"
          >
            <label class="family-select-control" @click.stop>
              <input type="checkbox" :checked="selectedFamilyIds.includes(Number(account.id))" @change="toggleFamilySelection(Number(account.id))" />
            </label>
            <button
              class="family-row"
              type="button"
              data-diagnostic-action="seleccionar-familia"
              :aria-pressed="selected?.id === account.id"
              @click="selectAccount(account)"
            >
              <span class="family-avatar">{{ initials(familyDisplayName(account)) }}</span>
              <span class="family-copy">
                <strong>{{ familyDisplayName(account) }}</strong>
                <small>{{ [accountLabel(account.username) || 'Sin usuario', account.email || 'Sin correo'].join(' · ') }}</small>
              </span>
              <span class="family-row-tail">
                <AdminSyncCue v-if="familyStatus(account.id)" :status="familyStatus(account.id)" compact />
                <span class="source-pill" :data-state="accountRosterState(account)">{{ accountRosterMark(account) }}</span>
              </span>
            </button>
          </article>
          <div v-if="visibleRosterSourceOnly.length" class="source-only-list">
            <p>Por activar</p>
            <button v-for="entry in visibleRosterSourceOnly" :key="[entry.sourceSheet, entry.normalizedEmail, entry.childName].join('-')" class="source-only-row" type="button" @click="startCreateFromRoster(entry)">
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
          <header class="family-profile-hero">
            <span class="selected-family-avatar">{{ initials(familyDisplayName(selected)) }}</span>
            <div>
              <p class="eyebrow">Detalle familiar</p>
              <h2>{{ familyDisplayName(selected) }}</h2>
              <span class="account-state">{{ accountStatusLabel(selected) }}</span>
            </div>
            <div class="profile-head-actions">
              <AdminSyncCue v-if="familyStatus(selected.id)" :status="familyStatus(selected.id)" />
              <button
                v-if="canRevokeSelected"
                type="button"
                class="profile-revoke"
                :disabled="revokingId === selected.id"
                aria-label="Revocar acceso"
                title="Revocar acceso"
                @click="revokeAccess(selected)"
              >
                <FamilyPersonasIcon :name="revokingId === selected.id ? 'replace' : 'exit'" />
              </button>
            </div>
          </header>
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
              <span v-if="selected?.roster?.state === 'room-changed'" class="roster-room-route">
                <b>{{ data?.sala?.sala }}</b>
                <FamilyPersonasIcon name="arrow" />
                <b>{{ selected.roster.targetSalaName }}</b>
              </span>
            </div>
            <div class="roster-sync-actions">
              <button v-if="selected?.roster?.childDifferent" class="btn btn-secondary" type="button" :disabled="rosterSaving || isFamilyPending(selected.id)" @click="openRosterDialog(selected, { applyChildName: true })">Aplicar nombre</button>
              <button v-if="selected?.roster?.state === 'room-changed' && selected?.roster?.targetSalaId" class="btn btn-primary" type="button" :disabled="roomActionBusy || isFamilyPending(selected.id)" @click="moveFamilyTo(selected.roster.targetSalaId)">{{ selectedRosterMoveCta }}</button>
            </div>
          </section>

          <section v-if="roomNavigation.length" class="family-room-flow" aria-label="Cambio de sala">
            <header>
              <div>
                <small>Sala actual</small>
                <strong>{{ data?.sala?.sala }}</strong>
              </div>
              <span>{{ currentRoomPosition }}</span>
            </header>

            <div class="family-room-path" role="list">
              <button
                v-for="(room, index) in roomNavigation"
                :key="room.id"
                type="button"
                role="listitem"
                :class="{
                  current: room.id === salaId,
                  selected: room.id === roomTargetSalaId && room.id !== salaId,
                  suggested: room.id === selected?.roster?.targetSalaId && room.id !== salaId,
                  completed: currentRoomIndex >= 0 && index < currentRoomIndex
                }"
                :aria-current="room.id === salaId ? 'step' : undefined"
                :disabled="roomActionBusy"
                @click="selectRoomTarget(room.id)"
              >
                <span><FamilyPersonasIcon :name="room.id === salaId ? 'check' : room.id === selected?.roster?.targetSalaId ? 'sparkles' : 'daycare'" /></span>
                <strong>{{ room.sala }}</strong>
              </button>
            </div>

            <div class="family-room-directions">
              <button type="button" :disabled="!previousRoom || roomActionBusy" @click="moveFamilyTo(previousRoom?.id)">
                <FamilyPersonasIcon name="arrow" />
                <span><small>Regresar</small><strong>{{ previousRoom?.sala || '—' }}</strong></span>
              </button>
              <button type="button" class="forward" :disabled="!nextRoom || roomActionBusy" @click="moveFamilyTo(nextRoom?.id)">
                <span><small>Promover</small><strong>{{ nextRoom?.sala || '—' }}</strong></span>
                <FamilyPersonasIcon name="arrow" />
              </button>
            </div>

            <Transition name="family-room-transfer">
              <div v-if="roomTarget && roomTarget.id !== salaId" class="family-room-transfer">
                <span>{{ data?.sala?.sala }}</span>
                <FamilyPersonasIcon name="arrow" />
                <strong>{{ roomTarget.sala }}</strong>
                <button type="button" :disabled="roomActionBusy" :aria-label="`Mover a ${roomTarget.sala}`" @click="moveFamilyTo(roomTarget.id)"><FamilyPersonasIcon name="check" /></button>
              </div>
            </Transition>
          </section>

          <section class="access-panel" aria-label="Acceso familiar">
            <div>
              <small>Contraseña</small>
              <strong>{{ selected.plaintext || 'Sin contraseña visible' }}</strong>
            </div>
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
import type { DaycareRoomManagementRosterStatus, DaycareRosterEntry, DaycareRosterOverlay, FamilyAccount, Sala } from '~/types/daycare'
import type { AppSessionUser, PublicSession } from '~/types/session'
import { setCachedRouteSession } from '~/utils/routeSession'
import { DAYCARE_FAMILY_ROLE, defaultFamilyRoute, hasDaycareAdminScope } from '~/utils/sessionScopes'
import { displayMatriculaCandidate } from '~/utils/matricula'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'
import AdminModuleTabs from '~/components/admin/AdminModuleTabs.vue'
import AdminModal from '~/components/admin/AdminModal.vue'
import AdminProcessingTray from '~/components/admin/AdminProcessingTray.vue'
import AdminSyncCue from '~/components/admin/AdminSyncCue.vue'
import EmptyState from '~/components/EmptyState.vue'
import FamilyAccountEditor from '~/components/admin/FamilyAccountEditor.vue'
import FamilyPersonasIcon from '~/components/family/PersonasIcon.vue'

definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })

type RosterView = 'all' | 'confirmed' | 'review'
type FamilyAccountsResponse = {
  sala: Sala
  rows: FamilyAccount[]
  roster?: DaycareRosterOverlay
  roomManagement?: { salas: Sala[]; roster: DaycareRoomManagementRosterStatus }
}

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
const passwordForm = ref({ password: '', sendEmail: false })
const registrationDialog = ref(false)
const registrationLoading = ref(false)
const registrationEmail = ref('')
const registrationLink = ref<{ token: string; url: string; qrUrl: string; sala: string; unidad: string } | null>(null)
const rosterSaving = ref(false)
const rosterDialog = ref<{ account: FamilyAccount; applyChildName?: boolean } | null>(null)
const rosterView = ref<RosterView>(route.query.vista === 'confirmed' || route.query.vista === 'review' ? route.query.vista : 'all')
const selectedFamilyIds = ref<number[]>([])
const bulkTargetSalaId = ref(0)
const roomTargetSalaId = ref(salaId)
const roomActionBusy = ref(false)
const revokingId = ref<number | null>(null)
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
const daycareTheme = resolvePersonasTheme({ themeKey: 'daycare' })
const sunnyMascot = personasMascot(daycareTheme, 'help')
const canPreviewSala = computed(() => hasDaycareAdminScope(session.value?.user))
const canImpersonateAccounts = computed(() => hasDaycareAdminScope(session.value?.user))
const { data, pending, error } = useFetch<FamilyAccountsResponse>('/api/daycare/admin/family-accounts', {
  query: { sala: salaId },
  timeout: 30000
})

const rosterAvailable = computed(() => Boolean(data.value?.roster?.available))
const rosterSummary = computed(() => data.value?.roster?.summary || { inSala: 0, confirmed: 0, linked: 0, pending: 0, moved: 0 })
const rosterSourceOnly = computed(() => data.value?.roster?.sourceOnly || [])
const roomRoster = computed(() => data.value?.roomManagement?.roster || null)
const roomConfirmationById = computed(() => new Map((roomRoster.value?.rooms || []).map((room) => [room.salaId, room])))
const roomNavigation = computed(() => (data.value?.roomManagement?.salas || [data.value?.sala].filter(Boolean) as Sala[]).map((room) => {
  const confirmation = roomConfirmationById.value.get(Number(room.id))
  return {
    ...room,
    local: confirmation?.local || (Number(room.id) === salaId ? familyStats.value.total : 0),
    confirmed: confirmation?.confirmed || 0,
    total: confirmation?.total || 0,
    confirmationAvailable: Boolean(roomRoster.value?.available)
  }
}))
const currentRoomConfirmation = computed(() => roomConfirmationById.value.get(salaId) || (rosterAvailable.value
  ? { salaId, salaName: data.value?.sala?.sala || '', local: familyStats.value.total, confirmed: rosterSummary.value.confirmed, total: rosterSummary.value.inSala }
  : null))
const currentRoomIndex = computed(() => roomNavigation.value.findIndex((room) => room.id === salaId))
const previousRoom = computed(() => currentRoomIndex.value > 0 ? roomNavigation.value[currentRoomIndex.value - 1] || null : null)
const nextRoom = computed(() => currentRoomIndex.value >= 0 ? roomNavigation.value[currentRoomIndex.value + 1] || null : null)
const currentRoomPosition = computed(() => currentRoomIndex.value >= 0 ? `${currentRoomIndex.value + 1}/${roomNavigation.value.length}` : '—')
const roomTarget = computed(() => roomNavigation.value.find((room) => room.id === roomTargetSalaId.value) || null)
const visibleRosterSourceOnly = computed(() => rosterView.value === 'confirmed' ? [] : rosterSourceOnly.value)
const registrationShortPath = computed(() => registrationLink.value?.token ? `/r/${registrationLink.value.token}` : '')
const selectedAccountId = computed(() => Number(route.query.familia || 0))
const selectedPasswordDescription = computed(() => passwordDialog.value?.account?.nombre_nino || passwordDialog.value?.account?.email || 'Cuenta familiar')
const selectedRosterVisible = computed(() => Boolean(selected.value?.roster && (selected.value.roster.state === 'room-changed' || selected.value.roster.childDifferent)))
const selectedRosterIcon = computed(() => selected.value?.roster?.state === 'room-changed' ? '↗' : '✓')
const selectedRosterTitle = computed(() => {
  const roster = selected.value?.roster
  if (!roster) return ''
  if (roster.state === 'room-changed') return roster.movement === 'forward' ? 'Promoción disponible' : 'Cambio disponible'
  return 'Nombre actualizado'
})
const selectedRosterDetail = computed(() => selected.value?.roster?.childName || '')
const selectedRosterMoveCta = computed(() => selected.value?.roster?.movement === 'forward' ? 'Promover' : 'Mover')
const canRevokeSelected = computed(() => Boolean(rosterAvailable.value && selected.value?.id && selected.value.roster?.state === 'not-found'))

const familyStats = computed(() => {
  const rows = data.value?.rows || []
  return {
    total: rows.length,
    active: rows.filter((account) => accountStatusLabel(account) === 'Activa').length
  }
})

const filteredAccounts = computed(() => {
  const needle = search.value.trim().toLowerCase()
  return (data.value?.rows || []).filter((account) => {
    if (rosterView.value === 'confirmed' && !isAccountConfirmed(account)) return false
    if (rosterView.value === 'review' && isAccountConfirmed(account)) return false
    if (!needle) return true
    return `${familyDisplayName(account)} ${account.nombre_nino || ''} ${account.username || ''} ${accountLabel(account.username) || ''} ${account.email || ''}`.toLowerCase().includes(needle)
  })
})

watch(search, () => syncQuery())
watch(rosterView, () => syncQuery())
watch(selected, () => {
  roomTargetSalaId.value = salaId
})
watch(data, (value) => {
  const ids = new Set((value?.rows || []).map((row) => Number(row.id)))
  selectedFamilyIds.value = selectedFamilyIds.value.filter((id) => ids.has(id))
  if (!value?.roster?.available && rosterView.value !== 'all') rosterView.value = 'all'
})

watch(() => route.query.buscar, (value) => {
  const next = typeof value === 'string' ? value : ''
  if (next !== search.value) search.value = next
})

watch(() => route.query.vista, (value) => {
  const next: RosterView = value === 'confirmed' || value === 'review' ? value : 'all'
  if (next !== rosterView.value) rosterView.value = next
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

function isAccountConfirmed(account: FamilyAccount) {
  return account.roster?.state === 'matched'
}

function setRosterView(value: RosterView) {
  rosterView.value = value
  clearFamilySelection()
}

async function openRoom(id: number) {
  if (id === salaId) return
  await navigateTo({
    path: `/admin/daycare/salas/${id}/familias`,
    query: data.value?.sala?.unidad ? { unidad: data.value.sala.unidad } : {}
  })
}

function toggleFamilySelection(id: number) {
  if (!id) return
  selectedFamilyIds.value = selectedFamilyIds.value.includes(id)
    ? selectedFamilyIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedFamilyIds.value, id]
}

function clearFamilySelection() {
  selectedFamilyIds.value = []
  bulkTargetSalaId.value = 0
}

async function moveSelectedFamilies() {
  if (!selectedFamilyIds.value.length || !bulkTargetSalaId.value) return
  await moveFamilies(selectedFamilyIds.value, bulkTargetSalaId.value)
  clearFamilySelection()
}

function selectRoomTarget(targetSalaId: number) {
  if (roomActionBusy.value) return
  if (targetSalaId === salaId) {
    void moveFamilyTo(targetSalaId, true)
    return
  }
  roomTargetSalaId.value = targetSalaId
}

async function moveFamilyTo(targetSalaId?: number | null, force = false) {
  if (!selected.value?.id || !targetSalaId || roomActionBusy.value) return
  if (!force && targetSalaId === salaId) return
  await moveFamilies([Number(selected.value.id)], targetSalaId)
}

async function moveFamilies(userIds: number[], targetSalaId: number) {
  const ids = Array.from(new Set(userIds.filter((id) => Number.isInteger(id) && id > 0)))
  if (!ids.length || !targetSalaId || roomActionBusy.value) return

  roomActionBusy.value = true
  actionError.value = ''
  actionNotice.value = ''
  const previousRows = cloneFamilyRows()
  const previousSelectedId = selected.value?.id
  const target = roomNavigation.value.find((room) => room.id === targetSalaId)
  const key = `room-move:${Date.now()}`
  const label = ids.length === 1
    ? familyDisplayName(previousRows.find((row) => Number(row.id) === ids[0]) || selected.value || {})
    : `${ids.length} familias`

  if (targetSalaId !== salaId) {
    setFamilyRows((data.value?.rows || []).filter((row) => !ids.includes(Number(row.id))))
    selected.value = filteredAccounts.value[0] || null
    syncQuery(selected.value?.id)
  }
  markPending(key, label, { detail: targetSalaId === salaId ? 'Confirmando la sala.' : `Moviendo a ${target?.sala || 'la sala seleccionada'}.` })

  try {
    const result = await $fetch<{ moved: number; userIds: number[]; target: Sala }>('/api/daycare/admin/room-management/move', {
      method: 'POST',
      body: { userIds: ids, targetSalaId }
    })
    markDone(key, label, { detail: targetSalaId === salaId ? 'Sala confirmada.' : `Cambio confirmado · ${result.target.sala}.` })
    actionNotice.value = targetSalaId === salaId
      ? 'Sala confirmada.'
      : `${result.moved} ${result.moved === 1 ? 'familia movida' : 'familias movidas'} · ${result.target.sala}`
    await reloadFamilies(targetSalaId === salaId ? result.userIds[0] || previousSelectedId : undefined)
  } catch (err: any) {
    setFamilyRows(previousRows)
    selected.value = previousSelectedId ? previousRows.find((row) => row.id === previousSelectedId) || previousRows[0] || null : previousRows[0] || null
    syncQuery(selected.value?.id)
    markError(key, label, { detail: 'No se aplicó el cambio.' })
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.statusMessage || err?.message || 'No fue posible cambiar la sala.'
  } finally {
    roomTargetSalaId.value = salaId
    roomActionBusy.value = false
  }
}

async function revokeAccess(account: FamilyAccount) {
  if (!account.id || revokingId.value || !rosterAvailable.value || account.roster?.state !== 'not-found') return
  revokingId.value = Number(account.id)
  actionError.value = ''
  actionNotice.value = ''
  try {
    await $fetch('/api/daycare/admin/room-management/revoke', { method: 'POST', body: { userId: account.id } })
    setFamilyRows((data.value?.rows || []).filter((row) => row.id !== account.id))
    selectedFamilyIds.value = selectedFamilyIds.value.filter((id) => id !== account.id)
    selected.value = filteredAccounts.value[0] || null
    syncQuery(selected.value?.id)
    actionNotice.value = 'Acceso revocado.'
    await reloadFamilies(selected.value?.id)
  } catch (err: any) {
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.statusMessage || err?.message || 'No fue posible revocar el acceso.'
  } finally {
    revokingId.value = null
  }
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
  return '•'
}

function openRosterDialog(account: FamilyAccount | null, options: { applyChildName?: boolean }) {
  if (!account || isFamilyPending(account.id)) return
  rosterDialog.value = { account, ...options }
}

function confirmRosterDialog() {
  if (!rosterDialog.value) return
  void applyRosterName(rosterDialog.value.account)
}

async function applyRosterName(account: FamilyAccount | null) {
  if (!account?.id || !account.roster?.childName || rosterSaving.value || isFamilyPending(account.id)) return
  rosterSaving.value = true
  actionError.value = ''
  actionNotice.value = ''
  const previousRows = cloneFamilyRows()
  const previousAccount = previousRows.find((row) => row.id === account.id) || account
  const previousDialog = rosterDialog.value ? { ...rosterDialog.value } : null
  const key = familyKey(account.id)
  const label = familyDisplayName(account)
  const optimistic = {
    ...account,
    nombre_nino: account.roster.childName,
    roster: { ...account.roster, childDifferent: false }
  }

  rosterDialog.value = null
  replaceLocalFamily(Number(account.id), optimistic)
  if (selected.value?.id === account.id) selected.value = optimistic
  markPending(key, label, { detail: 'Actualizando el nombre familiar.' })

  try {
    await $fetch('/api/daycare/admin/roster-apply', {
      method: 'POST',
      body: { sala: salaId, userId: account.id, applyChildName: true }
    })
    markDone(key, familyDisplayName(optimistic), { detail: 'Nombre actualizado.' })
    actionNotice.value = 'Nombre familiar actualizado.'
    refreshFamiliesInBackground(account.id)
  } catch (err: any) {
    replaceLocalFamily(Number(account.id), previousAccount)
    if (selected.value?.id === account.id) selected.value = previousAccount
    rosterDialog.value = previousDialog
    markError(key, label, { detail: 'No se aplicó el cambio.' })
    actionError.value = err?.data?.statusMessage || err?.message || 'No fue posible actualizar el nombre.'
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
  if (rosterView.value !== 'all') query.vista = rosterView.value
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
  passwordForm.value = { password: '', sendEmail: false }
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
    ? { ...row, plaintext: passwordForm.value.password }
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

function restorePasswordFields(previousRows: FamilyAccount[], targetIds: number[]) {
  const previousById = new Map(previousRows.map((row) => [Number(row.id), row]))
  setFamilyRows((data.value?.rows || []).map((row) => {
    const id = Number(row.id)
    const previous = previousById.get(id)
    if (!targetIds.includes(id) || !previous) return row
    return { ...row, plaintext: previous.plaintext }
  }))
}

async function reloadFamilies(selectedId?: number) {
  const response = await $fetch<FamilyAccountsResponse>('/api/daycare/admin/family-accounts', {
    query: { sala: salaId },
    timeout: 30000
  })
  data.value = response
  const currentSelectedId = selected.value?.id
  const nextSelectedId = selectedId || (currentSelectedId && currentSelectedId > 0 ? currentSelectedId : undefined)
  selected.value = nextSelectedId
    ? response.rows.find((row) => row.id === nextSelectedId) || response.rows[0] || null
    : response.rows[0] || null
  syncQuery(selected.value?.id)
  return response
}

function refreshFamiliesInBackground(selectedId?: number) {
  const revision = familyRevision
  void $fetch<FamilyAccountsResponse>('/api/daycare/admin/family-accounts', {
    query: { sala: salaId },
    timeout: 30000
  }).then((response) => {
    if (revision !== familyRevision) return
    data.value = response
    const currentSelectedId = selected.value?.id
    const nextSelectedId = selectedId || (currentSelectedId && currentSelectedId > 0 ? currentSelectedId : undefined)
    selected.value = nextSelectedId
      ? response.rows.find((row) => row.id === nextSelectedId) || response.rows[0] || null
      : response.rows[0] || null
    syncQuery(selected.value?.id)
  }).catch(() => undefined)
}

function familyDisplayName(account: Partial<FamilyAccount>) {
  const rosterName = account.roster?.state !== 'not-found' ? account.roster?.childName : null
  return rosterName || account.nombre_nino || accountLabel(account.username) || account.email || 'Cuenta familiar'
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
  --family-ink: #263f1c;
  --family-muted: #707a69;
  --family-green: #578b26;
  --family-green-deep: #294e20;
  --family-line: rgba(66, 104, 49, 0.13);
  gap: clamp(16px, 2.2vw, 24px);
}

.family-hero {
  background:
    radial-gradient(circle at 15% 116%, rgba(255, 190, 71, 0.32), transparent 34%),
    radial-gradient(circle at 91% 4%, rgba(183, 222, 90, 0.24), transparent 28%),
    linear-gradient(135deg, #294e20 0%, #527f32 55%, #90ae3f 100%);
  border-radius: 34px;
  box-shadow: 0 26px 64px rgba(49, 95, 36, 0.22);
  color: #fff;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 340px);
  min-height: 310px;
  overflow: hidden;
  padding: clamp(28px, 5vw, 50px);
  position: relative;
}

.family-hero::before {
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;
  content: '';
  height: 340px;
  left: -180px;
  position: absolute;
  top: -210px;
  width: 340px;
}

.hero-copy {
  align-self: center;
  display: grid;
  gap: 13px;
  position: relative;
  z-index: 2;
}

.hero-kicker {
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0;
  text-transform: uppercase;
}

.hero-copy h1 {
  color: #fff;
  font-family: var(--font-title);
  font-size: clamp(3rem, 7vw, 6rem);
  letter-spacing: -0.04em;
  line-height: 0.84;
  margin: 0;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-stats span {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.7rem;
  padding: 8px 11px;
}

.hero-stats strong {
  color: #fff;
  font-size: 0.84rem;
  margin-right: 3px;
}

.hero-action {
  align-items: center;
  background: #fff;
  border: 0;
  border-radius: 16px;
  box-shadow: 0 16px 32px rgba(31, 55, 22, 0.2);
  color: #355f24;
  cursor: pointer;
  display: inline-flex;
  font-weight: 900;
  gap: 8px;
  justify-self: start;
  margin-top: 4px;
  min-height: 48px;
  padding: 0 17px;
}

.hero-art {
  min-height: 250px;
  position: relative;
}

.hero-art img {
  bottom: -56px;
  filter: drop-shadow(0 24px 24px rgba(29, 56, 21, 0.22));
  max-height: 315px;
  object-fit: contain;
  position: absolute;
  right: -8px;
  width: min(100%, 285px);
  z-index: 2;
}

.hero-disc {
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
  color: #fff;
  display: inline-flex;
  height: 180px;
  justify-content: center;
  position: absolute;
  right: 22px;
  top: 18px;
  width: 180px;
}

.hero-disc :deep(.pa-icon) {
  height: 3.2rem;
  opacity: 0.42;
  width: 3.2rem;
}

.family-toolbar {
  align-items: stretch;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--family-line);
  border-radius: 24px;
  box-shadow: 0 16px 44px rgba(51, 82, 37, 0.08);
  display: grid;
  gap: 9px;
  grid-template-columns: minmax(260px, 1fr) repeat(3, minmax(150px, 0.28fr));
  padding: 10px;
}

.search-field {
  align-items: center;
  background: #f8faf4;
  border: 1px solid rgba(66, 104, 49, 0.12);
  border-radius: 18px;
  color: #578b26;
  display: grid;
  gap: 9px;
  grid-template-columns: 20px minmax(0, 1fr);
  min-height: 54px;
  padding: 7px 13px;
}

.search-field .input {
  background: transparent;
  border: 0;
  box-shadow: none;
  min-width: 0;
}

.toolbar-action {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(66, 104, 49, 0.12);
  border-radius: 18px;
  cursor: pointer;
  display: grid;
  gap: 2px 9px;
  grid-template-columns: 38px minmax(0, 1fr);
  padding: 8px 10px;
  text-align: left;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.toolbar-action:hover {
  box-shadow: 0 13px 28px rgba(51, 82, 37, 0.09);
  transform: translateY(-1px);
}

.toolbar-action > span {
  align-items: center;
  background: #edf6e4;
  border-radius: 13px;
  color: #578b26;
  display: inline-flex;
  grid-row: 1 / span 2;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.toolbar-action strong,
.toolbar-action small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toolbar-action strong {
  color: var(--family-ink);
  font-size: 0.78rem;
}

.toolbar-action small {
  color: #7a8473;
  font-size: 0.65rem;
}

.family-room-switcher {
  display: flex;
  gap: 9px;
  overflow-x: auto;
  padding: 2px 1px 5px;
  scrollbar-width: none;
}

.family-room-switcher::-webkit-scrollbar { display: none; }

.family-room-switcher > button {
  align-items: center;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--family-line);
  border-radius: 19px;
  box-shadow: 0 12px 30px rgba(51, 82, 37, 0.06);
  cursor: pointer;
  display: grid;
  flex: 0 0 205px;
  gap: 9px;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  min-height: 62px;
  padding: 9px;
  text-align: left;
  transition: 160ms ease;
}

.family-room-switcher > button:hover,
.family-room-switcher > button.active {
  background: linear-gradient(135deg, #edf6e4, #fff6e4);
  border-color: rgba(87, 139, 38, 0.18);
  box-shadow: 0 14px 30px rgba(51, 82, 37, 0.09);
  transform: translateY(-1px);
}

.family-room-switcher > button.active {
  box-shadow: inset 3px 0 0 #6f971a, 0 14px 30px rgba(51, 82, 37, 0.09);
}

.room-switch-mark {
  align-items: center;
  background: #eaf3df;
  border-radius: 13px;
  color: #4b7b2a;
  display: inline-flex;
  font-size: 0.68rem;
  font-weight: 950;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.room-switch-mark[data-index='1'] { background: #fff0d2; color: #a86b05; }
.room-switch-mark[data-index='2'] { background: #e3f1f6; color: #3b7e9f; }
.room-switch-mark[data-index='3'] { background: #fbe7e1; color: #b45f52; }

.room-switch-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.room-switch-copy strong,
.room-switch-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-switch-copy strong { color: var(--family-ink); font-size: 0.78rem; }
.room-switch-copy small { color: #7a8473; font-size: 0.64rem; }

.room-switch-count {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(87, 139, 38, 0.12);
  border-radius: 999px;
  color: #4d772e;
  display: inline-flex;
  font-size: 0.65rem;
  font-weight: 950;
  min-height: 28px;
  padding: 0 8px;
}

.family-viewbar {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.family-view-filters {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--family-line);
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(51, 82, 37, 0.055);
  display: inline-flex;
  gap: 4px;
  padding: 5px;
}

.family-view-filters button {
  background: transparent;
  border: 0;
  border-radius: 13px;
  color: #717b6b;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 900;
  min-height: 38px;
  padding: 0 13px;
}

.family-view-filters button.active {
  background: linear-gradient(135deg, #edf6e4, #fff6e4);
  box-shadow: 0 7px 16px rgba(51, 82, 37, 0.08);
  color: #355f24;
}

.family-confirmation-kpi {
  align-items: center;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--family-line);
  border-radius: 999px;
  box-shadow: 0 12px 28px rgba(51, 82, 37, 0.055);
  color: #578b26;
  display: inline-flex;
  gap: 7px;
  min-height: 46px;
  padding: 0 13px;
}

.family-confirmation-kpi small { color: #6f7968; font-size: 0.66rem; font-weight: 850; }
.family-confirmation-kpi strong { color: #355f24; font-size: 0.78rem; }
.family-confirmation-kpi :deep(.pa-icon) { height: 0.95rem; width: 0.95rem; }

.eyebrow {
  color: #578b26;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0 0 5px;
  text-transform: uppercase;
}

.family-desk {
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 430px);
}

.family-list-card,
.family-preview-card,
.loading-card {
  background: rgba(255, 255, 255, 0.91);
  border: 1px solid var(--family-line);
  border-radius: 28px;
  box-shadow: 0 20px 58px rgba(51, 82, 37, 0.09);
}

.family-list-card,
.family-preview-card {
  display: grid;
  gap: 13px;
  padding: 14px;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 5px 5px 13px;
}

.section-head h2,
.family-profile-hero h2 {
  color: var(--family-ink);
  font-family: var(--font-title);
  margin: 0;
}

.section-head h2 {
  font-size: clamp(1.35rem, 2.4vw, 2rem);
}

.list-scope {
  background: #edf6e4;
  border: 1px solid rgba(87, 139, 38, 0.14);
  border-radius: 999px;
  color: #355f24;
  font-size: 0.72rem;
  font-weight: 900;
  padding: 7px 10px;
}

.family-list {
  display: grid;
  gap: 8px;
}

.family-row-shell {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 22px;
  display: grid;
  gap: 4px;
  grid-template-columns: 30px minmax(0, 1fr);
  padding: 3px 5px 3px 3px;
  transition: 160ms ease;
}

.family-row-shell:hover,
.family-row-shell.active {
  background: linear-gradient(135deg, #edf6e4, #fff6e4);
  border-color: rgba(87, 139, 38, 0.16);
  transform: translateY(-1px);
}

.family-row-shell.active {
  box-shadow: inset 3px 0 0 #6f971a, 0 12px 28px rgba(51, 82, 37, 0.08);
}

.family-select-control {
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: center;
}

.family-select-control input {
  accent-color: #578b26;
  height: 16px;
  width: 16px;
}

.family-row {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 19px;
  cursor: pointer;
  display: grid;
  gap: 11px;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  min-height: 70px;
  padding: 7px;
  text-align: left;
  width: 100%;
}

.family-bulk-bar {
  align-items: center;
  background: linear-gradient(135deg, #314f24, #5f8737);
  border-radius: 18px;
  box-shadow: 0 14px 28px rgba(49, 79, 36, 0.18);
  color: #fff;
  display: grid;
  gap: 8px;
  grid-template-columns: 32px auto minmax(130px, 1fr) 40px 40px;
  padding: 9px;
}

.family-bulk-bar > span {
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  display: inline-flex;
  font-size: 0.75rem;
  font-weight: 950;
  height: 32px;
  justify-content: center;
}

.family-bulk-bar > strong { font-size: 0.72rem; }

.family-bulk-bar select {
  background: rgba(255, 255, 255, 0.96);
  border: 0;
  border-radius: 12px;
  color: #355f24;
  min-height: 38px;
  min-width: 0;
  padding: 0 10px;
}

.family-bulk-bar > button {
  align-items: center;
  background: #fff;
  border: 0;
  border-radius: 12px;
  color: #416a28;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.family-bulk-bar > button.bulk-clear { background: rgba(255, 255, 255, 0.13); color: #fff; }
.family-bulk-bar > button:disabled { opacity: 0.45; }

.family-avatar,
.selected-family-avatar {
  align-items: center;
  background: linear-gradient(135deg, #ddebca, #fff0c9);
  border: 1px solid rgba(87, 139, 38, 0.13);
  color: #355f24;
  display: inline-flex;
  font-weight: 950;
  justify-content: center;
}

.family-avatar {
  border-radius: 17px;
  font-size: 0.78rem;
  height: 52px;
  width: 52px;
}

.family-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.family-copy strong,
.family-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-copy strong {
  color: var(--family-ink);
  font-size: 0.92rem;
}

.family-copy small {
  color: #747e6d;
  font-size: 0.74rem;
}

.family-row-tail {
  align-items: flex-end;
  display: grid;
  gap: 5px;
  justify-items: end;
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

.source-pill[data-state='ok'] { background: #578b26; color: #fff; }
.source-pill[data-state='review'] { background: #fff0cc; color: #9a5e05; }
.source-pill[data-state='move'] { background: #f4b64a; color: #372505; }

.family-preview-card {
  align-self: start;
  background:
    radial-gradient(circle at 100% 0%, rgba(159, 190, 75, 0.14), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 251, 243, 0.94));
  position: sticky;
  top: calc(var(--topbar-height) + 16px);
}

.family-profile-hero {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 68px minmax(0, 1fr) auto;
  padding: 3px 3px 9px;
}

.selected-family-avatar {
  border-radius: 22px;
  font-size: 1rem;
  height: 68px;
  width: 68px;
}

.family-profile-hero h2 {
  font-size: clamp(1.45rem, 2.5vw, 2.25rem);
  line-height: 0.95;
}

.account-state {
  color: #578b26;
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 900;
  margin-top: 5px;
  text-transform: uppercase;
}

.family-profile-lines {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.family-profile-lines article {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(66, 104, 49, 0.1);
  border-radius: 18px;
  display: grid;
  gap: 9px;
  grid-template-columns: 34px minmax(0, 1fr);
  min-height: 64px;
  padding: 10px;
}

.family-profile-lines article > :deep(.pa-icon) {
  color: #578b26;
}

.family-profile-lines small,
.family-profile-lines strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-profile-lines small {
  color: #7b8475;
  font-size: 0.65rem;
  font-weight: 800;
}

.family-profile-lines strong {
  color: var(--family-ink);
  font-size: 0.78rem;
}

.access-panel {
  align-items: center;
  background: linear-gradient(135deg, #fff6e4, #edf6e4);
  border: 1px solid rgba(87, 139, 38, 0.14);
  border-radius: 20px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 13px;
}

.access-panel small,
.access-panel strong {
  display: block;
}

.access-panel small {
  color: #747e6d;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.access-panel strong {
  color: var(--family-ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.92rem;
}


.preview-actions {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.preview-actions .btn-primary {
  background: #263f1c;
  box-shadow: 0 14px 28px rgba(38, 63, 28, 0.17);
}

.notice {
  background: #edf8e7;
  border: 1px solid #cbe4b8;
  border-radius: 16px;
  color: #355f24;
  font-weight: 700;
  margin: 0;
  padding: 10px 13px;
}

.loading-card {
  color: #717a6c;
  padding: 22px;
}

.roster-sync-icon {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-weight: 900;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.roster-sync-card[data-state='matched'] .roster-sync-icon { background: #578b26; color: #fff; }
.roster-sync-card[data-state='room-changed'] .roster-sync-icon { background: #f4b64a; color: #372505; }

.source-only-list {
  border-top: 1px solid rgba(66, 104, 49, 0.1);
  display: grid;
  gap: 8px;
  margin-top: 8px;
  padding-top: 12px;
}

.source-only-list p {
  color: #747e6d;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
}

.source-only-row {
  align-items: center;
  background: #fffaf0;
  border: 1px solid rgba(244, 182, 74, 0.22);
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
  border: 1px solid var(--family-line);
  border-radius: 999px;
  color: #355f24;
  font-size: 0.72rem;
  font-weight: 900;
  padding: 7px 10px;
}

.roster-sync-card {
  align-items: center;
  background: #edf6e4;
  border: 1px solid rgba(87, 139, 38, 0.14);
  border-radius: 22px;
  display: grid;
  gap: 12px;
  grid-template-columns: auto 1fr auto;
  padding: 13px;
}

.roster-sync-card[data-state='room-changed'] {
  background: #fff6e4;
  border-color: rgba(244, 182, 74, 0.3);
}

.roster-sync-icon {
  height: 34px;
  width: 34px;
}

.roster-sync-card strong,
.roster-sync-card small {
  display: block;
}

.roster-sync-card strong { color: var(--family-ink); }
.roster-sync-card small { color: #747e6d; font-size: 0.72rem; }

.roster-sync-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.profile-head-actions {
  align-items: center;
  display: flex;
  gap: 7px;
}

.profile-revoke {
  align-items: center;
  background: #f6f3ee;
  border: 1px solid rgba(139, 110, 86, 0.12);
  border-radius: 13px;
  color: #8b6e56;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  transition: 160ms ease;
  width: 38px;
}

.profile-revoke:hover:not(:disabled) {
  background: #f5e9df;
  color: #925a35;
  transform: translateY(-1px);
}

.profile-revoke:disabled { opacity: 0.5; }
.profile-revoke:disabled :deep(.pa-icon) { animation: family-spin 0.8s linear infinite; }

.roster-room-route {
  align-items: center;
  color: #7b6c4d;
  display: flex;
  gap: 7px;
  margin-top: 7px;
}

.roster-room-route b {
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(244, 182, 74, 0.18);
  border-radius: 999px;
  font-size: 0.62rem;
  max-width: 135px;
  overflow: hidden;
  padding: 5px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roster-room-route :deep(.pa-icon) { height: 0.82rem; opacity: 0.7; width: 0.82rem; }

.family-room-flow {
  background: #fff;
  border: 1px solid rgba(66, 104, 49, 0.1);
  border-radius: 22px;
  display: grid;
  gap: 13px;
  padding: 14px;
}

.family-room-flow > header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.family-room-flow > header div { min-width: 0; }
.family-room-flow > header small { color: #7b8475; display: block; font-size: 0.62rem; font-weight: 850; }
.family-room-flow > header strong { color: var(--family-ink); display: block; font-size: 0.84rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.family-room-flow > header > span {
  align-items: center;
  background: #edf5e4;
  border-radius: 999px;
  color: #4d772e;
  display: inline-flex;
  font-size: 0.63rem;
  font-weight: 950;
  min-height: 30px;
  padding: 0 9px;
}

.family-room-path {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  scrollbar-width: thin;
}

.family-room-path button {
  align-items: center;
  background: transparent;
  border: 0;
  color: #7b8676;
  display: grid;
  flex: 0 0 78px;
  gap: 7px;
  justify-items: center;
  min-width: 0;
  padding: 0;
  position: relative;
}

.family-room-path button::after {
  background: #e2e8dd;
  content: '';
  height: 2px;
  left: calc(50% + 18px);
  position: absolute;
  top: 17px;
  width: calc(100% - 36px);
}

.family-room-path button:last-child::after { display: none; }
.family-room-path button.completed::after,
.family-room-path button.current::after { background: linear-gradient(90deg, #75a43c, #a9bf5c); }

.family-room-path button > span {
  align-items: center;
  background: #f0f3ed;
  border: 2px solid #dce3d6;
  border-radius: 13px;
  color: #819079;
  display: inline-flex;
  height: 36px;
  justify-content: center;
  position: relative;
  transition: 160ms ease;
  width: 36px;
  z-index: 1;
}

.family-room-path button strong {
  color: #7a8575;
  font-size: 0.58rem;
  line-height: 1.15;
  max-width: 74px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-room-path button.current > span {
  background: linear-gradient(135deg, #4b7b2e, #8cab3e);
  border-color: transparent;
  box-shadow: 0 8px 18px rgba(74, 119, 44, 0.25);
  color: #fff;
  transform: scale(1.08);
}

.family-room-path button.current strong { color: #345322; font-weight: 950; }
.family-room-path button.selected > span {
  background: #fff3d9;
  border-color: #efb44b;
  box-shadow: 0 8px 18px rgba(221, 154, 39, 0.18);
  color: #a66c0c;
  transform: translateY(-2px);
}
.family-room-path button.selected strong { color: #9d680d; font-weight: 950; }
.family-room-path button.suggested:not(.current):not(.selected) > span {
  background: #fff8e8;
  border-color: rgba(239, 180, 75, 0.55);
  color: #a66c0c;
}
.family-room-path button:hover:not(:disabled) > span { transform: translateY(-2px); }
.family-room-path button:disabled { opacity: 0.55; }

.family-room-directions {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.family-room-directions button {
  align-items: center;
  background: linear-gradient(135deg, #f5f8f1, #fbfcf9);
  border: 1px solid rgba(66, 104, 49, 0.11);
  border-radius: 15px;
  color: #456d2d;
  display: grid;
  gap: 8px;
  grid-template-columns: 18px minmax(0, 1fr);
  min-height: 60px;
  padding: 9px 10px;
  text-align: left;
  transition: 160ms ease;
}

.family-room-directions button.forward { grid-template-columns: minmax(0, 1fr) 18px; text-align: right; }
.family-room-directions button:first-child > :deep(.pa-icon) { transform: rotate(180deg); }
.family-room-directions button:hover:not(:disabled) { border-color: rgba(87, 139, 38, 0.28); box-shadow: 0 10px 22px rgba(51, 82, 37, 0.09); transform: translateY(-1px); }
.family-room-directions button:disabled { opacity: 0.4; }
.family-room-directions button span { display: grid; min-width: 0; }
.family-room-directions small { color: #899384; font-size: 0.57rem; font-weight: 850; }
.family-room-directions strong { color: #3f632b; font-size: 0.68rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.family-room-transfer {
  align-items: center;
  background: linear-gradient(135deg, #314f24, #5f8737);
  border-radius: 16px;
  box-shadow: 0 12px 26px rgba(49, 79, 36, 0.19);
  color: #fff;
  display: grid;
  gap: 7px;
  grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr) 38px;
  padding: 8px;
}

.family-room-transfer > span,
.family-room-transfer > strong {
  background: rgba(255, 255, 255, 0.11);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 11px;
  font-size: 0.6rem;
  font-weight: 900;
  overflow: hidden;
  padding: 8px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-room-transfer > strong { background: rgba(255, 255, 255, 0.18); }
.family-room-transfer > :deep(.pa-icon) { height: 0.9rem; opacity: 0.74; width: 0.9rem; }
.family-room-transfer button {
  align-items: center;
  background: #fff;
  border: 0;
  border-radius: 13px;
  color: #416a28;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.family-room-transfer-enter-active,
.family-room-transfer-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.family-room-transfer-enter-from,
.family-room-transfer-leave-to { opacity: 0; transform: translateY(-5px); }

@keyframes family-spin { to { transform: rotate(360deg); } }

.password-modal,
.registration-link-copy {
  display: grid;
  gap: 14px;
}

.password-preview {
  align-items: center;
  background: linear-gradient(135deg, #edf6e4, #fff6e4);
  border: 1px solid rgba(87, 139, 38, 0.14);
  border-radius: 20px;
  display: grid;
  gap: 8px;
  grid-template-columns: 54px minmax(0, 1fr);
  padding: 14px;
}

.password-preview span {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(87, 139, 38, 0.15);
  border-radius: 16px;
  color: #355f24;
  display: inline-flex;
  font-size: 1.2rem;
  font-weight: 950;
  height: 54px;
  justify-content: center;
  width: 54px;
}

.password-preview strong { color: var(--family-ink); }

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
  color: #475c3c;
  display: flex;
  font-weight: 800;
  gap: 10px;
}

.toggle-line input {
  accent-color: #578b26;
  height: 18px;
  width: 18px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.registration-link-modal {
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: 180px minmax(0, 1fr);
}

.registration-qr-card {
  align-items: center;
  background: linear-gradient(135deg, #edf6e4, #fff6e4);
  border: 1px solid rgba(87, 139, 38, 0.15);
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
  color: #355f24;
  font-weight: 950;
  letter-spacing: .12em;
}

.registration-link-copy p {
  color: #747e6d;
  font-weight: 700;
  margin: 0;
}

.link-box {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(87, 139, 38, 0.15);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 10px;
}

.link-box span {
  color: var(--family-ink);
  font-size: .8rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friendly-code {
  background: linear-gradient(135deg, #fff6e4, #edf6e4);
  border: 1px solid rgba(244, 182, 74, 0.26);
  border-radius: 18px;
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.friendly-code span {
  color: #747e6d;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.friendly-code strong {
  color: var(--family-ink);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 1.24rem;
}

.compact-alert { margin: 0 0 12px; }
.family-row-shell.syncing { background: #f2f8fb; border-color: rgba(78, 145, 182, 0.2); }
.family-row-shell.failed { background: #fff4f2; border-color: rgba(193, 94, 80, 0.2); }

@media (max-width: 1180px) {
  .family-toolbar {
    grid-template-columns: minmax(240px, 1fr) repeat(3, minmax(130px, 0.3fr));
  }

  .family-desk {
    grid-template-columns: 1fr;
  }

  .family-preview-card {
    position: static;
  }
}

@media (max-width: 920px) {
  .family-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-art {
    display: none;
  }

  .family-toolbar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .search-field {
    grid-column: 1 / -1;
  }

  .family-viewbar {
    align-items: stretch;
    flex-direction: column;
  }

  .family-confirmation-kpi {
    align-self: flex-start;
  }
}

@media (max-width: 680px) {
  .family-hero {
    border-radius: 28px;
    padding: 26px 20px;
  }

  .hero-copy h1 {
    font-size: clamp(3rem, 16vw, 4.8rem);
  }

  .hero-action {
    justify-self: stretch;
    justify-content: center;
  }

  .family-toolbar,
  .family-profile-lines,
  .preview-actions {
    grid-template-columns: 1fr;
  }

  .search-field {
    grid-column: auto;
  }

  .toolbar-action {
    min-height: 58px;
  }

  .family-row-shell {
    align-items: start;
    grid-template-columns: 26px minmax(0, 1fr);
  }

  .family-row {
    align-items: start;
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .family-avatar {
    height: 48px;
    width: 48px;
  }

  .family-row-tail {
    align-items: center;
    display: flex;
    grid-column: 1 / -1;
    justify-content: space-between;
    width: 100%;
  }

  .family-bulk-bar {
    grid-template-columns: 32px minmax(0, 1fr) 40px;
  }

  .family-bulk-bar select {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .family-bulk-bar > button:not(.bulk-clear) {
    grid-column: 1 / -1;
    width: 100%;
  }

  .family-bulk-bar > button.bulk-clear {
    grid-column: 3;
    grid-row: 1;
  }

  .family-copy strong,
  .family-copy small {
    white-space: normal;
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .family-profile-hero {
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .selected-family-avatar {
    border-radius: 19px;
    height: 58px;
    width: 58px;
  }

  .profile-head-actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }

  .access-panel,
  .roster-sync-card {
    align-items: stretch;
    grid-template-columns: 1fr;
  }

  .family-room-directions {
    grid-template-columns: 1fr;
  }

  .family-room-transfer {
    grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr) 38px;
  }

  .family-view-filters {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    width: 100%;
  }

  .family-view-filters button {
    padding-inline: 8px;
  }

  .family-confirmation-kpi {
    align-self: stretch;
    justify-content: center;
  }

  .access-panel {
    flex-direction: column;
  }

  .roster-sync-actions {
    justify-content: stretch;
  }

  .password-input-row,
  .registration-link-modal,
  .link-box {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    display: grid;
  }
}
</style>
