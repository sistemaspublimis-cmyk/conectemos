import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role, UserStatus } from "@prisma/client";

const COOKIE = "conectemos_session";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET no configurado");
  return new TextEncoder().encode(s);
}

export type SessionPayload = {
  id: string;
  role: Role;
  email: string;
  name: string;
  status: UserStatus;
  jti: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: {
  id: string;
  role: Role;
  email: string;
  status: UserStatus;
  firstName: string;
  lastName: string;
}, meta?: { ip?: string | null; userAgent?: string | null }) {
  const jti = crypto.randomUUID();
  const token = await new SignJWT({
    id: user.id,
    role: user.role,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    status: user.status,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setJti(jti)
    .sign(secret());

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenJti: jti,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { token, jti };
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const jti = String(payload.jti || "");
    const session = await prisma.session.findUnique({ where: { tokenJti: jti } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
    return {
      id: String(payload.id),
      role: payload.role as Role,
      email: String(payload.email),
      name: String(payload.name),
      status: payload.status as UserStatus,
      jti,
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret());
      const jti = String(payload.jti || "");
      await prisma.session.updateMany({
        where: { tokenJti: jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      /* ignore */
    }
  }
  store.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return null;
  if (user.status === "BLOCKED" || user.status === "DISABLED") return null;
  return { session, user };
}

export function isStaff(role: Role) {
  return role === "ADMIN" || role === "MANAGER" || role === "ADVISOR";
}

export async function requireAdmin() {
  const ctx = await requireUser();
  if (!ctx || !isStaff(ctx.user.role)) return null;
  return ctx;
}

export async function requireOwner() {
  const ctx = await requireUser();
  if (!ctx || ctx.user.role !== "ADMIN") return null;
  return ctx;
}

export async function requireClient() {
  const ctx = await requireUser();
  if (!ctx || ctx.user.role !== "CLIENT") return null;
  return ctx;
}

export function passwordPolicy(password: string): string | null {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "La contraseña debe incluir letras y números.";
  }
  return null;
}
