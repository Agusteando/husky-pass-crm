<template>
  <section class="stack">
    <div class="workspace-head compact-head">
      <div>
        <p class="eyebrow">Persona autorizada</p>
        <h1>{{ fullName || 'Registro' }}</h1>
        <p>{{ person?.parenP || 'Consulta QR, credencial y datos principales.' }}</p>
      </div>
      <NuxtLink class="btn btn-secondary" to="/familia/personas-autorizadas">Volver</NuxtLink>
    </div>

    <section v-if="person" class="detail-grid">
      <article class="card person-card">
        <img v-if="person.foto" :src="normalizeVirtualAssetUrl(person.foto)" alt="Fotografía" />
        <div v-else class="photo-fallback">PA</div>
        <h2>{{ fullName }}</h2>
        <p>{{ person.parenP || 'Parentesco no especificado' }}</p>
      </article>
      <article class="card actions-card">
        <NuxtLink class="btn btn-primary" :to="`/familia/personas-autorizadas/${person.id}/qr`">Ver QR</NuxtLink>
        <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${person.id}/credencial`">Credencial</NuxtLink>
        <NuxtLink class="btn btn-secondary" :to="`/familia/personas-autorizadas/${person.id}/imprimir`">Imprimir</NuxtLink>
        <button class="btn btn-secondary" type="button" @click="shareCredential">Compartir PDF</button>
      </article>
    </section>
    <EmptyState v-else title="Registro no disponible" description="No encontramos esta persona autorizada en tu cuenta." />
  </section>
</template>

<script setup lang="ts">
import type { AuthorizedPerson } from '~/types/daycare'
import { appAbsoluteUrl, authorizedPersonCredentialPath, authorizedPersonValidationPath, normalizeVirtualAssetUrl } from '~/utils/daycare'

definePageMeta({ layout: 'family', middleware: ['family', 'personas-autorizadas'] })

const route = useRoute()
const { data } = await useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family')
const person = computed(() => (data.value || []).find((item) => String(item.id) === String(route.params.id)))
const fullName = computed(() => [person.value?.nombreP, person.value?.paternoP, person.value?.maternoP].filter(Boolean).join(' '))

async function shareCredential() {
  if (!person.value?.id) return
  const url = appAbsoluteUrl(authorizedPersonCredentialPath(person.value.id))
  try {
    const response = await fetch('https://bot.casitaapps.com/renderFromUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { url, filename: 'PersonaAutorizada.pdf' } })
    })
    const blob = await response.blob()
    const file = new File([blob], 'PersonaAutorizada.pdf', { type: 'application/pdf' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: 'Persona Autorizada', url: appAbsoluteUrl(authorizedPersonValidationPath(person.value.id)), files: [file] })
      return
    }
    const downloadUrl = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = 'PersonaAutorizada.pdf'
    a.click()
    URL.revokeObjectURL(downloadUrl)
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.detail-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
}

.person-card,
.actions-card {
  display: grid;
  gap: 12px;
}

.person-card img,
.photo-fallback {
  aspect-ratio: 1 / 1;
  border-radius: 22px;
  object-fit: cover;
  width: 100%;
}

.photo-fallback {
  background: var(--color-brand-100);
  color: var(--color-brand-800);
  display: grid;
  font-size: 3rem;
  font-weight: 900;
  place-items: center;
}

.person-card h2 {
  margin-bottom: 0;
}

.actions-card {
  align-content: start;
}

.actions-card .btn {
  justify-content: center;
}

@media (max-width: 760px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
