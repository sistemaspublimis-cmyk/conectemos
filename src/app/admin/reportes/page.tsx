import { dashboardStats } from "@/lib/admin-counts";
import { prisma } from "@/lib/prisma";
import { formatMXN } from "@/lib/money";

export default async function ReportesPage() {
  const stats = await dashboardStats();
  const [docs, emails, disbursements] = await Promise.all([
    prisma.clientDocument.count(),
    prisma.emailMessage.count(),
    prisma.disbursement.count({ where: { status: "REGISTERED" } }),
  ]);
  const items = [
    ["Clientes", stats.clients],
    ["Solicitudes en proceso", stats.inProcess],
    ["Aprobadas", stats.approved],
    ["Monto autorizado", formatMXN(stats.authorized)],
    ["Monto desembolsado (registro)", formatMXN(stats.disbursed)],
    ["Documentos recibidos", docs],
    ["Correos (todos los estados)", emails],
    ["Desembolsos registrados", disbursements],
  ];
  return (
    <div>
      <h1 className="text-2xl font-black">Reportes</h1>
      <p className="text-sm text-[var(--muted)]">Cifras reales de la base de datos.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {items.map(([l, v]) => (
          <div key={String(l)} className="card p-4">
            <div className="text-xs text-[var(--muted)]">{l}</div>
            <div className="text-xl font-black mt-1">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
