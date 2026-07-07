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
    </section>

    <section v-else class="support-layout">
      <aside class="family-pane">
        <div class="pane-title">
          <div>
            <p class="eyebrow">Directorio</p>
            <h2>{{ data?.rows.length || 0 }} familias</h2>
          </div>
          <span class="count-chip">{{ data?.metrics.withAuthorizedPeople || 0 }} autorizados</span>
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

          <section class="family-brief" aria-label="Resumen familiar">
            <span>{{ detail.family.plantel }}{{ detail.family.grado ? ` · ${detail.family.grado}` : '' }}{{ detail.family.grupo ? ` · ${detail.family.grupo}` : '' }}</span>
            <span :data-status="detail.family.parentStatus">{{ statusLabel(detail.family.parentStatus) }}</span>
            <span>{{ detail.students.length }} estudiante{{ detail.students.length === 1 ? '' : 's' }}</span>
            <span>{{ detail.authorizedPeople.length }} autorizado{{ detail.authorizedPeople.length === 1 ? '' : 's' }}</span>
            <span>{{ detail.family.canImpersonate ? 'Vista familiar' : 'Solo lectura' }}</span>
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
              <p v-for="person in detail.authorizedPeople" :key="person.id" class="authorized-person">
                <span class="person-copy">
                  <strong>{{ person.name }}</strong>
                  <small>{{ person.relationship || 'Parentesco pendiente' }}</small>
                </span>
                <span class="photo-signal" :data-ready="person.hasPhoto ? 'ready' : 'missing'" :title="person.hasPhoto ? 'Foto capturada' : 'Foto pendiente'" :aria-label="person.hasPhoto ? 'Foto capturada' : 'Foto pendiente'">
                  <FamilyPersonasIcon :name="person.hasPhoto ? 'camera' : 'alert'" />
                </span>
              </p>
              <p v-if="!detail.authorizedPeople.length"><strong>Sin personas autorizadas</strong><small>La familia aún no captura personas autorizadas.</small></p>
            </article>
            <article class="content-card">
              <p class="eyebrow">Disponible</p>
              <div class="content-state" :data-state="detail.visibleContent.encuesta ? 'ready' : 'empty'">
                <FamilyPersonasIcon name="survey" />
                <span>
                  <strong>{{ detail.visibleContent.encuesta?.title || 'Sin encuesta' }}</strong>
                  <small>{{ detail.visibleContent.encuesta?.scopeLabel || 'No publicada para esta familia' }}</small>
                </span>
              </div>
              <div class="content-state" :data-state="detail.visibleContent.convenio ? 'ready' : 'empty'">
                <FamilyPersonasIcon name="handshake" />
                <span>
                  <strong>{{ detail.visibleContent.convenio?.title || 'Sin convenio' }}</strong>
                  <small>{{ detail.visibleContent.convenio?.scopeLabel || 'No publicado para esta familia' }}</small>
                </span>
              </div>
            </article>
          </section>

          <section class="signals-panel">
            <div class="signals-head">
              <p class="eyebrow">Acceso familiar</p>
              <strong>{{ detail.family.features.length }} módulos</strong>
            </div>
            <div class="access-lines">
              <span v-for="item in detail.supportPreview" :key="item.label" class="access-line">
                <FamilyPersonasIcon :name="supportSignalIcon(item.label)" />
                <span>
                  <small>{{ supportSignalTitle(item.label) }}</small>
                  <strong>{{ item.value }}</strong>
                </span>
              </span>
              <span v-for="signal in detail.family.contactSignals" :key="signal" class="access-line compact">
                <FamilyPersonasIcon :name="contactSignalIcon(signal)" />
                <strong>{{ contactSignalLabel(signal) }}</strong>
              </span>
            </div>
          </section>

          <p v-if="actionError" class="surface-message error">{{ actionError }}</p>
        </template>

        <div v-else-if="detailError" class="state-panel compact" data-state="error">
          <FamilyPersonasIcon name="security" />
          <h2>Fuera de alcance</h2>
          <p>{{ detailError }}</p>
        </div>
        <div v-else class="state-panel compact" data-state="empty">
          <FamilyPersonasIcon name="people" />
          <h2>Selecciona una familia</h2>
        </div>
      </section>
    </section>
    <Teleport to="body">
      <section v-if="confirmingId && detail" class="support-modal" @click.self="confirmingId = null">
        <article role="dialog" aria-modal="true" aria-labelledby="family-preview-title">
          <p class="eyebrow">Vista familiar</p>
          <h2 id="family-preview-title">{{ detail.family.studentName }}</h2>
          <p>{{ detail.family.plantel }}{{ detail.family.grado ? ` · ${detail.family.grado}` : '' }}{{ detail.family.grupo ? ` · ${detail.family.grupo}` : '' }}</p>
          <footer>
            <button class="inline-action" type="button" @click="confirmingId = null">Cancelar</button>
            <button class="btn btn-primary" type="button" :disabled="impersonating" @click="impersonate(detail.family)">
              {{ impersonating ? 'Abriendo...' : 'Abrir vista familiar' }}
            </button>
          </footer>
        </article>
      </section>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { navigateTo, useFetch } from 'nuxt/app'
