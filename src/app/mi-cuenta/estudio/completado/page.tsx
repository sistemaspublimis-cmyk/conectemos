import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { clientJourney } from "@/lib/process";
import { ProgressBar } from "@/components/client/progress-bar";
import { EstudioResumen } from "../estudio-resumen";

export default async function EstudioCompletadoPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  if (!ctx.client.study?.submitted) redirect("/mi-cuenta/estudio");
  const journey = clientJourney({
    study: ctx.client.study,
    application: ctx.client.application,
    documents: ctx.client.documents,
  });

  return (
    <div>
      <ProgressBar journey={journey} />
      <EstudioResumen
        folio={ctx.client.folio}
        fullName={ctx.client.study.fullName}
        birthDate={ctx.client.study.birthDate}
        city={ctx.client.study.city}
        state={ctx.client.study.state}
        zip={ctx.client.study.zip}
        employmentType={ctx.client.study.employmentType}
        company={ctx.client.study.company}
        monthlyIncome={ctx.client.study.monthlyIncome}
        requestedAmount={ctx.client.study.requestedAmount ?? ctx.client.requestedAmount}
        termMonths={ctx.client.study.termMonths ?? ctx.client.termMonths}
        purpose={ctx.client.study.purpose || ctx.client.purpose}
        nextHref={
          ctx.client.application?.documentsSubmittedAt &&
          !ctx.client.documents.some((d) => d.status === "NEEDS_CORRECTION" || d.status === "REJECTED")
            ? "/mi-cuenta/solicitud"
            : "/mi-cuenta/documentos"
        }
        nextLabel={
          ctx.client.application?.documentsSubmittedAt &&
          !ctx.client.documents.some((d) => d.status === "NEEDS_CORRECTION" || d.status === "REJECTED")
            ? "Consultar solicitud"
            : ctx.client.documents.some((d) => d.status === "NEEDS_CORRECTION" || d.status === "REJECTED")
              ? "Corregir documentos"
              : "Continuar con documentos"
        }
      />
    </div>
  );
}
