import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { ProductStage, type StageProduct } from "@/components/public/product-stage";
import { OfferDesk } from "@/components/public/offer-desk";
import { PhotoReel } from "@/components/public/photo-reel";
import { StepStory } from "@/components/public/step-story";
import { BRAND, brandAddressLines } from "@/lib/constants";
import {
  CATALOG_SEED,
  CREDIT_ORIGINATION_SLUGS,
  OFFER_FACTS,
  catalogLines,
  productsInGroup,
  solicitudHref,
} from "@/lib/product-catalog";

const STAGE: StageProduct[] = CREDIT_ORIGINATION_SLUGS.map((slug) => {
  const product = CATALOG_SEED.find((item) => item.slug === slug)!;
  const facts = OFFER_FACTS[slug];
  return {
    slug,
    name: product.name,
    summary: product.summary,
    imageUrl: product.imageUrl,
    audience: facts.audience,
    amount: facts.amount,
    term: facts.term,
    purpose: facts.purpose,
  };
});

const PATH = [
  {
    n: "01",
    title: "Registro",
    text: "Dejas tu nombre, correo y teléfono. En un minuto tienes folio y tu solicitud queda abierta.",
  },
  {
    n: "02",
    title: "Estudio",
    text: "Nos dices para qué lo quieres, cuánto ingresas y en qué trabajas. Con eso armamos una oferta a tu medida.",
  },
  {
    n: "03",
    title: "Documentos",
    text: "Identificación, domicilio de los últimos 3 meses e ingresos. Si es negocio, suma tu constancia fiscal, cotización o facturas.",
  },
  {
    n: "04",
    title: "Oferta",
    text: "Te presentamos monto, plazo y pago. Si te late, firmas y el dinero se refleja en tu cuenta digital.",
  },
];

const SCENES = [
  {
    title: "Un gasto personal",
    text: "Salud, escuela, una deuda o un proyecto. El crédito personal va de $50,000 a $1,000,000, a 6–48 meses.",
    href: solicitudHref("credito-personal"),
    label: "Pedir crédito personal",
  },
  {
    title: "Cobras por nómina",
    text: "Si llevas al menos 6 meses en el empleo, el crédito de nómina va de $50,000 a $500,000, a 6–36 meses.",
    href: solicitudHref("credito-nomina"),
    label: "Pedir crédito de nómina",
  },
  {
    title: "El negocio necesita el mes",
    text: "Inventario y proveedores caben en crédito PyME, de $200,000 a $10,000,000. Si el dinero está en facturas, pídelo por factoraje.",
    href: solicitudHref("credito-pyme"),
    label: "Pedir crédito PyME",
  },
  {
    title: "El auto o el equipo es la herramienta",
    text: "Comprar el auto es crédito automotriz, hasta 60 meses. Usarlo y decidir la compra al final es arrendamiento, de 12 a 48 meses, para actividad empresarial.",
    href: solicitudHref("arrendamiento-financiero"),
    label: "Pedir arrendamiento",
  },
];

