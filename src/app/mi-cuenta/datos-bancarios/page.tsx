import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { LockedCard } from "@/components/client/locked-card";
import { BankForm } from "./bank-form";

export default async function BancariosPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const approved = ctx.client.application?.status === "APPROVED";
  const bank = ctx.client.bankDetails;

  return (
    <div className="product-page">
      <header className="fade-up">
        <p className="client-kicker">Trámite</p>
        <h1 className="text-[28px] font-black text-[var(--verde2)] m-0">Datos bancarios</h1>
        <p className="client-home-sub">Se habilitan cuando tu financiamiento está aprobado.</p>
      </header>

      {!approved ? (
        <LockedCard
          title="Datos bancarios bloqueados"
          badge="Disponible después de la aprobación"
          href="/mi-cuenta/solicitud"
          cta="Ver más"
        >
          Esta sección se abre cuando tu financiamiento está aprobado, para registrar la cuenta de desembolso.
        </LockedCard>
      ) : (
        <BankForm
          initial={{
            holder: bank?.holder || "",
            bank: bank?.bank || "",
            clabe: bank?.clabe || "",
            accountNumber: bank?.accountNumber || "",
            branch: bank?.branch || "",
            accountType: bank?.accountType || "",
          }}
        />
      )}
    </div>
  );
}
