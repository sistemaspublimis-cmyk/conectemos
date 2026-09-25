import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import {
  CATALOG_SEED,
  OFFER_FACTS,
  OFFER_GROUPS,
  catalogBySlug,
  catalogLines,
  productsInGroup,
  solicitudHref,
} from "@/lib/product-catalog";

export function generateStaticParams() {
  return CATALOG_SEED.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = catalogBySlug(slug);
  if (!product) return { title: "Producto · Conectemos" };
  const facts = OFFER_FACTS[slug];
  return {
    title: `${product.name} · Conectemos`,
    description: `${product.summary} ${facts.amount}. ${facts.term}.`,
  };
}

export default async function ProductoPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = catalogBySlug(slug);
  const facts = OFFER_FACTS[slug];
  if (!product || !facts) notFound();
  const group = OFFER_GROUPS.find((item) => item.id === facts.group);
  const related = productsInGroup(facts.group).filter((item) => item.slug !== slug).slice(0, 3);
  const benefits = catalogLines(product.benefits);
  const requirements = catalogLines(product.requirements);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="pub-ficha-hero">
          <img src={product.imageUrl} alt="" />
          <div className="pub-wrap pub-ficha-copy">
            <p className="pub-kicker">{group?.label}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <div className="pub-hero-actions">
              <Link href={solicitudHref(slug)} className="btn btn-gold">
                Quiero {product.name.toLowerCase()}
              </Link>
              <Link href="/productos" className="btn btn-light">
                Volver al catálogo
              </Link>
            </div>
          </div>
        </section>
        <section className="pub-wrap pub-factbar" aria-label="Condiciones de referencia">
          {[
            ["Para quién", facts.audience],
            ["Monto", facts.amount],
            ["Plazo", facts.term],
            ["Destino", facts.purpose],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>
        <section className="pub-section">
          <div className="pub-wrap pub-ficha-grid">
            <article>
              <h2>Qué incluye</h2>
              <ul>
                {benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h2>Qué tienes que presentar</h2>
              <ul>
                {requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="pub-steps-card">
              <h2>Cómo sigue</h2>
              <ol>
                {facts.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p>{group?.lead}</p>
            </article>
          </div>
        </section>
        {related.length > 0 && (
          <section className="pub-section pub-related">
            <div className="pub-wrap">
              <h2>Otros de {group?.label.toLowerCase()}</h2>
              <div className="pub-scenes">
                {related.map((item) => (
                  <article key={item.slug}>
                    <h3>{item.name}</h3>
                    <p>{item.summary}</p>
                    <Link href={`/productos/${item.slug}`}>Ver ficha</Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
