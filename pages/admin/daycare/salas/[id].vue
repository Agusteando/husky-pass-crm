<template>
  <NuxtPage v-if="!isSalaSummary" />
  <section v-else class="room-summary" data-product-area="daycare" data-product-screen="sala-resumen">
    <AdminModuleTabs :sala-id="salaId" :unidad="overview?.sala?.unidad" :sala-name="overview?.sala?.sala" />

    <p v-if="error" class="surface-message error">No fue posible cargar la sala.</p>
    <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
    <div v-else-if="pending" class="state-panel" data-product-loading>
      <HuskyPassLoader label="Sala" contained />
    </div>

    <template v-else-if="overview">
      <header class="room-hero" data-diagnostic="sala-context">
        <div class="hero-copy">
          <p class="hero-kicker">{{ overview.sala.unidad }}</p>
          <h1>{{ overview.sala.sala }}</h1>
          <div class="hero-badges">
            <span><FamilyPersonasIcon name="people" />{{ overview.metrics.familias }} familias</span>
            <span><FamilyPersonasIcon name="sparkles" />{{ totalPublications }} publicaciones</span>
          </div>
          <div class="head-actions">
            <button v-if="canPreviewAsFamily" class="hero-btn secondary" type="button" data-diagnostic-action="preview-sala" @click="previewSala">
              <FamilyPersonasIcon name="sparkles" />Vista familiar
            </button>
            <NuxtLink class="hero-btn primary" :to="`/admin/daycare/salas/${salaId}/familias`" data-diagnostic-link="gestionar-familias">
              Familias<FamilyPersonasIcon name="arrow" />
            </NuxtLink>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          <span class="hero-sun" />
          <span class="hero-dot dot-one" />
          <span class="hero-dot dot-two" />
          <img :src="sunnyPreview" alt="" />
        </div>
      </header>

      <section class="room-facts" aria-label="Resumen de sala">
        <article class="tone-green"><span><FamilyPersonasIcon name="people" /></span><div><small>Familias</small><strong>{{ overview.metrics.familias }}</strong></div></article>
        <article class="tone-amber"><span><FamilyPersonasIcon name="edit" /></span><div><small>Tareas</small><strong>{{ overview.metrics.tareas }}</strong></div></article>
        <article class="tone-coral"><span><FamilyPersonasIcon name="announcement" /></span><div><small>Avisos</small><strong>{{ overview.metrics.avisos }}</strong></div></article>
        <article class="tone-blue"><span><FamilyPersonasIcon name="calendar" /></span><div><small>Agenda</small><strong>{{ overview.metrics.calendario }}</strong></div></article>
      </section>

      <section class="room-layout">
        <article class="section-panel quick-panel">
          <header class="section-title">
            <div>
              <p class="eyebrow">Sala</p>
              <h2>Accesos rápidos</h2>
            </div>
          </header>
          <div class="action-grid">
            <NuxtLink v-for="section in sections" :key="section.to" :to="section.to" class="action-card" :class="section.tone" data-diagnostic-link="seccion-sala">
              <span class="action-icon"><FamilyPersonasIcon :name="section.icon" /></span>
              <span class="action-copy"><strong>{{ section.title }}</strong><small>{{ section.description }}</small></span>
              <span class="action-count">{{ section.count }}</span>
              <FamilyPersonasIcon name="arrow" />
            </NuxtLink>
          </div>
        </article>

        <aside class="section-panel activity-panel">
          <header class="section-title">
            <div>
              <p class="eyebrow">Actividad</p>
              <h2>Últimos cambios</h2>
            </div>
            <span class="section-mark"><FamilyPersonasIcon name="history" /></span>
          </header>

          <div v-if="overview.latestResources.length" class="activity-list">
            <article v-for="item in overview.latestResources" :key="item.id">
              <span class="activity-icon" :class="resourceTone(item.type)"><FamilyPersonasIcon :name="resourceIcon(item.type)" /></span>
              <div>
                <small>{{ resourceTypeLabel(item.type) }}</small>
                <strong>{{ item.title || 'Sin título' }}</strong>
                <time>{{ formatDate(item.date || item.timestamp, 'Sin fecha') }}</time>
              </div>
            </article>
          </div>
          <EmptyState v-else title="Sin publicaciones" />
        </aside>
      </section>

      <section class="section-panel families-strip" data-product-panel="sala-families" :data-state="overview.latestFamilies.length ? 'content' : 'empty'">
        <header class="section-title">
          <div>
            <p class="eyebrow">Familias</p>
            <h2>Cuentas recientes</h2>
          </div>
          <NuxtLink class="quiet-link" :to="`/admin/daycare/salas/${salaId}/familias`" data-diagnostic-link="ver-familias">Ver todas<FamilyPersonasIcon name="arrow" /></NuxtLink>
        </header>
        <div v-if="overview.latestFamilies.length" class="family-mini-list">
          <article v-for="family in overview.latestFamilies" :key="family.id">
            <span>{{ familyInitials(family.nombre_nino || displayMatriculaCandidate(family.username)) }}</span>
            <div><strong>{{ family.nombre_nino || displayMatriculaCandidate(family.username) }}</strong><small>{{ family.email || 'Sin correo' }}</small></div>
          </article>
        </div>
        <EmptyState v-else title="Sin familias" />
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import { computed, ref } from 'vue'
import { navigateTo, useFetch, useRoute } from 'nuxt/app'
import type { SalaOverview } from '~/types/daycare'
import { displayMatriculaCandidate } from '~/utils/matricula'
import { setCachedRouteSession } from '~/utils/routeSession'
import { hasDaycareAdminScope } from '~/utils/sessionScopes'
import type { PublicSession } from '~/types/session'
import { formatDate } from '~/utils/daycare'
import { personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'
import AdminModuleTabs from '~/components/admin/AdminModuleTabs.vue'
import EmptyState from '~/components/EmptyState.vue'
import HuskyPassLoader from '~/components/HuskyPassLoader.vue'
import FamilyPersonasIcon from '~/components/family/PersonasIcon.vue'

definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })

