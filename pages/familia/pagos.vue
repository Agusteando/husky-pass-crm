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
            <HuskyPassLoader v-if="pending" compact label="" />
            <FamilyPersonasIcon v-else name="replace" />
            {{ pending ? 'Sincronizando' : 'Actualizar' }}
          </button>
        </template>
      </FamilyPersonasPageHeader>

      <section class="school-year-panel" aria-label="Ciclo escolar">
        <div class="school-year-current" :data-state="isHistoricalYear ? 'historical' : 'current'">
          <span>Ciclo escolar</span>
          <strong>{{ activeSchoolYearLabel }}</strong>
          <small>{{ isHistoricalYear ? 'Archivo Aurora' : 'Ciclo vigente' }}</small>
        </div>
        <div class="school-year-picker" role="tablist" aria-label="Elegir ciclo escolar">
          <button
            v-for="year in displaySchoolYears"
            :key="year.key"
            type="button"
            role="tab"
            :aria-selected="year.key === selectedCycle"
            :class="{ active: year.key === selectedCycle }"
            :disabled="pending && year.key !== selectedCycle"
            @click="selectCycle(year.key)"
          >
            <span>{{ year.label }}</span>
            <small v-if="year.isCurrent">Actual</small>
            <small v-else-if="year.hasData">Histórico</small>
            <small v-else>Archivo</small>
          </button>
        </div>
      </section>

      <div v-if="loadError" class="friendly-alert" data-state="error">
        <FamilyPersonasIcon name="payments" />
        <div>
          <strong>No pudimos abrir Aurora</strong>
          <span>El estado de cuenta no está disponible por ahora.</span>
        </div>
        <button class="btn btn-secondary" type="button" :disabled="pending" @click="reload">Reintentar</button>
      </div>

      <section v-if="pending && !data" class="payments-loading" data-state="loading">
        <HuskyPassLoader contained label="Sincronizando Aurora" />
      </section>

      <template v-else-if="data">
        <div class="account-stage" :data-loading="pending ? 'true' : 'false'">
          <div v-if="pending" class="payments-sync-overlay" aria-live="polite">
            <HuskyPassLoader label="Actualizando ciclo" />
          </div>

          <section class="account-summary" aria-label="Resumen de cuenta">
            <article class="summary-hero" :data-state="data.summary.overdueCount ? 'attention' : data.summary.balanceDue > 0 ? 'pending' : 'ready'">
              <div>
                <p class="eyebrow">{{ summaryEyebrow }}</p>
                <h2>{{ privateValue('balance', money(data.summary.balanceDue)) }}</h2>
                <p>{{ data.summary.cycleLabel || 'Ciclo vigente' }} · {{ data.integration.label }}</p>
              </div>
              <button class="data-toggle" type="button" :aria-pressed="isSummaryVisible('balance')" @click="toggleSummary('balance')">
                {{ isSummaryVisible('balance') ? 'Ocultar' : 'Ver saldo' }}
              </button>
            </article>
            <article>
              <span>Pagado</span>
              <strong>{{ privateValue('paid', money(data.summary.paidThisCycle)) }}</strong>
              <button class="data-toggle slim" type="button" :aria-pressed="isSummaryVisible('paid')" @click="toggleSummary('paid')">
                {{ isSummaryVisible('paid') ? 'Ocultar' : 'Ver' }}
              </button>
            </article>
            <article>
              <span>Recibos</span>
              <strong>{{ privateValue('receipts', String(data.summary.receiptCount)) }}</strong>
              <button class="data-toggle slim" type="button" :aria-pressed="isSummaryVisible('receipts')" @click="toggleSummary('receipts')">
                {{ isSummaryVisible('receipts') ? 'Ocultar' : 'Ver' }}
              </button>
            </article>
            <article>
              <span>Servicios</span>
              <strong>{{ privateValue('services', String(data.summary.serviceCount)) }}</strong>
              <button class="data-toggle slim" type="button" :aria-pressed="isSummaryVisible('services')" @click="toggleSummary('services')">
                {{ isSummaryVisible('services') ? 'Ocultar' : 'Ver' }}
              </button>
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
            <section v-if="data.services.length" class="services-panel" aria-label="Talleres y servicios">
              <header class="section-topline">
                <div>
                  <p class="eyebrow">Servicios</p>
                  <h2>Talleres y servicios</h2>
                </div>
                <button v-if="hasMoreServices" class="step-button" type="button" @click="showMoreServices">Ver 3 más</button>
              </header>
              <div class="services-strip">
                <article v-for="service in visibleServices" :key="service.clave || service.nombre" class="service-pill" :data-state="service.estado" :data-revealed="isServiceVisible(service) ? 'true' : 'false'">
                  <span class="service-dot"></span>
                  <div>
                    <strong>{{ isServiceVisible(service) ? service.nombre : 'Servicio protegido' }}</strong>
                    <small>{{ isServiceVisible(service) ? serviceStateLabel(service.estado) : 'Oculto' }}</small>
                  </div>
                  <button class="mini-toggle" type="button" :aria-pressed="isServiceVisible(service)" @click="toggleService(service)">
                    {{ isServiceVisible(service) ? 'Ocultar' : 'Ver' }}
                  </button>
                </article>
              </div>
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
              <header class="section-topline compact-line">
                <div>
                  <p class="eyebrow">Movimientos</p>
                  <h2>{{ filteredItems.length }} conceptos</h2>
                </div>
                <button v-if="hasMoreItems" class="step-button" type="button" @click="showMoreItems">Ver 3 más</button>
              </header>

              <article v-for="item in visibleItems" :key="item.id" class="payment-card" :data-state="item.status" :data-revealed="isItemVisible(item) ? 'true' : 'false'">
                <div class="payment-icon">
                  <FamilyPersonasIcon :name="item.status === 'paid' ? 'check' : item.status === 'info' ? 'announcement' : 'payments'" />
                </div>
                <div class="payment-copy">
                  <span class="payment-status">{{ statusLabel(item.status) }}</span>
                  <h2>{{ item.title }}</h2>
                  <p v-if="isItemVisible(item)">{{ item.description }}</p>
                  <p v-else class="private-copy">Detalle protegido</p>
                  <div v-if="isItemVisible(item)" class="payment-meta">
                    <span>{{ categoryLabel(item.category) }}</span>
                    <span v-if="item.period">{{ item.period }}</span>
                    <span v-if="item.dueDate && item.status !== 'paid'">Vence {{ shortDate(item.dueDate) }}</span>
                    <span v-if="item.paidAt">Pagado {{ shortDate(item.paidAt) }}</span>
                    <span v-if="item.receiptFolios?.length">Recibo {{ item.receiptFolios.join(', ') }}</span>
                  </div>
                </div>
                <div class="payment-amount">
                  <strong>{{ isItemVisible(item) ? itemAmount(item) : '••••' }}</strong>
                  <span>{{ isItemVisible(item) ? itemBalanceLabel(item) : 'Oculto' }}</span>
                  <button class="data-toggle slim" type="button" :aria-pressed="isItemVisible(item)" @click="toggleItem(item)">
                    {{ isItemVisible(item) ? 'Ocultar' : 'Ver detalle' }}
                  </button>
                </div>
              </article>
            </section>

            <section v-if="data.receipts.length" class="receipts-panel" aria-label="Recibos de pago">
              <header class="section-topline">
                <div>
                  <p class="eyebrow">Recibos</p>
                  <h2>Pagos registrados</h2>
                </div>
                <button v-if="hasMoreReceipts" class="step-button" type="button" @click="showMoreReceipts">Ver 3 más</button>
              </header>
              <div class="receipt-list">
                <article v-for="receipt in visibleReceipts" :key="receipt.folio" class="receipt-row" :data-revealed="isReceiptVisible(receipt) ? 'true' : 'false'">
                  <div>
                    <strong>{{ isReceiptVisible(receipt) ? receiptTitle(receipt) : 'Recibo protegido' }}</strong>
                    <span>{{ isReceiptVisible(receipt) ? `${receipt.period || 'Movimiento'} · ${receipt.paymentMethod || 'Pago'}` : 'Oculto' }}</span>
                  </div>
                  <div>
                    <strong>{{ isReceiptVisible(receipt) ? money(receipt.amount) : '••••' }}</strong>
                    <span>{{ isReceiptVisible(receipt) ? shortDate(receipt.paidAt) : 'Privado' }}</span>
                  </div>
                  <button class="mini-toggle" type="button" :aria-pressed="isReceiptVisible(receipt)" @click="toggleReceipt(receipt)">
                    {{ isReceiptVisible(receipt) ? 'Ocultar' : 'Ver' }}
                  </button>
                </article>
              </div>
            </section>
          </template>
        </div>
      </template>
    </section>
  </FamilyPersonasAutorizadasShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { usePersonasFamilyTheme } from '~/composables/usePersonasTheme'
