<template>
  <section class="family-profile" data-product-area="gestion-escolar" data-product-screen="familia-detalle">
    <NuxtLink class="mini-button back-link" to="/admin/gestion-escolar/familias">Familias</NuxtLink>

    <section v-if="pending" class="state-card" data-state="loading"><HuskyPassLoader label="Perfil" contained /></section>
    <section v-else-if="error" class="state-card" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h1>No disponible</h1>
      <p>Familia fuera de alcance.</p>
    </section>

    <template v-else-if="detail">
      <header class="profile-hero">
        <span class="profile-avatar">{{ initials(detail.family.studentName) }}</span>
        <div>
          <p class="eyebrow">Familia</p>
          <h1>{{ detail.family.studentName }}</h1>
          <p>{{ detail.family.email || detail.family.username || 'Contacto pendiente' }}</p>
          <div class="scope-rail">
            <span>{{ detail.family.plantel }}</span>
            <span>{{ detail.family.nivel || 'Nivel' }}</span>
            <span>{{ detail.family.grado || 'Grado' }}</span>
            <span v-if="detail.family.grupo">{{ detail.family.grupo }}</span>
          </div>
        </div>
        <button class="btn btn-primary" type="button" :disabled="!detail.family.canImpersonate || impersonating" @click="impersonate">
          {{ impersonationLabel }}
        </button>
      </header>

      <section class="metrics-grid" aria-label="Resumen familiar">
        <article><span>Estado</span><strong>{{ statusLabel(detail.family.parentStatus) }}</strong></article>
        <article><span>Estudiantes</span><strong>{{ detail.students.length }}</strong></article>
        <article><span>Autorizados</span><strong>{{ detail.authorizedPeople.length }}</strong></article>
        <article><span>Vista</span><strong>{{ detail.family.canImpersonate ? 'Permitida' : 'Solo lectura' }}</strong></article>
      </section>

      <section class="profile-layout">
        <article class="panel wide-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Estudiantes</p>
              <h2>Contexto escolar</h2>
            </div>
            <span>{{ detail.students.length }}</span>
          </div>
          <div class="student-list">
            <div v-for="student in detail.students" :key="`${student.matricula}-${student.plantel}-${student.grupo}`" class="student-row">
              <span class="mini-avatar">{{ initials(student.name) }}</span>
              <div>
                <strong>{{ student.name }}</strong>
                <small>{{ student.matricula || 'Matrícula pendiente' }}</small>
              </div>
              <b>{{ student.plantel }} · {{ student.nivel || 'Nivel' }} · {{ student.grado || 'Grado' }}{{ student.grupo ? ` · ${student.grupo}` : '' }}</b>
            </div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Red</p>
              <h2>Personas autorizadas</h2>
            </div>
            <span>{{ detail.authorizedPeople.length }}</span>
          </div>
          <div class="simple-list">
            <p v-for="person in detail.authorizedPeople" :key="person.id">
              <strong>{{ person.name }}</strong>
              <small>{{ person.relationship || 'Parentesco pendiente' }} · {{ person.hasPhoto ? 'Foto lista' : 'Foto pendiente' }}</small>
            </p>
            <p v-if="!detail.authorizedPeople.length"><strong>Sin personas autorizadas</strong><small>La familia aún no captura personas autorizadas.</small></p>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Contenido</p>
              <h2>Visible para familia</h2>
            </div>
          </div>
          <div class="content-list">
            <div>
              <span>Encuesta</span>
              <strong>{{ detail.visibleContent.encuesta?.title || 'Sin encuesta activa' }}</strong>
              <small>{{ detail.visibleContent.encuesta?.scopeLabel || '—' }}</small>
            </div>
            <div>
              <span>Convenio</span>
              <strong>{{ detail.visibleContent.convenio?.title || 'Sin convenio activo' }}</strong>
              <small>{{ detail.visibleContent.convenio?.scopeLabel || '—' }}</small>
            </div>
          </div>
        </article>

        <article class="panel wide-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Soporte</p>
              <h2>Señales de soporte</h2>
            </div>
          </div>
          <div class="signal-grid">
            <p v-for="item in detail.supportPreview" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value || '—' }}</strong></p>
            <p v-for="signal in detail.family.contactSignals" :key="signal"><span>Señal</span><strong>{{ signal }}</strong></p>
          </div>
        </article>
      </section>

      <p v-if="notice" class="action-message">{{ notice }}</p>
      <p v-if="actionError" class="action-message error">{{ actionError }}</p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo, useFetch, useRoute } from 'nuxt/app'
import type { GestionEscolarFamilyDetailResponse, GestionEscolarFamilyRow } from '~/types/gestionEscolar'

definePageMeta({ layout: 'admin', middleware: ['admin', 'gestion-escolar-admin'] })

const route = useRoute()
const familyId = computed(() => String(route.params.id || ''))
const { data: detail, pending, error } = useFetch<GestionEscolarFamilyDetailResponse>(() => `/api/admin/gestion-escolar/familias/${familyId.value}`, { timeout: 15000 })
const confirming = ref(false)
const impersonating = ref(false)
const notice = ref('')
const actionError = ref('')

