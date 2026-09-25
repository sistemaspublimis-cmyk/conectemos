import Link from "next/link";
import { Fragment } from "react";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { Pitch } from "@/components/public/pitch";
import { OFFER_FACTS, OFFER_GROUPS, productsInGroup, solicitudHref } from "@/lib/product-catalog";

const PITCH = [
  {
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1800&q=80",
    kicker: "Conectemos",
    title: "Tu crédito, junto contigo.",
    text: "Personal, nómina, negocio, auto y facturas. Empieza desde $50,000.",
    href: "/registro",
    cta: "Quiero mi crédito",
  },
  {
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1800&q=80",
    kicker: "Para ti",
    title: "De $50,000 a $1,000,000.",
    text: "Crédito personal para un gasto, una deuda o un proyecto. Eliges monto y plazo.",
    href: solicitudHref("credito-personal"),
    cta: "Pedir crédito personal",
  },
  {
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=80",
    kicker: "Para tu negocio",
    title: "Hasta $10,000,000.",
    text: "Capital de trabajo para inventario, proveedores y la operación.",
    href: solicitudHref("credito-pyme"),
    cta: "Pedir crédito PyME",
  },
  {
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=80",
    kicker: "Para el auto",
    title: "Cómpralo o úsalo.",
    text: "Automotriz desde $50,000. Arrendamiento de equipo o auto hasta $10,000,000.",
    href: solicitudHref("credito-automotriz"),
    cta: "Pedir crédito automotriz",
  },
  {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80",
    kicker: "Para tus facturas",
    title: "Adelanta lo que ya vendiste.",
    text: "Factoraje desde $50,000 y hasta $10,000,000, sobre facturas a 30, 60 o 90 días.",
    href: solicitudHref("factoraje"),
    cta: "Pedir factoraje",
  },
];

export default function ProductosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="pub-page-hero">
          <div className="pub-wrap">
            <p className="pub-kicker">Catálogo</p>
            <h1>Elige qué quieres pedir.</h1>
            <p>
              Crédito, tarjeta, cuenta o arrendamiento. Mira para quién es, hasta cuánto y a qué plazo, y pídelo si te
              late.
            </p>
          </div>
        </section>
        {OFFER_GROUPS.map((group, index) => (
          <Fragment key={group.id}>
          <section className="pub-section" id={group.id}>
            <div className="pub-wrap">
              <div className="pub-section-head">
                <p className="pub-kicker">{group.label}</p>
                <h2>{group.label}</h2>
                <p>{group.lead}</p>
              </div>
              <div className="pub-catalog">
                {productsInGroup(group.id).map((product) => {
                  const facts = OFFER_FACTS[product.slug];
                  return (
                    <article key={product.slug}>
                      <img src={product.imageUrl} alt="" />
                      <div>
                        <h3>{product.name}</h3>
                        <p>{product.summary}</p>
                        <dl>
                          <div>
                            <dt>Para quién</dt>
                            <dd>{facts.audience}</dd>
                          </div>
                          <div>
                            <dt>Monto</dt>
                            <dd>{facts.amount}</dd>
                          </div>
                          <div>
                            <dt>Plazo</dt>
                            <dd>{facts.term}</dd>
                          </div>
                        </dl>
                        <div className="pub-stage-actions">
                          <Link href={`/productos/${product.slug}`} className="btn btn-green">
                            Ver ficha
                          </Link>
                          <Link href={solicitudHref(product.slug)} className="btn btn-light">
                            Lo quiero
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
          {index === 0 ? <Pitch slides={PITCH} /> : null}
          </Fragment>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
