import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { maybeAutoApprove } from "@/lib/credit-grant";

export async function POST() {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { application: true },
  });
  if (!client) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });

  const result = await maybeAutoApprove(client.id);
  const approved = result?.application?.status === "APPROVED" || client.application?.status === "APPROVED";
  if (!approved) {
    return NextResponse.json({ ok: true, approved: false });
  }

  const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
  return NextResponse.json({
    ok: true,
    approved: true,
    redirect: user?.approvalSeenAt ? "/mi-cuenta" : "/mi-cuenta/autorizado",
  });
}
