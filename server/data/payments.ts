import { $fetch, type FetchError } from "ofetch";
import { useRuntimeConfig } from "nitropack/runtime";
import type { AppSessionUser } from "~/types/session";
import type {
  FamilyPaymentsResponse,
  PaymentCategory,
  PaymentIntegrationStatus,
  PaymentItem,
  PaymentReceipt,
  PaymentSchoolYear,
  PaymentServiceBadge,
  PaymentStatus,
} from "~/types/payments";
import type { AuthorizedChild } from "~/types/daycare";
import { getFamilyChildren } from "~/server/data/mysqlDaycare";
import { logEvent } from "~/server/utils/logger";
import { normalizeMatricula } from "~/utils/matricula";

type AuroraConceptStatus = "pending" | "paid" | "overdue";
type AuroraAccount = {
  ok?: boolean;
  matricula?: string;
  ciclo?: { clave?: string | null; nombre?: string | null };
  alumno?: {
    nombre?: string | null;
    plantel?: string | null;
    nivel?: string | null;
    grado?: string | null;
    grupo?: string | null;
    activo?: boolean;
  };
  saldos?: {
    moneda?: "MXN";
    totalCargos?: number;
    pendiente?: number;
    vencido?: number;
    pagadoCiclo?: number;
    pendienteConciliacion?: number;
  };
  conteos?: {
    pendientes?: number;
    vencidos?: number;
    pagados?: number;
    recibos?: number;
    servicios?: number;
  };
  conceptos?: Array<{
    id?: string | number;
    documento?: number | null;
    conceptoNombre?: string | null;
    titulo?: string | null;
    descripcion?: string | null;
    categoria?: string | null;
    periodo?: string | null;
    fechaLimite?: string | null;
    estatus?: AuroraConceptStatus | string | null;
    monto?: number | null;
    pagado?: number | null;
    saldo?: number | null;
    pendienteConciliacion?: number | null;
    pagadoEn?: string | null;
    recibos?: number[];
    servicio?: {
      clave?: string | null;
      nombre?: string | null;
      imagen?: string | null;
      estado?: string | null;
    } | null;
  }>;
  recibos?: Array<{
    folio?: number | null;
    folioPlantel?: string | null;
    conceptoNombre?: string | null;
    periodo?: string | null;
    monto?: number | null;
    fecha?: string | null;
    formaDePago?: string | null;
    saldoDespues?: number | null;
    otroPlantel?: boolean;
    plantelPago?: string | null;
  }>;
  servicios?: Array<{
    clave?: string | null;
    nombre?: string | null;
    imagen?: string | null;
    estado?: "pagado" | "pendiente" | "activo" | string | null;
    paidAt?: string | null;
    folios?: number[];
  }>;
  ciclos?: Array<{
    clave?: string | number | null;
    nombre?: string | null;
    actual?: boolean | number | null;
    seleccionado?: boolean | number | null;
    conMovimientos?: boolean | number | null;
  }>;
  consultadoEn?: string;
  fuente?: { tipo?: string; agentId?: string | null };
};

type AuroraRuntimeConfig = {
  aurora?: {
    apiBaseUrl?: string;
    apiToken?: string;
    timeoutMs?: number | string;
    ciclo?: string;
  };
};

function todayIso() {
  return new Date().toISOString();
}

function deriveCurrentCycle() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());
  const year = Number(
    parts.find((part) => part.type === "year")?.value ||
      new Date().getFullYear(),
  );
  const month = Number(
    parts.find((part) => part.type === "month")?.value ||
      new Date().getMonth() + 1,
  );
  return String(month >= 9 ? year : year - 1);
}

function normalizeCycle(value: unknown, fallback = deriveCurrentCycle()) {
  const raw = Array.isArray(value) ? value[0] : value;
  const match = String(raw ?? "")
    .trim()
    .match(/\d{4}/);
  return match?.[0] || fallback;
}

function formatCycleLabel(value: unknown) {
  const key = normalizeCycle(value);
  return `${key}-${Number(key) + 1}`;
}

