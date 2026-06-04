<script setup lang="ts">
import { navigateTo } from 'nuxt/app'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })
await navigateTo('/familia/personas-autorizadas/credencializacion', { replace: true })
</script>
