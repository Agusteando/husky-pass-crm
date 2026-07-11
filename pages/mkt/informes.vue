<template>
  <section class="mkt-page leads-page" data-product-area="mkt" data-product-screen="informes">
    <header class="crm-hero mkt-panel">
      <div class="crm-hero__copy">
        <p class="mkt-eyebrow">Relaciones con familias</p>
        <h1>Informes que avanzan</h1>
        <p>Una vista completa de cada familia, su conversación y el siguiente movimiento.</p>
        <div class="crm-hero__actions">
          <button class="mkt-btn primary" type="button" @click="openNew"><FamilyPersonasIcon name="user-plus" />Nuevo informe</button>
          <a class="mkt-btn" :href="exportUrl"><FamilyPersonasIcon name="download" />Exportar</a>
        </div>
      </div>
      <div class="crm-hero__visual">
        <MktAmbassadorCluster compact />
        <div class="crm-pulse">
          <span><FamilyPersonasIcon name="target" /></span>
          <div><small>Conversión del filtro</small><strong>{{ conversionRate }}%</strong></div>
        </div>
      </div>
    </header>

    <section class="crm-summary" aria-label="Resumen del CRM">
      <article>
        <span class="summary-icon teal"><FamilyPersonasIcon name="people" /></span>
        <div><small>Informes</small><strong>{{ visibleTotal }}</strong></div>
        <em>{{ hasFilters ? 'En esta vista' : 'Base completa' }}</em>
      </article>
      <article :class="{ alert: summaryUncontacted > 0 }">
        <span class="summary-icon coral"><FamilyPersonasIcon name="bell" /></span>
        <div><small>Sin contacto</small><strong>{{ summaryUncontacted }}</strong></div>
        <em>Atención inmediata</em>
      </article>
      <article>
        <span class="summary-icon yellow"><FamilyPersonasIcon name="handshake" /></span>
        <div><small>Negociación</small><strong>{{ summaryNegotiating }}</strong></div>
        <em>Cierre activo</em>
      </article>
      <article>
        <span class="summary-icon lime"><FamilyPersonasIcon name="graduation" /></span>
        <div><small>Inscritos</small><strong>{{ summaryEnrolled }}</strong></div>
        <em>{{ conversionRate }}% conversión</em>
      </article>
    </section>

    <section class="crm-workbench mkt-panel">
      <div class="workbench-top">
        <label class="crm-search">
          <FamilyPersonasIcon name="search" />
          <input v-model="draft.search" type="search" placeholder="Folio, estudiante, tutor o teléfono" aria-label="Buscar informes" @keyup.enter="applyFilters" />
        </label>
        <div class="view-switch" role="group" aria-label="Vista de informes">
          <button type="button" :class="{ active: viewMode === 'board' }" aria-label="Vista por etapas" @click="setView('board')"><FamilyPersonasIcon name="board" /><span>Etapas</span></button>
          <button type="button" :class="{ active: viewMode === 'list' }" aria-label="Vista de lista" @click="setView('list')"><FamilyPersonasIcon name="list" /><span>Lista</span></button>
        </div>
        <button class="filter-toggle" type="button" :class="{ active: filtersOpen || hasFilters }" @click="filtersOpen = !filtersOpen"><FamilyPersonasIcon name="filter" />Filtros<span v-if="activeFilterCount">{{ activeFilterCount }}</span></button>
      </div>

      <form v-show="filtersOpen" class="filters-grid" @submit.prevent="applyFilters">
        <label><span>Etapa</span><select v-model="draft.stage" class="mkt-select"><option value="all">Todas las etapas</option><option v-for="stage in stages" :key="stage" :value="stage">{{ MKT_STAGE_META[stage].label }}</option></select></label>
        <label><span>Vía de informe</span><select v-model="draft.channel" class="mkt-select"><option value="all">Todas las vías</option><option v-for="channel in response?.options.channels || []" :key="channel" :value="channel">{{ mktChannelLabel(channel) }}</option></select></label>
        <label><span>Plantel</span><select v-model="draft.plantel" class="mkt-select"><option value="all">Todos los planteles</option><option v-for="plantel in response?.options.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option></select></label>
        <label><span>Desde</span><input v-model="draft.from" class="mkt-input" type="date" :max="draft.to || today" /></label>
        <label><span>Hasta</span><input v-model="draft.to" class="mkt-input" type="date" :min="draft.from || undefined" :max="today" /></label>
        <label><span>Atención</span><select v-model="draft.attention" class="mkt-select"><option value="all">Todas</option><option value="uncontacted">Sin contacto</option><option value="stale">Sin actividad +7 días</option><option value="cold">Sin actividad +14 días</option><option value="negotiating">Cierre activo</option></select></label>
        <div class="filter-actions"><button class="mkt-btn primary" type="submit"><FamilyPersonasIcon name="search" />Aplicar</button><button v-if="hasFilters || draftHasFilters" class="mkt-btn" type="button" @click="clearFilters">Limpiar</button></div>
      </form>
      <p v-if="filterError" class="mkt-alert filter-error">{{ filterError }}</p>

      <div v-if="hasFilters" class="active-filters" aria-label="Filtros activos">
        <span v-if="applied.search">“{{ applied.search }}”</span>
        <span v-if="applied.stage !== 'all'">{{ applied.stage }}</span>
        <span v-if="applied.channel !== 'all'">{{ mktChannelLabel(applied.channel) }}</span>
        <span v-if="applied.plantel !== 'all'">{{ applied.plantel }}</span>
        <span v-if="applied.from || applied.to">{{ applied.from || 'Inicio' }} — {{ applied.to || 'Hoy' }}</span>
        <span v-if="applied.attention !== 'all'">{{ attentionFilterLabel }}</span>
      </div>
    </section>

    <section v-if="pending" class="mkt-panel mkt-empty"><HuskyPassLoader label="Informes" contained /></section>
    <section v-else-if="loadError" class="mkt-panel mkt-empty">
      <FamilyPersonasIcon name="alert" /><h2>No pudimos cargar los informes</h2><p>La información permanece intacta.</p><button class="mkt-btn" type="button" @click="() => refresh()">Reintentar</button>
    </section>

    <template v-else>
      <nav v-if="viewMode === 'board'" class="mobile-stage-tabs" aria-label="Etapas del embudo">
        <button v-for="stage in stages" :key="stage" type="button" :class="{ active: mobileStage === stage }" @click="mobileStage = stage"><span>{{ MKT_STAGE_META[stage].short }}</span><b>{{ visibleStageCount(stage) }}</b></button>
      </nav>

      <section v-if="viewMode === 'board' && visibleLeads.length" class="crm-board" aria-label="Embudo de informes">
        <article v-for="(stage, stageIndex) in stages" :key="stage" class="stage-column" :class="{ 'mobile-hidden': mobileStage !== stage }" :data-stage-index="stageIndex">
          <header>
            <span class="stage-number">0{{ stageIndex + 1 }}</span>
            <div><strong>{{ MKT_STAGE_META[stage].label }}</strong><small>{{ MKT_STAGE_META[stage].description }}</small></div>
            <b>{{ visibleStageCount(stage) }}</b>
          </header>
          <div class="stage-cards">
            <button v-for="lead in leadsForStage(stage)" :key="lead.folio" class="lead-card" type="button" @click="openLead(lead.folio)">
              <span class="lead-card__head">
                <span class="lead-mascot" :data-theme="mktPlantelLevel(lead.plantel, lead.level)"><img :src="mktAmbassadorForLead(lead).src" alt="" /></span>
                <span><em>{{ lead.folio }}</em><strong>{{ lead.studentName }}</strong><small>{{ lead.contactName }}</small></span>
              </span>
              <span class="lead-card__meta"><i>{{ mktPlantelDisplay(lead.plantel, lead.level) }}</i><i>{{ mktChannelLabel(lead.channel) }}</i></span>
              <span class="lead-card__foot"><span class="attention-badge" :data-tone="mktLeadAttention(lead).tone">{{ mktLeadAttention(lead).label }}</span><time>{{ mktRelativeDate(lead.lastFollowUpAt || lead.createdAt) }}</time></span>
            </button>
            <div v-if="!leadsForStage(stage).length" class="empty-column">
              <MktAmbassadorCluster compact :theme="stageAmbassador(stage)" :show-seal="false" />
              <strong>{{ stage === 'Inscrito' ? 'Sin conversiones en esta vista' : 'Etapa despejada' }}</strong>
              <small>{{ MKT_STAGE_META[stage].description }}</small>
            </div>
          </div>
        </article>
      </section>

      <section v-else-if="viewMode === 'list' && visibleLeads.length" class="mkt-panel leads-list-panel">
        <div class="leads-list-head"><span>Familia</span><span>Contexto</span><span>Etapa</span><span>Actividad</span><span /></div>
        <button v-for="lead in visibleLeads" :key="lead.folio" class="lead-list-row" type="button" @click="openLead(lead.folio)">
          <span class="list-person"><i :data-theme="mktPlantelLevel(lead.plantel, lead.level)"><img :src="mktAmbassadorForLead(lead).src" alt="" /></i><span><small>{{ lead.folio }}</small><strong>{{ lead.studentName }}</strong><em>{{ lead.contactName }}</em></span></span>
          <span class="list-context"><strong>{{ mktPlantelDisplay(lead.plantel, lead.level) }}</strong><small>{{ mktChannelLabel(lead.channel) }} · {{ lead.followUpCount }} seguimientos</small></span>
          <span><i class="mkt-stage-chip" :data-stage="lead.stage">{{ lead.stage }}</i></span>
          <span class="list-activity"><strong :data-tone="mktLeadAttention(lead).tone">{{ mktLeadAttention(lead).label }}</strong><small>{{ mktRelativeDate(lead.lastFollowUpAt || lead.createdAt, true) }}</small></span>
          <FamilyPersonasIcon name="arrow" />
        </button>
      </section>

      <MktEmptyState v-else title="No hay informes en esta vista" description="Ajusta los filtros o registra una nueva familia." icon="search" ambassador="preescolar" tone="blue">
        <button v-if="hasFilters" class="mkt-btn" type="button" @click="clearFilters">Limpiar filtros</button>
        <button v-else class="mkt-btn primary" type="button" @click="openNew">Nuevo informe</button>
      </MktEmptyState>
    </template>

    <MktLeadFormModal v-if="newOpen" :planteles="response?.options.planteles || []" :channels="response?.options.channels || []" @close="closeNew" @created="handleCreated" />
    <MktLeadDrawer v-if="selectedFolio" :folio="selectedFolio" :planteles="response?.options.planteles || []" :channels="response?.options.channels || []" @close="closeLead" @updated="handleUpdated" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import { MKT_STAGES, type MktLeadDetail, type MktLeadsResponse, type MktStage } from '~/types/mkt'
