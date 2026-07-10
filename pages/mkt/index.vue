<template>
  <section class="mkt-page mkt-dashboard" data-product-area="mkt" data-product-screen="overview">
    <header class="mkt-hero mkt-panel">
      <div class="mkt-hero__copy">
        <p class="mkt-eyebrow">Mercadotecnia · {{ longDate }}</p>
        <h1>{{ greeting }}, {{ firstName }}</h1>
        <p>{{ heroMessage }}</p>
      </div>
      <div class="mkt-hero__actions">
        <NuxtLink class="mkt-btn soft" to="/mkt/bitacora">
          <FamilyPersonasIcon name="clipboard" />
          {{ overview?.journal.completedToday ? 'Revisar bitácora' : 'Completar bitácora' }}
        </NuxtLink>
        <NuxtLink class="mkt-btn primary" to="/mkt/informes?new=1">
          <FamilyPersonasIcon name="plus" />
          Nuevo informe
        </NuxtLink>
      </div>
    </header>

    <section v-if="pending" class="mkt-panel mkt-empty" data-state="loading">
      <HuskyPassLoader label="Mercadotecnia" contained />
    </section>
    <section v-else-if="loadError" class="mkt-panel mkt-empty" data-state="error">
      <FamilyPersonasIcon name="alert" />
      <h2>No pudimos cargar tu panorama</h2>
      <p>La información sigue segura. Intenta actualizar en un momento.</p>
      <button class="mkt-btn" type="button" @click="() => refresh()">Reintentar</button>
    </section>

    <template v-else-if="overview">
      <section class="mkt-metrics" aria-label="Indicadores de Mercadotecnia">
        <article class="mkt-metric priority">
          <span class="metric-icon"><FamilyPersonasIcon name="people" /></span>
          <div><small>Informes activos</small><strong>{{ overview.metrics.totalLeads }}</strong></div>
          <em>Base histórica</em>
        </article>
        <article class="mkt-metric">
          <span class="metric-icon blue"><FamilyPersonasIcon name="calendar" /></span>
          <div><small>Nuevos esta semana</small><strong>{{ overview.metrics.newThisWeek }}</strong></div>
          <em>Entradas recientes</em>
        </article>
        <article class="mkt-metric" :data-attention="overview.metrics.pendingContact > 0">
          <span class="metric-icon coral"><FamilyPersonasIcon name="clock" /></span>
          <div><small>Sin primer contacto</small><strong>{{ overview.metrics.pendingContact }}</strong></div>
          <NuxtLink to="/mkt/informes?stage=Leads%20Entrantes">Atender</NuxtLink>
        </article>
        <article class="mkt-metric">
          <span class="metric-icon yellow"><FamilyPersonasIcon name="history" /></span>
          <div><small>Seguimientos hoy</small><strong>{{ overview.metrics.followUpsToday }}</strong></div>
          <em>Actividad registrada</em>
        </article>
        <article class="mkt-metric">
          <span class="metric-icon lime"><FamilyPersonasIcon name="check" /></span>
          <div><small>Inscritos</small><strong>{{ overview.metrics.enrolled }}</strong></div>
          <em>Conversión histórica</em>
        </article>
      </section>

      <section class="mkt-dashboard__grid">
        <article class="mkt-panel pipeline-panel">
          <div class="mkt-section-head">
            <div>
              <p class="mkt-eyebrow">Embudo actual</p>
              <h2>¿Dónde están los informes?</h2>
            </div>
            <NuxtLink to="/mkt/informes">Abrir CRM <FamilyPersonasIcon name="arrow" /></NuxtLink>
          </div>
          <div class="pipeline-list">
            <NuxtLink v-for="(item, index) in overview.stageBreakdown" :key="item.stage" :to="`/mkt/informes?stage=${encodeURIComponent(item.stage)}`" class="pipeline-row">
              <span class="pipeline-order">0{{ index + 1 }}</span>
              <span class="pipeline-copy"><strong>{{ item.stage }}</strong><small>{{ stageHint(item.stage) }}</small></span>
              <span class="pipeline-track"><i :style="{ width: `${pipelineWidth(item.count)}%` }" :data-index="index" /></span>
              <b>{{ item.count }}</b>
            </NuxtLink>
          </div>
        </article>

        <aside class="mkt-panel today-panel">
          <div class="mkt-section-head compact">
            <div><p class="mkt-eyebrow">Prioridad</p><h2>Tu siguiente acción</h2></div>
          </div>
          <div v-if="overview.metrics.pendingContact" class="attention-card">
            <span><FamilyPersonasIcon name="bell" /></span>
            <strong>{{ overview.metrics.pendingContact }} informes esperan contacto</strong>
            <p>Empieza por los más recientes y registra el resultado para mantener el embudo al día.</p>
            <NuxtLink class="mkt-btn primary" to="/mkt/informes?stage=Leads%20Entrantes">Comenzar seguimiento</NuxtLink>
          </div>
          <div v-else class="attention-card complete">
            <span><FamilyPersonasIcon name="check" /></span>
            <strong>Primeros contactos al día</strong>
            <p>Buen momento para retomar negociaciones o completar la bitácora.</p>
            <NuxtLink class="mkt-btn soft" to="/mkt/informes?stage=Negociaci%C3%B3n">Ver negociaciones</NuxtLink>
          </div>
          <div class="journal-status" :data-complete="overview.journal.completedToday">
            <span><FamilyPersonasIcon :name="overview.journal.completedToday ? 'check' : 'edit'" /></span>
            <div>
              <strong>{{ overview.journal.completedToday ? 'Bitácora guardada' : 'Bitácora pendiente' }}</strong>
              <small>{{ overview.journal.completedToday ? journalPreview : 'Registra logros, actividades y contenido del día.' }}</small>
            </div>
            <NuxtLink to="/mkt/bitacora">{{ overview.journal.completedToday ? 'Abrir' : 'Completar' }}</NuxtLink>
          </div>
        </aside>
      </section>

      <section class="mkt-panel recent-panel">
        <div class="mkt-section-head">
          <div><p class="mkt-eyebrow">Actividad reciente</p><h2>Informes que conviene revisar</h2></div>
          <NuxtLink to="/mkt/informes">Ver todos <FamilyPersonasIcon name="arrow" /></NuxtLink>
        </div>
        <div v-if="overview.recentLeads.length" class="recent-list">
          <NuxtLink v-for="lead in overview.recentLeads" :key="lead.folio" :to="`/mkt/informes?lead=${encodeURIComponent(lead.folio)}`" class="recent-row">
            <span class="lead-monogram">{{ lead.studentName.slice(0, 1).toUpperCase() }}</span>
            <span class="recent-person"><strong>{{ lead.studentName }}</strong><small>{{ lead.contactName }} · {{ lead.plantel || 'Sin plantel' }}</small></span>
            <span class="recent-channel">{{ channelLabel(lead.channel) }}</span>
            <span class="mkt-stage-chip" :data-stage="lead.stage">{{ lead.stage }}</span>
            <time>{{ relativeDate(lead.lastFollowUpAt || lead.createdAt) }}</time>
          </NuxtLink>
        </div>
        <div v-else class="mkt-empty compact-empty"><p>Aún no hay informes para mostrar.</p></div>
      </section>

      <section class="mkt-panel channel-panel">
        <div class="mkt-section-head">
          <div><p class="mkt-eyebrow">Semana en curso</p><h2>Origen de nuevos informes</h2></div>
          <p>{{ weeklyTotal }} informes captados</p>
        </div>
        <div v-if="overview.weeklyChannels.length" class="channel-table-wrap">
          <table class="channel-table">
            <thead><tr><th>Vía de informe</th><th v-for="day in weekDays" :key="day">{{ day }}</th><th>Total</th></tr></thead>
            <tbody>
              <tr v-for="row in overview.weeklyChannels" :key="row.channel">
                <th>{{ channelLabel(row.channel) }}</th>
                <td v-for="(count, index) in row.days" :key="index" :data-active="count > 0">{{ count }}</td>
                <td><strong>{{ row.total }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="mkt-empty compact-empty"><p>No hay nuevos informes en la semana actual.</p></div>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { MktOverviewResponse, MktStage } from '~/types/mkt'
import { useAppSession } from '~/composables/useAppSession'

definePageMeta({ layout: 'mkt', middleware: ['admin', 'mkt'] })

const mexicoDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const { data: session } = useAppSession()
const { data: overview, pending, error: loadError, refresh } = useFetch<MktOverviewResponse>('/api/mkt/overview', { query: { today: mexicoDate } })
const hour = Number(new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', hour12: false }).format(new Date()))
const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
const firstName = computed(() => session.value?.user?.displayName?.trim().split(/\s+/)[0] || 'equipo')
const longDate = new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
const pipelineMax = computed(() => Math.max(...(overview.value?.stageBreakdown.map((item) => item.count) || [1]), 1))
const weeklyTotal = computed(() => overview.value?.weeklyChannels.reduce((total, row) => total + row.total, 0) || 0)
const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const journalPreview = computed(() => overview.value?.journal.activities || overview.value?.journal.achievements || 'Actividad registrada para hoy.')
const heroMessage = computed(() => {
  const pendingCount = overview.value?.metrics.pendingContact || 0
  if (pendingCount > 0) return `Hay ${pendingCount} ${pendingCount === 1 ? 'informe que necesita' : 'informes que necesitan'} primer contacto. Aquí tienes el panorama para avanzar sin perder oportunidades.`
  return 'Los primeros contactos están al día. Revisa el embudo y registra lo más importante de la jornada.'
})

function pipelineWidth(count: number) {
  if (!count) return 0
  return Math.max(8, Math.round((count / pipelineMax.value) * 100))
}

function stageHint(stage: MktStage) {
  return ({
    'Leads Entrantes': 'Aún sin contacto registrado',
    'Primer contacto': 'Conversación iniciada',
    'Discusión': 'Familias evaluando opciones',
    'Negociación': 'Propuesta y decisión',
    'Inscrito': 'Conversión confirmada'
  } as Record<MktStage, string>)[stage]
}

function channelLabel(value: string) {
  const normalized = value.trim().toLocaleLowerCase('es-MX')
  if (normalized === 'whatsapp') return 'WhatsApp'
  if (normalized === 'redes sociales') return 'Redes sociales'
  if (normalized === 'vía telefónica' || normalized === 'via telefonica') return 'Vía telefónica'
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Sin especificar'
}

function relativeDate(value: string | null) {
  if (!value) return 'Sin actividad'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(date)
}
</script>

<style scoped>
.mkt-hero {
  align-items: center;
  background:
    radial-gradient(circle at 82% 18%, rgba(246, 199, 69, 0.22), transparent 16rem),
    radial-gradient(circle at 2% 100%, rgba(143, 200, 73, 0.14), transparent 20rem),
    linear-gradient(135deg, rgba(255,255,255,.98), rgba(245,250,247,.96));
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) auto;
  overflow: hidden;
  padding: clamp(22px, 3vw, 38px);
  position: relative;
}

.mkt-hero::before {
  background: linear-gradient(180deg, #8fc849, #f6c745, #ec6b5d, #4f8bc9);
  border-radius: 999px;
  content: '';
  height: 90px;
  left: 0;
  position: absolute;
  top: 24px;
  width: 5px;
}

.mkt-hero h1 { font-size: clamp(2rem, 3.5vw, 3.35rem); letter-spacing: -0.035em; line-height: 1; }
.mkt-hero p:last-child { margin: 10px 0 0; max-width: 780px; }
.mkt-hero__actions { display: flex; flex-wrap: wrap; gap: 9px; justify-content: flex-end; }

.mkt-metrics { display: grid; gap: 11px; grid-template-columns: repeat(5, minmax(0, 1fr)); }
.mkt-metric {
  align-items: center; background: rgba(255,255,255,.94); border: 1px solid var(--mkt-line); border-radius: 20px;
  box-shadow: 0 13px 34px rgba(14,55,61,.055); display: grid; gap: 10px; grid-template-columns: 42px minmax(0,1fr);
  min-height: 104px; padding: 14px;
}
.mkt-metric em, .mkt-metric a { color: #829093; font-size: .67rem; font-style: normal; grid-column: 1 / -1; }
.mkt-metric a { color: #9d493e; text-decoration: underline; text-underline-offset: 3px; }
.mkt-metric small { color: #718083; display: block; font-size: .69rem; }
.mkt-metric strong { display: block; font-family: var(--font-title); font-size: 1.9rem; line-height: 1; margin-top: 4px; }
.metric-icon { align-items:center; background:#edf8f3; border-radius:14px; color:#0b6b61; display:flex; height:42px; justify-content:center; width:42px; }
.metric-icon.blue { background:#edf5fc; color:#4f8bc9; }.metric-icon.coral{background:#fff0ed;color:#d95b4d}.metric-icon.yellow{background:#fff8df;color:#9b7112}.metric-icon.lime{background:#eff8e9;color:#5e912e}
.mkt-metric[data-attention='true'] { border-color: rgba(236,107,93,.34); }

.mkt-dashboard__grid { align-items: start; display: grid; gap: 18px; grid-template-columns: minmax(0, 1.55fr) minmax(320px, .65fr); }
.pipeline-panel, .today-panel, .recent-panel, .channel-panel { padding: clamp(16px,2vw,24px); }
.mkt-section-head { align-items:center; border-bottom:1px solid var(--mkt-line); display:flex; gap:16px; justify-content:space-between; margin-bottom:14px; padding-bottom:14px; }
.mkt-section-head.compact { border-bottom:0; margin-bottom:4px; padding-bottom:0; }
.mkt-section-head h2 { font-size: clamp(1.28rem,2vw,1.75rem); }.mkt-section-head p { font-size:.76rem; margin:0; }
.mkt-section-head > a { align-items:center; color:var(--mkt-teal); display:inline-flex; font-size:.76rem; gap:6px; white-space:nowrap; }

.pipeline-list { display:grid; gap:5px; }
.pipeline-row { align-items:center; border:1px solid transparent; border-radius:15px; display:grid; gap:12px; grid-template-columns:32px minmax(160px,.8fr) minmax(120px,1fr) 40px; padding:10px; transition:.16s ease; }
.pipeline-row:hover { background:#f6fbf8; border-color:#dbece4; }
.pipeline-order { color:#a2acad; font-size:.7rem; }.pipeline-copy strong,.pipeline-copy small{display:block}.pipeline-copy strong{font-size:.82rem}.pipeline-copy small{color:#849092;font-size:.67rem;margin-top:2px}
.pipeline-track { background:#eef3f1; border-radius:99px; height:7px; overflow:hidden; }.pipeline-track i{background:#8fc849;border-radius:99px;display:block;height:100%}.pipeline-track i[data-index='1']{background:#4f8bc9}.pipeline-track i[data-index='2']{background:#f6c745}.pipeline-track i[data-index='3']{background:#ec6b5d}.pipeline-track i[data-index='4']{background:#0b6b61}
.pipeline-row b { font-family:var(--font-title); font-size:1.05rem; text-align:right; }

.today-panel { display:grid; gap:12px; }
.attention-card { background:linear-gradient(145deg,#fff7f4,#fff); border:1px solid rgba(236,107,93,.23); border-radius:20px; display:grid; gap:9px; padding:18px; }
.attention-card.complete{background:linear-gradient(145deg,#eff9f1,#fff);border-color:#d4ead9}.attention-card>span{align-items:center;background:#fff0ed;border-radius:13px;color:#d95b4d;display:flex;height:40px;justify-content:center;width:40px}.attention-card.complete>span{background:#e9f6e5;color:#5d9130}.attention-card strong{font-family:var(--font-title);font-size:1.15rem}.attention-card p{font-size:.76rem;margin:0}.attention-card .mkt-btn{margin-top:3px;width:100%}
.journal-status { align-items:center; background:#f7faf8; border:1px solid #e0eae5; border-radius:17px; display:grid; gap:10px; grid-template-columns:35px minmax(0,1fr) auto; padding:12px; }
.journal-status>span{align-items:center;background:#fff7df;border-radius:11px;color:#8c6817;display:flex;height:35px;justify-content:center;width:35px}.journal-status[data-complete='true']>span{background:#e9f7f0;color:#0b6b61}.journal-status strong,.journal-status small{display:block}.journal-status strong{font-size:.75rem}.journal-status small{color:#7c898b;font-size:.64rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.journal-status>a{color:#0b6b61;font-size:.69rem}

.recent-list { display:grid; }
.recent-row { align-items:center; border-bottom:1px solid #edf1ef; display:grid; gap:12px; grid-template-columns:42px minmax(190px,1fr) minmax(100px,.4fr) auto 80px; min-height:68px; padding:8px 4px; }
.recent-row:last-child{border-bottom:0}.recent-row:hover .recent-person strong{color:var(--mkt-teal)}.lead-monogram{align-items:center;background:linear-gradient(145deg,#edf8f3,#f9f6e5);border:1px solid #dbeae2;border-radius:13px;color:#0b6b61;display:flex;font-family:var(--font-title);height:42px;justify-content:center;width:42px}.recent-person strong,.recent-person small{display:block}.recent-person strong{font-size:.79rem}.recent-person small,.recent-channel,.recent-row time{color:#7d898b;font-size:.68rem}.recent-row time{text-align:right}
.compact-empty{min-height:100px}

.channel-table-wrap{overflow-x:auto}.channel-table{border-collapse:collapse;min-width:760px;width:100%}.channel-table th,.channel-table td{border-bottom:1px solid #edf1ef;padding:11px 10px;text-align:center}.channel-table thead th{color:#879294;font-size:.65rem;letter-spacing:.05em;text-transform:uppercase}.channel-table tbody th{font-size:.74rem;text-align:left;text-transform:capitalize}.channel-table td{color:#889395;font-size:.75rem}.channel-table td[data-active='true']{color:var(--mkt-teal);font-weight:900}.channel-table tr:last-child>*{border-bottom:0}

@media(max-width:1180px){.mkt-metrics{grid-template-columns:repeat(3,1fr)}.mkt-dashboard__grid{grid-template-columns:1fr}.today-panel{grid-template-columns:1fr 1fr}.today-panel .mkt-section-head{grid-column:1/-1}}
@media(max-width:760px){.mkt-hero{align-items:start;grid-template-columns:1fr}.mkt-hero__actions{justify-content:start}.mkt-metrics{grid-template-columns:repeat(2,1fr)}.mkt-metric.priority{grid-column:1/-1}.today-panel{grid-template-columns:1fr}.today-panel .mkt-section-head{grid-column:auto}.pipeline-row{grid-template-columns:26px minmax(0,1fr) 34px}.pipeline-track{display:none}.recent-row{grid-template-columns:40px minmax(0,1fr) auto}.recent-channel,.recent-row time{display:none}}
@media(max-width:460px){.mkt-metrics{grid-template-columns:1fr}.mkt-metric.priority{grid-column:auto}.mkt-hero__actions .mkt-btn{width:100%}}
</style>