import type { FamilyPaymentsResponse, PaymentCategory, PaymentItem, PaymentReceipt, PaymentSchoolYear, PaymentServiceBadge, PaymentStatus } from '~/types/payments'

definePageMeta({ layout: false, middleware: ['family', 'personas-autorizadas'] })

type FilterValue = 'all' | PaymentStatus
type SummaryField = 'balance' | 'paid' | 'receipts' | 'services'

const BATCH_SIZE = 3

const { theme, studentName } = usePersonasFamilyTheme({ key: 'payments' })
const selectedCycle = ref(deriveCurrentCycle())
const data = ref<FamilyPaymentsResponse | null>(null)
const pending = ref(true)
const loadError = ref<unknown>(null)
const activeFilter = ref<FilterValue>('all')
const cachedSchoolYears = ref<PaymentSchoolYear[]>([])
const itemLimit = ref(BATCH_SIZE)
const receiptLimit = ref(BATCH_SIZE)
const serviceLimit = ref(BATCH_SIZE)
const visibleSummaryFields = ref<Set<SummaryField>>(new Set())
const visibleItemIds = ref<Set<string>>(new Set())
const visibleReceiptIds = ref<Set<number>>(new Set())
const visibleServiceIds = ref<Set<string>>(new Set())
let requestSequence = 0

