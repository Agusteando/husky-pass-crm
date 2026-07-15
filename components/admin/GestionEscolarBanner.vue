<template>
  <header class="school-page-head" :data-tone="tone">
    <div class="head-main">
      <span class="head-icon" aria-hidden="true"><FamilyPersonasIcon name="school" /></span>
      <div class="head-copy">
        <p class="head-eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="head-subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div v-if="$slots.actions" class="head-actions"><slot name="actions" /></div>
    <div v-if="$slots.stats" class="head-stats"><slot name="stats" /></div>
  </header>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
  tone?: 'teal' | 'blue' | 'amber' | 'coral'
  ambassador?: 'preescolar' | 'primaria' | 'secundaria'
}>(), {
  eyebrow: 'Escolar',
  subtitle: '',
  tone: 'teal',
  ambassador: 'primaria'
})
</script>

<style scoped>
.school-page-head {
  --head-accent: #0a8178;
  --head-accent-soft: #e8f5f2;
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid color-mix(in srgb, var(--head-accent) 18%, #dbe6e5);
  border-radius: 22px;
  box-shadow: 0 16px 42px rgba(25, 54, 65, 0.08);
  display: grid;
  gap: 14px 20px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: clamp(18px, 2.4vw, 28px);
}

.school-page-head[data-tone='blue'] { --head-accent: #2d759e; --head-accent-soft: #edf5fa; }
.school-page-head[data-tone='amber'] { --head-accent: #a96c17; --head-accent-soft: #fff5df; }
.school-page-head[data-tone='coral'] { --head-accent: #ad584f; --head-accent-soft: #fff0ed; }

.head-main {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: 48px minmax(0, 1fr);
  min-width: 0;
}

.head-icon {
  align-items: center;
  background: var(--head-accent-soft);
  border-radius: 14px;
  color: var(--head-accent);
  display: inline-flex;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.head-icon :deep(.pa-icon) {
  height: 23px;
  width: 23px;
}

.head-copy {
  min-width: 0;
}

.head-eyebrow {
  color: var(--head-accent);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  margin: 0 0 4px;
  text-transform: uppercase;
}

.head-copy h1 {
  color: #182a3e;
  font-size: clamp(1.65rem, 3vw, 2.45rem);
  letter-spacing: -0.025em;
  line-height: 1;
  margin: 0;
}

.head-subtitle {
  color: #6b7888;
  font-size: 0.86rem;
  margin: 7px 0 0;
}

.head-actions,
.head-stats {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.head-stats {
  grid-column: 1 / -1;
  justify-content: flex-start;
  padding-left: 62px;
}

.head-stats :deep(span) {
  background: #f6f9f8;
  border: 1px solid #e1e9e7;
  border-radius: 999px;
  color: #526274;
  font-size: 0.74rem;
  padding: 7px 10px;
}

@media (max-width: 720px) {
  .school-page-head {
    grid-template-columns: 1fr;
  }
  .head-actions,
  .head-stats {
    justify-content: flex-start;
    padding-left: 0;
  }
  .head-main {
    grid-template-columns: 42px minmax(0, 1fr);
  }
  .head-icon {
    height: 42px;
    width: 42px;
  }
}
</style>
