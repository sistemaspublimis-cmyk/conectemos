import { prisma } from "./prisma";
import { queueEmail } from "./email";
import { prepareWhatsApp } from "./whatsapp";

export async function createNotification(input: {
  clientId: string;
  type: string;
  title: string;
  message: string;
  channelPanel?: boolean;
  channelEmail?: boolean;
  channelWhatsapp?: boolean;
}) {
  const client = await prisma.client.findUnique({
    where: { id: input.clientId },
    include: { user: true },
  });
  if (!client) throw new Error("Cliente no encontrado");

  let emailStatus: "PREPARED" | "PENDING" | "SENT" | "ERROR" = "PREPARED";
  let whatsappStatus: "PREPARED" | "PENDING" | "SENT" | "ERROR" = "PREPARED";

  if (input.channelEmail) {
    const mail = await queueEmail({
      clientId: client.id,
      eventType: "NUEVA_NOTIFICACION",
      toEmail: client.user.email,
      subject: input.title,
      body: input.message,
    });
    emailStatus = mail.status;
  }

  if (input.channelWhatsapp) {
    const phone = client.user.whatsapp || client.user.phone;
    if (phone) {
      const wa = await prepareWhatsApp({
        clientId: client.id,
        phone,
        body: `${input.title}\n\n${input.message}`,
      });
      whatsappStatus = wa.message.status;
    }
  }

  return prisma.notification.create({
    data: {
      clientId: client.id,
      type: input.type,
      title: input.title,
      message: input.message,
      channelPanel: input.channelPanel !== false,
      channelEmail: Boolean(input.channelEmail),
      channelWhatsapp: Boolean(input.channelWhatsapp),
      emailStatus,
      whatsappStatus,
    },
  });
}
