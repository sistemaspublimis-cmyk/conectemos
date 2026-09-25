import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { CATALOG_SEED, OFFER_FACTS, catalogLines } from "@/lib/product-catalog";

const GENERAL = [
  ["Edad", "De 18 a 70 años. Crédito personal y de nómina: de 20 a 60 años."],
  ["Identificación", "INE o pasaporte vigente. En persona moral, la del representante."],
  ["Domicilio", "Comprobante con máximo 3 meses: luz, agua, teléfono fijo o estado de cuenta bancario."],
  ["Ingresos", "Recibos de nómina, estados de cuenta o la documentación de la actividad."],
  ["RFC", "En crédito personal y en cualquier producto de negocio."],
  ["Estudio", "El socioeconómico, o el de la empresa, se completa en el portal antes de la revisión."],
];

export default function RequisitosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="pub-page-hero">
          <div className="pub-wrap">
            <p className="pub-kicker">Requisitos</p>
            <h1>Trae esto y pide tu crédito.</h1>
            <p>
              En casi todos los casos bastan identificación, domicilio reciente e ingresos. El negocio suma constancia
              fiscal; el auto, la cotización; el factoraje, las facturas.
            </p>
          </div>
        </section>

        <section className="pub-section">
          <div className="pub-wrap">
            <div className="pub-section-head">
              <p className="pub-kicker">Para empezar</p>
              <h2>Lo que se pide en la mayoría de solicitudes.</h2>
            </div>
            <div className="pub-req-grid">
              {GENERAL.map(([title, text]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pub-section pub-related">
          <div className="pub-wrap">
            <div className="pub-section-head">
              <p className="pub-kicker">Por producto</p>
              <h2>Requisitos de cada ficha.</h2>
            </div>
            <div className="pub-req-products">
              {CATALOG_SEED.map((product) => {
                const facts = OFFER_FACTS[product.slug];
                return (
                  <article key={product.slug}>
                    <header>
                      <h3>{product.name}</h3>
                      <p>
                        {facts.audience}. {facts.amount}. {facts.term}.
                      </p>
                    </header>
                    <ul>
                      {catalogLines(product.requirements).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <Link href={`/productos/${product.slug}`}>Abrir ficha</Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pub-close">
          <div className="pub-wrap">
            <h2>Si ya los tienes, pide el crédito.</h2>
            <p>El estudio se completa en tu cuenta. Si una hoja hay que reponerla, te lo marcamos y sigues desde ahí.</p>
            <Link href="/registro" className="btn btn-gold">
              Crear cuenta
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
