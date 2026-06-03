<template>
  <section class="product-chooser stack">
    <div class="workspace-head compact-head">
      <div>
        <p class="eyebrow">Husky Pass</p>
        <h1>Elige un acceso</h1>
        <p>Tu cuenta tiene más de un producto disponible.</p>
      </div>
    </div>

    <section class="chooser-grid">
      <NuxtLink v-if="canDaycare" class="choice-card" to="/familia/daycare">
        <span>GU</span>
        <h2>Guardería</h2>
        <p>Tareas, avisos y calendario de la sala.</p>
        <strong>Entrar</strong>
      </NuxtLink>
      <NuxtLink v-if="canPa" class="choice-card blue" to="/familia/personas-autorizadas">
        <span>PA</span>
        <h2>Personas Autorizadas</h2>
        <p>Gestiona personas autorizadas, QR y credenciales.</p>
        <strong>Entrar</strong>
      </NuxtLink>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { definePageMeta, navigateTo, useFetch } from '#imports'
import type { PublicSession } from '~/types/session'
import { defaultFamilyRoute, hasFamilyScope } from '~/utils/sessionScopes'

definePageMeta({ layout: 'family', middleware: 'family' })

const { data: session } = await useFetch<PublicSession>('/api/auth/me')
const canDaycare = computed(() => hasFamilyScope(session.value?.user, 'daycare'))
const canPa = computed(() => hasFamilyScope(session.value?.user, 'personasAutorizadas'))
const scopeCount = computed(() => Number(canDaycare.value) + Number(canPa.value))

if (scopeCount.value <= 1) {
  const target = defaultFamilyRoute(session.value?.user)
  if (target !== '/familia') await navigateTo(target)
}
</script>

<style scoped>
.chooser-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.choice-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  display: grid;
  gap: 12px;
  min-height: 220px;
  padding: 22px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.choice-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.choice-card span {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 18px;
  color: var(--color-brand-800);
  display: grid;
  font-weight: 900;
  height: 58px;
  place-items: center;
  width: 58px;
}

.choice-card.blue span {
  background: #eaf4fb;
  border-color: #d2e7f5;
  color: var(--color-blue);
}

.choice-card h2 {
  margin-bottom: 0;
}

.choice-card strong {
  align-self: end;
  color: var(--color-brand-700);
}

@media (max-width: 680px) {
  .chooser-grid {
    grid-template-columns: 1fr;
  }

  .choice-card {
    min-height: 0;
  }
}
</style>
