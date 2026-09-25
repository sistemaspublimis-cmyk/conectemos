import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { CATALOG_SEED } from "@/lib/product-catalog";
import { WelcomeLink } from "./welcome-actions";

const WELCOME_SLUGS = [
  "credito-personal",
  "credito-pyme",
  "arrendamiento-financiero",
  "factoraje",
  "tarjeta-credito",
  "cuenta-empresarial",
] as const;

export default async function BienvenidaPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  if (ctx.user.welcomeSeenAt) redirect("/mi-cuenta");
  const firstName = ctx.user.firstName?.trim() || "cliente";
  const products = WELCOME_SLUGS.map((slug) => CATALOG_SEED.find((item) => item.slug === slug)).filter(
    (item): item is (typeof CATALOG_SEED)[number] => Boolean(item),
  );

  return (
    <div className="product-page">
      <section className="product-hero fade-up">
        <p className="client-kicker">Conectemos</p>
        <h1>Bienvenido, {firstName}</h1>
        <p className="product-hero-lead">
          Tu expediente {ctx.client.folio} ya está creado. Aún no tienes productos contratados. Revisa las opciones
          disponibles y continúa tu solicitud cuando quieras.
        </p>
      </section>

      <section className="fade-up delay-1">
        <h2 className="client-section-title">Conoce nuestros productos</h2>
        <p className="client-section-copy">Información general para que elijas con claridad. La contratación se hace más adelante.</p>
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.slug} className="card overflow-hidden bank-card">
              <img src={product.imageUrl} alt="" className="w-full h-36 object-cover" />
              <div className="p-5">
                <p className="product-card-kicker">Producto Conectemos</p>
                <h3 className="text-lg font-black text-[var(--verde2)] m-0">{product.name}</h3>
                <p className="product-card-copy mt-2">{product.summary}</p>
                <p className="product-card-copy">{product.description.split(".")[0]}.</p>
                <WelcomeLink href={`/mi-cuenta/productos/${product.slug}`} className="btn btn-light mt-4 w-full">
                  Ver información
                </WelcomeLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="notice notice-gold fade-up delay-2">
        Para contratar un producto adicional primero necesitas una cuenta básica.
      </div>

      <div className="flex flex-wrap gap-2 fade-up delay-2">
        <WelcomeLink href="/mi-cuenta/estudio" className="btn btn-green">
          Continuar mi solicitud
        </WelcomeLink>
        <WelcomeLink href="/mi-cuenta/productos" className="btn btn-light">
          Ver productos
        </WelcomeLink>
      </div>
    </div>
  );
}
