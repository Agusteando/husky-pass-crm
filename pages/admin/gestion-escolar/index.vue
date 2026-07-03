<template>
  <section class="school-workbench" data-product-area="gestion-escolar" data-product-screen="overview">
    <header class="workspace-hero">
      <div>
        <p class="eyebrow">Escolar Admin</p>
        <h1>Workbench escolar</h1>
        <p>{{ contextSentence }}</p>
        <div class="scope-ribbon" aria-label="Alcance visible">
          <span v-for="plantel in overview?.reach.planteles || []" :key="plantel">{{ plantel }}</span>
          <span v-if="!(overview?.reach.planteles || []).length">Alcance pendiente</span>
        </div>
      </div>
      <section class="reach-grid" aria-label="Resumen de alcance">
        <article><span>Familias</span><strong>{{ overview?.reach.families || 0 }}</strong></article>
        <article><span>Estudiantes</span><strong>{{ overview?.reach.students || 0 }}</strong></article>
        <article><span>Grupos</span><strong>{{ overview?.reach.grupos.length || 0 }}</strong></article>
      </section>
    </header>

    <section v-if="pending" class="state-card" data-state="loading"><HuskyPassLoader label="Gestión Escolar" contained /></section>
    <section v-else-if="loadError" class="state-card" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No pudimos cargar tu operación escolar</h2>
      <p>Reintenta en un momento o solicita revisión de acceso.</p>
    </section>

    <template v-else>
      <section v-if="!modules.length" class="incomplete-card" data-state="empty">
        <div>
          <p class="eyebrow">Acceso incompleto</p>
          <h2>Tu cuenta aún no tiene una responsabilidad escolar activa.</h2>
          <p>Super Admin debe asignar un plantel o grupo antes de que puedas operar familias, comunicados, encuestas o convenios.</p>
        </div>
      </section>

      <section v-else class="workbench-grid">
        <article class="today-card">
          <div class="section-head">
            <div>
              <p class="eyebrow">Hoy</p>
              <h2>Qué necesita atención</h2>
            </div>
            <span class="soft-pill">{{ scopeLabel }}</span>
          </div>
          <div class="attention-list">
            <NuxtLink v-for="task in todayTasks" :key="task.to" :to="task.to" class="attention-row">
              <span><FamilyPersonasIcon :name="task.icon" /></span>
              <div>
                <strong>{{ task.title }}</strong>
                <small>{{ task.detail }}</small>
              </div>
              <b>{{ task.action }}</b>
            </NuxtLink>
          </div>
        </article>

        <aside class="context-card">
          <p class="eyebrow">Contexto activo</p>
          <h2>{{ scopeLabel }}</h2>
          <p>Todo lo que ves y publicas se limita a este alcance.</p>
          <div class="scope-map">
            <article v-for="plantel in overview?.options.scopeTree.planteles || []" :key="plantel.value">
              <strong>{{ plantel.label }}</strong>
              <small>{{ plantel.families }} familias · {{ plantel.students }} estudiantes</small>
            </article>
            <article v-if="!(overview?.options.scopeTree.planteles || []).length">
              <strong>Sin plantel</strong>
              <small>Solicita completar tu alcance.</small>
            </article>
          </div>
        </aside>
      </section>

      <section v-if="modules.length" class="workflow-grid" aria-label="Flujos escolares">
        <NuxtLink
          v-for="module in workflowModules"
          :key="module.key"
          class="workflow-card"
          :class="{ primary: module.key === 'familias' }"
          :to="`/admin/gestion-escolar/${module.key}`"
        >
          <span><FamilyPersonasIcon :name="module.icon" /></span>
          <div>
            <p class="eyebrow">{{ module.badge }}</p>
            <h2>{{ module.title }}</h2>
            <p>{{ module.description }}</p>
          </div>
          <b>{{ module.cta }}</b>
        </NuxtLink>
      </section>
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
  if (!planteles.length) return 'Alcance pendiente'
  if (planteles.length === 1) return `Plantel ${planteles[0]}`
  return `${planteles.length} planteles`
})
const contextSentence = computed(() => {
  const families = overview.value?.reach.families || 0
  if (!modules.value.length) return 'Tu operación escolar aparecerá aquí cuando Super Admin complete tu alcance.'
  return `Operas ${families} familias dentro de ${scopeLabel.value}.`
})

