import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { requireAdmin } from "@/lib/auth";
import { ROLE_BLURB, ROLE_LABEL } from "@/lib/staff";
import { StaffForm } from "@/components/admin/staff-form";
import type { Role } from "@prisma/client";

export default async function UsuariosRolesPage() {
  const ctx = await requireAdmin();
  const rows = await prisma.user.findMany({
    where: { NOT: { role: "CLIENT" } },
    orderBy: { createdAt: "asc" },
  });
  const owner = ctx?.user.role === "ADMIN";

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-black m-0">Equipo</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Quién opera el panel. Los clientes no van aquí: sus cuentas están en «Cuentas de clientes».
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {(Object.keys(ROLE_BLURB) as Exclude<Role, "CLIENT">[]).map((role) => (
          <article key={role} className="card p-4">
            <b className="text-[var(--verde2)]">{ROLE_LABEL[role]}</b>
            <p className="text-sm text-[var(--muted)] mt-1 mb-0">{ROLE_BLURB[role]}</p>
          </article>
        ))}
      </div>

      {owner ? <StaffForm /> : <p className="text-sm text-[var(--muted)]">Solo el dueño puede dar de alta gerentes y asesores.</p>}

      <div className="card overflow-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.firstName} {u.lastName}
                </td>
                <td>{u.email}</td>
                <td>{ROLE_LABEL[u.role]}</td>
                <td>
                  <StatusBadge status={u.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
