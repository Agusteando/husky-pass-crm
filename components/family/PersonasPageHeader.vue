<template>
  <header class="pa-page-header" data-product-component="personas-page-header">
    <div class="pa-page-header-copy">
      <p v-if="eyebrow" class="pa-page-header-eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="description" class="pa-page-header-description">{{ description }}</p>
      <div v-if="meta || hasMetaSlot" class="pa-page-header-meta">
        <slot name="meta">{{ meta }}</slot>
      </div>
    </div>

    <div v-if="showVisual" class="pa-page-header-ambassador" :data-has-message="hasAmbassadorMessage ? 'true' : 'false'" :data-tone="ambassadorTone">
      <slot name="visual">
        <FamilyPersonasAmbassador
          :theme="resolvedTheme"
          :variant="ambassadorVariant"
          compact
          contained
          decorative
        />
      </slot>
      <div v-if="hasAmbassadorMessage" class="pa-page-header-ambassador-copy">
        <strong v-if="ambassadorTitle">{{ ambassadorTitle }}</strong>
        <span v-if="ambassadorMessage">{{ ambassadorMessage }}</span>
      </div>
    </div>

    <div v-if="hasActions" class="pa-page-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'
import type { PersonasTheme } from '~/types/daycare'
import { resolvePersonasTheme, type PersonasMascotVariant } from '~/utils/personasTheme'
import { personasFamilyThemeContextKey } from '~/composables/usePersonasTheme'

const props = withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description?: string
  meta?: string
  theme?: PersonasTheme | null
  ambassadorVariant?: PersonasMascotVariant
  ambassadorTitle?: string
  ambassadorMessage?: string
  ambassadorTone?: 'calm' | 'success' | 'notice' | 'empty'
  showAmbassador?: boolean
}>(), {
  eyebrow: '',
  description: '',
  meta: '',
  theme: null,
  ambassadorVariant: 'header',
  ambassadorTitle: '',
  ambassadorMessage: '',
  ambassadorTone: 'calm',
  showAmbassador: true
})

const slots = useSlots()
const familyThemeContext = inject(personasFamilyThemeContextKey, null)
const resolvedTheme = computed(() => props.theme || familyThemeContext?.theme.value || resolvePersonasTheme({}))
const hasActions = computed(() => Boolean(slots.actions))
const hasMetaSlot = computed(() => Boolean(slots.meta))
const hasAmbassadorMessage = computed(() => Boolean(props.ambassadorTitle || props.ambassadorMessage))
const showVisual = computed(() => props.showAmbassador || Boolean(slots.visual))
</script>

<style scoped>
.pa-page-header {
  align-items: center;
  border-bottom: 1px solid #e4eaed;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(72px, auto) auto;
  min-height: 92px;
  overflow: hidden;
  padding: 2px 0 16px;
  position: relative;
}

.pa-page-header::after {
  background: linear-gradient(90deg, var(--pa-primary), rgba(var(--pa-primary-rgb), 0));
  bottom: -1px;
  content: '';
  height: 2px;
  left: 0;
  position: absolute;
  width: min(180px, 34%);
}

.pa-page-header-copy {
  min-width: 0;
}

.pa-page-header-eyebrow,
.pa-page-header-description,
.pa-page-header h1 {
  margin: 0;
}

