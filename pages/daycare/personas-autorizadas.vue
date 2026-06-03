<template>
  <section class="stack">
    <div class="hero-panel pa-hero">
      <div>
        <p class="eyebrow">Personas Autorizadas</p>
        <h1>Accesos y QR para recoger alumnos.</h1>
        <p>Este módulo conserva la lógica legacy de cuatro espacios: tres personas autorizadas y un Pase Express. Las rutas públicas de QR y printable se mantienen bajo `/qrPA/{id}` y `/printable/{id}`.</p>
      </div>
      <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
    </div>

    <AuthorizedPersonEditor
      v-if="editing"
      :person="editing"
      :label="authorizedPersonLabel(Number(editing.indice || 1))"
      :saving="saving"
      @save="save"
      @cancel="editing = null"
    />

    <section class="grid grid-4">
      <article v-for="person in people" :key="person.indice" class="pa-card card">
        <span class="badge">{{ authorizedPersonLabel(person.indice) }}</span>
        <div class="portrait" :class="{ empty: !person.id }">
          <img v-if="person.foto" :src="normalizeVirtualAssetUrl(person.foto)" alt="Fotografía de persona autorizada" />
          <span v-else>{{ person.id ? initials(person) : '+' }}</span>
        </div>
        <div>
          <h2>{{ fullName(person) || 'Disponible' }}</h2>
          <p>{{ person.parenP || (person.id ? 'Parentesco pendiente' : 'Agregar registro') }}</p>
        </div>
        <div v-if="person.id" class="qr-box">
          <a :href="qrPaUrl(person.id)" target="_blank" rel="noopener">{{ qrPaUrl(person.id) }}</a>
        </div>
        <div class="actions">
          <button class="btn btn-primary" type="button" @click="edit(person)">{{ person.id ? 'Ver / editar' : 'Agregar' }}</button>
          <button v-if="person.id" class="btn btn-secondary" type="button" @click="share(person)">PDF / compartir</button>
          <button v-if="person.id" class="btn btn-danger" type="button" @click="remove(person.id)">Eliminar</button>
        </div>
      </article>
    </section>

    <section class="card stack">
      <div>
        <p class="eyebrow">Alumnos</p>
        <h2>Alumnos vinculados a la cuenta</h2>
      </div>
      <div class="table-wrap" v-if="children.length">
        <table class="table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Nivel</th>
              <th>Grado / grupo</th>
              <th>Campus</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="child in children" :key="child.id || `${child.nombreA}-${child.grupo}`">
              <td>{{ [child.nombreA, child.paternoA, child.maternoA].filter(Boolean).join(' ') || '—' }}</td>
              <td>{{ child.nivelEdu || '—' }}</td>
              <td>{{ [child.grado, child.grupo].filter(Boolean).join(' / ') || '—' }}</td>
              <td>{{ child.campus || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-else title="Sin alumnos vinculados" description="Puedes capturarlos al agregar o editar una persona autorizada." />
    </section>

    <p v-if="error" class="alert">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import { authorizedPersonLabel, normalizeVirtualAssetUrl, printablePaUrl, qrPaUrl } from '~/utils/daycare'

definePageMeta({ layout: 'family', middleware: 'family' })

const { data, refresh } = await useFetch<AuthorizedPerson[]>('/api/daycare/family/personas-autorizadas')
const editing = ref<Partial<AuthorizedPerson> | null>(null)
const saving = ref(false)
const error = ref('')

const people = computed(() => data.value || [])
const children = computed<AuthorizedChild[]>(() => people.value.find((person) => person.children?.length)?.children || [])

function fullName(person: AuthorizedPerson) {
  return [person.nombreP, person.paternoP, person.maternoP].filter(Boolean).join(' ')
}

function initials(person: AuthorizedPerson) {
  const name = fullName(person) || 'PA'
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

function edit(person: AuthorizedPerson) {
  editing.value = {
    ...person,
    fechaP: person.fechaP || new Date().toISOString().slice(0, 10),
    children: person.children?.length ? person.children : [{}]
  }
}

async function save(payload: Partial<AuthorizedPerson>) {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/daycare/family/personas-autorizadas', { method: 'POST', body: payload })
    editing.value = null
    await refresh()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible guardar el registro.'
  } finally {
    saving.value = false
  }
}

async function remove(id: number | null | undefined) {
  if (!id || !confirm('¿Eliminar este registro de Personas Autorizadas?')) return
  await $fetch(`/api/daycare/family/personas-autorizadas/${id}`, { method: 'DELETE' })
  await refresh()
}

async function share(person: AuthorizedPerson) {
  if (!person.id) return
  const printableUrl = printablePaUrl(person.id)

  try {
    const response = await fetch('https://bot.casitaapps.com/renderFromUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { url: printableUrl, filename: 'PersonaAutorizada.pdf' } })
    })
    const blob = await response.blob()
    const file = new File([blob], 'PersonaAutorizada.pdf', { type: 'application/pdf' })

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'Persona Autorizada para recoger alumnos',
        url: qrPaUrl(person.id),
        files: [file]
      })
      return
    }

    const downloadUrl = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = 'PersonaAutorizada.pdf'
    a.click()
    URL.revokeObjectURL(downloadUrl)
  } catch {
    window.open(printableUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.pa-hero {
  align-items: center;
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr minmax(180px, 280px);
}

.pa-hero img {
  width: 100%;
}

.grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.pa-card {
  display: grid;
  gap: 16px;
  min-height: 420px;
}

.portrait {
  aspect-ratio: 1 / 1;
  border-radius: 28px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: var(--color-brand-100);
  color: var(--color-brand-800);
  font-size: 3rem;
  font-weight: 900;
}

.portrait.empty {
  border: 2px dashed var(--color-brand-200);
}

.portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qr-box {
  background: #f8faf5;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  font-size: 0.82rem;
  padding: 12px;
  word-break: break-word;
}

.actions {
  align-self: end;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 1120px) {
  .grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .grid-4,
  .pa-hero {
    grid-template-columns: 1fr;
  }
}
</style>