const todayTasks = computed(() => {
  const tasks: Array<{ title: string; detail: string; action: string; icon: string; to: string }> = []
  if (hasModule('familias')) {
    tasks.push({
      title: 'Familias y personas autorizadas',
      detail: `${overview.value?.reach.families || 0} familias visibles con contexto de plantel y grupo.`,
      action: 'Revisar',
      icon: 'people',
      to: '/admin/gestion-escolar/familias'
    })
  }
  if (hasModule('comunicados')) {
    tasks.push({
      title: 'Comunicados',
      detail: capabilityLabel('comunicados') === 'Publicar' ? 'Puedes crear y publicar avisos por audiencia.' : 'Puedes preparar borradores para revisión.',
      action: capabilityLabel('comunicados'),
      icon: 'announcement',
      to: '/admin/gestion-escolar/comunicados'
    })
  }
  if (hasModule('encuestas')) {
    tasks.push({ title: 'Encuestas', detail: 'Mantén formularios activos por plantel, grado o grupo.', action: 'Gestionar', icon: 'survey', to: '/admin/gestion-escolar/encuestas' })
  }
  if (hasModule('convenios')) {
    tasks.push({ title: 'Convenios', detail: 'Publica beneficios y documentos visibles para familias.', action: capabilityLabel('convenios'), icon: 'handshake', to: '/admin/gestion-escolar/convenios' })
  }
  return tasks
})

const workflowModules = computed(() => modules.value.map((module) => ({
  key: module.key,
  icon: moduleIcon(module.key),
  badge: capabilityLabel(module.key),
  title: workflowTitle(module.key),
  description: workflowDescription(module.key),
  cta: module.key === 'familias' ? 'Abrir soporte' : 'Abrir flujo'
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
  if (key === 'familias') return 'Busca familias, entiende por qué son visibles y abre vista familiar con confirmación.'
  if (key === 'comunicados') return 'Redacta, segmenta, programa y publica mensajes para tu alcance.'
  if (key === 'encuestas') return 'Activa formularios por audiencia y revisa qué familias los verán.'
  return 'Gestiona publicaciones institucionales y estados de visibilidad.'
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
.school-workbench {
  display: grid;
  gap: 16px;
}

.workspace-hero,
.today-card,
.context-card,
.workflow-card,
.state-card,
.incomplete-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  box-shadow: var(--shadow-soft);
}

.workspace-hero {
  align-items: end;
  background: linear-gradient(135deg, #fff, #f8fbf2);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
  padding: clamp(18px, 2.6vw, 32px);
}

h1,
h2,
p {
  margin: 0;
}

h1,
h2 {
  color: #17233b;
  line-height: 1.06;
}

h1 {
  font-size: clamp(2.15rem, 3.8vw, 4rem);
}

.scope-ribbon {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.scope-ribbon span,
.soft-pill {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  font-size: .78rem;
  font-weight: 850;
  padding: 8px 11px;
}

.reach-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
}

.reach-grid article {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
}

.reach-grid span,
.scope-map small,
.attention-row small,
.workflow-card p,
.context-card p {
  color: #64748b;
}

.reach-grid span {
  display: block;
  font-size: .7rem;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.reach-grid strong {
  color: #10213b;
  display: block;
  font-size: 1.55rem;
  margin-top: 6px;
}

.workbench-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
}

.today-card,
.context-card,
.incomplete-card {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.section-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.section-head h2,
.context-card h2 {
  margin-bottom: 0;
}

.attention-list,
.scope-map {
  display: grid;
  gap: 10px;
}

.attention-row {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  color: inherit;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 12px;
}

.attention-row:hover,
.workflow-card:hover {
  border-color: var(--color-brand-300);
  box-shadow: var(--shadow-line);
}

.attention-row > span,
.workflow-card > span {
  align-items: center;
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 14px;
  color: #9a6700;
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.attention-row strong,
.attention-row small,
.scope-map strong,
.scope-map small {
  display: block;
}

.attention-row b,
.workflow-card b {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-900);
  font-size: .72rem;
  padding: 7px 10px;
}

.scope-map article {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  display: grid;
  gap: 3px;
  padding: 12px;
}

.workflow-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.workflow-card {
  color: inherit;
  display: grid;
  gap: 12px;
  min-height: 220px;
  padding: 16px;
}

.workflow-card.primary {
  border-color: var(--color-brand-300);
}

.workflow-card h2 {
  margin-bottom: 6px;
}

.workflow-card b {
  justify-self: start;
  margin-top: auto;
}

.incomplete-card {
  align-items: center;
  min-height: 220px;
}

.state-card {
  color: #64748b;
  display: grid;
  gap: 8px;
  min-height: 260px;
  place-items: center;
  padding: 28px;
  text-align: center;
}

@media (max-width: 1180px) {
  .workspace-hero,
  .workbench-grid,
  .workflow-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .workspace-hero,
  .workbench-grid,
  .workflow-grid,
  .reach-grid {
    grid-template-columns: 1fr;
  }

  .attention-row {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .attention-row b {
    grid-column: 1 / -1;
    justify-self: start;
  }

  .section-head {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
