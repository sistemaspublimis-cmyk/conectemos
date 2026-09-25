import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { gmailConfigured } from "@/lib/email";
import { PendingNotice } from "@/components/pending-notice";

export default async function CorreosPage() {
  const rows = await prisma.emailMessage.findMany({ orderBy: { createdAt: "desc" }, include: { client: true } });
  return (
    <div>
      <h1 className="text-2xl font-black">Correos</h1>
      {!gmailConfigured() && (
        <PendingNotice title="Gmail no configurado">Los correos se guardan como Preparados. Configura GMAIL_USER y GMAIL_APP_PASSWORD.</PendingNotice>
      )}
      <div className="card mt-4 overflow-auto">
        <table className="admin-table min-w-[800px]">
          <thead>
            <tr>
              <th>Para</th>
              <th>Asunto</th>
              <th>Evento</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5}>Sin correos.</td>
              </tr>
            )}
            {rows.map((e) => (
              <tr key={e.id}>
                <td>{e.toEmail}</td>
                <td>{e.subject}</td>
                <td>{e.eventType}</td>
                <td>
                  <StatusBadge status={e.status} />
                </td>
                <td>{e.createdAt.toLocaleString("es-MX")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
