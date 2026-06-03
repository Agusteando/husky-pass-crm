<template>
  <FamilyResourceList type="cal" title="Calendario" description="Eventos próximos publicados para la comunidad de guardería." />
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })
</script>
