<template>
  <section class="stack">
    <div class="workspace-head compact-head">
      <div>
        <p class="eyebrow">Código QR</p>
        <h1>{{ fullName || 'Persona autorizada' }}</h1>
        <p>Este código permite validar la autorización de salida.</p>
      </div>
      <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${route.params.id}`">Volver</NuxtLink>
    </div>

    <section v-if="person" class="card qr-card">
      <img class="brand" src="/brand/husky-pass-logo.png" alt="Husky Pass" />
      <img class="qr" :src="qrImage" alt="Código QR" />
      <div>
        <h2>{{ fullName }}</h2>
        <p>{{ person.parenP || 'Persona autorizada' }}</p>
        <small>{{ validationUrl }}</small>
      </div>
    </section>
    <EmptyState v-else title="Registro no disponible" description="No encontramos esta persona autorizada en tu cuenta." />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch, useRoute } from 'nuxt/app'
import type { AuthorizedPerson } from '~/types/daycare'
import { appAbsoluteUrl, authorizedPersonValidationPath } from '~/utils/daycare'

definePageMeta({ layout: 'family', middleware: ['family', 'personas-autorizadas'] })
const route = useRoute()
const { data } = useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family')
const person = computed(() => (data.value || []).find((item) => String(item.id) === String(route.params.id)))
const fullName = computed(() => [person.value?.nombreP, person.value?.paternoP, person.value?.maternoP].filter(Boolean).join(' '))
const validationUrl = computed(() => appAbsoluteUrl(authorizedPersonValidationPath(route.params.id as string)))
const qrImage = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(validationUrl.value)}`)
</script>

<style scoped>
.qr-card {
  align-items: center;
  display: grid;
  gap: 18px;
  justify-items: center;
  margin-inline: auto;
  max-width: 520px;
  text-align: center;
}

.brand {
  max-width: 180px;
}

.qr {
  height: 240px;
  width: 240px;
}

.qr-card h2 {
  margin-bottom: 6px;
}

.qr-card small {
  color: var(--color-muted);
  word-break: break-all;
}
</style>
