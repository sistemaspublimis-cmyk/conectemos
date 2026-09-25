import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { queueEmail } from "@/lib/email";
import type { DocumentStatus } from "@prisma/client";

const ALLOWED: DocumentStatus[] = ["PENDING", "RECEIVED", "IN_REVIEW", "APPROVED", "REJECTED", "NEEDS_CORRECTION"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = String(body?.status || "") as DocumentStatus;
  const comments = String(body?.comments || "").trim();
  if (!ALLOWED.includes(status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  if ((status === "REJECTED" || status === "NEEDS_CORRECTION") && !comments) {
    return NextResponse.json({ error: "Escribe el motivo." }, { status: 400 });
  }
  const doc = await prisma.clientDocument.update({
    where: { id },
    data: {
      status,
      comments,
      reviewedById: ctx.user.id,
      reviewedAt: new Date(),
    },
    include: { client: { include: { user: true } } },
  });
  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: doc.clientId,
    action: status === "APPROVED" ? "DOCUMENT_APPROVED" : status === "REJECTED" ? "DOCUMENT_REJECTED" : "DOCUMENT_STATUS_CHANGED",
    ip: meta.ip,
    meta: { status, comments, documentId: doc.id },
  });
  if (status === "NEEDS_CORRECTION" || status === "REJECTED") {
    await createNotification({
      clientId: doc.clientId,
      type: "DOCUMENTO",
      title: "Documento requiere corrección",
      message: comments,
      channelPanel: true,
      channelEmail: true,
    });
    await queueEmail({
      clientId: doc.clientId,
      eventType: "DOCUMENTO_RECHAZADO",
      toEmail: doc.client.user.email,
      subject: "Documento requiere corrección",
      body: comments,
    });
  }
  return NextResponse.json({ ok: true });
}
