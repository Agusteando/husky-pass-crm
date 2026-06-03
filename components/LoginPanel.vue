<template>
  <main class="login-page">
    <section class="login-hero">
      <BrandMark :to="brandTo" />
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
    </section>
    <section class="login-card card">
      <slot />
    </section>
  </main>
</template>

<script setup lang="ts">
defineProps<{
  brandTo: string
  eyebrow: string
  title: string
  description: string
}>()
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 460px);
  gap: clamp(28px, 5vw, 80px);
  align-items: center;
  width: min(100% - 32px, 1160px);
  margin: 0 auto;
  padding: 42px 0;
}

.login-hero {
  display: grid;
  gap: 42px;
}

.login-hero p:last-child {
  max-width: 680px;
  font-size: 1.08rem;
}

.login-card {
  padding: clamp(24px, 4vw, 36px);
}

@media (max-width: 880px) {
  .login-page {
    grid-template-columns: 1fr;
  }
}
</style>
