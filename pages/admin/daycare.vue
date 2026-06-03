<template>
  <AdminSalasCommandCenter />
</template>

<script setup lang="ts">
import { definePageMeta } from '#app'
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>