const route = useRoute()
const salaId = Number(route.params.id)
const actionError = ref('')
const isSalaSummary = computed(() => route.path.replace(/\/$/, '') === `/admin/daycare/salas/${salaId}`)
const { data: session } = useAppSession()
const { data: overview, pending, error } = useFetch<SalaOverview>(`/api/daycare/admin/salas/${salaId}/overview`, { timeout: 15000 })
const canPreviewAsFamily = computed(() => hasDaycareAdminScope(session.value?.user))
const sunnyPreview = personasMascot(resolvePersonasTheme({ themeKey: 'daycare' }), 'preview')
const totalPublications = computed(() => (overview.value?.metrics.tareas || 0) + (overview.value?.metrics.avisos || 0) + (overview.value?.metrics.calendario || 0))

const sections = computed(() => [
  { icon: 'people', title: 'Familias', description: 'Cuentas y accesos', count: overview.value?.metrics.familias || 0, tone: 'tone-green', to: `/admin/daycare/salas/${salaId}/familias` },
  { icon: 'edit', title: 'Tareas', description: 'Trabajo en casa', count: overview.value?.metrics.tareas || 0, tone: 'tone-amber', to: `/admin/daycare/salas/${salaId}/tareas` },
  { icon: 'announcement', title: 'Avisos', description: 'Mensajes de sala', count: overview.value?.metrics.avisos || 0, tone: 'tone-coral', to: `/admin/daycare/salas/${salaId}/avisos` },
  { icon: 'calendar', title: 'Agenda', description: 'Fechas y eventos', count: overview.value?.metrics.calendario || 0, tone: 'tone-blue', to: `/admin/daycare/salas/${salaId}/calendario` }
])

async function previewSala() {
  actionError.value = ''
  try {
    const response = await $fetch<PublicSession>('/api/auth/admin/preview-daycare', { method: 'POST', body: { sala: salaId } })
    setCachedRouteSession(response)
    await navigateTo('/familia/daycare')
  } catch (err: any) {
    actionError.value = err?.data?.message || err?.data?.statusMessage || err?.message || err?.statusMessage || 'No fue posible abrir la vista familiar.'
  }
}

function resourceTypeLabel(type?: string | null) {
  if (type === 'hw') return 'Tarea'
  if (type === 'news') return 'Aviso'
  if (type === 'cal') return 'Agenda'
  return 'Publicación'
}

function resourceIcon(type?: string | null) {
  if (type === 'hw') return 'edit'
  if (type === 'news') return 'announcement'
  if (type === 'cal') return 'calendar'
  return 'document'
}

function resourceTone(type?: string | null) {
  if (type === 'hw') return 'tone-amber'
  if (type === 'news') return 'tone-coral'
  if (type === 'cal') return 'tone-blue'
  return 'tone-green'
}

