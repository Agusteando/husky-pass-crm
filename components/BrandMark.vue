<template>
  <NuxtLink :to="to" class="brand-mark" aria-label="Husky Pass">
    <img class="brand-logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
    <span class="brand-copy">
      <strong>Husky Pass</strong>
      <small>CRM</small>
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

.brand-logo {
  width: clamp(118px, 18vw, 180px);
  height: auto;
  display: block;
  object-fit: contain;
}

.brand-copy {
  display: none;
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

@media (max-width: 560px) {
  .brand-logo {
    width: 132px;
  }
}
</style>
