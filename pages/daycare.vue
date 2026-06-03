<template>
  <section class="family-dashboard">
    <section class="dashboard-top">
      <div class="banner-tile banner-guarderia">
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <div>
          <span>Guardería</span>
          <strong>{{ session?.user?.sala || session?.user?.scopes.daycare?.sala || 'Husky Pass' }}</strong>
        </div>
      </div>
      <div class="quick-actions">
        <a class="action-card bg-grad-orange" :href="config.public.richmondUrl" target="_blank" rel="noopener">
          <span>Richmond</span>
          <strong>Acceder</strong>
        </a>
        <a class="action-card bg-grad-gray" :href="config.public.pasePlatformUrl" target="_blank" rel="noopener">
          <span>PASE</span>
          <strong>Entrar</strong>
        </a>
        <NuxtLink v-if="canUsePersonasAutorizadas" class="action-card bg-grad-blue" to="/personas_autorizadas">
          <span>Personas Autorizadas</span>
          <strong>QR</strong>
        </NuxtLink>
      </div>
    </section>

    <p v-if="error" class="alert">No fue posible cargar la información de guardería.</p>
    <div v-else-if="pending" class="card loading-card">Cargando publicaciones…</div>

    <template v-else>
      <section class="panel-inst calendar-panel">
        <header class="section-title compact-title">
          <div>
            <p class="eyebrow">{{ companyLabel }}</p>
            <h2>Calendario Mensual</h2>
          </div>
          <NuxtLink class="btn btn-secondary" to="/ver/calendario">Ver calendario</NuxtLink>
        </header>
        <div class="scrolling-wrapper" v-if="dashboard?.calendario?.length">
          <article v-for="item in dashboard.calendario" :key="`cal-${item.id || item.title}-${item.date}`" class="cal-card">
            <div class="cal-header">
              <div class="cal-num">{{ formatCalendarDay(item.date).day }}</div>
              <div class="cal-meta">
                <span>{{ formatCalendarDay(item.date).weekday }}</span>
                <span>{{ formatCalendarDay(item.date).month }}</span>
              </div>
            </div>
            <div class="cal-body">
              <h3>{{ item.title || 'Evento' }}</h3>
              <p>{{ stripHtml(item.description || item.html) }}</p>
            </div>
            <a v-if="item.resource" class="cal-action" :href="resourceHref(item.resource)" target="_blank" rel="noopener">Ver detalles</a>
          </article>
        </div>
        <EmptyState v-else title="No hay eventos próximos" description="Cuando haya eventos publicados, aparecerán aquí." />
      </section>

      <section class="content-grid">
        <section class="panel-inst notices-panel">
          <header class="section-title compact-title">
            <h2>Avisos y Comunicados</h2>
            <NuxtLink class="btn btn-secondary" to="/ver/circulares">Ver avisos</NuxtLink>
          </header>
          <div class="notice-list" v-if="dashboard?.circulares?.length">
            <ResourceCard v-for="item in dashboard.circulares.slice(0, 3)" :key="`news-${item.id || item.title}`" :resource="item" variant="notice" />
          </div>
          <EmptyState v-else title="No hay avisos nuevos" description="Por ahora no hay comunicados publicados." />
        </section>

        <section class="panel-inst homework-panel">
          <header class="section-title compact-title">
            <h2>Tarea del Día</h2>
            <NuxtLink class="btn btn-secondary" to="/ver/tareas">Ver tareas</NuxtLink>
          </header>
          <ResourceCard v-if="dashboard?.tareas?.[0]" :resource="dashboard.tareas[0]" variant="homework" />
          <EmptyState v-else title="Sin tareas publicadas" description="Cuando haya tarea disponible, aparecerá aquí." />

          <div class="valor-mes-container" v-if="dashboard?.valor?.length">
            <span>Valor del Mes</span>
            <strong>{{ dashboard.valor[0].valor }}</strong>
          </div>
        </section>
      </section>

      <section class="slogan-footer">
        “COMPARTIENDO CONTIGO LA FORMACIÓN INTEGRAL DE TUS HIJOS”
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import type { DaycareResource } from '~/types/daycare'
import { formatCalendarDay, isPdfResource, legacyPdfViewerUrl, stripHtml } from '~/utils/daycare'
import { hasFamilyScope } from '~/utils/sessionScopes'

definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })

const config = useRuntimeConfig()
const { data: session } = await useFetch<PublicSession>('/api/auth/me')
const { data: dashboard, pending, error } = await useFetch<{
  tareas: DaycareResource[]
  circulares: DaycareResource[]
  calendario: DaycareResource[]
  valor: Array<{ valor: string }>
}>('/api/daycare/family/dashboard')

const companyLabel = computed(() => session.value?.user?.campus || session.value?.user?.empresa || 'Colegio Casita')
const canUsePersonasAutorizadas = computed(() => hasFamilyScope(session.value?.user, 'personasAutorizadas'))

