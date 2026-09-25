import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";

export default async function DocsEnviadosPage() {
  const rows = await prisma.generatedDocument.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { include: { user: true } }, generatedBy: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">Documentos enviados</h1>
      <p className="text-sm text-[var(--muted)] mt-1">
        Aquí aparecen documentos generados. El estado real es Preparado hasta que exista un envío verdadero.
      </p>
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Generó</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>Sin documentos generados.</td>
              </tr>
            )}
            {rows.map((d) => (
              <tr key={d.id}>
                <td>{d.fileName}</td>
                <td>
                  {d.client.user.firstName} {d.client.user.lastName}
                </td>
                <td>
                  <StatusBadge status={d.status} />
                </td>
                <td>{d.generatedBy ? `${d.generatedBy.firstName}` : "—"}</td>
                <td>{d.createdAt.toLocaleString("es-MX")}</td>
                <td>
                  <a href={`/api/archivos/${d.id}`} className="text-[#1255a4]">
                    Descargar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
