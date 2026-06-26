import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "rbai_admin";
const CLIENT_COOKIE = "rbai_client";

async function verify(
  token: string | undefined,
  expectRole: "admin" | "client"
): Promise<Record<string, unknown> | null> {
  if (!token) return null;
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if ((payload as { role?: string }).role !== expectRole) return null;
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toLogin(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /caller — workspace cold-call (necesită sesiune staff/admin)
  if (pathname.startsWith("/caller")) {
    const p = await verify(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
    if (!p) return toLogin(req, pathname);
  }

  // /admin/* (mai puțin /admin/login) cere sesiune admin; CALLER → /caller
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const p = await verify(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
    if (!p) return toLogin(req, pathname);
    if (p.staffRole === "CALLER") {
      const url = req.nextUrl.clone();
      url.pathname = "/caller";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // /portal/* cere sesiune client
  if (pathname.startsWith("/portal")) {
    const p = await verify(req.cookies.get(CLIENT_COOKIE)?.value, "client");
    if (!p) return toLogin(req, pathname);
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/caller/:path*",
    "/portal/:path*",
    "/((?!_next/static|_next/image|favicon|icon|apple-icon|manifest|robots|sitemap|public).*)",
  ],
};
