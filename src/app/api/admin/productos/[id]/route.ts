import { NextRequest, NextResponse } from "next/server";
import type { ProductKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { PRODUCT_KINDS } from "@/lib/product-catalog";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const data: Prisma.ProductUpdateInput = {};

  if (body?.name != null) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    data.name = name;
  }
  if (body?.slug != null) {
    const slug = slugify(String(body.slug));
    if (!slug) return NextResponse.json({ error: "El slug es obligatorio." }, { status: 400 });
    data.slug = slug;
  }
  if (body?.kind != null) {
    const kind = String(body.kind) as ProductKind;
    if (!PRODUCT_KINDS.includes(kind)) {
      return NextResponse.json({ error: "Tipo de producto inválido." }, { status: 400 });
    }
    data.kind = kind;
  }
  if (body?.summary != null) data.summary = String(body.summary);
  if (body?.description != null) data.description = String(body.description);
  if (body?.benefits != null) data.benefits = String(body.benefits);
  if (body?.requirements != null) data.requirements = String(body.requirements);
  if (body?.imageUrl != null) data.imageUrl = String(body.imageUrl).trim() || null;
  if (body?.requiresBasicAccount != null) data.requiresBasicAccount = Boolean(body.requiresBasicAccount);
  if (body?.active != null) data.active = Boolean(body.active);
  if (body?.sortOrder != null) data.sortOrder = Number(body.sortOrder) || 0;

  try {
    const product = await prisma.product.update({ where: { id }, data });
    const meta = requestMeta(req.headers);
    await audit({
      actorId: ctx.user.id,
      action: product.active === false && existing.active ? "PRODUCT_DEACTIVATED" : "PRODUCT_UPDATED",
      ip: meta.ip,
      userAgent: meta.userAgent,
      meta: { productId: product.id, slug: product.slug },
    });
    return NextResponse.json({ product });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un producto con ese slug." }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

  const product = await prisma.product.update({
    where: { id },
    data: { active: false },
  });
  const meta = requestMeta(_req.headers);
  await audit({
    actorId: ctx.user.id,
    action: "PRODUCT_DEACTIVATED",
    ip: meta.ip,
    userAgent: meta.userAgent,
    meta: { productId: product.id, slug: product.slug },
  });
  return NextResponse.json({ ok: true, product });
}
