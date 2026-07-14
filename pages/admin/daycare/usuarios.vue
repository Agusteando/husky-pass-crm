<template>
  <section class="room-users" data-product-area="daycare" data-product-screen="room-users">
    <header class="users-hero">
      <div class="hero-copy">
        <p class="hero-kicker">Husky Pass · Guardería</p>
        <h1>Usuarios</h1>
        <div class="hero-metrics">
          <span><strong>{{ overview?.stats.total || 0 }}</strong> cuentas</span>
          <span><strong>{{ overview?.stats.assigned || 0 }}</strong> en sala</span>
          <span :class="{ alert: Boolean(overview?.stats.duplicateGroups) }"><strong>{{ overview?.stats.duplicateGroups || 0 }}</strong> coincidencias</span>
        </div>
      </div>

      <div class="hero-controls">
        <label class="control-card">
          <span>Unidad</span>
          <select v-model="selectedUnidad" data-diagnostic-filter="unidad-usuarios">
            <option v-for="unidad in overview?.unidades || []" :key="unidad" :value="unidad">{{ unidad }}</option>
          </select>
        </label>
        <label class="control-card search-control">
          <span>Buscar</span>
          <span class="control-input"><FamilyPersonasIcon name="search" /><input v-model="search" type="search" placeholder="Nombre, correo o usuario" /></span>
        </label>
      </div>

      <div class="hero-orbit" aria-hidden="true">
        <span class="orbit orbit-a" />
        <span class="orbit orbit-b" />
        <div class="orbit-core"><FamilyPersonasIcon name="people" /></div>
      </div>
    </header>

    <div v-if="pending" class="state-panel" data-product-loading>
      <HuskyPassLoader label="Usuarios" contained />
    </div>
    <p v-else-if="error" class="surface-message error">No fue posible cargar usuarios.</p>

    <template v-else-if="overview">
      <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
      <p v-if="actionNotice" class="surface-message">{{ actionNotice }}</p>

      <section class="signal-grid" :class="{ compact: !overview.duplicates.length }" aria-label="Estado de usuarios">
        <button type="button" :class="{ active: filterMode === 'all' }" @click="setFilter('all')">
          <span class="signal-icon green"><FamilyPersonasIcon name="people" /></span>
          <span><small>Total</small><strong>{{ overview.stats.total }}</strong></span>
        </button>
        <button type="button" :class="{ active: filterMode === 'duplicates' }" @click="setFilter('duplicates')">
          <span class="signal-icon amber"><FamilyPersonasIcon name="replace" /></span>
          <span><small>Coincidencias</small><strong>{{ overview.stats.duplicateAccounts }}</strong></span>
          <i v-if="overview.stats.duplicateGroups">{{ overview.stats.duplicateGroups }}</i>
        </button>
        <button type="button" :class="{ active: filterMode === 'unassigned' }" @click="setFilter('unassigned')">
          <span class="signal-icon coral"><FamilyPersonasIcon name="alert" /></span>
          <span><small>Sin sala</small><strong>{{ overview.stats.unassigned }}</strong></span>
        </button>
        <button v-if="overview.duplicates.length" type="button" class="merge-all-signal" :disabled="actionBusy" @click="openMergeAll">
          <span class="signal-icon blue"><FamilyPersonasIcon name="replace" /></span>
          <span><small>Duplicados</small><strong>{{ overview.duplicates.length }}</strong></span>
          <FamilyPersonasIcon name="arrow" />
        </button>
      </section>

      <section class="users-workbench">
        <aside class="rooms-rail" data-product-panel="room-filter">
          <header class="pane-head">
            <div><p class="eyebrow">Salas</p><h2>{{ overview.unidad }}</h2></div>
            <span>{{ overview.salas.length }}</span>
          </header>
          <div class="room-options">
            <button type="button" :class="{ active: selectedRoomKey === 'all' }" @click="selectRoom('all')">
              <span class="room-mark all"><FamilyPersonasIcon name="people" /></span>
              <span><strong>Todas</strong><small>{{ overview.stats.total }} usuarios</small></span>
              <b>{{ overview.stats.total }}</b>
            </button>
            <button
              v-for="(sala, index) in overview.salas"
              :key="sala.id"
              type="button"
              :class="{ active: selectedRoomKey === String(sala.id) }"
              @click="selectRoom(String(sala.id))"
            >
              <span class="room-mark" :data-index="index % 4">{{ initials(sala.sala) }}</span>
              <span><strong>{{ sala.sala }}</strong><small>{{ roomCount(sala.id) }} usuarios</small></span>
              <b>{{ roomCount(sala.id) }}</b>
            </button>
            <button type="button" :class="{ active: selectedRoomKey === 'none' }" @click="selectRoom('none')">
              <span class="room-mark none"><FamilyPersonasIcon name="alert" /></span>
              <span><strong>Sin sala</strong><small>{{ overview.stats.unassigned }} usuarios</small></span>
              <b>{{ overview.stats.unassigned }}</b>
            </button>
          </div>
        </aside>

        <main class="users-list-panel" data-product-panel="users-list">
          <header class="list-head">
            <div>
              <p class="eyebrow">{{ roomHeading }}</p>
              <h2>{{ filteredMembers.length }} usuarios</h2>
            </div>
            <div class="filter-chips" aria-label="Filtros de usuarios">
              <button type="button" :class="{ active: filterMode === 'all' }" @click="setFilter('all')">Todos</button>
              <button type="button" :class="{ active: filterMode === 'duplicates' }" @click="setFilter('duplicates')">Duplicados</button>
              <button type="button" :class="{ active: filterMode === 'unassigned' }" @click="setFilter('unassigned')">Sin sala</button>
            </div>
          </header>

          <section v-if="selectedIds.length" class="bulk-bar">
            <span class="selection-count">{{ selectedIds.length }}</span>
            <strong>{{ selectedIds.length === 1 ? 'usuario' : 'usuarios' }}</strong>
            <select v-model.number="bulkTargetSalaId" aria-label="Sala destino">
              <option :value="0" disabled>Sala destino</option>
              <option v-for="sala in overview.salas" :key="sala.id" :value="sala.id">{{ sala.sala }}</option>
            </select>
            <button type="button" :disabled="!bulkTargetSalaId || actionBusy" @click="moveSelected">Mover</button>
            <button class="clear-selection" type="button" aria-label="Limpiar selección" @click="clearSelection"><FamilyPersonasIcon name="close" /></button>
          </section>

          <div class="table-head" aria-hidden="true">
            <label><input type="checkbox" :checked="allVisibleSelected" :indeterminate.prop="someVisibleSelected" @change="toggleAllVisible" /></label>
            <span>Usuario</span>
            <span>Sala</span>
            <span>Estado</span>
          </div>

          <div v-if="filteredMembers.length" class="member-list" role="list">
            <article
              v-for="member in filteredMembers"
              :key="member.id"
              class="member-row"
              :class="{ active: selectedMember?.id === member.id, duplicate: Boolean(member.duplicateGroupKey) }"
              role="listitem"
              @click="selectMember(member.id)"
            >
              <label class="row-check" @click.stop>
                <input type="checkbox" :checked="selectedIds.includes(member.id)" @change="toggleMember(member.id)" />
              </label>
              <span class="member-avatar">{{ initials(member.nombre_nino || member.email || member.username) }}</span>
              <span class="member-copy">
                <strong>{{ member.nombre_nino || accountLabel(member) }}</strong>
                <small>{{ member.email || member.username }}</small>
              </span>
              <span class="room-pill" :class="{ empty: !member.salaId }"><FamilyPersonasIcon name="daycare" />{{ member.salaName || 'Sin sala' }}</span>
              <span v-if="member.duplicateGroupKey" class="status-pill duplicate"><FamilyPersonasIcon name="replace" />{{ member.duplicateCount }}</span>
              <span v-else class="status-pill ready"><FamilyPersonasIcon name="check" />Activa</span>
              <button type="button" aria-label="Abrir usuario" @click.stop="selectMember(member.id)"><FamilyPersonasIcon name="arrow" /></button>
            </article>
          </div>
          <EmptyState v-else title="Sin coincidencias" />
        </main>

        <aside class="member-detail" data-product-panel="user-detail">
          <template v-if="selectedMember">
            <header class="detail-head">
              <span class="detail-avatar">{{ initials(selectedMember.nombre_nino || selectedMember.email) }}</span>
              <div>
                <p class="eyebrow">Usuario U-{{ selectedMember.id }}</p>
                <h2>{{ selectedMember.nombre_nino || accountLabel(selectedMember) }}</h2>
                <small>{{ selectedMember.email || selectedMember.username }}</small>
              </div>
              <span v-if="selectedMember.duplicateGroupKey" class="detail-alert"><FamilyPersonasIcon name="replace" /></span>
            </header>

            <section class="identity-grid">
              <article><small>Usuario</small><strong>{{ selectedMember.username || '—' }}</strong></article>
              <article><small>Acceso</small><strong>{{ selectedMember.plaintext ? 'Configurado' : 'Pendiente' }}</strong></article>
              <article><small>Personas</small><strong>{{ selectedMember.authorizedPeople }}</strong></article>
              <article><small>Alumnos</small><strong>{{ selectedMember.linkedStudents }}</strong></article>
            </section>

            <section class="room-flow">
              <header>
                <div><p class="eyebrow">Sala actual</p><strong>{{ selectedMember.salaName || 'Sin sala' }}</strong></div>
                <span class="room-position">{{ currentRoomPosition }}</span>
              </header>

              <div class="room-path" role="list" aria-label="Recorrido de salas">
                <button
                  v-for="(sala, index) in overview.salas"
                  :key="sala.id"
                  type="button"
                  role="listitem"
                  :class="{
                    current: sala.id === selectedMember.salaId,
                    selected: sala.id === detailTargetSalaId && sala.id !== selectedMember.salaId,
                    completed: currentRoomIndex >= 0 && index < currentRoomIndex
                  }"
                  :aria-current="sala.id === selectedMember.salaId ? 'step' : undefined"
                  :aria-label="sala.sala"
                  @click="detailTargetSalaId = sala.id"
                >
                  <span class="room-node"><FamilyPersonasIcon :name="sala.id === selectedMember.salaId ? 'check' : 'daycare'" /></span>
                  <strong>{{ sala.sala }}</strong>
                </button>
              </div>

              <div class="room-directions">
                <button type="button" class="room-direction backward" :disabled="!previousRoom || actionBusy" @click="moveMemberTo(previousRoom?.id)">
                  <FamilyPersonasIcon name="arrow" />
                  <span><small>Regresar</small><strong>{{ previousRoom?.sala || '—' }}</strong></span>
                </button>
                <button type="button" class="room-direction forward" :disabled="!nextRoom || actionBusy" @click="moveMemberTo(nextRoom?.id)">
                  <span><small>Promover</small><strong>{{ nextRoom?.sala || '—' }}</strong></span>
                  <FamilyPersonasIcon name="arrow" />
                </button>
              </div>

              <Transition name="room-transfer">
                <div v-if="detailTargetRoom && detailTargetRoom.id !== selectedMember.salaId" class="room-transfer">
                  <span class="transfer-room current">{{ selectedMember.salaName || 'Sin sala' }}</span>
                  <FamilyPersonasIcon name="arrow" />
                  <span class="transfer-room target">{{ detailTargetRoom.sala }}</span>
                  <button type="button" :disabled="actionBusy" @click="moveMemberTo(detailTargetRoom.id)">
                    <FamilyPersonasIcon name="check" />
                  </button>
                </div>
              </Transition>
            </section>

            <section v-if="selectedDuplicateGroup" class="duplicate-card">
              <header>
                <span><FamilyPersonasIcon name="replace" /></span>
                <div><p class="eyebrow">Coincidencia exacta</p><strong>{{ selectedDuplicateGroup.members.length }} cuentas</strong></div>
              </header>
              <div class="duplicate-stack">
                <article v-for="member in selectedDuplicateGroup.members" :key="member.id" :class="{ canonical: member.id === selectedDuplicateGroup.canonicalId }">
                  <span>{{ initials(member.nombre_nino || member.email) }}</span>
                  <div><strong>{{ member.nombre_nino || accountLabel(member) }}</strong><small>{{ member.salaName || 'Sin sala' }}</small></div>
                  <i v-if="member.id === selectedDuplicateGroup.canonicalId"><FamilyPersonasIcon name="check" /></i>
                </article>
              </div>
              <button type="button" :disabled="actionBusy" @click="openMerge(selectedDuplicateGroup)">Consolidar</button>
            </section>
          </template>
          <EmptyState v-else title="Selecciona un usuario" />
        </aside>
      </section>
    </template>

    <AdminModal
      v-if="mergeDialog"
      title="Consolidar cuentas"
      eyebrow="Usuarios"
      :description="mergeDialog.members.map((member) => member.salaName || 'Sin sala').join(' · ')"
      :close-disabled="actionBusy"
      @close="closeMergeDialog"
    >
      <section class="merge-modal">
        <div class="merge-summary">
          <span class="merge-count">{{ mergeDialog.members.length }}</span>
          <div><strong>Una cuenta familiar</strong><small>{{ mergeDialog.matchBy.map(matchLabel).join(' + ') }}</small></div>
        </div>
        <label class="merge-field">
          <span>Cuenta principal</span>
          <select v-model.number="mergeCanonicalId">
            <option v-for="member in mergeDialog.members" :key="member.id" :value="member.id">{{ member.nombre_nino || accountLabel(member) }} · {{ member.salaName || 'Sin sala' }}</option>
          </select>
        </label>
        <label class="merge-field">
          <span>Sala final</span>
          <select v-model.number="mergeTargetSalaId">
            <option v-for="sala in overview?.salas || []" :key="sala.id" :value="sala.id">{{ sala.sala }}</option>
          </select>
        </label>
        <section class="merge-members">
          <article v-for="member in mergeDialog.members" :key="member.id" :class="{ primary: member.id === mergeCanonicalId }">
            <span>{{ initials(member.nombre_nino || member.email) }}</span>
            <div><strong>{{ member.nombre_nino || accountLabel(member) }}</strong><small>{{ member.email }} · {{ member.salaName || 'Sin sala' }}</small></div>
            <FamilyPersonasIcon :name="member.id === mergeCanonicalId ? 'check' : 'replace'" />
          </article>
        </section>
        <footer class="modal-actions">
          <button class="btn btn-secondary" type="button" :disabled="actionBusy" @click="closeMergeDialog">Cancelar</button>
          <button class="btn btn-primary" type="button" :disabled="!mergeTargetSalaId || actionBusy" @click="confirmMerge">{{ actionBusy ? 'Consolidando…' : 'Consolidar' }}</button>
        </footer>
      </section>
    </AdminModal>

    <AdminModal
      v-if="mergeAllDialog"
      title="Consolidar coincidencias"
      eyebrow="Usuarios"
      :description="`${overview?.duplicates.length || 0} grupos · ${overview?.stats.duplicateAccounts || 0} cuentas`"
      :close-disabled="actionBusy"
      @close="mergeAllDialog = false"
    >
      <section class="merge-modal">
        <div class="merge-all-grid">
          <article v-for="group in overview?.duplicates || []" :key="group.key">
            <span>{{ group.members.length }}</span>
            <div><strong>{{ group.members[0]?.email || group.members[0]?.username }}</strong><small>{{ group.members.map((member) => member.salaName || 'Sin sala').join(' · ') }}</small></div>
            <FamilyPersonasIcon name="replace" />
          </article>
        </div>
        <footer class="modal-actions">
          <button class="btn btn-secondary" type="button" :disabled="actionBusy" @click="mergeAllDialog = false">Cancelar</button>
          <button class="btn btn-primary" type="button" :disabled="actionBusy" @click="confirmMergeAll">{{ actionBusy ? 'Consolidando…' : 'Consolidar todo' }}</button>
        </footer>
      </section>
    </AdminModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { DaycareDuplicateGroup, DaycareRoomManagementOverview, DaycareRoomMember, Sala } from '~/types/daycare'
