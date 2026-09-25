import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import { CATALOG_SEED, originatesWithApplication } from "@/lib/product-catalog";

const DEFAULT_TAP = "Este producto no está disponible por el momento.";

export async function POST(req: NextRequest) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const slug = String(body?.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "Indica el producto." }, { status: 400 });

  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { application: true, products: { include: { product: true } } },
  });
  if (!client) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });

  let product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    const seed = CATALOG_SEED.find((item) => item.slug === slug);
    if (!seed) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    product = await prisma.product.create({ data: seed });
  }
  if (!product.active) {
    return NextResponse.json({ error: DEFAULT_TAP, blocked: true, tapMessage: DEFAULT_TAP }, { status: 403 });
  }

  const existing = client.products.find((row) => row.productId === product.id);
  const blocked =
    Boolean(existing?.blocked) ||
    existing?.status === "BLOCKED" ||
    existing?.status === "UNAVAILABLE" ||
    existing?.available === false;

  if (existing && blocked) {
    const tapMessage = existing.tapMessage || DEFAULT_TAP;
    await prisma.clientProductEvent.create({
      data: {
        clientProductId: existing.id,
        action: "ATTEMPT",
        note: tapMessage,
        actorId: ctx.user.id,
      },
    });
    return NextResponse.json({ error: tapMessage, blocked: true, tapMessage }, { status: 403 });
  }

  if (existing?.status === "CONTRACTED") {
    return NextResponse.json({ ok: true, already: true, message: "Este producto ya está contratado." });
  }

  const approved = client.application?.status === "APPROVED";
  const hasBasic = client.products.some(
    (row) => row.product.slug === "cuenta-basica" && row.status === "CONTRACTED",
  );

  if (originatesWithApplication(slug) && !approved) {
    return NextResponse.json(
      {
        error: "Este financiamiento se origina con tu solicitud. No se genera un crédito sin autorización.",
        redirect: "/mi-cuenta/estudio",
      },
      { status: 409 },
    );
  }

  if ((slug === "cuenta-digital" || slug === "fondo-ahorro") && !approved) {
    return NextResponse.json(
      {
        error: "Disponible después de la autorización de tu crédito.",
        redirect: "/mi-cuenta/solicitud",
      },
      { status: 409 },
    );
  }

  if (product.requiresBasicAccount && slug !== "cuenta-basica" && !hasBasic) {
    return NextResponse.json(
      {
        error: "Para contratar este producto primero debes tener una cuenta básica contratada.",
        needsBasic: true,
        redirect: "/mi-cuenta/productos/cuenta-basica",
      },
      { status: 409 },
    );
  }

  const row = await prisma.clientProduct.upsert({
    where: { clientId_productId: { clientId: client.id, productId: product.id } },
    create: {
      clientId: client.id,
      productId: product.id,
      status: "CONTRACTED",
      available: true,
      blocked: false,
      contractedAt: new Date(),
      events: {
        create: {
          action: "CONTRACTED",
          note: "Contratación desde el portal",
          actorId: ctx.user.id,
        },
      },
    },
    update: {
      status: "CONTRACTED",
      available: true,
      blocked: false,
      contractedAt: new Date(),
      cancelledAt: null,
    },
  });

  if (existing) {
    await prisma.clientProductEvent.create({
      data: {
        clientProductId: row.id,
        action: "CONTRACTED",
        note: "Contratación desde el portal",
        actorId: ctx.user.id,
      },
    });
  }

  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: client.id,
    action: "PRODUCT_CONTRACTED",
    ip: meta.ip,
    userAgent: meta.userAgent,
    meta: { slug },
  });

  return NextResponse.json({ ok: true, status: "CONTRACTED" });
}
