<template>
  <section class="mkt-page leads-page" data-product-area="mkt" data-product-screen="informes">
    <header class="leads-hero mkt-panel">
      <div>
        <p class="mkt-eyebrow">CRM de informes</p>
        <h1>Seguimiento de familias</h1>
        <p>Encuentra qué conversación necesita atención y registra el avance sin perder el contexto.</p>
      </div>
      <div class="leads-hero__actions">
        <a class="mkt-btn" :href="exportUrl"><FamilyPersonasIcon name="download" /> Exportar CSV</a>
        <button class="mkt-btn primary" type="button" @click="openNew"><FamilyPersonasIcon name="plus" /> Nuevo informe</button>
      </div>
    </header>

    <section class="crm-summary" aria-label="Resumen del CRM">
      <article><small>Resultados visibles</small><strong>{{ response?.total || 0 }}</strong></article>
      <article><small>Sin primer contacto</small><strong>{{ stageCount('Leads Entrantes') }}</strong></article>
      <article><small>En negociación</small><strong>{{ stageCount('Negociación') }}</strong></article>
      <article class="conversion"><small>Conversión visible</small><strong>{{ conversionRate }}%</strong></article>
    </section>

    <form class="filters-panel mkt-panel" role="search" @submit.prevent="applyFilters">
      <label class="search-field">
        <FamilyPersonasIcon name="search" />
        <input v-model="draft.search" type="search" placeholder="Buscar folio, estudiante, tutor o teléfono" aria-label="Buscar informes" />
      </label>
      <label><span>Etapa</span><select v-model="draft.stage"><option value="all">Todas</option><option v-for="stage in stages" :key="stage" :value="stage">{{ stage }}</option></select></label>
      <label><span>Vía</span><select v-model="draft.channel"><option value="all">Todas</option><option v-for="channel in response?.options.channels || []" :key="channel" :value="channel">{{ channelLabel(channel) }}</option></select></label>
      <label><span>Plantel</span><select v-model="draft.plantel"><option value="all">Todos</option><option v-for="plantel in response?.options.planteles || []" :key="plantel" :value="plantel">{{ plantel }}</option></select></label>
      <button class="mkt-btn soft" type="submit">Aplicar</button>
      <button v-if="hasFilters" class="clear-filters" type="button" @click="clearFilters">Limpiar</button>
    </form>

    <section v-if="pending" class="mkt-panel mkt-empty"><HuskyPassLoader label="Informes" contained /></section>
    <section v-else-if="loadError" class="mkt-panel mkt-empty">
      <FamilyPersonasIcon name="alert" /><h2>No pudimos cargar los informes</h2><p>Intenta de nuevo; ningún dato fue modificado.</p><button class="mkt-btn" type="button" @click="() => refresh()">Reintentar</button>
    </section>

    <section v-else class="crm-board" aria-label="Embudo de informes">
      <article v-for="(stage, stageIndex) in stages" :key="stage" class="stage-column" :data-stage-index="stageIndex">
        <header>
          <span class="stage-dot" />
          <div><strong>{{ stage }}</strong><small>{{ stageDescription(stage) }}</small></div>
          <b>{{ leadsForStage(stage).length }}</b>
        </header>
        <div class="stage-cards">
          <button v-for="lead in visibleLeadsForStage(stage)" :key="lead.folio" class="lead-card" type="button" @click="openLead(lead.folio)">
            <span class="lead-card__top"><em>{{ lead.folio }}</em><time>{{ formatDate(lead.lastFollowUpAt || lead.createdAt) }}</time></span>
            <strong>{{ lead.studentName }}</strong>
            <small>{{ lead.contactName }}</small>
            <span class="lead-context"><i>{{ lead.plantel || '—' }}</i><i>{{ lead.level || 'Nivel pendiente' }}</i></span>
            <span class="lead-card__foot"><span>{{ channelLabel(lead.channel) }}</span><b>{{ lead.followUpCount }} seg.</b></span>
          </button>
          <div v-if="stageCount(stage) > maxCardsPerStage" class="column-more">
            Mostrando {{ maxCardsPerStage }} de {{ stageCount(stage) }}. Usa los filtros para encontrar un informe.
          </div>
          <div v-if="!leadsForStage(stage).length" class="empty-column">
            <FamilyPersonasIcon :name="stage === 'Inscrito' ? 'check' : 'clipboard'" />
            <span>{{ emptyStageMessage(stage) }}</span>
          </div>
        </div>
      </article>
    </section>

    <MktLeadFormModal
      v-if="newOpen"
      :planteles="response?.options.planteles || []"
      :channels="response?.options.channels || []"
      @close="closeNew"
      @created="handleCreated"
    />
    <MktLeadDrawer v-if="selectedFolio" :folio="selectedFolio" @close="closeLead" @updated="handleUpdated" />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import { MKT_STAGES, type MktLeadDetail, type MktLeadsResponse, type MktStage } from '~/types/mkt'
