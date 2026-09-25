import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { REQUIRED_DOC_TYPES } from "@/lib/process";
import { DOCUMENT_TYPES } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { application: true, documents: true, study: true },
  });
  if (!client) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });
  if (!client.study?.submitted) {
    return NextResponse.json({ error: "Primero envía tu estudio socioeconómico." }, { status: 400 });
  }
  if (!client.application) {
    return NextResponse.json({ error: "Solicitud no encontrada." }, { status: 404 });
  }
  if (client.application.status === "APPROVED" || client.application.status === "REJECTED") {
    return NextResponse.json({ error: "La solicitud ya tiene un resultado." }, { status: 400 });
  }

  const uploaded = new Set(client.documents.map((d) => d.type));
  const missing = REQUIRED_DOC_TYPES.filter((type) => !uploaded.has(type));
  if (missing.length > 0) {
    const labels = missing.map((type) => DOCUMENT_TYPES.find((d) => d.value === type)?.label || type);
    return NextResponse.json(
      { error: `Faltan documentos requeridos: ${labels.join(", ")}.`, missing },
      { status: 400 },
    );
  }

  const now = new Date();
  await prisma.application.update({
    where: { id: client.application.id },
    data: {
      status: "IN_REVIEW",
      documentsSubmittedAt: now,
      reviewStartedAt: client.application.reviewStartedAt ?? now,
    },
  });

  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: client.id,
    action: "DOCUMENTS_SUBMITTED",
    ip: meta.ip,
  });
  await createNotification({
    clientId: client.id,
    type: "DOCUMENTO",
    title: "Documentos enviados",
    message: "Documentos enviados. Estamos revisando tu solicitud.",
    channelPanel: true,
  });

  return NextResponse.json({ ok: true });
}
