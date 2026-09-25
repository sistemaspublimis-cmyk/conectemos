import { prisma } from "@/lib/prisma";
import { NotifyForm } from "@/components/admin/forms";

export default async function NotificacionesAdminPage() {
  const [clients, notes] = await Promise.all([
    prisma.client.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { client: { include: { user: true } } } }),
  ]);
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div>
        <h1 className="text-2xl font-black mb-4">Notificaciones</h1>
        <div className="card p-4">
          <NotifyForm
            clients={clients.map((c) => ({
              id: c.id,
              label: `${c.user.firstName} ${c.user.lastName} · ${c.folio}`,
            }))}
          />
        </div>
      </div>
      <div className="card p-4">
        <h2 className="font-bold mb-3">Recientes</h2>
        {notes.length === 0 && <p className="text-sm">Sin notificaciones.</p>}
        {notes.map((n) => (
          <div key={n.id} className="text-sm py-2 border-b">
            <b>{n.title}</b>
            <div className="text-xs">
              {n.client.user.firstName} · {n.readAt ? "Leída" : "No leída"} · {n.createdAt.toLocaleString("es-MX")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
