import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMXN } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string; estado?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { folio: { contains: q } },
            { user: { email: { contains: q } } },
            { user: { firstName: { contains: q } } },
            { user: { lastName: { contains: q } } },
            { user: { phone: { contains: q } } },
            { user: { whatsapp: { contains: q } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true, application: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-black">Clientes</h1>
      <form className="flex gap-2 mt-4">
        <input name="q" defaultValue={q} placeholder="Buscar folio, nombre, correo, teléfono" className="border rounded-lg px-3 py-2 flex-1" />
        <button className="btn btn-green">Buscar</button>
      </form>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[1000px]">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado usuario</th>
              <th>Solicitud</th>
              <th>Solicitado</th>
              <th>Autorizado</th>
              <th>Mostrado</th>
              <th>Registro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={11} className="text-[var(--muted)]">
                  No hay clientes.
                </td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id}>
                <td>{c.folio}</td>
                <td>
                  {c.user.firstName} {c.user.lastName}
                </td>
                <td>{c.user.email}</td>
                <td>{c.user.phone}</td>
                <td>
                  <StatusBadge status={c.user.status} />
                </td>
                <td>{c.application ? <StatusBadge status={c.application.status} /> : "—"}</td>
                <td>{formatMXN(c.requestedAmount)}</td>
                <td>{formatMXN(c.authorizedAmount)}</td>
                <td>{formatMXN(c.displayedAmount)}</td>
                <td>{c.createdAt.toLocaleDateString("es-MX")}</td>
                <td>
                  <Link href={`/admin/clientes/${c.id}`} className="text-[#1255a4] font-bold">
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
