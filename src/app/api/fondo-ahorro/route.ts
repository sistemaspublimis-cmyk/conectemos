import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";
import { audit, requestMeta } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { application: true, savingsFund: true },
  });
  if (!client) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });
  if (client.application?.status !== "APPROVED") {
    return NextResponse.json({ error: "Disponible después de la autorización." }, { status: 403 });
  }

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecciona el comprobante." }, { status: 400 });
  }

  try {
    const stored = await saveUpload(file);
    const requested = Number(client.requestedAmount || client.authorizedAmount || 0);
    const amount = client.savingsFund?.amount
      ? Number(client.savingsFund.amount)
      : requested > 0
        ? Math.round(requested * 0.03 * 100) / 100
        : 0;

    await prisma.savingsFund.upsert({
      where: { clientId: client.id },
      create: {
        clientId: client.id,
        reference: `FA-${client.folio}`,
        amount,
        status: "VALIDATING",
        receiptName: stored.originalName,
        receiptStored: stored.storedName,
      },
      update: {
        status: "VALIDATING",
        receiptName: stored.originalName,
        receiptStored: stored.storedName,
      },
    });

    const meta = requestMeta(req.headers);
    await audit({
      actorId: ctx.user.id,
      clientId: client.id,
      action: "SAVINGS_RECEIPT",
      ip: meta.ip,
      userAgent: meta.userAgent,
      meta: { file: stored.originalName },
    });

    return NextResponse.json({ ok: true, status: "VALIDATING" });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al subir" }, { status: 400 });
  }
}
