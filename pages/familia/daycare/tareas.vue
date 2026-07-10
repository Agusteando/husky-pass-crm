<template>
  <FamilyResourceList type="hw" title="Tareas" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })
</script>
