<template>
  <section class="mkt-page mkt-dashboard" data-product-area="mkt" data-product-screen="overview">
    <header class="command-hero mkt-panel">
      <div class="command-copy">
        <p class="mkt-eyebrow">Mercadotecnia · {{ longDate }}</p>
        <h1>{{ greeting }}, {{ firstName }}</h1>
        <p>{{ heroMessage }}</p>
        <div class="command-actions">
          <NuxtLink class="mkt-btn primary" to="/mkt/informes?new=1"><FamilyPersonasIcon name="plus" />Nuevo informe</NuxtLink>
          <NuxtLink class="mkt-btn soft" to="/mkt/informes"><FamilyPersonasIcon name="target" />Abrir seguimiento</NuxtLink>
        </div>
      </div>
      <div class="command-visual">
        <MktAmbassadorCluster />
        <div class="pulse-card">
          <span><FamilyPersonasIcon name="trend" /></span>
          <div><small>Conversión histórica</small><strong>{{ overview?.metrics.conversionRate || 0 }}%</strong></div>
        </div>
      </div>
    </header>

    <section v-if="pending" class="mkt-panel mkt-empty" data-state="loading"><HuskyPassLoader label="Mercadotecnia" contained /></section>
    <section v-else-if="loadError" class="mkt-panel mkt-empty" data-state="error"><FamilyPersonasIcon name="alert" /><h2>No pudimos cargar el panorama</h2><p>Vuelve a intentarlo; ningún dato fue modificado.</p><button class="mkt-btn" type="button" @click="() => refresh()">Reintentar</button></section>

    <template v-else-if="overview">
      <section class="mkt-metrics" aria-label="Indicadores de Mercadotecnia">
        <NuxtLink class="mkt-metric urgent" to="/mkt/informes?stage=Leads%20Entrantes">
          <span class="metric-icon coral"><FamilyPersonasIcon name="bell" /></span><div><small>Sin primer contacto</small><strong>{{ overview.metrics.pendingContact }}</strong></div><em>Atender ahora</em>
        </NuxtLink>
        <NuxtLink class="mkt-metric" to="/mkt/informes?attention=stale">
          <span class="metric-icon yellow"><FamilyPersonasIcon name="deadline" /></span><div><small>Sin actividad +7 días</small><strong>{{ overview.metrics.staleLeads }}</strong></div><em>Retomar</em>
        </NuxtLink>
        <article class="mkt-metric">
          <span class="metric-icon blue"><FamilyPersonasIcon name="phone" /></span><div><small>Respuesta inicial</small><strong>{{ responseTime }}</strong></div><em>Promedio histórico</em>
        </article>
        <article class="mkt-metric">
          <span class="metric-icon lime"><FamilyPersonasIcon name="people" /></span><div><small>Nuevos esta semana</small><strong>{{ overview.metrics.newThisWeek }}</strong></div><em>{{ overview.metrics.followUpsToday }} seguimientos hoy</em>
        </article>
        <NuxtLink class="mkt-metric success" to="/mkt/informes?stage=Inscrito">
          <span class="metric-icon teal"><FamilyPersonasIcon name="check" /></span><div><small>Inscritos</small><strong>{{ overview.metrics.enrolled }}</strong></div><em>{{ overview.metrics.conversionRate }}% de la base</em>
        </NuxtLink>
      </section>

      <section class="work-grid">
        <article class="mkt-panel attention-panel">
          <div class="mkt-section-head">
            <div><p class="mkt-eyebrow">Cola prioritaria</p><h2>Familias que necesitan movimiento</h2></div>
            <NuxtLink to="/mkt/informes?attention=stale">Ver CRM <FamilyPersonasIcon name="arrow" /></NuxtLink>
          </div>
          <div v-if="overview.attentionLeads.length" class="attention-list">
            <NuxtLink v-for="lead in overview.attentionLeads.slice(0, 6)" :key="lead.folio" :to="`/mkt/informes?lead=${encodeURIComponent(lead.folio)}`" class="attention-row">
              <span class="lead-avatar" :data-theme="mktPlantelLevel(lead.plantel, lead.level)"><img :src="mktAmbassadorForLead(lead).src" alt="" /></span>
              <span class="attention-person"><strong>{{ lead.studentName }}</strong><small>{{ lead.contactName }} · {{ mktPlantelDisplay(lead.plantel, lead.level) }}</small></span>
              <span class="attention-state" :data-tone="mktLeadAttention(lead).tone">{{ mktLeadAttention(lead).label }}</span>
              <FamilyPersonasIcon name="arrow" />
            </NuxtLink>
          </div>
          <MktEmptyState v-else title="Seguimientos al día" description="No hay familias en espera o sin actividad." icon="check" ambassador="primaria" tone="green"><NuxtLink class="mkt-btn soft" to="/mkt/informes?stage=Negociaci%C3%B3n">Ver negociaciones</NuxtLink></MktEmptyState>
        </article>

        <aside class="mkt-panel daily-panel">
          <div class="mkt-section-head compact"><div><p class="mkt-eyebrow">Jornada</p><h2>Bitácora de hoy</h2></div><span class="journal-dot" :data-complete="overview.journal.completedToday" /></div>
          <div class="journal-card" :data-complete="overview.journal.completedToday">
            <span><FamilyPersonasIcon :name="overview.journal.completedToday ? 'check' : 'clipboard'" /></span>
            <div><strong>{{ overview.journal.completedToday ? 'Registro guardado' : 'Registro pendiente' }}</strong><p>{{ journalPreview }}</p></div>
            <NuxtLink class="mkt-btn" to="/mkt/bitacora">{{ overview.journal.completedToday ? 'Abrir' : 'Completar' }}</NuxtLink>
          </div>
          <div class="daily-number"><small>Seguimientos registrados hoy</small><strong>{{ overview.metrics.followUpsToday }}</strong><span>actividad del equipo</span></div>
          <NuxtLink class="analytics-link" to="/mkt/analitica"><span><FamilyPersonasIcon name="chart" /></span><div><strong>Rendimiento</strong><small>Conversión, canales y planteles</small></div><FamilyPersonasIcon name="arrow" /></NuxtLink>
        </aside>
      </section>

      <section class="insight-grid">
        <article class="mkt-panel pipeline-panel">
          <div class="mkt-section-head"><div><p class="mkt-eyebrow">Embudo vivo</p><h2>Distribución de informes</h2></div><span>{{ overview.metrics.totalLeads }} registros</span></div>
          <div class="pipeline-list">
            <NuxtLink v-for="(item, index) in overview.stageBreakdown" :key="item.stage" :to="`/mkt/informes?stage=${encodeURIComponent(item.stage)}`" class="pipeline-row" :data-index="index">
              <span class="pipeline-order">0{{ index + 1 }}</span><span class="pipeline-copy"><strong>{{ item.stage }}</strong><small>{{ MKT_STAGE_META[item.stage].description }}</small></span><span class="pipeline-track"><i :style="{ width: `${pipelineWidth(item.count)}%` }" /></span><b>{{ item.count }}</b>
            </NuxtLink>
          </div>
        </article>

        <article class="mkt-panel channels-panel">
          <div class="mkt-section-head"><div><p class="mkt-eyebrow">Últimos 30 días</p><h2>Canales de captación</h2></div><NuxtLink to="/mkt/analitica">Analizar <FamilyPersonasIcon name="arrow" /></NuxtLink></div>
          <div v-if="overview.channelBreakdown.length" class="channel-bars">
            <div v-for="(row, index) in overview.channelBreakdown.slice(0, 6)" :key="row.channel"><span><strong>{{ mktChannelLabel(row.channel) }}</strong><small>{{ row.count }} informes</small></span><i><b :style="{ width: `${channelWidth(row.count)}%` }" :data-index="index" /></i></div>
          </div>
          <MktEmptyState v-else title="Aún no hay captación reciente" icon="announcement" ambassador="preescolar" tone="yellow" />
        </article>
      </section>

      <section class="mkt-panel recent-panel">
        <div class="mkt-section-head"><div><p class="mkt-eyebrow">Actividad reciente</p><h2>Últimos informes</h2></div><NuxtLink to="/mkt/informes">Ver todos <FamilyPersonasIcon name="arrow" /></NuxtLink></div>
        <div v-if="overview.recentLeads.length" class="recent-grid">
          <NuxtLink v-for="lead in overview.recentLeads" :key="lead.folio" :to="`/mkt/informes?lead=${encodeURIComponent(lead.folio)}`" class="recent-card">
            <span class="recent-mascot" :data-theme="mktPlantelLevel(lead.plantel, lead.level)"><img :src="mktAmbassadorForLead(lead).src" alt="" /></span>
            <div><small>{{ lead.folio }} · {{ mktRelativeDate(lead.lastFollowUpAt || lead.createdAt) }}</small><strong>{{ lead.studentName }}</strong><p>{{ lead.contactName }} · {{ mktChannelLabel(lead.channel) }}</p></div>
            <span class="mkt-stage-chip" :data-stage="lead.stage">{{ lead.stage }}</span>
          </NuxtLink>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { MktOverviewResponse } from '~/types/mkt'
