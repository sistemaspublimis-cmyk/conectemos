import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { generateClientPdf } from "@/lib/pdf";
import { audit, requestMeta } from "@/lib/audit";

const KINDS = ["solicitud", "estudio", "resumen-aprobacion", "oferta", "contrato", "comprobante", "estado-cuenta"] as const;

export async function POST(req: NextRequest, { params }: { params: Promise<{ clientId: string; type: string }> }) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { clientId, type } = await params;
  if (!KINDS.includes(type as (typeof KINDS)[number])) {
    return NextResponse.json({ error: "Plantilla no válida" }, { status: 400 });
  }
  const { row } = await generateClientPdf(clientId, type as (typeof KINDS)[number], ctx.user.id);
  const meta = requestMeta(req.headers);
  await audit({
    actorId: ctx.user.id,
    clientId,
    action: "DOCUMENT_GENERATED",
    ip: meta.ip,
    meta: { type, id: row.id, status: "PREPARED" },
  });
  return NextResponse.json({ ok: true, id: row.id, status: "PREPARED" });
}
