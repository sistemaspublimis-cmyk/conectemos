import Link from "next/link";
import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { formatMXN } from "@/lib/money";
import { LockedCard } from "@/components/client/locked-card";

export default async function CuentaDigitalPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const approved = ctx.client.application?.status === "APPROVED";
  const account = ctx.client.digitalAccount;
  const amount = ctx.client.authorizedAmount || ctx.client.displayedAmount;

  if (!approved) {
    return (
      <div className="product-page">
        <section className="product-hero fade-up">
          <p className="client-kicker">Cuenta digital</p>
          <h1>Cuenta digital temporal</h1>
        </section>
        <LockedCard
          title="Disponible después de la autorización"
          badge="Pendiente"
          href="/mi-cuenta"
          cta="Volver al inicio"
        >
          Cuando tu crédito se autorice se crea una cuenta digital temporal para recibir el préstamo. Hoy esta sección
          permanece cerrada.
        </LockedCard>
      </div>
    );
  }

  return (
    <div className="product-page">
      <section className="product-hero fade-up">
        <p className="client-kicker">Cuenta digital</p>
        <h1>Tu cuenta digital temporal</h1>
        <p className="product-hero-lead">
          Cuenta creada para recibir tu financiamiento autorizado. Conserva el número y la CLABE de tu expediente.
        </p>
      </section>

      <article className="balance-card fade-up delay-1">
        <small>Saldo de tu cuenta digital</small>
        <div className="balance-amount">{formatMXN(amount)}</div>
        <p className="balance-note">Tu financiamiento</p>
        <dl className="finance-facts">
          <div>
            <dt>Número de cuenta</dt>
            <dd>{account?.accountNumber || "En alta"}</dd>
          </div>
          <div>
            <dt>CLABE</dt>
            <dd>{account?.clabe || "—"}</dd>
          </div>
          <div>
            <dt>Estatus</dt>
            <dd>{account?.status === "TEMPORARY" ? "Temporal" : account?.status || "Activa"}</dd>
          </div>
        </dl>
      </article>

      <div className="quick-grid fade-up delay-2">
        <Link href="/mi-cuenta/ahorro" className="quick-card bank-card">
          <b>Fondo de ahorro</b>
          <span>Paga la referencia y carga tu comprobante.</span>
        </Link>
        <Link href="/mi-cuenta/productos" className="quick-card bank-card">
          <b>Productos</b>
          <span>Consulta o contrata productos adicionales.</span>
        </Link>
      </div>
    </div>
  );
}
