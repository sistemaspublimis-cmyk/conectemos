import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { formatMXN } from "@/lib/money";
import { SAVINGS_STATUS_LABEL } from "@/lib/constants";
import { LockedCard } from "@/components/client/locked-card";
import { StatusBadge } from "@/components/status-badge";
import { ComprobanteForm } from "./comprobante-form";

export default async function AhorroPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const approved = ctx.client.application?.status === "APPROVED";
  const fund = ctx.client.savingsFund;

  if (!approved) {
    return (
      <div className="product-page">
        <section className="product-hero fade-up">
          <p className="client-kicker">Fondo de ahorro</p>
          <h1>Fondo de ahorro</h1>
        </section>
        <LockedCard
          title="Disponible después de la autorización"
          badge="Pendiente"
          href="/mi-cuenta"
          cta="Volver al inicio"
        >
          El fondo de ahorro se habilita cuando tu crédito queda autorizado. Aquí verás la referencia, el monto y podrás
          cargar el comprobante.
        </LockedCard>
      </div>
    );
  }

  const status = fund?.status || "PENDING";

  return (
    <div className="product-page">
      <section className="product-hero fade-up">
        <p className="client-kicker">Expediente</p>
        <h1>Fondo de ahorro</h1>
        <p className="product-hero-lead">
          Aportación ligada a tu crédito autorizado. Usa la referencia exacta y carga el comprobante con el monto de tu
          expediente.
        </p>
      </section>

      <article className="card p-5 bank-card fade-up delay-1">
        <h2 className="client-section-title">Datos de pago</h2>
        <dl className="finance-facts !mt-2" style={{ position: "static", color: "inherit" }}>
          <div>
            <dt>Referencia</dt>
            <dd>{fund?.reference || `FA-${ctx.client.folio}`}</dd>
          </div>
          <div>
            <dt>Monto</dt>
            <dd>{formatMXN(fund?.amount || 0)}</dd>
          </div>
          <div>
            <dt>Estatus</dt>
            <dd>
              <StatusBadge status={status} /> {SAVINGS_STATUS_LABEL[status] || status}
            </dd>
          </div>
        </dl>
        {fund?.receiptName ? (
          <p className="text-sm text-[var(--muted)] mt-4">Comprobante enviado: {fund.receiptName}</p>
        ) : null}
      </article>

      <article className="card p-5 bank-card fade-up delay-2">
        <h2 className="client-section-title">Comprobante</h2>
        <p className="client-section-copy">
          {status === "VALIDATING"
            ? "Tu comprobante está en validación. Puedes reemplazarlo si es necesario."
            : "Carga el comprobante de la transferencia con el monto indicado."}
        </p>
        <ComprobanteForm />
      </article>
    </div>
  );
}