const items = computed(() => data.value?.items || [])
const receipts = computed(() => data.value?.receipts || [])
const services = computed(() => data.value?.services || [])
const schoolYears = computed(() => data.value?.schoolYears?.length ? data.value.schoolYears : cachedSchoolYears.value)
const displaySchoolYears = computed<PaymentSchoolYear[]>(() => {
  const selectedOption = {
    key: selectedCycle.value,
    label: formatCycleLabel(selectedCycle.value),
    isCurrent: selectedCycle.value === deriveCurrentCycle(),
    isSelected: true,
    hasData: false
  }
  if (!schoolYears.value.length) return [selectedOption]
  if (schoolYears.value.some((year) => year.key === selectedCycle.value)) return schoolYears.value
  return [selectedOption, ...schoolYears.value]
})
const selectedSchoolYear = computed(() => displaySchoolYears.value.find((year) => year.key === selectedCycle.value) || displaySchoolYears.value.find((year) => year.isSelected) || displaySchoolYears.value[0] || null)
const activeSchoolYearLabel = computed(() => selectedSchoolYear.value?.label || formatCycleLabel(selectedCycle.value))
const isHistoricalYear = computed(() => selectedSchoolYear.value ? !selectedSchoolYear.value.isCurrent : false)
const pageState = computed(() => loadError.value ? 'error' : pending.value && !data.value ? 'loading' : data.value?.state || 'empty')
const filteredItems = computed(() => items.value.filter((item) => activeFilter.value === 'all' || item.status === activeFilter.value))
const visibleItems = computed(() => filteredItems.value.slice(0, itemLimit.value))
const visibleReceipts = computed(() => receipts.value.slice(0, receiptLimit.value))
const visibleServices = computed(() => services.value.slice(0, serviceLimit.value))
const hasMoreItems = computed(() => visibleItems.value.length < filteredItems.value.length)
const hasMoreReceipts = computed(() => visibleReceipts.value.length < receipts.value.length)
const hasMoreServices = computed(() => visibleServices.value.length < services.value.length)
const headerDescription = computed(() => `${studentName.value || 'Tu alumno'} · ${activeSchoolYearLabel.value} sincronizado con Aurora.`)
const summaryEyebrow = computed(() => {
  if ((data.value?.summary.overdueCount || 0) > 0) return 'Saldo vencido'
  if ((data.value?.summary.balanceDue || 0) > 0) return 'Saldo pendiente'
  return 'Sin adeudo visible'
})
const ambassadorTitle = computed(() => {
  if (loadError.value || data.value?.integration.status === 'unavailable') return 'Aurora sin respuesta'
  if (pending.value && data.value) return 'Actualizando Aurora'
  if (!items.value.length && !(receipts.value.length || services.value.length)) return 'Sin movimientos publicados'
  if ((data.value?.summary.overdueCount || 0) > 0) return 'Saldo por atender'
  if ((data.value?.summary.pendingCount || 0) > 0) return 'Pagos pendientes'
  return 'Cuenta al día'
})
const ambassadorMessage = computed(() => {
  if (loadError.value || data.value?.integration.status === 'unavailable') return 'Conservaré la vista limpia hasta que Aurora responda.'
  if (pending.value && data.value) return `${activeSchoolYearLabel.value} se está sincronizando.`
  if (!items.value.length && !(receipts.value.length || services.value.length)) return 'Aurora no reporta cargos para esta matrícula.'
  return `${items.value.length} concepto${items.value.length === 1 ? '' : 's'} · datos protegidos hasta abrir cada tarjeta.`
})
const ambassadorTone = computed(() => loadError.value || data.value?.integration.status === 'unavailable' ? 'notice' : (data.value?.summary.overdueCount || 0) ? 'notice' : (data.value?.summary.pendingCount || 0) ? 'calm' : 'success')
const filters = computed(() => [
  { value: 'all' as const, label: 'Todo', count: items.value.length },
  { value: 'pending' as const, label: 'Pendiente', count: items.value.filter((item) => item.status === 'pending').length },
  { value: 'overdue' as const, label: 'Vencido', count: items.value.filter((item) => item.status === 'overdue').length },
  { value: 'paid' as const, label: 'Pagado', count: items.value.filter((item) => item.status === 'paid').length }
])

