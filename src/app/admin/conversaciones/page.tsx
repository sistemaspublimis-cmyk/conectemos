import { prisma } from "@/lib/prisma";
import { whatsappConfigured } from "@/lib/whatsapp";
import { PendingNotice } from "@/components/pending-notice";

export default async function ConversacionesPage() {
  const rows = await prisma.conversation.findMany({
    orderBy: { lastAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } }, client: { include: { user: true } } },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">Conversaciones</h1>
      {!whatsappConfigured() && <PendingNotice title="WhatsApp no conectado">Configura Cloud API para ver y enviar mensajes.</PendingNotice>}
      <div className="grid gap-4 mt-4">
        {rows.length === 0 && <p className="text-sm">Sin conversaciones.</p>}
        {rows.map((c) => (
          <article key={c.id} className="card p-4">
            <h3 className="font-bold">
              {c.client ? `${c.client.user.firstName} ${c.client.user.lastName}` : "Sin cliente"} · {c.phone}
            </h3>
            <div className="mt-2 grid gap-1 text-sm">
              {c.messages.map((m) => (
                <div key={m.id} className={m.direction === "outbound" ? "text-right" : ""}>
                  <span className="inline-block bg-[#eef8f3] rounded-lg px-3 py-1">
                    {m.body} <small className="text-[10px]">{m.status}</small>
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
