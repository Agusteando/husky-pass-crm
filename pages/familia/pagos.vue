<template>
  <FamilyPersonasAutorizadasShell title="Pagos">
    <section class="payments-page" :data-state="pageState" data-product-panel="family-payments">
      <FamilyPersonasPageHeader
        eyebrow="Pagos"
        title="Estado de cuenta familiar"
        :description="headerDescription"
        ambassador-variant="hero"
        :ambassador-title="ambassadorTitle"
        :ambassador-message="ambassadorMessage"
        :ambassador-tone="ambassadorTone"
      >
        <template #actions>
          <button class="btn btn-secondary refresh-action" type="button" :disabled="pending" @click="reload">
            <FamilyPersonasIcon name="replace" />
            Actualizar
          </button>
        </template>
      </FamilyPersonasPageHeader>

      <div v-if="loadError" class="friendly-alert" data-state="error">
        <FamilyPersonasIcon name="payments" />
        <div>
          <strong>No pudimos abrir pagos</strong>
          <span>La información de pagos no está disponible por ahora. Intenta más tarde o consulta directamente a administración escolar.</span>
        </div>
        <button class="btn btn-secondary" type="button" @click="reload">Reintentar</button>
      </div>

      <section v-else-if="pending && !data" class="payments-loading" data-state="loading">
        <span v-for="item in 6" :key="item"></span>
      </section>

      <template v-else-if="data">
        <section class="account-summary" aria-label="Resumen de pagos">
          <article class="summary-hero" :data-state="data.summary.overdueCount ? 'attention' : 'ready'">
            <p class="eyebrow">{{ data.summary.overdueCount ? 'Requiere atención' : 'Al día' }}</p>
            <h2>{{ money(data.summary.balanceDue) }}</h2>
            <p>{{ data.summary.pendingCount }} pendiente{{ data.summary.pendingCount === 1 ? '' : 's' }} · {{ data.summary.overdueCount }} vencido{{ data.summary.overdueCount === 1 ? '' : 's' }}</p>
          </article>
          <article>
            <span>Pagado este ciclo</span>
            <strong>{{ money(data.summary.paidThisCycle) }}</strong>
          </article>
          <article>
            <span>Última actualización</span>
            <strong>{{ shortDate(data.summary.lastUpdated) }}</strong>
          </article>
          <article>
            <span>Origen</span>
            <strong>{{ data.integration.label }}</strong>
          </article>
        </section>

        <section v-if="!data.items.length" class="empty-ambassador-card" data-state="empty">
          <FamilyPersonasAmbassador :theme="theme" variant="empty" contained decorative />
          <div>
            <p class="eyebrow">Sin conceptos publicados</p>
            <h2>No hay pagos para mostrar</h2>
            <p>{{ data.message }}</p>
          </div>
        </section>

        <template v-else>
          <nav class="payment-filters" aria-label="Filtrar pagos">
            <button
              v-for="filter in filters"
              :key="filter.value"
              type="button"
              :class="{ active: activeFilter === filter.value }"
              @click="activeFilter = filter.value"
            >
              <span>{{ filter.label }}</span>
              <strong>{{ filter.count }}</strong>
            </button>
          </nav>

          <section class="payments-list" aria-label="Conceptos de pago">
            <article v-for="item in visibleItems" :key="item.id" class="payment-card" :data-state="item.status">
              <div class="payment-icon">
                <FamilyPersonasIcon :name="item.status === 'paid' ? 'check' : item.status === 'info' ? 'announcement' : 'payments'" />
              </div>
              <div class="payment-copy">
                <span class="payment-status">{{ statusLabel(item.status) }}</span>
                <h2>{{ item.title }}</h2>
                <p>{{ item.description }}</p>
                <div class="payment-meta">
                  <span>{{ categoryLabel(item.category) }}</span>
                  <span v-if="item.period">{{ item.period }}</span>
                  <span v-if="item.dueDate">Vence {{ shortDate(item.dueDate) }}</span>
                  <span v-if="item.paidAt">Pagado {{ shortDate(item.paidAt) }}</span>
                </div>
              </div>
              <div class="payment-amount">
                <strong>{{ item.amount === null || item.amount === undefined ? 'Informativo' : money(item.amount) }}</strong>
                <button class="btn btn-secondary" type="button" disabled>{{ item.actionLabel || 'Próximamente' }}</button>
              </div>
            </article>
          </section>
        </template>
      </template>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFetch } from 'nuxt/app'
