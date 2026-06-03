<template>
  <section class="empty card subtle">
    <div class="badge">Sin registros</div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
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
  text-align: center;
  padding: 36px 24px;
}

.empty h3 {
  margin: 16px 0 8px;
}
</style>
