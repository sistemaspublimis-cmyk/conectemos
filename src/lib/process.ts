import type { ApplicationStatus, DocumentType } from "@prisma/client";

export type StepKey =
  | "solicitud"
  | "estudio"
  | "documentos"
  | "revision"
  | "aprobacion";

export function processSteps(status: ApplicationStatus, studySubmitted: boolean, docsCount: number) {
  const steps: { key: StepKey; label: string; state: "done" | "active" | "pending" }[] = [
    { key: "solicitud", label: "Solicitud", state: "done" },
    {
      key: "estudio",
      label: "Estudio socioeconómico",
      state: studySubmitted ? "done" : "active",
    },
    {
      key: "documentos",
      label: "Documentos",
      state: !studySubmitted ? "pending" : docsCount > 0 ? "done" : "active",
    },
    {
      key: "revision",
      label: "Revisión",
      state:
        status === "IN_REVIEW" || status === "INFO_REQUESTED"
          ? "active"
          : status === "APPROVED" || status === "REJECTED"
            ? "done"
            : studySubmitted && docsCount > 0
              ? "active"
              : "pending",
    },
    {
      key: "aprobacion",
      label: "Aprobación",
      state: status === "APPROVED" ? "done" : status === "REJECTED" ? "done" : "pending",
    },
  ];
  return steps;
}

export function longProcessSteps(opts: {
  studySubmitted: boolean;
  docsCount: number;
  status: ApplicationStatus;
  hasOffer: boolean;
  contractPrepared: boolean;
  hasBank: boolean;
  disbursementStatus?: string | null;
}) {
  const valuationDone = ["IN_REVIEW", "INFO_REQUESTED", "APPROVED", "REJECTED"].includes(opts.status) && opts.docsCount > 0 && opts.studySubmitted;
  return [
    { label: "Estudio", state: opts.studySubmitted ? "done" : "active" },
    { label: "Documentos", state: opts.docsCount > 0 ? "done" : opts.studySubmitted ? "active" : "pending" },
    { label: "Valoración", state: opts.status === "APPROVED" || opts.status === "REJECTED" ? "done" : valuationDone ? "active" : "pending" },
    { label: "Plan y oferta", state: opts.hasOffer ? "done" : opts.status === "APPROVED" ? "active" : "pending" },
    { label: "Contrato", state: opts.contractPrepared ? "done" : opts.hasOffer ? "active" : "pending" },
    { label: "Datos bancarios", state: opts.hasBank ? "done" : opts.contractPrepared ? "active" : "pending" },
    { label: "Desembolso", state: opts.disbursementStatus === "REGISTERED" ? "done" : opts.hasBank ? "active" : "pending" },
  ] as { label: string; state: "done" | "active" | "pending" }[];
}

export const ONBOARDING_STEPS = [
  { key: "registro", label: "Registro", href: "/registro" },
  { key: "personal", label: "Datos personales", href: "/mi-cuenta/estudio" },
  { key: "laboral", label: "Información laboral", href: "/mi-cuenta/estudio" },
  { key: "ingresos", label: "Ingresos y gastos", href: "/mi-cuenta/estudio" },
  { key: "monto", label: "Monto", href: "/mi-cuenta/estudio" },
  { key: "estudio", label: "Estudio", href: "/mi-cuenta/estudio" },
  { key: "documentos", label: "Documentos", href: "/mi-cuenta/documentos" },
  { key: "revision", label: "Revisión", href: "/mi-cuenta/valoracion" },
  { key: "resultado", label: "Resultado y oferta", href: "/mi-cuenta/valoracion" },
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]["key"];

export const REQUIRED_DOC_TYPES: DocumentType[] = ["IDENTIFICATION", "ADDRESS_PROOF", "INCOME_PROOF"];

export const REVIEW_WINDOW_MS = 60 * 60 * 1000;

export const STAGE_IMAGES = {
  registro: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80",
  personal: "https://images.unsplash.com/photo-1600880292089-90a7b047ae24?auto=format&fit=crop&w=1400&q=80",
  laboral: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80",
  ingresos: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80",
  monto: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=80",
  situacion: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=80",
  documentos: "https://images.unsplash.com/photo-1568667256549-0940a446c93d?auto=format&fit=crop&w=1400&q=80",
  revision: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
} as const;

export function filled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object") {
    const asDecimal = value as { toNumber?: () => number; toString?: () => string };
    if (typeof asDecimal.toNumber === "function") {
      const n = asDecimal.toNumber();
      return Number.isFinite(n);
    }
    if (typeof asDecimal.toString === "function") {
      const s = asDecimal.toString();
      return s.trim().length > 0 && s !== "null" && s !== "undefined";
    }
  }
  return false;
}

function toNum(value: unknown): number {
  if (value == null || value === "") return NaN;
  if (typeof value === "number") return value;
  if (typeof value === "object") {
    const asDecimal = value as { toNumber?: () => number; toString?: () => string };
    if (typeof asDecimal.toNumber === "function") return asDecimal.toNumber();
    if (typeof asDecimal.toString === "function") return Number(asDecimal.toString());
  }
  return Number(value);
}

export type StudyLike = {
  submitted?: boolean | null;
  fullName?: string | null;
  birthDate?: string | null;
  address?: string | null;
  city?: string | null;
  employmentType?: string | null;
  company?: string | null;
  monthlyIncome?: unknown;
  monthlyExpenses?: unknown;
  housingExpense?: unknown;
  foodExpense?: unknown;
  utilitiesExpense?: unknown;
  transportExpense?: unknown;
  creditExpense?: unknown;
  otherExpense?: unknown;
  requestedAmount?: unknown;
  termMonths?: unknown;
  knowsBureau?: string | null;
  bureauStatus?: string | null;
  currentCredits?: string | null;
  autoCredits?: string | null;
  debts?: string | null;
  references?: string | null;
} | null;

