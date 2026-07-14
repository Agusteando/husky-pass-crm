<template>
  <section class="room-users" data-product-area="daycare" data-product-screen="room-users">
    <header class="users-hero">
      <div class="hero-shell">
        <div class="hero-title-block">
          <span class="hero-mark"><FamilyPersonasIcon name="people" /></span>
          <div>
            <p class="eyebrow">Guardería</p>
            <h1>Usuarios</h1>
          </div>
        </div>

        <div class="hero-toolbar">
          <label class="hero-control hero-select">
            <span><FamilyPersonasIcon name="daycare" /></span>
            <select v-model="selectedUnidad" data-diagnostic-filter="unidad-usuarios">
              <option v-for="unidad in overview?.unidades || []" :key="unidad" :value="unidad">{{ unidad }}</option>
            </select>
          </label>

          <label class="hero-control hero-search">
            <span><FamilyPersonasIcon name="search" /></span>
            <input v-model="search" type="search" placeholder="Buscar" />
          </label>

          <button
            v-if="overview?.duplicates.length"
            type="button"
            class="hero-action"
            :disabled="actionBusy"
            @click="openMergeAll"
          >
            <FamilyPersonasIcon name="replace" />
            <strong>{{ overview.stats.duplicateGroups }}</strong>
          </button>
        </div>

        <div class="hero-stats" aria-label="Estado de usuarios">
          <button type="button" :class="['stat-card', { active: filterMode === 'all' }]" @click="setFilter('all')">
            <span class="stat-icon green"><FamilyPersonasIcon name="people" /></span>
            <div>
              <small>Total</small>
              <strong>{{ overview?.stats.total || 0 }}</strong>
            </div>
          </button>

          <button type="button" :class="['stat-card', { active: filterMode === 'duplicates' }]" @click="setFilter('duplicates')">
            <span class="stat-icon amber"><FamilyPersonasIcon name="replace" /></span>
            <div>
              <small>Duplicados</small>
              <strong>{{ overview?.stats.duplicateAccounts || 0 }}</strong>
            </div>
            <b v-if="overview?.stats.duplicateGroups">{{ overview.stats.duplicateGroups }}</b>
          </button>

          <button type="button" :class="['stat-card', { active: filterMode === 'unassigned' }]" @click="setFilter('unassigned')">
            <span class="stat-icon coral"><FamilyPersonasIcon name="alert" /></span>
            <div>
              <small>Sin sala</small>
              <strong>{{ overview?.stats.unassigned || 0 }}</strong>
            </div>
          </button>
        </div>
      </div>
    </header>

    <div v-if="pending" class="state-panel" data-product-loading>
      <HuskyPassLoader label="Usuarios" contained />
    </div>
    <p v-else-if="error" class="surface-message error">No fue posible cargar usuarios.</p>

    <template v-else-if="overview">
      <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
      <p v-if="actionNotice" class="surface-message">{{ actionNotice }}</p>

      <section class="workspace-shell">
        <aside class="rooms-panel" data-product-panel="room-filter">
          <header class="pane-head">
            <div>
              <p class="eyebrow">Salas</p>
              <h2>{{ overview.unidad }}</h2>
            </div>
            <span>{{ overview.salas.length }}</span>
          </header>

          <div class="room-strip">
            <button type="button" :class="['room-tile', { active: selectedRoomKey === 'all' }]" @click="selectRoom('all')">
              <span class="room-glyph all"><FamilyPersonasIcon name="people" /></span>
              <div>
                <strong>Todas</strong>
                <small>{{ overview.stats.total }}</small>
              </div>
            </button>

            <button
              v-for="(sala, index) in overview.salas"
              :key="sala.id"
              type="button"
              :class="['room-tile', { active: selectedRoomKey === String(sala.id) }]"
              @click="selectRoom(String(sala.id))"
            >
              <span class="room-glyph" :data-index="index % 4">{{ initials(sala.sala) }}</span>
              <div>
                <strong>{{ sala.sala }}</strong>
                <small>{{ roomCount(sala.id) }}</small>
              </div>
            </button>

            <button type="button" :class="['room-tile', { active: selectedRoomKey === 'none' }]" @click="selectRoom('none')">
              <span class="room-glyph none"><FamilyPersonasIcon name="alert" /></span>
              <div>
                <strong>Sin sala</strong>
                <small>{{ overview.stats.unassigned }}</small>
              </div>
            </button>
          </div>
        </aside>

        <main class="roster-panel" data-product-panel="users-list">
          <header class="roster-head">
            <div>
              <p class="eyebrow">{{ roomHeading }}</p>
              <h2>{{ filteredMembers.length }}</h2>
            </div>

            <div class="roster-filters" aria-label="Filtros de usuarios">
              <button type="button" :class="{ active: filterMode === 'all' }" @click="setFilter('all')">Todos</button>
              <button type="button" :class="{ active: filterMode === 'duplicates' }" @click="setFilter('duplicates')">Duplicados</button>
              <button type="button" :class="{ active: filterMode === 'unassigned' }" @click="setFilter('unassigned')">Sin sala</button>
            </div>
          </header>

          <section class="selection-dock">
            <label class="select-all-toggle">
              <input
                type="checkbox"
                :checked="allVisibleSelected"
                :indeterminate.prop="someVisibleSelected"
                @change="toggleAllVisible"
              />
              <span>{{ selectedIds.length || filteredMembers.length }}</span>
            </label>

            <div v-if="selectedIds.length" class="bulk-dock">
              <div class="room-targets compact">
                <button
                  v-for="sala in overview.salas"
                  :key="sala.id"
                  type="button"
                  :class="{ active: bulkTargetSalaId === sala.id }"
                  @click="bulkTargetSalaId = sala.id"
                >
                  {{ sala.sala }}
                </button>
              </div>
              <button type="button" class="bulk-commit" :disabled="!bulkTargetSalaId || actionBusy" @click="moveSelected">
                <FamilyPersonasIcon name="arrow" />
              </button>
              <button class="bulk-clear" type="button" aria-label="Limpiar selección" @click="clearSelection">
                <FamilyPersonasIcon name="close" />
              </button>
            </div>
          </section>

          <div v-if="filteredMembers.length" class="member-list" role="list">
            <article
              v-for="member in filteredMembers"
              :key="member.id"
              class="member-card"
              :class="{ active: selectedMember?.id === member.id, duplicate: Boolean(member.duplicateGroupKey) }"
              role="listitem"
              @click="selectMember(member.id)"
            >
              <label class="member-check" @click.stop>
                <input type="checkbox" :checked="selectedIds.includes(member.id)" @change="toggleMember(member.id)" />
              </label>

              <span class="member-avatar">{{ initials(member.nombre_nino || member.email || member.username) }}</span>

              <div class="member-main">
                <div class="member-copy">
                  <strong>{{ member.nombre_nino || accountLabel(member) }}</strong>
                  <small>{{ member.email || member.username }}</small>
                </div>

                <div class="member-meta">
                  <span class="room-pill" :class="{ empty: !member.salaId }">
                    <FamilyPersonasIcon name="daycare" />
                    {{ member.salaName || 'Sin sala' }}
                  </span>

                  <span class="mini-pill">
                    <FamilyPersonasIcon name="people" />
                    {{ member.authorizedPeople }}
                  </span>

                  <span class="mini-pill">
                    <FamilyPersonasIcon name="badge" />
                    {{ member.linkedStudents }}
                  </span>
                </div>
              </div>

              <div class="member-side">
                <span v-if="member.duplicateGroupKey" class="status-badge duplicate">
                  <FamilyPersonasIcon name="replace" />
                  {{ member.duplicateCount }}
                </span>
                <span v-else class="status-badge ready">
                  <FamilyPersonasIcon name="check" />
                </span>
                <button type="button" aria-label="Abrir usuario" @click.stop="selectMember(member.id)">
                  <FamilyPersonasIcon name="arrow" />
                </button>
              </div>
            </article>
          </div>

          <EmptyState v-else title="Sin coincidencias" />
        </main>

        <aside class="studio-panel" data-product-panel="user-detail">
          <template v-if="selectedMember">
            <section class="studio-card identity-card">
              <header class="identity-head">
                <span class="identity-avatar">{{ initials(selectedMember.nombre_nino || selectedMember.email) }}</span>
                <div>
                  <p class="eyebrow">U-{{ selectedMember.id }}</p>
                  <h2>{{ selectedMember.nombre_nino || accountLabel(selectedMember) }}</h2>
                  <small>{{ selectedMember.email || selectedMember.username }}</small>
                </div>
                <span v-if="selectedMember.duplicateGroupKey" class="identity-flag"><FamilyPersonasIcon name="replace" /></span>
              </header>

              <div class="identity-grid">
                <article>
                  <small>Usuario</small>
                  <strong>{{ selectedMember.username || '—' }}</strong>
                </article>
                <article>
                  <small>Acceso</small>
                  <strong>{{ selectedMember.plaintext ? 'OK' : '—' }}</strong>
                </article>
                <article>
                  <small>Personas</small>
                  <strong>{{ selectedMember.authorizedPeople }}</strong>
                </article>
                <article>
                  <small>Alumnos</small>
                  <strong>{{ selectedMember.linkedStudents }}</strong>
                </article>
              </div>
            </section>

            <section class="studio-card journey-card">
              <header class="journey-head">
                <div>
                  <p class="eyebrow">Sala</p>
                  <strong>{{ selectedMember.salaName || 'Sin sala' }}</strong>
                </div>
                <span class="journey-step">{{ currentRoomPosition }}</span>
              </header>

              <div class="journey-actions">
                <button type="button" class="journey-move" :disabled="!previousRoom || actionBusy" @click="moveMemberTo(previousRoom?.id)">
                  <FamilyPersonasIcon name="arrow" />
                  <div>
                    <small>Regresar</small>
                    <strong>{{ previousRoom?.sala || '—' }}</strong>
                  </div>
                </button>

                <div class="journey-current">
                  <span>{{ initials(selectedMember.salaName || 'Sin sala') }}</span>
                  <strong>{{ selectedMember.salaName || 'Sin sala' }}</strong>
                </div>

                <button type="button" class="journey-move forward" :disabled="!nextRoom || actionBusy" @click="moveMemberTo(nextRoom?.id)">
                  <div>
                    <small>Promover</small>
                    <strong>{{ nextRoom?.sala || '—' }}</strong>
                  </div>
                  <FamilyPersonasIcon name="arrow" />
                </button>
              </div>

              <div class="room-targets">
                <button
                  v-for="sala in overview.salas"
                  :key="sala.id"
                  type="button"
                  :class="{ active: detailTargetSalaId === sala.id, current: selectedMember.salaId === sala.id }"
                  @click="detailTargetSalaId = sala.id"
                >
                  {{ sala.sala }}
                </button>
              </div>

              <button
                type="button"
                class="primary-cta"
                :disabled="!detailTargetSalaId || detailTargetSalaId === selectedMember.salaId || actionBusy"
                @click="moveMemberTo(detailTargetSalaId)"
              >
                <FamilyPersonasIcon name="arrow" />
                <span>{{ overview.salas.find((sala) => sala.id === detailTargetSalaId)?.sala || 'Mover' }}</span>
              </button>
            </section>

            <section v-if="selectedDuplicateGroup" class="studio-card merge-card">
              <header class="merge-head">
                <div class="merge-avatars">
                  <span v-for="member in selectedDuplicateGroup.members.slice(0, 3)" :key="member.id">{{ initials(member.nombre_nino || member.email) }}</span>
                </div>
                <button type="button" class="merge-open" :disabled="actionBusy" @click="openMerge(selectedDuplicateGroup)">
                  <FamilyPersonasIcon name="replace" />
                </button>
              </header>

              <div class="merge-stack">
                <article
                  v-for="member in selectedDuplicateGroup.members"
                  :key="member.id"
                  :class="{ canonical: member.id === selectedDuplicateGroup.canonicalId }"
                >
                  <span>{{ initials(member.nombre_nino || member.email) }}</span>
                  <div>
                    <strong>{{ member.nombre_nino || accountLabel(member) }}</strong>
                    <small>{{ member.salaName || 'Sin sala' }}</small>
                  </div>
                  <i v-if="member.id === selectedDuplicateGroup.canonicalId"><FamilyPersonasIcon name="check" /></i>
                </article>
              </div>
            </section>
          </template>

          <EmptyState v-else title="Selecciona un usuario" />
        </aside>
      </section>
    </template>

    <AdminModal
      v-if="mergeDialog"
      title="Consolidar"
      eyebrow="Usuarios"
      :description="mergeDialog.members.map((member) => member.salaName || 'Sin sala').join(' · ')"
      :close-disabled="actionBusy"
      @close="closeMergeDialog"
    >
      <section class="merge-modal">
        <div class="merge-counter">
          <span>{{ mergeDialog.members.length }}</span>
          <small>{{ mergeDialog.matchBy.map(matchLabel).join(' + ') }}</small>
        </div>

        <div class="merge-choice-grid">
          <button
            v-for="member in mergeDialog.members"
            :key="member.id"
            type="button"
            :class="['merge-member-card', { primary: member.id === mergeCanonicalId }]"
            @click="mergeCanonicalId = member.id"
          >
            <span>{{ initials(member.nombre_nino || member.email) }}</span>
            <div>
              <strong>{{ member.nombre_nino || accountLabel(member) }}</strong>
              <small>{{ member.email || member.username }}</small>
              <small>{{ member.salaName || 'Sin sala' }}</small>
            </div>
            <i>
              <FamilyPersonasIcon :name="member.id === mergeCanonicalId ? 'check' : 'replace'" />
            </i>
          </button>
        </div>

        <div class="room-targets merge-targets">
          <button
            v-for="sala in overview?.salas || []"
            :key="sala.id"
            type="button"
            :class="{ active: mergeTargetSalaId === sala.id }"
            @click="mergeTargetSalaId = sala.id"
          >
            {{ sala.sala }}
          </button>
        </div>

        <footer class="modal-actions split">
          <button class="btn btn-secondary" type="button" :disabled="actionBusy" @click="closeMergeDialog">Cancelar</button>
          <button class="btn btn-primary" type="button" :disabled="!mergeTargetSalaId || actionBusy" @click="confirmMerge">
            {{ actionBusy ? 'Consolidando…' : 'Consolidar' }}
          </button>
        </footer>
      </section>
    </AdminModal>

    <AdminModal
      v-if="mergeAllDialog"
      title="Coincidencias"
      eyebrow="Usuarios"
      :description="`${overview?.duplicates.length || 0}`"
      :close-disabled="actionBusy"
      @close="mergeAllDialog = false"
    >
      <section class="merge-modal">
        <div class="merge-all-grid">
          <article v-for="group in overview?.duplicates || []" :key="group.key">
            <span>{{ group.members.length }}</span>
            <div>
              <strong>{{ group.members[0]?.email || group.members[0]?.username }}</strong>
              <small>{{ group.members.map((member) => member.salaName || 'Sin sala').join(' · ') }}</small>
            </div>
            <FamilyPersonasIcon name="replace" />
          </article>
        </div>

        <footer class="modal-actions split">
          <button class="btn btn-secondary" type="button" :disabled="actionBusy" @click="mergeAllDialog = false">Cancelar</button>
          <button class="btn btn-primary" type="button" :disabled="actionBusy" @click="confirmMergeAll">
            {{ actionBusy ? 'Consolidando…' : 'Consolidar' }}
          </button>
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
  --ink: #22361c;
  --muted: #6d7867;
  --green: #578b26;
  --green-deep: #294e20;
  --line: rgba(66, 104, 49, 0.13);
  --panel: #ffffff;
  --panel-soft: #f7faf4;
  display: grid;
  gap: clamp(16px, 2.1vw, 24px);
}

