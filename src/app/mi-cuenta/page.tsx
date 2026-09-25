import Link from "next/link";
import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { formatMXN, toNumber } from "@/lib/money";
import { APPLICATION_STATUS_LABEL } from "@/lib/constants";
import { StatusBadge } from "@/components/status-badge";
import { BannerCarousel } from "@/components/client/banner-carousel";
import { nextClientAction } from "@/lib/client-journey-fallback";
import { prisma } from "@/lib/prisma";
import { CATALOG_SEED } from "@/lib/product-catalog";

function eventCopy(action: string, name: string) {
  if (action === "CONTRACTED") return `Producto contratado: ${name}`;
  if (action === "CANCELLED") return `Producto cancelado: ${name}`;
  if (action === "ATTEMPT") return `Intento de contratación: ${name}`;
  return `${action}: ${name}`;
}

function YourProducts({
  financingName,
  showFinancingProcess,
  continueHref,
  continueLabel,
  pending,
  contracted,
}: {
  financingName: string;
  showFinancingProcess: boolean;
  continueHref: string;
  continueLabel: string;
  pending: { id: string; product: { slug: string; name: string; summary: string } }[];
  contracted: { id: string; product: { slug: string; name: string; summary: string } }[];
}) {
  const hasAny = showFinancingProcess || pending.length > 0 || contracted.length > 0;
  return (
    <>
      <h2 className="client-section-title">Tus productos</h2>
      {!hasAny ? (
        <p className="client-section-copy">
          Aún no tienes productos contratados. Conoce el catálogo y continúa tu solicitud.
        </p>
      ) : (
        <div className="product-grid catalog-grid mb-6">
          {showFinancingProcess && (
            <article className="product-card bank-card">
              <p className="product-card-kicker">En proceso</p>
              <h3>{financingName}</h3>
              <p className="product-card-copy">Tu solicitud sigue en trámite. Completa los pasos pendientes para avanzar.</p>
              <Link href={continueHref} className="btn btn-green" style={{ marginTop: 14, width: "fit-content" }}>
                Continúa tu proceso
              </Link>
            </article>
          )}
          {pending.map((row) => (
            <Link key={row.id} href={`/mi-cuenta/productos/${row.product.slug}`} className="product-card bank-card">
              <p className="product-card-kicker">En proceso</p>
              <h3>{row.product.name}</h3>
              <p className="product-card-copy">{row.product.summary}</p>
            </Link>
          ))}
          {contracted.map((row) => (
            <Link key={row.id} href={`/mi-cuenta/productos/${row.product.slug}`} className="product-card bank-card">
              <p className="product-card-kicker">Contratado</p>
              <h3>{row.product.name}</h3>
              <p className="product-card-copy">{row.product.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default async function ClientHome() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const { client, unread, banners } = ctx;
  const status = client.application?.status || "STUDY_PENDING";
  const authorized = status === "APPROVED";
  const hasBadDocs = client.documents.some((d) => d.status === "NEEDS_CORRECTION" || d.status === "REJECTED");
  const next = nextClientAction({
    status,
    studySubmitted: Boolean(client.study?.submitted),
    docsCount: client.documents.length,
    offerPrepared: client.offer?.status === "PREPARED",
    documentsSubmitted: Boolean(client.application?.documentsSubmittedAt),
    hasBadDocs,
  });
  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const dbProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  const catalog = dbProducts.length ? dbProducts : CATALOG_SEED;
  const amount = client.authorizedAmount || client.displayedAmount;
  const history = client.products
    .flatMap((p) =>
      p.events.map((event) => ({
        id: event.id,
        action: event.action,
        name: p.product.name,
        createdAt: event.createdAt,
        note: event.note,
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  const contracted = client.products.filter((p) => p.status === "CONTRACTED");
  const pending = client.products.filter((p) => p.status === "PENDING");
  const applicationInProcess = status !== "APPROVED" && status !== "REJECTED";
  const financingName = client.application?.product || client.product || "Crédito personal";

  if (!authorized) {
    return (
      <div className="client-home">
        <header className="client-home-hero fade-up">
          <div>
            <p className="client-kicker">{today}</p>
            <h1>Hola, {client.user.firstName}</h1>
            <p className="client-home-sub">
              Folio <b>{client.folio}</b>
            </p>
          </div>
          <Link href={next.href} className="btn btn-green">
            {next.label}
          </Link>
        </header>

        <article className="bank-mobile-hero-card fade-up">
          <small>Tu solicitud</small>
          <b>En proceso</b>
          <p>Folio {client.folio}</p>
          <Link href={next.href} className="btn btn-gold">
            {next.label}
          </Link>
        </article>

        <div className="bank-quick-actions bank-mobile-only fade-up">
          <Link href="/mi-cuenta/estudio" className="bank-qa">
            <i>1</i>
            <span>Solicitud</span>
          </Link>
          <Link href="/mi-cuenta/documentos" className="bank-qa">
            <i>2</i>
            <span>Documentos</span>
          </Link>
          <Link href="/mi-cuenta/productos" className="bank-qa">
            <i>3</i>
            <span>Productos</span>
          </Link>
          <Link href="/mi-cuenta/notificaciones" className="bank-qa">
            <i>4</i>
            <span>Avisos</span>
          </Link>
        </div>

        <BannerCarousel banners={banners} />

        <section className="fade-up delay-1">
          <YourProducts
            financingName={financingName}
            showFinancingProcess={applicationInProcess}
            continueHref={next.href}
            continueLabel={next.label || "Continúa tu proceso"}
            pending={pending}
            contracted={contracted}
          />
          <h3 className="client-section-title">Conoce nuestros productos</h3>
          <div className="product-grid catalog-grid">
            {catalog.map((product) => (
              <Link key={product.slug} href={`/mi-cuenta/productos/${product.slug}`} className="product-card bank-card">
                <p className="product-card-kicker">Producto Conectemos</p>
                <h3>{product.name}</h3>
                <p className="product-card-copy">{product.summary}</p>
                <span className="product-card-cta">
                  Conocer más <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {history.length > 0 && (
          <section className="fade-up delay-2">
            <h2 className="client-section-title">Actividad de productos</h2>
            <ul className="activity-list">
              {history.map((item) => (
                <li key={item.id}>
                  <span className="is-new" />
                  <div>
                    <b>{eventCopy(item.action, item.name)}</b>
                    <time>{item.createdAt.toLocaleString("es-MX")}</time>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link href={next.href} className="btn btn-gold bank-desktop-only" style={{ justifySelf: "start" }}>
          Continuar solicitud
        </Link>
      </div>
    );
  }

  return (
    <div className="client-home">
      <header className="client-home-hero fade-up client-home-hero-desktop">
        <div>
          <p className="client-kicker">{today}</p>
          <h1>Hola, {client.user.firstName}</h1>
          <p className="client-home-sub">
            Folio <b>{client.folio}</b>
          </p>
        </div>
        <Link href="/mi-cuenta/cuenta-digital" className="btn btn-green">
          Ver mi cuenta
        </Link>
      </header>

      <article className={`balance-card bank-account-card fade-up delay-1 ${toNumber(amount) > 0 ? "is-compact" : "is-locked"}`}>
        <small>Cuenta digital</small>
        {toNumber(amount) > 0 ? (
          <div className="balance-amount">{formatMXN(amount)}</div>
        ) : (
          <p className="balance-locked-copy">El monto se muestra cuando tu crédito queda autorizado.</p>
        )}
        <p className="balance-note">Tu financiamiento</p>
        {client.digitalAccount && (
          <dl className="finance-facts">
            <div>
              <dt>Número de cuenta</dt>
              <dd>{client.digitalAccount.accountNumber}</dd>
            </div>
            <div>
              <dt>CLABE</dt>
              <dd>{client.digitalAccount.clabe || "—"}</dd>
            </div>
            <div>
              <dt>Estatus</dt>
              <dd>{client.application ? APPLICATION_STATUS_LABEL[status] : "Autorizado"}</dd>
            </div>
          </dl>
        )}
        <div className="balance-meta">
          {client.application && <StatusBadge status={status} />}
        </div>
      </article>

      <div className="bank-quick-actions bank-mobile-only fade-up delay-2">
        <Link href="/mi-cuenta/cuenta-digital" className="bank-qa">
          <i>C</i>
          <span>Cuenta</span>
        </Link>
        <Link href="/mi-cuenta/ahorro" className="bank-qa">
          <i>A</i>
          <span>Ahorro</span>
        </Link>
        <Link href="/mi-cuenta/documentos" className="bank-qa">
          <i>D</i>
          <span>Docs</span>
        </Link>
        <Link href="/mi-cuenta/productos" className="bank-qa">
          <i>P</i>
          <span>Productos</span>
        </Link>
      </div>

      <section className="fade-up delay-2 bank-desktop-only">
        <h2 className="client-section-title">Accesos rápidos</h2>
        <div className="quick-grid bank-quick-actions">
          <Link href="/mi-cuenta/ahorro" className="quick-card bank-card">
            <b>Fondo de ahorro</b>
            <span>Consulta la referencia y carga tu comprobante.</span>
          </Link>
          <Link href="/mi-cuenta/documentos" className="quick-card bank-card">
            <b>Documentos</b>
            <span>
              {client.documents.length
                ? `${client.documents.length} archivo(s) en tu expediente.`
                : "Revisa o carga documentos de tu expediente."}
            </span>
          </Link>
          <Link href="/mi-cuenta/productos" className="quick-card bank-card">
            <b>Productos</b>
            <span>Conoce y contrata productos adicionales.</span>
          </Link>
        </div>
      </section>

      <section className="fade-up delay-3">
        <YourProducts
          financingName={financingName}
          showFinancingProcess={false}
          continueHref={next.href}
          continueLabel={next.label || "Continúa tu proceso"}
          pending={pending}
          contracted={contracted}
        />
      </section>

      <article className="card p-5 bank-card fade-up delay-3">
        <h2 className="client-section-title">Historial de productos</h2>
        <p className="client-section-copy">Contrataciones y cancelaciones registradas en tu expediente.</p>
        {history.length === 0 && <p className="text-sm text-[var(--muted)]">Aún no hay movimientos de productos.</p>}
        <ul className="activity-list">
          {history.map((item) => (
            <li key={item.id}>
              <span className={item.action === "CANCELLED" ? "is-read" : "is-new"} />
              <div>
                <b>{eventCopy(item.action, item.name)}</b>
                {item.note ? <p>{item.note}</p> : null}
                <time>{item.createdAt.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</time>
              </div>
            </li>
          ))}
        </ul>
      </article>

      {unread > 0 && (
        <p className="text-sm text-[var(--muted)]">
          Tienes avisos pendientes.{" "}
          <Link href="/mi-cuenta/notificaciones" className="font-bold text-[var(--verde)]">
            Ver notificaciones
          </Link>
        </p>
      )}
    </div>
  );
}
