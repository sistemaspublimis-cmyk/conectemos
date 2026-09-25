import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, passwordPolicy, requireOwner } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";
import type { Role } from "@prisma/client";

const STAFF: Role[] = ["MANAGER", "ADVISOR", "ADMIN"];

export async function POST(req: NextRequest) {
  const ctx = await requireOwner();
  if (!ctx) return NextResponse.json({ error: "Solo el dueño puede dar de alta al equipo." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const email = String(body?.email || "").toLowerCase().trim();
  const password = String(body?.password || "");
  const role = String(body?.role || "") as Role;
  const phone = String(body?.phone || "").trim();

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: "Nombre, apellido y correo son obligatorios." }, { status: 400 });
  }
  if (!STAFF.includes(role)) {
    return NextResponse.json({ error: "Elige gerente, asesor o dueño." }, { status: 400 });
  }
  const policy = passwordPolicy(password);
  if (policy) return NextResponse.json({ error: policy }, { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Ese correo ya está registrado." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role,
      status: "ACTIVE",
    },
  });
  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    action: "STAFF_CREATED",
    ip: meta.ip,
    meta: { userId: user.id, role },
  });
  return NextResponse.json({ ok: true, id: user.id });
}
