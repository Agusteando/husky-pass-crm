import type { AuthorizedChild } from "~/types/daycare";

export type PaymentStatus = "pending" | "paid" | "overdue" | "info";
export type PaymentCategory =
  "taller" | "servicio" | "colegiatura" | "material" | "evento" | "informativo";
export type PaymentIntegrationStatus = "ready" | "pending" | "unavailable";

export interface PaymentSchoolYear {
  key: string;
  label: string;
  isCurrent: boolean;
  isSelected: boolean;
  hasData: boolean;
}

export interface PaymentServiceBadge {
  clave?: string | null;
  nombre: string;
  imagen?: string | null;
  estado: "pagado" | "pendiente" | "activo";
  paidAt?: string | null;
  folios?: number[];
}

export interface PaymentReceipt {
  folio: number;
  folioPlantel?: string | null;
  title: string;
  period?: string | null;
  amount: number;
  currency: "MXN";
  paidAt?: string | null;
  paymentMethod?: string | null;
  balanceAfter?: number | null;
  otherCampus?: boolean;
  campusPaid?: string | null;
}

export interface PaymentItem {
  id: string;
  title: string;
  description: string;
  category: PaymentCategory;
  status: PaymentStatus;
  amount?: number | null;
  paidAmount?: number | null;
  balance?: number | null;
  currency: "MXN";
  dueDate?: string | null;
  paidAt?: string | null;
  period?: string | null;
  receiptFolios?: number[];
  service?: PaymentServiceBadge | null;
  actionLabel?: string | null;
}

export interface PaymentAccountSummary {
  balanceDue: number;
  paidThisCycle: number;
  totalCharges: number;
  overdueBalance: number;
  overdueCount: number;
  pendingCount: number;
  receiptCount: number;
  serviceCount: number;
  pendingConciliation: number;
  currency: "MXN";
  cycleKey?: string | null;
  cycleLabel?: string | null;
  lastUpdated: string;
}

export interface FamilyPaymentsResponse {
  items: PaymentItem[];
  receipts: PaymentReceipt[];
  services: PaymentServiceBadge[];
  schoolYears: PaymentSchoolYear[];
  summary: PaymentAccountSummary;
  student: AuthorizedChild | null;
  integration: {
    status: PaymentIntegrationStatus;
    label: string;
    source?: string | null;
  };
  state: "ready" | "empty" | "unavailable";
  message?: string;
}
