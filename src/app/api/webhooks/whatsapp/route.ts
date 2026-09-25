import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { whatsappConfigured } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const token = process.env.WHATSAPP_VERIFY_TOKEN || "";
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  const verify = req.nextUrl.searchParams.get("hub.verify_token");
  if (mode === "subscribe" && token && verify === token) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "WhatsApp no conectado" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  if (!whatsappConfigured()) {
    return NextResponse.json({ error: "WhatsApp no conectado" }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages;
  if (!Array.isArray(messages)) return NextResponse.json({ ok: true });
  for (const m of messages) {
    const phone = String(m.from || "");
    const text = String(m.text?.body || "");
    if (!phone || !text) continue;
    let conversation = await prisma.conversation.findFirst({ where: { phone } });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { phone, lastMessage: text, lastAt: new Date() },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessage: text, lastAt: new Date() },
      });
    }
    await prisma.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        direction: "inbound",
        body: text,
        status: "SENT",
        waMessageId: m.id,
      },
    });
  }
  return NextResponse.json({ ok: true });
}
