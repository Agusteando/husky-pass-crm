<template>
  <section class="family-profile" data-product-area="gestion-escolar" data-product-screen="familia-detalle">
    <NuxtLink class="mini-button" to="/admin/gestion-escolar/familias">Volver a familias</NuxtLink>
    <section v-if="pending" class="profile-card state-card" data-state="loading">Cargando perfil...</section>
    <section v-else-if="error" class="profile-card state-card" data-state="error">No pudimos abrir esta familia dentro de tu alcance.</section>
    <section v-else-if="detail" class="profile-card">
      <header>
        <div>
          <p class="eyebrow">Perfil familiar</p>
          <h1>{{ detail.family.studentName }}</h1>
          <p>{{ detail.family.email || detail.family.username || 'Contacto pendiente' }}</p>
        </div>
        <button class="btn btn-primary" type="button" :disabled="!detail.family.canImpersonate || impersonating" @click="impersonate">
          {{ confirming ? 'Confirmar vista familiar' : impersonating ? 'Abriendo...' : 'Ver como familia' }}
        </button>
      </header>

      <section class="profile-grid">
        <article>
          <h2>Contexto escolar</h2>
          <p>{{ detail.family.plantel }} · {{ detail.family.nivel || 'Nivel pendiente' }} · {{ detail.family.grado || 'Grado pendiente' }}{{ detail.family.grupo ? ` · Grupo ${detail.family.grupo}` : '' }}</p>
        </article>
        <article>
          <h2>Contenido visible</h2>
          <p>Encuesta: {{ detail.visibleContent.encuesta?.title || 'Sin encuesta activa' }}</p>
          <p>Convenio: {{ detail.visibleContent.convenio?.title || 'Sin convenio activo' }}</p>
        </article>
        <article>
          <h2>Red de recogida</h2>
          <p>{{ detail.authorizedPeople.length }} personas autorizadas.</p>
        </article>
      </section>

      <section class="list-panel">
        <h2>Personas autorizadas</h2>
        <p v-for="person in detail.authorizedPeople" :key="person.id">{{ person.name }} · {{ person.relationship || 'Parentesco pendiente' }} · {{ person.hasPhoto ? 'Foto lista' : 'Foto pendiente' }}</p>
        <p v-if="!detail.authorizedPeople.length">Sin personas registradas.</p>
      </section>

      <p v-if="notice" class="action-message">{{ notice }}</p>
      <p v-if="actionError" class="action-message error">{{ actionError }}</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo, useFetch, useRoute } from 'nuxt/app'
import type { GestionEscolarFamilyDetailResponse } from '~/types/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })

const route = useRoute()
const familyId = computed(() => String(route.params.id || ''))
const { data: detail, pending, error } = useFetch<GestionEscolarFamilyDetailResponse>(() => `/api/admin/gestion-escolar/familias/${familyId.value}`, { timeout: 15000 })
const confirming = ref(false)
const impersonating = ref(false)
const notice = ref('')
const actionError = ref('')

async function impersonate() {
  if (!detail.value?.family.canImpersonate) return
  if (!confirming.value) {
    confirming.value = true
    notice.value = `Confirma para entrar como ${detail.value.family.studentName}.`
    return
  }
  impersonating.value = true
  try {
    await $fetch('/api/auth/admin/impersonate', { method: 'POST', body: { userId: detail.value.family.userId } })
    await navigateTo('/familia/personas-autorizadas')
  } catch (failure) {
    const errorLike = failure as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = errorLike.data?.statusMessage || errorLike.statusMessage || errorLike.message || 'No pudimos abrir la vista familiar.'
  } finally {
    impersonating.value = false
  }
}
</script>

<style scoped>
.family-profile {
  display: grid;
  gap: 14px;
}

.profile-card,
.mini-button {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.profile-card {
  display: grid;
  gap: 18px;
  padding: clamp(20px, 2.6vw, 34px);
}

header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.eyebrow {
  color: #0f8c9a;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .12em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  color: #17233b;
  font-size: clamp(2rem, 3vw, 3.2rem);
}

p {
  color: #64748b;
  font-weight: 650;
  line-height: 1.5;
}

.profile-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.profile-grid article,
.list-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  gap: 8px;
  padding: 16px;
}

.mini-button {
  color: #0f8c9a;
  font-weight: 850;
  justify-self: start;
  min-height: 38px;
  padding: 9px 13px;
}

.action-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 14px;
  color: #047857;
  padding: 10px 12px;
}

.action-message.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.state-card {
  min-height: 240px;
  place-items: center;
  text-align: center;
}

@media (max-width: 900px) {
  header {
    align-items: stretch;
    flex-direction: column;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
