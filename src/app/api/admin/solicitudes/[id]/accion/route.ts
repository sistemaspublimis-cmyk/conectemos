import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { queueEmail } from "@/lib/email";
import { createNotification } from "@/lib/notify";
import { grantAuthorizedCredit } from "@/lib/credit-grant";
import type { ApplicationStatus } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action = String(body?.action || "");
  const note = String(body?.note || "").trim();
  const app = await prisma.application.findUnique({
    where: { id },
    include: { client: { include: { user: true } } },
  });
  if (!app) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });

  let status: ApplicationStatus = app.status;
  let actionName = "";
  let title = "";
  let message = "";
  let event = "";

  if (action === "aprobar") {
    status = "APPROVED";
    actionName = "APPLICATION_APPROVED";
    title = "Solicitud aprobada";
    message = `Tu solicitud ${app.folio} fue aprobada.`;
    event = "SOLICITUD_APROBADA";
    await grantAuthorizedCredit(app.clientId, ctx.user.id, "ADMIN");
  } else if (action === "rechazar") {
    if (!note) return NextResponse.json({ error: "Indica el motivo del rechazo." }, { status: 400 });
    status = "REJECTED";
    actionName = "APPLICATION_REJECTED";
    title = "Solicitud rechazada";
    message = `Tu solicitud ${app.folio} fue rechazada. Motivo: ${note}`;
    event = "SOLICITUD_RECHAZADA";
  } else if (action === "info") {
    if (!note) return NextResponse.json({ error: "Indica la información requerida." }, { status: 400 });
    status = "INFO_REQUESTED";
    actionName = "APPLICATION_INFO_REQUESTED";
    title = "Información adicional";
    message = note;
    event = "SOLICITAR_INFORMACION";
  } else {
    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  }

  if (action !== "aprobar") {
    await prisma.application.update({
      where: { id: app.id },
      data: {
        status,
        infoRequest: action === "info" ? note : app.infoRequest,
        rejectReason: action === "rechazar" ? note : app.rejectReason,
        reviewedById: ctx.user.id,
        reviewedAt: new Date(),
      },
    });
  }

  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: app.clientId,
    action: actionName,
    ip: meta.ip,
    userAgent: meta.userAgent,
    meta: { note, status },
  });
  if (action !== "aprobar") {
    await createNotification({
      clientId: app.clientId,
      type: "APROBACION",
      title,
      message,
      channelPanel: true,
      channelEmail: true,
    });
    await queueEmail({
      clientId: app.clientId,
      eventType: event,
      toEmail: app.client.user.email,
      subject: `${title} · ${app.folio}`,
      body: message,
    });
  }

  return NextResponse.json({ ok: true, status });
}
