<template>
  <section class="sala-workspace stack" data-product-area="daycare" data-product-screen="sala-resumen">
    <AdminModuleTabs :sala-id="salaId" />

    <p v-if="error" class="alert">No fue posible cargar el workspace de la sala.</p>
    <p v-if="actionError" class="alert">{{ actionError }}</p>
    <div v-else-if="pending" class="card loading-card" data-product-loading>Cargando sala…</div>

    <template v-else-if="overview">
      <header class="sala-hero" data-diagnostic="sala-context">
        <div class="hero-title">
          <span class="room-avatar">{{ roomInitials(overview.sala.sala) }}</span>
          <div>
            <p class="eyebrow">{{ overview.sala.unidad }}</p>
            <h1>{{ overview.sala.sala }}</h1>
            <p>Centro operativo de sala. Gestiona familias y contenido visible desde la experiencia familiar.</p>
          </div>
        </div>
        <div class="hero-actions">
          <button v-if="canPreviewAsFamily" class="btn btn-secondary" type="button" data-diagnostic-action="preview-sala" @click="previewSala">Vista familiar</button>
          <NuxtLink class="btn btn-primary" :to="`/admin/daycare/salas/${salaId}/familias`" data-diagnostic-link="gestionar-familias">Gestionar familias</NuxtLink>
        </div>
      </header>

      <section class="metric-grid" aria-label="Resumen de sala">
        <article>
          <span>Familias</span>
          <strong>{{ overview.metrics.familias }}</strong>
        </article>
        <article>
          <span>Tareas</span>
          <strong>{{ overview.metrics.tareas }}</strong>
        </article>
        <article>
          <span>Avisos</span>
          <strong>{{ overview.metrics.avisos }}</strong>
        </article>
        <article>
          <span>Eventos</span>
          <strong>{{ overview.metrics.calendario }}</strong>
        </article>
      </section>

      <section class="workspace-grid" data-product-panel="sala-workspace" :data-state="overview ? 'content' : 'empty'">
        <div class="module-panel card">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Módulos</p>
              <h2>Qué quieres operar</h2>
            </div>
          </div>
          <div class="module-cards">
            <NuxtLink v-for="module in modules" :key="module.to" :to="module.to" class="module-card" data-diagnostic-link="modulo-sala">
              <span>{{ module.abbr }}</span>
              <strong>{{ module.title }}</strong>
              <small>{{ module.description }}</small>
            </NuxtLink>
          </div>
        </div>

        <aside class="card activity-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Actividad</p>
              <h2>Últimos cambios</h2>
            </div>
          </div>

          <div v-if="overview.latestResources.length" class="activity-list">
            <article v-for="item in overview.latestResources" :key="item.id">
              <span class="type-pill">{{ resourceTypeLabel(item.type) }}</span>
              <strong>{{ item.title || 'Sin título' }}</strong>
              <small>{{ formatDate(item.date || item.timestamp, 'Sin fecha') }}</small>
            </article>
          </div>
          <EmptyState v-else title="Sin publicaciones" description="La sala aún no tiene tareas, avisos o eventos activos." />
        </aside>
      </section>

      <section class="family-strip card" data-product-panel="sala-families" :data-state="overview.latestFamilies.length ? 'content' : 'empty'">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Familias recientes</p>
            <h2>Accesos daycare</h2>
          </div>
          <NuxtLink class="btn btn-secondary" :to="`/admin/daycare/salas/${salaId}/familias`" data-diagnostic-link="ver-familias">Ver todas</NuxtLink>
        </div>
        <div v-if="overview.latestFamilies.length" class="family-mini-list">
          <article v-for="family in overview.latestFamilies" :key="family.id">
            <strong>{{ family.nombre_nino || family.username }}</strong>
            <small>{{ family.email }}</small>
          </article>
        </div>
        <EmptyState v-else title="Sin familias" description="Agrega cuentas familiares para esta sala." />
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo, useFetch, useRoute } from 'nuxt/app'
import type { SalaOverview } from '~/types/daycare'
import type { PublicSession } from '~/types/session'
import { formatDate } from '~/utils/daycare'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const salaId = Number(route.params.id)
const actionError = ref('')
const { data: session } = useFetch<PublicSession>('/api/auth/me', { key: 'admin-sala-session' })
const { data: overview, pending, error } = useFetch<SalaOverview>(`/api/daycare/admin/salas/${salaId}/overview`, { timeout: 15000 })
const canPreviewAsFamily = computed(() => Boolean(session.value?.user?.kind === 'admin'))

