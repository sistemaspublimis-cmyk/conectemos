import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ContratosPage() {
  const rows = await prisma.contract.findMany({
    include: { client: { include: { user: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">Contratos</h1>
      <p className="text-sm text-[var(--muted)]">Prepara el contrato de cada expediente y da seguimiento a la firma del cliente.</p>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Folio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4}>Sin contratos.</td>
              </tr>
            )}
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.client.user.firstName} {c.client.user.lastName}
                </td>
                <td>{c.client.folio}</td>
                <td>{c.status === "PREPARED" ? "Preparado" : "Borrador"}</td>
                <td>
                  <Link href={`/admin/clientes/${c.clientId}?tab=contrato`} className="text-[#1255a4]">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
