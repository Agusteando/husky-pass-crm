<template>
  <FamilyPersonasAutorizadasShell title="Pagos">
    <section class="payments-page" :data-state="pageState" data-product-panel="family-payments">
      <FamilyPersonasPageHeader
        eyebrow="Aurora"
        title="Estado de cuenta"
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
          <strong>No pudimos abrir Aurora</strong>
          <span>El estado de cuenta no está disponible por ahora.</span>
        </div>
        <button class="btn btn-secondary" type="button" @click="reload">Reintentar</button>
      </div>

      <section v-else-if="pending && !data" class="payments-loading" data-state="loading">
        <span v-for="item in 6" :key="item"></span>
      </section>

      <template v-else-if="data">
        <section class="account-summary" aria-label="Resumen de cuenta">
          <article class="summary-hero" :data-state="data.summary.overdueCount ? 'attention' : data.summary.balanceDue > 0 ? 'pending' : 'ready'">
            <p class="eyebrow">{{ summaryEyebrow }}</p>
            <h2>{{ money(data.summary.balanceDue) }}</h2>
            <p>{{ data.summary.cycleLabel || 'Ciclo vigente' }} · {{ data.integration.label }}</p>
          </article>
          <article>
            <span>Pagado</span>
            <strong>{{ money(data.summary.paidThisCycle) }}</strong>
          </article>
          <article>
            <span>Recibos</span>
            <strong>{{ data.summary.receiptCount }}</strong>
          </article>
          <article>
            <span>Servicios</span>
            <strong>{{ data.summary.serviceCount }}</strong>
          </article>
        </section>

        <section v-if="data.integration.status === 'unavailable'" class="empty-ambassador-card" data-state="unavailable">
          <FamilyPersonasAmbassador :theme="theme" variant="help" contained decorative />
          <div>
            <p class="eyebrow">Aurora</p>
            <h2>Estado de cuenta no disponible</h2>
            <p>{{ data.message }}</p>
          </div>
        </section>

        <section v-else-if="!data.items.length && !data.receipts.length && !data.services.length" class="empty-ambassador-card" data-state="empty">
          <FamilyPersonasAmbassador :theme="theme" variant="empty" contained decorative />
          <div>
            <p class="eyebrow">Sin movimientos</p>
            <h2>Cuenta sin cargos publicados</h2>
            <p>{{ data.message }}</p>
          </div>
        </section>

        <template v-else>
          <section v-if="data.services.length" class="services-strip" aria-label="Talleres y servicios">
            <article v-for="service in data.services" :key="service.clave || service.nombre" class="service-pill" :data-state="service.estado">
              <span class="service-dot"></span>
              <div>
                <strong>{{ service.nombre }}</strong>
                <small>{{ serviceStateLabel(service.estado) }}</small>
              </div>
            </article>
          </section>

          <nav class="payment-filters" aria-label="Filtrar estado de cuenta">
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

          <section class="account-ledger" aria-label="Estado de cuenta Aurora">
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
                  <span v-if="item.dueDate && item.status !== 'paid'">Vence {{ shortDate(item.dueDate) }}</span>
                  <span v-if="item.paidAt">Pagado {{ shortDate(item.paidAt) }}</span>
                  <span v-if="item.receiptFolios?.length">Recibo {{ item.receiptFolios.join(', ') }}</span>
                </div>
              </div>
              <div class="payment-amount">
                <strong>{{ itemAmount(item) }}</strong>
                <span>{{ itemBalanceLabel(item) }}</span>
              </div>
            </article>
          </section>

          <section v-if="data.receipts.length" class="receipts-panel" aria-label="Recibos de pago">
            <header>
              <p class="eyebrow">Recibos</p>
              <h2>Pagos registrados</h2>
            </header>
            <div class="receipt-list">
              <article v-for="receipt in data.receipts" :key="receipt.folio" class="receipt-row">
                <div>
                  <strong>{{ receiptTitle(receipt) }}</strong>
                  <span>{{ receipt.period || 'Movimiento' }} · {{ receipt.paymentMethod || 'Pago' }}</span>
                </div>
                <div>
                  <strong>{{ money(receipt.amount) }}</strong>
                  <span>{{ shortDate(receipt.paidAt) }}</span>
                </div>
              </article>
            </div>
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
import type { FamilyPaymentsResponse, PaymentCategory, PaymentItem, PaymentReceipt, PaymentServiceBadge, PaymentStatus } from '~/types/payments'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

type FilterValue = 'all' | PaymentStatus

const { theme, studentName } = usePersonasFamilyTheme({ key: 'payments' })
const { data, pending, error: loadError, refresh } = useFetch<FamilyPaymentsResponse>('/api/family/payments', { timeout: 15000 })
const activeFilter = ref<FilterValue>('all')

