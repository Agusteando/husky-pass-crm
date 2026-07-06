<template>
  <section class="school-console" data-product-area="gestion-escolar" data-product-screen="overview">
    <header class="school-head">
      <div>
        <p class="eyebrow">Escolar</p>
        <h1>{{ scopeLabel }}</h1>
        
      </div>
      <div class="head-actions">
        <NuxtLink v-if="hasModule('familias')" class="btn btn-primary" to="/admin/gestion-escolar/familias">Ver familias</NuxtLink>
        <NuxtLink v-if="hasModule('comunicados')" class="btn btn-secondary" to="/admin/gestion-escolar/comunicados">Crear comunicado</NuxtLink>
      </div>
    </header>

    <section v-if="pending" class="state-panel" data-state="loading">
      <HuskyPassLoader label="Escolar" contained />
    </section>
    <section v-else-if="loadError" class="state-panel" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No pudimos cargar Escolar</h2>
      <p>Reintenta en un momento o solicita revisar tu acceso.</p>
    </section>

    <template v-else>
      <section v-if="!modules.length" class="state-panel access-empty" data-state="empty">
        <FamilyPersonasIcon name="school" />
        <h2>Acceso incompleto</h2>
        <p>Super Admin debe asignarte un plantel, grado o grupo antes de operar familias y publicaciones.</p>
      </section>

      <template v-else>
        <section class="scope-strip" aria-label="Acceso escolar asignado">
          <article>
            <span>Familias</span>
            <strong>{{ overview?.reach.families || 0 }}</strong>
          </article>
          <article>
            <span>Estudiantes</span>
            <strong>{{ overview?.reach.students || 0 }}</strong>
          </article>
          <article>
            <span>Planteles</span>
            <strong>{{ overview?.reach.planteles.length || 0 }}</strong>
          </article>
          <article>
            <span>Grupos</span>
            <strong>{{ overview?.reach.grupos.length || 0 }}</strong>
          </article>
        </section>

        <section class="school-layout">
          <article class="today-panel">
            <div class="section-title">
              <div>
                <p class="eyebrow">Hoy</p>
                <h2>Abrir</h2>
              </div>
              <span>{{ scopeLabel }}</span>
            </div>

            <div class="work-list">
              <NuxtLink v-for="task in todayTasks" :key="task.to" :to="task.to" class="work-row">
                <span class="row-icon"><FamilyPersonasIcon :name="task.icon" /></span>
                <span>
                  <strong>{{ task.title }}</strong>
                  <small>{{ task.detail }}</small>
                </span>
                <b>{{ task.action }}</b>
              </NuxtLink>
            </div>
          </article>

          <aside class="scope-panel">
            <div class="section-title vertical">
              <div>
                <p class="eyebrow">Planteles</p>
                <h2>{{ scopeLabel }}</h2>
              </div>
              <p></p>
            </div>

            <div class="scope-list">
              <article v-for="plantel in overview?.options.scopeTree.planteles || []" :key="plantel.value">
                <strong>{{ plantel.label }}</strong>
                <small>{{ plantel.families }} familias · {{ plantel.students }} estudiantes</small>
              </article>
              <article v-if="!(overview?.options.scopeTree.planteles || []).length">
                <strong>Sin plantel</strong>
                <small>Solicita completar tu acceso escolar.</small>
              </article>
            </div>
          </aside>
        </section>

        <section class="publishing-row" aria-label="Publicaciones escolares">
          <NuxtLink v-for="module in workflowModules" :key="module.key" class="publish-card" :class="{ primary: module.key === 'familias' }" :to="`/admin/gestion-escolar/${module.key}`">
            <span><FamilyPersonasIcon :name="module.icon" /></span>
            <div>
              <strong>{{ module.title }}</strong>
              <small>{{ module.description }}</small>
            </div>
            <b>{{ module.cta }}</b>
          </NuxtLink>
        </section>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { GestionEscolarModuleKey, GestionEscolarOverviewResponse } from '~/types/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })

const { data: overview, pending, error: loadError } = useFetch<GestionEscolarOverviewResponse>('/api/admin/gestion-escolar/overview', { timeout: 15000 })
const modules = computed(() => overview.value?.modules.filter((module) => module.enabled) || [])
const scopeLabel = computed(() => {
  const planteles = overview.value?.reach.planteles || []
  if (!planteles.length) return 'Acceso pendiente'
  if (planteles.length === 1) return `Plantel ${planteles[0]}`
  return `${planteles.length} planteles`
})
const todayTasks = computed(() => {
  const tasks: Array<{ title: string; detail: string; action: string; icon: string; to: string }> = []
  if (hasModule('familias')) {
    tasks.push({
      title: 'Familias y personas autorizadas',
      detail: `${overview.value?.reach.families || 0} familias visibles con plantel y grupo.`,
      action: 'Revisar',
      icon: 'people',
      to: '/admin/gestion-escolar/familias'
    })
  }
  if (hasModule('comunicados')) {
    tasks.push({
      title: 'Comunicados',
      detail: capabilityLabel('comunicados') === 'Publicar' ? 'Puedes publicar mensajes para tu audiencia.' : 'Puedes preparar borradores.',
      action: capabilityLabel('comunicados'),
      icon: 'announcement',
      to: '/admin/gestion-escolar/comunicados'
    })
  }
  if (hasModule('encuestas')) {
    tasks.push({ title: 'Encuestas', detail: 'Mantén formularios activos para familias reales.', action: 'Gestionar', icon: 'survey', to: '/admin/gestion-escolar/encuestas' })
  }
  if (hasModule('convenios')) {
    tasks.push({ title: 'Convenios', detail: 'Controla qué documentos están visibles.', action: capabilityLabel('convenios'), icon: 'handshake', to: '/admin/gestion-escolar/convenios' })
  }
  return tasks
})

