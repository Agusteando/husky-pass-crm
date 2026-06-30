<template>
  <section class="families-module" data-product-area="gestion-escolar" data-product-screen="familias">
    <header class="module-hero">
      <div>
        <p class="eyebrow">Familias escolares</p>
        <h1>Alcance operativo</h1>
        <div class="scope-chips" aria-label="Alcance visible">
          <span v-for="plantel in data?.options.planteles || []" :key="plantel">{{ plantel }}</span>
          <span v-if="!(data?.options.planteles || []).length">Sin plantel</span>
        </div>
      </div>
      <form class="search-card" @submit.prevent="refreshFamilies">
        <FamilyPersonasIcon name="search" />
        <input v-model="search" type="search" placeholder="Familia, correo o matrícula" />
        <button class="mini-button" type="submit">Buscar</button>
      </form>
    </header>

    <section v-if="pending" class="state-card" data-state="loading"><HuskyPassLoader label="Familias" contained /></section>
    <section v-else-if="loadError" class="state-card" data-state="error">No disponible</section>
    <section v-else class="families-grid">
      <aside class="family-list">
        <div class="metrics">
          <article><span>Familias</span><strong>{{ data?.metrics.families || 0 }}</strong></article>
          <article><span>Red</span><strong>{{ data?.metrics.withAuthorizedPeople || 0 }}</strong></article>
          <article><span>Vista</span><strong>{{ data?.metrics.canImpersonate || 0 }}</strong></article>
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
            <small>{{ family.plantel }} · {{ family.nivel || 'Nivel' }} · {{ family.grado || 'Grado' }}{{ family.grupo ? ` · ${family.grupo}` : '' }}</small>
          </span>
          <b :data-status="family.parentStatus">{{ statusLabel(family.parentStatus) }}</b>
        </button>
        <div v-if="!data?.rows.length" class="state-card compact" data-state="empty">Sin familias</div>
      </aside>

      <section class="family-detail">
        <div v-if="detailPending" class="state-card compact" data-state="loading"><HuskyPassLoader label="Perfil" compact /></div>
        <div v-else-if="detail" class="detail-shell">
          <div class="detail-head">
            <div>
              <p class="eyebrow">Perfil familiar</p>
              <h2>{{ detail.family.studentName }}</h2>
              <p>{{ detail.family.email || detail.family.username || 'Contacto pendiente' }}</p>
            </div>
            <div class="detail-actions">
              <NuxtLink class="mini-button" :to="`/admin/gestion-escolar/familias/${detail.family.userId}`">Abrir</NuxtLink>
              <button class="btn btn-primary" type="button" :disabled="!detail.family.canImpersonate || impersonating" @click="impersonate(detail.family)">
                {{ impersonationLabel(detail.family.userId) }}
              </button>
            </div>
          </div>

          <section class="scope-card">
            <span>{{ detail.family.plantel }}</span>
            <strong>{{ detail.family.nivel || 'Nivel' }} · {{ detail.family.grado || 'Grado' }}{{ detail.family.grupo ? ` · ${detail.family.grupo}` : '' }}</strong>
          </section>

          <section class="detail-panels">
            <article>
              <span>Estudiantes</span>
              <p v-for="student in detail.students" :key="`${student.matricula}-${student.grupo}`">
                {{ student.name }} · {{ student.grado || 'Grado' }}{{ student.grupo ? ` · ${student.grupo}` : '' }}
              </p>
            </article>
            <article>
              <span>Red autorizada</span>
              <p v-for="person in detail.authorizedPeople" :key="person.id">{{ person.name }} · {{ person.relationship || 'Pendiente' }}</p>
              <p v-if="!detail.authorizedPeople.length">Sin registros</p>
            </article>
            <article>
              <span>Contenido</span>
              <p>Encuesta · {{ detail.visibleContent.encuesta?.title || '—' }}</p>
              <p>Convenio · {{ detail.visibleContent.convenio?.title || '—' }}</p>
            </article>
          </section>

          <p v-if="actionError" class="action-message error">{{ actionError }}</p>
          <p v-else-if="actionNotice" class="action-message">{{ actionNotice }}</p>
        </div>
        <div v-else-if="detailError" class="state-card compact" data-state="error">
          <FamilyPersonasIcon name="shield" />
          <h2>Fuera de alcance</h2>
          <p>{{ detailError }}</p>
        </div>
        <div v-else class="state-card compact" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Familia</h2>
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
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
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
  if (confirmingId.value === userId) return 'Confirmar'
  return 'Vista familiar'
}

