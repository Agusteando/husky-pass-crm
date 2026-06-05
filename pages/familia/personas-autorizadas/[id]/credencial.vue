<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
await navigateTo(`/familia/personas-autorizadas/${route.params.id}/marbete`, { replace: true })
</script>
