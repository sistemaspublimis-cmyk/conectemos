import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, passwordPolicy } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = String(body?.token || "");
  const password = String(body?.password || "");
  const policy = passwordPolicy(password);
  if (policy) return NextResponse.json({ error: policy }, { status: 400 });
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return NextResponse.json({ error: "El enlace no es válido o ya expiró." }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.updateMany({
      where: { userId: row.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  const meta = requestMeta(req.headers);
  await audit({ actorId: row.userId, action: "PASSWORD_RESET", ip: meta.ip });
  return NextResponse.json({ ok: true });
}