.users-hero {
  background:
    radial-gradient(circle at 8% 12%, rgba(255, 209, 95, 0.2), transparent 26%),
    radial-gradient(circle at 88% 12%, rgba(200, 234, 122, 0.22), transparent 30%),
    linear-gradient(135deg, #21411d 0%, #41712b 54%, #86aa3a 100%);
  border-radius: 32px;
  box-shadow: 0 28px 80px rgba(45, 81, 34, 0.28);
  color: #fff;
  overflow: hidden;
  padding: clamp(22px, 3vw, 34px);
}

.hero-shell {
  display: grid;
  gap: 18px;
}

.hero-title-block {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: 74px minmax(0, 1fr);
}

.hero-mark {
  align-items: center;
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,.08));
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 24px;
  display: inline-flex;
  height: 74px;
  justify-content: center;
  width: 74px;
}

.hero-mark :deep(.pa-icon) {
  height: 1.7rem;
  width: 1.7rem;
}

.hero-title-block h1,
.hero-title-block p { margin: 0; }
.hero-title-block h1 {
  color: #fff;
  font-size: clamp(2.2rem, 5vw, 4rem);
  letter-spacing: -0.05em;
  line-height: .9;
}

.hero-toolbar {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(170px, 220px) minmax(0, 1fr) auto;
}