const items = computed(() => data.value?.items || [])
const pageState = computed(() => loadError.value ? 'error' : pending.value && !data.value ? 'loading' : data.value?.state || 'empty')
const visibleItems = computed(() => items.value.filter((item) => activeFilter.value === 'all' || item.status === activeFilter.value))
const headerDescription = computed(() => `${studentName.value || 'Tu alumno'} · saldos, recibos y servicios sincronizados con Aurora.`)
const summaryEyebrow = computed(() => {
  if ((data.value?.summary.overdueCount || 0) > 0) return 'Saldo vencido'
  if ((data.value?.summary.balanceDue || 0) > 0) return 'Saldo pendiente'
  return 'Sin adeudo visible'
})
const ambassadorTitle = computed(() => {
  if (loadError.value || data.value?.integration.status === 'unavailable') return 'Aurora sin respuesta'
  if (!items.value.length && !(data.value?.receipts.length || data.value?.services.length)) return 'Sin movimientos publicados'
  if ((data.value?.summary.overdueCount || 0) > 0) return 'Saldo por atender'
  if ((data.value?.summary.pendingCount || 0) > 0) return 'Pagos pendientes'
  return 'Cuenta al día'
})
const ambassadorMessage = computed(() => {
  if (loadError.value || data.value?.integration.status === 'unavailable') return 'Conservaré la vista limpia hasta que Aurora responda.'
  if (!items.value.length && !(data.value?.receipts.length || data.value?.services.length)) return 'Aurora no reporta cargos para esta matrícula.'
  return `${money(data.value?.summary.balanceDue || 0)} pendiente · ${data.value?.summary.receiptCount || 0} recibo${(data.value?.summary.receiptCount || 0) === 1 ? '' : 's'}.`
})
const ambassadorTone = computed(() => loadError.value || data.value?.integration.status === 'unavailable' ? 'notice' : (data.value?.summary.overdueCount || 0) ? 'notice' : (data.value?.summary.pendingCount || 0) ? 'calm' : 'success')
const filters = computed(() => [
  { value: 'all' as const, label: 'Todo', count: items.value.length },
  { value: 'pending' as const, label: 'Pendiente', count: items.value.filter((item) => item.status === 'pending').length },
  { value: 'overdue' as const, label: 'Vencido', count: items.value.filter((item) => item.status === 'overdue').length },
  { value: 'paid' as const, label: 'Pagado', count: items.value.filter((item) => item.status === 'paid').length }
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
  if (category === 'servicio') return 'Servicio'
  if (category === 'colegiatura') return 'Colegiatura'
  if (category === 'material') return 'Material'
  if (category === 'evento') return 'Evento'
  return 'Aviso'
}

function serviceStateLabel(state: PaymentServiceBadge['estado']) {
  if (state === 'pagado') return 'Pagado'
  if (state === 'pendiente') return 'Pendiente'
  return 'Activo'
}

function itemAmount(item: PaymentItem) {
  if (item.status === 'paid') return money(item.paidAmount || item.amount || 0)
  if (item.balance !== null && item.balance !== undefined) return money(item.balance)
  if (item.amount === null || item.amount === undefined) return 'Informativo'
  return money(item.amount)
}

function itemBalanceLabel(item: PaymentItem) {
  if (item.status === 'paid') return 'Cubierto'
  if ((item.paidAmount || 0) > 0) return `${money(item.paidAmount || 0)} abonado`
  if (item.status === 'overdue') return 'Vencido'
  if (item.status === 'pending') return 'Pendiente'
  return item.actionLabel || 'Registrado'
}

function receiptTitle(receipt: PaymentReceipt) {
  return receipt.folioPlantel ? `Recibo ${receipt.folioPlantel}` : `Recibo ${receipt.folio}`
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
.payment-filters button,
.service-pill,
.receipts-panel {
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
.summary-hero p,
.service-pill small,
.receipt-row span,
.payment-amount span {
  color: #6f798a;
  font-weight: 750;
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
  grid-template-columns: minmax(280px, 1.35fr) repeat(3, minmax(150px, .65fr));
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
.summary-hero h2,
.receipts-panel h2 {
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
  border-color: #efc8be;
}

.summary-hero[data-state='pending'] {
  border-color: #f0d6a9;
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

.services-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.service-pill {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  gap: 10px;
  min-height: 56px;
  padding: 9px 14px 9px 10px;
}

.service-dot {
  background: var(--pa-soft);
  border: 1px solid var(--pa-border);
  border-radius: 999px;
  height: 34px;
  position: relative;
  width: 34px;
}

.service-dot::after {
  background: var(--pa-primary);
  border-radius: 999px;
  content: '';
  height: 10px;
  left: 11px;
  position: absolute;
  top: 11px;
  width: 10px;
}

.service-pill[data-state='pagado'] .service-dot {
  background: #eff9f0;
  border-color: #cfe5d1;
}

.service-pill[data-state='pagado'] .service-dot::after {
  background: #33844a;
}

.service-pill[data-state='pendiente'] .service-dot {
  background: #fff7e6;
  border-color: #f0d6a9;
}

.service-pill[data-state='pendiente'] .service-dot::after {
  background: #94610f;
}

.service-pill div,
.receipt-row div {
  display: grid;
  gap: 2px;
}

.service-pill strong {
  color: #24334b;
  font-size: .86rem;
}

.service-pill small {
  font-size: .7rem;
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

.account-ledger {
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
  gap: 3px;
  justify-items: end;
  text-align: right;
}

.payment-amount strong {
  color: #1f2d46;
  font-family: var(--font-title);
  font-size: 1.25rem;
}

.receipts-panel {
  border-radius: 22px;
  display: grid;
  gap: 12px;
  padding: 16px;
}

.receipts-panel header {
  display: grid;
  gap: 4px;
}

.receipts-panel h2 {
  font-size: 1.15rem;
  margin: 0;
}

.receipt-list {
  display: grid;
}

.receipt-row {
  align-items: center;
  border-top: 1px solid #edf1f5;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 12px 0;
}

.receipt-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.receipt-row:last-child {
  padding-bottom: 0;
}

.receipt-row > div:last-child {
  justify-items: end;
  text-align: right;
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
  .payments-loading,
  .receipt-row {
    grid-template-columns: 1fr;
  }

  .payment-amount,
  .receipt-row > div:last-child {
    justify-items: start;
    text-align: left;
  }
}
</style>
