<template>
  <section class="empty card subtle">
    <span class="empty-icon" aria-hidden="true">
      <FamilyPersonasIcon name="check" />
    </span>
    <div class="empty-copy">
      <div class="badge">Sin registros</div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<style scoped>
.empty {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr);
  padding: 16px;
  text-align: left;
}

.empty h3 {
  margin: 8px 0 5px;
}

.empty-icon {
  align-items: center;
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 14px;
  color: var(--color-brand-700);
  display: inline-flex;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.empty-icon :deep(.pa-icon) {
  height: 1.05rem;
  width: 1.05rem;
}

.empty-copy {
  min-width: 0;
}

@media (max-width: 520px) {
  .empty {
    grid-template-columns: 1fr;
  }
}
</style>
