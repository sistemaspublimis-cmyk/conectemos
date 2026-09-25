import type { ApplicationStatus } from "@prisma/client";
import * as processMod from "./process";

export type ClientJourneyInput = {
  status: ApplicationStatus;
  studySubmitted: boolean;
  docsCount: number;
  documentsSubmittedAt?: Date | null;
  hasOffer: boolean;
  offerPrepared: boolean;
  contractPrepared: boolean;
  hasBank: boolean;
  disbursementStatus?: string | null;
};

export type ClientJourneyStep = {
  key: string;
  label: string;
  state: "done" | "active" | "pending";
  hint: string;
};

function mark(state: ClientJourneyStep["state"], pendingHint: string, activeHint = "En proceso"): string {
  if (state === "done") return "Completado";
  if (state === "active") return activeHint;
  return pendingHint;
}

export function fallbackClientJourney(input: ClientJourneyInput): ClientJourneyStep[] {
  const status = input.status;
  const studyDone = input.studySubmitted;
  const docsDone = input.docsCount > 0 || Boolean(input.documentsSubmittedAt);
  const inReview = status === "IN_REVIEW" || status === "INFO_REQUESTED";
  const hasResult = status === "APPROVED" || status === "REJECTED";
  const offerDone = input.offerPrepared;
  const contractDone = input.contractPrepared;
  const disbursed = input.disbursementStatus === "REGISTERED";

  const estudioState: ClientJourneyStep["state"] = studyDone ? "done" : "active";
  const documentosState: ClientJourneyStep["state"] = docsDone ? "done" : studyDone ? "active" : "pending";
  const revisionState: ClientJourneyStep["state"] = hasResult
    ? "done"
    : inReview || (studyDone && docsDone)
      ? "active"
      : "pending";
  const resultadoState: ClientJourneyStep["state"] = hasResult ? "done" : "pending";
  const ofertaState: ClientJourneyStep["state"] = offerDone ? "done" : status === "APPROVED" ? "active" : "pending";
  const contratoState: ClientJourneyStep["state"] = contractDone ? "done" : offerDone ? "active" : "pending";
  const desembolsoState: ClientJourneyStep["state"] = disbursed
    ? "done"
    : contractDone || input.hasBank
      ? "active"
      : "pending";

  return [
    { key: "registro", label: "Registro", state: "done", hint: "Completado" },
    { key: "solicitud", label: "Solicitud", state: "done", hint: "Completado" },
    { key: "estudio", label: "Estudio", state: estudioState, hint: mark(estudioState, "Pendiente") },
    {
      key: "documentos",
      label: "Documentos",
      state: documentosState,
      hint: mark(documentosState, "Pendiente"),
    },
    {
      key: "revision",
      label: "Revisión",
      state: revisionState,
      hint: mark(revisionState, "No disponible todavía"),
    },
    {
      key: "resultado",
      label: "Resultado y oferta",
      state: offerDone || hasResult ? "done" : resultadoState === "pending" && ofertaState === "active" ? "active" : resultadoState,
      hint: hasResult
        ? status === "APPROVED"
          ? offerDone
            ? "Aprobada · oferta lista"
            : "Aprobada"
          : "Concluido"
        : mark(ofertaState === "active" ? "active" : "pending", inReview || (studyDone && docsDone) ? "Pendiente de aprobación" : "No disponible todavía"),
    },
    {
      key: "contrato",
      label: "Contrato",
      state: contratoState,
      hint: mark(contratoState, "Pendiente de aprobación"),
    },
    {
      key: "desembolso",
      label: "Desembolso",
      state: desembolsoState,
      hint: mark(desembolsoState, "Pendiente de aprobación"),
    },
  ];
}

type JourneyFn = (input: ClientJourneyInput) => ClientJourneyStep[];

