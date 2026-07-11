<template>
  <section class="daycare-console" data-product-area="daycare" data-product-screen="rooms-console">
    <template v-if="clientReady">
      <header class="command-hero">
        <div class="hero-copy">
          <p class="hero-kicker">Husky Pass · Guardería</p>
          <h1>{{ selectedUnidad || 'Salas' }}</h1>
          <div class="hero-metrics" aria-label="Resumen de unidad">
            <span><strong>{{ filteredSalas.length }}</strong> salas</span>
            <span><strong>{{ unitMetrics.familias }}</strong> familias</span>
            <span><strong>{{ unitMetrics.publicaciones }}</strong> publicaciones</span>
          </div>
        </div>

        <div class="hero-controls">
          <label class="control-card">
            <span>Unidad</span>
            <select v-model="selectedUnidad" data-diagnostic-filter="unidad" @change="syncUnidad">
              <option v-for="unidad in unidades" :key="unidad" :value="unidad">{{ unidad }}</option>
            </select>
          </label>
          <label class="control-card search-control">
            <span>Buscar sala</span>
            <span class="control-input"><FamilyPersonasIcon name="search" /><input v-model="search" type="search" placeholder="Nombre de sala" data-diagnostic-filter="buscar-sala" /></span>
          </label>
        </div>

        <div class="hero-art" aria-hidden="true">
          <span class="art-orbit orbit-one" />
          <span class="art-orbit orbit-two" />
          <img :src="sunnyHero" alt="" />
        </div>
      </header>

      <section v-if="noUnidadAvailable" class="state-panel" data-product-panel="daycare-unidades" data-state="unavailable">
        <img :src="sunnyEmpty" alt="" />
        <h2>Unidad pendiente</h2>
      </section>

      <p v-if="error" class="surface-message error">No fue posible cargar salas.</p>
      <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
      <p v-if="actionNotice" class="surface-message">{{ actionNotice }}</p>
      <div v-if="pending || unitsPending" class="state-panel" data-product-loading>
        <HuskyPassLoader label="Salas" contained />
      </div>

      <section v-else-if="!noUnidadAvailable" class="rooms-workbench">
        <aside class="rooms-pane" data-product-panel="salas-list" :data-state="filteredSalas.length ? 'content' : 'empty'">
          <header class="pane-title">
            <div>
              <p class="eyebrow">Salas</p>
              <h2>{{ filteredSalas.length }} disponibles</h2>
            </div>
            <span class="pane-count">{{ selectedUnidad }}</span>
          </header>

          <div v-if="filteredSalas.length" class="room-list" role="list">
            <button
              v-for="sala in filteredSalas"
              :key="sala.id"
              class="room-row"
              :class="{ active: sala.id === selectedSalaId }"
              type="button"
              data-diagnostic-sala-option
              :data-sala-id="String(sala.id)"
              :aria-pressed="sala.id === selectedSalaId"
              @click="selectSala(sala.id)"
            >
              <span class="room-avatar">{{ roomInitials(sala.sala) }}</span>
              <span class="room-copy">
                <strong>{{ sala.sala }}</strong>
                <small>{{ sala.metrics.familias }} familias</small>
              </span>
              <span class="room-publications">{{ sala.metrics.totalRecursos }}</span>
            </button>
          </div>
          <div v-else class="state-panel compact" data-diagnostic="sala-unavailable" data-state="empty">
            <FamilyPersonasIcon name="daycare" />
            <h2>Sin salas</h2>
          </div>
        </aside>

        <div v-if="selectedSala" class="room-stage">
          <article class="room-detail" data-diagnostic="sala-context" data-product-panel="sala-context" data-state="content">
            <header class="room-head">
              <div class="room-identity">
                <span class="room-avatar large">{{ roomInitials(selectedSala.sala) }}</span>
                <div>
                  <p class="eyebrow">{{ selectedSala.unidad }}</p>
                  <h2>{{ selectedSala.sala }}</h2>
                </div>
              </div>
              <button v-if="canPreviewAsFamily" class="preview-family" type="button" data-diagnostic-action="preview-sala" @click="previewSala(selectedSala.id)">
                <FamilyPersonasIcon name="sparkles" />
                Vista familiar
              </button>
            </header>

            <section class="room-facts" aria-label="Resumen de sala">
              <article class="tone-green"><span><FamilyPersonasIcon name="people" /></span><div><small>Familias</small><strong>{{ selectedSala.metrics.familias }}</strong></div></article>
              <article class="tone-amber"><span><FamilyPersonasIcon name="edit" /></span><div><small>Tareas</small><strong>{{ selectedSala.metrics.tareas }}</strong></div></article>
              <article class="tone-coral"><span><FamilyPersonasIcon name="announcement" /></span><div><small>Avisos</small><strong>{{ selectedSala.metrics.avisos }}</strong></div></article>
              <article class="tone-blue"><span><FamilyPersonasIcon name="calendar" /></span><div><small>Agenda</small><strong>{{ selectedSala.metrics.calendario }}</strong></div></article>
            </section>
          </article>

          <aside class="action-panel">
            <header class="pane-title">
              <div>
                <p class="eyebrow">Acciones</p>
                <h2>{{ selectedSala.sala }}</h2>
              </div>
              <span class="action-badge"><FamilyPersonasIcon name="sparkles" /></span>
            </header>
            <div class="action-list">
              <button
                v-for="(item, index) in actionItems"
                :key="item.section"
                type="button"
                :class="`tone-${['green', 'amber', 'coral', 'blue'][index]}`"
                :data-diagnostic-action="item.diagnostic"
                @click="goToSalaSection(item.section, item.create)"
              >
                <span class="action-icon"><FamilyPersonasIcon :name="item.icon" /></span>
                <span class="action-copy">
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.description }}</small>
                </span>
                <span class="action-count">{{ item.count }}</span>
                <FamilyPersonasIcon name="arrow" />
              </button>
            </div>
          </aside>
        </div>
      </section>
    </template>
    <div v-else class="state-panel" data-product-loading>
      <HuskyPassLoader label="Salas" contained />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import { computed, onMounted, ref, watch } from 'vue'