export function studySectionsComplete(study: StudyLike) {
  const expenseFields = [
    study?.monthlyExpenses,
    study?.housingExpense,
    study?.foodExpense,
    study?.utilitiesExpense,
    study?.transportExpense,
    study?.creditExpense,
    study?.otherExpense,
  ];
  const hasExpense = expenseFields.some((v) => {
    if (!filled(v)) return false;
    const n = toNum(v);
    return Number.isFinite(n) ? n > 0 : true;
  });
  const amount = toNum(study?.requestedAmount);
  const term = toNum(study?.termMonths);
  const credits = String(study?.currentCredits || "").trim();
  const hasCredits = filled(credits);

  return {
    personal: filled(study?.fullName) && filled(study?.birthDate) && filled(study?.address) && filled(study?.city),
    laboral: filled(study?.employmentType) && filled(study?.company) && filled(study?.monthlyIncome) && toNum(study?.monthlyIncome) > 0,
    ingresos: filled(study?.monthlyIncome) && toNum(study?.monthlyIncome) > 0 && hasExpense,
    monto: Number.isFinite(amount) && amount > 0 && Number.isFinite(term) && term > 0,
    situacion: filled(study?.knowsBureau) && hasCredits,
  };
}

export type JourneyStepState = "done" | "active" | "pending";

export type JourneyStep = {
  key: OnboardingStepKey;
  label: string;
  state: JourneyStepState;
  locked?: boolean;
  hint?: string;
};

export type ClientJourney = {
  steps: JourneyStep[];
  currentIndex: number;
  percent: number;
  currentLabel: string;
  nextHref: string;
};

export type JourneyClient = {
  study?: StudyLike;
  application?: {
    status?: ApplicationStatus | string | null;
    documentsSubmittedAt?: Date | string | null;
    reviewStartedAt?: Date | string | null;
    updatedAt?: Date | string | null;
  } | null;
  documents?: { type?: string }[] | null;
} | null;

const DECIDED = new Set(["APPROVED", "REJECTED"]);
const REVIEWING = new Set(["IN_REVIEW", "INFO_REQUESTED"]);
const DOCS_DONE_STATUS = new Set(["IN_REVIEW", "APPROVED", "REJECTED", "INFO_REQUESTED"]);

export function clientJourney(client: JourneyClient): ClientJourney {
  const study = client?.study ?? null;
  const application = client?.application ?? null;
  const status = (application?.status || "STUDY_PENDING") as ApplicationStatus;
  const sections = studySectionsComplete(study);
  const studySubmitted = Boolean(study?.submitted);
  const documentsDone = Boolean(application?.documentsSubmittedAt) || DOCS_DONE_STATUS.has(status);

  const done: Record<OnboardingStepKey, boolean> = {
    registro: true,
    personal: sections.personal,
    laboral: sections.laboral,
    ingresos: sections.ingresos,
    monto: sections.monto,
    estudio: studySubmitted,
    documentos: documentsDone,
    revision: DECIDED.has(status),
    resultado: DECIDED.has(status),
  };

  const hints: Partial<Record<OnboardingStepKey, string>> = {
    personal: "Completa tu nombre, fecha de nacimiento, domicilio y ciudad.",
    laboral: "Indica empleo, empresa e ingreso mensual.",
    ingresos: "Registra tu ingreso y al menos un gasto mensual.",
    monto: "Elige un monto y un plazo para tu solicitud.",
    estudio: "Revisa el resumen y envía tu estudio socioeconómico.",
    documentos: "Carga identificación, comprobante de domicilio e ingresos.",
    revision: REVIEWING.has(status)
      ? "Estamos revisando tu solicitud."
      : "Envía tus documentos para iniciar la revisión.",
    resultado: "Aquí verás la decisión y, si aplica, tu oferta.",
  };

  const steps: JourneyStep[] = ONBOARDING_STEPS.map((meta) => {
    const isDone = done[meta.key];
    let state: JourneyStepState = isDone ? "done" : "pending";
    if (!isDone && meta.key === "revision" && REVIEWING.has(status)) state = "active";
    return {
      key: meta.key,
      label: meta.label,
      state,
      hint: isDone ? undefined : hints[meta.key],
    };
  });

  let currentIndex = steps.findIndex((s) => s.state !== "done");
  if (currentIndex < 0) currentIndex = steps.length - 1;

  steps.forEach((step, index) => {
    if (step.state === "done") {
      step.locked = false;
      return;
    }
    if (index === currentIndex && step.state !== "active") step.state = "active";
    if (index > currentIndex) {
      step.locked = true;
      if (step.key === "resultado" && !DECIDED.has(status)) {
        step.hint = "Pendiente de aprobación";
      }
    }
  });

  const doneCount = steps.filter((s) => s.state === "done").length;
  const percent = Math.round((doneCount / steps.length) * 100);
  const current = steps[currentIndex];
  const href = ONBOARDING_STEPS[currentIndex]?.href || "/mi-cuenta/estudio";

  return {
    steps,
    currentIndex,
    percent,
    currentLabel: current?.label || ONBOARDING_STEPS[0].label,
    nextHref: href,
  };
}
