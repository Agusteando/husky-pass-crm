<template>
  <figure
    v-if="imageSrc || title || text || $slots.default || !decorative"
    class="pa-ambassador-card"
    :data-variant="variant"
    :data-compact="compact ? 'true' : 'false'"
    :data-contained="contained ? 'true' : 'false'"
    :aria-label="decorative ? undefined : computedAlt"
  >
    <span v-if="imageSrc" class="pa-ambassador-visual">
      <img :src="imageSrc" :alt="decorative ? '' : computedAlt" loading="lazy" decoding="async" />
    </span>
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
  contained?: boolean
  decorative?: boolean
}>(), {
  variant: 'hero',
  alt: '',
  title: '',
  text: '',
  compact: false,
  contained: false,
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
  --ambassador-height: 132px;
  --ambassador-width: 136px;
  align-items: center;
  display: grid;
  gap: 8px;
  justify-items: center;
  margin: 0;
  max-width: 100%;
  min-width: 0;
  text-align: center;
}

.pa-ambassador-visual {
  align-items: end;
  display: grid;
  height: var(--ambassador-height);
  justify-items: center;
  max-width: 100%;
  overflow: hidden;
  width: var(--ambassador-width);
}

.pa-ambassador-card img {
  display: block;
  filter: drop-shadow(0 8px 12px rgba(20, 45, 66, 0.1));
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  object-position: center bottom;
  width: 100%;
}

.pa-ambassador-card[data-variant='header'],
.pa-ambassador-card[data-variant='transition'] {
  --ambassador-height: 84px;
  --ambassador-width: 88px;
}

.pa-ambassador-card[data-variant='empty'],
.pa-ambassador-card[data-variant='help'],
.pa-ambassador-card[data-variant='preview'] {
  --ambassador-height: 106px;
  --ambassador-width: 112px;
}

.pa-ambassador-card[data-compact='true'] {
  --ambassador-height: 74px;
  --ambassador-width: 78px;
}

.pa-ambassador-card[data-contained='true'],
.pa-ambassador-card[data-contained='true'] .pa-ambassador-visual {
  height: 100%;
  overflow: hidden;
  width: 100%;
}

.pa-ambassador-card figcaption {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.pa-ambassador-card strong {
  color: var(--pa-gray);
  font-size: 0.88rem;
}

.pa-ambassador-card figcaption span {
  color: var(--pa-muted);
  font-size: 0.78rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .pa-ambassador-card {
    --ambassador-height: 88px;
    --ambassador-width: 94px;
  }

  .pa-ambassador-card[data-compact='true'] {
    --ambassador-height: 62px;
    --ambassador-width: 66px;
  }
}
</style>
