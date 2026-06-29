<template>
  <article class="pa-guide" :data-tone="tone" :data-compact="compact ? 'true' : 'false'" :style="guideVars">
    <div class="pa-guide-portrait" aria-hidden="true">
      <FamilyPersonasAmbassador :theme="theme" :variant="variant" contained compact decorative />
    </div>
    <div class="pa-guide-copy">
      <p v-if="eyebrow" class="pa-guide-eyebrow">{{ eyebrow }}</p>
      <h2 v-if="title">{{ title }}</h2>
      <p v-if="message">{{ message }}</p>
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PersonasTheme } from '~/types/daycare'
import { personasThemeStyle, resolvePersonasTheme, type PersonasMascotVariant } from '~/utils/personasTheme'

const props = withDefaults(defineProps<{
  theme?: PersonasTheme | null
  variant?: PersonasMascotVariant
  eyebrow?: string
  title?: string
  message?: string
  tone?: 'calm' | 'success' | 'notice' | 'empty'
  compact?: boolean
}>(), {
  variant: 'help',
  tone: 'calm',
  compact: false
})

const resolvedTheme = computed(() => props.theme || resolvePersonasTheme({}))
const guideVars = computed(() => personasThemeStyle(resolvedTheme.value))
</script>

<style scoped>
.pa-guide {
  --guide-accent: var(--pa-primary);
  align-items: center;
  background:
    radial-gradient(circle at 0 0, rgba(var(--pa-primary-rgb), .11), transparent 14rem),
    linear-gradient(135deg, rgba(255,255,255,.96), rgba(var(--pa-primary-rgb), .045));
  border: 1px solid rgba(var(--pa-primary-rgb), .18);
  border-radius: 22px;
  box-shadow: 0 18px 42px rgba(28, 50, 75, .07);
  display: grid;
  gap: 15px;
  grid-template-columns: 94px minmax(0, 1fr);
  min-height: 132px;
  overflow: hidden;
  padding: 16px 18px;
  position: relative;
}

.pa-guide::before {
  background: var(--guide-accent);
  border-radius: 999px;
  content: '';
  height: calc(100% - 34px);
  left: 0;
  opacity: .85;
  position: absolute;
  top: 17px;
  width: 4px;
}

.pa-guide[data-tone='success'] {
  --guide-accent: #4ba83d;
  background:
    radial-gradient(circle at 0 0, rgba(75, 168, 61, .14), transparent 14rem),
    linear-gradient(135deg, #fff, #f4fbf0);
  border-color: rgba(75, 168, 61, .23);
}

.pa-guide[data-tone='notice'] {
  --guide-accent: #eaa51d;
  background:
    radial-gradient(circle at 0 0, rgba(234, 165, 29, .16), transparent 14rem),
    linear-gradient(135deg, #fff, #fff9ed);
  border-color: rgba(234, 165, 29, .25);
}

.pa-guide[data-tone='empty'] {
  border-style: dashed;
}

.pa-guide[data-compact='true'] {
  grid-template-columns: 70px minmax(0, 1fr);
  min-height: 100px;
  padding: 13px 15px;
}

.pa-guide-portrait {
  align-self: stretch;
  min-height: 96px;
  overflow: hidden;
}

.pa-guide[data-compact='true'] .pa-guide-portrait {
  min-height: 72px;
}

.pa-guide-portrait :deep(.pa-ambassador-card),
.pa-guide-portrait :deep(.pa-ambassador-visual) {
  height: 100%;
  width: 100%;
}

.pa-guide-copy {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.pa-guide-eyebrow {
  color: var(--guide-accent);
  font-size: .68rem;
  font-weight: 900;
  letter-spacing: .06em;
  margin: 0;
  text-transform: uppercase;
}

.pa-guide h2 {
  color: var(--pa-gray);
  font-family: var(--font-title);
  font-size: clamp(1rem, 1.1vw, 1.22rem);
  line-height: 1.18;
  margin: 0;
}

.pa-guide p:not(.pa-guide-eyebrow) {
  color: var(--pa-muted);
  font-size: .82rem;
  font-weight: 650;
  line-height: 1.55;
  margin: 0;
}

.pa-guide :deep(a),
.pa-guide :deep(button) {
  justify-self: start;
  margin-top: 6px;
}

@media (max-width: 560px) {
  .pa-guide,
  .pa-guide[data-compact='true'] {
    grid-template-columns: 64px minmax(0, 1fr);
    padding: 13px;
  }
}
</style>
