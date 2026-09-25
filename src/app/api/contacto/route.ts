import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queueEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`contact:${ip}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados mensajes." }, { status: 429 });
  }
  const fd = await req.formData();
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const phone = String(fd.get("phone") || "").trim();
  const message = String(fd.get("message") || "").trim();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Completa nombre, correo y mensaje." }, { status: 400 });
  }
  await prisma.contactMessage.create({ data: { name, email, phone, message } });
  await queueEmail({
    eventType: "CONTACTO",
    toEmail: process.env.GMAIL_USER || email,
    subject: `Contacto web · ${name}`,
    body: `${name} <${email}> ${phone}\n\n${message}`,
  });
  return NextResponse.json({ ok: true });
}
