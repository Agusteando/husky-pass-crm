<template>
  <section class="product-chooser stack">
    <div class="workspace-head compact-head">
      <div>
        <p class="eyebrow">Husky Pass</p>
        <h1>Elige un acceso</h1>
        <p>Tu embajador digital te ayuda a entrar al producto correcto sin perder contexto familiar.</p>
      </div>
      <aside class="chooser-ambassador" aria-label="Guía digital Husky Pass">
        <FamilyPersonasAmbassador :theme="chooserTheme" variant="header" compact contained decorative />
        <span>
          <strong>Te acompaño</strong>
          <small>Elige la experiencia que necesitas hoy.</small>
        </span>
      </aside>
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
      <NuxtLink v-if="canPa" class="choice-card communications-choice" to="/familia/comunicados">
        <span><FamilyPersonasIcon name="announcement" /></span>
        <h2>Comunicados</h2>
        <p>Avisos importantes, adjuntos y mensajes del colegio.</p>
        <strong>Entrar</strong>
      </NuxtLink>
      <NuxtLink v-if="canPa" class="choice-card payments-choice" to="/familia/pagos">
        <span><FamilyPersonasIcon name="payments" /></span>
        <h2>Pagos</h2>
        <p>Estado de cuenta, talleres y próximos conceptos.</p>
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
import { useAppSession } from '~/composables/useAppSession'
import { computed } from 'vue'

import { hasFamilyScope } from '~/utils/sessionScopes'
import { resolvePersonasTheme } from '~/utils/personasTheme'

definePageMeta({ layout: 'family', middleware: ['family', 'family-index'] })

const { data: session } = useAppSession()
const canDaycare = computed(() => hasFamilyScope(session.value?.user, 'daycare'))
const canPa = computed(() => hasFamilyScope(session.value?.user, 'personasAutorizadas'))
const chooserTheme = computed(() => resolvePersonasTheme({ themeKey: canDaycare.value ? 'daycare' : 'primaria' }))
</script>

<style scoped>
.chooser-ambassador {
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 9px;
  grid-template-columns: 54px minmax(0, 1fr);
  min-width: min(100%, 260px);
  padding: 8px 12px 8px 8px;
}

.chooser-ambassador :deep(.pa-ambassador-card),
.chooser-ambassador :deep(.pa-ambassador-visual) {
  height: 54px;
  width: 54px;
}

.chooser-ambassador span {
  display: grid;
  gap: 2px;
}

.chooser-ambassador strong {
  color: var(--color-ink);
  font-size: .85rem;
}

.chooser-ambassador small {
  color: var(--color-muted);
  font-weight: 650;
  line-height: 1.35;
}

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

.choice-card.communications-choice span {
  background: #ecf8fb;
  border-color: #cfe8ef;
  color: #0f7585;
}

.choice-card.payments-choice span {
  background: #f1f8ea;
  border-color: #d6e9c5;
  color: #4d8731;
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

  .chooser-ambassador {
    min-width: 0;
  }

  .choice-card {
    min-height: 0;
  }
}

</style>