import MktLeadDrawer from '~/components/mkt/MktLeadDrawer.vue'
import MktLeadFormModal from '~/components/mkt/MktLeadFormModal.vue'

definePageMeta({ layout: 'mkt', middleware: ['admin', 'mkt'] })

const route = useRoute()
const router = useRouter()
const stages = [...MKT_STAGES]
const maxCardsPerStage = 50
const applied = reactive({
  search: String(route.query.search || ''), stage: String(route.query.stage || 'all'),
  channel: String(route.query.channel || 'all'), plantel: String(route.query.plantel || 'all')
})
const draft = reactive({ ...applied })
const requestQuery = computed(() => ({ ...applied, limit: 500 }))
const { data: response, pending, error: loadError, refresh } = useFetch<MktLeadsResponse>('/api/mkt/leads', { query: requestQuery })
const newOpen = ref(String(route.query.new || '') === '1')
const selectedFolio = ref(String(route.query.lead || ''))
const hasFilters = computed(() => Boolean(applied.search || applied.stage !== 'all' || applied.channel !== 'all' || applied.plantel !== 'all'))
const exportUrl = computed(() => {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(applied)) if (value && value !== 'all') params.set(key, value)
  return `/api/mkt/leads/export${params.size ? `?${params.toString()}` : ''}`
})
const conversionRate = computed(() => {
  const total = response.value?.leads.length || 0
  return total ? Math.round((stageCount('Inscrito') / total) * 100) : 0
})

watch(() => route.query.new, (value) => { newOpen.value = String(value || '') === '1' })
watch(() => route.query.lead, (value) => { selectedFolio.value = String(value || '') })

function leadsForStage(stage: MktStage) {
  return response.value?.leads.filter((lead) => lead.stage === stage) || []
}
function visibleLeadsForStage(stage: MktStage) { return leadsForStage(stage).slice(0, maxCardsPerStage) }
function stageCount(stage: MktStage) { return leadsForStage(stage).length }

async function applyFilters() {
  Object.assign(applied, draft)
  await router.replace({ path: route.path, query: filterRouteQuery() })
}

async function clearFilters() {
  Object.assign(draft, { search: '', stage: 'all', channel: 'all', plantel: 'all' })
  Object.assign(applied, draft)
  await router.replace({ path: route.path })
}

function filterRouteQuery() {
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(applied)) {
    if (value && value !== 'all') query[key] = value
  }
  return query
}

async function openNew() { await router.replace({ path: route.path, query: { ...route.query, new: '1', lead: undefined } }) }
async function closeNew() { await router.replace({ path: route.path, query: { ...route.query, new: undefined } }) }
async function openLead(folio: string) { await router.replace({ path: route.path, query: { ...route.query, lead: folio, new: undefined } }) }
async function closeLead() { await router.replace({ path: route.path, query: { ...route.query, lead: undefined } }) }

