import { prisma } from "./prisma";

export async function audit(input: {
  actorId?: string | null;
  clientId?: string | null;
  action: string;
  ip?: string | null;
  userAgent?: string | null;
  meta?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId || null,
      clientId: input.clientId || null,
      action: input.action,
      ip: input.ip || null,
      userAgent: input.userAgent || null,
      meta: input.meta ? JSON.stringify(input.meta) : null,
    },
  });
}

export function requestMeta(headers: Headers) {
  return {
    ip:
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip") ||
      null,
    userAgent: headers.get("user-agent"),
  };
}