import AdminModal from '~/components/admin/AdminModal.vue'
import EmptyState from '~/components/EmptyState.vue'
import FamilyPersonasIcon from '~/components/family/PersonasIcon.vue'
import HuskyPassLoader from '~/components/HuskyPassLoader.vue'

definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })

type FilterMode = 'all' | 'duplicates' | 'unassigned'

const route = useRoute()
const router = useRouter()
const selectedUnidad = ref(typeof route.query.unidad === 'string' ? route.query.unidad : '')
const selectedRoomKey = ref(typeof route.query.sala === 'string' ? route.query.sala : 'all')
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const filterMode = ref<FilterMode>(route.query.estado === 'duplicates' || route.query.estado === 'unassigned' ? route.query.estado : 'all')
const selectedMemberId = ref(Number(route.query.usuario || 0) || null)
const selectedIds = ref<number[]>([])
const bulkTargetSalaId = ref(0)
const detailTargetSalaId = ref(0)
const mergeDialog = ref<DaycareDuplicateGroup | null>(null)
const mergeCanonicalId = ref(0)
const mergeTargetSalaId = ref(0)
const mergeAllDialog = ref(false)
const actionBusy = ref(false)
const actionError = ref('')
const actionNotice = ref('')

const { data: overview, pending, error, refresh } = useFetch<DaycareRoomManagementOverview>('/api/daycare/admin/room-management', {
  query: computed(() => ({ unidad: selectedUnidad.value })),
  watch: [selectedUnidad],
  timeout: 15000
})

