import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { clientJourney, REQUIRED_DOC_TYPES, STAGE_IMAGES } from "@/lib/process";
import { StatusBadge } from "@/components/status-badge";
import { ProgressBar } from "@/components/client/progress-bar";
import { StageLayout } from "@/components/client/stage-layout";
import { UploadForm } from "./upload-form";
import { SendDocumentsButton } from "./send-button";

export default async function DocumentosPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const label = (t: string) => DOCUMENT_TYPES.find((d) => d.value === t)?.label || t;
  const requiredDocs = ctx.client.documents.filter((d) => REQUIRED_DOC_TYPES.includes(d.type));
  const uploaded = new Set(requiredDocs.map((d) => d.type));
  const missing = REQUIRED_DOC_TYPES.filter((t) => !uploaded.has(t)).map(label);
  const status = ctx.client.application?.status;
  const decided = status === "APPROVED" || status === "REJECTED";
  const alreadySent = Boolean(ctx.client.application?.documentsSubmittedAt) || status === "IN_REVIEW" || status === "INFO_REQUESTED";
  const journey = clientJourney({
    study: ctx.client.study,
    application: ctx.client.application,
    documents: ctx.client.documents,
  });

  return (
    <div>
      <ProgressBar journey={journey} />
      <StageLayout
        image={STAGE_IMAGES.documentos}
        eyebrow="Expediente"
        title="Documentos de respaldo"
        why="Necesitamos comprobar tu identidad, domicilio e ingresos. Sube el archivo que tengas de cada uno (cualquier formato, máx. 10 MB) y envía el expediente cuando los tres requeridos estén listos."
        nextHint="Cuando los tres documentos estén listos, envía el expediente para revisión."
      >
        <div className="card p-5">
          <h2 className="font-bold mb-3">Documentos requeridos</h2>
          <ul className="grid gap-2">
            {REQUIRED_DOC_TYPES.map((type) => {
              const ok = uploaded.has(type);
              return (
                <li key={type} className="flex items-center gap-2 text-sm">
                  <span className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-black ${ok ? "bg-[#e8f5e9] text-[var(--ok)]" : "bg-[#fff6e9] text-[#7c5b2e]"}`}>
                    {ok ? "✓" : "!"}
                  </span>
                  <span>{label(type)}</span>
                  <span className="ml-auto text-xs text-[var(--muted)]">{ok ? "Cargado" : "Pendiente"}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <article className="card p-5">
            <h2 className="font-bold mb-3">Subir</h2>
            <UploadForm />
          </article>
          <article className="card p-5">
            <h2 className="font-bold mb-3">Expediente</h2>
            {requiredDocs.length === 0 && <p className="text-sm text-[var(--muted)]">Aún no hay documentos.</p>}
            {requiredDocs.map((d) => (
              <div key={d.id} className="py-3 border-b border-[var(--line)]">
                <b className="block text-sm">{label(d.type)}</b>
                <div className="text-xs text-[var(--muted)]">{d.originalName}</div>
                <StatusBadge status={d.status} />
                {(d.status === "NEEDS_CORRECTION" || d.status === "REJECTED") && d.comments && (
                  <div className="notice notice-gold mt-2 text-xs">Documento requiere corrección: {d.comments}</div>
                )}
              </div>
            ))}
          </article>
        </div>

        {!ctx.client.study?.submitted && (
          <div className="notice notice-gold">Primero envía tu estudio socioeconómico para poder entregar documentos a revisión.</div>
        )}
        {ctx.client.study?.submitted && !decided && (
          <div className="card p-5">
            <h2 className="font-bold mb-2">Enviar a revisión</h2>
            <p className="text-sm text-[var(--muted)] mb-3">
              Cuando los tres documentos requeridos estén cargados, envía el expediente. Subir un archivo por separado no inicia la revisión.
            </p>
            <SendDocumentsButton missing={missing} alreadySent={alreadySent} />
          </div>
        )}
      </StageLayout>
    </div>
  );
}