import { usePersonasFamilyTheme } from '~/composables/usePersonasTheme'
import type { FamilyPaymentsResponse, PaymentCategory, PaymentStatus } from '~/types/payments'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

type FilterValue = 'all' | PaymentStatus

const { theme, studentName } = usePersonasFamilyTheme({ key: 'payments' })
const { data, pending, error: loadError, refresh } = useFetch<FamilyPaymentsResponse>('/api/family/payments', { timeout: 15000 })
const activeFilter = ref<FilterValue>('all')

const items = computed(() => data.value?.items || [])
const pageState = computed(() => loadError.value ? 'error' : pending.value && !data.value ? 'loading' : items.value.length ? 'ready' : 'empty')
const visibleItems = computed(() => items.value.filter((item) => activeFilter.value === 'all' || item.status === activeFilter.value))
const headerDescription = computed(() => `Consulta talleres, saldos y avisos de pago de ${studentName.value || 'tu alumno'} con estados fáciles de entender.`)
const ambassadorTitle = computed(() => {
  if (loadError.value) return 'Estoy revisando pagos'
  if (!items.value.length) return 'Sin cargos publicados'
  if ((data.value?.summary.overdueCount || 0) > 0) return 'Hay algo por atender'
  if ((data.value?.summary.pendingCount || 0) > 0) return 'Tienes pagos pendientes'
  return 'Cuenta tranquila'
})
const ambassadorMessage = computed(() => {
  if (loadError.value) return 'Te mostraré una explicación clara cuando el servicio responda.'
  if (!items.value.length) return 'Cuando el colegio publique conceptos, aparecerán aquí.'
  return `Saldo visible: ${money(data.value?.summary.balanceDue || 0)}.`
})
const ambassadorTone = computed(() => loadError.value ? 'notice' : (data.value?.summary.overdueCount || 0) ? 'notice' : (data.value?.summary.pendingCount || 0) ? 'calm' : 'success')
const filters = computed(() => [
  { value: 'all' as const, label: 'Todos', count: items.value.length },
  { value: 'pending' as const, label: 'Pendientes', count: items.value.filter((item) => item.status === 'pending').length },
  { value: 'overdue' as const, label: 'Vencidos', count: items.value.filter((item) => item.status === 'overdue').length },
  { value: 'paid' as const, label: 'Pagados', count: items.value.filter((item) => item.status === 'paid').length },
  { value: 'info' as const, label: 'Informativos', count: items.value.filter((item) => item.status === 'info').length }
])

function money(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
}

function shortDate(value?: string | null) {
  if (!value) return 'Por confirmar'
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(new Date(value))
}

function statusLabel(status: PaymentStatus) {
  if (status === 'pending') return 'Pendiente'
  if (status === 'paid') return 'Pagado'
  if (status === 'overdue') return 'Vencido'
  return 'Informativo'
}

function categoryLabel(category: PaymentCategory) {
  if (category === 'taller') return 'Taller'
  if (category === 'colegiatura') return 'Estado de cuenta'
  if (category === 'material') return 'Material'
  if (category === 'evento') return 'Evento'
  return 'Aviso'
}

function reload() {
  void refresh()
}
</script>

<style scoped>
.payments-page {
  display: grid;
  gap: 16px;
}

.refresh-action {
  min-height: 42px;
}

.friendly-alert,
.account-summary article,
.empty-ambassador-card,
.payment-card,
.payment-filters button {
  background: rgba(255, 255, 255, .94);
  border: 1px solid #e2e8ec;
  box-shadow: 0 12px 30px rgba(30, 53, 78, .055);
}

.friendly-alert {
  align-items: center;
  border-color: #f0d6a9;
  border-radius: 18px;
  color: #805b19;
  display: grid;
  gap: 12px;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  padding: 14px;
}

.friendly-alert > .pa-icon {
  background: #fff6e7;
  border-radius: 999px;
  height: 42px;
  padding: 10px;
  width: 42px;
}

.friendly-alert div {
  display: grid;
  gap: 3px;
}

