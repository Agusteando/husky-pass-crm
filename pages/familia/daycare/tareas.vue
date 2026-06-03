<template>
  <FamilyResourceList type="hw" title="Tareas" description="Tareas publicadas para tu sala de guardería." />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })
</script>