async function impersonate(family: GestionEscolarFamilyRow) {
  if (!family.canImpersonate) return
  if (confirmingId.value !== family.userId) {
    confirmingId.value = family.userId
    actionNotice.value = `Confirma ${family.studentName}.`
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
  border-radius: 26px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.module-hero {
  align-items: end;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
  padding: clamp(22px, 3vw, 38px);
}

.eyebrow {
  color: #0f8c9a;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .12em;
  margin: 0 0 7px;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1,
h2 {
  color: #17233b;
  line-height: 1.06;
}

h1 {
  font-size: clamp(2.35rem, 4.1vw, 4.35rem);
}

.scope-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.scope-chips span {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  font-size: .78rem;
  font-weight: 850;
  padding: 8px 11px;
}

.search-card {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #d9e5ea;
  border-radius: 20px;
  display: grid;
  gap: 10px;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  min-height: 58px;
  padding: 8px 10px;
}

.search-card input {
  background: transparent;
  border: 0;
  color: #17233b;
  font-weight: 760;
  outline: 0;
}

.mini-button {
  align-items: center;
  background: #fff;
  border: 1px solid #cfe0e7;
  border-radius: 13px;
  color: #0f8c9a;
  display: inline-flex;
  font-weight: 850;
  justify-content: center;
  min-height: 40px;
  padding: 0 13px;
  text-decoration: none;
}

.families-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(300px, 420px) minmax(0, 1fr);
}

.family-list {
  align-self: start;
  display: grid;
  gap: 12px;
  max-height: calc(100vh - 170px);
  overflow: auto;
  padding: 14px;
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
}

.metrics article,
.scope-card,
.detail-panels article {
  background: linear-gradient(135deg, #f8fafc, #fff);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 14px;
}

.metrics span,
.scope-card span,
.detail-panels span {
  color: #64748b;
  display: block;
  font-size: .72rem;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.metrics strong,
.scope-card strong {
  color: #10213b;
  display: block;
  font-size: 1.45rem;
  margin-top: 5px;
}

.family-row {
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  color: #17233b;
  display: grid;
  gap: 12px;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  padding: 12px;
  text-align: left;
}

.family-row.active,
.family-row:hover {
  border-color: #f4c24f;
  box-shadow: 0 12px 26px rgba(15, 23, 42, .06);
}

.avatar {
  background: #fff7df;
  border: 1px solid #f3d589;
  border-radius: 15px;
  color: #b98000;
  display: grid;
  font-weight: 900;
  height: 46px;
  place-items: center;
  width: 46px;
}

.family-row strong,
.family-row small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-row small,
.detail-head p,
.detail-panels p {
  color: #64748b;
  font-weight: 650;
}

.family-row b {
  background: #e7f8ef;
  border-radius: 999px;
  color: #15803d;
  font-size: .7rem;
  padding: 6px 9px;
}

.family-row b[data-status='limited'] {
  background: #fff7df;
  color: #9a6700;
}

.family-row b[data-status='incomplete'] {
  background: #fff1f2;
  color: #be123c;
}

.family-detail {
  min-height: 520px;
  padding: clamp(16px, 2vw, 24px);
}

.detail-shell {
  display: grid;
  gap: 14px;
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
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.detail-panels article {
  align-content: start;
  display: grid;
  gap: 8px;
  min-height: 130px;
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
  color: #64748b;
  display: grid;
  gap: 8px;
  min-height: 260px;
  place-items: center;
  padding: 28px;
  text-align: center;
}

.state-card.compact {
  min-height: 220px;
}

@media (max-width: 1180px) {
  .module-hero,
  .families-grid {
    grid-template-columns: 1fr;
  }

  .family-list {
    max-height: none;
    position: static;
  }
}

@media (max-width: 760px) {
  .metrics,
  .detail-panels {
    grid-template-columns: 1fr;
  }

  .detail-head {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