watch(overview, (value) => {
  if (!value) return
  if (!selectedUnidad.value || !value.unidades.includes(selectedUnidad.value)) selectedUnidad.value = value.unidad
  if (!['all', 'none', ...value.salas.map((sala) => String(sala.id))].includes(selectedRoomKey.value)) selectedRoomKey.value = 'all'
  const visibleIds = new Set(value.members.map((member) => member.id))
  selectedIds.value = selectedIds.value.filter((id) => visibleIds.has(id))
  if (!selectedMemberId.value || !visibleIds.has(selectedMemberId.value)) selectedMemberId.value = value.members[0]?.id || null
  syncQuery()
}, { immediate: true })

watch([selectedUnidad, selectedRoomKey, search, filterMode, selectedMemberId], () => syncQuery())

const filteredMembers = computed(() => {
  const members = overview.value?.members || []
  const needle = search.value.trim().toLowerCase()
  return members.filter((member) => {
    if (selectedRoomKey.value === 'none' && member.salaId) return false
    if (selectedRoomKey.value !== 'all' && selectedRoomKey.value !== 'none' && String(member.salaId || '') !== selectedRoomKey.value) return false
    if (filterMode.value === 'duplicates' && !member.duplicateGroupKey) return false
    if (filterMode.value === 'unassigned' && member.salaId) return false
    if (!needle) return true
    return `${member.nombre_nino || ''} ${member.email || ''} ${member.username || ''} ${member.salaName || ''}`.toLowerCase().includes(needle)
  })
})

