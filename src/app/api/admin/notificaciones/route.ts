import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createNotification } from "@/lib/notify";
import { audit, requestMeta } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const clientId = String(body?.clientId || "");
  const title = String(body?.title || "").trim();
  const message = String(body?.message || "").trim();
  const type = String(body?.type || "GENERAL");
  if (!clientId || !title || !message) {
    return NextResponse.json({ error: "Usuario, título y mensaje son obligatorios." }, { status: 400 });
  }
  const n = await createNotification({
    clientId,
    type,
    title,
    message,
    channelPanel: Boolean(body?.channelPanel),
    channelEmail: Boolean(body?.channelEmail),
    channelWhatsapp: Boolean(body?.channelWhatsapp),
  });
  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId,
    action: "NOTIFICATION_CREATED",
    ip: meta.ip,
    meta: {
      id: n.id,
      channelPanel: n.channelPanel,
      channelEmail: n.channelEmail,
      channelWhatsapp: n.channelWhatsapp,
      emailStatus: n.emailStatus,
      whatsappStatus: n.whatsappStatus,
    },
  });
  return NextResponse.json({
    ok: true,
    emailStatus: n.emailStatus,
    whatsappStatus: n.whatsappStatus,
  });
}
