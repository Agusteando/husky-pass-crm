<template>
  <section class="families-module" data-product-area="gestion-escolar" data-product-screen="familias">
    <header class="module-hero">
      <div>
        <p class="eyebrow">Familias</p>
        <h1>Visibilidad familiar</h1>
        <p>Encuentra familias dentro de tu alcance y verifica lo que ven sin salir del control seguro.</p>
      </div>
      <form class="search-card" @submit.prevent="refreshFamilies">
        <FamilyPersonasIcon name="search" />
        <input v-model="search" type="search" placeholder="Buscar familia, correo o matricula" />
        <button class="mini-button" type="submit">Buscar</button>
      </form>
    </header>

    <section v-if="pending" class="state-card" data-state="loading">Cargando familias...</section>
    <section v-else-if="loadError" class="state-card" data-state="error">No pudimos cargar familias. Revisa tu alcance.</section>
    <section v-else class="families-grid">
      <aside class="family-list">
        <div class="metrics">
          <article><span>Familias</span><strong>{{ data?.metrics.families || 0 }}</strong></article>
          <article><span>Con red</span><strong>{{ data?.metrics.withAuthorizedPeople || 0 }}</strong></article>
          <article><span>Impersonables</span><strong>{{ data?.metrics.canImpersonate || 0 }}</strong></article>
        </div>

        <button
          v-for="family in data?.rows"
          :key="family.userId"
          type="button"
          class="family-row"
          :class="{ active: selected?.userId === family.userId }"
          @click="selectFamily(family)"
        >
          <span class="avatar">{{ initials(family.studentName) }}</span>
          <span>
            <strong>{{ family.studentName }}</strong>
            <small>{{ family.plantel }} · {{ family.nivel || 'Nivel pendiente' }} · {{ family.grado || 'Grado pendiente' }}{{ family.grupo ? ` · Grupo ${family.grupo}` : '' }}</small>
          </span>
          <b :data-status="family.parentStatus">{{ statusLabel(family.parentStatus) }}</b>
        </button>
        <div v-if="!data?.rows.length" class="state-card compact" data-state="empty">No hay familias dentro de tu alcance.</div>
      </aside>

      <section class="family-detail">
        <div v-if="detailPending" class="state-card compact" data-state="loading">Preparando perfil...</div>
        <div v-else-if="detail">
          <div class="detail-head">
            <div>
              <p class="eyebrow">Perfil familiar</p>
              <h2>{{ detail.family.studentName }}</h2>
              <p>{{ detail.family.email || detail.family.username || 'Contacto pendiente' }}</p>
            </div>
            <div class="detail-actions">
              <NuxtLink class="mini-button" :to="`/admin/gestion-escolar/familias/${detail.family.userId}`">Abrir perfil</NuxtLink>
              <button class="btn btn-primary" type="button" :disabled="!detail.family.canImpersonate || impersonating" @click="impersonate(detail.family)">
                {{ impersonationLabel(detail.family.userId) }}
              </button>
            </div>
          </div>

          <section class="signal-grid">
            <article v-for="item in detail.supportPreview" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </section>

          <section class="detail-panels">
            <article>
              <h3>Estudiantes vinculados</h3>
              <p v-for="student in detail.students" :key="`${student.matricula}-${student.grupo}`">
                {{ student.name }} · {{ student.plantel }} · {{ student.grado || 'Grado pendiente' }}{{ student.grupo ? ` · Grupo ${student.grupo}` : '' }}
              </p>
            </article>
            <article>
              <h3>Personas autorizadas</h3>
              <p v-for="person in detail.authorizedPeople" :key="person.id">{{ person.name }} · {{ person.relationship || 'Parentesco pendiente' }}</p>
              <p v-if="!detail.authorizedPeople.length">Sin personas registradas.</p>
            </article>
            <article>
              <h3>Lo que ve la familia</h3>
              <p>Encuesta: {{ detail.visibleContent.encuesta?.title || 'Sin encuesta activa' }}</p>
              <p>Convenio: {{ detail.visibleContent.convenio?.title || 'Sin convenio activo' }}</p>
            </article>
          </section>

          <p v-if="actionError" class="action-message error">{{ actionError }}</p>
          <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>
        </div>
        <div v-else-if="detailError" class="state-card compact" data-state="error">
          <FamilyPersonasIcon name="shield" />
          <h2>No pudimos abrir este perfil</h2>
          <p>{{ detailError }}</p>
        </div>
        <div v-else class="state-card compact" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Selecciona una familia</h2>
          <p>Veras contexto, contenido aplicable y acciones de soporte.</p>
        </div>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { navigateTo, useFetch } from 'nuxt/app'
import type { GestionEscolarFamiliesResponse, GestionEscolarFamilyDetailResponse, GestionEscolarFamilyRow } from '~/types/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })

const search = ref('')
const query = computed(() => ({ search: search.value, limit: 100 }))
const { data, pending, error: loadError, refresh } = useFetch<GestionEscolarFamiliesResponse>('/api/admin/gestion-escolar/familias', { query, timeout: 15000 })
const selected = ref<GestionEscolarFamilyRow | null>(null)
const detail = ref<GestionEscolarFamilyDetailResponse | null>(null)
const detailPending = ref(false)
const detailError = ref('')
const hydrated = ref(false)
const confirmingId = ref<number | null>(null)
const impersonating = ref(false)
const actionNotice = ref('')
const actionError = ref('')