const selectedMember = computed(() => overview.value?.members.find((member) => member.id === selectedMemberId.value) || filteredMembers.value[0] || null)
const selectedDuplicateGroup = computed(() => {
  const key = selectedMember.value?.duplicateGroupKey
  return key ? overview.value?.duplicates.find((group) => group.key === key) || null : null
})
const selectedRoom = computed(() => overview.value?.salas.find((sala) => String(sala.id) === selectedRoomKey.value) || null)
const roomHeading = computed(() => selectedRoomKey.value === 'none' ? 'Sin sala' : selectedRoom.value?.sala || 'Todas las salas')
const currentRoomIndex = computed(() => overview.value?.salas.findIndex((sala) => sala.id === selectedMember.value?.salaId) ?? -1)
const previousRoom = computed(() => currentRoomIndex.value > 0 ? overview.value?.salas[currentRoomIndex.value - 1] || null : null)
const nextRoom = computed(() => currentRoomIndex.value >= 0 ? overview.value?.salas[currentRoomIndex.value + 1] || null : overview.value?.salas[0] || null)
const currentRoomPosition = computed(() => currentRoomIndex.value >= 0 ? `${currentRoomIndex.value + 1}/${overview.value?.salas.length || 0}` : '—')
const detailTargetRoom = computed(() => overview.value?.salas.find((sala) => sala.id === detailTargetSalaId.value) || null)
const visibleIds = computed(() => filteredMembers.value.map((member) => member.id))
const allVisibleSelected = computed(() => Boolean(visibleIds.value.length) && visibleIds.value.every((id) => selectedIds.value.includes(id)))
const someVisibleSelected = computed(() => !allVisibleSelected.value && visibleIds.value.some((id) => selectedIds.value.includes(id)))

watch(selectedMember, (member) => {
  detailTargetSalaId.value = member?.salaId || 0
})

function roomCount(salaId: number) {
  return overview.value?.members.filter((member) => member.salaId === salaId).length || 0
}

function selectRoom(value: string) {
  selectedRoomKey.value = value
  selectedIds.value = []
  const first = filteredMembers.value[0]
  if (first) selectedMemberId.value = first.id
}

function setFilter(value: FilterMode) {
  filterMode.value = value
  const first = filteredMembers.value[0]
  if (first) selectedMemberId.value = first.id
}

function selectMember(id: number) {
  selectedMemberId.value = id
  actionError.value = ''
  actionNotice.value = ''
}

function toggleMember(id: number) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id]
}

function toggleAllVisible() {
  if (allVisibleSelected.value) {
    const visible = new Set(visibleIds.value)
    selectedIds.value = selectedIds.value.filter((id) => !visible.has(id))
  } else {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...visibleIds.value]))
  }
}

function clearSelection() {
  selectedIds.value = []
  bulkTargetSalaId.value = 0
}

async function moveSelected() {
  if (!selectedIds.value.length || !bulkTargetSalaId.value) return
  await moveMembers(selectedIds.value, bulkTargetSalaId.value)
  clearSelection()
}

async function moveMemberTo(targetSalaId?: number | null) {
  if (!selectedMember.value?.id || !targetSalaId || targetSalaId === selectedMember.value.salaId) return
  await moveMembers([selectedMember.value.id], targetSalaId)
}

async function moveMembers(userIds: number[], targetSalaId: number) {
  actionBusy.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const result = await $fetch<{ moved: number; target: Sala }>('/api/daycare/admin/room-management/move', {
      method: 'POST',
      body: { userIds, targetSalaId }
    })
    actionNotice.value = `${result.moved} ${result.moved === 1 ? 'usuario movido' : 'usuarios movidos'} · ${result.target.sala}`
    await refresh()
  } catch (err: any) {
    actionError.value = errorMessage(err, 'No fue posible mover usuarios.')
  } finally {
    actionBusy.value = false
  }
}

function openMerge(group: DaycareDuplicateGroup) {
  mergeDialog.value = group
  mergeCanonicalId.value = group.canonicalId
  const canonical = group.members.find((member) => member.id === group.canonicalId)
  mergeTargetSalaId.value = canonical?.salaId || overview.value?.salas[0]?.id || 0
}

function closeMergeDialog() {
  if (actionBusy.value) return
  mergeDialog.value = null
}

async function confirmMerge() {
  const group = mergeDialog.value
  if (!group || !mergeCanonicalId.value || !mergeTargetSalaId.value) return
  actionBusy.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    const duplicateIds = group.members.map((member) => member.id).filter((id) => id !== mergeCanonicalId.value)
    const result = await $fetch<{ canonicalId: number; merged: number; target: Sala }>('/api/daycare/admin/room-management/merge', {
      method: 'POST',
      body: { canonicalId: mergeCanonicalId.value, duplicateIds, targetSalaId: mergeTargetSalaId.value }
    })
    selectedMemberId.value = result.canonicalId
    mergeDialog.value = null
    actionNotice.value = `${result.merged + 1} cuentas consolidadas · ${result.target.sala}`
    await refresh()
  } catch (err: any) {
    actionError.value = errorMessage(err, 'No fue posible consolidar las cuentas.')
  } finally {
    actionBusy.value = false
  }
}

function openMergeAll() {
  if (!overview.value?.duplicates.length) return
  mergeAllDialog.value = true
}

async function confirmMergeAll() {
  const groups = [...(overview.value?.duplicates || [])]
  if (!groups.length) return
  actionBusy.value = true
  actionError.value = ''
  actionNotice.value = ''
  let mergedAccounts = 0
  try {
    for (const group of groups) {
      const canonical = group.members.find((member) => member.id === group.canonicalId) || group.members[0]
      const targetSalaId = canonical?.salaId || overview.value?.salas[0]?.id
      if (!canonical || !targetSalaId) throw new Error('No hay sala disponible para consolidar.')
      const duplicateIds = group.members.map((member) => member.id).filter((id) => id !== canonical.id)
      const result = await $fetch<{ merged: number }>('/api/daycare/admin/room-management/merge', {
        method: 'POST',
        body: { canonicalId: canonical.id, duplicateIds, targetSalaId }
      })
      mergedAccounts += result.merged
    }
    mergeAllDialog.value = false
    actionNotice.value = `${mergedAccounts} cuentas duplicadas consolidadas.`
    await refresh()
  } catch (err: any) {
    actionError.value = errorMessage(err, 'La consolidación quedó incompleta.')
    await refresh()
  } finally {
    actionBusy.value = false
  }
}

