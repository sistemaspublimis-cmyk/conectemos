import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { queueEmail } from "@/lib/email";
import { audit, requestMeta } from "@/lib/audit";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").toLowerCase().trim();
  const generic = "Si el correo existe, preparamos un enlace de restablecimiento.";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ message: generic });

  const raw = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  const url = `${process.env.APP_URL || "http://localhost:3000"}/restablecer?token=${raw}`;
  await queueEmail({
    eventType: "RESET_PASSWORD",
    toEmail: user.email,
    subject: "Restablecer acceso",
    body: `Enlace para establecer una nueva contraseña (1 hora):\n${url}`,
  });
  const meta = requestMeta(req.headers);
  await audit({ actorId: user.id, action: "PASSWORD_RESET_REQUESTED", ip: meta.ip });
  return NextResponse.json({
    message: generic,
    // En desarrollo, si Gmail no está configurado, devolvemos el enlace para pruebas locales.
    devLink: process.env.GMAIL_USER ? undefined : url,
  });
}
