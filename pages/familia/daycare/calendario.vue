<template>
  <FamilyResourceList type="cal" title="Agenda" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })
</script>