function fallbackSchoolYears(
  selectedCycle = deriveCurrentCycle(),
): PaymentSchoolYear[] {
  const key = normalizeCycle(selectedCycle);
  return [
    {
      key,
      label: formatCycleLabel(key),
      isCurrent: key === deriveCurrentCycle(),
      isSelected: true,
      hasData: false,
    },
  ];
}

function config(selectedCycle?: string) {
  const runtime = useRuntimeConfig() as unknown as AuroraRuntimeConfig;
  return {
    baseURL: String(
      runtime.aurora?.apiBaseUrl ||
        process.env.AURORA_API_BASE_URL ||
        process.env.HUSKY_PASS_AURORA_API_BASE_URL ||
        "",
    )
      .trim()
      .replace(/\/+$/, ""),
    token: String(
      runtime.aurora?.apiToken ||
        process.env.AURORA_API_TOKEN ||
        process.env.HUSKY_PASS_AURORA_API_TOKEN ||
        "",
    ).trim(),
    timeout: Number(
      runtime.aurora?.timeoutMs ||
        process.env.AURORA_API_TIMEOUT_MS ||
        process.env.HUSKY_PASS_AURORA_TIMEOUT_MS ||
        10000,
    ),
    ciclo: normalizeCycle(
      selectedCycle ||
        runtime.aurora?.ciclo ||
        process.env.AURORA_CICLO ||
        process.env.HUSKY_PASS_AURORA_CICLO ||
        deriveCurrentCycle(),
    ),
  };
}

function emptyResponse({
  student,
  state,
  status,
  label,
  message,
  selectedCycle,
}: {
  student: AuthorizedChild | null;
  state: FamilyPaymentsResponse["state"];
  status: PaymentIntegrationStatus;
  label: string;
  message?: string;
  selectedCycle?: string;
}): FamilyPaymentsResponse {
  const cycleKey = normalizeCycle(selectedCycle);
  return {
    items: [],
    receipts: [],
    services: [],
    summary: {
      balanceDue: 0,
      paidThisCycle: 0,
      totalCharges: 0,
      overdueBalance: 0,
      overdueCount: 0,
      pendingCount: 0,
      receiptCount: 0,
      serviceCount: 0,
      pendingConciliation: 0,
      currency: "MXN",
      cycleKey,
      cycleLabel: formatCycleLabel(cycleKey),
      lastUpdated: todayIso(),
    },
    student,
    schoolYears: fallbackSchoolYears(cycleKey),
    integration: {
      status,
      label,
    },
    state,
    message,
  };
}

function toNumber(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : 0;
}

function paymentStatus(value: unknown): PaymentStatus {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "paid") return "paid";
  if (normalized === "overdue") return "overdue";
  if (normalized === "pending") return "pending";
  return "info";
}

function paymentCategory(value: unknown): PaymentCategory {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "taller_servicio" || normalized === "taller")
    return "taller";
  if (normalized === "servicio") return "servicio";
  if (normalized === "colegiatura") return "colegiatura";
  if (normalized === "material") return "material";
  if (normalized === "evento") return "evento";
  return "informativo";
}

function serviceState(value: unknown): PaymentServiceBadge["estado"] {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "pagado") return "pagado";
  if (normalized === "pendiente") return "pendiente";
  return "activo";
}

function mapService(
  raw:
    | NonNullable<AuroraAccount["servicios"]>[number]
    | NonNullable<NonNullable<AuroraAccount["conceptos"]>[number]["servicio"]>,
): PaymentServiceBadge | null {
  const name = String(raw?.nombre || "").trim();
  if (!name) return null;
  return {
    clave: raw?.clave || null,
    nombre: name,
    imagen: raw?.imagen || null,
    estado: serviceState(raw?.estado),
    paidAt: "paidAt" in raw ? raw.paidAt || null : null,
    folios:
      "folios" in raw && Array.isArray(raw.folios)
        ? raw.folios.map(Number).filter(Boolean)
        : [],
  };
}

