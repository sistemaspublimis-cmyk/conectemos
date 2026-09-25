import { NextResponse } from "next/server";
import { requireClient } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit, requestMeta } from "@/lib/audit";

export async function POST(req: Request) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { contract: true },
  });
  if (!client) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const hasStroke = Boolean(body?.preview);
  if (!hasStroke) {
    return NextResponse.json({ error: "Dibuja tu firma para continuar." }, { status: 400 });
  }

  await prisma.contract.upsert({
    where: { clientId: client.id },
    create: {
      clientId: client.id,
      status: "PENDING_SIGNATURE",
      signatureDraftAt: new Date(),
    },
    update: {
      signatureDraftAt: new Date(),
      status: client.contract?.status === "PREPARED" ? "PENDING_SIGNATURE" : client.contract?.status || "PENDING_SIGNATURE",
    },
  });

  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: client.id,
    action: "CONTRACT_SIGNATURE_DRAFT",
    ip: meta.ip,
    meta: { note: "Firma recibida en el expediente." },
  });

  return NextResponse.json({
    ok: true,
    signed: true,
    message: "Firma recibida. Quedó registrada en tu expediente.",
  });
}
