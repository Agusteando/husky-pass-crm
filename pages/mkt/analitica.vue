<template>
  <section class="mkt-page analytics-page" data-product-area="mkt" data-product-screen="analitica">
    <header class="analytics-hero mkt-panel">
      <div>
        <p class="mkt-eyebrow">Inteligencia comercial</p>
        <h1>Rendimiento con contexto</h1>
        <p>{{ periodLabel }}</p>
        <div class="analytics-presets" role="group" aria-label="Periodos rápidos">
          <button v-for="preset in presets" :key="preset.days" type="button" :class="{ active: activePreset === preset.days }" @click="applyPreset(preset.days)">{{ preset.label }}</button>
        </div>
      </div>
      <div class="analytics-hero__visual">
        <MktAmbassadorCluster compact />
        <div class="analytics-seal"><span><FamilyPersonasIcon name="trend" /></span><div><small>Conversión</small><strong>{{ analytics?.metrics.conversionRate || 0 }}%</strong></div></div>
      </div>
    </header>

    <form class="period-bar mkt-panel" @submit.prevent="applyPeriod">
      <label><span>Desde</span><input v-model="draft.from" class="mkt-input" type="date" :max="draft.to || today" required /></label>
      <span class="period-arrow"><FamilyPersonasIcon name="arrow" /></span>
      <label><span>Hasta</span><input v-model="draft.to" class="mkt-input" type="date" :min="draft.from || undefined" :max="today" required /></label>
      <button class="mkt-btn primary" type="submit" :disabled="draft.from > draft.to"><FamilyPersonasIcon name="chart" />Actualizar</button>
      <NuxtLink class="mkt-btn" :to="periodLeadsUrl"><FamilyPersonasIcon name="people" />Ver informes</NuxtLink>
    </form>
    <p v-if="periodError" class="period-error mkt-alert error" role="alert">{{ periodError }}</p>

    <section v-if="pending" class="mkt-panel mkt-empty"><HuskyPassLoader label="Rendimiento" contained /></section>
    <section v-else-if="loadError" class="mkt-panel mkt-empty"><FamilyPersonasIcon name="alert" /><h2>No pudimos calcular el periodo</h2><p>Vuelve a intentarlo; los informes no fueron modificados.</p><button class="mkt-btn" type="button" @click="() => refresh()">Reintentar</button></section>

    <template v-else-if="analytics">
      <section class="analytics-metrics" aria-label="Indicadores del periodo">
        <article><span class="metric-mark green"><FamilyPersonasIcon name="user-plus" /></span><div><small>Informes</small><strong>{{ analytics.metrics.total }}</strong></div><em>Captados</em></article>
        <article><span class="metric-mark blue"><FamilyPersonasIcon name="message" /></span><div><small>Contactados</small><strong>{{ analytics.metrics.contacted }}</strong></div><em>{{ contactRate }}% de la base</em></article>
        <article><span class="metric-mark lime"><FamilyPersonasIcon name="graduation" /></span><div><small>Inscritos</small><strong>{{ analytics.metrics.converted }}</strong></div><em>{{ analytics.metrics.conversionRate }}% conversión</em></article>
        <article><span class="metric-mark yellow"><FamilyPersonasIcon name="deadline" /></span><div><small>Primera respuesta</small><strong>{{ responseTime }}</strong></div><em>Promedio</em></article>
        <article><span class="metric-mark coral"><FamilyPersonasIcon name="history" /></span><div><small>Seguimientos</small><strong>{{ analytics.metrics.averageFollowUps }}</strong></div><em>Promedio por informe</em></article>
      </section>

      <section class="analytics-grid primary-grid">
        <article class="mkt-panel trend-panel">
          <div class="analytics-head"><div><p class="mkt-eyebrow">Movimiento semanal</p><h2>Captación, seguimiento y cierre</h2></div><div class="chart-legend"><span class="leads">Informes</span><span class="follow">Seguimientos</span><span class="converted">Inscritos</span></div></div>
          <div v-if="analytics.weeklyTrend.some((week) => week.leads || week.followUps || week.converted)" class="weekly-chart" :style="{ '--chart-max': weeklyMax }">
            <div v-for="week in analytics.weeklyTrend" :key="week.weekStart" class="week-column">
              <div class="week-bars" :aria-label="`${week.label}: ${week.leads} informes, ${week.followUps} seguimientos, ${week.converted} inscritos`">
                <i class="leads" :style="barStyle(week.leads)" :title="`${week.leads} informes`" />
                <i class="follow" :style="barStyle(week.followUps)" :title="`${week.followUps} seguimientos`" />
                <i class="converted" :style="barStyle(week.converted)" :title="`${week.converted} inscritos`" />
              </div>
              <span>{{ week.label }}</span>
            </div>
          </div>
          <MktEmptyState v-else title="Sin actividad en el periodo" icon="chart" ambassador="preescolar" tone="blue" />
        </article>

        <article class="mkt-panel funnel-panel">
          <div class="analytics-head"><div><p class="mkt-eyebrow">Embudo</p><h2>Estado de la base</h2></div><strong>{{ analytics.metrics.total }} informes</strong></div>
          <div class="funnel-list">
            <NuxtLink v-for="(stage, index) in analytics.stageBreakdown" :key="stage.stage" :to="stageUrl(stage.stage)" class="funnel-row" :data-index="index">
              <span class="funnel-step">0{{ index + 1 }}</span>
              <div><strong>{{ MKT_STAGE_META[stage.stage].label }}</strong><small>{{ MKT_STAGE_META[stage.stage].description }}</small></div>
              <i><b :style="{ width: `${stage.percentage}%` }" /></i>
              <span class="funnel-value"><strong>{{ stage.count }}</strong><small>{{ stage.percentage }}%</small></span>
            </NuxtLink>
          </div>
        </article>
      </section>

      <section class="analytics-grid performance-grid">
        <article class="mkt-panel performance-panel channels-performance">
          <div class="analytics-head"><div><p class="mkt-eyebrow">Origen</p><h2>Rendimiento por canal</h2></div><FamilyPersonasIcon name="announcement" /></div>
          <div v-if="analytics.channels.length" class="performance-table">
            <div class="performance-head"><span>Canal</span><span>Informes</span><span>Contacto</span><span>Inscritos</span><span>Conversión</span></div>
            <NuxtLink v-for="(row, index) in analytics.channels" :key="row.channel" :to="channelUrl(row.channel)" class="performance-row">
              <span class="dimension-name"><i :data-index="index"><FamilyPersonasIcon :name="channelIcon(row.channel)" /></i><strong>{{ mktChannelLabel(row.channel) }}</strong></span>
              <span>{{ row.leads }}</span><span>{{ row.contacted }}</span><span>{{ row.converted }}</span>
              <span class="conversion-cell"><i><b :style="{ width: `${row.conversionRate}%` }" /></i><strong>{{ row.conversionRate }}%</strong></span>
            </NuxtLink>
          </div>
          <MktEmptyState v-else title="Sin canales en el periodo" icon="announcement" ambassador="daycare" tone="yellow" />
        </article>

        <article class="mkt-panel performance-panel campus-performance">
          <div class="analytics-head"><div><p class="mkt-eyebrow">Cobertura</p><h2>Rendimiento por plantel</h2></div><FamilyPersonasIcon name="school" /></div>
          <div v-if="analytics.planteles.length" class="campus-list">
            <NuxtLink v-for="row in analytics.planteles" :key="row.plantel" :to="plantelUrl(row.plantel)" class="campus-row">
              <span class="campus-mascot" :data-theme="mktPlantelLevel(row.plantel)"><img :src="MKT_AMBASSADORS[mktPlantelLevel(row.plantel)].src" alt="" /></span>
              <span class="campus-name"><strong>{{ mktPlantelDisplay(row.plantel) }}</strong><small>{{ row.contacted }} contactados · {{ row.converted }} inscritos</small></span>
              <span class="campus-volume"><strong>{{ row.leads }}</strong><small>informes</small></span>
              <span class="campus-rate"><strong>{{ row.conversionRate }}%</strong><i><b :style="{ width: `${row.conversionRate}%` }" /></i></span>
              <FamilyPersonasIcon name="arrow" />
            </NuxtLink>
          </div>
          <MktEmptyState v-else title="Sin planteles en el periodo" icon="school" ambassador="primaria" tone="green" />
        </article>
      </section>

      <section class="analytics-footer mkt-panel">
        <div><span><FamilyPersonasIcon name="target" /></span><div><p class="mkt-eyebrow">Siguiente movimiento</p><h2>{{ nextMove.title }}</h2><p>{{ nextMove.detail }}</p></div></div>
        <NuxtLink class="mkt-btn primary" :to="nextMove.to">{{ nextMove.action }}<FamilyPersonasIcon name="arrow" /></NuxtLink>
        <MktAmbassadorCluster compact :theme="nextMove.ambassador" :show-seal="false" />
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useFetch, useRoute, useRouter } from 'nuxt/app'
import type { MktAnalyticsResponse, MktStage } from '~/types/mkt'
import { MKT_AMBASSADORS, MKT_STAGE_META, mktChannelLabel, mktPlantelDisplay, mktPlantelLevel, type MktAmbassadorTheme } from '~/utils/mkt'

