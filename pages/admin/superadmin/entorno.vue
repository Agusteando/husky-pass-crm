<template>
  <section class="system-status" data-product-area="superadmin" data-product-screen="environment">
    <header class="status-head">
      <div>
        <p class="eyebrow">Administración</p>
        <h1>Estado del sistema</h1>
        <p v-if="checklist">Revisado {{ checkedAtLabel }}</p>
      </div>
      <button class="btn btn-secondary" type="button" :disabled="pending" @click="refresh()">
        {{ pending ? 'Revisando...' : 'Revisar ahora' }}
      </button>
    </header>

    <section v-if="pending && !checklist" class="state-panel" data-state="loading">
      <HuskyPassLoader label="Sistema" contained />
    </section>

    <section v-else-if="loadError" class="state-panel" data-state="error">
      <FamilyPersonasIcon name="security" />
      <h2>No se pudo revisar el sistema</h2>
      <button class="btn btn-secondary" type="button" @click="refresh()">Reintentar</button>
    </section>

    <template v-else-if="checklist">
      <section class="status-summary" :data-state="checklist.ok ? 'ready' : 'attention'">
        <span><FamilyPersonasIcon :name="checklist.ok ? 'check' : 'alert'" /></span>
        <div>
          <strong>{{ checklist.ok ? 'Servicios requeridos configurados' : 'Configuración incompleta' }}</strong>
          <small>{{ failedRequired }} requeridos · {{ warnings }} advertencias</small>
        </div>
      </section>

      <section class="status-groups">
        <article v-for="group in checklist.groups" :key="group.id" class="status-group">
          <header>
            <h2>{{ group.label }}</h2>
            <span>{{ group.items.filter((item) => item.ok).length }}/{{ group.items.length }}</span>
          </header>
          <div class="check-list">
            <div v-for="item in group.items" :key="item.key" class="check-row" :data-state="item.ok ? 'ready' : item.severity">
              <span class="check-icon"><FamilyPersonasIcon :name="item.ok ? 'check' : 'alert'" /></span>
              <span class="check-copy">
                <strong>{{ item.label }}</strong>
                <small>{{ item.message }}</small>
              </span>
              <b>{{ item.ok ? 'Listo' : item.severity === 'required' ? 'Requerido' : 'Revisar' }}</b>
            </div>
          </div>
        </article>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFetch } from 'nuxt/app'
import type { SuperAdminEnvChecklistResponse } from '~/types/superadmin'

definePageMeta({ layout: 'admin', middleware: ['admin', 'superadmin'] })

const { data: checklist, pending, error: loadError, refresh } = useFetch<SuperAdminEnvChecklistResponse>('/api/admin/superadmin/env-check', {
  timeout: 15000,
  dedupe: 'cancel'
})

const failedRequired = computed(() => checklist.value?.groups.flatMap((group) => group.items).filter((item) => !item.ok && item.severity === 'required').length || 0)
const warnings = computed(() => checklist.value?.groups.flatMap((group) => group.items).filter((item) => !item.ok && item.severity !== 'required').length || 0)
const checkedAtLabel = computed(() => {
  if (!checklist.value?.checkedAt) return ''
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(checklist.value.checkedAt))
})
</script>

<style scoped>
.system-status {
  display: grid;
  gap: 14px;
}

.status-head,
.status-summary,
.status-group,
.state-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dfe8e7;
  border-radius: 20px;
  box-shadow: 0 14px 40px rgba(24, 57, 66, 0.07);
}

.status-head {
  align-items: center;
  display: flex;
  gap: 18px;
  justify-content: space-between;
  padding: clamp(18px, 2.4vw, 28px);
}

.status-head h1,
.status-head p {
  margin-bottom: 0;
}

.status-summary {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 44px minmax(0, 1fr);
  padding: 16px 18px;
}

.status-summary > span,
.check-icon {
  align-items: center;
  border-radius: 12px;
  display: inline-flex;
  justify-content: center;
}

.status-summary > span {
  background: #eaf5ee;
  color: #39734d;
  height: 44px;
  width: 44px;
}

.status-summary[data-state='attention'] > span {
  background: #fff2e8;
  color: #a75b25;
}

.status-summary div,
.check-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.status-summary small,
.check-copy small {
  color: #6b7888;
}

.status-groups {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.status-group {
  min-width: 0;
  overflow: hidden;
}

.status-group > header {
  align-items: center;
  border-bottom: 1px solid #e4ecea;
  display: flex;
  justify-content: space-between;
  padding: 16px 18px;
}

.status-group h2 {
  font-size: 1rem;
  margin: 0;
}

.status-group header span {
  background: #eef5f3;
  border-radius: 999px;
  color: #4e665f;
  font-size: 0.72rem;
  padding: 5px 8px;
}

.check-list {
  display: grid;
}

.check-row {
  align-items: center;
  border-bottom: 1px solid #edf1f0;
  display: grid;
  gap: 10px;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  padding: 12px 14px;
}

.check-row:last-child {
  border-bottom: 0;
}

.check-icon {
  background: #edf7f0;
  color: #3c7950;
  height: 30px;
  width: 30px;
}

.check-row[data-state='required'] .check-icon,
.check-row[data-state='warning'] .check-icon {
  background: #fff2e9;
  color: #a75b25;
}

.check-copy strong {
  color: #243447;
  font-size: 0.8rem;
}

.check-copy small {
  font-size: 0.69rem;
  line-height: 1.35;
}

.check-row b {
  border-radius: 999px;
  color: #39734d;
  font-size: 0.65rem;
  padding: 5px 7px;
}

.check-row[data-state='required'] b,
.check-row[data-state='warning'] b {
  background: #fff1e6;
  color: #9b5524;
}

.state-panel {
  justify-items: center;
  padding: 36px;
  text-align: center;
}

@media (max-width: 1120px) {
  .status-groups {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .status-head {
    align-items: stretch;
    flex-direction: column;
  }
  .check-row {
    grid-template-columns: 30px minmax(0, 1fr);
  }
  .check-row b {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