import { useAppSession } from '~/composables/useAppSession'
import { MKT_STAGE_META, mktAmbassadorForLead, mktChannelLabel, mktLeadAttention, mktPlantelDisplay, mktPlantelLevel, mktRelativeDate } from '~/utils/mkt'

definePageMeta({ layout: 'mkt', middleware: ['admin', 'mkt'] })
const mexicoDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const { data: session } = useAppSession()
const { data: overview, pending, error: loadError, refresh } = useFetch<MktOverviewResponse>('/api/mkt/overview', { query: { today: mexicoDate } })
const hour = Number(new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', hour12: false }).format(new Date()))
const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
const firstName = computed(() => session.value?.user?.displayName?.trim().split(/\s+/)[0] || 'equipo')
const longDate = new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
const pipelineMax = computed(() => Math.max(...(overview.value?.stageBreakdown.map((item) => item.count) || [1]), 1))
const channelMax = computed(() => Math.max(...(overview.value?.channelBreakdown.map((item) => item.count) || [1]), 1))
const responseTime = computed(() => overview.value?.metrics.averageFirstResponseHours === null || overview.value?.metrics.averageFirstResponseHours === undefined ? '—' : `${overview.value.metrics.averageFirstResponseHours} h`)
const journalPreview = computed(() => overview.value?.journal.activities || overview.value?.journal.achievements || 'Logros, actividades, contenido y pendientes del día.')
const heroMessage = computed(() => {
  const pendingCount = overview.value?.metrics.pendingContact || 0
  if (pendingCount) return `${pendingCount} ${pendingCount === 1 ? 'familia espera' : 'familias esperan'} el primer contacto. La prioridad está lista para avanzar.`
  const stale = overview.value?.metrics.staleLeads || 0
  if (stale) return `Los primeros contactos están cubiertos. Hay ${stale} conversaciones que conviene reactivar.`
  return 'El embudo está en movimiento. Revisa el rendimiento y mantén la jornada documentada.'
})
function pipelineWidth(count: number) { return count ? Math.max(8, Math.round((count / pipelineMax.value) * 100)) : 0 }
function channelWidth(count: number) { return count ? Math.max(9, Math.round((count / channelMax.value) * 100)) : 0 }
</script>

<style scoped>
.command-hero{align-items:center;background:radial-gradient(circle at 84% 12%,rgba(246,199,68,.2),transparent 20rem),radial-gradient(circle at 2% 100%,rgba(134,199,77,.16),transparent 22rem),linear-gradient(135deg,#fff,#f3faf6);display:grid;gap:20px;grid-template-columns:minmax(0,1fr) minmax(360px,.68fr);min-height:260px;overflow:hidden;padding:clamp(24px,4vw,48px);position:relative}.command-hero:before{background:linear-gradient(180deg,var(--mkt-lime),var(--mkt-yellow),var(--mkt-coral),var(--mkt-blue));border-radius:99px;content:'';height:116px;left:0;position:absolute;top:34px;width:6px}.command-copy h1{font-size:clamp(2.3rem,4.3vw,4.2rem);letter-spacing:-.045em;line-height:.95}.command-copy>p:last-of-type{font-size:.86rem;line-height:1.6;margin:13px 0 0;max-width:700px}.command-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}.command-visual{align-items:center;display:flex;justify-content:flex-end;position:relative}.pulse-card{align-items:center;background:rgba(255,255,255,.92);border:1px solid #dce9e3;border-radius:17px;bottom:5px;box-shadow:0 16px 36px rgba(14,55,61,.12);display:flex;gap:10px;padding:10px 13px;position:absolute;right:8px}.pulse-card>span{align-items:center;background:#edf8e8;border-radius:12px;color:#57922c;display:flex;height:36px;justify-content:center;width:36px}.pulse-card small,.pulse-card strong{display:block}.pulse-card small{color:#7d8b8d;font-size:.57rem}.pulse-card strong{font-family:var(--font-title);font-size:1.15rem;margin-top:2px}
.mkt-metrics{display:grid;gap:11px;grid-template-columns:repeat(5,minmax(0,1fr))}.mkt-metric{align-items:center;background:rgba(255,255,255,.95);border:1px solid var(--mkt-line);border-radius:20px;box-shadow:0 13px 34px rgba(14,55,61,.05);color:inherit;display:grid;gap:10px;grid-template-columns:42px minmax(0,1fr);min-height:108px;padding:14px;transition:.16s}.mkt-metric:hover{box-shadow:0 18px 40px rgba(14,55,61,.1);transform:translateY(-2px)}.mkt-metric em{color:#829093;font-size:.62rem;font-style:normal;grid-column:1/-1}.mkt-metric small{color:#718083;display:block;font-size:.65rem}.mkt-metric strong{display:block;font-family:var(--font-title);font-size:1.85rem;line-height:1;margin-top:4px}.metric-icon{align-items:center;background:#edf8f3;border-radius:14px;color:#0b6b61;display:flex;height:42px;justify-content:center;width:42px}.metric-icon.blue{background:#edf5fc;color:#4f8bc9}.metric-icon.coral{background:#fff0ed;color:#d95b4d}.metric-icon.yellow{background:#fff8df;color:#9b7112}.metric-icon.lime{background:#eff8e9;color:#5e912e}.metric-icon.teal{background:#e7f5ef;color:#0b6b61}.mkt-metric.urgent{border-color:rgba(236,105,91,.3)}.mkt-metric.success{background:linear-gradient(145deg,#f0f9eb,#fff)}
.work-grid{align-items:start;display:grid;gap:18px;grid-template-columns:minmax(0,1.45fr) minmax(300px,.55fr)}.attention-panel,.daily-panel,.pipeline-panel,.channels-panel,.recent-panel{padding:clamp(16px,2vw,24px)}.mkt-section-head{align-items:center;border-bottom:1px solid var(--mkt-line);display:flex;gap:16px;justify-content:space-between;margin-bottom:14px;padding-bottom:14px}.mkt-section-head.compact{border-bottom:0;margin-bottom:8px;padding-bottom:0}.mkt-section-head h2{font-size:clamp(1.25rem,2vw,1.75rem)}.mkt-section-head>a{align-items:center;color:var(--mkt-teal);display:inline-flex;font-size:.68rem;font-weight:900;gap:6px;white-space:nowrap}.mkt-section-head>span{color:#829092;font-size:.65rem}.attention-list{display:grid}.attention-row{align-items:center;border-bottom:1px solid #e9efec;color:inherit;display:grid;gap:11px;grid-template-columns:48px minmax(0,1fr) auto 18px;min-height:66px;padding:8px 2px}.attention-row:last-child{border-bottom:0}.lead-avatar,.recent-mascot{align-items:end;background:#e8f5ed;border-radius:13px;display:flex;height:48px;justify-content:center;overflow:hidden}.lead-avatar[data-theme='preescolar'],.recent-mascot[data-theme='preescolar']{background:#fff3ca}.lead-avatar[data-theme='primaria'],.recent-mascot[data-theme='primaria']{background:#e7f2fc}.lead-avatar[data-theme='secundaria'],.recent-mascot[data-theme='secundaria']{background:#ffe8e3}.lead-avatar img,.recent-mascot img{height:46px;object-fit:contain}.attention-person strong,.attention-person small{display:block}.attention-person strong{font-size:.75rem}.attention-person small{color:#7d8b8d;font-size:.62rem;margin-top:2px}.attention-state{border-radius:99px;font-size:.58rem;font-weight:900;padding:5px 8px}.attention-state[data-tone='urgent']{background:#fff0ed;color:#aa433a}.attention-state[data-tone='warning']{background:#fff7dc;color:#80600f}.attention-state[data-tone='active']{background:#e8f2fb;color:#3375ad}.attention-state[data-tone='fresh']{background:#e7f6ef;color:#0b6b61}.attention-state[data-tone='neutral']{background:#eef3f1;color:#607174}.attention-row>svg{color:#97a3a3}.attention-panel :deep(.mkt-empty-state){border:0;min-height:240px;padding:12px}.attention-panel :deep(.mkt-ambassadors){min-width:180px}
.daily-panel{display:grid;gap:12px}.journal-dot{background:#e4a92c;border:5px solid #fff4cb;border-radius:50%;height:17px;width:17px}.journal-dot[data-complete='true']{background:#5d9c35;border-color:#e7f6df}.journal-card{align-items:center;background:linear-gradient(145deg,#fff8df,#fff);border:1px solid #ebdca8;border-radius:19px;display:grid;gap:10px;grid-template-columns:42px minmax(0,1fr);padding:14px}.journal-card[data-complete='true']{background:linear-gradient(145deg,#edf8f1,#fff);border-color:#d4e8dc}.journal-card>span{align-items:center;background:#f7ebc6;border-radius:13px;color:#8c6715;display:flex;height:42px;justify-content:center;width:42px}.journal-card[data-complete='true']>span{background:#e0f1e7;color:#0b6b61}.journal-card strong{font-size:.75rem}.journal-card p{font-size:.63rem;line-height:1.45;margin:3px 0 0}.journal-card .mkt-btn{grid-column:1/-1;width:100%}.daily-number{background:#0b5c55;border-radius:19px;color:#fff;display:grid;gap:4px;padding:17px}.daily-number small{font-size:.62rem;opacity:.75}.daily-number strong{font-family:var(--font-title);font-size:2.45rem;line-height:1}.daily-number span{font-size:.61rem;opacity:.7}.analytics-link{align-items:center;background:#f7faf8;border:1px solid #e0eae5;border-radius:17px;color:inherit;display:grid;gap:10px;grid-template-columns:38px minmax(0,1fr) 18px;padding:12px}.analytics-link>span{align-items:center;background:#e9f2fb;border-radius:12px;color:#3c7db7;display:flex;height:38px;justify-content:center;width:38px}.analytics-link strong,.analytics-link small{display:block}.analytics-link strong{font-size:.72rem}.analytics-link small{color:#7d8b8d;font-size:.59rem;margin-top:2px}.analytics-link>svg{color:#8c9999}
.insight-grid{display:grid;gap:18px;grid-template-columns:minmax(0,1.1fr) minmax(340px,.9fr)}.pipeline-list{display:grid;gap:5px}.pipeline-row{align-items:center;border:1px solid transparent;border-radius:15px;color:inherit;display:grid;gap:12px;grid-template-columns:32px minmax(160px,.8fr) minmax(120px,1fr) 40px;padding:10px;transition:.16s}.pipeline-row:hover{background:#f6fbf8;border-color:#dbece4}.pipeline-order{color:#a2acad;font-size:.67rem}.pipeline-copy strong,.pipeline-copy small{display:block}.pipeline-copy strong{font-size:.76rem}.pipeline-copy small{color:#849092;font-size:.61rem;margin-top:2px}.pipeline-track{background:#eef3f1;border-radius:99px;height:8px;overflow:hidden}.pipeline-track i{background:var(--mkt-lime);border-radius:99px;display:block;height:100%}.pipeline-row[data-index='1'] i{background:var(--mkt-blue)}.pipeline-row[data-index='2'] i{background:var(--mkt-yellow)}.pipeline-row[data-index='3'] i{background:var(--mkt-coral)}.pipeline-row[data-index='4'] i{background:var(--mkt-teal)}.pipeline-row b{font-family:var(--font-title);font-size:1rem;text-align:right}.channel-bars{display:grid;gap:14px}.channel-bars>div{display:grid;gap:7px}.channel-bars span{align-items:center;display:flex;justify-content:space-between}.channel-bars strong{font-size:.7rem}.channel-bars small{color:#829092;font-size:.61rem}.channel-bars i{background:#eef3f1;border-radius:99px;height:9px;overflow:hidden}.channel-bars b{background:var(--mkt-lime);border-radius:99px;display:block;height:100%}.channel-bars b[data-index='1']{background:var(--mkt-blue)}.channel-bars b[data-index='2']{background:var(--mkt-yellow)}.channel-bars b[data-index='3']{background:var(--mkt-coral)}.channel-bars b[data-index='4']{background:var(--mkt-teal)}.channels-panel :deep(.mkt-empty-state){border:0;min-height:180px;padding:8px}.channels-panel :deep(.mkt-ambassadors){display:none}
.recent-grid{display:grid;gap:10px;grid-template-columns:repeat(4,minmax(0,1fr))}.recent-card{align-items:center;background:#f8fbf9;border:1px solid #e2ebe7;border-radius:17px;color:inherit;display:grid;gap:10px;grid-template-columns:48px minmax(0,1fr);padding:11px;position:relative;transition:.16s}.recent-card:hover{background:#fff;box-shadow:0 10px 25px rgba(14,55,61,.08);transform:translateY(-2px)}.recent-card>div{min-width:0}.recent-card>div small,.recent-card>div strong,.recent-card>div p{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.recent-card>div small{color:#839092;font-size:.56rem}.recent-card>div strong{font-size:.69rem;margin-top:3px}.recent-card>div p{font-size:.58rem;margin:2px 0 0}.recent-card>.mkt-stage-chip{grid-column:1/-1;justify-self:start}
@media(max-width:1180px){.command-hero{grid-template-columns:minmax(0,1fr) minmax(300px,.55fr)}.mkt-metrics{grid-template-columns:repeat(3,1fr)}.work-grid,.insight-grid{grid-template-columns:1fr}.daily-panel{grid-template-columns:repeat(3,1fr)}.daily-panel .mkt-section-head{grid-column:1/-1}.recent-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:760px){.command-hero{grid-template-columns:1fr;padding:22px}.command-visual{justify-content:center;order:-1}.command-visual :deep(.mkt-ambassadors){height:132px}.pulse-card{bottom:-2px}.command-copy{text-align:center}.command-actions{justify-content:center}.mkt-metrics{grid-template-columns:repeat(2,1fr)}.mkt-metric:first-child{grid-column:1/-1}.daily-panel{grid-template-columns:1fr}.daily-panel .mkt-section-head{grid-column:auto}.recent-grid{grid-template-columns:1fr}.pipeline-row{grid-template-columns:26px minmax(0,1fr) 34px}.pipeline-track{display:none}.attention-row{grid-template-columns:46px minmax(0,1fr) 18px}.attention-state{grid-column:2;justify-self:start}.command-copy h1{font-size:2.55rem}}
@media(max-width:460px){.mkt-metrics{grid-template-columns:1fr}.mkt-metric:first-child{grid-column:auto}.command-actions .mkt-btn{width:100%}.command-visual :deep(.mkt-ambassadors){transform:scale(.92)}}
</style>
