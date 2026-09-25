import { redirect } from "next/navigation";
import Link from "next/link";
import { getClientContext } from "@/lib/client-context";
import { formatMXN } from "@/lib/money";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";
import { StatusBadge } from "@/components/status-badge";
import { JourneyList } from "@/components/client/journey-list";
import { clientJourney, journeyInputFromClient, nextClientAction } from "@/lib/client-journey-fallback";

export default async function SolicitudPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const { client } = ctx;
  const status = client.application?.status || "STUDY_PENDING";
  const steps = clientJourney(journeyInputFromClient(client));
  const hasSolicitud = Boolean(client.study?.submitted) || (status !== "STUDY_PENDING" && status !== "DRAFT");
  if (!hasSolicitud) redirect("/mi-cuenta/estudio");
  const hasBadDocs = client.documents.some((d) => d.status === "NEEDS_CORRECTION" || d.status === "REJECTED");
  const next = nextClientAction({
    status,
    studySubmitted: Boolean(client.study?.submitted),
    docsCount: client.documents.length,
    offerPrepared: client.offer?.status === "PREPARED",
    documentsSubmitted: Boolean(client.application?.documentsSubmittedAt),
    hasBadDocs,
  });
  const corrections = client.documents.filter((d) => d.status === "NEEDS_CORRECTION" || d.status === "REJECTED").length;
  const shownAmount = Number(client.authorizedAmount || client.displayedAmount || 0);
  const lockedAmount = !(status === "APPROVED" && shownAmount > 0);

  return (
    <div className="client-home">
      <header className="client-home-hero fade-up">
        <div>
          <p className="client-kicker">Mi financiamiento</p>
          <h1>Tu crédito personal</h1>
          <p className="client-home-sub">
            Folio <b>{client.folio}</b> · {client.product}
          </p>
        </div>
        {client.application && <StatusBadge status={status} />}
      </header>

      <div className="client-home-grid">
        <article className={`balance-card fade-up delay-1 ${lockedAmount ? "is-locked" : "is-compact"}`}>
          <small>Tu financiamiento</small>
          {lockedAmount ? (
            <>
              <p className="balance-locked-copy">El monto se muestra cuando tu crédito queda autorizado.</p>
              <div className="balance-meta">
                <span>{APPLICATION_STATUS_LABEL[status] || status}</span>
              </div>
            </>
          ) : (
            <>
              <div className="balance-amount">{formatMXN(shownAmount)}</div>
              <div className="balance-meta">
                <span>{APPLICATION_STATUS_LABEL[status] || status}</span>
              </div>
            </>
          )}
          <div className="balance-actions">
            <Link href={next.href} className="btn btn-gold">
              {next.label}
            </Link>
          </div>
        </article>

        <article className="card p-5 fade-up delay-2 bank-card">
          <h2 className="client-section-title">Camino del trámite</h2>
          <p className="client-section-copy">Las etapas futuras se habilitan después de la aprobación o cuando correspondan.</p>
          <JourneyList steps={steps} />
        </article>
      </div>

      {status === "IN_REVIEW" && (
        <div className="notice notice-green fade-up">Tu expediente está en revisión. Te avisaremos en el panel cuando haya un resultado.</div>
      )}
      {status === "INFO_REQUESTED" && (
        <div className="notice notice-gold fade-up">{client.application?.infoRequest || "Se solicitó información adicional."}</div>
      )}
      {status === "REJECTED" && (
        <div className="notice notice-red fade-up">{client.application?.rejectReason || "La solicitud no fue aprobada."}</div>
      )}
      {status === "APPROVED" && (
        <div className="notice notice-green fade-up">Tu financiamiento fue aprobado. La oferta, el contrato y el desembolso se muestran cuando la financiera los registra.</div>
      )}

      <div className="kpi-lite fade-up delay-2">
        <article className="card p-4 bank-card">
          <b>{client.documents.length}</b>
          <span>Documentos cargados</span>
        </article>
        <article className="card p-4 bank-card">
          <b>{corrections}</b>
          <span>Requieren corrección</span>
        </article>
        <article className="card p-4 bank-card">
          <b>{client.study?.submitted ? "Listo" : "Pendiente"}</b>
          <span>Estudio socioeconómico</span>
        </article>
        <article className="card p-4 bank-card">
          <b>{APPLICATION_STATUS_LABEL[status] || status}</b>
          <span>Estatus actual</span>
        </article>
      </div>

      <div className="quick-grid fade-up delay-3">
        <Link href={next.href} className="quick-card bank-card is-primary">
          <b>{next.label}</b>
          <span>{next.description}</span>
        </Link>
        <Link href="/mi-cuenta/estudio" className="quick-card bank-card">
          <b>Estudio socioeconómico</b>
          <span>{client.study?.submitted ? "Enviado. Puedes consultar o actualizar si el proceso lo permite." : "Pendiente de completar."}</span>
        </Link>
        <Link href="/mi-cuenta/documentos" className="quick-card bank-card">
          <b>Expediente digital</b>
          <span>Identificación, comprobantes y archivos de tu trámite.</span>
        </Link>
      </div>
    </div>
  );
}
