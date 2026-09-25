import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { maybeAutoApprove } from "@/lib/credit-grant";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }
  if (user.status === "BLOCKED" || user.status === "DISABLED") {
    return NextResponse.json({ error: "Tu cuenta está desactivada o bloqueada." }, { status: 403 });
  }

  const meta = requestMeta(req.headers);
  await createSession(user, { ip: meta.ip || undefined, userAgent: meta.userAgent || undefined });
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), lastIp: meta.ip, lastUserAgent: meta.userAgent, lastActivityAt: new Date() },
  });
  await audit({
    actorId: user.id,
    action: user.role === "CLIENT" ? "CLIENT_LOGIN" : "ADMIN_LOGIN",
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  let redirect = user.role === "CLIENT" ? "/mi-cuenta" : "/admin";
  if (user.role === "CLIENT") {
    const client = await prisma.client.findUnique({
      where: { userId: user.id },
      include: { application: true },
    });
    if (client) await maybeAutoApprove(client.id);
    const fresh = await prisma.client.findUnique({
      where: { userId: user.id },
      include: { application: true },
    });
    if (!user.welcomeSeenAt) redirect = "/mi-cuenta/bienvenida";
    else if (fresh?.application?.status === "APPROVED" && !user.approvalSeenAt) {
      redirect = "/mi-cuenta/autorizado";
    } else {
      redirect = "/mi-cuenta";
    }
  }

  return NextResponse.json({
    ok: true,
    redirect,
    ...(user.role !== "CLIENT" ? { showAdminWelcome: true } : {}),
  });
}
