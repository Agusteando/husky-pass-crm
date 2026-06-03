<template>
  <NuxtLink :to="to || '/'" class="brand-mark" aria-label="Husky Pass">
    <img class="brand-logo" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ to?: string }>()
</script>

<style scoped>
.brand-mark {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.brand-logo {
  display: block;
  height: auto;
  object-fit: contain;
  width: clamp(94px, 12vw, 142px);
}

@media (max-width: 640px) {
  .brand-logo {
    width: 108px;
  }
}
</style>
