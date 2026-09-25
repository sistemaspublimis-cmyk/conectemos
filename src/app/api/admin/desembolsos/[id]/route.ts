import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { parseAmount } from "@/lib/money";
import { queueEmail } from "@/lib/email";
import { createNotification } from "@/lib/notify";
import type { DisbursementStatus } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = String(body?.status || "") as DisbursementStatus;
  const amount = parseAmount(String(body?.amount ?? "0")) ?? 0;
  const note = String(body?.note || "");
  if (!["PENDING", "PREPARED", "REGISTERED", "CANCELLED"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  const registered = status === "REGISTERED";
  await prisma.disbursement.upsert({
    where: { clientId: id },
    create: {
      clientId: id,
      amount,
      status,
      note,
      registeredById: registered ? ctx.user.id : null,
      registeredAt: registered ? new Date() : null,
    },
    update: {
      amount,
      status,
      note,
      registeredById: registered ? ctx.user.id : undefined,
      registeredAt: registered ? new Date() : undefined,
    },
  });
  await prisma.client.update({
    where: { id },
    data: { disbursedAmount: registered ? amount : client.disbursedAmount },
  });
  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: id,
    action: registered ? "DISBURSEMENT_REGISTERED" : "DISBURSEMENT_UPDATED",
    ip: meta.ip,
    meta: { status, amount },
  });
  if (registered) {
    await createNotification({
      clientId: id,
      type: "DESEMBOLSO",
      title: "Desembolso registrado",
      message: "Tu desembolso ya quedó registrado. Consulta el monto y el estatus en tu cuenta.",
      channelPanel: true,
    });
    const user = await prisma.user.findUnique({ where: { id: client.userId } });
    if (user) {
      await queueEmail({
        clientId: id,
        eventType: "DESEMBOLSO_REGISTRADO",
        toEmail: user.email,
        subject: `Desembolso registrado · ${client.folio}`,
        body: "Se registró un desembolso en tu expediente.",
      });
    }
  }
  return NextResponse.json({ ok: true });
}
