import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { CATALOG_SEED, catalogLines, offerFacts, originatesWithApplication } from "@/lib/product-catalog";
import { CLIENT_PRODUCT_STATUS_LABEL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { LockedCard } from "@/components/client/locked-card";
import { BlockedNotice, ContratarButton, NeedsBasicNotice } from "../product-actions";

const DEFAULT_TAP = "Este producto no está disponible por el momento.";

export default async function ProductoDetallePage({ params }: { params: Promise<{ slug: string }> }) {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const { slug } = await params;
  const dbProduct = await prisma.product.findUnique({ where: { slug } });
  const product = dbProduct || CATALOG_SEED.find((item) => item.slug === slug);
  if (!product) notFound();

  const row = ctx.client.products.find((item) => item.product.slug === slug);
  const approved = ctx.client.application?.status === "APPROVED";
  const hasBasic = ctx.client.products.some(
    (item) => item.product.slug === "cuenta-basica" && item.status === "CONTRACTED",
  );
  const requiresBasic = product.requiresBasicAccount && slug !== "cuenta-basica";
  const blocked =
    Boolean(row?.blocked) || row?.status === "BLOCKED" || row?.status === "UNAVAILABLE" || row?.available === false;
  const contracted = row?.status === "CONTRACTED";
  const benefits = catalogLines(product.benefits);
  const requirements = catalogLines(product.requirements);
  const facts = offerFacts(slug);
  const needsAuthProduct = slug === "cuenta-digital" || slug === "fondo-ahorro";

  return (
    <div className="product-page">
      <section className="product-hero fade-up">
        <p className="client-kicker">Producto Conectemos</p>
        <h1>{product.name}</h1>
        <p className="product-hero-lead">{product.description}</p>
      </section>

      <article className="card overflow-hidden bank-card fade-up delay-1">
        {product.imageUrl ? <img src={product.imageUrl} alt="" className="w-full h-48 object-cover" /> : null}
        <div className="p-5 grid gap-3">
          <p className="text-sm text-[var(--muted)] leading-relaxed">{product.summary}</p>
          {facts ? (
            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                ["Para quién", facts.audience],
                ["Monto de referencia", facts.amount],
                ["Plazo", facts.term],
                ["Destino", facts.purpose],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[var(--crema)] px-3 py-2">
                  <dt className="text-[10px] font-black tracking-wide uppercase text-[var(--dorado)]">{label}</dt>
                  <dd className="mt-1 text-[var(--texto)]">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {benefits.length > 0 && (
            <div>
              <h2 className="client-section-title">Beneficios</h2>
              <ul className="text-sm text-[var(--texto)] grid gap-1.5 list-disc pl-5">
                {benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {requirements.length > 0 && (
            <div>
              <h2 className="client-section-title">Requisitos</h2>
              <ul className="text-sm text-[var(--texto)] grid gap-1.5 list-disc pl-5">
                {requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {row?.status ? (
            <p className="text-sm">
              Estatus: <b>{CLIENT_PRODUCT_STATUS_LABEL[row.status] || row.status}</b>
            </p>
          ) : null}
        </div>
      </article>

      {blocked ? (
        <BlockedNotice slug={slug} message={row?.tapMessage || DEFAULT_TAP} />
      ) : contracted ? (
        <div className="notice notice-green">Este producto ya está contratado en tu expediente.</div>
      ) : needsAuthProduct && !approved ? (
        <LockedCard title="Disponible después de la autorización" badge="Pendiente" href="/mi-cuenta" cta="Volver al inicio">
          Este producto se habilita cuando tu crédito queda autorizado.
        </LockedCard>
      ) : originatesWithApplication(slug) && !approved ? (
        <div className="notice notice-gold grid gap-3">
          <div>Este financiamiento se origina con tu solicitud. No se genera sin autorización del expediente.</div>
          <Link href="/mi-cuenta/estudio" className="btn btn-green" style={{ justifySelf: "start" }}>
            Ir a mi solicitud
          </Link>
        </div>
      ) : requiresBasic && !hasBasic ? (
        <NeedsBasicNotice />
      ) : (
        <ContratarButton slug={slug} label={`Contratar ${product.name}`} />
      )}

      <div className="flex flex-wrap gap-2 fade-up delay-2">
        <Link href="/mi-cuenta/productos" className="btn btn-light">
          Ver productos
        </Link>
        <Link href="/mi-cuenta/solicitud" className="btn btn-light">
          Continuar solicitud
        </Link>
      </div>
    </div>
  );
}
