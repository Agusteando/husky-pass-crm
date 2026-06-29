<template>
  <section class="product-chooser stack">
    <section class="chooser-hero" data-product-panel="family-product-chooser">
      <FamilyAmbassadorGuide
        :theme="chooserTheme"
        variant="hero"
        tone="calm"
        eyebrow="Embajador digital"
        :title="`Hola${familyName ? `, ${familyName}` : ''}. Elige qué quieres revisar ahora.`"
        message="Te acompañaré en cada producto familiar para explicar pendientes, confirmar acciones importantes y mantener visible la información que da confianza."
      />
    </section>

    <section class="chooser-grid" aria-label="Productos familiares disponibles">
      <NuxtLink v-if="canDaycare" class="choice-card daycare-choice" to="/familia/daycare">
        <span><FamilyPersonasIcon name="daycare" /></span>
        <div>
          <p class="choice-eyebrow">Guardería</p>
          <h2>Hoy en la sala</h2>
          <p>Tareas, avisos, calendario y recursos de guardería con prioridad clara.</p>
        </div>
        <strong>Entrar</strong>
      </NuxtLink>
      <NuxtLink v-if="canPa" class="choice-card blue" to="/familia/personas-autorizadas">
        <span><FamilyPersonasIcon name="people" /></span>
        <div>
          <p class="choice-eyebrow">Seguridad de salida</p>
          <h2>Personas Autorizadas</h2>
          <p>Red de confianza, Husky Pass, Pase Express y orientación para cada estado.</p>
        </div>
        <strong>Entrar</strong>
      </NuxtLink>
      <NuxtLink v-if="canPa" class="choice-card attendance-choice" to="/familia/asistencia">
        <span><FamilyPersonasIcon name="calendar" /></span>
        <div>
          <p class="choice-eyebrow">Expediente</p>
          <h2>Asistencia y accesos</h2>
          <p>Ausencias, retardos, motivos y entradas/salidas por ciclo escolar.</p>
        </div>
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

const { data: session } = useAppSession()
definePageMeta({ layout: 'family', middleware: ['family', 'family-index'] })

const canDaycare = computed(() => hasFamilyScope(session.value?.user, 'daycare'))
const canPa = computed(() => hasFamilyScope(session.value?.user, 'personasAutorizadas'))
const familyName = computed(() => session.value?.user?.displayName?.split(/\s+/).slice(0, 2).join(' ') || '')
const chooserTheme = computed(() => {
  const theme = resolvePersonasTheme({
    matricula: session.value?.user?.username,
    themeKey: canDaycare.value && !canPa.value ? 'daycare' : undefined
  })
  return theme.mascot ? theme : resolvePersonasTheme({ themeKey: canDaycare.value ? 'daycare' : 'primaria' })
})
</script>

<style scoped>
.product-chooser {
  display: grid;
  gap: 16px;
}

.chooser-hero {
  max-width: 980px;
}

.chooser-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.choice-card {
  background:
    radial-gradient(circle at 100% 0, rgba(255, 181, 69, .12), transparent 46%),
    linear-gradient(145deg, #fff, #fbfdf8);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 13px;
  min-height: 220px;
  padding: 18px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.choice-card:hover {
  border-color: var(--color-brand-300);
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.choice-card > span {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  color: var(--color-brand-800);
  display: grid;
  font-weight: 600;
  height: 52px;
  place-items: center;
  width: 52px;
}

.choice-card span :deep(.pa-icon) {
  height: 1.42rem;
  width: 1.42rem;
}

.choice-card.blue > span {
  background: #eaf4fb;
  border-color: #d2e7f5;
  color: var(--color-blue);
}

.choice-card.attendance-choice > span {
  background: #fff3db;
  border-color: #f6d997;
  color: #8a5a12;
}

.choice-card div {
  display: grid;
  gap: 7px;
}

.choice-eyebrow {
  color: var(--color-brand-700);
  font-size: .68rem;
  font-weight: 900;
  letter-spacing: .12em;
  margin: 0;
  text-transform: uppercase;
}

.choice-card h2,
.choice-card p {
  margin: 0;
}

.choice-card h2 {
  color: var(--color-ink);
  font-size: clamp(1.25rem, 2vw, 1.72rem);
}

.choice-card p:not(.choice-eyebrow) {
  color: var(--color-muted);
  font-size: .86rem;
  font-weight: 700;
  line-height: 1.55;
}

.choice-card strong {
  align-self: end;
  color: var(--color-brand-700);
  justify-self: start;
}

@media (max-width: 1020px) {
  .chooser-grid {
    grid-template-columns: 1fr;
  }

  .choice-card {
    min-height: 0;
  }
}
</style>
