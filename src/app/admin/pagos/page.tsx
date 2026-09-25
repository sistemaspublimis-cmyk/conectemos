import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMXN } from "@/lib/money";

export default async function PagosPage() {
  const rows = await prisma.client.findMany({
    include: { user: true, disbursement: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">Pagos y Fondos</h1>
      <p className="text-sm text-[var(--muted)]">Montos autorizados, mostrados y desembolsados por cliente.</p>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Autorizado</th>
              <th>Mostrado</th>
              <th>Desembolsado</th>
              <th>Estado desembolso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>Sin registros.</td>
              </tr>
            )}
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.user.firstName} {c.user.lastName}
                </td>
                <td>{formatMXN(c.authorizedAmount)}</td>
                <td>{formatMXN(c.displayedAmount)}</td>
                <td>{formatMXN(c.disbursedAmount)}</td>
                <td>{c.disbursement?.status || "PENDIENTE"}</td>
                <td>
                  <Link href={`/admin/clientes/${c.id}?tab=monto`} className="text-[#1255a4]">
                    Expediente
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