definePageMeta({ layout: 'mkt', middleware: ['admin', 'mkt'] })
const route = useRoute()
const router = useRouter()
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
function offsetDate(days: number) { const date = new Date(`${today}T12:00:00Z`); date.setUTCDate(date.getUTCDate() - days); return date.toISOString().slice(0, 10) }
const defaults = { from: offsetDate(89), to: today }
const presets = [{ label: '30 días', days: 30 }, { label: '90 días', days: 90 }, { label: '12 meses', days: 365 }]
const periodError = ref('')

function routeValue(key: 'from' | 'to') {
  const value = route.query[key]
  return Array.isArray(value) ? String(value[0] || '') : String(value || '')
}
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T12:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}
function daySpan(from: string, to: string) {
  return Math.round((new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86400000)
}
function sanitizedRoutePeriod() {
  const from = routeValue('from')
  const to = routeValue('to')
  if (!validDate(from) || !validDate(to) || from > to || to > today || daySpan(from, to) > 1096) return defaults
  return { from, to }
}

const applied = reactive(sanitizedRoutePeriod())
const draft = reactive({ ...applied })
const query = computed(() => ({ from: applied.from, to: applied.to }))
const { data: analytics, pending, error: loadError, refresh } = useFetch<MktAnalyticsResponse>('/api/mkt/analytics', { query })
watch(() => route.query, () => {
  const period = sanitizedRoutePeriod()
  Object.assign(applied, period)
  Object.assign(draft, period)
  periodError.value = ''
}, { deep: true })
const activePreset = computed(() => {
  const start = new Date(`${applied.from}T12:00:00Z`); const end = new Date(`${applied.to}T12:00:00Z`)
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  return presets.find((preset) => Math.abs(preset.days - days) <= 1)?.days || 0
})
const periodLabel = computed(() => `${formatDate(applied.from)} — ${formatDate(applied.to)}`)
const periodLeadsUrl = computed(() => `/mkt/informes?from=${applied.from}&to=${applied.to}`)
const contactRate = computed(() => analytics.value?.metrics.total ? Math.round((analytics.value.metrics.contacted / analytics.value.metrics.total) * 100) : 0)
const responseTime = computed(() => {
  const hours = analytics.value?.metrics.averageFirstResponseHours
  if (hours === null || hours === undefined) return '—'
  if (hours < 1) return '<1 h'
  if (hours < 24) return `${hours} h`
  return `${Math.round((hours / 24) * 10) / 10} d`
})
const weeklyMax = computed(() => Math.max(...(analytics.value?.weeklyTrend.flatMap((row) => [row.leads, row.followUps, row.converted]) || [1]), 1))
const nextMove = computed<{ title: string; detail: string; action: string; to: string; ambassador: MktAmbassadorTheme }>(() => {
  if (!analytics.value?.metrics.total) return { title: 'Abre el periodo con una nueva familia', detail: 'El panorama se activará con el primer informe.', action: 'Nuevo informe', to: '/mkt/informes?new=1', ambassador: 'preescolar' }
  if (contactRate.value < 80) return { title: 'Reduce la espera del primer contacto', detail: `${analytics.value.metrics.total - analytics.value.metrics.contacted} informes del periodo aún no registran conversación.`, action: 'Ver pendientes', to: `${periodLeadsUrl.value}&stage=Leads%20Entrantes`, ambassador: 'daycare' }
  const negotiation = analytics.value.stageBreakdown.find((row) => row.stage === 'Negociación')?.count || 0
  if (negotiation) return { title: 'Convierte las negociaciones activas', detail: `${negotiation} familias están en la etapa de decisión.`, action: 'Abrir negociaciones', to: `${periodLeadsUrl.value}&stage=Negociaci%C3%B3n`, ambassador: 'secundaria' }
  return { title: 'Mantén el ritmo de seguimiento', detail: 'La base del periodo está contactada y sin cierres pendientes visibles.', action: 'Abrir CRM', to: periodLeadsUrl.value, ambassador: 'primaria' }
})
function barStyle(value: number) { return { height: `${Math.max(value ? (value / weeklyMax.value) * 100 : 0, value ? 5 : 0)}%` } }
function formatDate(value: string) { return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) }
function stageUrl(stage: MktStage) { return `${periodLeadsUrl.value}&stage=${encodeURIComponent(stage)}` }
function channelUrl(channel: string) { return `${periodLeadsUrl.value}&channel=${encodeURIComponent(channel)}` }
function plantelUrl(plantel: string) { return `${periodLeadsUrl.value}&plantel=${encodeURIComponent(plantel)}` }
function channelIcon(channel: string) { const value = channel.toLowerCase(); if (value.includes('whatsapp')) return 'message'; if (value.includes('tel')) return 'phone'; if (value.includes('web')) return 'target'; if (value.includes('social')) return 'announcement'; if (value.includes('presencial')) return 'map'; return 'people' }
async function applyPeriod() {
  periodError.value = ''
  if (!validDate(draft.from) || !validDate(draft.to)) {
    periodError.value = 'Selecciona un periodo válido.'
    return
  }
  if (draft.from > draft.to) {
    periodError.value = 'La fecha inicial debe ser anterior a la fecha final.'
    return
  }
  if (draft.to > today) {
    periodError.value = 'La fecha final no puede estar en el futuro.'
    return
  }
  if (daySpan(draft.from, draft.to) > 1096) {
    periodError.value = 'El periodo máximo de análisis es de tres años.'
    return
  }
  await router.replace({ path: route.path, query: { from: draft.from, to: draft.to } })
}
async function applyPreset(days: number) {
  periodError.value = ''
  const from = offsetDate(days - 1)
  Object.assign(draft, { from, to: today })
  await router.replace({ path: route.path, query: { from, to: today } })
}
</script>

