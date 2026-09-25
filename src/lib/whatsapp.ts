import { prisma } from "./prisma";

export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function prepareWhatsApp(input: {
  clientId?: string | null;
  phone: string;
  body: string;
}) {
  const configured = whatsappConfigured();
  let conversation = await prisma.conversation.findFirst({
    where: { phone: input.phone },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        clientId: input.clientId || null,
        phone: input.phone,
        lastMessage: input.body,
        lastAt: new Date(),
      },
    });
  } else {
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: input.body,
        lastAt: new Date(),
        clientId: conversation.clientId || input.clientId || null,
      },
    });
  }

  const message = await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      direction: "outbound",
      body: input.body,
      status: configured ? "PENDING" : "PREPARED",
    },
  });

  if (!configured) {
    return { message, sent: false as const, reason: "WhatsApp no conectado" };
  }

  try {
    const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || "v21.0"}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: input.phone.replace(/\D/g, ""),
        type: "text",
        text: { body: input.body },
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Error de WhatsApp Cloud API");
    const waId = data?.messages?.[0]?.id as string | undefined;
    const updated = await prisma.whatsAppMessage.update({
      where: { id: message.id },
      data: { status: "SENT", waMessageId: waId },
    });
    return { message: updated, sent: true as const };
  } catch (err) {
    const text = err instanceof Error ? err.message : "Error";
    const updated = await prisma.whatsAppMessage.update({
      where: { id: message.id },
      data: { status: "ERROR" },
    });
    return { message: updated, sent: false as const, reason: text };
  }
}
