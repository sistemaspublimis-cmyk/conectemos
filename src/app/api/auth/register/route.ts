import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, passwordPolicy } from "@/lib/auth";
import { nextFolio } from "@/lib/folio";
import { audit, requestMeta } from "@/lib/audit";
import { queueEmail } from "@/lib/email";
import { createNotification } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { CATALOG_SEED } from "@/lib/product-catalog";

const digits = (value: string) => value.replace(/\D/g, "");

const schema = z.object({
  firstName: z.string().trim().min(2, "El nombre debe tener al menos 2 letras.").max(80),
  lastName: z.string().trim().min(2, "Los apellidos deben tener al menos 2 letras.").max(80),
  email: z.string().trim().email("Escribe un correo válido."),
  phone: z
    .string()
    .transform(digits)
    .refine((v) => v.length >= 8 && v.length <= 15, "El teléfono debe tener al menos 8 dígitos."),
  whatsapp: z
    .string()
    .transform(digits)
    .refine((v) => v.length >= 8 && v.length <= 15, "El WhatsApp debe tener al menos 8 dígitos."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  product: z.string().trim().max(80).optional(),
  amount: z.number().positive().max(20_000_000).optional(),
  termMonths: z.number().int().min(1).max(84).optional(),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados registros desde esta red." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "Revisa los campos del formulario.";
    return NextResponse.json({ error: first }, { status: 400 });
  }
  const policy = passwordPolicy(parsed.data.password);
  if (policy) return NextResponse.json({ error: policy }, { status: 400 });

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Ese correo ya está registrado." }, { status: 409 });

  const known = CATALOG_SEED.find((item) => item.name === parsed.data.product);
  const product = known?.name || "Crédito Personal";
  const amount = parsed.data.amount ?? 0;
  const termMonths = parsed.data.termMonths ?? null;
  const folio = await nextFolio();
  const passwordHash = await hashPassword(parsed.data.password);
  const meta = requestMeta(req.headers);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "CLIENT",
      status: "ACTIVE",
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
      phone: parsed.data.phone.trim(),
      whatsapp: parsed.data.whatsapp.trim(),
      lastIp: meta.ip,
      lastUserAgent: meta.userAgent,
      lastActivityAt: new Date(),
    },
  });

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      folio,
      product,
      requestedAmount: amount,
      termMonths,
      purpose: product,
    },
  });

  await prisma.application.create({
    data: {
      clientId: client.id,
      folio,
      product,
      amount,
      termMonths,
      purpose: product,
      status: "STUDY_PENDING",
    },
  });

  await prisma.socioEconomicStudy.create({
    data: {
      clientId: client.id,
      fullName: `${user.firstName} ${user.lastName}`,
    },
  });

  await createSession(user, meta);
  await audit({
    actorId: user.id,
    clientId: client.id,
    action: "CLIENT_REGISTERED",
    ip: meta.ip,
    userAgent: meta.userAgent,
    meta: { folio },
  });
  await queueEmail({
    clientId: client.id,
    eventType: "NUEVO_REGISTRO",
    toEmail: user.email,
    subject: `Registro recibido · ${folio}`,
    body: `Hola ${user.firstName}, recibimos tu solicitud de ${product}. Tu folio es ${folio}. Sigue en tu cuenta para completar los datos y recibir tu oferta.`,
  });
  await createNotification({
    clientId: client.id,
    type: "SOLICITUD",
    title: "Solicitud creada",
    message: `Tu folio es ${folio}. Seguimos con tu ${product}.`,
    channelPanel: true,
  });

  return NextResponse.json({ ok: true, folio });
}
