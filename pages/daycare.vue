<template>
  <section class="family-dashboard">
    <section class="banner-grid">
      <div class="banner-tile banner-guarderia">
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <div>
          <span>Guardería</span>
          <strong>{{ session?.user?.sala || 'Husky Pass' }}</strong>
        </div>
      </div>
      <div class="banner-tile banner-school">
        <span>{{ companyLabel }}</span>
        <strong>{{ campusLabel }}</strong>
      </div>
    </section>

    <section class="quick-actions" v-if="session?.user?.sala">
      <a class="action-card bg-grad-orange" :href="config.public.richmondUrl" target="_blank" rel="noopener">
        <span>Recursos Richmond<br />para Estudiantes</span>
        <strong>Acceder</strong>
      </a>
      <a class="action-card bg-grad-gray" :href="config.public.pasePlatformUrl" target="_blank" rel="noopener">
        <span>Plataforma PASE<br />Richmond</span>
        <strong>Entrar</strong>
      </a>
      <NuxtLink class="action-card bg-grad-blue" to="/daycare/personas-autorizadas">
        <span>Personas<br />Autorizadas</span>
        <strong>QR</strong>
      </NuxtLink>
    </section>

    <section class="panel-inst calendar-panel">
      <header class="section-title">
        <h2>Calendario Mensual</h2>
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
        <header class="section-title centered">
          <h2>Avisos y Comunicados</h2>
        </header>
        <div class="notice-list" v-if="dashboard?.circulares?.length">
          <ResourceCard v-for="item in dashboard.circulares" :key="`news-${item.id || item.title}`" :resource="item" variant="notice" />
        </div>
        <EmptyState v-else title="No hay avisos nuevos" description="Por ahora no hay comunicados publicados." />
      </section>

      <section class="panel-inst homework-panel">
        <header class="section-title">
          <h2>Tarea del Día</h2>
        </header>
        <ResourceCard v-if="dashboard?.tareas?.[0]" :resource="dashboard.tareas[0]" variant="homework" />
        <EmptyState v-else title="Sin tareas publicadas" description="Cuando haya tarea disponible, aparecerá aquí." />

        <div class="valor-mes-container" v-if="dashboard?.valor?.length">
          <div>
            <span>Valor del Mes</span>
            <strong>{{ dashboard.valor[0].valor }}</strong>
          </div>
        </div>
      </section>
    </section>

    <section class="slogan-footer">
      “COMPARTIENDO CONTIGO LA FORMACIÓN INTEGRAL DE TUS HIJOS”
    </section>
  </section>
</template>

<script setup lang="ts">
import type { PublicSession } from '~/types/session'
import type { DaycareResource } from '~/types/daycare'
import { formatCalendarDay, isPdfResource, legacyPdfViewerUrl, stripHtml } from '~/utils/daycare'

definePageMeta({ layout: 'family', middleware: 'family' })

const config = useRuntimeConfig()
const { data: session } = await useFetch<PublicSession>('/api/auth/me')
const { data: dashboard } = await useFetch<{
  tareas: DaycareResource[]
  circulares: DaycareResource[]
  calendario: DaycareResource[]
  valor: Array<{ valor: string }>
}>('/api/daycare/family/dashboard')

const companyLabel = computed(() => session.value?.user?.campus || 'Colegio Casita')
const campusLabel = computed(() => session.value?.user?.displayName || session.value?.user?.email || 'Bienvenido')

function resourceHref(resource?: string | null) {
  return isPdfResource(resource) ? legacyPdfViewerUrl(resource) : resource || ''
}
</script>

<style scoped>
.family-dashboard {
  display: grid;
  gap: 36px;
}

