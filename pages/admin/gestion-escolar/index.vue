<template>
  <section class="school-console" data-product-area="gestion-escolar" data-product-screen="overview">
    <AdminGestionEscolarBanner
      eyebrow="Control Escolar"
      :title="scopeLabel"
      subtitle="Familias y comunicación escolar."
      tone="teal"
      ambassador="primaria"
    >
      <template #actions>
        <NuxtLink v-if="hasModule('familias')" class="btn btn-primary" to="/admin/gestion-escolar/familias">Familias</NuxtLink>
        <NuxtLink v-if="hasModule('comunicados')" class="btn btn-secondary" to="/admin/gestion-escolar/comunicados">Nuevo comunicado</NuxtLink>
      </template>
      <template #stats>
        <span>{{ overview?.reach.families || 0 }} familias</span>
        <span>{{ overview?.reach.students || 0 }} estudiantes</span>
        <span>{{ overview?.reach.planteles.length || 0 }} planteles</span>
      </template>
    </AdminGestionEscolarBanner>

    <section v-if="pending" class="state-panel" data-state="loading">
      <HuskyPassLoader label="Escolar" contained />
    </section>
    <section v-else-if="loadError" class="state-panel" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No pudimos cargar Escolar</h2>
    </section>

    <template v-else>
      <section v-if="!modules.length" class="state-panel access-empty" data-state="empty">
        <FamilyPersonasIcon name="school" />
        <h2>Sin plantel asignado</h2>
      </section>

      <template v-else>
        <section class="school-layout">
          <article class="today-panel">
            <div class="section-title">
              <div>
                <p class="eyebrow">Hoy</p>
                <h2>Operación escolar</h2>
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
          </div>

            <div class="scope-list">
              <article v-for="plantel in overview?.options.scopeTree.planteles || []" :key="plantel.value">
                <strong>{{ plantel.label }}</strong>
                <small>{{ plantel.families }} familias · {{ plantel.students }} estudiantes</small>
              </article>
              <article v-if="!(overview?.options.scopeTree.planteles || []).length">
                <strong>Sin plantel</strong>
                <small>Sin plantel.</small>
              </article>
            </div>
          </aside>
        </section>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GestionEscolarModuleKey } from '~/types/gestionEscolar'
import { useGestionEscolarOverview } from '~/composables/useGestionEscolarOverview'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })

const { data: overview, pending, error: loadError } = useGestionEscolarOverview()
const modules = computed(() => overview.value?.modules.filter((module) => module.enabled) || [])
const scopeLabel = computed(() => {
  const planteles = overview.value?.reach.planteles || []
  if (!planteles.length) return 'Sin plantel'
  if (planteles.length === 1) return `Plantel ${planteles[0]}`
  return `${planteles.length} planteles`
})
const todayTasks = computed(() => {
  const tasks: Array<{ title: string; detail: string; action: string; icon: string; to: string }> = []
  if (hasModule('familias')) {
    tasks.push({
      title: 'Familias y personas autorizadas',
      detail: `${overview.value?.reach.families || 0} familias en tu plantel.`,
      action: 'Gestionar',
      icon: 'people',
      to: '/admin/gestion-escolar/familias'
    })
  }
  if (hasModule('comunicados')) {
    tasks.push({
      title: 'Comunicados',
      detail: 'Mensajes para familias del plantel.',
      action: 'Preparar',
      icon: 'announcement',
      to: '/admin/gestion-escolar/comunicados'
    })
  }
  if (hasModule('encuestas')) {
    tasks.push({ title: 'Encuestas', detail: 'Formularios activos para familias.', action: 'Revisar', icon: 'survey', to: '/admin/gestion-escolar/encuestas' })
  }
  if (hasModule('convenios')) {
    tasks.push({ title: 'Convenios', detail: 'Documentos visibles para familias.', action: 'Revisar', icon: 'handshake', to: '/admin/gestion-escolar/convenios' })
  }
  return tasks
})

function hasModule(key: GestionEscolarModuleKey) {
  return modules.value.some((module) => module.key === key)
}

</script>

