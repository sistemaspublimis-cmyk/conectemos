import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestMeta } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const path = String(body?.path || "");
  const meta = requestMeta(req.headers);
  await prisma.session.updateMany({
    where: { tokenJti: session.jti, revokedAt: null },
    data: { lastSeenAt: new Date(), currentPath: path || undefined, ip: meta.ip || undefined, userAgent: meta.userAgent || undefined },
  });
  await prisma.user.update({
    where: { id: session.id },
    data: { lastActivityAt: new Date(), lastIp: meta.ip, lastUserAgent: meta.userAgent },
  });
  return NextResponse.json({ ok: true });
}