function mapSchoolYear(
  raw: NonNullable<AuroraAccount["ciclos"]>[number],
  selectedCycle: string,
): PaymentSchoolYear | null {
  const key = normalizeCycle(raw.clave, "");
  if (!key) return null;
  return {
    key,
    label: String(raw.nombre || formatCycleLabel(key)).trim(),
    isCurrent: raw.actual === true || raw.actual === 1,
    isSelected:
      raw.seleccionado === true ||
      raw.seleccionado === 1 ||
      key === selectedCycle,
    hasData: raw.conMovimientos === true || raw.conMovimientos === 1,
  };
}

function mapReceipt(
  raw: NonNullable<AuroraAccount["recibos"]>[number],
): PaymentReceipt | null {
  const folio = Number(raw.folio || 0);
  if (!folio) return null;
  return {
    folio,
    folioPlantel: raw.folioPlantel || null,
    title: String(raw.conceptoNombre || "Pago registrado").trim(),
    period: raw.periodo || null,
    amount: toNumber(raw.monto),
    currency: "MXN",
    paidAt: raw.fecha || null,
    paymentMethod: raw.formaDePago || null,
    balanceAfter: raw.saldoDespues == null ? null : toNumber(raw.saldoDespues),
    otherCampus: Boolean(raw.otroPlantel),
    campusPaid: raw.plantelPago || null,
  };
}

function mapConcept(
  raw: NonNullable<AuroraAccount["conceptos"]>[number],
): PaymentItem {
  const status = paymentStatus(raw.estatus);
  const balance = toNumber(raw.saldo);
  const service = raw.servicio ? mapService(raw.servicio) : null;
  const title = String(
    raw.titulo || raw.conceptoNombre || "Concepto escolar",
  ).trim();
  const paidAmount = toNumber(raw.pagado);
  return {
    id: String(
      raw.id || `${raw.documento || "concepto"}-${raw.periodo || title}`,
    ),
    title,
    description: String(
      raw.descripcion ||
        service?.nombre ||
        (status === "paid"
          ? "Cubierto en Aurora."
          : "Cargo registrado en Aurora."),
    ).trim(),
    category: paymentCategory(raw.categoria),
    status,
    amount: toNumber(raw.monto),
    paidAmount,
    balance,
    currency: "MXN",
    dueDate: raw.fechaLimite || null,
    paidAt: raw.pagadoEn || null,
    period: raw.periodo || null,
    receiptFolios: Array.isArray(raw.recibos)
      ? raw.recibos.map(Number).filter(Boolean)
      : [],
    service,
    actionLabel:
      status === "paid"
        ? raw.recibos?.length
          ? `Recibo ${raw.recibos.join(", ")}`
          : "Pagado"
        : balance > 0
          ? "Pendiente en Aurora"
          : "Registrado",
  };
}

async function fetchAuroraAccount(
  matricula: string,
  selectedCycle?: string,
): Promise<AuroraAccount> {
  const aurora = config(selectedCycle);
  if (!aurora.baseURL || !aurora.token) {
    const missing = !aurora.baseURL ? "baseURL" : "token";
    throw Object.assign(
      new Error("Aurora no está configurado para Husky Pass."),
      { code: "AURORA_CONFIG_MISSING", missing },
    );
  }

  return await $fetch<AuroraAccount>("/api/external/v1/husky-pass/account", {
    baseURL: aurora.baseURL,
    timeout:
      Number.isFinite(aurora.timeout) && aurora.timeout > 0
        ? aurora.timeout
        : 10000,
    headers: {
      Authorization: `Bearer ${aurora.token}`,
      "x-husky-pass-client": "family-payments",
    },
    query: {
      matricula,
      ciclo: aurora.ciclo,
    },
  });
}

function childFromAurora(
  student: AuthorizedChild | null,
  account: AuroraAccount,
): AuthorizedChild | null {
  if (!account.alumno) return student;
  const [paternoA, maternoA, ...rest] = String(account.alumno.nombre || "")
    .split(" ")
    .filter(Boolean);
  return {
    ...student,
    paternoA: student?.paternoA || paternoA || null,
    maternoA: student?.maternoA || maternoA || null,
    nombreA:
      student?.nombreA ||
      (rest.length ? rest.join(" ") : account.alumno.nombre) ||
      null,
    grupo: student?.grupo || account.alumno.grupo || null,
    grado: student?.grado || account.alumno.grado || null,
    nivelEdu: student?.nivelEdu || account.alumno.nivel || null,
    campus: student?.campus || account.alumno.plantel || null,
    plantel: student?.plantel || account.alumno.plantel || null,
    matricula:
      normalizeMatricula(account.matricula || student?.matricula) || null,
    isCurrent: student?.isCurrent ?? true,
  };
}

