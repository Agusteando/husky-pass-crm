<template>
  <AdminSalasCommandCenter />
</template>

<script setup lang="ts">
import AdminSalasCommandCenter from '~/components/admin/AdminSalasCommandCenter.vue'
definePageMeta({ layout: 'admin', middleware: ['admin', 'daycare-admin'] })
</script>
