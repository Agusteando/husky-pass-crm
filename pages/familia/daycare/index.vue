<template>
  <section class="daycare-home">
    <p v-if="error" class="alert">No fue posible cargar la información de guardería.</p>
    <div v-else-if="pending" class="card loading-card">Cargando publicaciones...</div>

    <template v-else>
      <section class="daycare-command">
        <article class="command-main">
          <div class="command-copy">
            <p class="eyebrow">Hoy en guardería</p>
            <h1>{{ session?.user?.displayName || 'Husky Pass' }}</h1>
            <p>{{ salaLine }}</p>
          </div>

          <div class="command-stats" aria-label="Resumen de guardería">
            <span><strong>{{ dashboard?.circulares?.length || 0 }}</strong> avisos</span>
            <span><strong>{{ dashboard?.tareas?.length || 0 }}</strong> tareas</span>
            <span><strong>{{ dashboard?.calendario?.length || 0 }}</strong> eventos</span>
          </div>

          <div class="command-actions">
            <NuxtLink class="btn btn-primary" to="/familia/daycare/avisos">Revisar avisos</NuxtLink>
            <NuxtLink class="btn btn-secondary" to="/familia/daycare/calendario">Ver calendario</NuxtLink>
          </div>

          <div class="command-ambassador" aria-hidden="true">
            <FamilyPersonasAmbassador :theme="daycareTheme" variant="hero" contained decorative />
          </div>
        </article>

        <aside class="command-side">
          <article class="latest-card">
            <span class="latest-label">Más reciente</span>
            <template v-if="latestNotice">
              <small>{{ formatDate(latestNotice.date || latestNotice.timestamp) }}</small>
              <h2>{{ latestNotice.title || 'Aviso publicado' }}</h2>
              <p>{{ stripHtml(latestNotice.description || latestNotice.html) || 'Abre el recurso para consultar el comunicado completo.' }}</p>
              <a v-if="latestNotice.resource" class="btn btn-primary" :href="latestNotice.resource" target="_blank" rel="noopener">Abrir recurso</a>
            </template>
            <template v-else>
              <h2>Sin avisos nuevos</h2>
              <p>Cuando la sala publique un comunicado, aparecerá aquí como primera prioridad.</p>
            </template>
          </article>

          <nav class="quick-dock" aria-label="Accesos rápidos de guardería">
            <a class="quick-card richmond" :href="config.public.richmondUrl" target="_blank" rel="noopener">
              <span>Richmond</span>
              <strong>Acceder</strong>
            </a>
            <NuxtLink class="quick-card calendar" to="/familia/daycare/calendario">
              <span>Agenda</span>
              <strong>{{ nextCalendar ? formatCalendarDay(nextCalendar.date).day : 'Hoy' }}</strong>
            </NuxtLink>
            <a v-if="config.public.pasePlatformUrl" class="quick-card neutral" :href="config.public.pasePlatformUrl" target="_blank" rel="noopener">
              <span>PASE</span>
              <strong>Entrar</strong>
            </a>
            <NuxtLink v-if="canUsePersonasAutorizadas" class="quick-card school" to="/familia/personas-autorizadas">
              <span>Personas</span>
              <strong>Ver</strong>
            </NuxtLink>
          </nav>
        </aside>
      </section>

      <FamilyAmbassadorGuide
        class="daycare-guidance"
        :theme="daycareTheme"
        :tone="daycareGuide.tone"
        :variant="daycareGuide.variant"
        :eyebrow="daycareGuide.eyebrow"
        :title="daycareGuide.title"
        :message="daycareGuide.message"
        compact
      />

      <section class="today-grid">
        <article class="card focus-panel">
          <header class="section-head">
            <div>
              <p class="eyebrow">Qué revisar ahora</p>
              <h2>Comunicados de la sala</h2>
            </div>
            <NuxtLink class="btn btn-secondary" to="/familia/daycare/avisos">Ver todos</NuxtLink>
          </header>

          <div v-if="dashboard?.circulares?.length" class="notice-timeline">
            <ResourceCard
              v-for="item in dashboard.circulares.slice(0, 3)"
              :key="`news-${item.id || item.title}`"
              :resource="item"
              variant="notice"
            />
          </div>
          <EmptyState v-else title="No hay avisos" description="Por ahora no hay comunicados publicados." />
        </article>

        <aside class="side-panel-stack">
          <article class="card compact-panel-card">
            <header class="section-head small-head">
              <div>
                <p class="eyebrow">Próximo</p>
                <h2>Calendario</h2>
              </div>
              <NuxtLink class="btn btn-secondary" to="/familia/daycare/calendario">Ver</NuxtLink>
            </header>

            <article v-if="nextCalendar" class="next-event">
              <div class="date-box">
                <strong>{{ formatCalendarDay(nextCalendar.date).day }}</strong>
                <span>{{ formatCalendarDay(nextCalendar.date).month }}</span>
              </div>
              <div>
                <h3>{{ nextCalendar.title || 'Evento' }}</h3>
                <p>{{ stripHtml(nextCalendar.description || nextCalendar.html) }}</p>
              </div>
            </article>
            <EmptyState v-else title="No hay eventos próximos" description="Cuando haya eventos publicados, aparecerán aquí." />
          </article>

          <article class="card compact-panel-card homework-panel">
            <header class="section-head small-head">
              <div>
                <p class="eyebrow">Tareas</p>
                <h2>{{ dashboard?.tareas?.length ? 'Pendiente' : 'Sin pendientes' }}</h2>
              </div>
              <NuxtLink class="btn btn-secondary" to="/familia/daycare/tareas">Ver</NuxtLink>
            </header>
            <ResourceCard v-if="dashboard?.tareas?.[0]" :resource="dashboard.tareas[0]" variant="homework" />
            <p v-else class="quiet-copy">No hay tarea publicada para revisar en este momento.</p>
          </article>

          <div class="value-box" v-if="dashboard?.valor?.length">
            <span>Valor del mes</span>
            <strong>{{ dashboard.valor[0].valor }}</strong>
          </div>
        </aside>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import { computed } from 'vue'
