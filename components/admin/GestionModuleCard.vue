<template>
  <NuxtLink class="gestion-module-card" :to="to" :data-state="enabled ? 'enabled' : 'disabled'">
    <span class="module-icon"><FamilyPersonasIcon :name="icon" /></span>
    <span class="module-copy">
      <strong>{{ title }}</strong>
      <small>{{ description }}</small>
    </span>
    <span class="module-metrics">
      <b v-for="metric in metrics" :key="metric.label">{{ metric.value }} {{ metric.label }}</b>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  icon: string
  title: string
  description: string
  enabled?: boolean
  metrics: Array<{ label: string; value: string | number }>
}>()
</script>

<style scoped>
.gestion-module-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
  color: inherit;
  display: grid;
  gap: 16px;
  min-height: 220px;
  padding: 20px;
  text-decoration: none;
  transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
}

.gestion-module-card:hover {
  border-color: #f4c24f;
  box-shadow: 0 20px 52px rgba(15, 23, 42, .09);
  transform: translateY(-1px);
}

.module-icon {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 16px;
  color: #b98000;
  display: grid;
  height: 48px;
  place-items: center;
  width: 48px;
}

.module-copy strong,
.module-copy small {
  display: block;
}

.module-copy strong {
  color: #17233b;
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.module-copy small {
  color: #64748b;
  font-weight: 650;
  line-height: 1.45;
}

.module-metrics {
  align-self: end;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.module-metrics b {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #64748b;
  font-size: .72rem;
  font-weight: 850;
  padding: 7px 9px;
  text-transform: uppercase;
}
</style>
