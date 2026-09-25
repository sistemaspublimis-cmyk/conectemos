import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const fd = await req.formData();
  await prisma.user.update({
    where: { id: ctx.user.id },
    data: {
      phone: String(fd.get("phone") || ctx.user.phone || ""),
      whatsapp: String(fd.get("whatsapp") || ctx.user.whatsapp || ""),
    },
  });
  const meta = requestMeta(req.headers);
  await audit({ actorId: ctx.user.id, action: "PROFILE_UPDATED", ip: meta.ip });
  return NextResponse.json({ ok: true });
}
