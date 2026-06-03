<script setup lang="ts">
definePageMeta({ middleware: 'family' })
const route = useRoute()
await navigateTo(`/daycare/recursos/${route.params.tipo}`, { redirectCode: 301 })
</script>
