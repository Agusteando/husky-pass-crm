<template>
  <section class="product-chooser stack">
    <div class="workspace-head compact-head">
      <div>
        <p class="eyebrow">Husky Pass</p>
        <h1>Elige un acceso</h1>
        <p>Tu cuenta tiene más de un producto disponible.</p>
      </div>
    </div>

    <section class="chooser-grid">
      <NuxtLink v-if="canDaycare" class="choice-card" to="/familia/daycare">
        <span><FamilyPersonasIcon name="daycare" /></span>
        <h2>Guardería</h2>
        <p>Tareas, avisos y calendario de la sala.</p>
        <strong>Entrar</strong>
      </NuxtLink>
      <NuxtLink v-if="canPa" class="choice-card blue" to="/familia/personas-autorizadas">
        <span><FamilyPersonasIcon name="people" /></span>
        <h2>Personas Autorizadas</h2>
        <p>Personas, fotos y marbetes.</p>
        <strong>Entrar</strong>
      </NuxtLink>
      <NuxtLink v-if="canPa" class="choice-card attendance-choice" to="/familia/asistencia">
        <span><FamilyPersonasIcon name="calendar" /></span>
        <h2>Asistencia</h2>
        <p>Expediente de asistencia, retardos, motivos y entradas/salidas por ciclo escolar.</p>
        <strong>Entrar</strong>
      </NuxtLink>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { PublicSession } from '~/types/session'
import { hasFamilyScope } from '~/utils/sessionScopes'

definePageMeta({ layout: 'family', middleware: ['family', 'family-index'] })

const { data: session } = useFetch<PublicSession>('/api/auth/me')
const canDaycare = computed(() => hasFamilyScope(session.value?.user, 'daycare'))
const canPa = computed(() => hasFamilyScope(session.value?.user, 'personasAutorizadas'))
</script>

<style scoped>
.chooser-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.choice-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 12px;
  min-height: 104px;
  padding: 14px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.choice-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.choice-card span {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  color: var(--color-brand-800);
  display: grid;
  font-weight: 600;
  height: 48px;
  place-items: center;
  width: 48px;
}

.choice-card span :deep(.pa-icon) {
  height: 1.35rem;
  width: 1.35rem;
}

.choice-card.blue span {
  background: #eaf4fb;
  border-color: #d2e7f5;
  color: var(--color-blue);
}

.choice-card.attendance-choice span {
  background: #fff3db;
  border-color: #f6d997;
  color: #8a5a12;
}

.choice-card h2 {
  margin-bottom: 0;
}

.choice-card strong {
  align-self: end;
  color: var(--color-brand-700);
}

@media (max-width: 680px) {
  .chooser-grid {
    grid-template-columns: 1fr;
  }

  .choice-card {
    min-height: 0;
  }
}
</style>
