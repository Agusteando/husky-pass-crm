<template>
  <section class="daycare-home">
    <p v-if="error" class="alert">No fue posible cargar guardería.</p>

    <div v-else-if="pending" class="home-skeleton" aria-label="Cargando">
      <span class="skeleton-hero"></span>
      <span v-for="index in 3" :key="index" class="skeleton-tile"></span>
    </div>

    <template v-else>
      <header class="daycare-hero">
        <div class="hero-copy">
          <span class="hero-kicker">{{ salaLine }}</span>
          <h1>Hola, {{ firstName }}</h1>
          <div class="hero-badges">
            <span v-if="dashboard?.valor?.[0]?.valor" class="value-pill">
              <FamilyPersonasIcon name="sparkles" />
              {{ dashboard.valor[0].valor }}
            </span>
            <span class="content-pill">{{ totalItems }} publicaciones</span>
          </div>
        </div>

        <div class="hero-art" aria-hidden="true">
          <span class="hero-sun"></span>
          <span class="hero-dot dot-one"></span>
          <span class="hero-dot dot-two"></span>
          <img :src="sunnyHero" alt="" />
        </div>
      </header>

      <nav class="daycare-overview" aria-label="Secciones de guardería">
        <NuxtLink
          v-for="card in overviewCards"
          :key="card.to"
          :to="card.to"
          class="overview-card"
          :class="card.tone"
        >
          <span class="overview-icon"><FamilyPersonasIcon :name="card.icon" /></span>
          <span class="overview-copy">
            <small>{{ card.label }}</small>
            <strong>{{ card.count }}</strong>
            <em>{{ card.detail }}</em>
          </span>
          <span class="overview-arrow"><FamilyPersonasIcon name="arrow" /></span>
        </NuxtLink>
      </nav>

      <section class="daycare-mosaic">
        <article class="notice-spotlight">
          <header class="spotlight-meta">
            <span><FamilyPersonasIcon name="announcement" /> Aviso reciente</span>
            <time v-if="latestNotice">{{ compactDate(latestNotice.date || latestNotice.timestamp) }}</time>
          </header>

          <template v-if="latestNotice">
            <div class="spotlight-copy">
              <h2>{{ latestNotice.title || 'Aviso' }}</h2>
              <p v-if="noticeCopy">{{ noticeCopy }}</p>
            </div>
            <img
              v-if="noticeImage"
              class="spotlight-image"
              :src="noticeImage"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <a v-if="resourceUrl(latestNotice)" class="spotlight-action" :href="resourceUrl(latestNotice)" target="_blank" rel="noopener">
              Abrir
              <FamilyPersonasIcon name="arrow" />
            </a>
            <NuxtLink v-else class="spotlight-action" to="/familia/daycare/avisos">
              Ver avisos
              <FamilyPersonasIcon name="arrow" />
            </NuxtLink>
          </template>

          <template v-else>
            <div class="spotlight-empty">
              <h2>Sin avisos nuevos</h2>
              <img :src="sunnyEmpty" alt="" />
            </div>
          </template>
        </article>

        <div class="mosaic-side">
          <NuxtLink class="moment-card calendar-moment" to="/familia/daycare/calendario">
            <div v-if="nextCalendar" class="moment-date">
              <strong>{{ calendarDate.day }}</strong>
              <span>{{ calendarDate.month }}</span>
            </div>
            <span v-else class="moment-icon"><FamilyPersonasIcon name="calendar" /></span>
            <div class="moment-copy">
              <small>Agenda</small>
              <h3>{{ nextCalendar?.title || 'Sin eventos próximos' }}</h3>
              <p v-if="nextCalendar">{{ calendarDate.weekday }}</p>
            </div>
            <FamilyPersonasIcon name="arrow" />
          </NuxtLink>

          <NuxtLink class="moment-card homework-moment" to="/familia/daycare/tareas">
            <span class="moment-icon"><FamilyPersonasIcon name="edit" /></span>
            <div class="moment-copy">
              <small>Tareas</small>
              <h3>{{ latestHomework?.title || 'Sin tareas por ahora' }}</h3>
              <p v-if="latestHomework">{{ compactDate(latestHomework.date || latestHomework.timestamp) }}</p>
            </div>
            <FamilyPersonasIcon name="arrow" />
          </NuxtLink>
        </div>
      </section>

      <section v-if="utilityLinks.length" class="utility-bar" aria-label="Accesos relacionados">
        <template v-for="link in utilityLinks" :key="link.label">
          <a v-if="link.external" :href="link.to" target="_blank" rel="noopener" class="utility-link">
            <span><FamilyPersonasIcon :name="link.icon" /></span>
            <strong>{{ link.label }}</strong>
            <FamilyPersonasIcon name="arrow" />
          </a>
          <NuxtLink v-else :to="link.to" class="utility-link">
            <span><FamilyPersonasIcon :name="link.icon" /></span>
            <strong>{{ link.label }}</strong>
            <FamilyPersonasIcon name="arrow" />
          </NuxtLink>
        </template>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRuntimeConfig } from 'nuxt/app'
