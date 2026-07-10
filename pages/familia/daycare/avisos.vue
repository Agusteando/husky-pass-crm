<template>
  <FamilyResourceList type="news" title="Avisos" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })
</script>