onMounted(() => {
  void loadPayments()
})

watch(activeFilter, () => {
  itemLimit.value = BATCH_SIZE
  visibleItemIds.value = new Set()
})

function deriveCurrentCycle() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: 'numeric'
  }).formatToParts(new Date())
  const year = Number(parts.find((part) => part.type === 'year')?.value || new Date().getFullYear())
  const month = Number(parts.find((part) => part.type === 'month')?.value || (new Date().getMonth() + 1))
  return String(month >= 9 ? year : year - 1)
}

function formatCycleLabel(value: string) {
  const match = String(value || '').match(/\d{4}/)
  const key = match?.[0] || deriveCurrentCycle()
  return `${key}-${Number(key) + 1}`
}

function resetVisibility() {
  itemLimit.value = BATCH_SIZE
  receiptLimit.value = BATCH_SIZE
  serviceLimit.value = BATCH_SIZE
  visibleSummaryFields.value = new Set()
  visibleItemIds.value = new Set()
  visibleReceiptIds.value = new Set()
  visibleServiceIds.value = new Set()
}

async function loadPayments() {
  const sequence = ++requestSequence
  pending.value = true
  loadError.value = null
  try {
    const response = await $fetch<FamilyPaymentsResponse>('/api/family/payments', {
      query: { ciclo: selectedCycle.value },
      timeout: 15000
    })
    if (sequence !== requestSequence) return
    data.value = response
    if (response.schoolYears?.length) cachedSchoolYears.value = response.schoolYears
  } catch (error) {
    if (sequence !== requestSequence) return
    loadError.value = error
  } finally {
    if (sequence === requestSequence) pending.value = false
  }
}

function selectCycle(cycle: string) {
  if (!cycle || cycle === selectedCycle.value) return
  selectedCycle.value = cycle
  activeFilter.value = 'all'
  resetVisibility()
  void loadPayments()
}

function showMoreItems() {
  itemLimit.value += BATCH_SIZE
}

function showMoreReceipts() {
  receiptLimit.value += BATCH_SIZE
}

function showMoreServices() {
  serviceLimit.value += BATCH_SIZE
}

function serviceKey(service: PaymentServiceBadge) {
  return String(service.clave || service.nombre)
}

function isSummaryVisible(field: SummaryField) {
  return visibleSummaryFields.value.has(field)
}

function toggleSummary(field: SummaryField) {
  const next = new Set(visibleSummaryFields.value)
  if (next.has(field)) next.delete(field)
  else next.add(field)
  visibleSummaryFields.value = next
}

function privateValue(field: SummaryField, value: string) {
  return isSummaryVisible(field) ? value : '••••'
}

function isItemVisible(item: PaymentItem) {
  return visibleItemIds.value.has(item.id)
}

function toggleItem(item: PaymentItem) {
  const next = new Set(visibleItemIds.value)
  if (next.has(item.id)) next.delete(item.id)
  else next.add(item.id)
  visibleItemIds.value = next
}

function isReceiptVisible(receipt: PaymentReceipt) {
  return visibleReceiptIds.value.has(receipt.folio)
}

