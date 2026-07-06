<template>
  <section class="families-support" data-product-area="gestion-escolar" data-product-screen="familias">
    <header class="support-head">
      <div>
        <p class="eyebrow">Familias</p>
        <h1>Familias</h1>
        
      </div>
      <form class="support-search" @submit.prevent="refreshFamilies">
        <FamilyPersonasIcon name="search" />
        <input v-model="search" type="search" placeholder="Familia, correo o matrícula" />
        <button type="submit" :disabled="pending">Buscar</button>
      </form>
    </header>

    <section v-if="pending" class="state-panel" data-state="loading">
      <HuskyPassLoader label="Familias" contained />
    </section>
    <section v-else-if="loadError" class="state-panel" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No pudimos cargar familias</h2>
      <p>Tu alcance puede estar incompleto o la consulta falló temporalmente.</p>
    </section>

    <section v-else class="support-layout">
      <aside class="family-pane">
        <div class="metrics-row">
          <article><span>Familias</span><strong>{{ data?.metrics.families || 0 }}</strong></article>
          <article><span>Autorizados</span><strong>{{ data?.metrics.withAuthorizedPeople || 0 }}</strong></article>
          <article><span>Vista familiar</span><strong>{{ data?.metrics.canImpersonate || 0 }}</strong></article>
        </div>

        <div class="pane-title">
          <div>
            <p class="eyebrow">Resultados</p>
            <h2>{{ data?.rows.length || 0 }} familias visibles</h2>
          </div>
        </div>

        <div v-if="data?.rows.length" class="family-list">
          <button
            v-for="family in data.rows"
            :key="family.userId"
            type="button"
            class="family-row"
            :class="{ active: selected?.userId === family.userId }"
            @click="selectFamily(family)"
          >
            <span class="avatar">{{ initials(family.studentName) }}</span>
            <span class="family-copy">
              <strong>{{ family.studentName }}</strong>
              <small>{{ family.plantel }} · {{ family.nivel || 'Nivel' }} · {{ family.grado || 'Grado' }}{{ family.grupo ? ` · ${family.grupo}` : '' }}</small>
            </span>
            <b :data-status="family.parentStatus">{{ statusLabel(family.parentStatus) }}</b>
          </button>
        </div>

        <div v-else class="state-panel compact" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Sin familias visibles</h2>
          <p>Ajusta la búsqueda o solicita revisar tu alcance escolar.</p>
        </div>
      </aside>

      <section class="detail-pane">
        <div v-if="detailPending" class="state-panel compact" data-state="loading">
          <HuskyPassLoader label="Perfil" compact />
        </div>

        <template v-else-if="detail">
          <header class="detail-head">
            <div>
              <p class="eyebrow">Familia</p>
              <h2>{{ detail.family.studentName }}</h2>
              <p>{{ detail.family.email || detail.family.username || 'Contacto pendiente' }}</p>
            </div>
            <div class="detail-actions">
              <NuxtLink class="inline-action" :to="`/admin/gestion-escolar/familias/${detail.family.userId}`">Ficha</NuxtLink>
              <button class="btn btn-primary" type="button" :disabled="!detail.family.canImpersonate || impersonating" @click="impersonate(detail.family)">
                {{ impersonationLabel(detail.family.userId) }}
              </button>
            </div>
          </header>

          <section class="why-panel">
            <div>
              <p class="eyebrow">Por qué la ves</p>
              <h3>{{ detail.family.plantel }} · {{ detail.family.nivel || 'Nivel' }} · {{ detail.family.grado || 'Grado' }}{{ detail.family.grupo ? ` · ${detail.family.grupo}` : '' }}</h3>
            </div>
            <p>La familia coincide con tu plantel, grado o grupo asignado. Las acciones se limitan a consulta y soporte controlado.</p>
          </section>

          <section class="facts-grid">
            <article>
              <span>Estado</span>
              <strong>{{ statusLabel(detail.family.parentStatus) }}</strong>
            </article>
            <article>
              <span>Estudiantes</span>
              <strong>{{ detail.students.length }}</strong>
            </article>
            <article>
              <span>Autorizados</span>
              <strong>{{ detail.authorizedPeople.length }}</strong>
            </article>
            <article>
              <span>Acción sensible</span>
              <strong>{{ detail.family.canImpersonate ? 'Permitida' : 'Solo lectura' }}</strong>
            </article>
          </section>

          <section class="detail-grid">
            <article>
              <p class="eyebrow">Estudiantes</p>
              <p v-for="student in detail.students" :key="`${student.matricula}-${student.grupo}`">
                <strong>{{ student.name }}</strong>
                <small>{{ student.grado || 'Grado' }}{{ student.grupo ? ` · ${student.grupo}` : '' }} · {{ student.matricula || 'Matrícula pendiente' }}</small>
              </p>
            </article>
            <article>
              <p class="eyebrow">Personas autorizadas</p>
              <p v-for="person in detail.authorizedPeople" :key="person.id">
                <strong>{{ person.name }}</strong>
                <small>{{ person.relationship || 'Parentesco pendiente' }} · {{ person.hasPhoto ? 'Foto lista' : 'Foto pendiente' }}</small>
              </p>
              <p v-if="!detail.authorizedPeople.length"><strong>Sin personas autorizadas</strong><small>La familia aún no captura personas autorizadas.</small></p>
            </article>
            <article>
              <p class="eyebrow">Contenido visible</p>
              <p>
                <strong>{{ detail.visibleContent.encuesta?.title || 'Sin encuesta activa' }}</strong>
                <small>Encuesta · {{ detail.visibleContent.encuesta?.scopeLabel || 'Sin audiencia' }}</small>
              </p>
              <p>
                <strong>{{ detail.visibleContent.convenio?.title || 'Sin convenio activo' }}</strong>
                <small>Convenio · {{ detail.visibleContent.convenio?.scopeLabel || 'Sin audiencia' }}</small>
              </p>
            </article>
          </section>

          <section class="signals-panel">
            <p class="eyebrow">Señales de soporte</p>
            <div>
              <span v-for="item in detail.supportPreview" :key="item.label">{{ item.label }}: {{ item.value }}</span>
              <span v-for="signal in detail.family.contactSignals" :key="signal">{{ signal }}</span>
            </div>
          </section>

          <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
          <p v-else-if="actionNotice" class="surface-message">{{ actionNotice }}</p>
        </template>

        <div v-else-if="detailError" class="state-panel compact" data-state="error">
          <FamilyPersonasIcon name="security" />
          <h2>Fuera de alcance</h2>
          <p>{{ detailError }}</p>
        </div>
        <div v-else class="state-panel compact" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Selecciona una familia</h2>
          <p>Verás por qué es visible, su red autorizada y las acciones permitidas.</p>
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
const query = computed(() => ({ search: search.value, limit: 120 }))
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
  confirmingId.value = null
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
  if (confirmingId.value === userId) return 'Confirmar vista'
  return 'Vista familiar'
}

