<template>
  <figure
    v-if="imageSrc || title || text || $slots.default || !decorative"
    class="pa-ambassador-card"
    :data-variant="variant"
    :data-compact="compact ? 'true' : 'false'"
    :data-contained="contained ? 'true' : 'false'"
    :data-crop="cropMode"
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
const cropMode = computed(() => {
  if (props.contained && props.compact && props.variant === 'help') return 'peek'
  if (props.contained && props.variant === 'hero') return 'header'
  if (props.compact) return 'badge'
  return props.variant
})
</script>

<style scoped>
.pa-ambassador-card {
  --ambassador-height: 132px;
  --ambassador-width: 136px;
  --ambassador-image-scale: 0.9;
  --ambassador-object-position: center bottom;
  --ambassador-padding-top: 7px;
  --ambassador-padding-inline: 7px;
  --ambassador-padding-bottom: 2px;
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
  box-sizing: border-box;
  display: grid;
  height: var(--ambassador-height);
  justify-items: center;
  max-width: 100%;
  overflow: hidden;
  padding: var(--ambassador-padding-top) var(--ambassador-padding-inline) var(--ambassador-padding-bottom);
  width: var(--ambassador-width);
}

.pa-ambassador-card img {
  display: block;
  filter: drop-shadow(0 8px 12px rgba(20, 45, 66, 0.1));
  height: 100%;
  max-height: none;
  max-width: none;
  object-fit: contain;
  object-position: var(--ambassador-object-position);
  transform: scale(var(--ambassador-image-scale));
  transform-origin: var(--ambassador-object-position);
  width: 100%;
}

.pa-ambassador-card[data-crop='hero'] {
  --ambassador-image-scale: 0.86;
  --ambassador-padding-top: 10px;
  --ambassador-padding-inline: 10px;
  --ambassador-padding-bottom: 2px;
  --ambassador-object-position: center bottom;
}

.pa-ambassador-card[data-crop='header'] {
  --ambassador-image-scale: 0.82;
  --ambassador-padding-top: 8px;
  --ambassador-padding-inline: 8px;
  --ambassador-padding-bottom: 1px;
  --ambassador-object-position: center bottom;
}

.pa-ambassador-card[data-crop='badge'],
.pa-ambassador-card[data-crop='empty'] {
  --ambassador-image-scale: 0.84;
  --ambassador-padding-top: 7px;
  --ambassador-padding-inline: 7px;
  --ambassador-padding-bottom: 2px;
  --ambassador-object-position: center bottom;
}

.pa-ambassador-card[data-crop='peek'] {
  --ambassador-image-scale: 0.92;
  --ambassador-padding-top: 6px;
  --ambassador-padding-inline: 6px;
  --ambassador-padding-bottom: 1px;
  --ambassador-object-position: center bottom;
}

.pa-ambassador-card[data-crop='preview'] {
  --ambassador-image-scale: 0.82;
  --ambassador-padding-top: 9px;
  --ambassador-padding-inline: 9px;
  --ambassador-padding-bottom: 3px;
  --ambassador-object-position: center center;
}

.pa-ambassador-card[data-crop='transition'] {
  --ambassador-image-scale: 0.88;
  --ambassador-padding-top: 8px;
  --ambassador-padding-inline: 8px;
  --ambassador-padding-bottom: 2px;
  --ambassador-object-position: center bottom;
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

.pa-ambassador-card[data-contained='true'] .pa-ambassador-visual {
  min-height: 0;
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
