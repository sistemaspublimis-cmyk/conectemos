import Link from "next/link";
import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { formatMXN } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";
import { PendingNotice } from "@/components/pending-notice";
import { ProgressBar } from "@/components/client/progress-bar";
import { StageLayout } from "@/components/client/stage-layout";
import { CountdownRing } from "@/components/client/countdown-ring";
import { clientJourney, STAGE_IMAGES } from "@/lib/process";

const LOCKED_STAGES = ["Contrato", "Desembolso"];

export default async function ValoracionPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const application = ctx.client.application;
  const status = application?.status;
  const inReview = status === "IN_REVIEW" || status === "INFO_REQUESTED";
  const decided = status === "APPROVED" || status === "REJECTED";
  const studyOk = Boolean(ctx.client.study?.submitted);
  const docsSent = Boolean(application?.documentsSubmittedAt) || inReview || decided;
  const journey = clientJourney({
    study: ctx.client.study,
    application,
    documents: ctx.client.documents,
  });

  const startedAt =
    application?.reviewStartedAt?.toISOString() ||
    (status === "IN_REVIEW" ? application?.updatedAt?.toISOString() : undefined);

  return (
    <div>
      <ProgressBar journey={journey} />
      <StageLayout
        image={STAGE_IMAGES.revision}
        eyebrow="Resultado y oferta"
        title={
          status === "APPROVED"
            ? "Resultado y oferta"
            : status === "REJECTED"
              ? "Resultado de tu solicitud"
              : inReview
                ? "Estamos revisando tu solicitud"
                : "Resultado y oferta"
        }
        why={
          status === "APPROVED"
            ? "El equipo registró una aprobación en tu expediente. Ya puedes consultar tu cuenta digital y el fondo de ahorro."
            : status === "REJECTED"
              ? "El resultado corresponde a la decisión registrada por el equipo."
              : inReview
                ? "Un asesor revisa tu estudio y documentos. El temporizador es una ventana de revisión de una hora; al concluir se confirma la autorización si no hay una decisión previa."
                : "Cuando envíes estudio y documentos, aquí verás el avance de la revisión."
        }
        nextHint={
          decided
            ? undefined
            : inReview
              ? "Oferta, contrato y desembolso permanecen bloqueados hasta que exista una decisión."
              : "Completa el estudio y envía los documentos requeridos para iniciar la revisión."
        }
      >
        <article className="card p-6 md:p-8 text-center">
          {status === "APPROVED" && (
            <div className="notice notice-green text-left">
              <b>Solicitud aprobada.</b>
              <div className="mt-1">Tu crédito quedó autorizado. Revisa tu cuenta digital y el fondo de ahorro.</div>
            </div>
          )}
          {status === "REJECTED" && (
            <div className="notice notice-red text-left">
              <b>Solicitud rechazada.</b>
              <div className="mt-1">{application?.rejectReason || "El equipo registró un rechazo en tu expediente."}</div>
            </div>
          )}
          {inReview && (
            <>
              <h2 className="text-[var(--verde2)] font-black text-xl">Estamos revisando tu solicitud</h2>
              <p className="text-sm text-[var(--muted)] mt-2 mb-5">
                Nuestro equipo está evaluando tu información. Te notificaremos en el panel cuando exista un resultado.
              </p>
              {startedAt ? <CountdownRing startedAt={startedAt} /> : <p className="text-sm text-[var(--muted)]">La revisión ya está en curso.</p>}
              {status === "INFO_REQUESTED" && application?.infoRequest && (
                <div className="notice notice-gold text-left mt-5">{application.infoRequest}</div>
              )}
            </>
          )}
          {!inReview && !decided && (
            <PendingNotice title="Aún no inicia la revisión">
              {!studyOk ? (
                <>
                  Completa y envía tu estudio socioeconómico.{" "}
                  <Link href="/mi-cuenta/estudio" className="underline font-bold">
                    Ir al estudio
                  </Link>
                </>
              ) : !docsSent ? (
                <>
                  Carga los documentos requeridos y pulsa Enviar documentos.{" "}
                  <Link href="/mi-cuenta/documentos" className="underline font-bold">
                    Ir a documentos
                  </Link>
                </>
              ) : (
                "Pendiente de completar el estudio y los documentos para entrar en revisión."
              )}
            </PendingNotice>
          )}
          {application && (
            <div className="mt-4">
              <StatusBadge status={application.status} />
            </div>
          )}
        </article>

        {status === "APPROVED" && (
          <article className="card p-5">
            <p className="client-kicker">Oferta</p>
            {ctx.client.offer?.status === "PREPARED" ? (
              <>
                <div className="text-sm text-[var(--muted)]">Monto de oferta</div>
                <div className="money text-3xl">{formatMXN(ctx.client.offer.amount)}</div>
                <p className="text-sm mt-2">Plazo: {ctx.client.offer.termMonths || "—"} meses</p>
                <p className="text-sm">Tasa: {ctx.client.offer.rate || "—"}</p>
                {ctx.client.offer.notes && <p className="text-sm mt-2">{ctx.client.offer.notes}</p>}
              </>
            ) : (
              <p className="text-sm text-[var(--muted)] m-0">Tu solicitud ya tiene resultado. La oferta aparece aquí cuando el equipo la deje lista.</p>
            )}
          </article>
        )}

        {!decided && (
          <div className="grid md:grid-cols-3 gap-3">
            {LOCKED_STAGES.map((stage) => (
              <div key={stage} className="card p-4 opacity-80">
                <b className="block text-[var(--verde2)]">{stage}</b>
                <p className="text-sm mt-1">No disponible todavía</p>
                <p className="text-xs text-[var(--muted)] mt-1">Pendiente de aprobación</p>
              </div>
            ))}
          </div>
        )}
      </StageLayout>
    </div>
  );
}