import { useRuntimeConfig, useFetch } from 'nuxt/app'
import type { DaycareResource } from '~/types/daycare'
import { formatCalendarDay, formatDate, stripHtml } from '~/utils/daycare'
import { hasFamilyScope } from '~/utils/sessionScopes'
import { resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })

const config = useRuntimeConfig()
const { data: session } = useAppSession()
const { data: dashboard, pending, error } = useFetch<{
  tareas: DaycareResource[]
  circulares: DaycareResource[]
  calendario: DaycareResource[]
  valor: Array<{ valor: string }>
}>('/api/daycare/family/dashboard', { timeout: 15000 })

const daycareTheme = computed(() => resolvePersonasTheme({ themeKey: 'daycare' }))
const canUsePersonasAutorizadas = computed(() => hasFamilyScope(session.value?.user, 'personasAutorizadas'))
const latestNotice = computed(() => dashboard.value?.circulares?.[0] || null)
const nextCalendar = computed(() => dashboard.value?.calendario?.[0] || null)
const daycareGuide = computed(() => {
  if (dashboard.value?.tareas?.length) return {
    tone: 'notice' as const,
    variant: 'help' as const,
    eyebrow: 'Siguiente paso',
    title: 'Hay tarea lista para revisar',
    message: 'Empieza por la tarea más reciente y conserva este espacio como tu guía diaria de guardería.'
  }
  if (latestNotice.value) return {
    tone: 'calm' as const,
    variant: 'preview' as const,
    eyebrow: 'Prioridad de hoy',
    title: 'El comunicado más reciente queda destacado',
    message: 'Tu embajador te ayuda a identificar primero lo importante y después explorar el resto de publicaciones.'
  }
  return {
    tone: 'success' as const,
    variant: 'empty' as const,
    eyebrow: 'Todo tranquilo',
    title: 'Sin pendientes urgentes por ahora',
    message: 'Cuando la sala publique tareas, avisos o eventos, aparecerán aquí con una ruta clara de revisión.'
  }
})
const salaLine = computed(() => {
  const user = session.value?.user
  return [user?.scopes.daycare?.unidad || 'Unidad', user?.scopes.daycare?.sala ? `Sala ${user.scopes.daycare.sala}` : null].filter(Boolean).join(' · ')
})
</script>

<style scoped>
.daycare-home {
  display: grid;
  gap: 14px;
}

.daycare-command {
  align-items: stretch;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.7fr);
}

