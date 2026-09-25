import { NextResponse } from "next/server";
import { requireClient } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateClientPdf } from "@/lib/pdf";
import { contractFileName } from "@/lib/contract-template";
import { audit, requestMeta } from "@/lib/audit";

export async function POST(req: Request) {
  const ctx = await requireClient();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { userId: ctx.user.id },
    include: { user: true },
  });
  if (!client) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 });

  const fileName = contractFileName(client.user.firstName, client.user.lastName);
  const { row } = await generateClientPdf(client.id, "contrato", ctx.user.id, fileName);
  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId: client.id,
    action: "CONTRACT_PDF_CLIENT",
    ip: meta.ip,
    meta: { id: row.id },
  });

  return NextResponse.json({ ok: true, id: row.id, fileName: row.fileName });
}
