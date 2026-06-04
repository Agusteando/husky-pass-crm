<script setup lang="ts">
import { navigateTo } from 'nuxt/app'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
await navigateTo('/familia/personas-autorizadas/actualizar-datos', { replace: true })
</script>
