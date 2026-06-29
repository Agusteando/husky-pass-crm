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
          :compact="ambassadorVariant !== 'hero'"
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
  background:
    linear-gradient(90deg, rgba(255, 255, 255, .98) 0%, rgba(255, 255, 255, .92) 48%, rgba(255, 255, 255, .72) 100%),
    url('/personas-autorizadas/backdrops/husky-pass-soft-safety-hero.png') right center / cover no-repeat;
  border: 1px solid #e2e8ec;
  border-radius: 26px;
  box-shadow: 0 18px 48px rgba(30, 53, 78, .07);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(210px, 390px) auto;
  min-height: 142px;
  overflow: hidden;
  padding: 22px;
  position: relative;
}

.pa-page-header::after {
  background: linear-gradient(180deg, rgba(var(--pa-primary-rgb), .18), rgba(var(--pa-primary-rgb), 0));
  border-radius: 999px;
  content: '';
  height: 110px;
  left: 54%;
  opacity: .45;
  position: absolute;
  top: 18px;
  width: 110px;
}

.pa-page-header-copy {
  min-width: 0;
  position: relative;
  z-index: 1;
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
  font-size: clamp(1.75rem, 2.15vw, 2.35rem);
  font-weight: 700;
  letter-spacing: 0;
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
  height: 92px;
  justify-items: center;
  overflow: hidden;
  position: relative;
  width: 96px;
  z-index: 1;
}

.pa-page-header-ambassador[data-has-message='true'] {
  align-items: center;
  align-self: center;
  background:
    radial-gradient(circle at 85% 20%, rgba(var(--pa-primary-rgb), .14), transparent 8rem),
    linear-gradient(135deg, rgba(255, 255, 255, .84), rgba(255, 255, 255, .34));
  border: 0;
  border-radius: 24px;
  box-shadow: none;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) 132px;
  height: 126px;
  justify-items: start;
  min-height: 126px;
  overflow: visible;
  padding: 10px 8px 6px 14px;
  width: min(390px, 30vw);
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
  height: 92px;
  width: 96px;
}

.pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-card),
.pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-visual) {
  align-self: end;
  height: 128px;
  order: 2;
  width: 132px;
}

.pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-card img) {
  object-fit: cover;
  object-position: center 14%;
  transform: scale(1.02);
}

.pa-page-header-ambassador-copy {
  align-self: center;
  background: rgba(255, 255, 255, .82);
  border: 1px solid rgba(var(--pa-primary-rgb), .14);
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(30, 53, 78, .06);
  display: grid;
  gap: 4px;
  min-width: 0;
  order: 1;
  padding: 10px 11px;
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
    background-position: right top;
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .pa-page-header-ambassador,
  .pa-page-header-ambassador[data-has-message='true'] {
    grid-template-columns: minmax(0, 1fr) 104px;
    height: 110px;
    min-height: 110px;
    width: 100%;
  }

  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-card),
  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-visual) {
    height: 112px;
    width: 104px;
  }

  .pa-page-header-actions {
    grid-column: 1 / -1;
    justify-items: stretch;
  }
}

@media (max-height: 820px) and (min-width: 901px) {
  .pa-page-header {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 330px) auto;
    min-height: 118px;
    padding: 18px;
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
    height: 78px;
    width: 82px;
  }

  .pa-page-header-ambassador[data-has-message='true'] {
    grid-template-columns: minmax(0, 1fr) 96px;
    height: 102px;
    min-height: 102px;
    width: min(330px, 30vw);
  }

  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-card),
  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-visual) {
    height: 104px;
    width: 96px;
  }
}

@media (max-width: 620px) {
  .pa-page-header {
    gap: 12px;
    grid-template-columns: 1fr;
    min-height: 0;
    padding: 16px;
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
    height: 80px;
    width: 78px;
  }

  .pa-page-header-ambassador[data-has-message='true'] {
    border-radius: 16px;
    grid-template-columns: minmax(0, 1fr) 78px;
    grid-column: 1 / -1;
    height: 86px;
    min-height: 86px;
    padding: 7px 6px 5px 10px;
    width: 100%;
  }

  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-card),
  .pa-page-header-ambassador[data-has-message='true'] :deep(.pa-ambassador-visual) {
    height: 88px;
    width: 78px;
  }

  .pa-page-header-ambassador-copy {
    padding: 8px 9px;
  }
}
</style>
