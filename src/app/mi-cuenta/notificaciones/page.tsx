import { redirect } from "next/navigation";
import { getClientContext } from "@/lib/client-context";
import { MarkRead } from "./mark-read";

export default async function NotificacionesPage() {
  const ctx = await getClientContext();
  if (!ctx) redirect("/login");
  return (
    <div>
      <h1 className="text-2xl font-black text-[var(--verde2)]">Notificaciones</h1>
      <div className="grid gap-3 mt-4">
        {ctx.client.notifications.length === 0 && <p className="text-sm text-[var(--muted)]">No tienes avisos.</p>}
        {ctx.client.notifications.map((n) => (
          <article key={n.id} className={`card p-4 ${n.readAt ? "" : "border-[var(--dorado)]"}`}>
            <div className="flex justify-between gap-3">
              <h2 className="font-bold">{n.title}</h2>
              <time className="text-xs text-[var(--muted)]">{n.createdAt.toLocaleString("es-MX")}</time>
            </div>
            <p className="text-sm mt-1">{n.message}</p>
            <div className="text-xs text-[var(--muted)] mt-2">
              {n.readAt ? "Leída" : "No leída"}
              {n.channelEmail ? ` · correo: ${n.emailStatus === "SENT" ? "enviado" : n.emailStatus === "PREPARED" ? "preparado" : n.emailStatus}` : ""}
              {n.channelWhatsapp ? ` · WhatsApp: ${n.whatsappStatus === "SENT" ? "enviado" : "no enviado"}` : ""}
            </div>
            {!n.readAt && <MarkRead id={n.id} />}
          </article>
        ))}
      </div>
    </div>
  );
}
