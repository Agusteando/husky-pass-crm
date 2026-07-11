<template>
  <section class="mkt-empty-state" :class="`tone-${tone}`">
    <MktAmbassadorCluster compact :theme="ambassador" :show-seal="false" />
    <div>
      <span class="empty-icon"><FamilyPersonasIcon :name="icon" /></span>
      <p class="mkt-eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MktAmbassadorTheme } from '~/utils/mkt'

withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description?: string
  icon?: string
  ambassador?: MktAmbassadorTheme
  tone?: 'green' | 'blue' | 'yellow' | 'coral'
}>(), {
  eyebrow: 'Mercadotecnia',
  description: '',
  icon: 'sparkles',
  ambassador: 'preescolar',
  tone: 'green'
})
</script>

<style scoped>
.mkt-empty-state {
  align-items: center;
  background:
    radial-gradient(circle at 10% 100%, rgba(143, 200, 73, 0.14), transparent 16rem),
    linear-gradient(135deg, #ffffff, #f4faf7);
  border: 1px solid var(--mkt-line);
  border-radius: 26px;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(190px, 0.36fr) minmax(0, 1fr);
  min-height: 250px;
  overflow: hidden;
  padding: clamp(22px, 4vw, 38px);
}
.mkt-empty-state h2 { font-size: clamp(1.45rem, 3vw, 2.25rem); }
.mkt-empty-state p:not(.mkt-eyebrow) { margin: 8px 0 0; max-width: 560px; }
.empty-icon { align-items: center; background: var(--mkt-mint); border-radius: 15px; color: var(--mkt-teal); display: inline-flex; height: 44px; justify-content: center; margin-bottom: 12px; width: 44px; }
.mkt-empty-state :deep(.mkt-btn) { margin-top: 16px; }
.tone-blue .empty-icon { background: #eaf4fc; color: var(--mkt-blue); }
.tone-yellow .empty-icon { background: #fff7d9; color: #8d6812; }
.tone-coral .empty-icon { background: #fff0ec; color: #bf4e43; }
@media (max-width: 680px) { .mkt-empty-state { grid-template-columns: 1fr; text-align: center; } .mkt-empty-state > div:last-child { display: grid; justify-items: center; } }
</style>
