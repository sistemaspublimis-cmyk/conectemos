import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { formatMXN } from "@/lib/money";
import { AutorizadoLink, MarkApprovalSeen } from "./mark-seen";

export default async function AutorizadoPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  if (ctx.client.application?.status !== "APPROVED") redirect("/mi-cuenta");

  const amount = ctx.client.authorizedAmount || ctx.client.displayedAmount;
  const account = ctx.client.digitalAccount;

  return (
    <div className="product-page">
      <MarkApprovalSeen />
      <section className="product-hero fade-up">
        <p className="client-kicker">Autorización</p>
        <h1>Felicidades, {ctx.user.firstName}</h1>
        <p className="product-hero-lead">
          Tu crédito fue autorizado. Se creó una cuenta digital temporal para que recibas el préstamo. Complementa tu
          expediente con el fondo de ahorro.
        </p>
      </section>

      <article className="balance-card fade-up delay-1">
        <small>Monto autorizado</small>
        <div className="balance-amount">{formatMXN(amount)}</div>
        {account ? (
          <dl className="finance-facts">
            <div>
              <dt>Cuenta digital</dt>
              <dd>{account.accountNumber}</dd>
            </div>
            <div>
              <dt>CLABE</dt>
              <dd>{account.clabe || "—"}</dd>
            </div>
            <div>
              <dt>Folio</dt>
              <dd>{ctx.client.folio}</dd>
            </div>
          </dl>
        ) : (
          <p className="balance-note">Tu cuenta digital temporal queda ligada a este expediente.</p>
        )}
      </article>

      <div className="quick-grid fade-up delay-2">
        <AutorizadoLink href="/mi-cuenta/cuenta-digital" className="btn btn-green">
          Ver mi cuenta
        </AutorizadoLink>
        <AutorizadoLink href="/mi-cuenta/ahorro" className="btn btn-gold">
          Pagar fondo de ahorro
        </AutorizadoLink>
        <AutorizadoLink href="/mi-cuenta/productos" className="btn btn-light">
          Ver productos
        </AutorizadoLink>
      </div>
    </div>
  );
}
