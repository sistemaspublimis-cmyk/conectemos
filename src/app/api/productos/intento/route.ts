import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";

const DEFAULT_TAP = "Este producto no está disponible por el momento.";

export async function POST(req: NextRequest) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const slug = String(body?.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "Indica el producto." }, { status: 400 });

  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { products: { include: { product: true } } },
  });
  if (!client) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });

  const existing = client.products.find((row) => row.product.slug === slug);
  const blocked =
    Boolean(existing?.blocked) ||
    existing?.status === "BLOCKED" ||
    existing?.status === "UNAVAILABLE" ||
    existing?.available === false;

  if (!existing || !blocked) {
    return NextResponse.json({ ok: true, allowed: true });
  }

  const tapMessage = existing.tapMessage || DEFAULT_TAP;
  await prisma.clientProductEvent.create({
    data: {
      clientProductId: existing.id,
      action: "ATTEMPT",
      note: tapMessage,
      actorId: ctx.user.id,
    },
  });

  return NextResponse.json({ ok: true, blocked: true, tapMessage });
}
