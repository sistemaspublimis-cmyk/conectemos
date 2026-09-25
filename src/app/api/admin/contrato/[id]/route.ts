import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { queueEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const text = String(body?.body || "");
  await prisma.contract.upsert({
    where: { clientId: id },
    create: { clientId: id, body: text, status: "PREPARED", preparedAt: new Date() },
    update: { body: text, status: "PREPARED", preparedAt: new Date() },
  });
  const client = await prisma.client.findUnique({ where: { id }, include: { user: true } });
  if (client) {
    await queueEmail({
      clientId: id,
      eventType: "CONTRATO_PREPARADO",
      toEmail: client.user.email,
      subject: `Contrato preparado · ${client.folio}`,
      body: "Tu contrato ya está listo. Entra a tu cuenta para revisarlo y firmarlo.",
    });
  }
  const meta = requestMeta(req.headers);
  await audit({ actorId: ctx.user.id, clientId: id, action: "CONTRACT_PREPARED", ip: meta.ip });
  return NextResponse.json({ ok: true, status: "PREPARED" });
}
