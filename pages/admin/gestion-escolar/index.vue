<template>
  <section class="ge-workbench" data-product-area="gestion-escolar" data-product-screen="overview">
    <header class="workspace-hero">
      <div>
        <p class="eyebrow">Operación escolar</p>
        <h1>Gestión Escolar</h1>
        <div class="scope-ribbon" aria-label="Alcance visible">
          <span v-for="plantel in overview?.reach.planteles || []" :key="plantel">{{ plantel }}</span>
          <span v-if="!(overview?.reach.planteles || []).length">Sin alcance</span>
        </div>
      </div>
      <section class="reach-grid" aria-label="Resumen de alcance">
        <article><span>Familias</span><strong>{{ overview?.reach.families || 0 }}</strong></article>
        <article><span>Estudiantes</span><strong>{{ overview?.reach.students || 0 }}</strong></article>
        <article><span>Grupos</span><strong>{{ overview?.reach.grupos.length || 0 }}</strong></article>
      </section>
    </header>

    <section v-if="pending" class="state-card" data-state="loading"><HuskyPassLoader label="Gestión Escolar" contained /></section>
    <section v-else-if="loadError" class="state-card" data-state="error">No disponible</section>
    <template v-else>
      <section class="command-row" aria-label="Acciones principales">
        <NuxtLink v-if="hasModule('familias')" class="command-card primary" to="/admin/gestion-escolar/familias">
          <span><FamilyPersonasIcon name="people" /></span>
          <strong>Familias</strong>
          <small>{{ overview?.reach.families || 0 }} visibles</small>
        </NuxtLink>
        <NuxtLink v-if="hasModule('comunicados')" class="command-card" to="/admin/gestion-escolar/comunicados">
          <span><FamilyPersonasIcon name="announcement" /></span>
          <strong>Comunicados</strong>
          <small>{{ capabilityLabel('comunicados') }}</small>
        </NuxtLink>
        <NuxtLink v-if="hasModule('encuestas')" class="command-card" to="/admin/gestion-escolar/encuestas">
          <span><FamilyPersonasIcon name="survey" /></span>
          <strong>Encuestas</strong>
          <small>{{ capabilityLabel('encuestas') }}</small>
        </NuxtLink>
        <NuxtLink v-if="hasModule('convenios')" class="command-card" to="/admin/gestion-escolar/convenios">
          <span><FamilyPersonasIcon name="handshake" /></span>
          <strong>Convenios</strong>
          <small>{{ capabilityLabel('convenios') }}</small>
        </NuxtLink>
      </section>

      <section v-if="modules.length" class="module-grid">
        <AdminGestionModuleCard
          v-for="module in modules"
          :key="module.key"
          :to="`/admin/gestion-escolar/${module.key}`"
          :icon="moduleIcon(module.key)"
          :title="module.title"
          :description="module.description"
          :metrics="module.metrics"
          :enabled="module.enabled"
        />
      </section>

      <section v-else class="state-card" data-state="empty">
        <FamilyPersonasIcon name="school" />
        <h2>Sin módulos activos</h2>
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

function hasModule(key: GestionEscolarModuleKey) {
  return modules.value.some((module) => module.key === key)
}

function moduleIcon(key: GestionEscolarModuleKey) {
  if (key === 'comunicados') return 'announcement'
  if (key === 'encuestas') return 'survey'
  if (key === 'convenios') return 'handshake'
  return 'people'
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
.ge-workbench {
  display: grid;
  gap: 18px;
}

.workspace-hero,
.command-card,
.state-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.workspace-hero {
  align-items: end;
  background:
    radial-gradient(circle at 92% 10%, rgba(15, 140, 154, .16), transparent 30%),
    linear-gradient(135deg, #fff, #f8fbf2);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 480px);
  padding: clamp(22px, 3vw, 38px);
}

.eyebrow {
  color: #0f8c9a;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .12em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  color: #17233b;
  font-size: clamp(2.35rem, 4.1vw, 4.35rem);
  line-height: 1.05;
}

.scope-ribbon {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.scope-ribbon span {
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
  background: rgba(255, 255, 255, .84);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px;
}

.reach-grid span {
  color: #64748b;
  display: block;
  font-size: .72rem;
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

.command-row {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.command-card {
  align-items: center;
  color: inherit;
  display: grid;
  gap: 7px;
  min-height: 138px;
  padding: 18px;
  text-decoration: none;
}

.command-card.primary {
  background: linear-gradient(135deg, #17233b, #236188);
  border-color: transparent;
  color: #fff;
}

.command-card span {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 15px;
  color: #b98000;
  display: grid;
  height: 44px;
  place-items: center;
  width: 44px;
}

.command-card.primary span {
  background: rgba(255, 255, 255, .12);
  border-color: rgba(255, 255, 255, .22);
  color: #fff;
}

.command-card strong {
  color: #17233b;
  font-size: 1.1rem;
}

.command-card.primary strong,
.command-card.primary small {
  color: #fff;
}

.command-card small {
  color: #64748b;
  font-weight: 750;
}

.module-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  .command-row,
  .module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .workspace-hero,
  .command-row,
  .module-grid,
  .reach-grid {
    grid-template-columns: 1fr;
  }
}
</style>
