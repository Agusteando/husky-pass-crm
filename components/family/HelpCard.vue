<template>
  <NuxtLink
    class="pa-help-card"
    :to="to"
    aria-label="Abrir el centro de ayuda de Husky Pass"
  >
    <span class="pa-help-visual" aria-hidden="true">
      <FamilyPersonasAmbassador
        :theme="theme"
        variant="help"
        compact
        contained
        decorative
      />
    </span>

    <span class="pa-help-content">
      <span class="pa-help-eyebrow">
        <FamilyPersonasIcon name="help" />
        Centro de ayuda
      </span>
      <strong>{{ title }}</strong>
      <span class="pa-help-description">{{ description }}</span>
      <span class="pa-help-action" aria-hidden="true">
        Ver opciones
        <FamilyPersonasIcon name="arrow" />
      </span>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { PersonasTheme } from '~/types/daycare'

withDefaults(defineProps<{
  theme?: PersonasTheme | null
  to: string
  title?: string
  description?: string
}>(), {
  theme: null,
  title: '¿Necesitas ayuda?',
  description: 'Consulta la guía o contacta a tu colegio.'
})
</script>

<style scoped>
.pa-help-card {
  align-items: center;
  background:
    radial-gradient(circle at 100% 0%, rgba(var(--pa-primary-rgb), 0.14), transparent 7rem),
    linear-gradient(145deg, #fff 0%, #f4f9f9 100%);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.18);
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(31, 45, 70, 0.06);
  color: inherit;
  display: grid;
  gap: clamp(9px, 4.5%, 13px);
  grid-template-columns: clamp(46px, 24%, 60px) minmax(0, 1fr);
  margin-top: auto;
  overflow: hidden;
  padding: clamp(10px, 5%, 14px);
  position: relative;
  text-decoration: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.pa-help-card:hover {
  border-color: rgba(var(--pa-primary-rgb), 0.32);
  box-shadow: 0 18px 34px rgba(31, 45, 70, 0.1);
  transform: translateY(-2px);
}

.pa-help-card:focus-visible {
  outline: 3px solid rgba(var(--pa-primary-rgb), 0.24);
  outline-offset: 3px;
}

.pa-help-visual {
  align-self: center;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(var(--pa-primary-rgb), 0.14);
  border-radius: 17px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: grid;
  overflow: hidden;
  place-items: end center;
  position: relative;
  width: 100%;
  z-index: 1;
}

.pa-help-content {
  display: grid;
  gap: 4px;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.pa-help-eyebrow {
  align-items: center;
  color: var(--pa-primary);
  display: inline-flex;
  font-size: clamp(0.55rem, 0.52vw, 0.63rem);
  font-weight: 900;
  gap: 5px;
  letter-spacing: 0.07em;
  line-height: 1.15;
  text-transform: uppercase;
}

.pa-help-eyebrow .pa-icon {
  flex: 0 0 auto;
  height: 0.8rem;
  width: 0.8rem;
}

.pa-help-content strong {
  color: var(--pa-gray);
  font-size: clamp(0.76rem, 0.66vw, 0.86rem);
  font-weight: 900;
  letter-spacing: -0.012em;
  line-height: 1.18;
}

.pa-help-description {
  color: var(--pa-muted);
  font-size: clamp(0.62rem, 0.56vw, 0.7rem);
  font-weight: 650;
  line-height: 1.38;
}

.pa-help-action {
  align-items: center;
  color: var(--pa-primary);
  display: inline-flex;
  font-size: clamp(0.64rem, 0.57vw, 0.71rem);
  font-weight: 900;
  gap: 5px;
  margin-top: 3px;
}

.pa-help-action .pa-icon {
  height: 0.82rem;
  transition: transform 0.18s ease;
  width: 0.82rem;
}

.pa-help-card:hover .pa-help-action .pa-icon {
  transform: translateX(3px);
}

@media (max-height: 820px) and (min-width: 1041px) {
  .pa-help-card {
    border-radius: 17px;
    grid-template-columns: 42px minmax(0, 1fr);
    padding: 8px 9px;
  }

  .pa-help-visual {
    border-radius: 13px;
  }

  .pa-help-description {
    display: none;
  }

  .pa-help-action {
    margin-top: 1px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pa-help-card,
  .pa-help-action .pa-icon {
    transition: none;
  }

  .pa-help-card:hover,
  .pa-help-card:hover .pa-help-action .pa-icon {
    transform: none;
  }
}
</style>
