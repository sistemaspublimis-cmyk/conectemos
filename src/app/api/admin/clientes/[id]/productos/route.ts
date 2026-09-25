import { NextRequest, NextResponse } from "next/server";
import type { ClientProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { formatMXN, parseAmount, toNumber } from "@/lib/money";

const ACTIONS = ["save", "contract", "cancel", "block", "unblock"] as const;
type Action = (typeof ACTIONS)[number];

function restoredStatus(input: {
  contractedAt: Date | null;
  cancelledAt: Date | null;
  available: boolean;
}): ClientProductStatus {
  if (!input.available) return "UNAVAILABLE";
  if (input.contractedAt && !input.cancelledAt) return "CONTRACTED";
  return "AVAILABLE";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id: clientId } = await params;
  const body = await req.json().catch(() => null);
  const productId = String(body?.productId || "");
  const action = String(body?.action || "") as Action;
  if (!productId) return NextResponse.json({ error: "productId es obligatorio." }, { status: 400 });
  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const amountParsed =
    body?.amount != null && String(body.amount).trim() !== "" ? parseAmount(String(body.amount)) : null;
  if (body?.amount != null && String(body.amount).trim() !== "" && amountParsed == null) {
    return NextResponse.json({ error: "Monto inválido." }, { status: 400 });
  }
  const tapMessage =
    body?.tapMessage != null ? String(body.tapMessage) : undefined;
  const blockedIn = typeof body?.blocked === "boolean" ? body.blocked : undefined;
  const availableIn = typeof body?.available === "boolean" ? body.available : undefined;

  let row = await prisma.clientProduct.findUnique({
    where: { clientId_productId: { clientId, productId } },
  });
  if (!row) {
    row = await prisma.clientProduct.create({
      data: {
        clientId,
        productId,
        status: "AVAILABLE",
        amount: amountParsed ?? 0,
        blocked: false,
        available: true,
        tapMessage: tapMessage || null,
      },
    });
  }

  const previousAmount = toNumber(row.amount);
  const nextAmount = amountParsed ?? previousAmount;
  const amountChanged = amountParsed != null && nextAmount !== previousAmount;
  const now = new Date();

  let status: ClientProductStatus = row.status;
  let blocked = row.blocked;
  let available = row.available;
  let contractedAt = row.contractedAt;
  let cancelledAt = row.cancelledAt;
  let auditAction = "PRODUCT_SAVED";
  const events: { action: string; note: string | null; actorId: string }[] = [];

  if (action === "contract") {
    status = "CONTRACTED";
    blocked = false;
    available = true;
    contractedAt = now;
    cancelledAt = null;
    auditAction = "PRODUCT_CONTRACTED";
    events.push({
      action: "CONTRACTED",
      note: nextAmount ? `Monto ${formatMXN(nextAmount)}` : "Contratado",
      actorId: ctx.user.id,
    });
  } else if (action === "cancel") {
    status = "CANCELLED";
    cancelledAt = now;
    auditAction = "PRODUCT_CANCELLED";
    events.push({ action: "CANCELLED", note: tapMessage?.trim() || "Cancelado", actorId: ctx.user.id });
  } else if (action === "block") {
    blocked = true;
    status = "BLOCKED";
    auditAction = "PRODUCT_BLOCKED";
    events.push({
      action: "BLOCKED",
      note: (tapMessage ?? row.tapMessage)?.trim() || "Producto bloqueado",
      actorId: ctx.user.id,
    });
  } else if (action === "unblock") {
    blocked = false;
    available = availableIn ?? row.available;
    status = restoredStatus({ contractedAt, cancelledAt, available });
    auditAction = "PRODUCT_UNBLOCKED";
    events.push({ action: "UNBLOCKED", note: "Producto desbloqueado", actorId: ctx.user.id });
  } else {
    blocked = blockedIn ?? row.blocked;
    available = availableIn ?? row.available;
    if (blocked) {
      status = "BLOCKED";
      if (!row.blocked || row.status !== "BLOCKED") {
        events.push({
          action: "BLOCKED",
          note: (tapMessage ?? row.tapMessage)?.trim() || "Producto bloqueado",
          actorId: ctx.user.id,
        });
      }
    } else if (!available) {
      status = "UNAVAILABLE";
      if (row.available || row.status !== "UNAVAILABLE") {
        events.push({ action: "UNAVAILABLE", note: "Marcado como no disponible", actorId: ctx.user.id });
      }
    } else if (row.status === "BLOCKED" || row.status === "UNAVAILABLE" || row.blocked || !row.available) {
      status = restoredStatus({ contractedAt, cancelledAt, available: true });
      if (row.blocked || row.status === "BLOCKED") {
        events.push({ action: "UNBLOCKED", note: "Producto desbloqueado", actorId: ctx.user.id });
      } else {
        events.push({ action: "AVAILABLE", note: "Producto disponible", actorId: ctx.user.id });
      }
    } else {
      status = row.status;
    }
    events.push({ action: "SAVED", note: "Datos actualizados", actorId: ctx.user.id });
    auditAction = "PRODUCT_SAVED";
  }

  if (amountChanged) {
    events.unshift({
      action: "AMOUNT_CHANGED",
      note: `${formatMXN(previousAmount)} → ${formatMXN(nextAmount)}`,
      actorId: ctx.user.id,
    });
    if (action === "save") auditAction = "PRODUCT_AMOUNT_CHANGED";
  }

  const updated = await prisma.clientProduct.update({
    where: { id: row.id },
    data: {
      status,
      amount: nextAmount,
      blocked,
      available,
      tapMessage: tapMessage !== undefined ? tapMessage || null : undefined,
      contractedAt,
      cancelledAt,
      events: { create: events },
    },
    include: {
      product: true,
      events: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId,
    action: auditAction,
    ip: meta.ip,
    userAgent: meta.userAgent,
    meta: {
      productId,
      slug: product.slug,
      name: product.name,
      action,
      status: updated.status,
      amount: nextAmount,
      blocked,
      available,
    },
  });

  return NextResponse.json({
    ok: true,
    product: {
      ...updated,
      amount: toNumber(updated.amount),
    },
  });
}
