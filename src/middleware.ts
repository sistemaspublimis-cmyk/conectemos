import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "conectemos_session";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev");
}

async function readToken(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id),
      role: String(payload.role),
      status: String(payload.status),
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await readToken(req);

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "ADMIN" && session.role !== "MANAGER" && session.role !== "ADVISOR") {
      const url = req.nextUrl.clone();
      url.pathname = "/mi-cuenta";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/mi-cuenta")) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== "CLIENT") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    if (session.status === "BLOCKED" || session.status === "DISABLED") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "cuenta");
      return NextResponse.redirect(url);
    }
  }

  if ((pathname === "/login" || pathname === "/registro") && session) {
    const url = req.nextUrl.clone();
    url.pathname =
      session.role === "ADMIN" || session.role === "MANAGER" || session.role === "ADVISOR" ? "/admin" : "/mi-cuenta";
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*", "/mi-cuenta", "/mi-cuenta/:path*", "/login", "/registro"],
};
