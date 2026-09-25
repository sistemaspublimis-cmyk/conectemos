import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { parseAmount, toNumber } from "@/lib/money";
import { createNotification } from "@/lib/notify";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const displayed = parseAmount(String(body?.displayedAmount ?? ""));
  const authorized = parseAmount(String(body?.authorizedAmount ?? "0"));
  if (displayed == null) return NextResponse.json({ error: "Monto mostrado inválido" }, { status: 400 });

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  const previous = toNumber(client.displayedAmount);
  await prisma.$transaction([
    prisma.client.update({
      where: { id },
      data: {
        displayedAmount: displayed,
        authorizedAmount: authorized ?? toNumber(client.authorizedAmount),
      },
    }),
    prisma.amountHistory.create({
      data: {
        clientId: id,
        previous,
        next: displayed,
        changedById: ctx.user.id,
        note: String(body?.note || ""),
      },
    }),
  ]);

  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: id,
    action: "DISPLAYED_AMOUNT_CHANGED",
    ip: meta.ip,
    userAgent: meta.userAgent,
    meta: { previous, next: displayed, authorized },
  });
  await createNotification({
    clientId: id,
    type: "MONTO",
    title: "Actualización de monto",
    message: `El monto visible de tu financiamiento fue actualizado.`,
    channelPanel: true,
  });
  return NextResponse.json({ ok: true });
}
