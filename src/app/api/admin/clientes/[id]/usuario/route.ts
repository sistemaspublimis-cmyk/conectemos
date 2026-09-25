import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { queueEmail } from "@/lib/email";
import type { UserStatus } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action = String(body?.action || "");
  const client = await prisma.client.findUnique({ where: { id }, include: { user: true } });
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  const map: Record<string, UserStatus> = {
    activar: "ACTIVE",
    desactivar: "DISABLED",
    bloquear: "BLOCKED",
  };

  if (action === "restablecer") {
    const raw = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(raw).digest("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: client.userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const url = `${process.env.APP_URL || "http://localhost:3000"}/restablecer?token=${raw}`;
    await queueEmail({
      clientId: client.id,
      eventType: "RESET_PASSWORD",
      toEmail: client.user.email,
      subject: "Establece tu contraseña",
      body: `Enlace seguro (1 hora):\n${url}`,
    });
    const meta = requestMeta(req.headers);
    await audit({ actorId: ctx.user.id, clientId: client.id, action: "CLIENT_ACCESS_RESET", ip: meta.ip });
    return NextResponse.json({
      ok: true,
      prepared: true,
      devLink: process.env.GMAIL_USER ? undefined : url,
    });
  }

  const status = map[action];
  if (!status) return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  await prisma.user.update({ where: { id: client.userId }, data: { status } });
  if (status !== "ACTIVE") {
    await prisma.session.updateMany({
      where: { userId: client.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: client.id,
    action: `CLIENT_USER_${action.toUpperCase()}`,
    ip: meta.ip,
    meta: { status },
  });
  return NextResponse.json({ ok: true, status });
}
