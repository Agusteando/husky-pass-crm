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
  padding: 22px 18px;
}

.empty h3 {
  margin: 12px 0 6px;
}
</style>
