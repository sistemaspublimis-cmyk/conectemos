import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { DEFAULT_CONTRACT_TEMPLATE, fillContractTemplate, contractVarsFromClient } from "@/lib/contract-template";
import { ContratoView } from "./contrato-view";

export default async function ContratoPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const { client } = ctx;
  const approved = client.application?.status === "APPROVED";
  const official = client.contract?.status === "PREPARED" || client.contract?.status === "PENDING_SIGNATURE";
  const template = client.contract?.body || DEFAULT_CONTRACT_TEMPLATE;
  const filledBody = fillContractTemplate(template, contractVarsFromClient(client));
  const pdfs = client.generatedDocs
    .filter((d) => d.type === "contrato")
    .map((d) => ({ id: d.id, fileName: d.fileName }));

  return (
    <div>
      <h1 className="text-2xl font-black text-[var(--verde2)] m-0">Contrato</h1>
      <p className="text-sm text-[var(--muted)] mt-1 mb-4">
        {approved
          ? "Consulta tu contrato con los datos de tu expediente."
          : "Revisa el contrato con los datos de tu expediente. La firma se habilita cuando tu crédito queda aprobado."}
      </p>
      <ContratoView
        filledBody={filledBody}
        isOfficial={Boolean(official && approved)}
        pdfs={pdfs}
        signatureDraftAt={client.contract?.signatureDraftAt?.toISOString() || null}
        approved={approved}
      />
    </div>
  );
}
