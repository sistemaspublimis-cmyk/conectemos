import { NextResponse } from "next/server";
import { requireClient } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await prisma.user.update({
    where: { id: ctx.user.id },
    data: { welcomeSeenAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