function familyInitials(value?: string | null) {
  return String(value || 'F').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}
</script>

<style scoped>
.room-summary {
  display: grid;
  gap: clamp(16px, 2.2vw, 24px);
}

.room-hero {
  background:
    radial-gradient(circle at 16% 118%, rgba(255, 190, 71, 0.34), transparent 34%),
    radial-gradient(circle at 92% 3%, rgba(183, 222, 90, 0.24), transparent 28%),
    linear-gradient(135deg, #294e20 0%, #527f32 55%, #90ae3f 100%);
  border-radius: 34px;
  box-shadow: 0 26px 64px rgba(49, 95, 36, 0.22);
  color: #fff;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 360px);
  min-height: 320px;
  overflow: hidden;
  padding: clamp(28px, 5vw, 54px);
  position: relative;
}

.room-hero::before {
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;
  content: '';
  height: 360px;
  left: -180px;
  position: absolute;
  top: -210px;
  width: 360px;
}

.hero-copy {
  align-self: center;
  display: grid;
  gap: 13px;
  max-width: 760px;
  position: relative;
  z-index: 2;
}

.hero-kicker {
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  margin: 0;
  text-transform: uppercase;
}

.hero-copy h1 {
  color: #fff;
  font-family: var(--font-title);
  font-size: clamp(3rem, 7vw, 6.2rem);
  letter-spacing: -0.04em;
  line-height: 0.84;
  margin: 0;
}

.hero-badges,
.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-badges span {
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.86);
  display: inline-flex;
  font-size: 0.72rem;
  gap: 6px;
  padding: 8px 11px;
}

.head-actions {
  margin-top: 6px;
}

.hero-btn {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 16px;
  display: inline-flex;
  font-weight: 800;
  gap: 8px;
  min-height: 46px;
  padding: 0 16px;
}

.hero-btn.primary {
  background: #fff;
  box-shadow: 0 16px 32px rgba(31, 55, 22, 0.18);
  color: #355f24;
}

.hero-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.23);
  color: #fff;
  cursor: pointer;
}

.hero-art {
  min-height: 270px;
  position: relative;
}

.hero-art img {
  bottom: -64px;
  filter: drop-shadow(0 24px 26px rgba(31, 57, 22, 0.24));
  max-height: 330px;
  object-fit: contain;
  position: absolute;
  right: -12px;
  width: min(100%, 310px);
  z-index: 2;
}

.hero-sun {
  background: rgba(255, 190, 71, 0.9);
  border-radius: 50%;
  height: 180px;
  position: absolute;
  right: 16px;
  top: 16px;
  width: 180px;
}

.hero-dot {
  background: rgba(255, 255, 255, 0.65);
  border-radius: 50%;
  position: absolute;
}

.dot-one { height: 14px; right: 10px; top: 4px; width: 14px; }
.dot-two { height: 8px; right: 210px; top: 30px; width: 8px; }