import type { GestionEscolarFamiliesResponse, GestionEscolarFamilyDetailResponse, GestionEscolarFamilyRow } from '~/types/gestionEscolar'
import type { PublicSession } from '~/types/session'
import { setCachedRouteSession } from '~/utils/routeSession'

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

function supportSignalTitle(label: string) {
  const normalized = label.toLowerCase()
  if (normalized.includes('cuenta')) return 'Estado'
  if (normalized.includes('plantel')) return 'Ubicación'
  if (normalized.includes('acceso')) return 'Módulos'
  return label
}

function supportSignalIcon(label: string) {
  const normalized = label.toLowerCase()
  if (normalized.includes('plantel')) return 'school'
  if (normalized.includes('acceso')) return 'security'
  return 'person'
}

function contactSignalLabel(signal: string) {
  const normalized = signal.toLowerCase()
  if (normalized.includes('foto')) return normalized.includes('sin') ? 'Foto pendiente' : 'Foto capturada'
  if (normalized.includes('correo')) return normalized.includes('sin') ? 'Correo pendiente' : 'Correo vinculado'
  return signal
}

function contactSignalIcon(signal: string) {
  const normalized = signal.toLowerCase()
  if (normalized.includes('foto')) return normalized.includes('sin') ? 'alert' : 'camera'
  if (normalized.includes('correo')) return 'announcement'
  return 'security'
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
  if (impersonating.value && confirmingId.value === userId) return 'Abriendo...'
  return 'Vista familiar'
}

async function impersonate(family: GestionEscolarFamilyRow) {
  if (!family.canImpersonate) return
  if (confirmingId.value !== family.userId) {
    confirmingId.value = family.userId
    actionNotice.value = ''
    return
  }
  impersonating.value = true
  actionError.value = ''
  try {
    const response = await $fetch<PublicSession>('/api/auth/admin/impersonate', { method: 'POST', body: { userId: family.userId } })
    setCachedRouteSession(response)
    await navigateTo('/familia/personas-autorizadas')
  } catch (error) {
    const failure = error as { data?: { statusMessage?: string; message?: string }; statusMessage?: string; message?: string }
    actionError.value = failure.data?.message || failure.data?.statusMessage || failure.message || failure.statusMessage || 'No pudimos abrir la vista familiar.'
  } finally {
    impersonating.value = false
  }
}
</script>

<style scoped>
.families-support {
  --ink: #102235;
  --muted: #617187;
  --line: rgba(18, 95, 89, 0.16);
  --soft: #f7fbfa;
  --accent: #07877d;
  --accent-dark: #075f58;
  --sun: #f6b94f;
  display: grid;
  gap: 16px;
}

