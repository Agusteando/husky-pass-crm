<template>
  <section class="ge-workspace" data-product-area="gestion-escolar" data-product-screen="overview">
    <header class="workspace-hero">
      <div>
        <p class="eyebrow">Operación escolar</p>
        <h1>Gestión Escolar</h1>
        <div class="scope-ribbon"><span v-for="plantel in overview?.reach.planteles || []" :key="plantel">{{ plantel }}</span><span v-if="!(overview?.reach.planteles || []).length">Sin alcance</span></div>
      </div>
      <div class="reach-card">
        <span>Alcance</span>
        <strong>{{ overview?.reach.families || 0 }} familias</strong>
        <small>{{ overview?.reach.students || 0 }} estudiantes</small>
      </div>
    </header>

    <section v-if="pending" class="state-card" data-state="loading">Preparando tu espacio...</section>
    <section v-else-if="loadError" class="state-card" data-state="error">No pudimos cargar Gestion Escolar. Intenta nuevamente.</section>
    <section v-else-if="modules.length" class="module-grid">
      <NuxtLink v-for="module in modules" :key="module.key" class="module-card" :to="`/admin/gestion-escolar/${module.key}`">
        <span class="module-icon"><FamilyPersonasIcon :name="moduleIcon(module.key)" /></span>
        <span>
          <strong>{{ module.title }}</strong>
          <small>{{ module.description }}</small>
        </span>
        <div class="module-metrics">
          <b v-for="metric in module.metrics" :key="metric.label">{{ metric.value }} {{ metric.label }}</b>
        </div>
      </NuxtLink>
    </section>
    <section v-else class="state-card" data-state="empty">
      <FamilyPersonasIcon name="school" />
      <h2>Tu acceso aun no tiene capacidades</h2>
      
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { GestionEscolarModuleKey, GestionEscolarOverviewResponse } from '~/types/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })

const { data: overview, pending, error: loadError } = useFetch<GestionEscolarOverviewResponse>('/api/admin/gestion-escolar/overview', { timeout: 15000 })
const modules = computed(() => overview.value?.modules.filter((module) => module.enabled) || [])

function moduleIcon(key: GestionEscolarModuleKey) {
  if (key === 'comunicados') return 'announcement'
  if (key === 'encuestas') return 'survey'
  if (key === 'convenios') return 'handshake'
  return 'people'
}
</script>

<style scoped>
.ge-workspace {
  display: grid;
  gap: 18px;
}

.workspace-hero,
.module-card,
.state-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.workspace-hero {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 340px);
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
  font-size: clamp(2rem, 3vw, 3.35rem);
  line-height: 1.05;
}

.module-card small,
.reach-card small {
  color: #64748b;
  font-weight: 650;
  line-height: 1.55;
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

.reach-card {
  background: linear-gradient(135deg, #eefdf9, #fff7df);
  border: 1px solid #d7eee8;
  border-radius: 20px;
  display: grid;
  gap: 5px;
  padding: 18px;
}

.reach-card span,
.module-metrics b {
  color: #64748b;
  font-size: .72rem;
  font-weight: 850;
  text-transform: uppercase;
}

.reach-card strong {
  color: #10213b;
  font-size: 1.7rem;
}

.module-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.module-card {
  color: inherit;
  display: grid;
  gap: 16px;
  min-height: 220px;
  padding: 20px;
  text-decoration: none;
}

.module-card:hover {
  border-color: #f4c24f;
  transform: translateY(-1px);
}

.module-icon {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 16px;
  color: #b98000;
  display: grid;
  height: 48px;
  place-items: center;
  width: 48px;
}

.module-card strong,
.module-card small {
  display: block;
}

.module-card strong {
  color: #17233b;
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.module-metrics {
  align-self: end;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.module-metrics b {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 7px 9px;
}

.state-card {
  display: grid;
  min-height: 260px;
  place-items: center;
  padding: 28px;
  text-align: center;
}

@media (max-width: 1180px) {
  .workspace-hero,
  .module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .workspace-hero,
  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
