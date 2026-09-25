import {
  APPLICATION_STATUS_LABEL,
  DOCUMENT_STATUS_LABEL,
  USER_STATUS_LABEL,
  DELIVERY_STATUS_LABEL,
  DISBURSEMENT_STATUS_LABEL,
  CLIENT_PRODUCT_STATUS_LABEL,
  SAVINGS_STATUS_LABEL,
} from "@/lib/constants";

const MAP: Record<string, string> = {
  APPROVED: "badge-green",
  ACTIVE: "badge-green",
  SENT: "badge-green",
  RECEIVED: "badge-green",
  REGISTERED: "badge-green",
  IN_REVIEW: "badge-orange",
  INFO_REQUESTED: "badge-orange",
  DOCUMENTS_PENDING: "badge-orange",
  STUDY_PENDING: "badge-orange",
  STUDY_COMPLETED: "badge-blue",
  PENDING: "badge-orange",
  PREPARED: "badge-gold",
  NEEDS_CORRECTION: "badge-orange",
  REJECTED: "badge-red",
  ERROR: "badge-red",
  BLOCKED: "badge-red",
  DISABLED: "badge-gray",
  CANCELLED: "badge-gray",
  DRAFT: "badge-gray",
  CONTRACTED: "badge-green",
  AVAILABLE: "badge-blue",
  UNAVAILABLE: "badge-gray",
  TEMPORARY: "badge-gold",
  VALIDATING: "badge-orange",
  VALIDATED: "badge-green",
  PAID: "badge-green",
};

const LABELS: Record<string, string> = {
  ...APPLICATION_STATUS_LABEL,
  ...DOCUMENT_STATUS_LABEL,
  ...USER_STATUS_LABEL,
  ...DELIVERY_STATUS_LABEL,
  ...DISBURSEMENT_STATUS_LABEL,
  ...CLIENT_PRODUCT_STATUS_LABEL,
  ...SAVINGS_STATUS_LABEL,
  TEMPORARY: "Temporal",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = MAP[status] || "badge-blue";
  return <span className={`badge ${cls}`}>{LABELS[status] || status}</span>;
}

export function DemoBadge({ show }: { show?: boolean }) {
  void show;
  return null;
}