import { useAppSession } from '~/composables/useAppSession'
import type { DaycareResource } from '~/types/daycare'
import { formatCalendarDay, isImageResource, isPdfResource, parseLegacyDate, publishedPdfViewerUrl, stripHtml } from '~/utils/daycare'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'
import { hasFamilyScope } from '~/utils/sessionScopes'

definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })

const config = useRuntimeConfig()
const { data: session } = useAppSession()
const { data: dashboard, pending, error } = useFetch<{
  tareas: DaycareResource[]
  circulares: DaycareResource[]
  calendario: DaycareResource[]
  valor: Array<{ valor: string }>
}>('/api/daycare/family/dashboard', { timeout: 15000 })

const daycareTheme = resolvePersonasTheme({ themeKey: 'daycare' })
const sunnyHero = personasMascot(daycareTheme, 'hero')
const sunnyEmpty = personasMascot(daycareTheme, 'empty')
const latestNotice = computed(() => dashboard.value?.circulares?.[0] || null)
const latestHomework = computed(() => dashboard.value?.tareas?.[0] || null)
const nextCalendar = computed(() => dashboard.value?.calendario?.[0] || null)
const calendarDate = computed(() => formatCalendarDay(nextCalendar.value?.date || nextCalendar.value?.timestamp))
const noticeCopy = computed(() => stripHtml(latestNotice.value?.description || latestNotice.value?.html))
const noticeImage = computed(() => latestNotice.value?.resource && isImageResource(latestNotice.value.resource) ? latestNotice.value.resource : '')
const totalItems = computed(() => (dashboard.value?.tareas?.length || 0) + (dashboard.value?.circulares?.length || 0) + (dashboard.value?.calendario?.length || 0))
const firstName = computed(() => {
  const displayName = session.value?.user?.displayName?.trim()
  return displayName?.split(/\s+/)[0] || 'familia'
})
const salaLine = computed(() => {
  const daycare = session.value?.user?.scopes.daycare
  return [daycare?.unidad || 'Guardería', daycare?.sala ? `Sala ${daycare.sala}` : null].filter(Boolean).join(' · ')
})
const overviewCards = computed(() => [
  {
    label: 'Tareas',
    count: dashboard.value?.tareas?.length || 0,
    detail: latestHomework.value?.title || 'Todo al día',
    icon: 'edit',
    to: '/familia/daycare/tareas',
    tone: 'tone-amber'
  },
  {
    label: 'Avisos',
    count: dashboard.value?.circulares?.length || 0,
    detail: latestNotice.value?.title || 'Sin novedades',
    icon: 'announcement',
    to: '/familia/daycare/avisos',
    tone: 'tone-green'
  },
  {
    label: 'Agenda',
    count: dashboard.value?.calendario?.length || 0,
    detail: nextCalendar.value ? compactDate(nextCalendar.value.date || nextCalendar.value.timestamp) : 'Sin fechas próximas',
    icon: 'calendar',
    to: '/familia/daycare/calendario',
    tone: 'tone-blue'
  }
])
const utilityLinks = computed(() => {
  const links: Array<{ label: string; to: string; icon: string; external: boolean }> = []
  if (config.public.richmondUrl) links.push({ label: 'Richmond', to: config.public.richmondUrl, icon: 'school', external: true })
  if (config.public.pasePlatformUrl) links.push({ label: 'PASE', to: config.public.pasePlatformUrl, icon: 'security', external: true })
  if (hasFamilyScope(session.value?.user, 'personasAutorizadas')) {
    links.push({ label: 'Personas autorizadas', to: '/familia/personas-autorizadas', icon: 'people', external: false })
  }
  return links
})

