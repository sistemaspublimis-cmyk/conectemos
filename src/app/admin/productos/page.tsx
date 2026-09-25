import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PRODUCT_KIND_LABEL } from "@/lib/product-catalog";
import { ProductCatalogForm, ProductDeactivateButton } from "@/components/admin/product-catalog-form";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const editing = products.find((p) => p.id === edit) || null;

  return (
    <div>
      <h1 className="text-2xl font-black">Productos</h1>
      <p className="text-sm text-[var(--muted)]">
        Catálogo visible al cliente. Desactivar oculta el producto; no se borran contrataciones.
      </p>

      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Activo</th>
              <th>Requiere cuenta básica</th>
              <th>Orden</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-[var(--muted)]">
                  No hay productos. El seed carga el catálogo inicial.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.name}
                  <div className="text-[11px] text-[var(--muted)]">{p.slug}</div>
                </td>
                <td>{PRODUCT_KIND_LABEL[p.kind]}</td>
                <td>{p.active ? "Sí" : "No"}</td>
                <td>{p.requiresBasicAccount ? "Sí" : "No"}</td>
                <td>{p.sortOrder}</td>
                <td>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Link href={`/admin/productos?edit=${p.id}`} className="text-[#1255a4] font-bold">
                      Editar
                    </Link>
                    <ProductDeactivateButton id={p.id} active={p.active} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5 mt-4">
        <ProductCatalogForm
          key={editing?.id || "new"}
          initial={
            editing
              ? {
                  id: editing.id,
                  name: editing.name,
                  slug: editing.slug,
                  kind: editing.kind,
                  summary: editing.summary,
                  description: editing.description,
                  benefits: editing.benefits,
                  requirements: editing.requirements,
                  imageUrl: editing.imageUrl || "",
                  requiresBasicAccount: editing.requiresBasicAccount,
                  active: editing.active,
                  sortOrder: editing.sortOrder,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
