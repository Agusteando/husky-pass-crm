import type { AppSessionUser } from '~/types/session'
import type { FamilyPaymentsResponse, PaymentItem, PaymentStatus } from '~/types/payments'
import type { AuthorizedChild } from '~/types/daycare'
import { getFamilyChildren } from '~/server/data/mysqlDaycare'

function todayIso() {
  return new Date().toISOString()
}

function sampleItems(child: AuthorizedChild | null): PaymentItem[] {
  const nivel = child?.nivelEdu || 'Escolar'
  return [
    {
      id: 'pay-taller-verano',
      title: 'Taller de verano',
      description: `Actividad extracurricular disponible para ${nivel}.`,
      category: 'taller',
      status: 'pending',
      amount: 1850,
      currency: 'MXN',
      dueDate: '2026-07-05',
      period: 'Verano 2026',
      actionLabel: 'Ver indicaciones'
    },
    {
      id: 'pay-estado-cuenta-junio',
      title: 'Estado de cuenta junio',
      description: 'Saldo regular del periodo actual.',
      category: 'colegiatura',
      status: 'paid',
      amount: 0,
      currency: 'MXN',
      dueDate: '2026-06-10',
      paidAt: '2026-06-08',
      period: 'Junio 2026',
      actionLabel: 'Comprobante registrado'
    },
    {
      id: 'pay-material-arte',
      title: 'Material de arte',
      description: 'Aviso informativo para compra coordinada por el plantel.',
      category: 'material',
      status: 'info',
      amount: null,
      currency: 'MXN',
      dueDate: null,
      period: 'Próximo ciclo',
      actionLabel: 'Pendiente de publicación'
    },
    {
      id: 'pay-recargo-actividad',
      title: 'Actividad pendiente de confirmar',
      description: 'Tu colegio validará si aplica este cargo antes de habilitar pago.',
      category: 'evento',
      status: 'overdue',
      amount: 420,
      currency: 'MXN',
      dueDate: '2026-06-15',
      period: 'Junio 2026',
      actionLabel: 'Contactar administración'
    }
  ]
}

function sumByStatus(items: PaymentItem[], status: PaymentStatus) {
  return items.filter((item) => item.status === status).reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

export async function getFamilyPayments(user: AppSessionUser): Promise<FamilyPaymentsResponse> {
  const children = await getFamilyChildren(user).catch(() => [] as AuthorizedChild[])
  const student = children.find((child) => child.isCurrent) || children[0] || null
  const items = sampleItems(student)
  const pendingItems = items.filter((item) => item.status === 'pending')
  const overdueItems = items.filter((item) => item.status === 'overdue')

  return {
    items,
    summary: {
      balanceDue: sumByStatus(items, 'pending') + sumByStatus(items, 'overdue'),
      paidThisCycle: items.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount || 0), 0),
      overdueCount: overdueItems.length,
      pendingCount: pendingItems.length,
      currency: 'MXN',
      lastUpdated: todayIso()
    },
    student,
    integration: {
      status: 'pending',
      label: 'Información preparada por el colegio'
    },
    state: items.length ? 'ready' : 'empty',
    message: items.length ? undefined : 'Cuando tu colegio publique conceptos de pago, aparecerán aquí.'
  }
}