import { MKT_STAGE_META, mktAmbassadorForLead, mktChannelLabel, mktLeadAttention, mktPlantelDisplay, mktPlantelLevel, mktRelativeDate, type MktAmbassadorTheme } from '~/utils/mkt'

interface FilterState { search: string; stage: string; channel: string; plantel: string; from: string; to: string; attention: string }

definePageMeta({ layout: 'mkt', middleware: ['admin', 'mkt'] })
const route = useRoute()
const router = useRouter()
const stages = [...MKT_STAGES]
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const emptyFilters = (): FilterState => ({ search: '', stage: 'all', channel: 'all', plantel: 'all', from: '', to: '', attention: 'all' })
const applied = reactive<FilterState>(emptyFilters())
const draft = reactive<FilterState>(emptyFilters())
const filtersOpen = ref(false)
const viewMode = ref<'board' | 'list'>('board')
const mobileStage = ref<MktStage>('Leads Entrantes')
const newOpen = ref(false)
const selectedFolio = ref('')
const filterError = ref('')
const attentionFilters = ['uncontacted', 'stale', 'cold', 'negotiating'] as const

function queryValue(key: string) { const value = route.query[key]; return Array.isArray(value) ? String(value[0] || '') : String(value || '') }
function validDate(value: string) { const parsed = new Date(`${value}T12:00:00Z`); return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value }
function stateHasFilters(state: FilterState) { return Object.values(state).some((value) => value && value !== 'all') }
function filtersFromRoute(): FilterState {
  const stage = queryValue('stage')
  const attention = queryValue('attention')
  const from = queryValue('from')
  const to = queryValue('to')
  return {
    search: queryValue('search').slice(0, 100),
    stage: stages.includes(stage as MktStage) ? stage : 'all',
    channel: queryValue('channel').slice(0, 80) || 'all',
    plantel: queryValue('plantel').slice(0, 20) || 'all',
    from: validDate(from) ? from : '',
    to: validDate(to) ? to : '',
    attention: attentionFilters.includes(attention as typeof attentionFilters[number]) ? attention : 'all'
  }
}
function syncRouteState() {
  Object.assign(applied, filtersFromRoute())
  Object.assign(draft, applied)
  newOpen.value = queryValue('new') === '1'
  selectedFolio.value = /^[A-Z0-9-]{3,50}$/i.test(queryValue('lead')) ? queryValue('lead').toUpperCase() : ''
  const view = queryValue('view')
  if (view === 'list' || view === 'board') viewMode.value = view
  filtersOpen.value = filtersOpen.value || stateHasFilters(applied)
  if (applied.stage !== 'all' && stages.includes(applied.stage as MktStage)) mobileStage.value = applied.stage as MktStage
}
watch(() => route.query, syncRouteState, { immediate: true, deep: true })

