<template>
  <section class="env-page stack" data-product-area="superadmin" data-product-screen="env-checklist">
    <header class="workspace-head compact-head env-head">
      <div>
        <p class="eyebrow">Superadmin</p>
        <h1>Entorno</h1>
        <p>Checklist operativo de variables globales sin exponer secretos.</p>
      </div>
      <div class="head-actions">
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin">Directorio</NuxtLink>
        <NuxtLink class="btn btn-secondary" to="/admin/superadmin/personas-autorizadas">Personas Autorizadas</NuxtLink>
        <button class="btn btn-secondary" type="button" :disabled="pending" data-diagnostic-action="actualizar-entorno" @click="refreshChecklist">
          {{ pending ? 'Revisando...' : 'Revisar' }}
        </button>
      </div>
    </header>

    <p v-if="loadMessage" class="alert" data-state="error">{{ loadMessage }}</p>

    <section v-if="checklist" class="env-summary" :data-state="checklist.ok ? 'ok' : 'attention'">
      <article>
        <span>Estado</span>
        <strong>{{ checklist.ok ? 'Listo' : 'Revisar' }}</strong>
      </article>
      <article>
        <span>Requeridos</span>
        <strong>{{ requiredOk }}/{{ requiredTotal }}</strong>
      </article>
      <article>
        <span>Advertencias</span>
        <strong>{{ warningCount }}</strong>
      </article>
      <article>
        <span>Ultima revision</span>
        <strong>{{ checkedAtLabel }}</strong>
      </article>
    </section>

    <div v-else-if="pending" class="card loading-card" data-product-loading>Revisando entorno...</div>

    <section v-if="checklist" class="env-groups">
      <article v-for="group in checklist.groups" :key="group.id" class="card env-group">
        <header class="group-head">
          <div>
            <p class="eyebrow">{{ group.label }}</p>
            <h2>{{ groupStatus(group) }}</h2>
          </div>
          <span class="group-count">{{ group.items.filter((item) => item.ok).length }}/{{ group.items.length }}</span>
        </header>

        <ul class="check-list">
          <li v-for="item in group.items" :key="item.key" :data-state="item.ok ? 'ok' : item.severity">
            <span class="check-dot" aria-hidden="true">{{ item.ok ? '✓' : '!' }}</span>
            <span>
              <strong>{{ item.label }}</strong>
              <small>{{ item.key }}</small>
            </span>
            <em>{{ item.message }}</em>
          </li>
        </ul>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { SuperAdminEnvChecklistGroup, SuperAdminEnvChecklistResponse } from '~/types/superadmin'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const { data: checklist, pending, error, refresh } = useFetch<SuperAdminEnvChecklistResponse>('/api/admin/superadmin/env-check', {
  timeout: 15000
})

const loadMessage = computed(() => {
  const failure = error.value as { data?: { statusMessage?: string }; statusMessage?: string; message?: string } | null
  return failure?.data?.statusMessage || failure?.statusMessage || failure?.message || ''
})
const allItems = computed(() => checklist.value?.groups.flatMap((group) => group.items) || [])
const requiredItems = computed(() => allItems.value.filter((item) => item.severity === 'required'))
const requiredOk = computed(() => requiredItems.value.filter((item) => item.ok).length)
const requiredTotal = computed(() => requiredItems.value.length)
const warningCount = computed(() => allItems.value.filter((item) => !item.ok && item.severity === 'warning').length)
const checkedAtLabel = computed(() => {
  const raw = checklist.value?.checkedAt
  if (!raw) return '—'
  return new Date(raw).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
})

function refreshChecklist() {
  void refresh()
}

function groupStatus(group: SuperAdminEnvChecklistGroup) {
  const requiredFailures = group.items.filter((item) => !item.ok && item.severity === 'required').length
  const warnings = group.items.filter((item) => !item.ok && item.severity === 'warning').length
  if (requiredFailures) return `${requiredFailures} requerido${requiredFailures === 1 ? '' : 's'} pendiente${requiredFailures === 1 ? '' : 's'}`
  if (warnings) return `${warnings} advertencia${warnings === 1 ? '' : 's'}`
  return 'Listo'
}
</script>

<style scoped>
.env-page {
  gap: 12px;
}

.env-head {
  grid-template-columns: minmax(0, 1fr) auto;
  padding-block: 12px;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.env-summary {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.env-summary article {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 4px;
  padding: 10px 12px;
}

.env-summary[data-state='attention'] article:first-child {
  background: #fff7ed;
  border-color: #fed7aa;
}

.env-summary span,
.group-count,
.check-list small {
  color: var(--color-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.env-summary strong {
  color: var(--color-ink);
  font-size: 1.25rem;
  line-height: 1;
}

.env-groups {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.env-group {
  align-content: start;
  display: grid;
  gap: 12px;
}

.group-head {
  align-items: start;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.group-head h2 {
  font-size: 1.1rem;
  margin: 0;
}

.group-count {
  background: var(--color-brand-100);
  border: 1px solid var(--color-brand-200);
  border-radius: 999px;
  color: var(--color-brand-900);
  padding: 5px 8px;
  white-space: nowrap;
}

.check-list {
  display: grid;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.check-list li {
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  display: grid;
  gap: 10px;
  grid-template-columns: 26px minmax(0, .82fr) minmax(140px, 1fr);
  min-height: 54px;
  padding: 8px 10px;
}

.check-list li[data-state='ok'] {
  background: #f7fbf2;
  border-color: #d8ecc5;
}

.check-list li[data-state='required'] {
  background: #fff5f5;
  border-color: #fecaca;
}

.check-list li[data-state='warning'] {
  background: #fffbeb;
  border-color: #fde68a;
}

.check-dot {
  align-items: center;
  background: #edf7e6;
  border-radius: 999px;
  color: #407b2e;
  display: inline-flex;
  font-weight: 900;
  height: 26px;
  justify-content: center;
  width: 26px;
}

.check-list li:not([data-state='ok']) .check-dot {
  background: #fff0d7;
  color: #b45309;
}

.check-list strong,
.check-list small,
.check-list em {
  display: block;
}

.check-list strong {
  color: var(--color-ink);
}

.check-list em {
  color: var(--color-muted);
  font-size: 0.82rem;
  font-style: normal;
  font-weight: 700;
  text-align: right;
}

.loading-card {
  color: var(--color-muted);
}

@media (max-width: 1180px) {
  .env-groups {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 920px) {
  .env-head,
  .env-summary,
  .check-list li {
    grid-template-columns: 1fr;
  }

  .check-list li {
    justify-items: start;
  }

  .check-list em {
    text-align: left;
  }
}
</style>