.pa-page-header-eyebrow {
  color: var(--pa-primary);
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.14em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.pa-page-header h1 {
  color: #1f2d46;
  font-size: clamp(1.7rem, 1.9vw, 2.15rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.04;
}

.pa-page-header-description {
  color: #6e788a;
  font-size: 0.84rem;
  font-weight: 650;
  line-height: 1.5;
  margin-top: 7px;
  max-width: 68ch;
}

.pa-page-header-meta {
  align-items: center;
  color: #778193;
  display: flex;
  flex-wrap: wrap;
  font-size: 0.72rem;
  font-weight: 750;
  gap: 7px;
  margin-top: 9px;
}

.pa-page-header-ambassador {
  align-self: end;
  display: grid;
  height: 72px;
  justify-items: center;
  overflow: hidden;
  width: 72px;
}

.pa-page-header-ambassador[data-has-message='true'] {
  align-items: center;
  align-self: center;
  background:
    radial-gradient(circle at 0 0, rgba(var(--pa-primary-rgb), .1), transparent 70%),
    linear-gradient(135deg, #fff, rgba(var(--pa-primary-rgb), .045));
  border: 1px solid rgba(var(--pa-primary-rgb), .18);
  border-radius: 19px;
  box-shadow: 0 12px 30px rgba(30, 53, 78, .065);
  gap: 8px;
  grid-template-columns: 58px minmax(0, 1fr);
  height: auto;
  justify-items: start;
  min-height: 74px;
  overflow: visible;
  padding: 7px 11px 7px 7px;
  width: min(318px, 32vw);
}

.pa-page-header-ambassador[data-tone='success'] {
  background:
    radial-gradient(circle at 0 0, rgba(92, 175, 63, .13), transparent 70%),
    linear-gradient(135deg, #fff, #f4fbf0);
  border-color: rgba(92, 175, 63, .24);
}

.pa-page-header-ambassador[data-tone='notice'] {
  background:
    radial-gradient(circle at 0 0, rgba(234, 165, 29, .14), transparent 70%),
    linear-gradient(135deg, #fff, #fff9ed);
  border-color: rgba(234, 165, 29, .25);
}

.pa-page-header-ambassador[data-tone='empty'] {
  border-style: dashed;
}

.pa-page-header-ambassador :deep(.pa-ambassador-card),
.pa-page-header-ambassador :deep(.pa-ambassador-visual) {
  height: 72px;
  width: 72px;
}

.pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-card),
.pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-visual) {
  height: 58px;
  width: 58px;
}

.pa-page-header-ambassador-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.pa-page-header-ambassador-copy strong,
.pa-page-header-ambassador-copy span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pa-page-header-ambassador-copy strong {
  color: #26334b;
  font-size: .78rem;
  font-weight: 850;
  line-height: 1.22;
}

.pa-page-header-ambassador-copy span {
  color: #6f798a;
  font-size: .7rem;
  font-weight: 700;
  line-height: 1.45;
}

.pa-page-header-actions {
  align-items: flex-end;
  display: grid;
  gap: 9px;
  justify-items: end;
  min-width: 0;
}

@media (max-width: 900px) {
  .pa-page-header {
    grid-template-columns: minmax(0, 1fr) minmax(70px, auto);
  }

  .pa-page-header-actions {
    grid-column: 1 / -1;
    justify-items: stretch;
  }
}

@media (max-height: 820px) and (min-width: 901px) {
  .pa-page-header {
    grid-template-columns: minmax(0, 1fr) minmax(62px, auto) auto;
    min-height: 80px;
    padding-bottom: 12px;
  }

  .pa-page-header-eyebrow {
    margin-bottom: 4px;
  }

  .pa-page-header-description {
    margin-top: 4px;
  }

  .pa-page-header-ambassador,
  .pa-page-header-ambassador :deep(.pa-ambassador-card),
  .pa-page-header-ambassador :deep(.pa-ambassador-visual) {
    height: 62px;
    width: 62px;
  }

  .pa-page-header-ambassador[data-has-message='true'] {
    grid-template-columns: 52px minmax(0, 1fr);
    min-height: 66px;
    width: min(288px, 30vw);
  }

  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-card),
  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-visual) {
    height: 52px;
    width: 52px;
  }
}

@media (max-width: 620px) {
  .pa-page-header {
    gap: 12px;
    grid-template-columns: minmax(0, 1fr) 58px;
    min-height: 88px;
    padding-bottom: 16px;
  }

  .pa-page-header h1 {
    font-size: clamp(1.5rem, 7vw, 1.85rem);
  }

  .pa-page-header-description {
    font-size: 0.79rem;
  }

  .pa-page-header-ambassador,
  .pa-page-header-ambassador :deep(.pa-ambassador-card),
  .pa-page-header-ambassador :deep(.pa-ambassador-visual) {
    height: 64px;
    width: 58px;
  }

  .pa-page-header-ambassador[data-has-message='true'] {
    border-radius: 16px;
    grid-template-columns: 48px minmax(0, 1fr);
    grid-column: 1 / -1;
    min-height: 62px;
    padding: 6px 9px 6px 6px;
    width: 100%;
  }

  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-card),
  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-visual) {
    height: 48px;
    width: 48px;
  }
}
</style>