function matchLabel(value: 'email' | 'username') {
  return value === 'email' ? 'Correo' : 'Usuario'
}

function accountLabel(member: Pick<DaycareRoomMember, 'username' | 'email'>) {
  return member.username || member.email || 'Cuenta familiar'
}

function initials(value?: string | null) {
  return String(value || 'HP').split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
}

function errorMessage(error: any, fallback: string) {
  return error?.data?.message || error?.data?.statusMessage || error?.statusMessage || error?.message || fallback
}

function syncQuery() {
  if (!import.meta.client) return
  const query: Record<string, string> = {}
  if (selectedUnidad.value) query.unidad = selectedUnidad.value
  if (selectedRoomKey.value !== 'all') query.sala = selectedRoomKey.value
  if (search.value.trim()) query.buscar = search.value.trim()
  if (filterMode.value !== 'all') query.estado = filterMode.value
  if (selectedMemberId.value) query.usuario = String(selectedMemberId.value)
  const keys = new Set([...Object.keys(route.query), ...Object.keys(query)])
  const changed = Array.from(keys).some((key) => {
    const current = Array.isArray(route.query[key]) ? route.query[key]?.[0] : route.query[key]
    return String(current || '') !== String(query[key] || '')
  })
  if (changed) router.replace({ path: route.path, query })
}
</script>

<style scoped>
.room-users {
  --ink: #263f1c;
  --muted: #6d7867;
  --green: #578b26;
  --green-deep: #294e20;
  --line: rgba(66, 104, 49, 0.13);
  display: grid;
  gap: clamp(16px, 2.2vw, 24px);
}

