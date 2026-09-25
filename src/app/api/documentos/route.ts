import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";
import { audit, requestMeta } from "@/lib/audit";
import { queueEmail } from "@/lib/email";
import { createNotification } from "@/lib/notify";
import { REQUIRED_DOC_TYPES } from "@/lib/process";
import type { DocumentType } from "@prisma/client";

const TYPES: DocumentType[] = REQUIRED_DOC_TYPES;

export async function POST(req: NextRequest) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { application: true, documents: true },
  });
  if (!client) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });

  const fd = await req.formData();
  const type = String(fd.get("type") || "") as DocumentType;
  const file = fd.get("file");
  if (!TYPES.includes(type) || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecciona tipo y archivo." }, { status: 400 });
  }
  try {
    const stored = await saveUpload(file);
    const doc = await prisma.clientDocument.create({
      data: {
        clientId: client.id,
        type,
        originalName: stored.originalName,
        storedName: stored.storedName,
        mimeType: stored.mimeType,
        size: stored.size,
        status: "RECEIVED",
      },
    });
    if (client.application && (client.application.status === "STUDY_COMPLETED" || !client.application.status)) {
      await prisma.application.update({
        where: { id: client.application.id },
        data: { status: "DOCUMENTS_PENDING" },
      });
    }
    const meta = requestMeta(req.headers);
    await audit({
      actorId: ctx.user.id,
      clientId: client.id,
      action: "DOCUMENT_RECEIVED",
      ip: meta.ip,
      meta: { type, documentId: doc.id },
    });
    await queueEmail({
      clientId: client.id,
      eventType: "DOCUMENTO_RECIBIDO",
      toEmail: ctx.user.email,
      subject: `Documento recibido · ${client.folio}`,
      body: `Recibimos ${stored.originalName}. Queda en revisión.`,
    });
    await createNotification({
      clientId: client.id,
      type: "DOCUMENTO",
      title: "Documento recibido",
      message: `${stored.originalName} quedó en estado Recibido.`,
      channelPanel: true,
    });
    return NextResponse.json({ ok: true, id: doc.id });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al subir" }, { status: 400 });
  }
}
