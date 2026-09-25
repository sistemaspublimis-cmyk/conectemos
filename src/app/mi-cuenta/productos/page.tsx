import Link from "next/link";
import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { CATALOG_SEED } from "@/lib/product-catalog";
import { CLIENT_PRODUCT_STATUS_LABEL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function ProductosClientePage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  const dbProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  const products = dbProducts.length ? dbProducts : CATALOG_SEED;
  const bySlug = new Map(ctx.client.products.map((row) => [row.product.slug, row]));
  const contracted = ctx.client.products.filter((row) => row.status === "CONTRACTED");

  return (
    <div className="product-page">
      <section className="product-hero fade-up">
        <p className="client-kicker">Productos Conectemos</p>
        <h1>Conoce nuestros productos</h1>
        <p className="product-hero-lead">
          {contracted.length
            ? `Tienes ${contracted.length} producto(s) contratado(s). Revisa el catálogo o contrata adicionales.`
            : "Aún no tienes productos contratados. Revisa las opciones. Para contratar un producto adicional primero necesitas una cuenta básica."}
        </p>
      </section>

      <div className="product-grid fade-up delay-1">
        {products.map((product) => {
          const row = bySlug.get(product.slug);
          const status = row?.status;
          const blocked = Boolean(row?.blocked) || status === "BLOCKED" || status === "UNAVAILABLE";
          return (
            <article key={product.slug} className="card overflow-hidden bank-card">
              {product.imageUrl ? <img src={product.imageUrl} alt="" className="w-full h-36 object-cover" /> : null}
              <div className="p-5">
                <p className="product-card-kicker">Producto Conectemos</p>
                <h3 className="text-lg font-black text-[var(--verde2)] m-0">{product.name}</h3>
                <p className="product-card-copy mt-2">{product.summary}</p>
                {status ? (
                  <p className="text-xs font-bold mt-2 text-[var(--verde)]">
                    {blocked ? row?.tapMessage || "No disponible" : CLIENT_PRODUCT_STATUS_LABEL[status] || status}
                  </p>
                ) : null}
                <Link href={`/mi-cuenta/productos/${product.slug}`} className="btn btn-light mt-4 inline-flex">
                  Ver información
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
