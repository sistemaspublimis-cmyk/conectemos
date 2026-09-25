import { NextRequest, NextResponse } from "next/server";
import type { ProductKind } from "@prisma/client";
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

export async function GET() {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const slug = slugify(String(body?.slug || name));
  const kind = String(body?.kind || "") as ProductKind;
  if (!name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "El slug es obligatorio." }, { status: 400 });
  if (!PRODUCT_KINDS.includes(kind)) {
    return NextResponse.json({ error: "Tipo de producto inválido." }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        kind,
        summary: String(body?.summary || "").trim(),
        description: String(body?.description || "").trim(),
        benefits: String(body?.benefits || ""),
        requirements: String(body?.requirements || ""),
        imageUrl: String(body?.imageUrl || "").trim() || null,
        requiresBasicAccount: Boolean(body?.requiresBasicAccount),
        active: body?.active !== false,
        sortOrder: Number(body?.sortOrder) || 0,
      },
    });
    const meta = requestMeta(req.headers);
    await audit({
      actorId: ctx.user.id,
      action: "PRODUCT_CREATED",
      ip: meta.ip,
      userAgent: meta.userAgent,
      meta: { productId: product.id, slug: product.slug, name: product.name },
    });
    return NextResponse.json({ product });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un producto con ese slug." }, { status: 409 });
    }
    throw error;
  }
}
