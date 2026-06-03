<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const route = useRoute()
await navigateTo(`/admin/daycare/salas/${route.params.id}`, { redirectCode: 301 })
</script>
