import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseAmount } from "@/lib/money";
import { audit, requestMeta } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const amount = parseAmount(String(body?.amount ?? "0")) ?? 0;
  const termMonths = Number(body?.termMonths || 0) || null;
  const rate = String(body?.rate || "");
  const notes = String(body?.notes || "");
  await prisma.offer.upsert({
    where: { clientId: id },
    create: { clientId: id, amount, termMonths, rate, notes, status: "PREPARED" },
    update: { amount, termMonths, rate, notes, status: "PREPARED" },
  });
  const meta = requestMeta(req.headers);
  await audit({ actorId: ctx.user.id, clientId: id, action: "OFFER_PREPARED", ip: meta.ip });
  return NextResponse.json({ ok: true });
}