<style scoped>
.analytics-hero{align-items:center;background:radial-gradient(circle at 84% 15%,rgba(236,105,91,.17),transparent 19rem),radial-gradient(circle at 66% 105%,rgba(78,143,208,.18),transparent 22rem),linear-gradient(135deg,#fff,#f2f8f7);display:grid;gap:24px;grid-template-columns:minmax(0,1fr) auto;min-height:245px;overflow:hidden;padding:clamp(25px,3.5vw,42px)}.analytics-hero h1{font-size:clamp(2.3rem,4.3vw,4rem);letter-spacing:-.047em;line-height:.94}.analytics-hero>div:first-child>p:nth-of-type(2){font-size:.82rem;margin:12px 0 0;text-transform:capitalize}.analytics-presets{display:flex;flex-wrap:wrap;gap:7px;margin-top:19px}.analytics-presets button{background:rgba(255,255,255,.8);border:1px solid #d7e5df;border-radius:999px;color:#627679;cursor:pointer;font:inherit;font-size:.62rem;font-weight:900;min-height:34px;padding:0 11px}.analytics-presets button.active{background:var(--mkt-teal);border-color:var(--mkt-teal);color:#fff}.analytics-hero__visual{align-items:end;display:flex;position:relative}.analytics-seal{align-items:center;background:rgba(255,255,255,.95);border:1px solid #dae8e2;border-radius:18px;box-shadow:0 15px 34px rgba(13,55,62,.11);display:flex;gap:10px;padding:11px 14px;position:absolute;right:-4px;top:1px}.analytics-seal>span{align-items:center;background:#fff0ec;border-radius:12px;color:#bd4d43;display:flex;height:38px;justify-content:center;width:38px}.analytics-seal small,.analytics-seal strong{display:block}.analytics-seal small{color:#718285;font-size:.57rem}.analytics-seal strong{font-family:var(--font-title);font-size:1.35rem}
.period-bar{align-items:end;display:flex;flex-wrap:wrap;gap:9px;padding:13px}.period-bar label{display:grid;gap:5px;min-width:175px}.period-bar label>span{color:#748486;font-size:.58rem;font-weight:900}.period-arrow{align-items:center;color:#8a9999;display:flex;height:44px}.period-bar .mkt-btn:last-child{margin-left:auto}.period-error{margin:0}.analytics-metrics{display:grid;gap:10px;grid-template-columns:repeat(5,minmax(0,1fr))}.analytics-metrics article{align-items:center;background:#fff;border:1px solid var(--mkt-line);border-radius:20px;box-shadow:0 12px 28px rgba(13,55,62,.045);display:grid;gap:9px;grid-template-columns:43px minmax(0,1fr);min-height:94px;padding:14px}.metric-mark{align-items:center;border-radius:14px;display:flex;height:43px;justify-content:center}.metric-mark.green{background:#e8f6f0;color:#087167}.metric-mark.blue{background:#eaf4fc;color:#3a7eb8}.metric-mark.lime{background:#edf8e6;color:#54822e}.metric-mark.yellow{background:#fff5d7;color:#896411}.metric-mark.coral{background:#fff0ec;color:#bd4d43}.analytics-metrics small,.analytics-metrics strong{display:block}.analytics-metrics small{color:#778789;font-size:.58rem}.analytics-metrics strong{font-family:var(--font-title);font-size:1.5rem;line-height:1.05}.analytics-metrics em{color:#829193;font-size:.54rem;font-style:normal;font-weight:800;grid-column:2}
.analytics-grid{display:grid;gap:16px}.primary-grid{grid-template-columns:minmax(0,1.45fr) minmax(350px,.75fr)}.performance-grid{grid-template-columns:minmax(0,1.1fr) minmax(360px,.9fr)}.trend-panel,.funnel-panel,.performance-panel{overflow:hidden;padding:0}.analytics-head{align-items:center;border-bottom:1px solid #e2ebe7;display:flex;gap:14px;justify-content:space-between;padding:17px 19px}.analytics-head h2{font-size:1.35rem}.analytics-head>strong{color:#708184;font-size:.61rem}.chart-legend{display:flex;flex-wrap:wrap;gap:10px}.chart-legend span{align-items:center;color:#758587;display:flex;font-size:.52rem;font-weight:900;gap:5px}.chart-legend span:before{border-radius:3px;content:'';height:8px;width:8px}.chart-legend .leads:before{background:var(--mkt-blue)}.chart-legend .follow:before{background:var(--mkt-yellow)}.chart-legend .converted:before{background:var(--mkt-lime)}.weekly-chart{align-items:end;display:flex;gap:clamp(8px,1.5vw,19px);height:315px;overflow-x:auto;padding:26px 19px 17px}.week-column{display:grid;flex:1 0 48px;gap:9px;height:100%;min-width:48px}.week-bars{align-items:end;border-bottom:1px solid #dce6e2;display:flex;gap:3px;height:100%;justify-content:center;position:relative}.week-bars:before,.week-bars:after{border-top:1px dashed #e5ece9;content:'';left:0;position:absolute;right:0}.week-bars:before{top:33%}.week-bars:after{top:66%}.week-bars i{border-radius:6px 6px 2px 2px;display:block;max-width:13px;min-height:0;transition:height .35s ease;width:29%;z-index:1}.week-bars i.leads{background:linear-gradient(180deg,#70a8dc,#4e8fd0)}.week-bars i.follow{background:linear-gradient(180deg,#f7d365,#efbb2e)}.week-bars i.converted{background:linear-gradient(180deg,#9bd363,#72b83c)}.week-column>span{color:#7c8b8d;font-size:.5rem;text-align:center;white-space:nowrap}.trend-panel :deep(.mkt-empty-state),.performance-panel :deep(.mkt-empty-state){border:0;border-radius:0;min-height:320px}
.funnel-list{display:grid;padding:8px 0}.funnel-row{align-items:center;border-bottom:1px solid #edf1ef;color:var(--mkt-ink);display:grid;gap:10px;grid-template-columns:34px minmax(120px,1fr) minmax(80px,.8fr) 47px;padding:13px 17px;transition:.16s}.funnel-row:last-child{border-bottom:0}.funnel-row:hover{background:#f5faf7}.funnel-step{align-items:center;background:#e9f6f0;border-radius:10px;color:#0b6b61;display:flex;font-family:var(--font-title);font-size:.66rem;height:34px;justify-content:center}.funnel-row[data-index='1'] .funnel-step{background:#eaf4fc;color:#3b7db6}.funnel-row[data-index='2'] .funnel-step{background:#fff5d6;color:#8b6610}.funnel-row[data-index='3'] .funnel-step{background:#fff0ec;color:#b64b41}.funnel-row[data-index='4'] .funnel-step{background:#edf8e6;color:#527f2b}.funnel-row>div strong,.funnel-row>div small,.funnel-value strong,.funnel-value small{display:block}.funnel-row>div strong{font-size:.62rem}.funnel-row>div small{color:#849294;font-size:.5rem;margin-top:3px}.funnel-row>i{background:#e8efec;border-radius:999px;height:6px;overflow:hidden}.funnel-row>i b{background:linear-gradient(90deg,#4e8fd0,#86c74d);border-radius:inherit;display:block;height:100%}.funnel-value{text-align:right}.funnel-value strong{font-family:var(--font-title);font-size:.82rem}.funnel-value small{color:#849294;font-size:.5rem}
.performance-table{display:grid}.performance-head,.performance-row{align-items:center;display:grid;gap:10px;grid-template-columns:minmax(180px,1fr) 65px 65px 65px minmax(110px,.7fr);padding:11px 17px}.performance-head{background:#f5f8f7;color:#7b898b;font-size:.51rem;font-weight:900;text-transform:uppercase}.performance-row{border-top:1px solid #e9efec;color:var(--mkt-ink);font-size:.61rem;transition:.16s}.performance-row:hover{background:#f6faf8}.dimension-name{align-items:center;display:flex;gap:9px}.dimension-name>i{align-items:center;background:#e9f6f0;border-radius:11px;color:#087167;display:flex;height:36px;justify-content:center;width:36px}.dimension-name>i[data-index='1']{background:#eaf4fc;color:#3b7db6}.dimension-name>i[data-index='2']{background:#fff5d6;color:#8b6610}.dimension-name>i[data-index='3']{background:#fff0ec;color:#b64b41}.dimension-name strong{font-size:.62rem}.conversion-cell{align-items:center;display:grid;gap:7px;grid-template-columns:minmax(50px,1fr) 34px}.conversion-cell>i,.campus-rate i{background:#e7efeb;border-radius:999px;height:6px;overflow:hidden}.conversion-cell>i b,.campus-rate i b{background:linear-gradient(90deg,var(--mkt-lime),var(--mkt-teal));border-radius:inherit;display:block;height:100%}.conversion-cell strong{font-size:.59rem;text-align:right}.campus-list{display:grid}.campus-row{align-items:center;border-bottom:1px solid #e9efec;color:var(--mkt-ink);display:grid;gap:10px;grid-template-columns:48px minmax(130px,1fr) 54px 75px 18px;padding:11px 15px;transition:.16s}.campus-row:last-child{border-bottom:0}.campus-row:hover{background:#f5faf7}.campus-mascot{align-items:end;border-radius:13px;display:flex;height:48px;justify-content:center;overflow:hidden}.campus-mascot[data-theme='daycare']{background:#e7f7df}.campus-mascot[data-theme='preescolar']{background:#fff4c9}.campus-mascot[data-theme='primaria']{background:#e3f1fc}.campus-mascot[data-theme='secundaria']{background:#ffe3df}.campus-mascot img{height:45px;object-fit:contain;width:100%}.campus-name strong,.campus-name small,.campus-volume strong,.campus-volume small,.campus-rate strong{display:block}.campus-name strong{font-size:.62rem}.campus-name small{color:#849294;font-size:.5rem;margin-top:3px}.campus-volume{text-align:center}.campus-volume strong{font-family:var(--font-title);font-size:.85rem}.campus-volume small{color:#849294;font-size:.48rem}.campus-rate{display:grid;gap:5px}.campus-rate strong{font-size:.62rem;text-align:right}.campus-row>svg{color:#899998}
.analytics-footer{align-items:center;background:radial-gradient(circle at 88% 50%,rgba(246,199,68,.17),transparent 16rem),linear-gradient(135deg,#fff,#f1f8f5);display:grid;gap:16px;grid-template-columns:minmax(0,1fr) auto 200px;min-height:150px;overflow:hidden;padding:18px 22px}.analytics-footer>div:first-child{align-items:center;display:grid;gap:12px;grid-template-columns:48px minmax(0,1fr)}.analytics-footer>div:first-child>span{align-items:center;background:#e8f6f0;border-radius:15px;color:var(--mkt-teal);display:flex;height:48px;justify-content:center}.analytics-footer h2{font-size:1.35rem}.analytics-footer p:not(.mkt-eyebrow){font-size:.65rem;margin:5px 0 0}.analytics-footer :deep(.mkt-ambassadors){margin-bottom:-18px}
@media(max-width:1200px){.analytics-metrics{grid-template-columns:repeat(3,1fr)}.analytics-metrics article:nth-child(4),.analytics-metrics article:nth-child(5){grid-column:span 1}.primary-grid,.performance-grid{grid-template-columns:1fr}.weekly-chart{height:300px}}
@media(max-width:800px){.analytics-hero{grid-template-columns:1fr}.analytics-hero__visual{display:none}.period-bar .mkt-btn:last-child{margin-left:0}.analytics-metrics{grid-template-columns:repeat(2,1fr)}.performance-head{display:none}.performance-row{grid-template-columns:minmax(150px,1fr) repeat(3,40px);padding:12px}.performance-row>span:nth-child(5){grid-column:1/-1}.conversion-cell{grid-template-columns:1fr 35px}.analytics-footer{grid-template-columns:1fr auto}.analytics-footer :deep(.mkt-ambassadors){display:none}}
@media(max-width:600px){.analytics-hero{min-height:0;padding:23px 18px}.analytics-hero h1{font-size:2.35rem}.period-bar{align-items:stretch}.period-bar label{flex:1;min-width:130px}.period-arrow{display:none}.period-bar .mkt-btn{flex:1}.analytics-metrics{gap:8px}.analytics-metrics article{gap:7px;grid-template-columns:38px 1fr;min-height:83px;padding:11px}.metric-mark{border-radius:12px;height:38px}.analytics-metrics strong{font-size:1.3rem}.analytics-head{align-items:start;flex-direction:column}.weekly-chart{height:265px;padding-inline:12px}.funnel-row{grid-template-columns:32px minmax(110px,1fr) 42px}.funnel-row>i{display:none}.performance-row{grid-template-columns:minmax(135px,1fr) repeat(3,34px)}.campus-row{grid-template-columns:44px minmax(120px,1fr) 50px 18px}.campus-rate{display:none}.analytics-footer{align-items:stretch;grid-template-columns:1fr}.analytics-footer .mkt-btn{width:100%}}
</style>