function resourceHref(resource?: string | null) {
  return isPdfResource(resource) ? legacyPdfViewerUrl(resource) : resource || ''
}
</script>

<style scoped>
.family-dashboard {
  display: grid;
  gap: 16px;
}

.dashboard-top {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1.15fr) minmax(330px, 0.85fr);
}

.banner-tile {
  align-items: center;
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: flex;
  gap: clamp(14px, 3vw, 24px);
  min-height: 154px;
  overflow: hidden;
  padding: clamp(18px, 3vw, 28px);
}

.banner-tile img {
  max-width: min(42%, 220px);
}

.banner-tile span {
  color: rgba(255, 255, 255, 0.86);
  display: block;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.banner-tile strong {
  color: #fff;
  display: block;
  font-family: Fredoka, Inter, sans-serif;
  font-size: clamp(1.45rem, 3.4vw, 2.6rem);
  letter-spacing: -0.04em;
  line-height: 1;
  margin-top: 6px;
}

.banner-guarderia {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 45%),
    linear-gradient(135deg, #666, #292929);
}

.quick-actions {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

.action-card {
  align-items: center;
  border: 0;
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  color: #fff;
  display: flex;
  justify-content: space-between;
  min-height: 44px;
  overflow: hidden;
  padding: 12px 16px;
  position: relative;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.action-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.action-card::before {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 70%);
  content: '';
  inset: -60%;
  position: absolute;
}

.action-card span,
.action-card strong {
  position: relative;
}

.action-card span {
  font-family: Fredoka, Inter, sans-serif;
  font-size: 1.05rem;
  line-height: 1.08;
}

.action-card strong {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  color: #4d4d4d;
  font-size: 0.78rem;
  padding: 6px 10px;
}

.bg-grad-orange { background: linear-gradient(135deg, #ffca7a 0%, #ffb545 100%); }
.bg-grad-gray { background: linear-gradient(135deg, #b8b8b8 0%, #838282 100%); }
.bg-grad-blue { background: linear-gradient(135deg, #236188 0%, #153d57 100%); }

.panel-inst {
  background: #fff;
  border: 1px solid rgba(223, 232, 215, 0.96);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  padding: clamp(16px, 2.4vw, 22px);
}

.compact-title {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title h2 {
  color: var(--color-brand-700);
  font-family: Fredoka, Inter, sans-serif;
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  letter-spacing: -0.02em;
  margin-bottom: 0;
}

.scrolling-wrapper {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  scroll-behavior: smooth;
}

.cal-card {
  background: #f8f9fa;
  border: 1px solid rgba(223, 232, 215, 0.8);
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  flex: 0 0 238px;
  flex-direction: column;
  overflow: hidden;
}

.cal-header {
  align-items: center;
  background: #fff;
  border-bottom: 1px dashed #e4e7e0;
  display: flex;
  gap: 12px;
  padding: 12px;
}

.cal-num {
  color: var(--color-brand-700);
  font-family: Fredoka, Inter, sans-serif;
  font-size: 2rem;
  line-height: 1;
}

.cal-meta {
  color: #8b9485;
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  font-weight: 850;
  text-transform: capitalize;
}

.cal-body {
  flex: 1;
  padding: 12px;
}

.cal-body h3 {
  color: #585858;
  margin-bottom: 6px;
}

.cal-body p {
  color: #666;
  display: -webkit-box;
  font-size: 0.9rem;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin: 0;
  min-height: 3.9em;
  overflow: hidden;
}

.cal-action {
  background: var(--color-brand-700);
  color: #fff;
  display: block;
  font-family: Fredoka, Inter, sans-serif;
  padding: 10px;
  text-align: center;
}

.content-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
}

.notice-list {
  display: grid;
  gap: 14px;
}

.homework-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.valor-mes-container {
  align-items: center;
  background: #fff;
  border: 2px dashed var(--color-amber);
  border-radius: 20px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-top: auto;
  padding: 14px 16px;
}

.valor-mes-container span {
  color: var(--color-muted);
  display: block;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.valor-mes-container strong {
  color: #585858;
  font-family: Fredoka, Inter, sans-serif;
  font-size: 1.25rem;
}

.slogan-footer {
  background: #f9fcf5;
  border: 1px solid var(--color-border);
  border-radius: 22px;
  color: var(--color-brand-700);
  font-family: Fredoka, Inter, sans-serif;
  font-size: 0.98rem;
  padding: 18px;
  text-align: center;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1080px) {
  .dashboard-top,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .banner-tile {
    align-items: flex-start;
    flex-direction: column;
    min-height: 0;
  }

  .banner-tile img {
    max-width: 164px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .compact-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .compact-title .btn {
    width: 100%;
  }

  .cal-card {
    flex-basis: 82vw;
  }

  .valor-mes-container {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
