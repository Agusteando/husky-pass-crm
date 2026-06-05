<template>
  <section class="daycare-home stack">
    <section class="family-hero">
      <div>
        <p class="eyebrow">Guardería</p>
        <h1>{{ session?.user?.displayName || 'Husky Pass' }}</h1>
        <p>{{ session?.user?.scopes.daycare?.unidad || 'Unidad' }} · Sala {{ session?.user?.scopes.daycare?.sala || '—' }}</p>
        <div class="hero-actions">
          <NuxtLink class="btn btn-primary" to="/familia/daycare/calendario">Calendario</NuxtLink>
          <NuxtLink class="btn btn-secondary" to="/familia/daycare/avisos">Avisos</NuxtLink>
        </div>
      </div>
      <div class="hero-mark">
        <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
        <span>Familia guardería</span>
      </div>
    </section>

    <section class="quick-row">
      <a class="quick-card amber" :href="config.public.richmondUrl" target="_blank" rel="noopener"><span>Richmond</span><strong>Acceder</strong></a>
      <a v-if="config.public.pasePlatformUrl" class="quick-card gray" :href="config.public.pasePlatformUrl" target="_blank" rel="noopener"><span>PASE</span><strong>Entrar</strong></a>
      <NuxtLink v-if="canUsePersonasAutorizadas" class="quick-card blue" to="/familia/personas-autorizadas"><span>Personas Autorizadas</span><strong>Ver</strong></NuxtLink>
    </section>

    <p v-if="error" class="alert">No fue posible cargar la información de guardería.</p>
    <div v-else-if="pending" class="card loading-card">Cargando publicaciones…</div>

    <template v-else>
      <section class="card calendar-panel">
        <header class="section-head">
          <div>
            <p class="eyebrow">Próximos eventos</p>
            <h2>Calendario</h2>
          </div>
          <NuxtLink class="btn btn-secondary" to="/familia/daycare/calendario">Ver todo</NuxtLink>
        </header>
        <div class="calendar-strip" v-if="dashboard?.calendario?.length">
          <article v-for="item in dashboard.calendario.slice(0, 8)" :key="`cal-${item.id || item.title}-${item.date}`" class="cal-card">
            <div class="date-box">
              <strong>{{ formatCalendarDay(item.date).day }}</strong>
              <span>{{ formatCalendarDay(item.date).month }}</span>
            </div>
            <h3>{{ item.title || 'Evento' }}</h3>
            <p>{{ stripHtml(item.description || item.html) }}</p>
          </article>
        </div>
        <EmptyState v-else title="No hay eventos próximos" description="Cuando haya eventos publicados, aparecerán aquí." />
      </section>

      <section class="family-grid">
        <section class="card content-panel">
          <header class="section-head">
            <h2>Avisos</h2>
            <NuxtLink class="btn btn-secondary" to="/familia/daycare/avisos">Ver avisos</NuxtLink>
          </header>
          <div class="compact-list" v-if="dashboard?.circulares?.length">
            <ResourceCard v-for="item in dashboard.circulares.slice(0, 3)" :key="`news-${item.id || item.title}`" :resource="item" variant="notice" />
          </div>
          <EmptyState v-else title="No hay avisos" description="Por ahora no hay comunicados publicados." />
        </section>

        <section class="card content-panel">
          <header class="section-head">
            <h2>Tareas</h2>
            <NuxtLink class="btn btn-secondary" to="/familia/daycare/tareas">Ver tareas</NuxtLink>
          </header>
          <ResourceCard v-if="dashboard?.tareas?.[0]" :resource="dashboard.tareas[0]" variant="homework" />
          <EmptyState v-else title="Sin tareas" description="Cuando haya tarea disponible, aparecerá aquí." />
          <div class="value-box" v-if="dashboard?.valor?.length">
            <span>Valor del mes</span>
            <strong>{{ dashboard.valor[0].valor }}</strong>
          </div>
        </section>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRuntimeConfig } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import type { DaycareResource } from '~/types/daycare'