.friendly-alert span,
.empty-ambassador-card p,
.payment-card p,
.summary-hero p {
  color: #6f798a;
  font-weight: 700;
  line-height: 1.5;
  margin: 0;
}

.payments-loading {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.payments-loading span {
  animation: pulse 1.1s ease-in-out infinite alternate;
  background: linear-gradient(90deg, #fff, rgba(var(--pa-primary-rgb), .12), #fff);
  border: 1px solid #e2e8ec;
  border-radius: 18px;
  min-height: 118px;
}

@keyframes pulse {
  from { opacity: .52; }
  to { opacity: 1; }
}

.account-summary {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(280px, 1.3fr) repeat(3, minmax(160px, .7fr));
}

.account-summary article {
  border-radius: 20px;
  display: grid;
  gap: 7px;
  min-height: 114px;
  padding: 16px;
}

.account-summary article span {
  color: #6f798a;
  font-size: .72rem;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.account-summary article strong,
.summary-hero h2 {
  color: #1f2d46;
  font-family: var(--font-title);
  font-size: 1.35rem;
  line-height: 1;
}

.summary-hero {
  background:
    radial-gradient(circle at 100% 0, rgba(var(--pa-primary-rgb), .16), transparent 10rem),
    #fff;
}

.summary-hero[data-state='attention'] {
  border-color: #f0c8a6;
}

.summary-hero h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0;
}

.empty-ambassador-card {
  align-items: center;
  border-radius: 24px;
  display: grid;
  gap: 18px;
  grid-template-columns: 120px minmax(0, 1fr);
  padding: 18px;
}

.payment-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.payment-filters button {
  align-items: center;
  border-radius: 999px;
  color: #627086;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: .78rem;
  font-weight: 850;
  gap: 8px;
  min-height: 38px;
  padding: 0 12px;
}

.payment-filters button.active {
  background: var(--pa-soft);
  border-color: var(--pa-border);
  color: var(--pa-primary);
}

.payments-list {
  display: grid;
  gap: 10px;
}

.payment-card {
  align-items: center;
  border-radius: 20px;
  display: grid;
  gap: 14px;
  grid-template-columns: 54px minmax(0, 1fr) minmax(170px, auto);
  min-height: 112px;
  padding: 14px;
}

.payment-card[data-state='overdue'] {
  border-color: #efc8be;
}

.payment-card[data-state='paid'] {
  border-color: #cfe5d1;
}

.payment-icon {
  align-items: center;
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 17px;
  color: var(--pa-primary);
  display: grid;
  height: 54px;
  place-items: center;
  width: 54px;
}

.payment-card[data-state='overdue'] .payment-icon {
  background: #fff1ed;
  border-color: #efc8be;
  color: #b34135;
}

.payment-card[data-state='paid'] .payment-icon {
  background: #eff9f0;
  border-color: #cfe5d1;
  color: #33844a;
}

.payment-copy {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.payment-status {
  background: #f2f7fb;
  border-radius: 999px;
  color: #637286;
  font-size: .68rem;
  font-weight: 900;
  justify-self: start;
  padding: 5px 8px;
}

.payment-card[data-state='overdue'] .payment-status {
  background: #fff1ed;
  color: #b34135;
}

.payment-card[data-state='pending'] .payment-status {
  background: #fff7e6;
  color: #94610f;
}

.payment-card[data-state='paid'] .payment-status {
  background: #eff9f0;
  color: #33844a;
}

.payment-copy h2 {
  font-size: 1.02rem;
  margin: 0;
}

.payment-meta {
  color: #7a8596;
  display: flex;
  flex-wrap: wrap;
  font-size: .74rem;
  font-weight: 850;
  gap: 8px;
}

.payment-meta span:not(:last-child)::after {
  content: '·';
  margin-left: 8px;
}

.payment-amount {
  display: grid;
  gap: 8px;
  justify-items: end;
  text-align: right;
}

.payment-amount strong {
  color: #1f2d46;
  font-family: var(--font-title);
  font-size: 1.25rem;
}

.payment-amount .btn {
  min-height: 36px;
}

@media (max-width: 1120px) {
  .account-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .friendly-alert,
  .account-summary,
  .empty-ambassador-card,
  .payment-card,
  .payments-loading {
    grid-template-columns: 1fr;
  }

  .payment-amount {
    justify-items: start;
    text-align: left;
  }
}
</style>
