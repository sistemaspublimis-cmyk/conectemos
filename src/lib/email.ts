import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import type { DeliveryStatus } from "@prisma/client";

export function gmailConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function transporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function queueEmail(input: {
  clientId?: string | null;
  eventType: string;
  toEmail: string;
  subject: string;
  body: string;
}) {
  const configured = gmailConfigured();
  const row = await prisma.emailMessage.create({
    data: {
      clientId: input.clientId || null,
      eventType: input.eventType,
      toEmail: input.toEmail,
      subject: input.subject,
      body: input.body,
      status: configured ? "PENDING" : "PREPARED",
    },
  });

  if (!configured) return { ...row, attempted: false as const };

  try {
    await transporter().sendMail({
      from: process.env.GMAIL_FROM || process.env.GMAIL_USER,
      to: input.toEmail,
      subject: input.subject,
      text: input.body,
    });
    const updated = await prisma.emailMessage.update({
      where: { id: row.id },
      data: { status: "SENT", sentAt: new Date() },
    });
    return { ...updated, attempted: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al enviar";
    const updated = await prisma.emailMessage.update({
      where: { id: row.id },
      data: { status: "ERROR", error: message },
    });
    return { ...updated, attempted: true as const };
  }
}

export function deliveryLabel(status: DeliveryStatus) {
  if (status === "SENT") return "Enviado";
  if (status === "ERROR") return "Error";
  if (status === "PENDING") return "Pendiente de envío";
  return "Preparado";
}
