<template>
  <NuxtPage v-if="!isSalaSummary" />
  <section v-else class="room-summary" data-product-area="daycare" data-product-screen="sala-resumen">
    <AdminModuleTabs :sala-id="salaId" />

    <p v-if="error" class="surface-message error">No fue posible cargar la sala.</p>
    <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
    <div v-else-if="pending" class="state-panel" data-product-loading>
      <HuskyPassLoader label="Sala" contained />
    </div>

    <template v-else-if="overview">
      <header class="room-head" data-diagnostic="sala-context">
        <span class="room-avatar">{{ roomInitials(overview.sala.sala) }}</span>
        <div>
          <p class="eyebrow">{{ overview.sala.unidad }}</p>
          <h1>{{ overview.sala.sala }}</h1>
          <p>Familias y publicaciones visibles solo para esta sala.</p>
        </div>
        <div class="head-actions">
          <button v-if="canPreviewAsFamily" class="btn btn-secondary" type="button" data-diagnostic-action="preview-sala" @click="previewSala">Vista familiar</button>
          <NuxtLink class="btn btn-primary" :to="`/admin/daycare/salas/${salaId}/familias`" data-diagnostic-link="gestionar-familias">Ver familias</NuxtLink>
        </div>
      </header>

      <section class="room-facts" aria-label="Resumen de sala">
        <article><span>Familias</span><strong>{{ overview.metrics.familias }}</strong></article>
        <article><span>Tareas</span><strong>{{ overview.metrics.tareas }}</strong></article>
        <article><span>Avisos</span><strong>{{ overview.metrics.avisos }}</strong></article>
        <article><span>Fechas</span><strong>{{ overview.metrics.calendario }}</strong></article>
      </section>

      <section class="room-layout">
        <article class="today-panel">
          <div class="section-title">
            <div>
              <p class="eyebrow">Qué hacer</p>
              <h2>Acciones de sala</h2>
            </div>
          </div>
          <div class="action-grid">
            <NuxtLink v-for="section in sections" :key="section.to" :to="section.to" class="action-card" data-diagnostic-link="seccion-sala">
              <span>{{ section.abbr }}</span>
              <strong>{{ section.title }}</strong>
              <small>{{ section.description }}</small>
            </NuxtLink>
          </div>
        </article>

        <aside class="activity-panel">
          <div class="section-title">
            <div>
              <p class="eyebrow">Publicado</p>
              <h2>Últimos cambios</h2>
            </div>
          </div>

          <div v-if="overview.latestResources.length" class="activity-list">
            <article v-for="item in overview.latestResources" :key="item.id">
              <span>{{ resourceTypeLabel(item.type) }}</span>
              <strong>{{ item.title || 'Sin título' }}</strong>
              <small>{{ formatDate(item.date || item.timestamp, 'Sin fecha') }}</small>
            </article>
          </div>
          <EmptyState v-else title="Sin publicaciones" description="La sala aún no tiene tareas, avisos o fechas visibles." />
        </aside>
      </section>

      <section class="families-strip" data-product-panel="sala-families" :data-state="overview.latestFamilies.length ? 'content' : 'empty'">
        <div class="section-title">
          <div>
            <p class="eyebrow">Familias recientes</p>
            <h2>Cuentas de esta sala</h2>
          </div>
          <NuxtLink class="btn btn-secondary" :to="`/admin/daycare/salas/${salaId}/familias`" data-diagnostic-link="ver-familias">Ver todas</NuxtLink>
        </div>
        <div v-if="overview.latestFamilies.length" class="family-mini-list">
          <article v-for="family in overview.latestFamilies" :key="family.id">
            <strong>{{ family.nombre_nino || displayMatriculaCandidate(family.username) }}</strong>
            <small>{{ family.email || 'Sin correo' }}</small>
          </article>
        </div>
        <EmptyState v-else title="Sin familias" description="Agrega cuentas familiares para esta sala." />
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
import { formatDate } from '~/utils/daycare'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const salaId = Number(route.params.id)
const actionError = ref('')
const isSalaSummary = computed(() => route.path.replace(/\/$/, '') === `/admin/daycare/salas/${salaId}`)
const { data: session } = useAppSession()
const { data: overview, pending, error } = useFetch<SalaOverview>(`/api/daycare/admin/salas/${salaId}/overview`, { timeout: 15000 })
const canPreviewAsFamily = computed(() => Boolean(session.value?.user?.kind === 'admin'))

const sections = computed(() => [
  { abbr: 'FA', title: 'Familias', description: 'Cuentas, acceso y soporte.', to: `/admin/daycare/salas/${salaId}/familias` },
  { abbr: 'TA', title: 'Tareas', description: 'Publicaciones para casa.', to: `/admin/daycare/salas/${salaId}/tareas` },
  { abbr: 'AV', title: 'Avisos', description: 'Mensajes para familias.', to: `/admin/daycare/salas/${salaId}/avisos` },
  { abbr: 'FE', title: 'Calendario', description: 'Fechas visibles.', to: `/admin/daycare/salas/${salaId}/calendario` }
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
  if (type === 'cal') return 'Fecha'
  return 'Publicación'
}
</script>

<style scoped>
.room-summary {
  display: grid;
  gap: 16px;
}

.room-head,
.today-panel,
.activity-panel,
.families-strip,
.state-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dce5eb;
  border-radius: 16px;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
}

.room-head {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  padding: clamp(16px, 2vw, 22px);
}

.room-head h1,
.section-title h2,
.state-panel h2 {
  color: #152032;
  font-family: var(--font-body);
  margin: 0;
}

.room-head h1 {
  font-size: clamp(1.8rem, 2.7vw, 2.6rem);
}

.room-head p:not(.eyebrow),
.action-card small,
.activity-list small,
.family-mini-list small {
  color: #667789;
  margin: 0;
}

.room-avatar {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 16px;
  color: #0d766d;
  display: inline-flex;
  font-size: 1.05rem;
  font-weight: 900;
  height: 58px;
  justify-content: center;
  width: 58px;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.room-facts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.room-facts article {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 14px;
  display: grid;
  gap: 4px;
  padding: 14px;
}

.room-facts span,
.activity-list span {
  color: #6b7a8b;
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
}

.room-facts strong {
  color: #152032;
  font-size: 1.35rem;
}

.room-layout {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 400px);
}

.today-panel,
.activity-panel,
.families-strip {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.section-title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.action-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.action-card {
  align-content: start;
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 13px;
  display: grid;
  gap: 7px;
  min-height: 110px;
  padding: 12px;
}

.action-card:hover {
  background: #f4faf8;
  border-color: #cae2dc;
}

.action-card span {
  align-items: center;
  background: #eef7f5;
  border-radius: 10px;
  color: #0d766d;
  display: inline-flex;
  font-size: 0.76rem;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.activity-list,
.family-mini-list {
  display: grid;
  gap: 8px;
}

.activity-list article,
.family-mini-list article {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 13px;
  display: grid;
  gap: 4px;
  padding: 10px 12px;
}

.family-mini-list {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.surface-message {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  color: #be123c;
  margin: 0;
  padding: 10px 12px;
}

.state-panel {
  color: #667789;
  display: grid;
  gap: 9px;
  min-height: 220px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

@media (max-width: 1140px) {
  .room-layout,
  .family-mini-list {
    grid-template-columns: 1fr;
  }

  .action-grid,
  .room-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .room-head,
  .action-grid,
  .room-facts {
    grid-template-columns: 1fr;
  }

  .head-actions {
    display: grid;
    justify-content: stretch;
  }
}
</style>
