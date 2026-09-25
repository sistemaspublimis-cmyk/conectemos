import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { formatMXN } from "@/lib/money";
import { LockedCard } from "@/components/client/locked-card";
import { StatusBadge } from "@/components/status-badge";

export default async function DesembolsoPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const d = ctx.client.disbursement;
  const registered = d?.status === "REGISTERED";

  return (
    <div className="product-page">
      <header className="fade-up">
        <p className="client-kicker">Trámite</p>
        <h1 className="text-[28px] font-black text-[var(--verde2)] m-0">Desembolso</h1>
        <p className="client-home-sub">Consulta el estatus y el monto de tu desembolso.</p>
      </header>

      {!registered ? (
        <LockedCard
          title="Desembolso no registrado"
          badge={d?.status === "PREPARED" ? "En preparación" : "Pendiente de aprobación"}
          href="/mi-cuenta/solicitud"
          cta="Ver más"
        >
          El desembolso se muestra aquí cuando Conectemos lo confirma en tu expediente.
        </LockedCard>
      ) : (
        <article className="card p-6 fade-up bank-card">
          <StatusBadge status={d.status} />
          <div className="money text-3xl mt-3">{formatMXN(d.amount)}</div>
          <p className="text-sm text-[var(--muted)] mt-2">
            Desembolso confirmado en tu expediente.
          </p>
          {d.note && <p className="text-sm mt-2">{d.note}</p>}
          {d.registeredAt && (
            <p className="text-xs text-[var(--muted)] mt-3">
              Registrado el {d.registeredAt.toLocaleString("es-MX")}
            </p>
          )}
        </article>
      )}
    </div>
  );
}
