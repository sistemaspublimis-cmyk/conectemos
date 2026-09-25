import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { readStoredFile } from "@/lib/storage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireUser();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const doc = await prisma.clientDocument.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (ctx.user.role === "CLIENT" && doc.client.userId !== ctx.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const buf = await readStoredFile(doc.storedName);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.originalName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
