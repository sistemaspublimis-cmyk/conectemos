import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { application: true },
  });
  if (!client) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (client.application?.status !== "APPROVED") {
    return NextResponse.json({ error: "Los datos bancarios se habilitan cuando la solicitud está aprobada." }, { status: 400 });
  }
  const fd = await req.formData();
  const clabe = String(fd.get("clabe") || "").replace(/\s/g, "");
  if (clabe && !/^\d{18}$/.test(clabe)) {
    return NextResponse.json({ error: "La CLABE debe tener 18 dígitos." }, { status: 400 });
  }
  await prisma.bankDetails.upsert({
    where: { clientId: client.id },
    create: {
      clientId: client.id,
      holder: String(fd.get("holder") || ""),
      bank: String(fd.get("bank") || ""),
      clabe,
      accountNumber: String(fd.get("accountNumber") || ""),
      branch: String(fd.get("branch") || ""),
      accountType: String(fd.get("accountType") || ""),
    },
    update: {
      holder: String(fd.get("holder") || ""),
      bank: String(fd.get("bank") || ""),
      clabe,
      accountNumber: String(fd.get("accountNumber") || ""),
      branch: String(fd.get("branch") || ""),
      accountType: String(fd.get("accountType") || ""),
    },
  });
  const meta = requestMeta(req.headers);
  await audit({ actorId: ctx.user.id, clientId: client.id, action: "BANK_DETAILS_SAVED", ip: meta.ip });
  return NextResponse.json({ ok: true });
}
