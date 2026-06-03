<template>
  <FamilyResourceList type="hw" title="Tareas" description="Tareas publicadas para tu sala de guardería." />
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })
</script>
