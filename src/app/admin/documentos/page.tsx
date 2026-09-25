import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { DOCUMENT_TYPES } from "@/lib/constants";

export default async function DocumentosAdminPage() {
  const rows = await prisma.clientDocument.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { include: { user: true } } },
  });
  const label = (t: string) => DOCUMENT_TYPES.find((d) => d.value === t)?.label || t;
  return (
    <div>
      <h1 className="text-2xl font-black">Documentos recibidos</h1>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Archivo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>Sin documentos.</td>
              </tr>
            )}
            {rows.map((d) => (
              <tr key={d.id}>
                <td>
                  {d.client.user.firstName} {d.client.user.lastName}
                </td>
                <td>{label(d.type)}</td>
                <td>
                  <a href={`/api/documentos/${d.id}/file`} className="text-[#1255a4]" target="_blank">
                    {d.originalName}
                  </a>
                </td>
                <td>
                  <StatusBadge status={d.status} />
                </td>
                <td>{d.createdAt.toLocaleString("es-MX")}</td>
                <td>
                  <Link href={`/admin/clientes/${d.clientId}?tab=documentos`}>Expediente</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
