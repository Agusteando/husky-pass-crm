<template>
  <NuxtLink :to="to" class="brand-mark" aria-label="Husky Pass Daycare">
    <span class="brand-symbol">HP</span>
    <span>
      <strong>Husky Pass</strong>
      <small>Daycare</small>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ to?: string }>()
</script>

<style scoped>
.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
}

.brand-symbol {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-brand-700), var(--color-amber));
  color: white;
  box-shadow: 0 12px 28px rgba(87, 139, 38, 0.2);
}

strong,
small {
  display: block;
}

small {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