import { navigateTo, useFetch, useRoute, useRouter } from 'nuxt/app'
import type { SalaSummary } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { setCachedRouteSession } from '~/utils/routeSession'
import { hasDaycareAdminScope } from '~/utils/sessionScopes'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'
import FamilyPersonasIcon from '~/components/family/PersonasIcon.vue'
import HuskyPassLoader from '~/components/HuskyPassLoader.vue'

type DaycareSalaSection = 'familias' | 'tareas' | 'avisos' | 'calendario'

const route = useRoute()
const router = useRouter()
const { data: session, pending: sessionPending } = useAppSession()
const daycareTheme = resolvePersonasTheme({ themeKey: 'daycare' })
const sunnyHero = personasMascot(daycareTheme, 'hero')
const sunnyEmpty = personasMascot(daycareTheme, 'empty')

const selectedUnidad = ref(typeof route.query.unidad === 'string' ? route.query.unidad : '')
const search = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const selectedSalaId = ref<number | null>(normalizeSalaQuery(route.query.sala))
const actionError = ref('')
const actionNotice = ref('')
const clientReady = ref(false)
const canPreviewAsFamily = computed(() => hasDaycareAdminScope(session.value?.user))

onMounted(() => {
  clientReady.value = true
})

const { data: unitOptions, pending: unitsPending } = useFetch<{ unidades: string[] }>('/api/daycare/admin/salas/units', {
  timeout: 15000,
  dedupe: 'cancel'
})

const sessionUnidades = computed(() => session.value?.user?.unidades || [])
const unidades = computed(() => {
  const fromApi = (unitOptions.value?.unidades || []).filter(Boolean)
  return fromApi.length ? fromApi : sessionUnidades.value
})
const noUnidadAvailable = computed(() => !sessionPending.value && !unitsPending.value && unidades.value.length === 0)