const requestQuery = computed(() => ({
  search: applied.search || undefined, stage: applied.stage !== 'all' ? applied.stage : undefined,
  channel: applied.channel !== 'all' ? applied.channel : undefined, plantel: applied.plantel !== 'all' ? applied.plantel : undefined,
  from: applied.from || undefined, to: applied.to || undefined, attention: applied.attention !== 'all' ? applied.attention : undefined, limit: 500
}))
const { data: response, pending, error: loadError, refresh } = useFetch<MktLeadsResponse>('/api/mkt/leads', { query: requestQuery })
const visibleLeads = computed(() => response.value?.leads || [])
const hasFilters = computed(() => stateHasFilters(applied))
const draftHasFilters = computed(() => Object.values(draft).some((value) => value && value !== 'all'))
const activeFilterCount = computed(() => Object.values(applied).filter((value) => value && value !== 'all').length)
const attentionFilterLabel = computed(() => ({ uncontacted: 'Sin contacto', stale: 'Sin actividad +7 días', cold: 'Sin actividad +14 días', negotiating: 'Cierre activo' } as Record<string, string>)[applied.attention] || '')
const visibleTotal = computed(() => response.value?.summary.total || 0)
const summaryUncontacted = computed(() => response.value?.summary.uncontacted || 0)
const summaryNegotiating = computed(() => response.value?.summary.negotiating || 0)
const summaryEnrolled = computed(() => response.value?.summary.enrolled || 0)
const conversionRate = computed(() => visibleTotal.value ? Math.round((summaryEnrolled.value / visibleTotal.value) * 100) : 0)
const exportUrl = computed(() => {
  const params = new URLSearchParams()
  for (const key of ['search', 'stage', 'channel', 'plantel', 'from', 'to', 'attention'] as const) {
    const value = applied[key]
    if (value && value !== 'all') params.set(key, value)
  }
  return `/api/mkt/leads/export${params.size ? `?${params.toString()}` : ''}`
})

