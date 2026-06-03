<template>
  <AdminResourceModule
    type="news"
    title="Avisos"
    description="Comunicados y circulares visibles para las familias de la sala."
    action-label="Nuevo aviso"
  />
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>
