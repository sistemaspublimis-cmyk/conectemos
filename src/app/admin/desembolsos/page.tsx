import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMXN } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

export default async function DesembolsosPage() {
  const rows = await prisma.disbursement.findMany({
    include: { client: { include: { user: true } }, registeredBy: true },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">Desembolsos</h1>
      <p className="text-sm text-[var(--muted)]">Confirma aquí cada desembolso para que el cliente lo vea en su cuenta.</p>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Registró</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>Sin desembolsos.</td>
              </tr>
            )}
            {rows.map((d) => (
              <tr key={d.id}>
                <td>
                  {d.client.user.firstName} {d.client.user.lastName}
                </td>
                <td>{formatMXN(d.amount)}</td>
                <td>
                  <StatusBadge status={d.status} />
                </td>
                <td>{d.registeredBy ? `${d.registeredBy.firstName}` : "—"}</td>
                <td>{d.registeredAt?.toLocaleString("es-MX") || "—"}</td>
                <td>
                  <Link href={`/admin/clientes/${d.clientId}?tab=desembolso`}>Expediente</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