function leadsForStage(stage: MktStage) { return visibleLeads.value.filter((lead) => lead.stage === stage) }
function visibleStageCount(stage: MktStage) { return response.value?.summary.stageCounts[stage] || 0 }
function stageAmbassador(stage: MktStage): MktAmbassadorTheme { return ({ 'Leads Entrantes': 'preescolar', 'Primer contacto': 'primaria', 'Discusión': 'daycare', 'Negociación': 'secundaria', 'Inscrito': 'primaria' } as Record<MktStage, MktAmbassadorTheme>)[stage] }
function routeQuery(overrides: Record<string, string | undefined> = {}) {
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries({ ...applied, view: viewMode.value, ...overrides })) if (value && value !== 'all') query[key] = value
  return query
}
async function applyFilters() {
  filterError.value = ''
  if (draft.from && draft.to && draft.from > draft.to) {
    filterError.value = 'La fecha inicial debe ser anterior a la fecha final.'
    return
  }
  Object.assign(applied, draft)
  await router.replace({ path: route.path, query: routeQuery({ lead: undefined, new: undefined }) })
}
async function clearFilters() {
  filterError.value = ''
  Object.assign(applied, emptyFilters()); Object.assign(draft, emptyFilters())
  await router.replace({ path: route.path, query: viewMode.value === 'board' ? {} : { view: viewMode.value } })
}
async function setView(value: 'board' | 'list') { viewMode.value = value; if (import.meta.client) localStorage.setItem('mkt-crm-view', value); await router.replace({ path: route.path, query: routeQuery({ view: value }) }) }
async function openNew() { await router.replace({ path: route.path, query: { ...route.query, new: '1', lead: undefined } }) }
async function closeNew() { await router.replace({ path: route.path, query: { ...route.query, new: undefined } }) }
async function openLead(folio: string) { await router.replace({ path: route.path, query: { ...route.query, lead: folio, new: undefined } }) }
async function closeLead() { await router.replace({ path: route.path, query: { ...route.query, lead: undefined } }) }
async function handleCreated(lead: MktLeadDetail) { await refresh(); await router.replace({ path: route.path, query: { ...route.query, new: undefined, lead: lead.folio } }) }
async function handleUpdated() { await refresh() }