async function impersonate(family: GestionEscolarFamilyRow) {
  if (!family.canImpersonate) return
  if (confirmingId.value !== family.userId) {
    confirmingId.value = family.userId
    actionNotice.value = `Confirma para abrir la vista familiar de ${family.studentName}.`
    return
  }
  impersonating.value = true
  actionError.value = ''
  try {
    await $fetch('/api/auth/admin/impersonate', { method: 'POST', body: { userId: family.userId } })
    await navigateTo('/familia/personas-autorizadas')
  } catch (error) {
    const failure = error as { data?: { statusMessage?: string; message?: string }; statusMessage?: string; message?: string }
    actionError.value = failure.data?.statusMessage || failure.data?.message || failure.statusMessage || failure.message || 'No pudimos abrir la vista familiar.'
  } finally {
    impersonating.value = false
  }
}
</script>

<style scoped>
.families-support {
  display: grid;
  gap: 16px;
}

.support-head,
.family-pane,
.detail-pane,
.state-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dce5eb;
  border-radius: 16px;
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
}

.support-head {
  align-items: end;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 480px);
  padding: clamp(18px, 2.2vw, 28px);
}

.support-head h1,
.pane-title h2,
.detail-head h2,
.why-panel h3,
.state-panel h2 {
  color: #152032;
  font-family: var(--font-body);
  margin: 0;
}