.support-head,
.family-pane,
.detail-pane,
.state-panel {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: 0 22px 58px rgba(14, 40, 55, 0.08);
}

.support-head {
  align-items: center;
  background:
    radial-gradient(circle at 10% 18%, rgba(8, 135, 125, 0.12), transparent 34%),
    radial-gradient(circle at 90% 12%, rgba(246, 185, 79, 0.18), transparent 30%),
    linear-gradient(135deg, #ffffff, #fbfdf6);
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 480px);
  overflow: hidden;
  padding: clamp(20px, 3vw, 34px);
  position: relative;
}

.support-head::after {
  background: linear-gradient(180deg, #07877d, #8bbf48);
  border-radius: 999px;
  content: '';
  height: 86px;
  opacity: 0.14;
  position: absolute;
  right: 28px;
  top: -42px;
  transform: rotate(35deg);
  width: 14px;
}

.support-head h1,
.pane-title h2,
.detail-head h2,
.state-panel h2 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  margin: 0;
}

.support-head h1 {
  font-size: clamp(2.3rem, 4.2vw, 4rem);
  letter-spacing: -0.03em;
  line-height: 0.92;
}

.eyebrow {
  color: var(--accent-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.support-search {
  align-items: center;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 18px;
  box-shadow: 0 14px 30px rgba(14, 40, 55, 0.06);
  display: grid;
  gap: 10px;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  min-height: 56px;
  padding: 7px 8px 7px 15px;
  position: relative;
  z-index: 1;
}

.support-search input {
  background: transparent;
  border: 0;
  color: var(--ink);
  min-width: 0;
  outline: 0;
}

.support-search button,
.inline-action {
  background: #ffffff;
  border: 1px solid rgba(8, 135, 125, 0.24);
  border-radius: 13px;
  color: var(--accent-dark);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 900;
  min-height: 38px;
  padding: 0 13px;
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

.pane-title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 2px 2px 4px;
}

.pane-title h2 {
  font-size: clamp(1.45rem, 2vw, 1.85rem);
}

.count-chip {
  background: #fff6df;
  border: 1px solid rgba(246, 185, 79, 0.36);
  border-radius: 999px;
  color: #8a650c;
  font-size: 0.74rem;
  font-weight: 900;
  padding: 7px 10px;
}

.family-list {
  display: grid;
  gap: 7px;
  max-height: calc(100vh - 275px);
  overflow: auto;
  padding-right: 3px;
}

.family-row {
  align-items: center;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 18px;
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  padding: 10px;
  text-align: left;
  transition: background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}

.family-row.active,
.family-row:hover {
  background: linear-gradient(135deg, #f0fbf7, #fffaf0);
  border-color: rgba(8, 135, 125, 0.22);
}

.family-row.active {
  box-shadow: inset 3px 0 0 var(--accent);
}

.avatar {
  align-items: center;
  background: linear-gradient(135deg, #eefaf7, #fff6df);
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 15px;
  color: var(--accent-dark);
  display: inline-flex;
  font-weight: 950;
  height: 44px;
  justify-content: center;
  width: 44px;
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

.family-copy strong {
  color: var(--ink);
}

.family-copy small,
.detail-head p,
.detail-grid small {
  color: var(--muted);
  margin: 0;
}

.family-row b {
  background: #f4f6f8;
  border-radius: 999px;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 900;
  padding: 6px 9px;
}

.family-row b[data-status='active'] {
  background: #e5f8ee;
  color: #148044;
}

.family-row b[data-status='incomplete'] {
  background: #fff3d5;
  color: #8a650c;
}

.detail-pane {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(249, 253, 250, 0.93));
}

.detail-head {
  align-items: start;
  border-bottom: 1px solid rgba(18, 95, 89, 0.12);
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: 4px 2px 16px;
}

.detail-head h2 {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  letter-spacing: -0.02em;
  line-height: 0.98;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.detail-actions .btn-primary,
.support-modal .btn-primary {
  background: #21324a;
  border-radius: 14px;
  box-shadow: 0 16px 30px rgba(33, 50, 74, 0.18);
  min-height: 42px;
}

.family-brief {
  align-items: center;
  background: #f6fbfa;
  border: 1px solid rgba(18, 95, 89, 0.12);
  border-radius: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
}

.family-brief span {
  background: #ffffff;
  border: 1px solid rgba(18, 95, 89, 0.10);
  border-radius: 999px;
  color: #46586e;
  font-size: 0.78rem;
  font-weight: 900;
  padding: 7px 10px;
}

.family-brief span[data-status='active'] {
  background: #e5f8ee;
  color: #148044;
}

.detail-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr) minmax(0, 1fr);
}

.detail-grid article,
.signals-panel {
  background: #f8fbfb;
  border: 1px solid rgba(18, 95, 89, 0.12);
  border-radius: 20px;
  display: grid;
  gap: 10px;
  padding: 15px;
}

.detail-grid strong,
.detail-grid small {
  display: block;
}

.detail-grid p {
  margin: 0;
}

.authorized-person {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.person-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.photo-signal {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  height: 30px;
  justify-content: center;
  width: 30px;
}

.photo-signal[data-ready='ready'] {
  background: #e5f8ee;
  color: #148044;
}

.photo-signal[data-ready='missing'] {
  background: #fff3d5;
  color: #8a650c;
}

.content-card {
  align-content: start;
}

.content-state {
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(18, 95, 89, 0.10);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  grid-template-columns: 34px minmax(0, 1fr);
  padding: 10px;
}

.content-state > svg,
.content-state > :deep(svg) {
  color: var(--accent-dark);
}

.content-state[data-state='empty'] {
  background: #fbfcfc;
  color: #64748b;
}

.signals-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.signals-head strong {
  background: #fff6df;
  border: 1px solid rgba(246, 185, 79, 0.36);
  border-radius: 999px;
  color: #8a650c;
  font-size: 0.76rem;
  padding: 7px 10px;
}

.access-lines {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.access-line {
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(18, 95, 89, 0.10);
  border-radius: 16px;
  color: #46586e;
  display: grid;
  gap: 9px;
  grid-template-columns: 32px minmax(0, 1fr);
  min-height: 58px;
  padding: 9px 10px;
}

.access-line.compact {
  grid-template-columns: 28px minmax(0, 1fr);
  min-height: 46px;
}

.access-line small,
.access-line strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.access-line small {
  color: #748195;
  font-size: 0.7rem;
}

.access-line strong {
  color: var(--ink);
}

.surface-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 14px;
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
  color: var(--muted);
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

.support-modal {
  align-items: center;
  background: rgba(15, 23, 42, 0.34);
  display: grid;
  inset: 0;
  padding: 18px;
  place-items: center;
  position: fixed;
  z-index: 90;
}

.support-modal article {
  background: #ffffff;
  border: 1px solid rgba(8, 135, 125, 0.18);
  border-radius: 24px;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.28);
  display: grid;
  gap: 10px;
  max-width: 440px;
  padding: 22px;
  width: min(100%, 440px);
}

.support-modal h2 {
  color: var(--ink);
  font-family: var(--font-title, var(--font-body));
  font-size: 2rem;
  line-height: 1;
  margin: 0;
}

.support-modal p:not(.eyebrow) {
  color: var(--muted);
  margin: 0;
}

.support-modal footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}

@media (max-width: 1180px) {
  .access-lines {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1120px) {
  .support-head,
  .support-layout,
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
  .family-row,
  .authorized-person {
    grid-template-columns: 1fr;
  }

  .detail-head,
  .detail-actions,
  .support-modal footer {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
