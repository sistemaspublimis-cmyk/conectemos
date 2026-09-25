import { prisma } from "@/lib/prisma";

export default async function SesionesPage() {
  const rows = await prisma.session.findMany({
    where: { revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
    orderBy: { lastSeenAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">Vista de sesión del usuario</h1>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>IP</th>
              <th>Dispositivo</th>
              <th>Página</th>
              <th>Última actividad</th>
              <th>Inicio</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>No hay sesiones activas.</td>
              </tr>
            )}
            {rows.map((s) => (
              <tr key={s.id}>
                <td>
                  {s.user.firstName} {s.user.lastName}
                </td>
                <td>{s.user.role}</td>
                <td>{s.ip || "—"}</td>
                <td className="max-w-[220px] truncate">{s.userAgent || "—"}</td>
                <td>{s.currentPath || "—"}</td>
                <td>{s.lastSeenAt.toLocaleString("es-MX")}</td>
                <td>{s.createdAt.toLocaleString("es-MX")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
