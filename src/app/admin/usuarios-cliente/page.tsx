import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";

export default async function UsuariosClientePage() {
  const rows = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">Cuentas de clientes</h1>
      <p className="text-sm text-[var(--muted)]">Personas que piden crédito. El equipo (dueño, gerentes, asesores) está en Equipo.</p>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Última actividad</th>
              <th>Folio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>Sin usuarios.</td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.firstName} {u.lastName}
                </td>
                <td>{u.email}</td>
                <td>
                  <StatusBadge status={u.status} />
                </td>
                <td>{u.lastActivityAt?.toLocaleString("es-MX") || "—"}</td>
                <td>{u.client?.folio}</td>
                <td>
                  {u.client && (
                    <Link href={`/admin/clientes/${u.client.id}?tab=datos`} className="text-[#1255a4]">
                      Gestionar
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