const modules = computed(() => [
  { abbr: 'FA', title: 'Familias', description: 'Cuentas, soporte e impersonación.', to: `/admin/daycare/salas/${salaId}/familias` },
  { abbr: 'TA', title: 'Tareas', description: 'Publicaciones visibles para casa.', to: `/admin/daycare/salas/${salaId}/tareas` },
  { abbr: 'AV', title: 'Avisos', description: 'Comunicados y circulares.', to: `/admin/daycare/salas/${salaId}/avisos` },
  { abbr: 'CA', title: 'Calendario', description: 'Eventos por fecha.', to: `/admin/daycare/salas/${salaId}/calendario` }
])

async function previewSala() {
  actionError.value = ''
  try {
    await $fetch('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: salaId } })
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  }
}

function roomInitials(value?: string | null) {
  return String(value || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

function resourceTypeLabel(type?: string | null) {
  if (type === 'hw') return 'Tarea'
  if (type === 'news') return 'Aviso'
  if (type === 'cal') return 'Evento'
  return 'Contenido'
}
</script>

<style scoped>
.sala-workspace {
  gap: 12px;
}

.sala-hero {
  align-items: center;
  background:
    radial-gradient(circle at top right, rgba(255, 181, 69, 0.18), transparent 44%),
    linear-gradient(135deg, #ffffff, #f4f9ec);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: clamp(15px, 2vw, 22px);
}

.hero-title,
.hero-actions,
.panel-head {
  align-items: center;
  display: flex;
  gap: 12px;
}

.hero-title {
  min-width: 0;
}

.hero-title h1 {
  font-size: clamp(1.75rem, 3vw, 2.65rem);
  margin-bottom: 5px;
}

.hero-title p:last-child {
  max-width: 640px;
}

.hero-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.room-avatar {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 22px;
  color: var(--color-brand-900);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 1rem;
  font-weight: 950;
  height: 68px;
  justify-content: center;
  width: 68px;
}

.metric-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-grid article {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.metric-grid span {
  color: var(--color-muted);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.metric-grid strong {
  font-size: 1.55rem;
  line-height: 1;
}

.workspace-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
}

.panel-head {
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-head h2 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.module-cards {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.module-card {
  background: linear-gradient(180deg, #ffffff, #fbfdf8);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  display: grid;
  gap: 8px;
  min-height: 128px;
  padding: 14px;
}

.module-card:hover {
  border-color: var(--color-brand-300);
  box-shadow: var(--shadow-soft);
}

.module-card span {
  align-items: center;
  background: var(--color-brand-100);
  border-radius: 12px;
  color: var(--color-brand-900);
  display: inline-flex;
  font-size: 0.76rem;
  font-weight: 950;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.module-card small {
  color: var(--color-muted);
  line-height: 1.35;
}

.activity-list,
.family-mini-list {
  display: grid;
  gap: 8px;
}

.activity-list article,
.family-mini-list article {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  display: grid;
  gap: 4px;
  padding: 10px 12px;
}

.activity-list small,
.family-mini-list small {
  color: var(--color-muted);
}

.type-pill {
  color: var(--color-brand-700);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.family-mini-list {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1140px) {
  .workspace-grid,
  .family-mini-list {
    grid-template-columns: 1fr;
  }

  .module-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .sala-hero,
  .hero-title {
    align-items: start;
    flex-direction: column;
  }

  .hero-actions {
    display: grid;
    width: 100%;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .module-cards,
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
