<template>
  <main class="login-page">
    <section class="login-hero">
      <BrandMark :to="brandTo" />
      <div class="hero-copy">
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
  grid-template-columns: minmax(0, 1fr) minmax(320px, 430px);
  gap: clamp(20px, 4vw, 54px);
  align-items: center;
  width: min(100% - 24px, 1080px);
  margin: 0 auto;
  padding: clamp(18px, 4vw, 38px) 0;
}

.login-hero {
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.42), transparent 38%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(242, 248, 234, 0.78));
  border: 1px solid rgba(223, 232, 215, 0.96);
  border-radius: 30px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: clamp(22px, 4vw, 44px);
  min-height: 420px;
  padding: clamp(22px, 5vw, 46px);
}

.hero-copy {
  align-self: end;
}

.login-hero p:last-child {
  max-width: 560px;
  font-size: 1rem;
}

.login-card {
  padding: clamp(18px, 3vw, 28px);
}

@media (max-width: 820px) {
  .login-page {
    align-content: center;
    grid-template-columns: 1fr;
  }

  .login-hero {
    min-height: 0;
  }
}
</style>
