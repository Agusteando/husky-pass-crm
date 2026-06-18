<template>
  <figure
    v-if="imageSrc || title || text || $slots.default || !decorative"
    class="pa-ambassador-card"
    :data-variant="variant"
    :data-compact="compact ? 'true' : 'false'"
    :aria-label="decorative ? undefined : computedAlt"
  >
    <img v-if="imageSrc" :src="imageSrc" :alt="decorative ? '' : computedAlt" loading="lazy" decoding="async" />
    <figcaption v-if="title || text || $slots.default">
      <slot>
        <strong v-if="title">{{ title }}</strong>
        <span v-if="text">{{ text }}</span>
      </slot>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PersonasMascotVariant } from '~/utils/personasTheme'
import type { PersonasTheme } from '~/types/daycare'
import { personasLevelName, personasMascot, resolvePersonasTheme } from '~/utils/personasTheme'

const props = withDefaults(defineProps<{
  theme?: PersonasTheme | null
  variant?: PersonasMascotVariant
  alt?: string
  title?: string
  text?: string
  compact?: boolean
  decorative?: boolean
}>(), {
  variant: 'hero',
  alt: '',
  title: '',
  text: '',
  compact: false,
  decorative: false
})

const neutralTheme = resolvePersonasTheme({})
const resolvedTheme = computed(() => props.theme || neutralTheme)
const imageSrc = computed(() => personasMascot(resolvedTheme.value, props.variant))
const levelName = computed(() => personasLevelName(resolvedTheme.value))
const computedAlt = computed(() => props.alt || `${levelName.value.spanish} Personas Autorizadas`)
</script>

<style scoped>
.pa-ambassador-card {
  align-items: center;
  display: grid;
  gap: 10px;
  justify-items: center;
  margin: 0;
  min-width: 0;
  text-align: center;
}

.pa-ambassador-card img {
  display: block;
  filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.12));
  max-height: 136px;
  max-width: min(100%, 142px);
  object-fit: contain;
}

.pa-ambassador-card[data-variant='header'] img,
.pa-ambassador-card[data-variant='transition'] img {
  max-height: 82px;
  max-width: 96px;
}

.pa-ambassador-card[data-variant='empty'] img,
.pa-ambassador-card[data-variant='help'] img,
.pa-ambassador-card[data-variant='preview'] img {
  max-height: 112px;
  max-width: 124px;
}

.pa-ambassador-card[data-compact='true'] img {
  max-height: 86px;
  max-width: 96px;
}

.pa-ambassador-card figcaption {
  display: grid;
  gap: 2px;
}

.pa-ambassador-card strong {
  color: var(--pa-gray);
  font-size: 0.88rem;
}

.pa-ambassador-card span {
  color: var(--pa-muted);
  font-size: 0.78rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .pa-ambassador-card img {
    max-height: 92px;
    max-width: 104px;
  }
}
</style>