.command-main {
  background:
    radial-gradient(circle at 88% 12%, rgba(255, 181, 69, .34), transparent 34%),
    linear-gradient(135deg, #244f19 0%, #3f7d22 56%, #85aa35 100%);
  border-radius: 26px;
  box-shadow: 0 20px 48px rgba(46, 82, 25, .2);
  color: #fff;
  display: grid;
  min-height: 260px;
  overflow: hidden;
  padding: clamp(20px, 3vw, 30px);
  position: relative;
}

.command-main::after {
  background: radial-gradient(circle, rgba(255, 255, 255, .24), transparent 62%);
  content: '';
  height: 220px;
  opacity: .16;
  position: absolute;
  right: 28px;
  top: 22px;
  width: 220px;
}

.command-ambassador {
  bottom: -8px;
  height: min(78%, 250px);
  pointer-events: none;
  position: absolute;
  z-index: 1;
  right: clamp(8px, 3vw, 38px);
  width: min(34%, 250px);
}

.command-ambassador :deep(.pa-ambassador-card),
.command-ambassador :deep(.pa-ambassador-visual) {
  height: 100%;
  width: 100%;
}

.daycare-guidance {
  max-width: none;
}

.command-copy,
.command-stats,
.command-actions {
  position: relative;
  z-index: 1;
}

.command-copy {
  align-self: start;
  max-width: 620px;
}

.command-copy .eyebrow,
.command-copy p {
  color: rgba(255, 255, 255, .86);
}

.command-copy h1 {
  color: #fff;
  font-size: clamp(2rem, 4.2vw, 3.6rem);
  line-height: .95;
  margin-bottom: 10px;
  max-width: 760px;
}

.command-stats {
  align-self: end;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.command-stats span {
  background: rgba(255, 255, 255, .16);
  border: 1px solid rgba(255, 255, 255, .28);
  border-radius: 16px;
  color: rgba(255, 255, 255, .9);
  display: grid;
  min-width: 108px;
  padding: 10px 12px;
}

.command-stats strong {
  color: #fff;
  font-family: var(--font-title);
  font-size: 1.55rem;
  line-height: 1;
}

.command-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.command-actions .btn-primary {
  background: #fff;
  color: var(--color-brand-900);
  box-shadow: none;
}

.command-actions .btn-secondary {
  background: rgba(255, 255, 255, .12);
  border-color: rgba(255, 255, 255, .3);
  color: #fff;
}

.command-side {
  display: grid;
  gap: 12px;
}

.latest-card {
  background: #fff;
  border: 1px solid var(--color-brand-200);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
  display: grid;
  gap: 10px;
  padding: 18px;
}

.latest-label {
  color: var(--color-amber);
  font-size: .74rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.latest-card small {
  background: var(--color-brand-100);
  border-radius: 999px;
  color: var(--color-brand-700);
  justify-self: start;
  padding: 5px 10px;
}

.latest-card h2 {
  font-size: clamp(1.25rem, 2.1vw, 1.75rem);
  margin-bottom: 0;
}

.latest-card p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.latest-card .btn {
  justify-self: start;
}

.quick-dock {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.quick-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 6px;
  min-height: 84px;
  padding: 14px;
}

.quick-card span {
  color: var(--color-muted);
  font-size: .78rem;
}

.quick-card strong {
  color: var(--color-ink);
  font-size: 1.02rem;
}

.quick-card.richmond {
  background: linear-gradient(135deg, #fff2d7, #ffbd59);
  border-color: #ffd993;
}

.quick-card.calendar {
  background: linear-gradient(135deg, #f8fbf1, #e5f1d8);
}

.quick-card.school {
  background: linear-gradient(135deg, #eef7fb, #d7edf7);
  border-color: #c7e2ef;
}

.today-grid {
  align-items: start;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, .62fr);
}

.focus-panel,
.compact-panel-card {
  border-radius: 22px;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-head h2 {
  color: var(--color-brand-800);
  font-size: clamp(1.25rem, 2vw, 1.65rem);
  margin-bottom: 0;
}

.small-head {
  margin-bottom: 10px;
}

.small-head h2 {
  font-size: 1.16rem;
}

.notice-timeline {
  border-left: 4px solid var(--color-brand-200);
  display: grid;
  gap: 14px;
  padding-left: 16px;
}

.side-panel-stack {
  display: grid;
  gap: 12px;
}

.next-event {
  align-items: start;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  display: grid;
  gap: 12px;
  grid-template-columns: 74px minmax(0, 1fr);
  padding: 12px;
}

.date-box {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-brand-200);
  border-radius: 16px;
  display: grid;
  justify-items: center;
  min-height: 70px;
  padding: 8px;
  text-transform: capitalize;
}

.date-box strong {
  color: var(--color-brand-700);
  font-size: 1.7rem;
  line-height: 1;
}

.date-box span {
  color: var(--color-muted);
  font-size: .72rem;
}

.next-event h3 {
  margin-bottom: 5px;
}

.quiet-copy {
  background: var(--surface-muted);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px;
}

.value-box {
  align-items: center;
  background: #fff;
  border: 2px dashed var(--color-amber);
  border-radius: 20px;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding: 14px;
}

.value-box span {
  color: var(--color-muted);
  font-size: .75rem;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.value-box strong {
  color: var(--color-brand-800);
  font-size: 1.1rem;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1120px) {
  .daycare-command,
  .today-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .daycare-command,
  .today-grid {
    gap: 12px;
  }

  .command-main {
    border-radius: 22px;
    min-height: 0;
    padding: 20px;
  }

  .command-main::after {
    height: 150px;
    right: -18px;
    top: 22px;
    width: 150px;
  }

  .command-ambassador {
    bottom: -10px;
    opacity: .78;
    right: -18px;
    width: 132px;
  }

  .command-copy h1 {
    font-size: clamp(1.9rem, 11vw, 2.6rem);
    max-width: 300px;
  }

  .command-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .command-stats span {
    min-width: 0;
    padding: 9px;
  }

  .quick-dock {
    grid-template-columns: 1fr;
  }

  .section-head,
  .value-box {
    align-items: stretch;
    flex-direction: column;
  }

  .next-event {
    grid-template-columns: 1fr;
  }
}
</style>