watch(unidades, (value) => {
  if (!value.length) return
  if (!selectedUnidad.value || !value.includes(selectedUnidad.value)) {
    selectedUnidad.value = value[0]
    selectedSalaId.value = null
    syncQuery()
  }
}, { immediate: true })

watch(() => route.query.unidad, (value) => {
  if (typeof value === 'string' && value && value !== selectedUnidad.value) selectedUnidad.value = value
})

watch(() => route.query.buscar, (value) => {
  const next = typeof value === 'string' ? value : ''
  if (next !== search.value) search.value = next
})

watch(() => route.query.sala, (value) => {
  const next = normalizeSalaQuery(value)
  if (next !== selectedSalaId.value) selectedSalaId.value = next
})

watch(search, () => syncQuery())

const { data: salas, pending, error } = useFetch<SalaSummary[]>('/api/daycare/admin/salas/overview', {
  query: computed(() => ({ unidad: selectedUnidad.value })),
  watch: [selectedUnidad],
  timeout: 15000,
  dedupe: 'cancel'
})

const filteredSalas = computed(() => {
  const needle = search.value.trim().toLowerCase()
  const rows = salas.value || []
  if (!needle) return rows
  return rows.filter((sala) => `${sala.sala} ${sala.unidad}`.toLowerCase().includes(needle))
})

const unitMetrics = computed(() => (salas.value || []).reduce((totals, sala) => ({
  familias: totals.familias + sala.metrics.familias,
  publicaciones: totals.publicaciones + sala.metrics.totalRecursos
}), { familias: 0, publicaciones: 0 }))

const selectedSala = computed(() => filteredSalas.value.find((sala) => sala.id === selectedSalaId.value) || filteredSalas.value[0] || null)
const actionItems = computed<Array<{ section: DaycareSalaSection; diagnostic: string; icon: string; label: string; description: string; count: number; create?: boolean }>>(() => {
  const sala = selectedSala.value
  if (!sala) return []
  return [
    { section: 'familias', diagnostic: 'abrir-familias', icon: 'people', label: 'Familias', description: 'Cuentas y acceso', count: sala.metrics.familias },
    { section: 'tareas', diagnostic: 'abrir-tareas', icon: 'edit', label: 'Nueva tarea', description: 'Trabajo en casa', count: sala.metrics.tareas, create: true },
    { section: 'avisos', diagnostic: 'abrir-avisos', icon: 'announcement', label: 'Avisos', description: 'Mensajes de sala', count: sala.metrics.avisos },
    { section: 'calendario', diagnostic: 'abrir-calendario', icon: 'calendar', label: 'Agenda', description: 'Fechas y eventos', count: sala.metrics.calendario }
  ]
})

watch(filteredSalas, (rows) => {
  if (!rows.length) {
    selectedSalaId.value = null
    syncQuery()
    return
  }

  const routeSala = normalizeSalaQuery(route.query.sala)
  if (routeSala && rows.some((sala) => sala.id === routeSala)) {
    selectedSalaId.value = routeSala
    return
  }

  if (!selectedSalaId.value || !rows.some((sala) => sala.id === selectedSalaId.value)) {
    selectedSalaId.value = rows[0].id
    syncQuery()
  }
}, { immediate: true })

function syncUnidad() {
  actionError.value = ''
  actionNotice.value = ''
  selectedSalaId.value = null
  syncQuery()
}

function selectSala(id: number) {
  actionError.value = ''
  actionNotice.value = ''
  selectedSalaId.value = id
  syncQuery()
}

function syncQuery() {
  const query: Record<string, string> = {}
  if (selectedUnidad.value) query.unidad = selectedUnidad.value
  if (selectedSalaId.value) query.sala = String(selectedSalaId.value)
  if (search.value.trim()) query.buscar = search.value.trim()
  replaceQueryIfChanged(query)
}