const workflowModules = computed(() => modules.value.map((module) => ({
  key: module.key,
  icon: moduleIcon(module.key),
  title: workflowTitle(module.key),
  description: workflowDescription(module.key),
  cta: module.key === 'familias' ? 'Abrir' : capabilityLabel(module.key)
})))

function hasModule(key: GestionEscolarModuleKey) {
  return modules.value.some((module) => module.key === key)
}

function moduleIcon(key: GestionEscolarModuleKey) {
  if (key === 'comunicados') return 'announcement'
  if (key === 'encuestas') return 'survey'
  if (key === 'convenios') return 'handshake'
  return 'people'
}

function workflowTitle(key: GestionEscolarModuleKey) {
  if (key === 'familias') return 'Familias'
  if (key === 'comunicados') return 'Comunicados'
  if (key === 'encuestas') return 'Encuestas'
  return 'Convenios'
}

function workflowDescription(key: GestionEscolarModuleKey) {
  if (key === 'familias') return 'Soporte, contexto y vista familiar controlada.'
  if (key === 'comunicados') return 'Redacta, segmenta, programa y publica.'
  if (key === 'encuestas') return 'Activa formularios para una audiencia clara.'
  return 'Publica documentos visibles para familias.'
}

function capabilityLabel(key: GestionEscolarModuleKey) {
  const module = modules.value.find((item) => item.key === key)
  if (!module) return 'Sin acceso'
  if (key === 'comunicados') return module.capabilities.includes('comunicados.publish') ? 'Publicar' : 'Borradores'
  if (key === 'convenios') return module.capabilities.includes('convenios.publish') ? 'Publicar' : 'Editar'
  if (key === 'familias') return module.capabilities.includes('familias.impersonate') ? 'Vista familiar' : 'Consulta'
  return 'Gestionar'
}
</script>

<style scoped>
.school-console {
  display: grid;
  gap: 16px;
}

.school-head,
.today-panel,
.scope-panel,
.publish-card,
.state-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dce5eb;
  border-radius: 16px;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
}

.school-head {
  align-items: end;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: clamp(18px, 2.2vw, 28px);
}

.school-head h1 {
  color: #152032;
  font-family: var(--font-body);
  font-size: clamp(2rem, 3vw, 3.1rem);
  margin: 0;
}

.school-head p:not(.eyebrow),
.scope-panel p,
.work-row small,
.publish-card small,
.scope-list small {
  color: #667789;
  margin: 0;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.scope-strip {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.scope-strip article {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 14px;
  display: grid;
  gap: 4px;
  padding: 14px;
}

.scope-strip span {
  color: #6b7a8b;
  font-size: 0.72rem;
  font-weight: 850;
  text-transform: uppercase;
}

.scope-strip strong {
  color: #152032;
  font-size: 1.45rem;
}

.school-layout {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 410px);
}

.today-panel,
.scope-panel {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.section-title {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.section-title.vertical {
  align-items: start;
  display: grid;
}

.section-title h2 {
  color: #152032;
  font-family: var(--font-body);
  margin: 0;
}

.section-title > span {
  background: #f4faf8;
  border: 1px solid #cae2dc;
  border-radius: 999px;
  color: #0d766d;
  font-size: 0.76rem;
  font-weight: 850;
  padding: 7px 10px;
}

.work-list,
.scope-list {
  display: grid;
  gap: 8px;
}

.work-row {
  align-items: center;
  border: 1px solid #e1e8ed;
  border-radius: 13px;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 12px;
}

.work-row:hover,
.publish-card:hover {
  border-color: #cae2dc;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.row-icon,
.publish-card > span {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 12px;
  color: #0d766d;
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.work-row strong,
.work-row small,
.scope-list strong,
.scope-list small,
.publish-card strong,
.publish-card small {
  display: block;
}

.work-row b,
.publish-card b {
  background: #e7f8ef;
  border: 1px solid #bfead0;
  border-radius: 999px;
  color: #15803d;
  font-size: 0.74rem;
  padding: 7px 10px;
}

.scope-list article {
  background: #f8fafc;
  border: 1px solid #e1e8ed;
  border-radius: 13px;
  padding: 12px;
}

.publishing-row {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.publish-card {
  align-content: start;
  display: grid;
  gap: 12px;
  min-height: 190px;
  padding: 14px;
}

.publish-card.primary {
  border-color: #cae2dc;
}

.publish-card b {
  justify-self: start;
  margin-top: auto;
}

.state-panel {
  color: #667789;
  display: grid;
  gap: 9px;
  min-height: 250px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-panel h2 {
  color: #152032;
  font-family: var(--font-body);
  margin: 0;
}

.access-empty {
  min-height: 360px;
}

@media (max-width: 1120px) {
  .school-layout,
  .publishing-row,
  .scope-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .school-head,
  .head-actions,
  .section-title {
    align-items: stretch;
    flex-direction: column;
  }

  .head-actions {
    display: grid;
    justify-content: stretch;
  }

  .school-layout,
  .publishing-row,
  .scope-strip,
  .work-row {
    grid-template-columns: 1fr;
  }

  .work-row b {
    justify-self: start;
  }
}
</style>