const impersonationLabel = computed(() => {
  if (impersonating.value) return 'Abriendo...'
  if (confirming.value) return 'Confirmar vista'
  return 'Vista familiar'
})

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'HP'
}

function statusLabel(status: GestionEscolarFamilyRow['parentStatus']) {
  if (status === 'active') return 'Activa'
  if (status === 'limited') return 'Limitada'
  return 'Incompleta'
}

async function impersonate() {
  if (!detail.value?.family.canImpersonate) return
  if (!confirming.value) {
    confirming.value = true
    notice.value = `Confirma para abrir la vista familiar de ${detail.value.family.studentName}.`
    actionError.value = ''
    return
  }
  impersonating.value = true
  actionError.value = ''
  try {
    await $fetch('/api/auth/admin/impersonate', { method: 'POST', body: { userId: detail.value.family.userId } })
    await navigateTo('/familia/personas-autorizadas')
  } catch (failure) {
    const errorLike = failure as { data?: { statusMessage?: string; message?: string }; statusMessage?: string; message?: string }
    actionError.value = errorLike.data?.statusMessage || errorLike.data?.message || errorLike.statusMessage || errorLike.message || 'No pudimos abrir la vista familiar.'
  } finally {
    impersonating.value = false
  }
}
</script>

<style scoped>
.family-profile {
  display: grid;
  gap: 18px;
}

.profile-hero,
.panel,
.metrics-grid article,
.state-card,
.mini-button {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 26px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, .07);
}

.back-link {
  border-radius: 14px;
  color: #0f8c9a;
  font-weight: 850;
  justify-self: start;
  min-height: 38px;
  padding: 9px 13px;
  text-decoration: none;
}

.profile-hero {
  align-items: center;
  background:
    radial-gradient(circle at 90% 8%, rgba(15, 140, 154, .15), transparent 30%),
    linear-gradient(135deg, #fff, #f8fbf2);
  display: grid;
  gap: 18px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: clamp(22px, 3vw, 38px);
}

.profile-avatar,
.mini-avatar {
  background: #fff7df;
  border: 1px solid #f3d589;
  color: #b98000;
  display: grid;
  font-weight: 900;
  place-items: center;
}

.profile-avatar {
  border-radius: 28px;
  font-size: 1.35rem;
  height: 76px;
  width: 76px;
}

.mini-avatar {
  border-radius: 14px;
  height: 42px;
  width: 42px;
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
p {
  margin: 0;
}

h1,
h2 {
  color: #17233b;
  line-height: 1.06;
}

h1 {
  font-size: clamp(2.15rem, 3.8vw, 4rem);
}

h2 {
  font-size: 1.15rem;
}

.profile-hero p,
.simple-list small,
.content-list small,
.student-row small {
  color: #64748b;
  font-weight: 650;
  line-height: 1.45;
}

.scope-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.scope-rail span,
.panel-head span {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #475569;
  font-size: .78rem;
  font-weight: 850;
  padding: 8px 11px;
}

.metrics-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metrics-grid article {
  display: grid;
  gap: 6px;
  padding: 16px;
}

.metrics-grid span,
.signal-grid span,
.content-list span {
  color: #64748b;
  font-size: .72rem;
  font-weight: 850;
  text-transform: uppercase;
}

.metrics-grid strong {
  color: #17233b;
  font-size: 1.4rem;
}

.profile-layout {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, .85fr);
}

.panel {
  align-content: start;
  display: grid;
  gap: 14px;
  padding: clamp(18px, 2.3vw, 26px);
}

.wide-panel {
  grid-column: span 1;
}

.panel-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.student-list,
.simple-list,
.content-list,
.signal-grid {
  display: grid;
  gap: 10px;
}

.student-row {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr) minmax(180px, auto);
  padding: 12px;
}

.student-row strong,
.simple-list strong,
.content-list strong,
.signal-grid strong {
  color: #17233b;
}

.student-row b {
  color: #475569;
  font-size: .8rem;
  font-weight: 850;
  text-align: right;
}

.simple-list p,
.content-list div,
.signal-grid p {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: grid;
  gap: 4px;
  padding: 12px;
}

.simple-list small,
.content-list small {
  display: block;
}

.signal-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-message {
  background: #edfdf7;
  border: 1px solid #b7ead6;
  border-radius: 14px;
  color: #047857;
  font-weight: 750;
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
  gap: 10px;
  min-height: 320px;
  padding: 28px;
  place-items: center;
  text-align: center;
}

@media (max-width: 1050px) {
  .profile-hero,
  .profile-layout,
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .profile-avatar {
    height: 62px;
    width: 62px;
  }

  .student-row {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .student-row b {
    grid-column: 1 / -1;
    text-align: left;
  }
}

@media (max-width: 680px) {
  .signal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