.hero-control,
.hero-action {
  align-items: center;
  backdrop-filter: blur(12px);
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 18px;
  display: flex;
  gap: 10px;
  min-height: 56px;
  padding: 0 14px;
}

.hero-control > span,
.hero-action {
  color: rgba(255,255,255,.9);
}

.hero-control select,
.hero-control input {
  appearance: none;
  background: transparent;
  border: 0;
  color: #fff;
  flex: 1;
  font-size: .95rem;
  font-weight: 700;
  min-width: 0;
  outline: none;
}

.hero-control select option { color: #16301a; }
.hero-control input::placeholder { color: rgba(255,255,255,.7); }

.hero-action {
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  min-width: 74px;
  padding: 0 16px;
}

.hero-action strong {
  color: #fff;
  font-size: 1rem;
}

.hero-stats {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card {
  align-items: center;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 22px;
  color: #fff;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 50px minmax(0, 1fr) auto;
  min-height: 92px;
  padding: 14px;
  text-align: left;
  transition: transform .18s ease, background .18s ease, border-color .18s ease;
}

.stat-card:hover,
.stat-card.active {
  background: rgba(255,255,255,.18);
  border-color: rgba(255,255,255,.28);
  transform: translateY(-1px);
}

.stat-card div { display: grid; gap: 2px; }
.stat-card small { color: rgba(255,255,255,.74); font-size: .74rem; font-weight: 800; }
.stat-card strong { color: #fff; font-size: 1.4rem; line-height: 1; }
.stat-card b {
  align-items: center;
  background: rgba(18, 36, 18, 0.24);
  border-radius: 999px;
  display: inline-flex;
  font-size: .72rem;
  font-weight: 900;
  height: 28px;
  justify-content: center;
  min-width: 28px;
  padding: 0 9px;
}

.stat-icon {
  align-items: center;
  border-radius: 18px;
  color: #fff;
  display: inline-flex;
  height: 50px;
  justify-content: center;
  width: 50px;
}

.stat-icon.green { background: rgba(103, 178, 66, .28); }
.stat-icon.amber { background: rgba(245, 187, 62, .28); }
.stat-icon.coral { background: rgba(241, 125, 98, .28); }

.surface-message {
  background: #fff;
  border: 1px solid rgba(87, 139, 38, 0.12);
  border-radius: 18px;
  box-shadow: 0 14px 32px rgba(32, 54, 25, 0.08);
  color: var(--ink);
  font-size: .92rem;
  font-weight: 800;
  margin: 0;
  padding: 14px 16px;
}

.surface-message.error {
  background: #fff4f3;
  border-color: rgba(197, 73, 54, 0.14);
  color: #9a3d32;
}

.state-panel,
.rooms-panel,
.roster-panel,
.studio-panel,
.studio-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 26px;
  box-shadow: 0 18px 44px rgba(40, 65, 32, 0.08);
}

.state-panel {
  min-height: 340px;
  padding: 18px;
}

.workspace-shell {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(240px, .72fr) minmax(380px, 1.15fr) minmax(320px, .92fr);
  align-items: start;
}

.rooms-panel,
.roster-panel,
.studio-panel {
  overflow: hidden;
}

.rooms-panel,
.studio-panel {
  position: sticky;
  top: 18px;
}

.pane-head,
.roster-head,
.identity-head,
.journey-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.pane-head,
.roster-head {
  border-bottom: 1px solid var(--line);
  padding: 18px;
}

.pane-head h2,
.roster-head h2,
.identity-head h2 { margin: 0; }
.pane-head h2,
.identity-head h2 { font-size: 1.18rem; }
.roster-head h2 { font-size: 2rem; line-height: .9; }
.pane-head span {
  align-items: center;
  background: #eff6e7;
  border-radius: 999px;
  color: var(--green);
  display: inline-flex;
  font-size: .78rem;
  font-weight: 900;
  height: 34px;
  justify-content: center;
  min-width: 34px;
  padding: 0 10px;
}

.eyebrow {
  color: #72806b;
  font-size: .69rem;
  font-weight: 900;
  letter-spacing: .14em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.room-strip {
  display: grid;
  gap: 10px;
  max-height: calc(100dvh - 240px);
  overflow: auto;
  padding: 14px;
}

.room-tile {
  align-items: center;
  background: var(--panel-soft);
  border: 1px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: 46px minmax(0, 1fr);
  min-height: 70px;
  padding: 12px;
  text-align: left;
  transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease, background .16s ease;
}

.room-tile:hover,
.room-tile.active {
  background: #fff;
  border-color: rgba(87, 139, 38, 0.22);
  box-shadow: 0 14px 26px rgba(65, 103, 50, 0.12);
  transform: translateY(-1px);
}

.room-tile div { display: flex; align-items: center; gap: 8px; justify-content: space-between; min-width: 0; }
.room-tile strong,
.room-tile small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.room-tile strong { color: var(--ink); font-size: .82rem; }
.room-tile small {
  align-items: center;
  background: #edf3e5;
  border-radius: 999px;
  color: var(--green);
  display: inline-flex;
  font-size: .68rem;
  font-weight: 900;
  height: 26px;
  justify-content: center;
  min-width: 26px;
  padding: 0 8px;
}

.room-glyph {
  align-items: center;
  background: linear-gradient(135deg, #2d5b23, #88a93c);
  border-radius: 16px;
  color: #fff;
  display: inline-flex;
  font-size: .7rem;
  font-weight: 900;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.room-glyph[data-index='1'] { background: linear-gradient(135deg, #6b812f, #b3b34b); }
.room-glyph[data-index='2'] { background: linear-gradient(135deg, #486823, #5ea861); }
.room-glyph[data-index='3'] { background: linear-gradient(135deg, #476c64, #64a699); }
.room-glyph.all { background: linear-gradient(135deg, #2b4720, #547f2f); }
.room-glyph.none { background: linear-gradient(135deg, #8d7e62, #b8a98b); }

.roster-panel { display: grid; }

.roster-head {
  gap: 14px;
  flex-wrap: wrap;
}

.roster-filters {
  background: #f5f8f1;
  border: 1px solid rgba(66, 104, 49, 0.08);
  border-radius: 18px;
  display: inline-flex;
  gap: 6px;
  padding: 5px;
}

.roster-filters button {
  background: transparent;
  border: 0;
  border-radius: 13px;
  color: #6f7b69;
  font-size: .74rem;
  font-weight: 900;
  min-height: 38px;
  padding: 0 12px;
}

.roster-filters button.active {
  background: #fff;
  box-shadow: 0 8px 18px rgba(31, 53, 25, 0.08);
  color: var(--green-deep);
}

.selection-dock {
  align-items: center;
  border-bottom: 1px solid var(--line);
  display: grid;
  gap: 12px;
  grid-template-columns: auto minmax(0, 1fr);
  padding: 14px 18px;
}

.select-all-toggle {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
}

.select-all-toggle input {
  accent-color: var(--green);
  block-size: 18px;
  inline-size: 18px;
}

.select-all-toggle span {
  align-items: center;
  background: #edf3e6;
  border-radius: 999px;
  color: var(--green);
  display: inline-flex;
  font-size: .76rem;
  font-weight: 900;
  height: 34px;
  justify-content: center;
  min-width: 34px;
  padding: 0 11px;
}

.bulk-dock {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto auto;
}

.bulk-commit,
.bulk-clear,
.primary-cta,
.merge-open {
  align-items: center;
  border: 0;
  border-radius: 16px;
  color: #fff;
  display: inline-flex;
  font-weight: 900;
  justify-content: center;
}

.bulk-commit,
.primary-cta {
  background: linear-gradient(135deg, #4d7b2e, #85a93c);
  box-shadow: 0 16px 30px rgba(81, 129, 44, 0.25);
}

.bulk-commit,
.bulk-clear,
.merge-open { height: 46px; width: 46px; }
.bulk-clear {
  background: #eef2eb;
  color: #677361;
}

.member-list {
  display: grid;
  gap: 12px;
  max-height: calc(100dvh - 320px);
  overflow: auto;
  padding: 18px;
}

.member-card {
  align-items: center;
  background: #fbfcfa;
  border: 1px solid rgba(66, 104, 49, 0.08);
  border-radius: 24px;
  cursor: pointer;
  display: grid;
  gap: 14px;
  grid-template-columns: 22px 52px minmax(0, 1fr) auto;
  padding: 14px;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease;
}

.member-card:hover,
.member-card.active {
  background: #fff;
  border-color: rgba(87, 139, 38, 0.22);
  box-shadow: 0 18px 30px rgba(38, 61, 28, 0.1);
  transform: translateY(-1px);
}

.member-card.duplicate {
  background: linear-gradient(135deg, #fffdf7, #fbfcfa);
}

.member-check input {
  accent-color: var(--green);
  block-size: 18px;
  inline-size: 18px;
}

.member-avatar,
.identity-avatar {
  align-items: center;
  background: linear-gradient(135deg, #294e20, #8cab3e);
  border-radius: 18px;
  color: #fff;
  display: inline-flex;
  font-size: .82rem;
  font-weight: 900;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.member-main {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.member-copy { display: grid; gap: 3px; }
.member-copy strong,
.member-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.member-copy strong { color: var(--ink); font-size: .87rem; }
.member-copy small { color: var(--muted); font-size: .68rem; }

.member-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.room-pill,
.mini-pill,
.status-badge {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: .66rem;
  font-weight: 900;
  gap: 5px;
  max-width: 100%;
  padding: 6px 9px;
}

.room-pill {
  background: #edf5e5;
  color: #48702f;
}

.room-pill.empty {
  background: #eff1ed;
  color: #7c8676;
}

.mini-pill {
  background: #f3f6ef;
  color: #62715b;
}

.room-pill :deep(.pa-icon),
.mini-pill :deep(.pa-icon),
.status-badge :deep(.pa-icon) {
  height: .88rem;
  width: .88rem;
}

.member-side {
  align-items: end;
  display: grid;
  gap: 10px;
  justify-items: end;
}

.status-badge.ready {
  background: #e7f4e0;
  color: #4e772f;
}

.status-badge.duplicate {
  background: #fff0d2;
  color: #a56a07;
}

.member-side button {
  align-items: center;
  background: #f2f5ef;
  border: 0;
  border-radius: 14px;
  color: #6d7967;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.studio-panel {
  display: grid;
  gap: 14px;
  padding: 14px;
}

.studio-card {
  box-shadow: none;
  display: grid;
  overflow: hidden;
}

.identity-card,
.journey-card,
.merge-card {
  background: linear-gradient(180deg, #ffffff, #fbfcf8);
}

.identity-head {
  gap: 12px;
  padding: 18px;
}

.identity-head > div {
  flex: 1;
  min-width: 0;
}

.identity-head small {
  color: var(--muted);
  display: block;
  font-size: .7rem;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.identity-flag {
  align-items: center;
  background: #fff0d2;
  border-radius: 14px;
  color: #a56a07;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.identity-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0 18px 18px;
}

.identity-grid article {
  background: #f6f8f3;
  border: 1px solid rgba(66, 104, 49, 0.08);
  border-radius: 18px;
  display: grid;
  gap: 4px;
  padding: 12px;
}

.identity-grid small { color: var(--muted); font-size: .62rem; font-weight: 800; }
.identity-grid strong { color: var(--ink); font-size: .78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.journey-card {
  gap: 14px;
  padding: 18px;
}

.journey-step {
  align-items: center;
  background: #eff5e8;
  border-radius: 999px;
  color: var(--green);
  display: inline-flex;
  font-size: .74rem;
  font-weight: 900;
  height: 34px;
  justify-content: center;
  min-width: 48px;
  padding: 0 12px;
}

.journey-actions {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) 110px minmax(0, 1fr);
}

.journey-move,
.journey-current {
  border-radius: 20px;
  min-height: 102px;
}

.journey-move {
  align-items: center;
  background: #f5f8f1;
  border: 1px solid rgba(66, 104, 49, 0.1);
  color: #446c2d;
  display: grid;
  gap: 10px;
  grid-template-columns: 18px minmax(0, 1fr);
  padding: 14px;
  text-align: left;
}

.journey-move.forward {
  grid-template-columns: minmax(0, 1fr) 18px;
  text-align: right;
}

.journey-move:first-child :deep(.pa-icon) { transform: rotate(180deg); }
.journey-move:disabled { opacity: .42; }
.journey-move div,
.journey-current { min-width: 0; }
.journey-move small { color: #8a9585; font-size: .6rem; font-weight: 800; }
.journey-move strong { color: var(--ink); font-size: .72rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.journey-current {
  align-content: center;
  background: linear-gradient(135deg, #3b6929, #88aa3e);
  box-shadow: 0 18px 32px rgba(78, 120, 45, 0.24);
  color: #fff;
  display: grid;
  justify-items: center;
  padding: 12px 8px;
  text-align: center;
}

.journey-current span {
  align-items: center;
  background: rgba(255,255,255,.16);
  border-radius: 15px;
  display: inline-flex;
  font-size: .68rem;
  font-weight: 900;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.journey-current strong {
  font-size: .72rem;
  line-height: 1.2;
  margin-top: 8px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-targets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.room-targets button {
  background: #f3f6ef;
  border: 1px solid transparent;
  border-radius: 14px;
  color: #5f6d59;
  font-size: .74rem;
  font-weight: 900;
  min-height: 40px;
  padding: 0 13px;
  transition: background .16s ease, border-color .16s ease, color .16s ease, transform .16s ease;
}

.room-targets button:hover,
.room-targets button.active {
  background: #fff;
  border-color: rgba(87, 139, 38, 0.22);
  color: var(--green-deep);
  transform: translateY(-1px);
}

.room-targets button.current {
  background: #edf5e5;
  color: #4d7b2e;
}

.room-targets.compact button {
  min-height: 36px;
  padding: 0 11px;
}

.primary-cta {
  gap: 10px;
  min-height: 52px;
  padding: 0 18px;
  width: 100%;
}

.primary-cta:disabled,
.bulk-commit:disabled,
.merge-open:disabled {
  opacity: .45;
}

.merge-card {
  gap: 14px;
  padding: 18px;
}

.merge-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.merge-avatars {
  display: flex;
  padding-left: 8px;
}

.merge-avatars span,
.merge-stack article > span,
.merge-member-card > span,
.merge-counter span {
  align-items: center;
  background: linear-gradient(135deg, #294e20, #8cab3e);
  border-radius: 15px;
  color: #fff;
  display: inline-flex;
  font-size: .66rem;
  font-weight: 900;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.merge-avatars span + span { margin-left: -10px; }
.merge-open { background: linear-gradient(135deg, #f0b241, #e58d2b); }

.merge-stack {
  display: grid;
  gap: 8px;
}

.merge-stack article,
.merge-all-grid article,
.merge-member-card {
  align-items: center;
  background: #f8faf6;
  border: 1px solid rgba(66, 104, 49, 0.08);
  border-radius: 18px;
  display: grid;
  gap: 10px;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  padding: 10px;
}

.merge-stack article.canonical,
.merge-member-card.primary {
  background: #eef6e6;
  border-color: rgba(87, 139, 38, 0.22);
}

.merge-stack article div,
.merge-all-grid article div,
.merge-member-card div {
  display: grid;
  min-width: 0;
}

.merge-stack strong,
.merge-stack small,
.merge-all-grid strong,
.merge-all-grid small,
.merge-member-card strong,
.merge-member-card small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merge-stack strong,
.merge-all-grid strong,
.merge-member-card strong { color: var(--ink); font-size: .75rem; }
.merge-stack small,
.merge-all-grid small,
.merge-member-card small { color: var(--muted); font-size: .62rem; }
.merge-stack i,
.merge-member-card i {
  color: #5f8737;
  display: inline-flex;
}

.merge-modal {
  display: grid;
  gap: 16px;
}

.merge-counter {
  align-items: center;
  background: linear-gradient(135deg, #edf5e4, #fff3dc);
  border: 1px solid rgba(87, 139, 38, 0.14);
  border-radius: 22px;
  display: flex;
  gap: 12px;
  padding: 14px;
}

.merge-counter small {
  color: var(--muted);
  font-size: .72rem;
  font-weight: 900;
}

.merge-choice-grid,
.merge-all-grid {
  display: grid;
  gap: 10px;
  max-height: 320px;
  overflow: auto;
}

.merge-member-card {
  cursor: pointer;
  text-align: left;
}

.merge-targets {
  padding-top: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-actions.split > * { flex: 1; }

@media (max-width: 1260px) {
  .workspace-shell {
    grid-template-columns: minmax(220px, .7fr) minmax(360px, 1fr);
  }

  .studio-panel {
    grid-column: 1 / -1;
    position: static;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .hero-toolbar,
  .hero-stats,
  .workspace-shell,
  .studio-panel,
  .journey-actions {
    grid-template-columns: 1fr;
  }

  .rooms-panel,
  .studio-panel {
    position: static;
  }

  .room-strip {
    display: flex;
    gap: 10px;
    max-height: none;
    overflow-x: auto;
  }

  .room-tile {
    flex: 0 0 190px;
  }

  .roster-head {
    align-items: start;
    flex-direction: column;
  }

  .selection-dock,
  .bulk-dock {
    grid-template-columns: 1fr;
  }

  .merge-head {
    gap: 12px;
  }
}

@media (max-width: 720px) {
  .users-hero {
    border-radius: 26px;
    padding: 20px;
  }

  .hero-title-block {
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .hero-mark {
    border-radius: 20px;
    height: 58px;
    width: 58px;
  }

  .hero-mark :deep(.pa-icon) {
    height: 1.35rem;
    width: 1.35rem;
  }

  .hero-title-block h1 {
    font-size: 2.8rem;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    min-height: 82px;
  }

  .rooms-panel,
  .roster-panel,
  .studio-panel,
  .studio-card {
    border-radius: 22px;
  }

  .member-list {
    max-height: none;
    padding: 14px;
  }

  .member-card {
    grid-template-columns: 22px 44px minmax(0, 1fr);
  }

  .member-avatar {
    border-radius: 15px;
    height: 44px;
    width: 44px;
  }

  .member-side {
    grid-column: 2 / -1;
    grid-template-columns: auto auto;
    justify-content: space-between;
    justify-items: stretch;
  }

  .member-side button,
  .status-badge {
    justify-content: center;
  }

  .identity-grid {
    grid-template-columns: 1fr 1fr;
  }

  .merge-member-card,
  .merge-stack article,
  .merge-all-grid article {
    grid-template-columns: 34px minmax(0, 1fr) 18px;
  }

  .modal-actions {
    display: grid;
  }
}
</style>