onMounted(() => {
  if (queryValue('view')) return
  const stored = localStorage.getItem('mkt-crm-view')
  if (stored === 'list' || stored === 'board') viewMode.value = stored
})
</script>

<style scoped>
.crm-hero{align-items:center;background:radial-gradient(circle at 88% 8%,rgba(246,199,68,.22),transparent 19rem),radial-gradient(circle at 65% 100%,rgba(134,199,77,.18),transparent 22rem),linear-gradient(135deg,#fff,#f0f9f5);display:grid;gap:26px;grid-template-columns:minmax(0,1fr) auto;min-height:245px;overflow:hidden;padding:clamp(24px,3.4vw,42px);position:relative}.crm-hero:before{border:1px solid rgba(8,113,103,.08);border-radius:50%;content:'';height:320px;position:absolute;right:-110px;top:-170px;width:320px}.crm-hero__copy{position:relative;z-index:1}.crm-hero h1{font-size:clamp(2.25rem,4.2vw,4rem);letter-spacing:-.045em;line-height:.94}.crm-hero__copy>p:last-of-type{font-size:.84rem;line-height:1.6;margin:12px 0 0;max-width:670px}.crm-hero__actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}.crm-hero__visual{align-items:end;display:flex;position:relative}.crm-pulse{align-items:center;background:rgba(255,255,255,.94);border:1px solid #dbeae3;border-radius:18px;box-shadow:0 16px 36px rgba(13,55,62,.11);display:flex;gap:10px;padding:12px 15px;position:absolute;right:-2px;top:3px}.crm-pulse>span{align-items:center;background:#e9f7ef;border-radius:12px;color:var(--mkt-teal);display:flex;height:38px;justify-content:center;width:38px}.crm-pulse small,.crm-pulse strong{display:block}.crm-pulse small{color:#718285;font-size:.59rem}.crm-pulse strong{font-family:var(--font-title);font-size:1.35rem;margin-top:1px}
.crm-summary{display:grid;gap:12px;grid-template-columns:repeat(4,minmax(0,1fr))}.crm-summary article{align-items:center;background:rgba(255,255,255,.94);border:1px solid var(--mkt-line);border-radius:20px;box-shadow:0 13px 30px rgba(13,55,62,.045);display:grid;gap:11px;grid-template-columns:45px minmax(0,1fr);min-height:94px;padding:15px}.crm-summary article.alert{background:linear-gradient(145deg,#fff,#fff4f1);border-color:#f0d0ca}.summary-icon{align-items:center;border-radius:14px;display:flex;height:45px;justify-content:center;width:45px}.summary-icon.teal{background:#e8f6f0;color:#087167}.summary-icon.coral{background:#fff0ec;color:#c34d43}.summary-icon.yellow{background:#fff6d9;color:#8b6714}.summary-icon.lime{background:#edf8e6;color:#56852c}.crm-summary small,.crm-summary strong{display:block}.crm-summary small{color:#78878a;font-size:.61rem}.crm-summary strong{font-family:var(--font-title);font-size:1.65rem;line-height:1}.crm-summary em{color:#849294;font-size:.58rem;font-style:normal;font-weight:800;grid-column:2}
.crm-workbench{overflow:hidden}.workbench-top{align-items:center;display:grid;gap:10px;grid-template-columns:minmax(240px,1fr) auto auto;padding:13px}.crm-search{align-items:center;background:#f5f9f7;border:1px solid #dce8e3;border-radius:15px;color:#78908e;display:flex;gap:9px;min-height:46px;padding:0 13px}.crm-search:focus-within{background:#fff;border-color:rgba(8,113,103,.46);box-shadow:0 0 0 4px rgba(8,113,103,.08)}.crm-search input{background:transparent;border:0;color:var(--mkt-ink);font:inherit;font-size:.75rem;outline:0;width:100%}.view-switch{background:#f2f6f4;border:1px solid #e0e9e5;border-radius:14px;display:flex;padding:3px}.view-switch button,.filter-toggle{align-items:center;background:transparent;border:0;border-radius:11px;color:#718082;cursor:pointer;display:flex;font:inherit;font-size:.65rem;font-weight:900;gap:6px;min-height:38px;padding:0 10px}.view-switch button.active{background:#fff;box-shadow:0 6px 14px rgba(16,54,60,.08);color:var(--mkt-teal)}.filter-toggle{border:1px solid #dce7e2;position:relative}.filter-toggle.active{background:#edf8f3;color:var(--mkt-teal)}.filter-toggle>span{align-items:center;background:var(--mkt-teal);border-radius:50%;color:#fff;display:flex;font-size:.52rem;height:18px;justify-content:center;width:18px}.filters-grid{border-top:1px solid #e4ece8;display:grid;gap:10px;grid-template-columns:repeat(6,minmax(130px,1fr));padding:14px}.filters-grid label{display:grid;gap:5px}.filters-grid label>span{color:#718285;font-size:.58rem;font-weight:900}.filter-actions{align-items:end;display:flex;gap:7px;grid-column:1/-1;justify-content:flex-end}.filter-error{margin:0 14px 12px}.active-filters{align-items:center;border-top:1px solid #e8efec;display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px}.active-filters span{background:#eef7f3;border:1px solid #d6e9e0;border-radius:999px;color:#176b61;font-size:.59rem;font-weight:900;padding:5px 9px}
.crm-board{align-items:start;display:grid;gap:12px;grid-template-columns:repeat(5,minmax(220px,1fr));overflow-x:auto;padding-bottom:8px}.stage-column{background:rgba(244,249,247,.84);border:1px solid rgba(18,73,76,.1);border-radius:21px;min-width:220px;overflow:hidden}.stage-column>header{align-items:center;background:rgba(255,255,255,.86);border-bottom:1px solid #e2ebe7;display:grid;gap:9px;grid-template-columns:32px minmax(0,1fr) auto;padding:13px}.stage-number{align-items:center;background:#e8f5ef;border-radius:10px;color:#0c6c61;display:flex;font-family:var(--font-title);font-size:.78rem;height:32px;justify-content:center}.stage-column[data-stage-index='1'] .stage-number{background:#eaf4fc;color:#397db7}.stage-column[data-stage-index='2'] .stage-number{background:#fff5d5;color:#8b6711}.stage-column[data-stage-index='3'] .stage-number{background:#fff0ec;color:#b54b41}.stage-column[data-stage-index='4'] .stage-number{background:#edf8e6;color:#527f2b}.stage-column>header strong,.stage-column>header small{display:block}.stage-column>header strong{font-size:.68rem}.stage-column>header small{color:#849193;font-size:.53rem;margin-top:2px}.stage-column>header>b{align-items:center;background:#fff;border:1px solid #dce7e2;border-radius:999px;display:flex;font-size:.6rem;height:27px;justify-content:center;min-width:27px;padding:0 7px}.stage-cards{display:grid;gap:9px;max-height:calc(100vh - 350px);min-height:260px;overflow-y:auto;padding:9px}.lead-card{background:#fff;border:1px solid #dfe8e4;border-radius:17px;color:var(--mkt-ink);cursor:pointer;display:grid;font:inherit;gap:10px;padding:12px;text-align:left;transition:.18s}.lead-card:hover{border-color:rgba(8,113,103,.31);box-shadow:0 13px 28px rgba(15,61,65,.1);transform:translateY(-2px)}.lead-card__head{align-items:center;display:grid;gap:9px;grid-template-columns:46px minmax(0,1fr)}.lead-mascot{align-items:end;border-radius:14px;display:flex;height:46px;justify-content:center;overflow:hidden}.lead-mascot[data-theme='daycare']{background:#e8f7e1}.lead-mascot[data-theme='preescolar']{background:#fff5cf}.lead-mascot[data-theme='primaria']{background:#e8f3fc}.lead-mascot[data-theme='secundaria']{background:#ffe7e2}.lead-mascot img{height:43px;object-fit:contain;object-position:center bottom;width:100%}.lead-card__head em,.lead-card__head strong,.lead-card__head small{display:block}.lead-card__head em{color:#849294;font-size:.52rem;font-style:normal;font-weight:900;letter-spacing:.05em}.lead-card__head strong{font-family:var(--font-title);font-size:.81rem;line-height:1.13;margin-top:2px}.lead-card__head small{color:#687a7d;font-size:.58rem;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lead-card__meta{display:flex;flex-wrap:wrap;gap:5px}.lead-card__meta i{background:#f2f7f5;border-radius:999px;color:#617679;font-size:.52rem;font-style:normal;font-weight:800;padding:4px 7px}.lead-card__foot{align-items:center;border-top:1px solid #edf1ef;display:flex;gap:7px;justify-content:space-between;padding-top:9px}.lead-card__foot time{color:#849294;font-size:.52rem}.attention-badge{border-radius:999px;font-size:.53rem;font-weight:900;padding:4px 7px}.attention-badge[data-tone='urgent']{background:#fff0ec;color:#b84940}.attention-badge[data-tone='warning']{background:#fff5d7;color:#896310}.attention-badge[data-tone='active']{background:#eaf4fc;color:#3979ad}.attention-badge[data-tone='fresh'],.attention-badge[data-tone='success']{background:#ebf7e7;color:#4f7d2b}.attention-badge[data-tone='neutral']{background:#eff4f2;color:#627779}.empty-column{align-items:center;color:#718184;display:grid;gap:4px;justify-items:center;min-height:230px;padding:20px;text-align:center}.empty-column :deep(.mkt-ambassadors){margin-bottom:-9px}.empty-column strong{font-size:.67rem}.empty-column small{font-size:.55rem}.mobile-stage-tabs{display:none}
.leads-list-panel{overflow:hidden}.leads-list-head,.lead-list-row{align-items:center;display:grid;gap:14px;grid-template-columns:minmax(260px,1.45fr) minmax(200px,1fr) minmax(130px,.65fr) minmax(190px,.9fr) 22px;padding:12px 16px}.leads-list-head{background:#f4f8f6;border-bottom:1px solid #e2ebe7;color:#788789;font-size:.57rem;font-weight:900;text-transform:uppercase}.lead-list-row{background:#fff;border:0;border-bottom:1px solid #e8efec;color:var(--mkt-ink);cursor:pointer;font:inherit;text-align:left;transition:.16s;width:100%}.lead-list-row:last-child{border-bottom:0}.lead-list-row:hover{background:#f5faf7}.list-person{align-items:center;display:grid;gap:10px;grid-template-columns:48px minmax(0,1fr)}.list-person>i{align-items:end;border-radius:14px;display:flex;height:48px;justify-content:center;overflow:hidden}.list-person>i[data-theme='daycare']{background:#e8f7e1}.list-person>i[data-theme='preescolar']{background:#fff5cf}.list-person>i[data-theme='primaria']{background:#e8f3fc}.list-person>i[data-theme='secundaria']{background:#ffe7e2}.list-person img{height:45px;object-fit:contain;width:100%}.list-person small,.list-person strong,.list-person em,.list-context strong,.list-context small,.list-activity strong,.list-activity small{display:block}.list-person small{color:#8a9698;font-size:.51rem}.list-person strong{font-family:var(--font-title);font-size:.79rem;margin-top:2px}.list-person em{color:#6d7d80;font-size:.58rem;font-style:normal;margin-top:2px}.list-context strong{font-size:.63rem}.list-context small{color:#7d8c8e;font-size:.55rem;margin-top:4px}.list-activity strong{font-size:.58rem}.list-activity strong[data-tone='urgent']{color:#b6483e}.list-activity strong[data-tone='warning']{color:#916a11}.list-activity strong[data-tone='success'],.list-activity strong[data-tone='fresh']{color:#4c7d28}.list-activity small{color:#879496;font-size:.52rem;margin-top:4px}.lead-list-row>svg{color:#8b9a9b}
@media(max-width:1200px){.filters-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.crm-board{grid-template-columns:repeat(5,minmax(245px,1fr))}.leads-list-head,.lead-list-row{grid-template-columns:minmax(240px,1.25fr) minmax(170px,1fr) minmax(120px,.6fr) minmax(170px,.8fr) 20px}}
@media(max-width:900px){.crm-hero{grid-template-columns:1fr}.crm-hero__visual{display:none}.crm-summary{grid-template-columns:repeat(2,1fr)}.workbench-top{grid-template-columns:1fr auto}.filter-toggle{grid-column:2}.view-switch{grid-column:1;grid-row:2;justify-self:start}.filters-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.leads-list-head{display:none}.lead-list-row{grid-template-columns:1fr auto;padding:14px}.lead-list-row>.list-context,.lead-list-row>span:nth-child(3),.lead-list-row>.list-activity{grid-column:1}.lead-list-row>.list-context{margin-left:58px}.lead-list-row>span:nth-child(3){margin-left:58px}.lead-list-row>.list-activity{margin-left:58px}.lead-list-row>svg{grid-column:2;grid-row:1}}
@media(max-width:720px){.crm-hero{min-height:0;padding:23px 19px}.crm-hero h1{font-size:2.35rem}.crm-hero__actions .mkt-btn{flex:1}.crm-summary{gap:8px}.crm-summary article{gap:8px;grid-template-columns:38px 1fr;min-height:82px;padding:12px}.summary-icon{border-radius:12px;height:38px;width:38px}.crm-summary strong{font-size:1.4rem}.workbench-top{grid-template-columns:1fr auto;padding:10px}.crm-search{grid-column:1/-1}.view-switch{grid-column:1}.filter-toggle{grid-column:2;grid-row:2}.filters-grid{grid-template-columns:1fr;padding:12px}.filter-actions{justify-content:stretch}.filter-actions .mkt-btn{flex:1}.mobile-stage-tabs{display:flex;gap:7px;overflow-x:auto;padding:2px 1px 5px;scrollbar-width:none}.mobile-stage-tabs button{align-items:center;background:#fff;border:1px solid #dce7e2;border-radius:999px;color:#718083;display:flex;flex:0 0 auto;font:inherit;font-size:.58rem;font-weight:900;gap:7px;min-height:37px;padding:0 11px}.mobile-stage-tabs button b{align-items:center;background:#eef5f2;border-radius:50%;display:flex;font-size:.52rem;height:22px;justify-content:center;min-width:22px}.mobile-stage-tabs button.active{background:var(--mkt-teal);border-color:var(--mkt-teal);color:#fff}.mobile-stage-tabs button.active b{background:rgba(255,255,255,.18)}.crm-board{display:block;overflow:visible}.stage-column{display:block;min-width:0}.stage-column.mobile-hidden{display:none}.stage-cards{max-height:none}.empty-column{min-height:280px}.leads-list-row>.list-context,.lead-list-row>span:nth-child(3),.lead-list-row>.list-activity{margin-left:0}.lead-list-row>span:nth-child(3){display:none}.list-activity small{display:none}}
</style>
