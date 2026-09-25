"use client";

import Link from "next/link";
import { useState } from "react";
import { solicitudHref } from "@/lib/product-catalog";

export type StageProduct = {
  slug: string;
  name: string;
  summary: string;
  imageUrl: string;
  audience: string;
  amount: string;
  term: string;
  purpose: string;
};

export function ProductStage({ products }: { products: StageProduct[] }) {
  const [active, setActive] = useState(0);
  const product = products[active] ?? products[0];
  if (!product) return null;

  return (
    <section className="pub-stage" aria-labelledby="pub-stage-title">
      <div className="pub-wrap">
        <div className="pub-stage-head">
          <p className="pub-kicker">Elige y pídelo</p>
          <h2 id="pub-stage-title">Personal, nómina, negocio, auto o tus facturas.</h2>
          <p>Toca la línea. Ves para quién es, hasta cuánto y a qué plazo. Si te late, la pides en ese momento.</p>
        </div>
        <div className="pub-stage-grid">
          <div className="pub-stage-nav" role="tablist" aria-label="Productos de financiamiento">
            {products.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                role="tab"
                id={`tab-${item.slug}`}
                aria-selected={index === active}
                aria-controls="pub-stage-panel"
                className={index === active ? "is-on" : ""}
                onClick={() => setActive(index)}
              >
                <span>0{index + 1}</span>
                {item.name}
              </button>
            ))}
          </div>
          <article
            key={product.slug}
            id="pub-stage-panel"
            role="tabpanel"
            aria-labelledby={`tab-${product.slug}`}
            className="pub-stage-panel"
          >
            <img src={product.imageUrl} alt="" />
            <div className="pub-stage-copy">
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
              <dl>
                <div>
                  <dt>Para quién</dt>
                  <dd>{product.audience}</dd>
                </div>
                <div>
                  <dt>Monto</dt>
                  <dd>{product.amount}</dd>
                </div>
                <div>
                  <dt>Plazo</dt>
                  <dd>{product.term}</dd>
                </div>
                <div>
                  <dt>Destino</dt>
                  <dd>{product.purpose}</dd>
                </div>
              </dl>
              <div className="pub-stage-actions">
                <Link href={solicitudHref(product.slug)} className="btn btn-gold">
                  Lo quiero
                </Link>
                <Link href={`/productos/${product.slug}`} className="btn btn-light">
                  Conocer más
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