.banner-grid {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.banner-tile {
  align-items: center;
  aspect-ratio: 21 / 9;
  border-radius: 25px;
  box-shadow: var(--shadow-soft);
  display: flex;
  gap: 22px;
  overflow: hidden;
  padding: clamp(20px, 4vw, 34px);
}

.banner-tile img {
  max-width: min(48%, 260px);
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
  font-size: clamp(1.6rem, 4vw, 3rem);
  letter-spacing: -0.04em;
  line-height: 1;
  margin-top: 8px;
}

.banner-guarderia {
  background: linear-gradient(135deg, #606060, #2b2b2b);
}

.banner-school {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.28), transparent 40%),
    linear-gradient(135deg, #8ec152, #578b26);
  justify-content: center;
  text-align: center;
}

.quick-actions {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.action-card {
  align-items: center;
  border: 0;
  border-radius: 25px;
  box-shadow: var(--shadow-card);
  color: #fff;
  display: flex;
  justify-content: space-between;
  min-height: 160px;
  overflow: hidden;
  padding: 24px 28px;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-card:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.action-card::before {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 70%);
  content: '';
  inset: -50%;
  opacity: 0.8;
  position: absolute;
}

.action-card span,
.action-card strong {
  position: relative;
}

.action-card span {
  font-family: Fredoka, Inter, sans-serif;
  font-size: 1.45rem;
  line-height: 1.08;
}

.action-card strong {
  background: rgba(255, 255, 255, 0.88);
  border-radius: 999px;
  color: #4d4d4d;
  font-size: 0.9rem;
  padding: 8px 14px;
}

.bg-grad-orange { background: linear-gradient(135deg, #ffca7a 0%, #ffb545 100%); }
.bg-grad-gray { background: linear-gradient(135deg, #b8b8b8 0%, #838282 100%); }
.bg-grad-blue { background: linear-gradient(135deg, #236188 0%, #153d57 100%); }

.panel-inst {
  background: #fff;
  border: 3px solid rgba(142, 193, 82, 0.15);
  border-radius: 30px;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  padding: clamp(22px, 4vw, 32px);
}

.section-title h2 {
  color: var(--color-brand-700);
  font-family: Fredoka, Inter, sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  letter-spacing: -0.02em;
  margin-bottom: 22px;
}

.section-title.centered h2 {
  color: #585858;
  text-align: center;
}

.scrolling-wrapper {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 10px 5px 25px;
  scroll-behavior: smooth;
}

.cal-card {
  background: #f8f9fa;
  border: none;
  border-radius: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex: 0 0 260px;
  flex-direction: column;
  overflow: hidden;
}

.cal-header {
  align-items: center;
  background: #fff;
  border-bottom: 2px dashed #eee;
  display: flex;
  gap: 15px;
  padding: 15px;
}

.cal-num {
  color: var(--color-brand-700);
  font-family: Fredoka, Inter, sans-serif;
  font-size: 2.2rem;
  line-height: 1;
}

.cal-meta {
  color: #8b9485;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: capitalize;
}

.cal-body {
  flex: 1;
  padding: 15px;
}

.cal-body h3 {
  color: #585858;
  margin-bottom: 8px;
}

.cal-body p {
  color: #666;
  display: -webkit-box;
  font-size: 0.95rem;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin: 0;
  min-height: 4.2em;
  overflow: hidden;
}

.cal-action {
  background: var(--color-brand-700);
  color: #fff;
  display: block;
  font-family: Fredoka, Inter, sans-serif;
  padding: 12px;
  text-align: center;
}

.content-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.notice-list {
  display: grid;
  gap: 20px;
}

.homework-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.valor-mes-container {
  align-items: center;
  background: #fff;
  border: 3px dashed var(--color-amber);
  border-radius: 25px;
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding: 1.5rem;
  text-align: center;
}

.valor-mes-container span {
  color: var(--color-muted);
  display: block;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.valor-mes-container strong {
  color: #585858;
  font-family: Fredoka, Inter, sans-serif;
  font-size: 1.5rem;
}

.slogan-footer {
  background: #f9fcf5;
  border-radius: 25px;
  color: var(--color-brand-700);
  font-family: Fredoka, Inter, sans-serif;
  font-size: 1.1rem;
  padding: 2rem;
  text-align: center;
}

@media (max-width: 1040px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .banner-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .banner-tile {
    aspect-ratio: auto;
    min-height: 160px;
  }
}
</style>