function compactDate(value?: string | null) {
  const date = parseLegacyDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(date).replace('.', '')
}

function resourceUrl(resource?: DaycareResource | null) {
  if (!resource?.resource) return ''
  return isPdfResource(resource.resource) ? publishedPdfViewerUrl(resource.resource) : resource.resource
}

</script>

<style scoped>
.daycare-home {
  display: grid;
  gap: clamp(16px, 2.2vw, 24px);
}

.daycare-hero {
  background:
    radial-gradient(circle at 18% 115%, rgba(255, 191, 71, 0.3), transparent 34%),
    radial-gradient(circle at 92% 4%, rgba(183, 222, 90, 0.25), transparent 28%),
    linear-gradient(135deg, #315f24 0%, #588f35 54%, #8eb341 100%);
  border-radius: 34px;
  box-shadow: 0 24px 56px rgba(49, 95, 36, 0.2);
  color: #fff;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 360px);
  min-height: 310px;
  overflow: hidden;
  padding: clamp(26px, 5vw, 54px);
  position: relative;
}

.daycare-hero::before {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  content: '';
  height: 350px;
  left: -170px;
  position: absolute;
  top: -190px;
  width: 350px;
}

.hero-copy {
  align-self: center;
  display: grid;
  gap: 14px;
  max-width: 650px;
  position: relative;
  z-index: 2;
}

.hero-kicker {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  color: #fff;
  font-size: clamp(2.8rem, 7vw, 5.9rem);
  line-height: 0.84;
  margin: 0;
  max-width: 720px;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.hero-badges > span {
  align-items: center;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  color: #fff;
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 800;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
}

.value-pill {
  background: rgba(255, 190, 71, 0.2);
}

.content-pill {
  background: rgba(255, 255, 255, 0.11);
}

.hero-badges :deep(.pa-icon) {
  height: 0.9rem;
  width: 0.9rem;
}

.hero-art {
  align-self: stretch;
  min-height: 240px;
  position: relative;
}

.hero-art img {
  bottom: -88px;
  filter: drop-shadow(0 22px 24px rgba(25, 55, 18, 0.25));
  height: 420px;
  object-fit: contain;
  object-position: center bottom;
  position: absolute;
  right: -12px;
  width: 100%;
  z-index: 2;
}

.hero-sun {
  background: rgba(255, 210, 104, 0.84);
  border-radius: 50%;
  box-shadow: 0 0 0 18px rgba(255, 255, 255, 0.08), 0 0 0 42px rgba(255, 255, 255, 0.04);
  height: 210px;
  position: absolute;
  right: 28px;
  top: 2px;
  width: 210px;
}

.hero-dot {
  background: rgba(255, 255, 255, 0.65);
  border-radius: 50%;
  position: absolute;
}

.dot-one {
  height: 12px;
  right: 4px;
  top: 34px;
  width: 12px;
}

.dot-two {
  bottom: 32px;
  height: 8px;
  left: 8px;
  width: 8px;
}

.daycare-overview {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.overview-card {
  --tile-accent: #5d8f3c;
  --tile-soft: #eff7e8;
  align-items: center;
  background: rgba(255, 255, 255, 0.93);
  border: 1px solid color-mix(in srgb, var(--tile-accent) 15%, transparent);
  border-radius: 23px;
  box-shadow: 0 11px 32px rgba(43, 72, 32, 0.07);
  display: grid;
  gap: 13px;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  min-height: 118px;
  padding: 15px;
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}

.overview-card:hover {
  box-shadow: 0 17px 38px rgba(43, 72, 32, 0.12);
  transform: translateY(-3px);
}

.tone-amber {
  --tile-accent: #e98f2f;
  --tile-soft: #fff1df;
}

.tone-green {
  --tile-accent: #5d8f3c;
  --tile-soft: #edf7e6;
}

.tone-blue {
  --tile-accent: #438fc7;
  --tile-soft: #eaf5fc;
}

.overview-icon,
.overview-arrow {
  align-items: center;
  display: inline-flex;
  justify-content: center;
}

.overview-icon {
  background: var(--tile-soft);
  border-radius: 17px;
  color: var(--tile-accent);
  height: 52px;
  width: 52px;
}

.overview-icon :deep(.pa-icon) {
  height: 1.25rem;
  width: 1.25rem;
}

.overview-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.overview-copy small {
  color: var(--tile-accent);
  font-size: 0.71rem;
  font-weight: 800;
  text-transform: uppercase;
}

.overview-copy strong {
  color: #263522;
  font-family: var(--font-title);
  font-size: 1.75rem;
  line-height: 1;
}

.overview-copy em {
  color: #7b8575;
  font-size: 0.69rem;
  font-style: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-arrow {
  color: var(--tile-accent);
}

.overview-arrow :deep(.pa-icon) {
  height: 1rem;
  width: 1rem;
}

.daycare-mosaic {
  align-items: stretch;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
}

.notice-spotlight {
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 190, 71, 0.13), transparent 32%),
    #fff;
  border: 1px solid rgba(93, 143, 60, 0.14);
  border-radius: 29px;
  box-shadow: 0 14px 42px rgba(43, 72, 32, 0.08);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(0, 220px);
  min-height: 300px;
  overflow: hidden;
  padding: clamp(21px, 3.2vw, 34px);
  position: relative;
}

.notice-spotlight::before {
  background: #5d8f3c;
  border-radius: 999px;
  content: '';
  height: 6px;
  left: clamp(21px, 3.2vw, 34px);
  position: absolute;
  top: 0;
  width: 62px;
}

.spotlight-meta {
  align-items: center;
  display: flex;
  gap: 10px;
  grid-column: 1 / -1;
  justify-content: space-between;
}

.spotlight-meta span {
  align-items: center;
  color: #5d8f3c;
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 800;
  gap: 7px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.spotlight-meta time {
  color: #858f80;
  font-size: 0.72rem;
}

.spotlight-copy {
  align-self: center;
  display: grid;
  gap: 12px;
}

.spotlight-copy h2,
.spotlight-empty h2 {
  color: #263522;
  font-size: clamp(1.8rem, 4vw, 3.3rem);
  line-height: 0.98;
  margin: 0;
}

.spotlight-copy p {
  color: #697464;
  display: -webkit-box;
  font-size: 0.9rem;
  line-height: 1.55;
  margin: 0;
  max-width: 620px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.spotlight-image {
  align-self: stretch;
  background: #f3f7ef;
  border-radius: 20px;
  max-height: 220px;
  object-fit: contain;
  width: 100%;
}

.spotlight-action {
  align-items: center;
  align-self: end;
  color: #5d8f3c;
  display: inline-flex;
  font-size: 0.8rem;
  font-weight: 800;
  gap: 6px;
  grid-column: 1 / -1;
  justify-self: start;
}

.spotlight-action :deep(.pa-icon) {
  height: 0.95rem;
  width: 0.95rem;
}

.spotlight-empty {
  align-items: end;
  display: grid;
  gap: 18px;
  grid-column: 1 / -1;
  grid-template-columns: minmax(0, 1fr) 170px;
}

.spotlight-empty img {
  align-self: end;
  max-height: 190px;
  object-fit: contain;
}

.mosaic-side {
  display: grid;
  gap: 14px;
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.moment-card {
  --moment-accent: #438fc7;
  --moment-soft: #eaf5fc;
  align-items: center;
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--moment-accent) 15%, transparent);
  border-radius: 25px;
  box-shadow: 0 12px 34px rgba(43, 72, 32, 0.07);
  display: grid;
  gap: 13px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  min-height: 140px;
  padding: 17px;
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}

.moment-card:hover {
  box-shadow: 0 17px 38px rgba(43, 72, 32, 0.12);
  transform: translateY(-2px);
}

.homework-moment {
  --moment-accent: #e98f2f;
  --moment-soft: #fff1df;
}

.moment-date,
.moment-icon {
  align-items: center;
  background: var(--moment-soft);
  border-radius: 17px;
  color: var(--moment-accent);
  display: grid;
  height: 66px;
  justify-items: center;
  width: 66px;
}

.moment-date strong {
  font-family: var(--font-title);
  font-size: 1.7rem;
  line-height: 0.9;
}

.moment-date span {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: capitalize;
}

.moment-icon :deep(.pa-icon) {
  height: 1.35rem;
  width: 1.35rem;
}

.moment-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.moment-copy small {
  color: var(--moment-accent);
  font-size: 0.69rem;
  font-weight: 800;
  text-transform: uppercase;
}

.moment-copy h3 {
  color: #2b3927;
  font-size: 1.08rem;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.moment-copy p {
  color: #838d7e;
  font-size: 0.71rem;
  margin: 0;
  text-transform: capitalize;
}

.moment-card > :deep(.pa-icon) {
  color: var(--moment-accent);
  height: 0.95rem;
  width: 0.95rem;
}

.utility-bar {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(53, 95, 36, 0.1);
  border-radius: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 7px;
}

.utility-link {
  align-items: center;
  border-radius: 16px;
  color: #52604d;
  display: inline-flex;
  flex: 1 1 180px;
  gap: 9px;
  min-height: 48px;
  padding: 7px 10px;
  transition: background 0.18s ease, color 0.18s ease;
}

.utility-link:hover {
  background: #f1f7eb;
  color: #355f24;
}

.utility-link > span {
  align-items: center;
  background: #eef5e8;
  border-radius: 12px;
  display: inline-flex;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.utility-link strong {
  font-size: 0.76rem;
  margin-right: auto;
}

.utility-link :deep(.pa-icon) {
  height: 0.95rem;
  width: 0.95rem;
}

.home-skeleton {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.home-skeleton span {
  animation: home-shimmer 1.3s ease-in-out infinite alternate;
  background: linear-gradient(110deg, #e9eee5 25%, #f8faf5 45%, #e9eee5 65%);
  background-size: 220% 100%;
  border-radius: 24px;
}

.skeleton-hero {
  grid-column: 1 / -1;
  min-height: 310px;
}

.skeleton-tile {
  min-height: 118px;
}

@keyframes home-shimmer {
  from { background-position: 90% 0; }
  to { background-position: -90% 0; }
}

@media (max-width: 960px) {
  .daycare-hero {
    grid-template-columns: minmax(0, 1fr) minmax(180px, 280px);
  }

  .daycare-mosaic {
    grid-template-columns: 1fr;
  }

  .mosaic-side {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: auto;
  }
}

@media (max-width: 760px) {
  .daycare-overview {
    grid-template-columns: 1fr;
  }

  .overview-card {
    min-height: 98px;
  }
}

@media (max-width: 620px) {
  .daycare-home {
    gap: 14px;
  }

  .daycare-hero {
    border-radius: 27px;
    grid-template-columns: minmax(0, 1fr) 112px;
    min-height: 225px;
    padding: 22px;
  }

  .hero-copy {
    gap: 10px;
  }

  .hero-copy h1 {
    font-size: clamp(2.55rem, 15vw, 4rem);
    max-width: 270px;
  }

  .hero-badges {
    gap: 6px;
    margin-top: 4px;
  }

  .hero-badges > span {
    min-height: 30px;
    padding: 0 10px;
  }

  .content-pill {
    display: none !important;
  }

  .hero-art {
    min-height: 170px;
  }

  .hero-art img {
    bottom: -49px;
    height: 245px;
    right: -38px;
    width: 170px;
  }

  .hero-sun {
    height: 120px;
    right: -10px;
    top: 18px;
    width: 120px;
  }

  .overview-card {
    border-radius: 20px;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    min-height: 92px;
    padding: 13px;
  }

  .overview-icon {
    border-radius: 15px;
    height: 48px;
    width: 48px;
  }

  .notice-spotlight {
    border-radius: 24px;
    grid-template-columns: 1fr;
    min-height: 260px;
    padding: 20px;
  }

  .spotlight-meta,
  .spotlight-action {
    grid-column: auto;
  }

  .spotlight-image {
    max-height: 180px;
  }

  .spotlight-empty {
    grid-template-columns: minmax(0, 1fr) 100px;
  }

  .spotlight-empty img {
    max-height: 130px;
  }

  .mosaic-side {
    grid-template-columns: 1fr;
  }

  .moment-card {
    border-radius: 21px;
    min-height: 116px;
    padding: 14px;
  }

  .utility-bar {
    border-radius: 19px;
  }

  .utility-link {
    flex-basis: 100%;
  }

  .home-skeleton {
    grid-template-columns: 1fr;
  }

  .skeleton-hero {
    grid-column: auto;
    min-height: 230px;
  }
}

@media (max-width: 380px) {
  .daycare-hero {
    grid-template-columns: minmax(0, 1fr) 82px;
    padding: 19px;
  }

  .hero-art img {
    right: -54px;
  }

  .hero-kicker {
    font-size: 0.66rem;
  }
}
</style>
