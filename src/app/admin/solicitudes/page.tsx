import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMXN } from "@/lib/money";
import { StatusBadge } from "@/components/status-badge";

export default async function SolicitudesPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const rows = await prisma.application.findMany({
    where: estado ? { status: estado as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: { client: { include: { user: true } }, reviewedBy: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">Solicitudes</h1>
      <form className="mt-3">
        <select name="estado" defaultValue={estado || ""} className="border rounded-lg p-2 text-sm">
          <option value="">Todos los estados</option>
          <option value="STUDY_PENDING">Estudio pendiente</option>
          <option value="DOCUMENTS_PENDING">Documentos pendientes</option>
          <option value="IN_REVIEW">En revisión</option>
          <option value="INFO_REQUESTED">Información solicitada</option>
          <option value="APPROVED">Aprobada</option>
          <option value="REJECTED">Rechazada</option>
        </select>
        <button className="btn btn-green ml-2 !py-2">Filtrar</button>
      </form>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[900px]">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Responsable</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8}>No hay solicitudes.</td>
              </tr>
            )}
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{a.folio}</td>
                <td>
                  {a.client.user.firstName} {a.client.user.lastName}
                </td>
                <td>{a.product}</td>
                <td>{formatMXN(a.amount)}</td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td>{a.reviewedBy ? `${a.reviewedBy.firstName} ${a.reviewedBy.lastName}` : "—"}</td>
                <td>{a.createdAt.toLocaleDateString("es-MX")}</td>
                <td>
                  <Link href={`/admin/clientes/${a.clientId}`} className="text-[#1255a4] font-bold">
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