watch(() => data.value?.rows, (rows) => {
  if (!hydrated.value) return
  if (!selected.value && rows?.length) void selectFamily(rows[0])
})

onMounted(() => {
  hydrated.value = true
  const rows = data.value?.rows
  if (!selected.value && rows?.length) void selectFamily(rows[0])
})

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

function statusLabel(status: GestionEscolarFamilyRow['parentStatus']) {
  if (status === 'active') return 'Activa'
  if (status === 'limited') return 'Limitada'
  return 'Incompleta'
}

async function refreshFamilies() {
  await refresh()
}

async function selectFamily(family: GestionEscolarFamilyRow) {
  selected.value = family
  detail.value = null
  detailError.value = ''
  detailPending.value = true
  actionError.value = ''
  actionNotice.value = ''
  try {
    detail.value = await $fetch<GestionEscolarFamilyDetailResponse>(`/api/admin/gestion-escolar/familias/${family.userId}`)
  } catch (error) {
    const failure = error as { data?: { message?: string; statusMessage?: string }; statusMessage?: string; message?: string }
    detailError.value = failure.data?.message || failure.data?.statusMessage || failure.statusMessage || failure.message || 'No pudimos cargar este perfil.'
  } finally {
    detailPending.value = false
  }
}

function impersonationLabel(userId: number) {
  if (impersonating.value) return 'Abriendo...'
  if (confirmingId.value === userId) return 'Confirmar vista familiar'
  return 'Ver como familia'
}

async function impersonate(family: GestionEscolarFamilyRow) {
  if (!family.canImpersonate) return
  if (confirmingId.value !== family.userId) {
    confirmingId.value = family.userId
    actionNotice.value = `Confirma para entrar como ${family.studentName}. La vista quedara marcada como soporte.`
    return
  }
  impersonating.value = true
  actionError.value = ''
  try {
    await $fetch('/api/auth/admin/impersonate', { method: 'POST', body: { userId: family.userId } })
    await navigateTo('/familia/personas-autorizadas')
  } catch (error) {
    const failure = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    actionError.value = failure.data?.statusMessage || failure.statusMessage || failure.message || 'No pudimos abrir la vista familiar.'
  } finally {
    impersonating.value = false
  }
}
</script>

<style scoped>
.families-module {
  display: grid;
  gap: 18px;
}

.module-hero,
.family-list,
.family-detail,
.state-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.module-hero {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
  padding: clamp(20px, 2.6vw, 34px);
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
h3,
p {
  margin: 0;
}

h1 {
  color: #17233b;
  font-size: clamp(2rem, 3vw, 3.2rem);
}

.module-hero p,
.family-row small,
.detail-head p,
.detail-panels p,
.state-card p {
  color: #64748b;
  font-weight: 650;
  line-height: 1.5;
}

.search-card {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: grid;
  gap: 8px;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  padding: 8px 10px;
}

.search-card input {
  background: transparent;
  border: 0;
  min-width: 0;
  outline: 0;
}

.families-grid {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(340px, 430px) minmax(0, 1fr);
}

.family-list,
.family-detail {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.family-list {
  max-height: calc(100vh - 260px);
  overflow: auto;
  position: sticky;
  top: 82px;
}

.family-detail {
  min-height: 560px;
}

.metrics,
.signal-grid,
.detail-panels {
  display: grid;
  gap: 10px;
}

.metrics {
  grid-template-columns: repeat(3, 1fr);
}

.metrics article,
.signal-grid article,
.detail-panels article {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
}

.metrics span,
.signal-grid span {
  color: #64748b;
  display: block;
  font-size: .7rem;
  font-weight: 850;
  text-transform: uppercase;
}

.metrics strong,
.signal-grid strong {
  color: #17233b;
  display: block;
  font-size: 1.3rem;
  margin-top: 4px;
}

.family-row {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  gap: 10px;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  padding: 12px;
  text-align: left;
}

.family-row.active,
.family-row:hover {
  border-color: #f4c24f;
}

.avatar {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 14px;
  color: #b98000;
  display: grid;
  font-weight: 900;
  height: 44px;
  place-items: center;
  width: 44px;
}

.family-row strong,
.family-row small {
  display: block;
}

.family-row b {
  border-radius: 999px;
  font-size: .7rem;
  padding: 6px 9px;
}

.family-row b[data-status='active'] {
  background: #e7f8ef;
  color: #15803d;
}

.family-row b[data-status='limited'] {
  background: #fff7df;
  color: #b98000;
}

.family-row b[data-status='incomplete'] {
  background: #fff1f2;
  color: #be123c;
}

.detail-head {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-panels {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mini-button {
  align-items: center;
  background: #fff;
  border: 1px solid #cfe0e7;
  border-radius: 12px;
  color: #0f8c9a;
  display: inline-flex;
  font-weight: 850;
  min-height: 38px;
  padding: 0 12px;
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
  display: grid;
  gap: 8px;
  min-height: 240px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-card.compact {
  min-height: 160px;
}

@media (max-width: 1120px) {
  .module-hero,
  .families-grid,
  .detail-panels {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .metrics,
  .signal-grid {
    grid-template-columns: 1fr;
  }

  .detail-head {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
