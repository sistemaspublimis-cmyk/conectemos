import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { clientJourney } from "@/lib/process";
import { ProgressBar } from "@/components/client/progress-bar";
import { EstudioForm } from "./estudio-form";
import { EstudioResumen } from "./estudio-resumen";

export default async function EstudioPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const s = ctx.client.study;
  const journey = clientJourney({
    study: s,
    application: ctx.client.application,
    documents: ctx.client.documents,
  });
  if (s?.submitted) {
    const docsSent = Boolean(ctx.client.application?.documentsSubmittedAt);
    const hasBadDocs = ctx.client.documents.some((d) => d.status === "NEEDS_CORRECTION" || d.status === "REJECTED");
    const docsReady = docsSent && !hasBadDocs;
    return (
      <div>
        <ProgressBar journey={journey} />
        <EstudioResumen
          folio={ctx.client.folio}
          fullName={s.fullName}
          birthDate={s.birthDate}
          city={s.city}
          state={s.state}
          zip={s.zip}
          employmentType={s.employmentType}
          company={s.company}
          monthlyIncome={s.monthlyIncome}
          requestedAmount={s.requestedAmount ?? ctx.client.requestedAmount}
          termMonths={s.termMonths ?? ctx.client.termMonths}
          purpose={s.purpose || ctx.client.purpose}
          nextHref={docsReady ? "/mi-cuenta/solicitud" : "/mi-cuenta/documentos"}
          nextLabel={docsReady ? "Consultar solicitud" : hasBadDocs ? "Corregir documentos" : "Continuar con documentos"}
        />
      </div>
    );
  }
  return (
    <div>
      <ProgressBar journey={journey} />
      <EstudioForm
        submitted={Boolean(s?.submitted)}
        initial={{
          fullName: s?.fullName,
          birthDate: s?.birthDate,
          maritalStatus: s?.maritalStatus,
          dependents: s?.dependents,
          address: s?.address,
          neighborhood: s?.neighborhood,
          city: s?.city,
          state: s?.state,
          zip: s?.zip,
          housingType: s?.housingType,
          employmentType: s?.employmentType,
          company: s?.company,
          position: s?.position,
          seniority: s?.seniority,
          monthlyIncome: s?.monthlyIncome != null ? Number(s.monthlyIncome) : "",
          otherIncome: s?.otherIncome != null ? Number(s.otherIncome) : "",
          monthlyExpenses: s?.monthlyExpenses != null ? Number(s.monthlyExpenses) : "",
          housingExpense: s?.housingExpense != null ? Number(s.housingExpense) : "",
          foodExpense: s?.foodExpense != null ? Number(s.foodExpense) : "",
          utilitiesExpense: s?.utilitiesExpense != null ? Number(s.utilitiesExpense) : "",
          transportExpense: s?.transportExpense != null ? Number(s.transportExpense) : "",
          creditExpense: s?.creditExpense != null ? Number(s.creditExpense) : "",
          otherExpense: s?.otherExpense != null ? Number(s.otherExpense) : "",
          currentCredits: s?.currentCredits,
          autoCredits: s?.autoCredits,
          knowsBureau: s?.knowsBureau,
          bureauStatus: s?.bureauStatus,
          debts: s?.debts,
          references: s?.references,
          requestedAmount: s?.requestedAmount != null ? Number(s.requestedAmount) : "",
          termMonths: s?.termMonths,
          purpose: s?.purpose,
        }}
      />
    </div>
  );
}
