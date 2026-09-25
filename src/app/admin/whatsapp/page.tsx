import { prisma } from "@/lib/prisma";
import { whatsappConfigured } from "@/lib/whatsapp";
import { PendingNotice } from "@/components/pending-notice";
import { StatusBadge } from "@/components/status-badge";

export default async function WhatsappPage() {
  const rows = await prisma.conversation.findMany({
    orderBy: { lastAt: "desc" },
    include: { client: { include: { user: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return (
    <div>
      <h1 className="text-2xl font-black">WhatsApp</h1>
      {!whatsappConfigured() && (
        <PendingNotice title="WhatsApp no conectado">
          Webhook listo en /api/webhooks/whatsapp. Configura WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID para envío real.
        </PendingNotice>
      )}
      <div className="card mt-4 p-4 grid gap-3">
        {rows.length === 0 && <p className="text-sm text-[var(--muted)]">No hay conversaciones.</p>}
        {rows.map((c) => (
          <div key={c.id} className="border-b pb-2 text-sm">
            <b>{c.client ? `${c.client.user.firstName} ${c.client.user.lastName}` : c.phone}</b>
            <div className="text-xs text-[var(--muted)]">{c.lastMessage}</div>
            {c.messages[0] && <StatusBadge status={c.messages[0].status} />}
          </div>
        ))}
      </div>
    </div>
  );
}
