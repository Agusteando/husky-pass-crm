<template>
  <FamilyResourceList type="news" title="Avisos" description="Comunicados y circulares de guardería." />
</template>

<script setup lang="ts">
import { definePageMeta } from '#app'
definePageMeta({ layout: 'family', middleware: ['family', 'daycare-family'] })
</script>
