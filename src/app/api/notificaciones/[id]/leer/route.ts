import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const client = await prisma.client.findUnique({ where: { userId: ctx.user.id } });
  if (!client) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const { id } = await params;
  await prisma.notification.updateMany({
    where: { id, clientId: client.id, readAt: null },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