import { formatCalendarDay, stripHtml } from '~/utils/daycare'
import { hasFamilyScope } from '~/utils/sessionScopes'

definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })

const config = useRuntimeConfig()
const { data: session } = useFetch<PublicSession>('/api/auth/me')
const { data: dashboard, pending, error } = useFetch<{
  tareas: DaycareResource[]
  circulares: DaycareResource[]
  calendario: DaycareResource[]
  valor: Array<{ valor: string }>
}>('/api/daycare/family/dashboard', { timeout: 15000 })

const canUsePersonasAutorizadas = computed(() => hasFamilyScope(session.value?.user, 'personasAutorizadas'))
</script>

<style scoped>
.daycare-home {
  gap: 12px;
}

.family-hero {
  align-items: stretch;
  background:
    radial-gradient(circle at 82% 16%, rgba(255, 181, 69, .22), transparent 30%),
    linear-gradient(135deg, #315f24, #578b26 58%, #7aa83d);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  color: #fff;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(130px, 180px);
  min-height: 136px;
  padding: clamp(12px, 2vw, 16px);
}

.family-hero .eyebrow,
.family-hero p {
  color: rgba(255, 255, 255, 0.86);
}

.family-hero h1 {
  color: #fff;
  font-size: clamp(1.45rem, 2.4vw, 2.05rem);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.hero-actions .btn-primary {
  background: #fff;
  color: var(--color-brand-900);
  box-shadow: none;
}

.hero-actions .btn-secondary {
  background: rgba(255, 255, 255, .14);
  border-color: rgba(255, 255, 255, .28);
  color: #fff;
}

.hero-mark {
  align-items: center;
  background: rgba(255, 255, 255, .15);
  border: 1px solid rgba(255, 255, 255, .24);
  border-radius: 18px;
  display: grid;
  justify-items: center;
  padding: 12px;
  text-align: center;
}

.hero-mark img {
  max-width: 120px;
  width: 100%;
}

.hero-mark span {
  color: rgba(255, 255, 255, .82);
  font-size: .78rem;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.quick-row {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.quick-card {
  align-items: center;
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
  color: #fff;
  display: flex;
  font-weight: 600;
  justify-content: space-between;
  min-height: 44px;
  padding: 10px 12px;
}

.quick-card strong {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  color: #4d4d4d;
  font-size: 0.78rem;
  padding: 6px 10px;
}

.amber { background: linear-gradient(135deg, #ffca7a, #ffb545); }
.gray { background: linear-gradient(135deg, #b8b8b8, #838282); }
.blue { background: linear-gradient(135deg, #236188, #153d57); }

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h2 {
  color: var(--color-brand-700);
  font-size: 1.2rem;
  margin-bottom: 0;
}

.calendar-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.cal-card {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  flex: 0 0 180px;
  padding: 12px;
}

.date-box {
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  text-transform: capitalize;
}

.date-box strong {
  color: var(--color-brand-700);
  font-size: 1.35rem;
  line-height: 1;
}

.date-box span {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 600;
}

.cal-card h3 {
  margin-bottom: 6px;
}

.cal-card p {
  display: -webkit-box;
  font-size: 0.9rem;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.family-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.72fr);
}

.compact-list,
.content-panel {
  display: grid;
  gap: 12px;
}

.value-box {
  align-items: center;
  border: 2px dashed var(--color-amber);
  border-radius: 18px;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding: 12px;
}

.value-box span {
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.value-box strong {
  color: var(--color-brand-800);
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1000px) {
  .family-grid,
  .quick-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .family-hero {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .hero-mark img {
    max-width: 120px;
  }

  .section-head,
  .value-box {
    align-items: stretch;
    flex-direction: column;
  }

    .cal-card {
    flex-basis: 80vw;
  }
}
</style>