<style scoped>
.school-console {
  --ink: #102235;
  --muted: #607086;
  --line: rgba(18, 95, 89, 0.16);
  --line-soft: rgba(18, 95, 89, 0.10);
  --accent: #07877d;
  --accent-dark: #075f58;
  --sun: #f6b94f;
  display: grid;
  gap: 16px;
}

.school-head,
.today-panel,
.scope-panel,
.state-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 22px 58px rgba(14, 40, 55, 0.08);
}

.school-head {
  align-items: center;
  background:
    radial-gradient(circle at 10% 20%, rgba(8, 135, 125, 0.13), transparent 34%),
    radial-gradient(circle at 88% 0%, rgba(246, 185, 79, 0.20), transparent 28%),
    linear-gradient(135deg, #ffffff, #fbfdf6);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) auto;
  overflow: hidden;
  padding: clamp(18px, 2.4vw, 28px);
  position: relative;
}

.school-head::after {
  background: linear-gradient(180deg, var(--accent), #8bbf48);
  border-radius: 999px;
  content: '';
  height: 82px;
  opacity: 0.14;
  position: absolute;
  right: 28px;
  top: -40px;
  transform: rotate(34deg);
  width: 14px;
}

.school-head h1,
.section-title h2,
.scope-panel h2,
.state-panel h2 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  margin: 0;
}

.school-head h1 {
  font-size: clamp(2rem, 3.2vw, 3rem);
  letter-spacing: -0.035em;
  line-height: 0.98;
}

.eyebrow,
.scope-strip span {
  color: var(--accent-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  position: relative;
  z-index: 1;
}

.head-actions .btn-primary {
  background: #21324a;
  border-radius: 15px;
  box-shadow: 0 16px 30px rgba(33, 50, 74, 0.18);
}

.scope-strip {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.scope-strip article {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 14px 34px rgba(14, 40, 55, 0.05);
  display: grid;
  gap: 5px;
  min-height: 84px;
  padding: 14px;
}

.scope-strip strong {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  font-size: 1.85rem;
  line-height: 1;
}

.school-layout {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
}

.today-panel,
.scope-panel {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.section-title {
  align-items: center;
  border-bottom: 1px solid var(--line-soft);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding-bottom: 12px;
}

.section-title.vertical {
  align-items: start;
  border-bottom: 0;
  padding-bottom: 0;
}

.section-title span {
  background: #fff6df;
  border: 1px solid rgba(246, 185, 79, 0.36);
  border-radius: 999px;
  color: #8a650c;
  font-size: 0.76rem;
  font-weight: 900;
  padding: 7px 10px;
}

.work-list,
.scope-list {
  display: grid;
  gap: 8px;
}

.work-row,
.scope-list article {
  align-items: center;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 18px;
  display: grid;
  gap: 11px;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  min-height: 74px;
  padding: 10px;
  transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
}

.work-row:hover {
  background: linear-gradient(135deg, #f0fbf7, #fffaf0);
  border-color: rgba(8, 135, 125, 0.22);
  transform: translateY(-1px);
}

.row-icon {
  align-items: center;
  background: linear-gradient(135deg, #eefaf7, #fff6df);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 15px;
  color: var(--accent-dark);
  display: inline-flex;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.work-row strong,
.scope-list strong {
  color: var(--ink);
  display: block;
}

.work-row small,
.scope-list small {
  color: var(--muted);
  display: block;
  font-size: 0.78rem;
}

.work-row b {
  background: #effaf7;
  border: 1px solid rgba(8, 135, 125, 0.16);
  border-radius: 999px;
  color: var(--accent-dark);
  font-size: 0.78rem;
  padding: 7px 10px;
}

.scope-list article {
  grid-template-columns: 1fr;
  min-height: auto;
}

.state-panel {
  color: var(--muted);
  display: grid;
  gap: 9px;
  min-height: 260px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

@media (max-width: 980px) {
  .school-head,
  .school-layout,
  .scope-strip {
    grid-template-columns: 1fr;
  }

  .head-actions {
    justify-content: start;
  }
}
</style>
