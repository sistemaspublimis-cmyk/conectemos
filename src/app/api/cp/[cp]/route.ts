import { NextResponse } from "next/server";
import { lookupMexicanZip } from "@/lib/mexico-cp";

export async function GET(_req: Request, { params }: { params: Promise<{ cp: string }> }) {
  const { cp } = await params;
  const data = await lookupMexicanZip(cp);
  if (!data) return NextResponse.json({ error: "Código postal no encontrado." }, { status: 404 });
  return NextResponse.json(data);
}