.room-facts {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.room-facts article {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 24px;
  display: grid;
  gap: 12px;
  grid-template-columns: 46px minmax(0, 1fr);
  min-height: 104px;
  padding: 16px;
}

.room-facts article > span {
  align-items: center;
  border-radius: 16px;
  display: inline-flex;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.room-facts small,
.room-facts strong {
  display: block;
}

.room-facts small {
  color: #707a69;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.room-facts strong {
  color: #263f1c;
  font-family: var(--font-title);
  font-size: 2rem;
  line-height: 1;
}

.tone-green { background: #edf6e4; border-color: rgba(87, 139, 38, 0.14) !important; }
.tone-green > span, .tone-green .action-icon, .activity-icon.tone-green { background: #dcebc9; color: #355f24; }
.tone-amber { background: #fff6e4; border-color: rgba(255, 181, 69, 0.2) !important; }
.tone-amber > span, .tone-amber .action-icon, .activity-icon.tone-amber { background: #ffe8bc; color: #93610c; }
.tone-coral { background: #fff0ed; border-color: rgba(220, 117, 101, 0.18) !important; }
.tone-coral > span, .tone-coral .action-icon, .activity-icon.tone-coral { background: #fbdad4; color: #a94e42; }
.tone-blue { background: #edf6fa; border-color: rgba(78, 145, 182, 0.17) !important; }
.tone-blue > span, .tone-blue .action-icon, .activity-icon.tone-blue { background: #d8ebf3; color: #236188; }

.room-layout {
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.3fr) minmax(330px, 0.7fr);
}

.section-panel,
.state-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(66, 104, 49, 0.13);
  border-radius: 28px;
  box-shadow: 0 20px 58px rgba(51, 82, 37, 0.09);
}

.section-panel {
  display: grid;
  gap: 15px;
  padding: clamp(16px, 2.2vw, 24px);
}

.section-title {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.eyebrow {
  color: #578b26;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0 0 5px;
  text-transform: uppercase;
}

.section-title h2 {
  color: #263f1c;
  font-family: var(--font-title);
  font-size: clamp(1.35rem, 2.4vw, 2rem);
  margin: 0;
}

.section-mark {
  align-items: center;
  background: #edf6e4;
  border-radius: 15px;
  color: #578b26;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.action-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-card {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 22px;
  display: grid;
  gap: 11px;
  grid-template-columns: 46px minmax(0, 1fr) auto auto;
  min-height: 94px;
  padding: 13px;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.action-card:hover {
  box-shadow: 0 16px 34px rgba(51, 82, 37, 0.1);
  transform: translateY(-2px);
}

.action-icon {
  align-items: center;
  border-radius: 16px;
  display: inline-flex;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.action-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.action-copy strong {
  color: #263f1c;
}

.action-copy small {
  color: #707a69;
  font-size: 0.74rem;
}

.action-count {
  background: rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  color: #52604a;
  font-size: 0.72rem;
  font-weight: 900;
  min-width: 30px;
  padding: 6px 8px;
  text-align: center;
}

.activity-list,
.family-mini-list {
  display: grid;
  gap: 9px;
}

.activity-list article {
  align-items: center;
  border-bottom: 1px solid rgba(66, 104, 49, 0.1);
  display: grid;
  gap: 11px;
  grid-template-columns: 42px minmax(0, 1fr);
  padding: 8px 2px 12px;
}

.activity-list article:last-child {
  border-bottom: 0;
}

.activity-icon {
  align-items: center;
  border-radius: 14px;
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.activity-list article > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.activity-list small,
.activity-list strong,
.activity-list time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-list small {
  color: #788173;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
}

.activity-list strong {
  color: #263f1c;
}

.activity-list time {
  color: #7b8475;
  font-size: 0.72rem;
}

.quiet-link {
  align-items: center;
  color: #355f24;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 900;
  gap: 6px;
}

.family-mini-list {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.family-mini-list article {
  align-items: center;
  background: #f8faf4;
  border: 1px solid rgba(66, 104, 49, 0.1);
  border-radius: 20px;
  display: grid;
  gap: 9px;
  grid-template-columns: 38px minmax(0, 1fr);
  padding: 10px;
}

.family-mini-list article > span {
  align-items: center;
  background: linear-gradient(135deg, #ddebca, #fff0c9);
  border-radius: 13px;
  color: #355f24;
  display: inline-flex;
  font-size: 0.68rem;
  font-weight: 950;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.family-mini-list article > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.family-mini-list strong,
.family-mini-list small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-mini-list strong {
  color: #263f1c;
  font-size: 0.8rem;
}

.family-mini-list small {
  color: #7b8475;
  font-size: 0.68rem;
}

.surface-message {
  background: #edf8e7;
  border: 1px solid #cbe4b8;
  border-radius: 16px;
  color: #355f24;
  margin: 0;
  padding: 11px 14px;
}

.surface-message.error {
  background: #fff1f0;
  border-color: #f4cbc5;
  color: #a23f35;
}

.state-panel {
  color: #717a6c;
  display: grid;
  gap: 10px;
  min-height: 240px;
  place-items: center;
  padding: 28px;
  text-align: center;
}

@media (max-width: 1120px) {
  .room-layout {
    grid-template-columns: 1fr;
  }

  .family-mini-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .room-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-art {
    display: none;
  }

  .room-facts,
  .action-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .room-hero {
    border-radius: 28px;
    padding: 26px 20px;
  }

  .hero-copy h1 {
    font-size: clamp(3rem, 16vw, 4.8rem);
  }

  .head-actions {
    display: grid;
  }

  .hero-btn {
    justify-content: center;
  }

  .room-facts,
  .action-grid,
  .family-mini-list {
    grid-template-columns: 1fr;
  }

  .action-card {
    min-height: 82px;
  }
}
</style>