.support-head h1 {
  font-size: clamp(2rem, 3vw, 3.1rem);
}

.support-head p:not(.eyebrow),
.detail-head p,
.why-panel p,
.detail-grid small,
.family-row small {
  color: #667789;
  margin: 0;
}

.support-search {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #dce5eb;
  border-radius: 13px;
  display: grid;
  gap: 9px;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  min-height: 50px;
  padding: 6px 8px 6px 12px;
}

.support-search input {
  background: transparent;
  border: 0;
  color: #152032;
  min-width: 0;
  outline: 0;
}

.support-search button,
.inline-action {
  background: #ffffff;
  border: 1px solid #cfe0e7;
  border-radius: 10px;
  color: #0d766d;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 850;
  min-height: 34px;
  padding: 0 11px;
}

.support-layout {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(330px, 430px) minmax(0, 1fr);
}

.family-pane,
.detail-pane {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.family-pane {
  position: sticky;
  top: calc(var(--topbar-height) + 18px);
}

.metrics-row,
.facts-grid,
.detail-grid {
  display: grid;
  gap: 10px;
}

.metrics-row {
  grid-template-columns: repeat(3, 1fr);
}

.metrics-row article,
.facts-grid article,
.detail-grid article,
.why-panel,
.signals-panel {
  background: #f8fafc;
  border: 1px solid #e1e8ed;
  border-radius: 13px;
  display: grid;
  gap: 6px;
  padding: 12px;
}

.metrics-row span,
.facts-grid span {
  color: #6b7a8b;
  font-size: 0.7rem;
  font-weight: 850;
  text-transform: uppercase;
}

.metrics-row strong,
.facts-grid strong {
  color: #152032;
  font-size: 1.25rem;
}

.family-list {
  display: grid;
  gap: 6px;
  max-height: calc(100vh - 340px);
  overflow: auto;
  padding-right: 2px;
}

.family-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 13px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 9px;
  text-align: left;
}

.family-row.active,
.family-row:hover {
  background: #f4faf8;
  border-color: #cae2dc;
}

.avatar {
  align-items: center;
  background: #eef7f5;
  border: 1px solid #cae2dc;
  border-radius: 12px;
  color: #0d766d;
  display: inline-flex;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.family-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.family-copy strong,
.family-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.family-row b {
  background: #f4f6f8;
  border: 1px solid #dce5eb;
  border-radius: 999px;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 850;
  padding: 6px 9px;
}

.family-row b[data-status='active'] {
  background: #e7f8ef;
  border-color: #bfead0;
  color: #15803d;
}

.family-row b[data-status='incomplete'] {
  background: #fff6df;
  border-color: #f3d589;
  color: #8a650c;
}

.detail-head {
  align-items: start;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  padding-bottom: 14px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.facts-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.detail-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.detail-grid strong,
.detail-grid small {
  display: block;
}

.detail-grid p {
  margin: 0;
}

.signals-panel div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.signals-panel span {
  background: #ffffff;
  border: 1px solid #dce5eb;
  border-radius: 999px;
  color: #526173;
  font-size: 0.76rem;
  font-weight: 850;
  padding: 7px 10px;
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 12px;
  color: #047857;
  margin: 0;
  padding: 10px 12px;
}

.surface-message.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}

.state-panel {
  color: #667789;
  display: grid;
  gap: 9px;
  min-height: 240px;
  place-items: center;
  padding: 24px;
  text-align: center;
}

.state-panel.compact {
  min-height: 190px;
}

@media (max-width: 1120px) {
  .support-head,
  .support-layout,
  .facts-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .family-pane {
    position: static;
  }

  .family-list {
    max-height: none;
  }
}

@media (max-width: 720px) {
  .support-search,
  .metrics-row,
  .family-row {
    grid-template-columns: 1fr;
  }

  .detail-head,
  .detail-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