export async function getFamilyPayments(
  user: AppSessionUser,
  options: { ciclo?: string } = {},
): Promise<FamilyPaymentsResponse> {
  const children = await getFamilyChildren(user).catch(
    () => [] as AuthorizedChild[],
  );
  const student =
    children.find((child) => child.isCurrent) || children[0] || null;
  const matricula = normalizeMatricula(student?.matricula || user.username);
  const selectedCycle = normalizeCycle(options.ciclo);

  if (!matricula) {
    return emptyResponse({
      student,
      state: "unavailable",
      status: "unavailable",
      label: "Aurora",
      message: "La cuenta familiar no tiene una matrícula vinculada.",
      selectedCycle,
    });
  }

  try {
    const account = await fetchAuroraAccount(matricula, selectedCycle);
    const items = (account.conceptos || []).map(mapConcept);
    const receipts = (account.recibos || [])
      .map(mapReceipt)
      .filter(Boolean) as PaymentReceipt[];
    const services = (account.servicios || [])
      .map(mapService)
      .filter(Boolean) as PaymentServiceBadge[];
    const schoolYears = (account.ciclos || [])
      .map((year) => mapSchoolYear(year, selectedCycle))
      .filter(Boolean) as PaymentSchoolYear[];
    const responseStudent = childFromAurora(student, account);
    const sourceLabel = account.fuente?.agentId
      ? `Aurora · ${account.fuente.agentId}`
      : "Aurora";

    return {
      items,
      receipts,
      services,
      summary: {
        balanceDue: toNumber(account.saldos?.pendiente),
        paidThisCycle: toNumber(account.saldos?.pagadoCiclo),
        totalCharges: toNumber(account.saldos?.totalCargos),
        overdueBalance: toNumber(account.saldos?.vencido),
        overdueCount: Number(
          account.conteos?.vencidos ||
            items.filter((item) => item.status === "overdue").length,
        ),
        pendingCount: Number(
          account.conteos?.pendientes ||
            items.filter((item) => item.status === "pending").length,
        ),
        receiptCount: Number(account.conteos?.recibos || receipts.length),
        serviceCount: Number(account.conteos?.servicios || services.length),
        pendingConciliation: toNumber(account.saldos?.pendienteConciliacion),
        currency: "MXN",
        cycleKey: account.ciclo?.clave || selectedCycle,
        cycleLabel:
          account.ciclo?.nombre ||
          formatCycleLabel(account.ciclo?.clave || selectedCycle),
        lastUpdated: account.consultadoEn || todayIso(),
      },
      student: responseStudent,
      schoolYears: schoolYears.length
        ? schoolYears
        : fallbackSchoolYears(account.ciclo?.clave || selectedCycle),
      integration: {
        status: "ready",
        label: sourceLabel,
        source: account.fuente?.tipo || null,
      },
      state:
        items.length || receipts.length || services.length ? "ready" : "empty",
      message:
        items.length || receipts.length || services.length
          ? undefined
          : "Aurora no tiene cargos ni recibos publicados para esta matrícula.",
    };
  } catch (error: unknown) {
    const fetchError = error as FetchError & {
      code?: string;
      missing?: string;
    };
    logEvent("warn", "family.payments.aurora-unavailable", {
      userId: user.id,
      matricula,
      statusCode: fetchError.statusCode,
      code: fetchError.code,
      missing: fetchError.missing,
    });
    return emptyResponse({
      student,
      state: "unavailable",
      status: "unavailable",
      label: "Aurora no disponible",
      message:
        fetchError.statusCode === 404
          ? "Aurora no encontró esta matrícula en el sistema de ingresos."
          : "Aurora no respondió con el estado de cuenta en este momento.",
      selectedCycle,
    });
  }
}
