import { NextRequest, NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth";
import { audit, requestMeta } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getSession();
  const meta = requestMeta(req.headers);
  if (session) {
    await audit({ actorId: session.id, action: "LOGOUT", ip: meta.ip, userAgent: meta.userAgent });
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