function toggleReceipt(receipt: PaymentReceipt) {
  const next = new Set(visibleReceiptIds.value)
  if (next.has(receipt.folio)) next.delete(receipt.folio)
  else next.add(receipt.folio)
  visibleReceiptIds.value = next
}

function isServiceVisible(service: PaymentServiceBadge) {
  return visibleServiceIds.value.has(serviceKey(service))
}

function toggleService(service: PaymentServiceBadge) {
  const key = serviceKey(service)
  const next = new Set(visibleServiceIds.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  visibleServiceIds.value = next
}

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
  resetVisibility()
  void loadPayments()
}
</script>

<style scoped>
.payments-page {
  display: grid;
  gap: 16px;
}

.refresh-action {
  border-radius: 16px;
  min-height: 42px;
  min-width: 132px;
}

.school-year-panel {
  align-items: center;
  border-radius: 26px;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(210px, .42fr) minmax(0, 1fr);
  overflow: hidden;
  padding: 12px;
}

.school-year-current {
  background:
    radial-gradient(circle at 110% -20%, rgba(var(--pa-primary-rgb), .22), transparent 7rem),
    linear-gradient(135deg, var(--pa-soft), #fff);
  border: 1px solid var(--pa-border);
  border-radius: 22px;
  display: grid;
  gap: 4px;
  min-height: 86px;
  padding: 14px;
}

.school-year-current[data-state='historical'] {
  background: linear-gradient(135deg, #f7f9fb, #fff);
  border-color: #dbe3eb;
}

.school-year-current span,
.school-year-current small {
  color: #667589;
  font-size: .68rem;
  font-weight: 950;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.school-year-current strong {
  color: #1f2d46;
  font-family: var(--font-title);
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  line-height: 1;
}

.school-year-picker {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px;
  scrollbar-width: none;
}

.school-year-picker::-webkit-scrollbar {
  display: none;
}

.school-year-picker button {
  align-items: center;
  border-radius: 19px;
  color: #657386;
  cursor: pointer;
  display: grid;
  flex: 0 0 auto;
  font: inherit;
  gap: 5px;
  justify-items: start;
  min-height: 70px;
  min-width: 126px;
  padding: 11px 13px;
  position: relative;
  text-align: left;
}

.school-year-picker button::after {
  background: var(--pa-primary);
  border-radius: 999px;
  bottom: 9px;
  content: '';
  height: 4px;
  left: 13px;
  opacity: 0;
  position: absolute;
  width: 26px;
}

.school-year-picker button:disabled {
  cursor: wait;
  opacity: .68;
}

.school-year-picker button.active {
  background:
    linear-gradient(135deg, rgba(var(--pa-primary-rgb), .13), rgba(var(--pa-primary-rgb), .04)),
    #fff;
  border-color: var(--pa-border);
  color: var(--pa-primary);
  box-shadow: 0 14px 32px rgba(var(--pa-primary-rgb), .12);
}

.school-year-picker button.active::after {
  opacity: 1;
}

.school-year-picker span {
  color: inherit;
  font-family: var(--font-title);
  font-size: 1rem;
  line-height: 1;
}

.school-year-picker small {
  background: #f3f7fa;
  border-radius: 999px;
  color: #718094;
  font-size: .62rem;
  font-weight: 950;
  letter-spacing: .06em;
  padding: 4px 7px;
  text-transform: uppercase;
}

.school-year-picker button.active small {
  background: var(--pa-soft);
  color: var(--pa-primary);
}

.friendly-alert,
.school-year-panel,
.school-year-picker button,
.account-summary article,
.empty-ambassador-card,
.payment-card,
.payment-filters button,
.service-pill,
.receipts-panel,
.services-panel {
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
.payment-amount span,
.private-copy {
  color: #6f798a;
  font-weight: 750;
  line-height: 1.5;
  margin: 0;
}

.payments-loading {
  display: grid;
}

.account-stage {
  display: grid;
  gap: 16px;
  position: relative;
}

.account-stage[data-loading='true'] > :not(.payments-sync-overlay) {
  opacity: .38;
  pointer-events: none;
  transition: opacity .18s ease;
}

.payments-sync-overlay {
  align-items: center;
  background: rgba(250, 252, 253, .72);
  border: 1px solid rgba(var(--pa-primary-rgb), .12);
  border-radius: 26px;
  display: grid;
  inset: 0;
  justify-items: center;
  min-height: 220px;
  position: absolute;
  z-index: 4;
  backdrop-filter: blur(10px);
}

.account-summary {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(280px, 1.35fr) repeat(3, minmax(150px, .65fr));
}

.account-summary article {
  border-radius: 22px;
  display: grid;
  gap: 8px;
  min-height: 120px;
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
.receipts-panel h2,
.services-panel h2,
.account-ledger h2 {
  color: #1f2d46;
  font-family: var(--font-title);
  font-size: 1.35rem;
  line-height: 1;
  margin: 0;
}

.summary-hero {
  align-items: end;
  background:
    radial-gradient(circle at 100% 0, rgba(var(--pa-primary-rgb), .16), transparent 10rem),
    linear-gradient(135deg, #fff, #fbfdff);
  grid-template-columns: minmax(0, 1fr) auto;
}

.summary-hero[data-state='attention'] {
  border-color: #efc8be;
}

.summary-hero[data-state='pending'] {
  border-color: #f0d6a9;
}

.summary-hero h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0 0 3px;
}

.data-toggle,
.mini-toggle,
.step-button {
  background: #fff;
  border: 1px solid rgba(var(--pa-primary-rgb), .18);
  border-radius: 999px;
  color: var(--pa-primary);
  cursor: pointer;
  font: inherit;
  font-size: .72rem;
  font-weight: 950;
  min-height: 34px;
  padding: 0 12px;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}

.data-toggle:hover,
.mini-toggle:hover,
.step-button:hover {
  box-shadow: 0 10px 20px rgba(var(--pa-primary-rgb), .1);
  transform: translateY(-1px);
}

.data-toggle[aria-pressed='true'],
.mini-toggle[aria-pressed='true'] {
  background: var(--pa-soft);
}

.data-toggle.slim {
  justify-self: start;
  min-height: 28px;
  padding: 0 10px;
}

.empty-ambassador-card {
  align-items: center;
  border-radius: 24px;
  display: grid;
  gap: 18px;
  grid-template-columns: 120px minmax(0, 1fr);
  padding: 18px;
}

.services-panel,
.receipts-panel {
  border-radius: 24px;
  display: grid;
  gap: 12px;
  padding: 16px;
}

.section-topline {
  align-items: end;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.section-topline > div {
  display: grid;
  gap: 4px;
}

.compact-line {
  margin-bottom: 2px;
}

.services-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.service-pill {
  align-items: center;
  border-radius: 20px;
  display: inline-grid;
  gap: 10px;
  grid-template-columns: 34px minmax(132px, 1fr) auto;
  min-height: 62px;
  padding: 10px 12px 10px 10px;
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

.service-pill[data-revealed='false'] .service-dot::after {
  background: #a9b4c1;
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
  border-radius: 22px;
  display: grid;
  gap: 14px;
  grid-template-columns: 54px minmax(0, 1fr) minmax(170px, auto);
  min-height: 116px;
  padding: 14px;
  position: relative;
}

.payment-card::before {
  background: rgba(var(--pa-primary-rgb), .14);
  border-radius: 999px;
  content: '';
  height: calc(100% - 34px);
  left: 40px;
  opacity: .42;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
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
  position: relative;
  width: 54px;
  z-index: 1;
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

.payment-card[data-revealed='false'] {
  background:
    linear-gradient(135deg, rgba(255,255,255,.96), rgba(248, 251, 253, .92));
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
  gap: 4px;
  justify-items: end;
  text-align: right;
}

.payment-amount strong {
  color: #1f2d46;
  font-family: var(--font-title);
  font-size: 1.25rem;
}

.receipt-list {
  display: grid;
}

.receipt-row {
  align-items: center;
  border-top: 1px solid #edf1f5;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto auto;
  padding: 12px 0;
}

.receipt-row:first-child {
  border-top: 0;
  padding-top: 0;
}

.receipt-row:last-child {
  padding-bottom: 0;
}

.receipt-row > div:nth-child(2) {
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
  .school-year-panel,
  .account-summary,
  .empty-ambassador-card,
  .payment-card,
  .receipt-row {
    grid-template-columns: 1fr;
  }

  .summary-hero,
  .service-pill {
    grid-template-columns: 1fr;
  }

  .payment-card::before {
    display: none;
  }

  .payment-amount,
  .receipt-row > div:nth-child(2) {
    justify-items: start;
    text-align: left;
  }

  .section-topline {
    align-items: start;
    flex-direction: column;
  }
}
</style>
