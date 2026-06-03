<template>
  <section class="pa-page stack">
    <section class="pa-banner">
      <div>
        <p class="eyebrow">Personas Autorizadas</p>
        <h1>Control de accesos</h1>
        <p>Gestiona las personas autorizadas, sus QR y credenciales.</p>
      </div>
      <img src="/brand/husky-pass-logo.png" alt="Husky Pass" />
    </section>

    <p v-if="loadError" class="alert">No fue posible cargar Personas Autorizadas.</p>
    <div v-else-if="pending" class="card loading-card">Cargando registros…</div>

    <template v-else>
      <section class="pa-grid">
        <article v-for="person in people" :key="person.indice" class="pa-card">
          <button class="portrait" :class="{ empty: !person.id }" type="button" @click="edit(person)">
            <img v-if="person.foto" :src="normalizeVirtualAssetUrl(person.foto)" alt="Fotografía de persona autorizada" />
            <span v-else>{{ person.id ? initials(person) : '+' }}</span>
          </button>
          <div class="pa-info">
            <span>{{ authorizedPersonLabel(person.indice) }}</span>
            <h2>{{ fullName(person) || 'Disponible' }}</h2>
            <p>{{ person.parenP || (person.id ? 'Parentesco pendiente' : 'Agregar registro') }}</p>
          </div>
          <div class="actions">
            <button class="btn btn-primary" type="button" @click="edit(person)">{{ person.id ? 'Editar' : 'Agregar' }}</button>
            <NuxtLink v-if="person.id" class="btn btn-secondary" :to="`/familia/personas-autorizadas/${person.id}`">Ver</NuxtLink>
            <button v-if="person.id" class="btn btn-danger" type="button" @click="remove(person.id)">Eliminar</button>
          </div>
        </article>
      </section>

      <AuthorizedPersonEditor
        v-if="editing"
        :person="editing"
        :label="authorizedPersonLabel(Number(editing.indice || 1))"
        :saving="saving"
        @save="save"
        @cancel="editing = null"
      />

      <section class="card stack children-card">
        <div>
          <p class="eyebrow">Alumnos</p>
          <h2>Alumnos vinculados</h2>
        </div>
        <div class="table-wrap responsive-card-wrap" v-if="children.length">
          <table class="table responsive-table">
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
                <td data-label="Alumno">{{ [child.nombreA, child.paternoA, child.maternoA].filter(Boolean).join(' ') || '—' }}</td>
                <td data-label="Nivel">{{ child.nivelEdu || '—' }}</td>
                <td data-label="Grado / grupo">{{ [child.grado, child.grupo].filter(Boolean).join(' / ') || '—' }}</td>
                <td data-label="Campus">{{ child.campus || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <EmptyState v-else title="Sin alumnos vinculados" description="Puedes agregarlos al capturar una persona autorizada." />
      </section>
    </template>

    <p v-if="error" class="alert">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { definePageMeta, useFetch } from '#imports'
import type { AuthorizedChild, AuthorizedPerson } from '~/types/daycare'
import { authorizedPersonLabel, normalizeVirtualAssetUrl } from '~/utils/daycare'

definePageMeta({ layout: 'family', middleware: ['family', 'personas-autorizadas'] })

const { data, refresh, pending, error: loadError } = await useFetch<AuthorizedPerson[]>('/api/personas-autorizadas/family')
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
    await $fetch('/api/personas-autorizadas/family', { method: 'POST', body: payload })
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
  error.value = ''
  try {
    await $fetch(`/api/personas-autorizadas/family/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.statusMessage || 'No fue posible eliminar el registro.'
  }
}
</script>

<style scoped>
.pa-page {
  gap: 14px;
}

.pa-banner {
  align-items: center;
  background: radial-gradient(circle at top right, rgba(35, 97, 136, 0.12), transparent 44%), #fff;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr minmax(120px, 170px);
  padding: clamp(16px, 2.8vw, 24px);
}

.pa-banner img {
  width: 100%;
}

.pa-banner h1,
.pa-banner p {
  margin-bottom: 0;
}

.pa-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.pa-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: var(--shadow-soft);
  display: grid;
  overflow: hidden;
}

.portrait {
  aspect-ratio: 1.18 / 1;
  background: #f0f1ef;
  border: 0;
  cursor: pointer;
  display: grid;
  font-size: 2.5rem;
  font-weight: 900;
  padding: 0;
  place-items: center;
}

.portrait.empty {
  color: #585858;
}

.portrait img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.pa-info {
  display: grid;
  gap: 4px;
  min-height: 96px;
  padding: 13px;
  text-align: center;
}

.pa-info span {
  color: var(--color-blue);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pa-info h2 {
  font-size: 1.02rem;
  margin-bottom: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 13px 13px;
}

.actions .btn {
  flex: 1 1 auto;
  min-height: 36px;
  padding-inline: 11px;
}

.children-card h2 {
  margin-bottom: 0;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1120px) {
  .pa-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .pa-banner {
    grid-template-columns: 1fr;
  }

  .pa-banner img {
    max-width: 150px;
  }
}

@media (max-width: 540px) {
  .pa-grid {
    grid-template-columns: 1fr;
  }
}
</style>