export default function HomePage() {
  const relationship = [...productsInGroup("cuentas"), ...productsInGroup("patrimonio")];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <section className="pub-hero">
        <div className="pub-wrap pub-hero-grid">
          <div>
            <span className="pub-pill">S.A.P.I. de C.V., SOFOM, E.N.R.</span>
            <h1>
              Pide el crédito y <span>úsalo ya</span>
            </h1>
            <p className="pub-lead">
              Para un gasto personal, tu nómina, el negocio, el auto o las facturas que aún no te pagan. Elige el monto,
              mira el pago y deja tus datos.
            </p>
            <div className="pub-hero-actions">
              <Link href="/registro" className="btn btn-gold">
                Quiero mi crédito
              </Link>
              <Link href="/productos" className="btn btn-light">
                Ver productos
              </Link>
            </div>
          </div>
          <OfferDesk />
        </div>
      </section>

      <div className="pub-wrap">
        <div className="pub-metrics">
          {[
            ["Desde $50,000", "Para empezar", "Personal, nómina o tu auto"],
            ["Hasta $10 millones", "Para el negocio", "PyME, arrendamiento o factoraje"],
            ["Unos minutos", "Para pedirlo", "Nombre, teléfono y listo"],
            ["En línea", "Tu expediente", "Portal y correo"],
          ].map(([k, t, d]) => (
            <div key={t}>
              <b>{k}</b>
              <strong>{t}</strong>
              <span>{d}</span>
            </div>
          ))}
        </div>
      </div>

      <ProductStage products={STAGE} />

      <section className="pub-section">
        <div className="pub-wrap">
          <div className="pub-section-head">
            <p className="pub-kicker">Según lo que necesitas</p>
            <h2>Dinos para qué lo quieres.</h2>
          </div>
          <div className="pub-scenes">
            {SCENES.map((scene) => (
              <article key={scene.title}>
                <h3>{scene.title}</h3>
                <p>{scene.text}</p>
                <Link href={scene.href}>{scene.label}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <StepStory
        steps={PATH.map((step, index) => ({
          ...step,
          image: [
            "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
          ][index],
        }))}
      />

      <section className="pub-section">
        <div className="pub-wrap">
          <div className="pub-section-head">
            <p className="pub-kicker">Cuentas, tarjetas y patrimonio</p>
            <h2>Cuenta, tarjeta y fondo, en el mismo lugar.</h2>
            <p>Cuando pides tu crédito también puedes abrir la cuenta, la tarjeta y el fondo de ahorro.</p>
          </div>
          <div className="pub-mini-grid">
            {relationship.map((product) => {
              const facts = OFFER_FACTS[product.slug];
              return (
                <article key={product.slug}>
                  <p>{facts.group === "patrimonio" ? "Patrimonio" : "Cuenta"}</p>
                  <h3>{product.name}</h3>
                  <p>{product.summary}</p>
                  <dl>
                    <div>
                      <dt>Condición</dt>
                      <dd>{facts.amount}</dd>
                    </div>
                    <div>
                      <dt>Para quién</dt>
                      <dd>{facts.audience}</dd>
                    </div>
                  </dl>
                  <Link href={solicitudHref(product.slug)}>Lo quiero</Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pub-docs">
        <div className="pub-wrap pub-docs-grid">
          <div>
            <p className="pub-kicker">Qué se revisa</p>
            <h2>Con esto ya puedes empezar.</h2>
            <p>
              Identificación, domicilio reciente e ingresos. Si pides para el negocio, agrega tu constancia fiscal. Si
              es el auto, la cotización. Si son facturas, las facturas.
            </p>
            <Link href="/registro" className="btn btn-green">
              Ya los tengo, quiero pedir
            </Link>
          </div>
          <ul>
            {catalogLines(
              "Identificación oficial vigente: INE o pasaporte\nComprobante de domicilio con máximo 3 meses\nIngresos: nómina, estados de cuenta o la actividad\nRFC y, en negocio, constancia de situación fiscal\nCLABE cuando el destino es crédito personal o de nómina",
            ).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <PhotoReel
        cards={[
          {
            image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80",
            title: "Nómina",
            text: "Desde $50,000 si tu ingreso llega por sueldo.",
            href: solicitudHref("credito-nomina"),
            cta: "Pedir nómina",
          },
          {
            image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80",
            title: "PyME",
            text: "Hasta $10,000,000 para la operación del negocio.",
            href: solicitudHref("credito-pyme"),
            cta: "Pedir PyME",
          },
          {
            image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=80",
            title: "Personal",
            text: "De $50,000 a $1,000,000, al plazo que elijas.",
            href: solicitudHref("credito-personal"),
            cta: "Pedir personal",
          },
          {
            image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1400&q=80",
            title: "Cuenta digital",
            text: "Ahí recibes el crédito cuando tu oferta está lista.",
            href: solicitudHref("cuenta-digital"),
            cta: "Conocer la cuenta",
          },
          {
            image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1400&q=80",
            title: "Tarjeta empresarial",
            text: "El gasto del negocio, separado del tuyo.",
            href: solicitudHref("tarjeta-empresarial"),
            cta: "Pedir la tarjeta",
          },
        ]}
      />

      <section className="pub-section">
        <div className="pub-wrap pub-office">
          <div>
            <p className="pub-kicker">Contacto</p>
            <h2>{BRAND.legalFull}</h2>
            <p>Te atendemos en el portal y en {BRAND.email}. Dejas tus datos y un asesor arma la oferta.</p>
            {brandAddressLines().length > 0 ? (
              <address>
                {brandAddressLines().map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            ) : null}
            <Link href="/contacto" className="btn btn-gold">
              Quiero que me contacten
            </Link>
          </div>
          <div className="card p-6 grid content-center gap-3">
            <p className="pub-kicker">Escríbenos</p>
            <a href={`mailto:${BRAND.email}`} className="text-xl font-black text-[var(--verde2)]">
              {BRAND.email}
            </a>
            <p>El expediente se sigue en el portal, con tu folio.</p>
          </div>
        </div>
      </section>

      <section className="pub-close">
        <div className="pub-wrap">
          <h2>Pide el tuyo hoy.</h2>
          <p>Dejas tus datos en unos minutos y un asesor te arma la oferta.</p>
          <div className="pub-hero-actions" style={{ justifyContent: "center" }}>
            <Link href="/registro" className="btn btn-gold">
              Quiero mi crédito
            </Link>
            <Link href="/faq" className="btn btn-light">
              Preguntas frecuentes
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