.users-hero {
  background:
    radial-gradient(circle at 11% 118%, rgba(255, 190, 71, 0.34), transparent 33%),
    radial-gradient(circle at 87% 0%, rgba(190, 221, 86, 0.28), transparent 28%),
    linear-gradient(135deg, #294e20 0%, #4e7f31 55%, #8eae3f 100%);
  border-radius: 34px;
  box-shadow: 0 26px 64px rgba(49, 95, 36, 0.22);
  color: #fff;
  display: grid;
  gap: clamp(20px, 3vw, 38px);
  grid-template-columns: minmax(0, 1fr) minmax(330px, 0.75fr) 190px;
  min-height: 260px;
  overflow: hidden;
  padding: clamp(26px, 4vw, 46px);
  position: relative;
}

.hero-copy,
.hero-controls,
.hero-orbit { position: relative; z-index: 1; }
.hero-copy { align-content: center; display: grid; gap: 12px; }
.hero-kicker,
.eyebrow { font-size: .68rem; font-weight: 900; letter-spacing: .12em; margin: 0; text-transform: uppercase; }
.hero-kicker { color: rgba(255,255,255,.72); }
.hero-copy h1 { color: #fff; font-family: var(--font-title); font-size: clamp(3rem, 6vw, 5.2rem); letter-spacing: -.04em; line-height: .86; margin: 0; }
.hero-metrics { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.hero-metrics span { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.15); border-radius: 999px; color: rgba(255,255,255,.82); font-size: .72rem; padding: 8px 11px; }
.hero-metrics span.alert { background: rgba(255,187,71,.2); border-color: rgba(255,219,143,.35); }
.hero-metrics strong { color: #fff; font-size: .86rem; margin-right: 3px; }
.hero-controls { align-content: center; display: grid; gap: 12px; }
.control-card { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18); border-radius: 19px; display: grid; gap: 6px; padding: 12px 14px; }
.control-card > span:first-child { color: rgba(255,255,255,.68); font-size: .64rem; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
.control-card select,
.control-card input { background: transparent; border: 0; color: #fff; font: inherit; font-weight: 800; min-width: 0; outline: 0; width: 100%; }
.control-card select option { color: #24351d; }
.control-card input::placeholder { color: rgba(255,255,255,.65); }
.control-input { align-items: center; display: grid; gap: 8px; grid-template-columns: 18px minmax(0,1fr); }
.hero-orbit { align-items: center; display: flex; justify-content: center; }
.orbit { border: 1px solid rgba(255,255,255,.18); border-radius: 50%; position: absolute; }
.orbit-a { height: 188px; width: 188px; }
.orbit-b { height: 128px; width: 128px; }
.orbit-core { align-items: center; background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.24); border-radius: 34px; box-shadow: 0 18px 44px rgba(27,60,18,.22); display: flex; height: 92px; justify-content: center; transform: rotate(-6deg); width: 92px; }
.orbit-core :deep(.pa-icon) { height: 2.6rem; width: 2.6rem; }

.signal-grid { display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0,1fr)); }
.signal-grid.compact { grid-template-columns: repeat(3, minmax(0,1fr)); }
.signal-grid button { align-items: center; background: rgba(255,255,255,.91); border: 1px solid var(--line); border-radius: 22px; box-shadow: 0 13px 36px rgba(51,82,37,.07); color: var(--ink); display: grid; gap: 11px; grid-template-columns: 46px minmax(0,1fr) auto; min-height: 82px; padding: 13px; text-align: left; }
.signal-grid button:hover,
.signal-grid button.active { border-color: rgba(87,139,38,.34); box-shadow: 0 17px 42px rgba(51,82,37,.12); transform: translateY(-1px); }
.signal-grid button:disabled { cursor: default; opacity: .65; transform: none; }
.signal-icon { align-items: center; border-radius: 15px; display: inline-flex; height: 46px; justify-content: center; width: 46px; }
.signal-icon.green { background: #e9f3df; color: #4f8028; }
.signal-icon.amber { background: #fff0d0; color: #a96800; }
.signal-icon.coral { background: #fde6df; color: #b85b4e; }
.signal-icon.blue { background: #e1f0f6; color: #397da1; }
.signal-grid small { color: var(--muted); display: block; font-size: .69rem; font-weight: 800; }
.signal-grid strong { font-family: var(--font-title); font-size: 1.42rem; }
.signal-grid i { align-items: center; background: #f4a72f; border-radius: 999px; color: #fff; display: inline-flex; font-size: .68rem; font-style: normal; font-weight: 900; height: 24px; justify-content: center; min-width: 24px; }

.users-workbench { display: grid; gap: 14px; grid-template-columns: minmax(210px, .58fr) minmax(480px, 1.45fr) minmax(300px, .82fr); min-height: 650px; }
.rooms-rail,
.users-list-panel,
.member-detail { background: rgba(255,255,255,.92); border: 1px solid var(--line); border-radius: 27px; box-shadow: 0 20px 54px rgba(51,82,37,.09); min-width: 0; overflow: hidden; }
.rooms-rail,
.member-detail { align-content: start; display: grid; }
.pane-head,
.list-head { align-items: center; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; padding: 19px 20px; }
.pane-head h2,
.list-head h2,
.detail-head h2 { color: var(--ink); font-family: var(--font-title); margin: 3px 0 0; }
.pane-head > span { background: #edf5e4; border-radius: 999px; color: #4f772f; font-size: .72rem; font-weight: 900; padding: 7px 9px; }
.eyebrow { color: #7c8676; }
.room-options { display: grid; gap: 5px; padding: 9px; }
.room-options button { align-items: center; background: transparent; border: 1px solid transparent; border-radius: 18px; color: var(--ink); display: grid; gap: 10px; grid-template-columns: 42px minmax(0,1fr) auto; min-height: 61px; padding: 8px; text-align: left; }
.room-options button:hover { background: #f8faf5; }
.room-options button.active { background: linear-gradient(135deg,#edf5e4,#fff5e2); border-color: rgba(87,139,38,.18); }
.room-options button > span:nth-child(2) { display: grid; gap: 2px; min-width: 0; }
.room-options strong,
.room-options small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.room-options strong { font-size: .84rem; }
.room-options small { color: var(--muted); font-size: .66rem; }
.room-options b { color: #809078; font-size: .72rem; }
.room-mark { align-items: center; background: #eaf3df; border-radius: 14px; color: #4b7b2a; display: inline-flex; font-size: .72rem; font-weight: 900; height: 42px; justify-content: center; width: 42px; }
.room-mark[data-index="1"] { background: #fff0d2; color: #a86b05; }
.room-mark[data-index="2"] { background: #e3f1f6; color: #3b7e9f; }
.room-mark[data-index="3"] { background: #fbe7e1; color: #b45f52; }
.room-mark.all { background: linear-gradient(135deg,#355f24,#8cad3e); color: #fff; }
.room-mark.none { background: #f0f1ed; color: #7a8375; }

.users-list-panel { display: grid; grid-template-rows: auto auto auto minmax(0,1fr); }
.list-head { gap: 12px; }
.filter-chips { display: flex; gap: 5px; }
.filter-chips button { background: #f5f7f2; border: 1px solid transparent; border-radius: 999px; color: #71806b; font-size: .68rem; font-weight: 900; padding: 7px 10px; }
.filter-chips button.active { background: #eaf3df; border-color: rgba(87,139,38,.17); color: #416c27; }
.bulk-bar { align-items: center; background: linear-gradient(135deg,#314f24,#5f8737); color: #fff; display: grid; gap: 8px; grid-template-columns: 30px auto minmax(150px,1fr) auto 34px; margin: 12px 14px 0; padding: 9px 10px; border-radius: 17px; }
.selection-count { align-items: center; background: rgba(255,255,255,.16); border-radius: 10px; display: inline-flex; font-weight: 900; height: 30px; justify-content: center; }
.bulk-bar strong { font-size: .74rem; }
.bulk-bar select { background: rgba(255,255,255,.13); border: 1px solid rgba(255,255,255,.19); border-radius: 11px; color: #fff; min-height: 34px; padding: 0 9px; }
.bulk-bar select option { color: #263f1c; }
.bulk-bar > button:not(.clear-selection) { background: #fff; border: 0; border-radius: 11px; color: #3f6927; font-size: .72rem; font-weight: 900; min-height: 34px; padding: 0 13px; }
.clear-selection { align-items: center; background: transparent; border: 0; color: #fff; display: flex; justify-content: center; }
.table-head { color: #8a9386; display: grid; font-size: .62rem; font-weight: 900; gap: 10px; grid-template-columns: 26px minmax(180px,1fr) minmax(100px,.6fr) 74px 30px; letter-spacing: .08em; padding: 13px 16px 8px; text-transform: uppercase; }
.member-list { align-content: start; display: grid; gap: 5px; overflow: auto; padding: 5px 9px 12px; }
.member-row { align-items: center; border: 1px solid transparent; border-radius: 18px; cursor: pointer; display: grid; gap: 10px; grid-template-columns: 26px 42px minmax(140px,1fr) minmax(110px,.62fr) 76px 30px; min-height: 66px; padding: 7px; }
.member-row:hover { background: #f8faf5; }
.member-row.active { background: linear-gradient(135deg,#f1f7ea,#fff8ea); border-color: rgba(87,139,38,.18); }
.member-row.duplicate { box-shadow: inset 3px 0 0 #efa738; }
.row-check { align-items: center; display: flex; justify-content: center; }
.row-check input,
.table-head input { accent-color: #578b26; height: 16px; width: 16px; }
.member-avatar { align-items: center; background: linear-gradient(135deg,#3f722d,#8baa3f); border-radius: 14px; color: #fff; display: inline-flex; font-size: .72rem; font-weight: 900; height: 42px; justify-content: center; width: 42px; }
.member-copy { display: grid; gap: 2px; min-width: 0; }
.member-copy strong,
.member-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.member-copy strong { color: var(--ink); font-size: .82rem; }
.member-copy small { color: var(--muted); font-size: .67rem; }
.room-pill,
.status-pill { align-items: center; border-radius: 999px; display: inline-flex; font-size: .64rem; font-weight: 900; gap: 5px; justify-self: start; max-width: 100%; padding: 6px 8px; }
.room-pill { background: #edf5e5; color: #49752f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.room-pill.empty { background: #eff1ed; color: #7d8678; }
.room-pill :deep(.pa-icon),
.status-pill :deep(.pa-icon) { height: .85rem; width: .85rem; }
.status-pill.duplicate { background: #fff0d2; color: #a56a07; }
.status-pill.ready { background: #e7f4e0; color: #4a7a2e; }
.member-row > button { align-items: center; background: transparent; border: 0; color: #71806b; display: flex; justify-content: center; }

.member-detail { gap: 0; }
.detail-head { align-items: center; border-bottom: 1px solid var(--line); display: grid; gap: 11px; grid-template-columns: 54px minmax(0,1fr) auto; padding: 19px; }
.detail-avatar { align-items: center; background: linear-gradient(135deg,#294e20,#8cac3e); border-radius: 18px; color: #fff; display: inline-flex; font-size: .85rem; font-weight: 900; height: 54px; justify-content: center; width: 54px; }
.detail-head h2 { font-size: 1.18rem; line-height: 1.05; }
.detail-head small { color: var(--muted); display: block; font-size: .68rem; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.detail-alert { align-items: center; background: #fff0d2; border-radius: 12px; color: #a86c06; display: inline-flex; height: 36px; justify-content: center; width: 36px; }
.identity-grid { display: grid; gap: 8px; grid-template-columns: repeat(2,minmax(0,1fr)); padding: 14px; }
.identity-grid article { background: #f7f9f4; border: 1px solid rgba(66,104,49,.09); border-radius: 15px; display: grid; gap: 4px; min-width: 0; padding: 11px; }
.identity-grid small { color: var(--muted); font-size: .62rem; font-weight: 800; }
.identity-grid strong { color: var(--ink); font-size: .76rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.room-flow { border-top: 1px solid var(--line); display: grid; gap: 14px; padding: 17px 14px; }
.room-flow header { align-items: center; display: flex; justify-content: space-between; }
.room-flow header > div { min-width: 0; }
.room-flow header strong { color: var(--ink); display: block; font-size: .84rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.room-position { align-items: center; background: #edf5e4; border: 1px solid rgba(87,139,38,.12); border-radius: 999px; color: #4d772e; display: inline-flex; font-size: .63rem; font-weight: 900; height: 30px; justify-content: center; min-width: 44px; padding: 0 9px; }
.room-path { display: flex; gap: 4px; overflow-x: auto; padding: 4px 2px 8px; scrollbar-width: thin; }
.room-path button { align-items: center; background: transparent; border: 0; color: #7b8676; display: grid; flex: 0 0 76px; gap: 7px; justify-items: center; min-width: 0; padding: 0; position: relative; }
.room-path button::after { background: #e2e8dd; content: ''; height: 2px; left: calc(50% + 18px); position: absolute; top: 17px; width: calc(100% - 36px); z-index: 0; }
.room-path button:last-child::after { display: none; }
.room-path button.completed::after,
.room-path button.current::after { background: linear-gradient(90deg,#75a43c,#a9bf5c); }
.room-node { align-items: center; background: #f0f3ed; border: 2px solid #dce3d6; border-radius: 13px; color: #819079; display: inline-flex; height: 36px; justify-content: center; position: relative; transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease; width: 36px; z-index: 1; }
.room-node :deep(.pa-icon) { height: .95rem; width: .95rem; }
.room-path button strong { color: #7a8575; font-size: .58rem; line-height: 1.15; max-width: 72px; min-height: 1.35em; overflow: hidden; text-align: center; text-overflow: ellipsis; white-space: nowrap; }
.room-path button:hover .room-node { border-color: rgba(87,139,38,.34); transform: translateY(-2px); }
.room-path button.completed .room-node { background: #edf5e4; border-color: #cfe0bf; color: #658c3a; }
.room-path button.current .room-node { background: linear-gradient(135deg,#4b7b2e,#8cab3e); border-color: transparent; box-shadow: 0 8px 18px rgba(74,119,44,.25); color: #fff; transform: scale(1.08); }
.room-path button.current strong { color: #345322; font-weight: 900; }
.room-path button.selected .room-node { background: #fff3d9; border-color: #efb44b; box-shadow: 0 8px 18px rgba(221,154,39,.18); color: #a66c0c; transform: translateY(-2px); }
.room-path button.selected strong { color: #9d680d; font-weight: 900; }
.room-directions { display: grid; gap: 8px; grid-template-columns: repeat(2,minmax(0,1fr)); }
.room-direction { align-items: center; background: linear-gradient(135deg,#f5f8f1,#fbfcf9); border: 1px solid rgba(66,104,49,.11); border-radius: 15px; color: #456d2d; display: grid; gap: 8px; grid-template-columns: 18px minmax(0,1fr); min-height: 60px; padding: 9px 10px; text-align: left; transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
.room-direction.forward { grid-template-columns: minmax(0,1fr) 18px; text-align: right; }
.room-direction.backward :deep(.pa-icon) { transform: rotate(180deg); }
.room-direction:hover:not(:disabled) { border-color: rgba(87,139,38,.28); box-shadow: 0 10px 22px rgba(51,82,37,.09); transform: translateY(-1px); }
.room-direction:disabled { opacity: .4; }
.room-direction span { display: grid; min-width: 0; }
.room-direction small { color: #899384; font-size: .57rem; font-weight: 800; }
.room-direction strong { color: #3f632b; font-size: .68rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.room-transfer { align-items: center; background: linear-gradient(135deg,#314f24,#5f8737); border-radius: 16px; box-shadow: 0 12px 26px rgba(49,79,36,.19); color: #fff; display: grid; gap: 7px; grid-template-columns: minmax(0,1fr) 18px minmax(0,1fr) 38px; padding: 8px; }
.room-transfer > :deep(.pa-icon) { height: .9rem; opacity: .74; width: .9rem; }
.transfer-room { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.12); border-radius: 11px; font-size: .6rem; font-weight: 900; overflow: hidden; padding: 8px; text-align: center; text-overflow: ellipsis; white-space: nowrap; }
.transfer-room.target { background: rgba(255,255,255,.18); }
.room-transfer button,
.duplicate-card > button { background: linear-gradient(135deg,#4d7b2e,#80a43b); border: 0; border-radius: 13px; color: #fff; font-size: .72rem; font-weight: 900; padding: 0 15px; }
.room-transfer button { align-items: center; background: #fff; color: #416a28; display: inline-flex; height: 38px; justify-content: center; padding: 0; width: 38px; }
.room-transfer button:disabled { opacity: .45; }
.room-transfer-enter-active,
.room-transfer-leave-active { transition: opacity .18s ease, transform .18s ease; }
.room-transfer-enter-from,
.room-transfer-leave-to { opacity: 0; transform: translateY(-5px); }
.duplicate-card { background: linear-gradient(145deg,#fff5df,#f5f8e9); border: 1px solid rgba(205,145,39,.18); border-radius: 20px; display: grid; gap: 10px; margin: 0 14px 14px; padding: 13px; }
.duplicate-card > header { align-items: center; display: grid; gap: 9px; grid-template-columns: 38px minmax(0,1fr); }
.duplicate-card > header > span { align-items: center; background: #f1a936; border-radius: 12px; color: #fff; display: inline-flex; height: 38px; justify-content: center; width: 38px; }
.duplicate-card header strong { color: #754d0d; }
.duplicate-stack { display: grid; gap: 5px; }
.duplicate-stack article { align-items: center; background: rgba(255,255,255,.76); border: 1px solid transparent; border-radius: 13px; display: grid; gap: 8px; grid-template-columns: 31px minmax(0,1fr) auto; padding: 7px; }
.duplicate-stack article.canonical { border-color: rgba(87,139,38,.22); }
.duplicate-stack article > span { align-items: center; background: #e8efdf; border-radius: 10px; color: #50762f; display: inline-flex; font-size: .58rem; font-weight: 900; height: 31px; justify-content: center; width: 31px; }
.duplicate-stack article div { display: grid; min-width: 0; }
.duplicate-stack strong,
.duplicate-stack small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.duplicate-stack strong { font-size: .7rem; }
.duplicate-stack small { color: var(--muted); font-size: .59rem; }
.duplicate-stack i { color: #5c8a34; font-style: normal; }
.duplicate-card > button { min-height: 40px; }

.merge-modal { display: grid; gap: 14px; }
.merge-summary { align-items: center; background: linear-gradient(135deg,#edf5e4,#fff3dc); border: 1px solid rgba(87,139,38,.14); border-radius: 20px; display: grid; gap: 12px; grid-template-columns: 58px minmax(0,1fr); padding: 14px; }
.merge-count { align-items: center; background: linear-gradient(135deg,#3f722d,#8baa3f); border-radius: 17px; color: #fff; display: inline-flex; font-family: var(--font-title); font-size: 1.3rem; height: 58px; justify-content: center; width: 58px; }
.merge-summary div { display: grid; gap: 3px; }
.merge-summary strong { color: var(--ink); font-family: var(--font-title); }
.merge-summary small { color: var(--muted); font-size: .7rem; font-weight: 800; }
.merge-field { display: grid; gap: 6px; }
.merge-field span { color: #667260; font-size: .7rem; font-weight: 900; }
.merge-field select { background: #fff; border: 1px solid var(--line); border-radius: 14px; min-height: 45px; padding: 0 12px; }
.merge-members,
.merge-all-grid { display: grid; gap: 6px; max-height: 280px; overflow: auto; }
.merge-members article,
.merge-all-grid article { align-items: center; background: #f8faf6; border: 1px solid rgba(66,104,49,.09); border-radius: 15px; display: grid; gap: 9px; grid-template-columns: 38px minmax(0,1fr) 22px; padding: 8px; }
.merge-members article.primary { background: #eef6e6; border-color: rgba(87,139,38,.2); }
.merge-members article > span,
.merge-all-grid article > span { align-items: center; background: #e7efe0; border-radius: 12px; color: #4e762f; display: inline-flex; font-size: .65rem; font-weight: 900; height: 38px; justify-content: center; width: 38px; }
.merge-members article div,
.merge-all-grid article div { display: grid; min-width: 0; }
.merge-members strong,
.merge-members small,
.merge-all-grid strong,
.merge-all-grid small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.merge-members strong,
.merge-all-grid strong { color: var(--ink); font-size: .74rem; }
.merge-members small,
.merge-all-grid small { color: var(--muted); font-size: .62rem; }
.merge-members article > :deep(.pa-icon),
.merge-all-grid article > :deep(.pa-icon) { color: #6b8d49; }
.modal-actions { display: flex; gap: 9px; justify-content: flex-end; }

@media (max-width: 1200px) {
  .users-hero { grid-template-columns: minmax(0,1fr) minmax(300px,.8fr); }
  .hero-orbit { display: none; }
  .users-workbench { grid-template-columns: minmax(190px,.55fr) minmax(440px,1.4fr); }
  .member-detail { grid-column: 1 / -1; grid-template-columns: minmax(260px,.75fr) minmax(320px,1fr) minmax(270px,.75fr); }
  .detail-head { border-bottom: 0; }
  .identity-grid { border-left: 1px solid var(--line); border-right: 1px solid var(--line); }
  .room-flow { border-top: 0; }
  .duplicate-card { grid-column: 1 / -1; }
}

@media (max-width: 900px) {
  .users-hero { grid-template-columns: 1fr; }
  .signal-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .users-workbench { grid-template-columns: 1fr; }
  .rooms-rail { max-height: none; }
  .room-options { display: flex; overflow-x: auto; }
  .room-options button { flex: 0 0 190px; }
  .member-detail { grid-column: auto; grid-template-columns: 1fr; }
  .identity-grid { border: 0; }
}

@media (max-width: 720px) {
  .users-hero { border-radius: 27px; padding: 24px 20px; }
  .hero-copy h1 { font-size: 3.3rem; }
  .signal-grid { grid-template-columns: 1fr 1fr; }
  .signal-grid button { grid-template-columns: 42px minmax(0,1fr) auto; min-height: 72px; }
  .signal-icon { height: 42px; width: 42px; }
  .list-head { align-items: flex-start; flex-direction: column; }
  .filter-chips { overflow-x: auto; width: 100%; }
  .table-head { display: none; }
  .member-row { grid-template-columns: 25px 40px minmax(0,1fr) 28px; }
  .member-row .room-pill,
  .member-row .status-pill { grid-column: 3; }
  .member-row > button { grid-column: 4; grid-row: 1 / span 2; }
  .bulk-bar { grid-template-columns: 30px minmax(0,1fr) 34px; }
  .bulk-bar select,
  .bulk-bar > button:not(.clear-selection) { grid-column: 1 / -1; }
  .modal-actions { display: grid; }
}
</style>