export function clientJourney(input: ClientJourneyInput): ClientJourneyStep[] {
  const fromProcess = (processMod as Record<string, unknown>).clientJourney;
  if (typeof fromProcess === "function") {
    try {
      const result = (fromProcess as JourneyFn)(input);
      if (Array.isArray(result) && result.length > 0) return result;
    } catch {
      // process.clientJourney aún no coincide; usar helper local.
    }
  }
  return fallbackClientJourney(input);
}

export function nextClientAction(opts: {
  status: ApplicationStatus;
  studySubmitted: boolean;
  docsCount: number;
  offerPrepared: boolean;
  documentsSubmitted?: boolean;
  hasBadDocs?: boolean;
}): { href: string; label: string; description: string } {
  const { status, studySubmitted, docsCount, offerPrepared, documentsSubmitted, hasBadDocs } = opts;
  const docsSentClean = Boolean(documentsSubmitted) && !hasBadDocs;

  if (!studySubmitted || status === "STUDY_PENDING") {
    return {
      href: "/mi-cuenta/estudio",
      label: "Continuar estudio",
      description: "Completa tu estudio socioeconómico para seguir el trámite.",
    };
  }
  if (hasBadDocs) {
    return {
      href: "/mi-cuenta/documentos",
      label: "Corregir documentos",
      description: "Hay un comprobante que debes volver a cargar.",
    };
  }
  if (status === "INFO_REQUESTED") {
    return {
      href: "/mi-cuenta/documentos",
      label: "Atender información",
      description: "Se pidió información adicional en tu expediente.",
    };
  }
  if (!docsSentClean && (status === "DOCUMENTS_PENDING" || docsCount === 0 || status === "STUDY_COMPLETED")) {
    return {
      href: "/mi-cuenta/documentos",
      label: "Cargar documentos",
      description: "Sube tu identificación y comprobantes para continuar.",
    };
  }
  if (docsSentClean && (status === "IN_REVIEW" || status === "DOCUMENTS_PENDING" || status === "STUDY_COMPLETED")) {
    return {
      href: "/mi-cuenta/solicitud",
      label: "Consultar solicitud",
      description: "Tus documentos ya están en el expediente. Consulta el avance de tu solicitud.",
    };
  }
  if (status === "IN_REVIEW") {
    return {
      href: "/mi-cuenta/valoracion",
      label: "Consultar solicitud",
      description: "Tu solicitud está en revisión.",
    };
  }
  if (status === "APPROVED") {
    return {
      href: "/mi-cuenta/valoracion",
      label: offerPrepared ? "Ver resultado y oferta" : "Consultar solicitud",
      description: offerPrepared
        ? "Ya hay una oferta lista junto al resultado de tu solicitud."
        : "Tu solicitud fue aprobada.",
    };
  }
  if (status === "REJECTED") {
    return {
      href: "/mi-cuenta/valoracion",
      label: "Consultar solicitud",
      description: "Consulta el resultado de tu solicitud.",
    };
  }
  return {
    href: "/mi-cuenta/solicitud",
    label: "Consultar solicitud",
    description: "Consulta folio y estatus de tu trámite.",
  };
}

export function journeyInputFromClient(client: {
  application?: { status: ApplicationStatus; documentsSubmittedAt?: Date | null } | null;
  study?: { submitted?: boolean | null } | null;
  documents: { id: string }[];
  offer?: { status: string } | null;
  contract?: { status: string } | null;
  bankDetails?: unknown;
  disbursement?: { status: string } | null;
}): ClientJourneyInput {
  return {
    status: client.application?.status || "STUDY_PENDING",
    studySubmitted: Boolean(client.study?.submitted),
    docsCount: client.documents.length,
    documentsSubmittedAt: client.application?.documentsSubmittedAt ?? null,
    hasOffer: Boolean(client.offer),
    offerPrepared: client.offer?.status === "PREPARED",
    contractPrepared: client.contract?.status === "PREPARED",
    hasBank: Boolean(client.bankDetails),
    disbursementStatus: client.disbursement?.status ?? null,
  };
}