function goToSalaSection(section: DaycareSalaSection, create = false) {
  actionError.value = ''
  if (!selectedSala.value?.id) return
  const query: Record<string, string> = {}
  if (selectedUnidad.value) query.unidad = selectedUnidad.value
  if (create) query.create = '1'
  navigateTo({ path: `/admin/daycare/salas/${selectedSala.value.id}/${section}`, query })
}

async function previewSala(id: number) {
  actionError.value = ''
  actionNotice.value = ''
  try {
    const response = await $fetch<PublicSession>('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: id } })
    actionNotice.value = 'Abriendo vista familiar de sala.'
    setCachedRouteSession(response)
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.message || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  }
}

function normalizeSalaQuery(value: unknown) {
  const source = Array.isArray(value) ? value[0] : value
  const id = Number(source || 0)
  return Number.isInteger(id) && id > 0 ? id : null
}

function replaceQueryIfChanged(query: Record<string, string>) {
  if (!import.meta.client || !clientReady.value) return
  const keys = new Set([...Object.keys(route.query), ...Object.keys(query)])
  const changed = Array.from(keys).some((key) => {
    const current = Array.isArray(route.query[key]) ? route.query[key]?.[0] : route.query[key]
    return String(current || '') !== String(query[key] || '')
  })
  if (changed) router.replace({ path: route.path, query })
}

function roomInitials(value?: string | null) {
  return String(value || 'S')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
</script>

<style scoped>
.daycare-console {
  display: grid;
  gap: clamp(16px, 2.2vw, 24px);
}

.command-hero {
  background:
    radial-gradient(circle at 15% 112%, rgba(255, 190, 71, 0.34), transparent 34%),
    radial-gradient(circle at 92% 0%, rgba(191, 217, 86, 0.26), transparent 29%),
    linear-gradient(135deg, #294e20 0%, #4e7f31 55%, #8eae3f 100%);
  border-radius: 34px;
  box-shadow: 0 26px 64px rgba(49, 95, 36, 0.22);
  color: #fff;
  display: grid;
  gap: clamp(20px, 3vw, 38px);
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.72fr) minmax(190px, 280px);
  min-height: 286px;
  overflow: hidden;
  padding: clamp(26px, 4vw, 48px);
  position: relative;
}

.command-hero::before {
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;
  content: '';
  height: 360px;
  left: -190px;
  position: absolute;
  top: -220px;
  width: 360px;
}

.hero-copy,
.hero-controls,
.hero-art {
  position: relative;
  z-index: 1;
}

.hero-copy {
  align-content: center;
  display: grid;
  gap: 12px;
}

.hero-kicker {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0;
  text-transform: uppercase;
}

.hero-copy h1 {
  color: #fff;
  font-family: var(--font-title);
  font-size: clamp(2.8rem, 6vw, 5.2rem);
  letter-spacing: -0.035em;
  line-height: 0.88;
  margin: 0;
}

.hero-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.hero-metrics span {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.72rem;
  padding: 8px 11px;
}

.hero-metrics strong {
  color: #fff;
  font-size: 0.86rem;
  margin-right: 3px;
}

.hero-controls {
  align-content: center;
  display: grid;
  gap: 10px;
}

.control-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(24, 53, 18, 0.18);
  display: grid;
  gap: 5px;
  padding: 11px 14px;
}

.control-card > span:first-child {
  color: #6d7866;
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.control-card select,
.control-card input {
  background: transparent;
  border: 0;
  color: #263f1c;
  min-height: 27px;
  min-width: 0;
  outline: 0;
  width: 100%;
}

.control-input {
  align-items: center;
  color: #578b26;
  display: grid;
  gap: 8px;
  grid-template-columns: 20px minmax(0, 1fr);
}

.hero-art {
  align-self: end;
  min-height: 220px;
}

.hero-art img {
  bottom: -44px;
  filter: drop-shadow(0 24px 24px rgba(29, 56, 21, 0.24));
  max-height: 290px;
  object-fit: contain;
  position: absolute;
  right: -16px;
  width: min(100%, 250px);
  z-index: 2;
}

.art-orbit {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: absolute;
}

.orbit-one {
  height: 210px;
  right: -10px;
  top: 18px;
  width: 210px;
}

.orbit-two {
  background: rgba(255, 190, 71, 0.75);
  border: 0;
  height: 18px;
  right: 24px;
  top: 20px;
  width: 18px;
}

.rooms-workbench {
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
}

.rooms-pane,
.room-detail,
.action-panel,
.state-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(66, 104, 49, 0.13);
  border-radius: 28px;
  box-shadow: 0 20px 58px rgba(51, 82, 37, 0.09);
}

.rooms-pane {
  display: grid;
  gap: 12px;
  padding: 14px;
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.room-stage {
  display: grid;
  gap: 18px;
  min-width: 0;
}

.pane-title,
.room-head,
.room-identity {
  align-items: center;
  display: flex;
}

.pane-title,
.room-head {
  gap: 14px;
  justify-content: space-between;
}

.pane-title {
  padding: 5px 5px 9px;
}

.eyebrow {
  color: #578b26;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0 0 5px;
  text-transform: uppercase;
}

.pane-title h2,
.room-head h2 {
  color: #263f1c;
  font-family: var(--font-title);
  margin: 0;
}

.pane-title h2 {
  font-size: 1.35rem;
}

.pane-count {
  color: #7a8473;
  font-size: 0.7rem;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-list {
  display: grid;
  gap: 7px;
}

.room-row {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  padding: 9px;
  text-align: left;
  transition: 160ms ease;
  width: 100%;
}

.room-row:hover,
.room-row.active {
  background: linear-gradient(135deg, #eef6e4, #fff6e4);
  border-color: rgba(87, 139, 38, 0.15);
  transform: translateY(-1px);
}

.room-row.active {
  box-shadow: inset 3px 0 0 #6f971a, 0 12px 26px rgba(51, 82, 37, 0.08);
}

.room-avatar,
.action-icon,
.action-badge {
  align-items: center;
  display: inline-flex;
  justify-content: center;
}

.room-avatar {
  background: linear-gradient(135deg, #ddebca, #fff0c9);
  border: 1px solid rgba(87, 139, 38, 0.13);
  border-radius: 15px;
  color: #355f24;
  font-size: 0.76rem;
  font-weight: 950;
  height: 44px;
  width: 44px;
}

.room-avatar.large {
  border-radius: 22px;
  font-size: 1.15rem;
  height: 72px;
  width: 72px;
}

.room-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.room-copy strong,
.room-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-copy strong {
  color: #263f1c;
}

.room-copy small {
  color: #76806f;
  font-size: 0.75rem;
}

.room-publications {
  background: #f6f8f1;
  border-radius: 999px;
  color: #6d7866;
  font-size: 0.7rem;
  font-weight: 900;
  min-width: 30px;
  padding: 6px 8px;
  text-align: center;
}

.room-detail {
  background:
    radial-gradient(circle at 100% 0%, rgba(159, 190, 75, 0.16), transparent 28%),
    linear-gradient(140deg, rgba(255, 255, 255, 0.97), rgba(248, 251, 243, 0.94));
  display: grid;
  gap: 20px;
  overflow: hidden;
  padding: clamp(18px, 2.5vw, 28px);
}

.room-identity {
  gap: 14px;
  min-width: 0;
}

.room-head h2 {
  font-size: clamp(2rem, 4vw, 3.4rem);
  letter-spacing: -0.03em;
  line-height: 0.92;
}

.preview-family {
  align-items: center;
  background: #263f1c;
  border: 0;
  border-radius: 16px;
  box-shadow: 0 14px 28px rgba(38, 63, 28, 0.2);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-weight: 800;
  gap: 8px;
  min-height: 46px;
  padding: 0 15px;
}

.room-facts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.room-facts article {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 22px;
  display: grid;
  gap: 10px;
  grid-template-columns: 40px minmax(0, 1fr);
  min-height: 92px;
  padding: 13px;
}

.room-facts article > span {
  align-items: center;
  border-radius: 14px;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.room-facts small,
.room-facts strong {
  display: block;
}

.room-facts small {
  color: #6f7868;
  font-size: 0.69rem;
  font-weight: 900;
  text-transform: uppercase;
}

.room-facts strong {
  color: #263f1c;
  font-family: var(--font-title);
  font-size: 1.7rem;
  line-height: 1;
}

.tone-green { background: #eef6e4; border-color: rgba(87, 139, 38, 0.13) !important; }
.tone-green > span, .tone-green .action-icon { background: #dcebc9; color: #355f24; }
.tone-amber { background: #fff6e4; border-color: rgba(255, 181, 69, 0.19) !important; }
.tone-amber > span, .tone-amber .action-icon { background: #ffe8bc; color: #93610c; }
.tone-coral { background: #fff0ed; border-color: rgba(220, 117, 101, 0.17) !important; }
.tone-coral > span, .tone-coral .action-icon { background: #fbdad4; color: #a94e42; }
.tone-blue { background: #edf6fa; border-color: rgba(78, 145, 182, 0.16) !important; }
.tone-blue > span, .tone-blue .action-icon { background: #d8ebf3; color: #236188; }

.action-panel {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.action-badge {
  background: #eef6e4;
  border-radius: 14px;
  color: #578b26;
  height: 40px;
  width: 40px;
}

.action-list {
  display: grid;
  gap: 9px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-list button {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 22px;
  cursor: pointer;
  display: grid;
  gap: 11px;
  grid-template-columns: 44px minmax(0, 1fr) auto auto;
  min-height: 84px;
  padding: 12px;
  text-align: left;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.action-list button:hover {
  box-shadow: 0 15px 32px rgba(51, 82, 37, 0.1);
  transform: translateY(-2px);
}

.action-icon {
  border-radius: 15px;
  height: 44px;
  width: 44px;
}

.action-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.action-copy strong {
  color: #263f1c;
}

.action-copy small {
  color: #707a69;
  font-size: 0.74rem;
}

.action-count {
  background: rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  color: #4e5d46;
  font-size: 0.72rem;
  font-weight: 900;
  min-width: 30px;
  padding: 6px 8px;
  text-align: center;
}

.surface-message {
  background: #edf8e7;
  border: 1px solid #cbe4b8;
  border-radius: 16px;
  color: #355f24;
  margin: 0;
  padding: 11px 14px;
}

.surface-message.error {
  background: #fff1f0;
  border-color: #f4cbc5;
  color: #a23f35;
}

.state-panel {
  color: #717a6c;
  display: grid;
  gap: 10px;
  min-height: 260px;
  place-items: center;
  padding: 28px;
  text-align: center;
}

.state-panel img {
  max-height: 132px;
}

.state-panel h2 {
  color: #263f1c;
  margin: 0;
}

.state-panel.compact {
  min-height: 180px;
}

@media (max-width: 1180px) {
  .command-hero {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
  }

  .hero-art {
    display: none;
  }

  .room-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 920px) {
  .command-hero,
  .rooms-workbench {
    grid-template-columns: 1fr;
  }

  .command-hero {
    min-height: auto;
  }

  .rooms-pane {
    position: static;
  }

  .room-list {
    display: flex;
    margin-inline: -4px;
    overflow-x: auto;
    padding: 4px;
    scroll-snap-type: x mandatory;
  }

  .room-row {
    flex: 0 0 min(280px, 82vw);
    scroll-snap-align: start;
  }
}

@media (max-width: 680px) {
  .command-hero {
    border-radius: 28px;
    padding: 24px 20px;
  }

  .hero-copy h1 {
    font-size: clamp(2.6rem, 14vw, 4.3rem);
  }

  .room-head,
  .room-identity {
    align-items: flex-start;
  }

  .room-head {
    display: grid;
  }

  .preview-family {
    width: 100%;
  }

  .room-facts,
  .action-list {
    grid-template-columns: 1fr;
  }

  .action-list button {
    min-height: 76px;
  }
}
</style>