async function handleCreated(lead: MktLeadDetail) {
  await refresh()
  await router.replace({ path: route.path, query: { lead: lead.folio } })
}
async function handleUpdated() { await refresh() }

function channelLabel(value: string) {
  const normalized = value.trim().toLocaleLowerCase('es-MX')
  if (normalized === 'whatsapp') return 'WhatsApp'
  if (normalized === 'redes sociales') return 'Redes sociales'
  if (normalized === 'vía telefónica' || normalized === 'via telefonica') return 'Vía telefónica'
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Sin vía'
}

function formatDate(value: string | null) {
  if (!value) return 'Sin actividad'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(date)
}

function stageDescription(stage: MktStage) {
  return ({ 'Leads Entrantes': 'Por contactar', 'Primer contacto': 'Conversación abierta', 'Discusión': 'Evaluando opciones', 'Negociación': 'Cerca de decidir', 'Inscrito': 'Conversión lograda' } as Record<MktStage, string>)[stage]
}
function emptyStageMessage(stage: MktStage) { return stage === 'Inscrito' ? 'Las conversiones aparecerán aquí' : 'No hay informes en esta etapa' }
</script>

<style scoped>
.leads-hero{align-items:center;background:radial-gradient(circle at 86% 20%,rgba(79,139,201,.14),transparent 18rem),linear-gradient(135deg,#fff,#f3faf6);display:grid;gap:20px;grid-template-columns:minmax(0,1fr) auto;padding:clamp(22px,3vw,34px)}.leads-hero h1{font-size:clamp(2rem,3.4vw,3.2rem);letter-spacing:-.035em;line-height:1}.leads-hero p:last-child{font-size:.82rem;margin:10px 0 0;max-width:720px}.leads-hero__actions{display:flex;flex-wrap:wrap;gap:9px;justify-content:flex-end}
.crm-summary{display:grid;gap:10px;grid-template-columns:repeat(4,minmax(0,1fr))}.crm-summary article{background:rgba(255,255,255,.92);border:1px solid var(--mkt-line);border-radius:18px;box-shadow:0 10px 28px rgba(14,55,61,.045);display:flex;flex-direction:column;gap:5px;min-height:82px;padding:14px}.crm-summary small{color:#798789;font-size:.67rem}.crm-summary strong{font-family:var(--font-title);font-size:1.65rem;line-height:1}.crm-summary .conversion{background:linear-gradient(135deg,#edf8f2,#fff9df)}
.filters-panel{align-items:end;display:grid;gap:10px;grid-template-columns:minmax(240px,1.4fr) repeat(3,minmax(130px,.55fr)) auto auto;padding:13px}.search-field{align-items:center;background:#f8fbf9;border:1px solid #dce7e3;border-radius:13px;display:grid;gap:8px;grid-template-columns:18px minmax(0,1fr);min-height:44px;padding:0 12px}.search-field svg{color:#728285}.search-field input,.filters-panel select{background:transparent;border:0;color:#29454a;font:inherit;font-size:.75rem;min-width:0;outline:0;width:100%}.filters-panel>label:not(.search-field){display:grid;gap:5px}.filters-panel>label>span{color:#78878a;font-size:.62rem}.filters-panel select{background:#f8fbf9;border:1px solid #dce7e3;border-radius:13px;min-height:44px;padding:0 9px}.clear-filters{background:transparent;border:0;color:#8a6661;cursor:pointer;font-size:.68rem;padding:0 7px 13px}
.crm-board{display:grid;gap:12px;grid-template-columns:repeat(5,minmax(220px,1fr));overflow-x:auto;padding:2px 1px 20px;scrollbar-color:#cbded7 transparent;scrollbar-width:thin}.stage-column{background:rgba(242,247,244,.76);border:1px solid rgba(18,73,76,.1);border-radius:20px;min-width:220px;overflow:hidden}.stage-column>header{align-items:center;background:rgba(255,255,255,.8);border-bottom:1px solid var(--mkt-line);display:grid;gap:9px;grid-template-columns:10px minmax(0,1fr) auto;min-height:72px;padding:12px}.stage-dot{background:#8fc849;border-radius:99px;height:10px;width:10px}.stage-column[data-stage-index='1'] .stage-dot{background:#4f8bc9}.stage-column[data-stage-index='2'] .stage-dot{background:#f6c745}.stage-column[data-stage-index='3'] .stage-dot{background:#ec6b5d}.stage-column[data-stage-index='4'] .stage-dot{background:#0b6b61}.stage-column header strong,.stage-column header small{display:block}.stage-column header strong{font-size:.75rem}.stage-column header small{color:#849193;font-size:.61rem;margin-top:2px}.stage-column header b{align-items:center;background:#edf4f1;border-radius:99px;display:flex;font-size:.67rem;height:27px;justify-content:center;min-width:27px}.stage-cards{display:grid;gap:9px;max-height:660px;min-height:180px;overflow-y:auto;padding:10px;scrollbar-width:thin}.lead-card{background:#fff;border:1px solid #dfe8e4;border-left:3px solid #8fc849;border-radius:15px;box-shadow:0 8px 20px rgba(14,55,61,.055);color:#263f44;cursor:pointer;display:grid;font:inherit;gap:5px;padding:12px;text-align:left;transition:.16s ease;width:100%}.stage-column[data-stage-index='1'] .lead-card{border-left-color:#4f8bc9}.stage-column[data-stage-index='2'] .lead-card{border-left-color:#f6c745}.stage-column[data-stage-index='3'] .lead-card{border-left-color:#ec6b5d}.stage-column[data-stage-index='4'] .lead-card{border-left-color:#0b6b61}.lead-card:hover{border-color:#bcd9ce;box-shadow:0 12px 24px rgba(14,55,61,.1);transform:translateY(-1px)}.lead-card__top,.lead-card__foot,.lead-context{align-items:center;display:flex;gap:6px;justify-content:space-between}.lead-card__top em{color:#0b6b61;font-size:.63rem;font-style:normal;font-weight:900}.lead-card__top time{color:#9aa3a4;font-size:.58rem}.lead-card>strong{font-size:.75rem;margin-top:4px}.lead-card>small{color:#788689;font-size:.64rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.lead-context{justify-content:flex-start;margin-top:5px}.lead-context i{background:#f2f6f4;border-radius:7px;color:#748184;font-size:.57rem;font-style:normal;padding:4px 5px}.lead-card__foot{border-top:1px solid #edf1ef;color:#7c898b;font-size:.59rem;margin-top:5px;padding-top:8px}.lead-card__foot b{color:#56726e}.column-more{background:#edf4f1;border-radius:12px;color:#6f7e80;font-size:.6rem;line-height:1.45;padding:10px}.empty-column{align-items:center;color:#91a09f;display:grid;font-size:.65rem;gap:8px;justify-items:center;min-height:140px;padding:20px;text-align:center}.empty-column svg{height:22px;width:22px}
@media(max-width:1100px){.filters-panel{grid-template-columns:repeat(4,1fr)}.search-field{grid-column:1/-1}.clear-filters{padding-bottom:0}.crm-board{grid-template-columns:repeat(5,minmax(270px,320px))}}
@media(max-width:720px){.leads-hero{grid-template-columns:1fr}.leads-hero__actions{justify-content:start}.crm-summary{grid-template-columns:repeat(2,1fr)}.filters-panel{grid-template-columns:repeat(2,1fr)}.search-field{grid-column:1/-1}.filters-panel .mkt-btn{width:100%}.crm-board{margin-inline:-12px;padding-inline:12px}.stage-column{min-width:82vw}}
@media(max-width:450px){.leads-hero__actions{display:grid}.crm-summary{grid-template-columns:1fr 1fr}.filters-panel{grid-template-columns:1fr}.search-field{grid-column:auto}}
</style>
