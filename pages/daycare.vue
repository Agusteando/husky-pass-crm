<template>
  <section class="stack">
    <div class="hero-panel family-hero">
      <div>
        <p class="eyebrow">Husky Pass Daycare</p>
        <h1>Hola, {{ session?.user?.displayName || session?.user?.email }}</h1>
        <p>Este espacio conserva el tablero familiar legacy: tareas, avisos y comunicados, calendario mensual, recursos Richmond, PASE y Personas Autorizadas.</p>
      </div>
      <div class="value-card">
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <span class="eyebrow">Valor del mes</span>
        <strong>{{ dashboard?.valor?.[0]?.valor || 'Por confirmar' }}</strong>
      </div>
    </div>

    <section class="grid grid-4 action-grid">
      <NuxtLink class="action-card amber" to="/daycare/recursos/tareas">
        <span>Tareas</span>
        <strong>{{ dashboard?.tareas?.length || 0 }}</strong>
      </NuxtLink>
      <NuxtLink class="action-card green" to="/daycare/recursos/circulares">
        <span>Avisos y comunicados</span>
        <strong>{{ dashboard?.circulares?.length || 0 }}</strong>
      </NuxtLink>
      <NuxtLink class="action-card pale" to="/daycare/recursos/calendario">
        <span>Calendario mensual</span>
        <strong>{{ dashboard?.calendario?.length || 0 }}</strong>
      </NuxtLink>
      <NuxtLink class="action-card blue" to="/daycare/personas-autorizadas">
        <span>Personas Autorizadas</span>
        <strong>QR</strong>
      </NuxtLink>
    </section>

    <section class="grid grid-2">
      <a class="external-card card" :href="config.public.richmondUrl" target="_blank" rel="noopener">
        <span class="badge">Richmond</span>
        <h2>Recursos para estudiantes</h2>
        <p>Mantiene el enlace externo legacy usado por el dashboard familiar.</p>
      </a>
      <a class="external-card card" :href="config.public.pasePlatformUrl" target="_blank" rel="noopener">
        <span class="badge">PASE Richmond</span>
        <h2>Plataforma PASE</h2>
        <p>Conserva el endpoint externo configurado para la integración PASE.</p>
      </a>
    </section>

    <section class="card stack calendar-panel">
      <div>
        <p class="eyebrow">Próximos eventos</p>
        <h2>Calendario Mensual</h2>
      </div>
      <div class="calendar-strip" v-if="dashboard?.calendario?.length">
        <article v-for="item in dashboard.calendario" :key="`cal-${item.id || item.title}-${item.date}`" class="calendar-card">
          <div class="calendar-date">
            <strong>{{ formatCalendarDay(item.date).day }}</strong>
            <span>{{ formatCalendarDay(item.date).weekday }}</span>
            <span>{{ formatCalendarDay(item.date).month }}</span>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ stripHtml(item.description || item.html) }}</p>
          <a v-if="item.resource" class="btn btn-secondary" :href="resourceHref(item.resource)" target="_blank" rel="noopener">Ver detalles</a>
        </article>
      </div>
      <EmptyState v-else title="No hay eventos próximos" description="Cuando la sala publique calendario, aparecerá aquí." />
    </section>

    <section class="grid grid-2">
      <div class="card stack">
        <div>
          <p class="eyebrow">Comunicados</p>
          <h2>Avisos y comunicados</h2>
        </div>
        <ResourceCard v-for="item in dashboard?.circulares?.slice(0, 4)" :key="`news-${item.id || item.title}`" :resource="item" />
        <EmptyState v-if="!dashboard?.circulares?.length" title="No hay circulares" description="La sala aún no ha publicado comunicados." />
      </div>
      <div class="card stack">
        <div>
          <p class="eyebrow">Tarea del día</p>
          <h2>Seguimiento en casa</h2>
        </div>
        <ResourceCard v-if="dashboard?.tareas?.[0]" :resource="dashboard.tareas[0]" />
        <EmptyState v-else title="Sin tareas publicadas" description="Las tareas aparecerán en cuanto el equipo de guardería las publique." />
      </div>
    </section>

    <section class="slogan-card">
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

function resourceHref(resource?: string | null) {
  return isPdfResource(resource) ? legacyPdfViewerUrl(resource) : resource || ''
}
</script>

<style scoped>
.family-hero {
  display: grid;
  grid-template-columns: 1fr minmax(220px, 320px);
  gap: 24px;
  align-items: end;
}

.value-card {
  background: #fff;
  border: 2px dashed var(--color-amber);
  border-radius: 28px;
  display: grid;
  gap: 12px;
  padding: 24px;
}

.value-card img {
  width: 150px;
}

.value-card strong {
  display: block;
  font-family: Fredoka, Inter, sans-serif;
  font-size: 2rem;
  line-height: 1.1;
  margin-top: 8px;
}

.grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.action-card {
  border-radius: 28px;
  min-height: 170px;
  padding: 24px;
  color: #fff;
  display: flex;
  align-items: end;
  justify-content: space-between;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  position: relative;
}

.action-card::before {
  content: '';
  position: absolute;
  inset: -40%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.26), transparent 64%);
  pointer-events: none;
}

.action-card span,
.action-card strong {
  position: relative;
}

.action-card span {
  font-weight: 900;
  font-size: 1.22rem;
  max-width: 160px;
}

.action-card strong {
  font-size: 2.6rem;
}

.amber { background: linear-gradient(135deg, #ffca7a, #ffad2e); }
.green { background: linear-gradient(135deg, #8ec152, #578b26); }
.pale { background: linear-gradient(135deg, #789667, #466035); }
.blue { background: linear-gradient(135deg, #236188, #153d57); }

.external-card {
  min-height: 190px;
}

.calendar-strip {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding: 4px 4px 18px;
}

.calendar-card {
  background: #f8faf5;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  display: grid;
  flex: 0 0 280px;
  gap: 12px;
  padding: 18px;
}

.calendar-date {
  align-items: center;
  border-bottom: 2px dashed var(--color-border);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0 12px;
  padding-bottom: 12px;
}

.calendar-date strong {
  color: var(--color-brand-700);
  font-family: Fredoka, Inter, sans-serif;
  font-size: 2.4rem;
  grid-row: span 2;
}

.calendar-date span {
  color: var(--color-muted);
  font-weight: 800;
  text-transform: capitalize;
}

.slogan-card {
  background: #f9fcf5;
  border: 1px solid var(--color-border);
  border-radius: 28px;
  color: var(--color-brand-700);
  font-family: Fredoka, Inter, sans-serif;
  padding: 28px;
  text-align: center;
}

@media (max-width: 1100px) {
  .grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .family-hero,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
</style>
