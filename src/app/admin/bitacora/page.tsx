import { prisma } from "@/lib/prisma";

export default async function BitacoraPage() {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { actor: true, client: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">Bitácora</h1>
      <p className="text-xs text-[var(--muted)]">Solo lectura. No se puede editar desde la interfaz.</p>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[900px]">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Cliente</th>
              <th>IP</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>Sin registros.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.createdAt.toLocaleString("es-MX")}</td>
                <td>{r.actor ? `${r.actor.firstName} ${r.actor.lastName}` : "sistema"}</td>
                <td>{r.action}</td>
                <td>{r.client?.folio || "—"}</td>
                <td>{r.ip || "—"}</td>
                <td className="max-w-[280px] truncate">{r.meta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
