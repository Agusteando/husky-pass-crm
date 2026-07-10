<template>
  <div class="mkt-app">
    <MktTopbar :session="session" />
    <main class="mkt-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAppSession } from '~/composables/useAppSession'
import MktTopbar from '~/components/mkt/MktTopbar.vue'

const { data: session } = useAppSession()
</script>
